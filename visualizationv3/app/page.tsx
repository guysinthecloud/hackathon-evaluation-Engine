"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Clock,
  Users,
  TrendingUp,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Calendar,
  Cpu,
} from "lucide-react"

// Sample data - replace with your actual JSON data
const evaluationData = [
  {
    "team_name": "AI-Driven Churn Defender",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497674.0227537,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 5,
        "processing_time_seconds": 14.111475944519045
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 5,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly articulated problem statement with relevant statistics.",
          "Proposed solution is technically sound and leverages advanced AI techniques.",
          "Detailed architecture diagram provides excellent insight into the system design.",
          "Strong focus on actionable recommendations, adding practical value.",
          "Identified Google Cloud Platform (GCP) as the hosting environment."
        ],
        "weaknesses": [
          "Lack of visual demonstration (screenshots or video) of the implemented solution/dashboard.",
          "Implementation plan is high-level; doesn't specify what was achieved within the hackathon timeline.",
          "Technical Implementation/UX score is limited by the absence of a demo to assess the actual working product and user interface."
        ],
        "suggestions": [
          "Include screenshots or a short video demo of the Streamlit dashboard and its features.",
          "Clearly state the scope of the project completed during the hackathon vs. future plans.",
          "If possible, provide more detail on the specific GCP services used beyond just 'Cloud Run' and 'Compute Engine' (e.g., for data storage, processing).",
          "Briefly touch upon the dataset used for training, even if synthetic or sample data."
        ]
      },
      "executive_summary": "The 'AI-Driven Churn Defender' project presents a well-defined problem and a technically sophisticated solution for the telecom industry. The presentation flows logically from problem to solution and architecture, demonstrating a strong understanding of the domain and technology. The detailed architecture diagram is particularly impressive. The project effectively incorporates Google Cloud Platform for deployment. However, the absence of a live demo or visual representation of the actual implemented system, especially the dashboard, makes it difficult to fully assess the technical implementation and user experience within the hackathon context. Adding a demo would significantly strengthen the submission.",
      "slide_by_slide_notes": [
        {
          "note": "Strong, clear title slide with team name. Visually simple but effective.",
          "slide": 1
        },
        {
          "note": "Excellent problem statement, well-supported by context (Telecom/SaaS) and a statistic. Proposed solution is clearly defined, mentioning specific AI architectures (BiLSTM/Transformer) and the key benefit (actionable recommendations).",
          "slide": 2
        },
        {
          "note": "Highly detailed and informative architecture diagram. Clearly shows data flow, components (ETL, Model, API, Frontend), and cloud deployment on GCP. This is a major strength.",
          "slide": 3
        },
        {
          "note": "Good summary of innovation and impact. The implementation plan is high-level but logical. The tech stack lists relevant technologies, including GCP for cloud hosting, fulfilling the Google tech requirement.",
          "slide": 4
        },
        {
          "note": "Standard thank you slide with team member names and contact information. Simple and effective closing.",
          "slide": 5
        }
      ]
    }
  },
  {
    "team_name": "Bazaar Bataye",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497893.2601275,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 14.919288635253906
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 8
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear and well-defined problem statement addressing a real-world need for farmers.",
          "Innovative solution combining multiple AI modalities (price forecasting, image quality, multilingual chatbot) into a single platform.",
          "Detailed technical architecture diagram and tech stack provide confidence in the implementation plan.",
          "Strong potential for impact and scalability, with clear use cases for farmers and agri-businesses (Agri Startups/FPOs).",
          "Effective integration of Google technologies (Gemini, Vertex AI) as core components of the solution."
        ],
        "weaknesses": [
          "The presentation lacks a dedicated section demonstrating the working application or showing results/output from the AI models.",
          "While the implementation plan is outlined, it doesn't explicitly state what was completed *during* the hackathon timeline.",
          "Could benefit from showing examples of the AI output (e.g., a sample price forecast graph, an image grading result, a chatbot interaction)."
        ],
        "suggestions": [
          "Include screenshots or a brief description of the user flow for each feature (price forecasting, image grading, chatbot) to make the demo clearer.",
          "If possible, show examples of the AI model outputs or metrics (e.g., accuracy of image grading, sample chatbot response in a regional language).",
          "Clearly articulate what specific features or components were built and completed within the hackathon timeframe.",
          "Consider adding a slide on future plans or next steps for the project."
        ]
      },
      "executive_summary": "This presentation for 'BazaarBataye' effectively communicates a relevant problem and an innovative AI-powered solution for farmers. The technical architecture and use of Google technologies like Gemini and Vertex AI are well-articulated. The narrative flows logically from problem to solution, impact, and implementation. While the slides provide a strong foundation, incorporating a clearer demonstration of the working application and showing concrete results would significantly enhance the presentation's impact and completeness.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent problem statement, clearly outlining the challenges faced by farmers. The proposed solution directly addresses these challenges with three distinct, relevant features. The architecture diagram and tech stack are detailed and provide a strong technical foundation for the project.",
          "slide": 1
        },
        {
          "note": "Effectively highlights the innovation and potential impact of the solution. The implementation plan outlines the technical structure. Use cases are well-defined for different user groups. The UI screenshot provides a helpful visual glimpse of the application.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Canvas Calculator",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497623.0264783,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 3,
        "processing_time_seconds": 16.65104842185974
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 9,
        "presentation_documentation": 7,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 6,
        "total_slides_analyzed": 3,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear project aim and core concept",
          "Strong and central use of Google's Gemini API",
          "Logical explanation of the technical process flow",
          "Clean and intuitive UI design shown in the screenshot"
        ],
        "weaknesses": [
          "Presentation is very brief (only 3 slides), lacking depth",
          "Insufficient context on the problem's significance or target users",
          "No market analysis or potential impact beyond basic use cases",
          "No discussion of future features, roadmap, or scaling strategy",
          "UI screenshot does not show an example of the AI analysis output",
          "Lack of explicit explanation of the demo or key features in action"
        ],
        "suggestions": [
          "Expand the presentation to include a slide on the specific problem being solved and its importance.",
          "Add details about the target audience and potential market size.",
          "Include a slide demonstrating the application with a clear input example and the corresponding AI analysis output.",
          "Discuss future features, potential integrations, and the long-term vision for the project.",
          "Provide more technical details if possible, perhaps highlighting challenges overcome.",
          "Consider adding a slide on the team and their roles."
        ]
      },
      "executive_summary": "Canvas-Calculator presents an innovative concept leveraging Google's Gemini API to analyze drawn or written input on a web canvas. The presentation clearly outlines the project's aim, core technology, and process flow. While the idea and use of Google technology are strong, the presentation's brevity limits its effectiveness, lacking depth in problem context, market potential, future plans, and a clear demonstration of the AI's capabilities in action. Expanding on these areas would greatly enhance the pitch.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide. Clearly states the project's aim, identifies the core Google technology (Gemini API), and provides relevant use case examples. Sets the stage well.",
          "slide": 1
        },
        {
          "note": "Effectively breaks down the project's workflow into clear, sequential steps. Easy to understand how the user input is processed by the AI backend.",
          "slide": 2
        },
        {
          "note": "Provides a helpful visual representation of the user interface. The layout seems clean and functional. However, it would be significantly more impactful if it showed an example with actual input and the resulting AI analysis output.",
          "slide": 3
        }
      ]
    }
  },
  {
    "team_name": "CodeMind",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497712.7499154,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 3,
        "processing_time_seconds": 15.294128179550173
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 8
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 3,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Excellent problem identification and clear articulation of the need for the tool.",
          "Well-defined proposed solution with specific features addressing the problem.",
          "Clear and logical technical architecture diagram.",
          "Comprehensive list of technologies and APIs used, demonstrating a solid technical plan.",
          "Good integration of multiple Google technologies crucial to the project's core functionality."
        ],
        "weaknesses": [
          "The presentation lacks a visual demonstration (screenshots or video) of the actual working application or user interface.",
          "No mention of challenges faced during development, which is common in hackathon projects.",
          "Future plans or next steps for the project are not included."
        ],
        "suggestions": [
          "Include screenshots or a short video demonstrating the key features of the VeriFact platform.",
          "Add a slide or section discussing the challenges encountered and how they were overcome.",
          "Outline potential future features or development roadmap for the project."
        ]
      },
      "executive_summary": "This presentation for VeriFact presents a highly relevant solution to the critical problem of misinformation. The team clearly identifies the need and proposes an innovative, AI-powered web platform leveraging several Google technologies effectively. The technical architecture and implementation plan are well-articulated. While the narrative flow is logical and consistent, the presentation would be significantly strengthened by including a visual demonstration of the working application and discussing future potential.",
      "slide_by_slide_notes": [
        {
          "note": "Standard title slide. Clearly states the project name, team, and domain.",
          "slide": 1
        },
        {
          "note": "Strong problem statement, clearly articulating the issue of misinformation. Proposed solution is well-defined with key features. Innovation and impact are summarized effectively.",
          "slide": 2
        },
        {
          "note": "Detailed implementation plans provide a good overview of the development steps. The architecture diagram is clear and helpful. The tech stack lists relevant technologies and APIs, including Google ones.",
          "slide": 3
        }
      ]
    }
  },
  {
    "team_name": "CodeXprt",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497935.2445142,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 3,
        "processing_time_seconds": 12.147964239120483
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 3,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear identification of a relevant problem space (computer science career preparation).",
          "Comprehensive suite of proposed features addressing multiple aspects of career readiness.",
          "Well-defined technology stack.",
          "Thoughtful consideration of ethical aspects like data privacy and bias mitigation.",
          "Clear articulation of the project's evolution and the challenges overcome."
        ],
        "weaknesses": [
          "Lack of visual elements or screenshots to demonstrate the UI/UX.",
          "Limited detail on the specific implementation of the AI features beyond listing them.",
          "No explicit section detailing the project's current state or a demo.",
          "Scalability discussion is implied through the problem space but not explicitly detailed in terms of technical or business scaling."
        ],
        "suggestions": [
          "Include screenshots or a brief demo video link to showcase the user interface and core functionalities.",
          "Provide more technical depth on how the AI models (especially Gemini API) are integrated and utilized for specific features.",
          "Add a slide or section on the project's current status, key achievements during the hackathon, and future roadmap.",
          "Elaborate on the scalability plan, both technically (e.g., infrastructure) and in terms of user adoption/market reach."
        ]
      },
      "executive_summary": "CodeXprt presents a highly relevant and ambitious project aimed at revolutionizing computer science career preparation using AI. The presentation effectively communicates the problem, the comprehensive solution, and the underlying technology stack, including the use of Google's Gemini API. The narrative flows logically from problem to solution and considerations. While the concept is strong and the ethical considerations are well-addressed, the presentation would benefit significantly from visual demonstrations of the platform and deeper technical details on the AI implementation and scalability plan to fully showcase the project's potential and hackathon achievements.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening with a clear project title, elevator pitch, and initial core features. Effectively identifies the problem of juggling resources for career prep and positions CodeXprt as an all-in-one solution powered by AI. The core features listed are compelling and directly address the problem.",
          "slide": 1
        },
        {
          "note": "Continues listing core features, including the Project & Hackathon Finder and the AI Assistant powered by Gemini API, clearly indicating Google Tech usage. The Technology Stack is listed, providing good insight into the technical foundation. The 'Process & Evolution' section adds valuable context on the project's development journey and iterative nature.",
          "slide": 2
        },
        {
          "note": "Addresses important Ethical & Practical Considerations, which is commendable and shows maturity. Discusses ownership, data privacy, bias mitigation, and a key challenge overcome (integrating multiple AI modules). This slide strengthens the project's credibility but lacks technical depth on the 'modular design' solution.",
          "slide": 3
        }
      ]
    }
  },
  {
    "team_name": "Dedupify",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497697.1183853,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 10.32141375541687
      },
      "criteria_scores": {
        "impact_scalability": 6,
        "innovation_creativity": 6,
        "google_technologies_usage": 7,
        "presentation_documentation": 5,
        "technical_implementation_ux": 5
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 4,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 6
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a relevant problem (duplicate documents, disorganized data).",
          "Proposes a clear solution with key features.",
          "Outlines a basic technical architecture and tech stack.",
          "Mentions specific Google technologies (Firebase Storage, Firestore)."
        ],
        "weaknesses": [
          "Presentation is extremely brief (only 2 slides provided), lacking depth.",
          "No visual representation of the solution or user interface (UX).",
          "Limited detail on the specific algorithms used for deduplication/clustering.",
          "Missing crucial sections like target audience, market size, impact metrics, demo, team, future plans, etc.",
          "The flow is very basic, jumping directly from problem/solution to tech stack without intermediate context."
        ],
        "suggestions": [
          "Expand the presentation significantly to include a demo, target users, market analysis, impact, and future steps.",
          "Include screenshots or a video of the application/UI to demonstrate the user experience.",
          "Provide more technical detail on the chosen similarity algorithms and clustering methods.",
          "Explain *how* Firebase Storage and Firestore are specifically used and why they are suitable for this project.",
          "Structure the presentation with a more standard flow (Problem -> Solution -> Features -> Tech -> Demo -> Impact -> Team -> Future)."
        ]
      },
      "executive_summary": "This submission presents a project called 'Dedupify' addressing document disorganization. The two slides provided clearly state the problem, solution, and basic tech stack including Firebase. While the core idea is relevant, the presentation is severely incomplete, lacking a demo, detailed implementation insights, user experience visuals, and broader context like market impact or future plans. The flow is logical but abrupt due to the brevity. Significant expansion is needed for a comprehensive evaluation.",
      "slide_by_slide_notes": [
        {
          "note": "Good start with a clear problem statement and proposed solution. Key features are listed concisely. Sets the stage well.",
          "slide": 1
        },
        {
          "note": "Moves directly to architecture and tech stack. Clearly lists components including Firebase. Lacks visual representation of the architecture or UI.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "DocMagic",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497843.0834754,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 12.948516845703123
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 9,
        "presentation_documentation": 7,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 6,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a relevant problem in document creation for job seekers.",
          "Proposes an innovative solution leveraging AI (Gemini 2.0) for generation and optimization.",
          "Architecture diagram provides a good overview of the system components and data flow.",
          "Specific Google technology (Gemini 2.0) is clearly identified and central to the solution.",
          "Quantifiable impact metrics (interview rates, ATS pass rate, creation time reduction) are provided.",
          "Includes a basic implementation plan and potential post-hackathon roadmap."
        ],
        "weaknesses": [
          "The presentation is very brief (only 2 slides), limiting the depth of information.",
          "Lacks a dedicated section or visual representation of the user interface or user experience.",
          "Technical implementation details beyond the high-level architecture are minimal.",
          "No demonstration or visual output of the generated documents is included in the slides.",
          "The connection between the architecture components (Supabase, Flask, Next.js) and their specific roles could be slightly more detailed.",
          "The 'Innovation, Impact, Implementation & Team' slide feels a bit crowded with multiple distinct sections."
        ],
        "suggestions": [
          "Expand the presentation to include more slides for better detail and flow.",
          "Add a slide showcasing the user interface or key user flows (screenshots or mockups).",
          "Include a slide demonstrating the output of the system (e.g., a generated resume snippet).",
          "Provide more technical depth on specific challenges faced and how they were overcome.",
          "Consider separating the 'Innovation & Impact', 'Implementation Plan', and 'Team' sections into distinct slides for clarity.",
          "Elaborate slightly on the specific use cases or advantages of using Next.js, Supabase, and Flask in this context."
        ]
      },
      "executive_summary": "This presentation effectively introduces a relevant problem and proposes an innovative AI-driven solution using Google's Gemini 2.0. The core concept of generating and optimizing job documents is strong and addresses a real need. While the technical architecture and potential impact are clearly outlined, the brevity of the presentation limits the depth of detail on implementation and user experience. Expanding on these areas and including visual demonstrations would significantly strengthen the pitch.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent problem statement - clear, relatable, and highlights specific pain points (time, inconsistency, ATS failure). Solution overview is concise and highlights key features, including the use of Gemini 2.0 and ATS scoring. The visual is thematic but doesn't show the actual product UI.",
          "slide": 1
        },
        {
          "note": "This slide packs a lot of information. The architecture diagram is helpful for understanding the system flow and technology stack (Gemini 2.0, Supabase, Flask, Next.js). Innovation & Impact section provides good, quantifiable metrics. Implementation plan shows foresight beyond the hackathon. Team list is present. The density of information makes it slightly less easy to digest quickly.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "GeneTrust",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497638.5889945,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 15.35429573059082
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 9,
        "presentation_documentation": 7,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a significant real-world problem (complex medical/genomic reports).",
          "Proposes a relevant and innovative AI-powered solution.",
          "Excellent integration and usage of multiple core Google technologies (Flutter, Firebase, GCP, Gemini, Vertex AI) which are central to the solution's architecture.",
          "Technical architecture diagram is clear and easy to understand.",
          "Messaging is consistent across the slides."
        ],
        "weaknesses": [
          "Limited depth due to only two slides; a full presentation would require more detail.",
          "No dedicated section for a demo or visual representation of the user interface/output.",
          "Lacks specific details on the implementation of the AI models (e.g., training data, specific prompts for Gemini/Vertex).",
          "Future plans or potential next steps are not mentioned.",
          "Market validation or competitive analysis is not included."
        ],
        "suggestions": [
          "Include a demo video or screenshots showing the application in action and the output format.",
          "Add slides detailing the specific implementation of the Google AI services (Gemini, Vertex AI).",
          "Expand on the potential impact and scalability, perhaps with market size data or target user groups.",
          "Outline future features or development plans.",
          "Consider adding a brief team introduction slide."
        ]
      },
      "executive_summary": "This presentation introduces GeneTrust+, an innovative AI-powered companion for simplifying complex medical and genomic reports. The project effectively addresses a significant real-world problem and proposes a compelling solution built upon a robust stack of Google technologies including Flutter, Firebase, GCP, Gemini, and Vertex AI. The technical architecture is clearly presented. While the two slides provide a strong foundation, expanding the presentation to include a demonstration and more detailed implementation specifics would significantly enhance the submission. The project demonstrates high potential impact and strong technical execution leveraging Google's ecosystem.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide. Clearly defines the problem, outlines the proposed solution, and lists the core technologies, effectively highlighting the Google stack being used.",
          "slide": 1
        },
        {
          "note": "Excellent follow-up slide. Provides a clear workflow diagram illustrating how the solution works and how the different Google technologies are integrated. Reinforces the value proposition.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Genie-AI",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497659.7828114,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 21.12222051620483
      },
      "criteria_scores": {
        "impact_scalability": 9,
        "innovation_creativity": 9,
        "google_technologies_usage": 9,
        "presentation_documentation": 7,
        "technical_implementation_ux": 6
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 5,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear problem statement and innovative solution concept",
          "Strong integration of multiple core Google technologies relevant to the project's features",
          "High potential for impact and scalability in addressing global educational gaps",
          "Logical technical architecture overview provided"
        ],
        "weaknesses": [
          "Presentation is significantly incomplete (only 2 slides provided)",
          "No demonstration or visual representation of the user interface/experience",
          "Lack of detail on specific technical implementation challenges or achievements beyond listing technologies",
          "Missing future plans, roadmap, or potential business/adoption strategies"
        ],
        "suggestions": [
          "Include a demo video or detailed screenshots/description of the working application to showcase UI/UX and functionality",
          "Expand the presentation with additional slides covering the user flow, implementation details, challenges overcome, and future development plans",
          "Provide more specific technical details about how each Google technology is used and contributes to the unique features"
        ]
      },
      "executive_summary": "This submission presents a highly innovative and impactful project concept, 'Genie AI,' aimed at revolutionizing interactive learning using a robust set of Google technologies. The problem is well-defined, and the proposed solution addresses key educational gaps effectively. The technical foundation appears solid, leveraging core Google services for AI, voice interaction, and data management. However, the presentation is notably incomplete, consisting of only two slides and lacking essential components like a project demonstration or visual evidence of the user interface. While the idea and technical approach are promising, the limited documentation makes a full assessment of the implementation and user experience challenging.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide clearly defining the problem, proposed solution, innovation, and team. Effectively sets the stage for the project's value proposition.",
          "slide": 1
        },
        {
          "note": "Provides a good overview of the technical architecture and lists relevant Google technologies. The diagram is helpful but could be more detailed in showing data flow or component interactions. Crucially lacks any visual representation of the user interface.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Indic",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497775.7009394,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 13.882114171981812
      },
      "criteria_scores": {
        "impact_scalability": 9,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 8
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 9
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a significant problem in language learning, particularly for Indian languages.",
          "Proposed solution is comprehensive, addressing personalization, engagement, and inclusivity.",
          "Strong potential for social impact and scalability through partnerships and freemium model.",
          "Technical architecture is well-defined and appropriate for the proposed features.",
          "Effective use of visual elements (diagrams, icons) to convey complex ideas."
        ],
        "weaknesses": [
          "The presentation lacks a dedicated slide or section showing a demo or specific features implemented during the hackathon.",
          "The implementation plan outlines future steps but doesn't clearly state what was achieved within the hackathon timeline.",
          "While Google tech is mentioned, the specific *impact* or *unique contribution* of Gemini API (or other potential Google tools) to the core innovation could be highlighted more explicitly."
        ],
        "suggestions": [
          "Include a slide or video demonstrating key features built during the hackathon.",
          "Clarify which parts of the project were completed within the hackathon timeframe vs. future plans.",
          "Elaborate on how Gemini API is specifically used (e.g., for personalized guidance, real-life conversations, emotional AI) and why it was chosen.",
          "If other Google technologies were used (e.g., Firebase for hosting/storage beyond Auth/DB, GCP services), mention them explicitly.",
          "Consider adding a slide briefly touching upon user testing or feedback if any was gathered."
        ]
      },
      "executive_summary": "This presentation outlines a highly relevant and potentially impactful project aimed at revolutionizing Indian language learning. The team clearly understands the problem and proposes a comprehensive, innovative, and scalable solution leveraging technologies like Gemini API and Firebase. The narrative flow is logical, moving from problem to solution, architecture, impact, and future plans. While the vision and technical foundation are strong, the presentation would be significantly enhanced by demonstrating the actual progress made during the hackathon and more explicitly detailing the role of the chosen Google technologies.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent problem statement, clearly articulating the need for engaging, culturally rooted, and accessible language learning. The proposed solution is detailed and addresses multiple facets. The scope diagram is visually appealing and effectively communicates scalability and cross-sector appeal. Architecture diagram is clear and shows key components, including Gemini API and Firebase.",
          "slide": 1
        },
        {
          "note": "Provides a solid overview of the tech stack, impact areas, and innovations. The impact points are compelling, especially regarding bridging language barriers and empowering communities. Innovations are listed clearly. The implementation plan is useful for showing future vision but needs clarification on hackathon deliverables. Team info is present. Links to revenue/business models are helpful but not evaluated in this deck.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "MindWeaver",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497743.4224722,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 3,
        "processing_time_seconds": 14.105385065078735
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 3,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear identification of a common problem (structured ideation).",
          "Proposed solution is innovative by leveraging AI for idea expansion.",
          "Architecture diagram and tech stack are clearly defined.",
          "Effective integration of Google technologies (Gemini AI, Firebase) as core components.",
          "Presentation is well-structured and easy to follow."
        ],
        "weaknesses": [
          "Lack of visual demonstration or screenshots of the actual application and user interface.",
          "Technical Implementation/UX score is limited by the absence of a demo.",
          "Implementation plan is high-level; more detail on specific features built could be beneficial.",
          "No mention of user testing or validation of the concept/implementation."
        ],
        "suggestions": [
          "Include a short video demo or screenshots showcasing the application's functionality and UI/UX.",
          "Provide more specific details or a brief walkthrough of the implemented features.",
          "If possible, mention any user feedback received during development.",
          "Consider adding a slide on future features or a roadmap."
        ]
      },
      "executive_summary": "MindWeaver presents an innovative approach to mind mapping using Google's Gemini AI to enhance the ideation process. The presentation clearly articulates the problem, solution, and technical architecture, demonstrating effective use of Google technologies. The narrative flow is logical and consistent. While the concept and plan are strong, the presentation lacks visual evidence of the implemented solution and user experience, which limits the ability to fully evaluate the technical implementation and UX. Including a demo would significantly strengthen the submission.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent opening slide. Clearly states the problem and proposed solution. Architecture diagram and tech stack provide a solid technical foundation overview. Good start.",
          "slide": 1
        },
        {
          "note": "Effectively highlights the innovation and impact of the project, particularly the AI-enhanced thinking and leverage of Google tech. The implementation plan shows feasibility within a hackathon timeframe, though it's quite high-level.",
          "slide": 2
        },
        {
          "note": "Standard team slide. Provides necessary contact information.",
          "slide": 3
        }
      ]
    }
  },
  {
    "team_name": "Mock API Server",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497878.2027352,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 16.400476694107056
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 8
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear and concise problem statement addressing a common developer pain point.",
          "Innovative approach using AI (Gemini) for generating realistic, context-aware test data.",
          "Well-defined technical architecture and appropriate tech stack for the solution.",
          "Detailed and seemingly realistic implementation plan for a hackathon timeframe.",
          "Effective integration of multiple Google technologies (Gemini, Cloud Run, Firebase Hosting)."
        ],
        "weaknesses": [
          "Presentation is very brief (only 2 slides), limiting the depth of detail.",
          "Lack of a dedicated section or visual representation of the actual demo or user interface.",
          "Could benefit from explicitly stating the potential impact or market size beyond the problem description."
        ],
        "suggestions": [
          "Ensure a strong, easily accessible demo is part of the submission to showcase functionality.",
          "If possible, include screenshots or a brief flow of the user interface/experience.",
          "Briefly touch upon future development plans or potential business models.",
          "Highlight any specific technical challenges overcome during development."
        ]
      },
      "executive_summary": "This project presents an innovative AI-powered solution to a common developer problem, leveraging Google technologies effectively. The presentation, though brief, clearly outlines the problem, solution, technical architecture, and implementation plan. The narrative flows logically from problem to solution to execution details. The project demonstrates strong potential impact and technical feasibility. A key area for improvement in the overall submission would be a more prominent demonstration of the working solution.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent opening slide. Clearly articulates the problem and presents the proposed solution from both a high-level benefit perspective and a more technical overview. Effectively sets the stage.",
          "slide": 1
        },
        {
          "note": "Provides crucial technical context. The tech stack clearly lists Google technologies used. The architecture diagram gives a good overview of the system flow. The implementation plan demonstrates feasibility within the hackathon timeline. This slide effectively supports the solution presented in Slide 1.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Penta Generators",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749409343.9668744,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 18.189903020858765
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 7,
        "presentation_documentation": 8,
        "technical_implementation_ux": 8
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Excellent identification and articulation of the business need and market problem.",
          "Innovative technical approach combining SBERT, Knowledge Graphs, and LLMs for candidate matching.",
          "Clear breakdown of the technical architecture and ML stack.",
          "Well-defined target audience and differentiating factors.",
          "Inclusion of demo links is crucial for a hackathon."
        ],
        "weaknesses": [
          "The presentation feels incomplete with only two slides; key sections like results/metrics, team, and future roadmap are missing.",
          "The role and specific contribution of the Google technology (Firebase) are not emphasized.",
          "While demo links are provided, a brief explanation or screenshot of key demo features within the slides would enhance understanding."
        ],
        "suggestions": [
          "Add slides covering project results/metrics (e.g., accuracy improvements, time saved), team introduction, and future development plans.",
          "Explicitly highlight how Firebase is used in the project and the value it adds (e.g., real-time data, authentication, scalability).",
          "Include a slide or section briefly showcasing key aspects of the demo or user interface.",
          "Consider adding a concluding slide with a strong call to action or summary."
        ]
      },
      "executive_summary": "This presentation effectively communicates a compelling problem in recruitment and proposes an innovative AI/ML-driven solution. The technical approach is well-articulated, demonstrating a solid understanding of the domain and relevant technologies. While the two slides provide a strong foundation, the overall presentation feels incomplete, lacking crucial details on results, the team, future plans, and a more prominent explanation of the Google technology's role. Expanding the presentation would significantly strengthen its impact.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide. Clearly identifies the problem, assesses the need, provides market context, and outlines the high-level solution flow. Including demo links upfront is effective.",
          "slide": 1
        },
        {
          "note": "Excellent technical deep dive. Clearly explains the core algorithms, differentiating factors, and comprehensive tech stack. Provides good justification ('Why it's better') for the technical choices. Could benefit from highlighting the Google tech usage more explicitly here.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "PhantomPay",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497829.9742296,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 16.8198983669281
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 6
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a significant real-world problem (ghost employees).",
          "Proposes a well-defined, automated solution using data analysis.",
          "Clearly states the potential impact and innovation of the approach.",
          "Includes a logical process flow diagram.",
          "Lists relevant technologies, including Google's Gemini and Firebase."
        ],
        "weaknesses": [
          "Lacks visual evidence of the implemented solution or user interface (UI/UX).",
          "Details on the specific implementation of Google technologies (Gemini, Firebase) are minimal.",
          "The implementation plan is high-level and could benefit from more specific milestones or timelines.",
          "No demonstration or results are presented in the slides.",
          "The flowchart is abstract and doesn't detail the data analysis steps."
        ],
        "suggestions": [
          "Include screenshots or a brief video demo of the working application and its UI.",
          "Provide more specific details on how Gemini is used for anomaly detection and how Firebase stores/manages data.",
          "Elaborate on the data processing and anomaly detection logic.",
          "Showcase any results obtained, even with sample data.",
          "Consider adding a slide on future plans or potential challenges and how they might be addressed."
        ]
      },
      "executive_summary": "Phantom Pay addresses a relevant problem with a promising data-driven solution leveraging Google technologies. The presentation clearly articulates the problem, solution concept, and potential impact. While the narrative flow between the provided slides is logical, the submission lacks crucial evidence of technical implementation, user interface, and a demonstration of the working system, which are vital for a hackathon evaluation.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent opening slide. Clearly states the problem, proposed solution, team, and tech stack. Sets the stage effectively.",
          "slide": 1
        },
        {
          "note": "Provides good detail on the process flow, implementation plan, innovation, and impact. Complements slide 1 well. However, it lacks visual proof of implementation and deeper technical detail.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "prepbuild",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497910.7762513,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 4,
        "processing_time_seconds": 17.1415114402771
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 2,
        "presentation_documentation": 6,
        "technical_implementation_ux": 2
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 4,
        "total_slides_analyzed": 4,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a relevant and significant problem in the job market.",
          "Presents a well-structured solution with a comprehensive set of features.",
          "Logical flow from problem identification to solution overview.",
          "Visually clean and easy-to-read slides."
        ],
        "weaknesses": [
          "Critically lacks information on the specific technologies used, especially Google technologies, which is a core hackathon requirement.",
          "No demonstration or visual representation (screenshots, video link) of the actual platform or its user interface.",
          "Missing details on the technical architecture or implementation approach.",
          "Does not include information about the team.",
          "Lacks discussion on future plans, business model, or scalability strategy beyond the problem space."
        ],
        "suggestions": [
          "Add a dedicated slide detailing the technical stack, explicitly listing the Google technologies used and explaining how they contribute to the project.",
          "Include screenshots or a link to a demo video to showcase the platform's functionality and user experience.",
          "Provide a high-level overview of the technical architecture.",
          "Include a team slide to introduce the members.",
          "Consider adding slides on future features, potential monetization, or go-to-market strategy."
        ]
      },
      "executive_summary": "This presentation effectively communicates a clear problem in interview preparation and proposes a relevant AI-powered solution with a solid set of features. The narrative flow is logical and easy to follow. However, the presentation is critically incomplete for a hackathon submission, lacking essential details on the technical implementation, specifically the required Google technology usage, and providing no demonstration of the working product. While the problem and proposed solution are strong, the absence of technical evidence and demo significantly impacts the evaluation of the project's execution and adherence to hackathon criteria based solely on these slides.",
      "slide_by_slide_notes": [
        {
          "note": "Strong title slide, clearly states the project name and effectively introduces the core problem being addressed.",
          "slide": 1
        },
        {
          "note": "Breaks down the main problem into specific, relatable challenges, providing good context for the need for a solution.",
          "slide": 2
        },
        {
          "note": "Outlines the key features of the proposed solution. The features listed seem comprehensive and directly address the challenges mentioned.",
          "slide": 3
        },
        {
          "note": "Provides a concluding summary of the platform's benefits, reinforcing its value proposition. Serves as a good wrap-up of the solution.",
          "slide": 4
        }
      ]
    }
  },
  {
    "team_name": "RaktSetu",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749498321.5668125,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 10,
        "processing_time_seconds": 22.09793591499329
      },
      "criteria_scores": {
        "impact_scalability": 9,
        "innovation_creativity": 8,
        "google_technologies_usage": 8,
        "presentation_documentation": 9,
        "technical_implementation_ux": 8
      },
      "overall_analysis": {
        "consistency_score": 10,
        "completeness_score": 8,
        "total_slides_analyzed": 10,
        "presentation_flow_score": 9
      },
      "detailed_feedback": {
        "strengths": [
          "Excellent problem identification with clear statistics and context.",
          "Well-defined target audience and specific areas of application.",
          "Clear and logical user flow diagram.",
          "Simple but effective architecture diagram showing key components.",
          "Strong focus on real-time functionality and its impact.",
          "Good consideration of business model and revenue streams.",
          "Competitive analysis effectively highlights key differentiators."
        ],
        "weaknesses": [
          "Lacks a dedicated section or visual representation of the actual product/demo.",
          "Details on the specific implementation of Google technologies (beyond mentioning Firebase and APIs) could be more explicit.",
          "Implementation methodology is high-level; a timeline would be beneficial.",
          "UX considerations are mentioned but not detailed."
        ],
        "suggestions": [
          "Include screenshots or a brief video demonstration of the platform's key features.",
          "Elaborate on how specific Google technologies (e.g., Firebase Realtime Database, Google Maps Geolocation/Directions API) are used to enable the real-time and location-based features.",
          "Add a simple timeline to the implementation methodology slide.",
          "Briefly describe key UX design choices or principles followed."
        ]
      },
      "executive_summary": "This presentation for RaktSetu effectively communicates a solution to a critical real-world problem in India. The narrative flows logically from problem to solution, architecture, impact, and business model. The project demonstrates strong potential for impact and scalability, leveraging Google technologies like Firebase and Maps API for its core real-time, location-based functionality. While the technical architecture and user flow are clear, the presentation would be significantly enhanced by including a visual demo and providing more specific details on the implementation of the Google technologies used.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening with a compelling problem statement, supported by statistics and highlighting specific challenges like rural access and lack of real-time tech.",
          "slide": 1
        },
        {
          "note": "Presents a well-thought-out multi-stakeholder business model and diverse revenue streams, showing consideration for sustainability.",
          "slide": 2
        },
        {
          "note": "Clearly introduces the solution 'RaktSetu' and its core function (real-time connection). The simple flow diagram is helpful.",
          "slide": 3
        },
        {
          "note": "Effective competitive analysis table clearly positions RaktSetu's advantages, particularly in real-time availability and gamification.",
          "slide": 4
        },
        {
          "note": "Detailed user flow diagram provides a clear understanding of how donors and recipients interact with the platform.",
          "slide": 5
        },
        {
          "note": "Architecture diagram is simple and shows key components including Firebase and APIs, indicating the technical foundation.",
          "slide": 6
        },
        {
          "note": "Visual representation of specific application areas effectively communicates the broad potential impact and target segments.",
          "slide": 7
        },
        {
          "note": "Outlines a standard and logical implementation methodology. Mentions technologies used but could benefit from a timeline.",
          "slide": 8
        },
        {
          "note": "Clearly articulates the potential impact of the solution, linking features (gamification, accessibility) to benefits (increased donations, life-saving).",
          "slide": 9
        },
        {
          "note": "Reinforces target audience and explicitly addresses demand and scalability, aligning with the impact potential discussed earlier.",
          "slide": 10
        }
      ]
    }
  },
  {
    "team_name": "SafePath",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497729.2390823,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 15.207290649414062
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 9,
        "presentation_documentation": 7,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 7,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 7
      },
      "detailed_feedback": {
        "strengths": [
          "Clear and compelling problem statement addressing a critical real-world issue.",
          "Well-defined proposed solution with key features clearly outlined.",
          "Excellent selection and integration plan for multiple core Google technologies (Firebase, Google Maps API, Gemini Pro AI).",
          "Clear and logical architecture diagram illustrating the system flow.",
          "Strong articulation of the project's innovation points and potential impact."
        ],
        "weaknesses": [
          "Lack of visual representation of the application's user interface or flow (screenshots, video link).",
          "The 'Implementation Plan' is a list of steps rather than a detailed timeline or breakdown.",
          "Missing sections typically found in a complete pitch, such as future development plans, challenges faced, or a more detailed business/impact model beyond the initial description.",
          "The presentation consists of only two slides, which limits the depth of information that can be conveyed."
        ],
        "suggestions": [
          "Include screenshots or a short video demonstration of the working application to showcase the UI/UX and functionality.",
          "Expand on the implementation plan, potentially adding a timeline or highlighting key milestones achieved during the hackathon.",
          "Add a slide on future features or iterations for the project.",
          "Consider adding a slide discussing challenges encountered and how they were overcome.",
          "Elaborate on the 'Innovation & Impact' section with more specific metrics or use cases if possible."
        ]
      },
      "executive_summary": "This presentation effectively introduces SafePath, a mobile app addressing emergency response. It clearly identifies a critical problem and proposes an innovative solution leveraging multiple Google technologies like Firebase, Google Maps API, and Gemini AI. The technical architecture and implementation plan are well-articulated. While the core concept and technical approach are strong, the presentation would be significantly enhanced by including visual demonstrations of the application's UI/UX and providing more detail on the implementation process and future potential. Overall, a promising project with a clear vision and solid technical foundation.",
      "slide_by_slide_notes": [
        {
          "note": "Excellent opening slide. Clearly defines the problem, proposes a relevant solution, lists the tech stack (highlighting Google technologies), and articulates the innovation and impact effectively. Sets a strong foundation.",
          "slide": 1
        },
        {
          "note": "Provides necessary details on the implementation plan and architecture. The diagram is very helpful in understanding the system flow. Connects well to the tech stack mentioned in Slide 1. Team info is present but basic.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Study Genie",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497760.7515943,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 11.857526779174805
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 9,
        "presentation_documentation": 7,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 6,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clear identification of a relevant student problem.",
          "Well-defined proposed solution leveraging AI.",
          "Excellent integration and clear explanation of Google Technologies (Gemini, Calendar API, Firebase/Vercel).",
          "Logical technical architecture and user flow diagrams.",
          "Specific innovation points highlighted."
        ],
        "weaknesses": [
          "Limited number of slides makes it difficult to fully assess the project's depth.",
          "No demonstration or visual representation of the actual application/UI.",
          "The 'Plan' section is brief; lacks specific milestones or timeline details.",
          "Technical Implementation/UX cannot be fully judged without seeing the actual code or user interface."
        ],
        "suggestions": [
          "Include slides demonstrating the application's key features and user interface.",
          "Expand on the 'Plan' section with more detailed steps and a timeline.",
          "Provide more specific examples of how Gemini is used for personalization (e.g., different responses based on mood or query type).",
          "Add a slide on future features or expansion plans.",
          "Consider adding a slide on testing or validation."
        ]
      },
      "executive_summary": "This submission for StudyGenie presents a compelling AI-powered solution to a common student problem, effectively leveraging Google Gemini and other Google technologies. The technical architecture and user flow are clearly articulated. While the two slides provide a solid overview and highlight key innovations, the presentation lacks depth in demonstrating the actual implementation and user experience, which is crucial for a hackathon evaluation. Adding demo visuals and expanding on the development plan would significantly strengthen the submission.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide. Clearly states the problem and proposed solution. The architecture diagram is helpful and clearly shows the role of Google Gemini. Good foundation laid out.",
          "slide": 1
        },
        {
          "note": "Details the tech stack, reinforcing Google tech usage. Lists specific innovation points. The user flow diagram is clear and visually explains the core functionalities. The plan is listed but brief. Team is introduced.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Suvidha-PPT",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497686.4114034,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 12.320124864578249
      },
      "criteria_scores": {
        "impact_scalability": 8,
        "innovation_creativity": 8,
        "google_technologies_usage": 7,
        "presentation_documentation": 6,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 4,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 8
      },
      "detailed_feedback": {
        "strengths": [
          "Clearly identifies a significant real-world problem (government grievance systems).",
          "Presents a multi-faceted solution addressing different user types (citizens, employees, admins).",
          "Highlights innovative aspects like WhatsApp integration and AI-powered summarization.",
          "Provides a clear technical architecture diagram.",
          "Lists a relevant and modern tech stack."
        ],
        "weaknesses": [
          "The presentation appears incomplete, lacking crucial sections like market size, business model, demo details, team, and future plans.",
          "Specific details on the implementation and effectiveness of Google technologies (Gemini, Google APIs) are brief.",
          "No visual representation or details about the user interface (UX) are provided.",
          "The 'Google Technologies Usage' could be strengthened by detailing which specific Google APIs are used beyond Gemini.",
          "The 'Technical Implementation' score is limited as code quality and actual functionality cannot be assessed from slides alone."
        ],
        "suggestions": [
          "Include slides demonstrating the user experience (citizen submitting complaint via WhatsApp, admin using the web portal).",
          "Elaborate on the specific Google APIs used and how they are critical to the solution.",
          "Provide metrics or potential impact statistics related to the problem and solution.",
          "Add sections for market opportunity, business model/sustainability, team introduction, and future roadmap.",
          "If possible, include a link to a demo video or live site."
        ]
      },
      "executive_summary": "This presentation, though seemingly incomplete with only two slides, effectively introduces a relevant problem and proposes an innovative, scalable solution leveraging Google technologies. The core idea, technical flow, and tech stack are clearly presented. To be a complete hackathon submission presentation, it would need to include demonstration details, market context, business aspects, and more specific details on the implementation of Google technologies and the user experience.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide. Clearly states the project name, mission, problem, solutions, and key innovations. The problem is well-articulated and relatable. The solutions are presented concisely. The innovation points are clear and highlight the unique aspects.",
          "slide": 1
        },
        {
          "note": "Provides essential technical context. The application flow diagram is clear and easy to follow, illustrating the interactions between different components and users. The tech stack lists relevant technologies, including Google Gemini and Google APIs, which addresses the hackathon requirement. However, the specific Google APIs used are not detailed.",
          "slide": 2
        }
      ]
    }
  },
  {
    "team_name": "Truth at Scale",
    "gemini_response": {
      "metadata": {
        "domain": "Google Technologies Open Domain Hackathon",
        "timestamp": 1749497922.9502711,
        "gemini_model": "gemini-2.5-flash-preview-04-17",
        "slides_analyzed": 2,
        "processing_time_seconds": 11.96007800102234
      },
      "criteria_scores": {
        "impact_scalability": 9,
        "innovation_creativity": 9,
        "google_technologies_usage": 8,
        "presentation_documentation": 8,
        "technical_implementation_ux": 7
      },
      "overall_analysis": {
        "consistency_score": 9,
        "completeness_score": 6,
        "total_slides_analyzed": 2,
        "presentation_flow_score": 9
      },
      "detailed_feedback": {
        "strengths": [
          "Excellent identification of a significant real-world problem (fake news).",
          "Clear and innovative proposed solution combining multimodal analysis and timeline generation.",
          "Strong technical architecture diagram that clearly illustrates the system flow.",
          "Well-defined tech stack listing relevant technologies, including multiple Google services.",
          "Focus on supporting underrepresented languages adds significant impact and innovation."
        ],
        "weaknesses": [
          "The presentation is incomplete; crucial sections like a demo, team introduction, results/impact metrics, and future plans are missing.",
          "Technical implementation details are high-level; specific use cases for Gemini/Vision/Translate APIs could be elaborated.",
          "The 'Technical Implementation UX' score is limited as no demo or UI visuals were provided.",
          "No mention of challenges faced or how they were overcome during the hackathon."
        ],
        "suggestions": [
          "Include a live or recorded demo showcasing the platform's functionality.",
          "Add a slide detailing the team members and their roles.",
          "Provide specific examples or metrics of how the AI models perform.",
          "Expand on the 'Innovation & Impact' points, perhaps with a user story or scenario.",
          "Include a slide on future plans and potential monetization or scaling strategies.",
          "Briefly mention any significant technical challenges encountered and solutions implemented."
        ]
      },
      "executive_summary": "This presentation introduces a highly relevant and innovative project aimed at combating fake news using AI and Google technologies. The problem is well-defined, and the proposed solution is technically sound and impactful, particularly its multimodal and multilingual approach. The technical architecture and chosen technologies are appropriate. However, the presentation is incomplete, lacking essential elements like a demo, team information, and detailed results, which limits a full evaluation of the implementation and user experience. The provided slides demonstrate strong potential and a clear understanding of the core problem and solution.",
      "slide_by_slide_notes": [
        {
          "note": "Strong opening slide. Clearly articulates the problem, proposed solution, and highlights key innovative aspects and potential impact. Sets a clear purpose for the project.",
          "slide": 1
        },
        {
          "note": "Good technical overview. The architecture diagram is helpful. The tech stack is relevant and clearly lists Google technologies. The implementation plan provides a high-level roadmap. Could benefit from slightly larger text in the diagram.",
          "slide": 2
        }
      ]
    }
  }
]

export default function HackathonDashboard() {
  const [selectedTeam, setSelectedTeam] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")

  const currentTeam = evaluationData[selectedTeam]
  const filteredTeams = evaluationData.filter((team) => team.team_name.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const criteriaLabels = {
    impact_scalability: "Impact & Scalability",
    innovation_creativity: "Innovation & Creativity",
    google_technologies_usage: "Google Technologies Usage",
    presentation_documentation: "Presentation & Documentation",
    technical_implementation_ux: "Technical Implementation & UX",
  }

  const overallLabels = {
    consistency_score: "Consistency Score",
    completeness_score: "Completeness Score",
    presentation_flow_score: "Presentation Flow Score",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Hackathon Evaluation Dashboard</h1>
                <p className="text-sm text-gray-500">Google Technologies Open Domain Hackathon</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Teams ({filteredTeams.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTeams.map((team, index) => {
                  const originalIndex = evaluationData.findIndex((t) => t.team_name === team.team_name)
                  const avgScore = Object.values(team.gemini_response.criteria_scores).reduce((a, b) => a + b, 0) / 5
                  return (
                    <Button
                      key={team.team_name}
                      variant={selectedTeam === originalIndex ? "default" : "ghost"}
                      className={`w-full justify-start h-auto p-3 transition-colors duration-200 ${
                        selectedTeam === originalIndex 
                          ? "bg-blue-700 text-white hover:bg-blue-800" 
                          : "hover:bg-blue-200"
                      }`}
                      onClick={() => setSelectedTeam(originalIndex)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{team.team_name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getScoreBadgeColor(avgScore)}`}>
                            Avg: {avgScore.toFixed(1)}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Team Header */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{currentTeam.team_name}</CardTitle>
                    <CardDescription className="text-blue-100 mt-2">
                      {currentTeam.gemini_response.metadata.domain}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {(
                        Object.values(currentTeam.gemini_response.criteria_scores).reduce((a, b) => a + b, 0) / 5
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-100">Overall Score</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Metadata Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-gray-500">Evaluated</div>
                      <div className="font-medium text-sm">
                        {formatTimestamp(currentTeam.gemini_response.metadata.timestamp)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm text-gray-500">Slides Analyzed</div>
                      <div className="font-medium text-lg">{currentTeam.gemini_response.metadata.slides_analyzed}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <div className="text-sm text-gray-500">Processing Time</div>
                      <div className="font-medium text-lg">
                        {currentTeam.gemini_response.metadata.processing_time_seconds.toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm text-gray-500">AI Model</div>
                      <div className="font-medium text-sm">
                        {currentTeam.gemini_response.metadata.gemini_model.split("-").slice(0, 2).join("-")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="scores" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="scores" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Scores</TabsTrigger>
                <TabsTrigger value="feedback" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Feedback</TabsTrigger>
                <TabsTrigger value="summary" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Summary</TabsTrigger>
                <TabsTrigger value="slides" className="transition-colors duration-200 data-[state=inactive]:hover:bg-blue-50 data-[state=active]:bg-blue-700 data-[state=active]:text-white">Slides</TabsTrigger>
              </TabsList>

              <TabsContent value="scores" className="space-y-6">
                {/* Criteria Scores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      <span>Evaluation Criteria Scores</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(currentTeam.gemini_response.criteria_scores).map(([key, score]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {criteriaLabels[key as keyof typeof criteriaLabels]}
                          </span>
                          <Badge className={getScoreBadgeColor(score)}>{score}/10</Badge>
                        </div>
                        <Progress value={score * 10} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Overall Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>Overall Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(currentTeam.gemini_response.overall_analysis)
                      .filter(([key]) => key !== "total_slides_analyzed")
                      .map(([key, score]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {overallLabels[key as keyof typeof overallLabels]}
                            </span>
                            <Badge className={getScoreBadgeColor(score)}>{score}/10</Badge>
                          </div>
                          <Progress value={score * 10} className="h-2" />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTeam.gemini_response.detailed_feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTeam.gemini_response.detailed_feedback.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-700">
                      <Lightbulb className="w-5 h-5" />
                      <span>Suggestions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentTeam.gemini_response.detailed_feedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span>Executive Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{currentTeam.gemini_response.executive_summary}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="slides" className="space-y-4">
                {currentTeam.gemini_response.slide_by_slide_notes.map((slide, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Slide {slide.slide}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{slide.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
