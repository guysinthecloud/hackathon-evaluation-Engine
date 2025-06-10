# services/pdf_processor.py
import pymupdf  # PyMuPDF
from pdf2image import convert_from_path
from PIL import Image
import os
import io
from pathlib import Path
from typing import List, Optional
import logging
import tempfile

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Service for processing PDF files and converting them to images"""
    
    def __init__(self, dpi: int = 300, image_format: str = "PNG"):
        self.dpi = dpi
        self.image_format = image_format
        self.max_width = 1920  # Maximum width for images
        self.max_height = 1080  # Maximum height for images
    
    def convert_pdf_to_images(self, pdf_path: str, output_dir: str) -> List[str]:
        """
        Convert PDF to high-quality images using PyMuPDF for better performance
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save images
            
        Returns:
            List of image file paths
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            image_paths = []
            
            # Open PDF document
            doc = pymupdf.open(pdf_path)
            
            logger.info(f"Converting PDF with {len(doc)} pages to images")
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Create transformation matrix for high DPI
                mat = pymupdf.Matrix(self.dpi/72, self.dpi/72)
                
                # Render page to image
                pix = page.get_pixmap(matrix=mat)
                
                # Convert to PIL Image for processing
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                
                # Resize if too large
                img = self._resize_image(img)
                
                # Save image
                image_filename = f"slide_{page_num + 1}.png"
                image_path = output_path / image_filename
                img.save(image_path, "PNG", optimize=True)
                
                image_paths.append(str(image_path))
                logger.debug(f"Converted page {page_num + 1} to {image_path}")
            
            doc.close()
            
            logger.info(f"Successfully converted {len(image_paths)} pages to images")
            return image_paths
            
        except Exception as e:
            logger.error(f"Error converting PDF to images: {str(e)}")
            raise
    
    def convert_pdf_to_images_pdf2image(self, pdf_path: str, output_dir: str) -> List[str]:
        """
        Alternative method using pdf2image (requires poppler-utils)
        Use this if PyMuPDF doesn't work well for certain PDFs
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save images
            
        Returns:
            List of image file paths
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Convert PDF to images
            images = convert_from_path(
                pdf_path,
                dpi=self.dpi,
                fmt=self.image_format.lower(),
                thread_count=4  # Use multiple threads for faster conversion
            )
            
            image_paths = []
            
            for i, image in enumerate(images):
                # Resize if too large
                image = self._resize_image(image)
                
                # Save image
                image_filename = f"slide_{i + 1}.png"
                image_path = output_path / image_filename
                image.save(image_path, "PNG", optimize=True)
                
                image_paths.append(str(image_path))
                logger.debug(f"Converted page {i + 1} to {image_path}")
            
            logger.info(f"Successfully converted {len(image_paths)} pages to images")
            return image_paths
            
        except Exception as e:
            logger.error(f"Error converting PDF to images: {str(e)}")
            raise
    
    def _resize_image(self, img: Image.Image) -> Image.Image:
        """
        Resize image if it exceeds maximum dimensions while maintaining aspect ratio
        
        Args:
            img: PIL Image to resize
            
        Returns:
            Resized PIL Image
        """
        width, height = img.size
        
        # Check if resizing is needed
        if width <= self.max_width and height <= self.max_height:
            return img
        
        # Calculate scaling factor to maintain aspect ratio
        width_ratio = self.max_width / width
        height_ratio = self.max_height / height
        scale_factor = min(width_ratio, height_ratio)
        
        # Calculate new dimensions
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        
        # Resize using LANCZOS resampling for best quality
        return img.resize((new_width, new_height), Image.LANCZOS)