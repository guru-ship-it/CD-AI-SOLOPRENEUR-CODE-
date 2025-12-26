import os
import json
import google.generativeai as genai
from typing import Optional, Dict, Any

class GeminiParserService:
    """
    Uses Google Gemini Pro to parse and structure messy OCR text from ID cards.
    Acts as a 'Post-Processing Layer' for Google Vision API.
    """
    
    @staticmethod
    def parse_id_card(raw_text: str) -> Dict[str, Any]:
        """
        Extracts structured data (Name, UID, DOB) from raw text using Gemini.
        """
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not set", "status": "FAILED"}

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # System Prompt for robustness
            prompt = f"""
            You are an expert Data Extraction AI for Indian Identity Documents.
            
            Input: Raw OCR text from an Aadhaar Card or PAN Card (may contain noise/glare).
            Task: Extract the following fields:
            - full_name (String)
            - id_number (String - e.g. 12-digit Aadhaar or 10-char PAN)
            - dob (String - YYYY-MM-DD format if possible, else raw)
            - gender (M/F/O)
            - address (String, clean up newlines)
            
            Constraint: Return ONLY valid JSON. If a field is not found, set it to null. Do not add markdown formatting like ```json.
            
            Raw Text:
            "{raw_text}"
            """
            
            response = model.generate_content(prompt)
            
            # Clean response (sometimes Gemini adds markdown fences)
            clean_text = response.text.strip().replace("```json", "").replace("```", "")
            structured_data = json.loads(clean_text)
            
            # Additional Logic: State Detection from raw text
            from services.finance_service import GSTCalculator
            structured_data["detected_state"] = GSTCalculator.detect_state_from_ocr(raw_text)
            
            return structured_data
            
        except Exception as e:
            print(f"Gemini Parser Error: {str(e)}")
            return {
                "error": str(e), 
                "status": "FAILED", 
                "raw_text_received": raw_text
            }
