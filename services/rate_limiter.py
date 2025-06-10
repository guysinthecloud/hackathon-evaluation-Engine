# services/rate_limiter.py
import redis
import time
import asyncio
from typing import Optional
import logging
import hashlib

logger = logging.getLogger(__name__)

class GeminiRateLimiter:
    """
    Redis-based rate limiter for Gemini API calls
    Implements sliding window rate limiting
    """
    
    def __init__(self, redis_client: redis.Redis, max_requests: int = 10, window_minutes: int = 1):
        self.redis = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_minutes * 60
        self.key_prefix = "gemini_rate_limit"
        
    def _get_key(self, identifier: str) -> str:
        """Generate Redis key for rate limiting"""
        # Hash the identifier for consistent key length
        identifier_hash = hashlib.md5(identifier.encode()).hexdigest()
        return f"{self.key_prefix}:{identifier_hash}"
    
    async def can_make_request(self, identifier: str = "gemini_api") -> bool:
        """
        Check if a request can be made within rate limits
        
        Args:
            identifier: Unique identifier for rate limiting (e.g., API key hash)
            
        Returns:
            True if request is allowed, False otherwise
        """
        try:
            key = self._get_key(identifier)
            current_time = time.time()
            window_start = current_time - self.window_seconds
            
            # Use Redis pipeline for atomic operations
            pipe = self.redis.pipeline()
            
            # Remove old requests outside the window
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count current requests in window
            pipe.zcard(key)
            
            # Execute pipeline
            results = pipe.execute()
            request_count = results[1]
            
            if request_count >= self.max_requests:
                logger.warning(f"Rate limit exceeded for {identifier}: {request_count}/{self.max_requests}")
                return False
            
            # Add current request timestamp
            self.redis.zadd(key, {str(current_time): current_time})
            
            # Set expiration for cleanup
            self.redis.expire(key, self.window_seconds)
            
            logger.debug(f"Request allowed for {identifier}: {request_count + 1}/{self.max_requests}")
            return True
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {str(e)}")
            # Fail open - allow request if Redis is down
            return True
    
    async def get_wait_time(self, identifier: str = "gemini_api") -> int:
        """
        Get the time to wait before the next request is allowed
        
        Args:
            identifier: Unique identifier for rate limiting
            
        Returns:
            Wait time in seconds, 0 if no wait required
        """
        try:
            key = self._get_key(identifier)
            current_time = time.time()
            
            # Get the oldest request in the current window
            oldest_requests = self.redis.zrange(key, 0, 0, withscores=True)
            
            if not oldest_requests:
                return 0
            
            oldest_time = oldest_requests[0][1]
            wait_time = int(oldest_time + self.window_seconds - current_time)
            
            return max(0, wait_time)
            
        except Exception as e:
            logger.error(f"Error calculating wait time: {str(e)}")
            return 0
    
    async def get_current_usage(self, identifier: str = "gemini_api") -> dict:
        """
        Get current rate limit usage statistics
        
        Args:
            identifier: Unique identifier for rate limiting
            
        Returns:
            Dictionary with usage statistics
        """
        try:
            key = self._get_key(identifier)
            current_time = time.time()
            window_start = current_time - self.window_seconds
            
            # Clean up old entries
            self.redis.zremrangebyscore(key, 0, window_start)
            
            # Get current count
            current_count = self.redis.zcard(key)
            
            # Get request timestamps for analysis
            requests = self.redis.zrange(key, 0, -1, withscores=True)
            request_times = [score for _, score in requests]
            
            return {
                "current_requests": current_count,
                "max_requests": self.max_requests,
                "window_seconds": self.window_seconds,
                "remaining_requests": max(0, self.max_requests - current_count),
                "window_start": window_start,
                "window_end": current_time,
                "request_timestamps": request_times,
                "requests_allowed": current_count < self.max_requests
            }
            
        except Exception as e:
            logger.error(f"Error getting usage stats: {str(e)}")
            return {
                "current_requests": 0,
                "max_requests": self.max_requests,
                "window_seconds": self.window_seconds,
                "remaining_requests": self.max_requests,
                "error": str(e)
            }
    
    async def reset_limits(self, identifier: str = "gemini_api") -> bool:
        """
        Reset rate limits for a specific identifier (admin function)
        
        Args:
            identifier: Unique identifier for rate limiting
            
        Returns:
            True if reset successful, False otherwise
        """
        try:
            key = self._get_key(identifier)
            self.redis.delete(key)
            logger.info(f"Rate limits reset for {identifier}")
            return True
            
        except Exception as e:
            logger.error(f"Error resetting rate limits: {str(e)}")
            return False
    
    async def wait_for_availability(self, identifier: str = "gemini_api", max_wait: int = 300) -> bool:
        """
        Wait until a request can be made or max_wait time is reached
        
        Args:
            identifier: Unique identifier for rate limiting
            max_wait: Maximum time to wait in seconds
            
        Returns:
            True if request is now allowed, False if max_wait exceeded
        """
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            if await self.can_make_request(identifier):
                return True
            
            wait_time = await self.get_wait_time(identifier)
            sleep_time = min(wait_time + 1, 10)  # Wait at least 1 second, max 10
            
            logger.debug(f"Waiting {sleep_time} seconds for rate limit availability")
            await asyncio.sleep(sleep_time)
        
        logger.warning(f"Max wait time {max_wait} exceeded for {identifier}")
        return False


class AdvancedRateLimiter:
    """
    Advanced rate limiter with multiple windows and burst handling
    """
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        
        # Different rate limits for different time windows
        self.limits = {
            "minute": {"requests": 10, "window": 60},
            "hour": {"requests": 100, "window": 3600},
            "day": {"requests": 1000, "window": 86400}
        }
    
    async def can_make_request_advanced(self, identifier: str, request_weight: int = 1) -> dict:
        """
        Check against multiple rate limit windows
        
        Args:
            identifier: Unique identifier for rate limiting
            request_weight: Weight of this request (for complex operations)
            
        Returns:
            Dictionary with detailed rate limit status
        """
        current_time = time.time()
        results = {}
        
        for window_name, config in self.limits.items():
            key = f"advanced_rate_limit:{window_name}:{identifier}"
            window_start = current_time - config["window"]
            
            # Clean old entries
            self.redis.zremrangebyscore(key, 0, window_start)
            
            # Get current usage
            current_usage = self.redis.zcard(key)
            
            # Check if request would exceed limit
            would_exceed = (current_usage + request_weight) > config["requests"]
            
            results[window_name] = {
                "current_usage": current_usage,
                "limit": config["requests"],
                "remaining": max(0, config["requests"] - current_usage),
                "would_exceed": would_exceed,
                "window_seconds": config["window"]
            }
        
        # Overall decision
        any_exceeded = any(result["would_exceed"] for result in results.values())
        
        if not any_exceeded:
            # Add the request to all windows
            for window_name, config in self.limits.items():
                key = f"advanced_rate_limit:{window_name}:{identifier}"
                
                # Add request with weight
                for _ in range(request_weight):
                    self.redis.zadd(key, {f"{current_time}_{time.time_ns()}": current_time})
                
                # Set expiration
                self.redis.expire(key, config["window"])
        
        return {
            "allowed": not any_exceeded,
            "windows": results,
            "request_weight": request_weight
        }