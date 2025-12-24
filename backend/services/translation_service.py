import os
import google.generativeai as genai
from typing import Optional, Dict, Any

class TranslationService:
    """
    Leverages Gemini Pro to translate Indian Regional Languages (Telugu, Tamil, Hindi, Kannada)
    into Professional English for Compliance Verification.
    """
    
    @staticmethod
    def translate_text(text: str, source_hint: str = "Auto-Detect", target_language: str = "English") -> Dict[str, str]:
        """
        Translates text to Target Language (English or Indian Regional).
        """
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return {"error": "GEMINI_API_KEY not set", "translated_text": ""}

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            
            # System Prompt for "Sworn Translator" persona
            prompt = f"""
            You are an expert Government Translator for Indian Languages.
            
            Input Text ({source_hint}):
            "{text}"
            
            Task:
            1. Detect the source language.
            2. Translate the content into {target_language}.
            3. Maintain legal nuances (e.g., 'F.I.R', 'Charge Sheet', 'Acquitted', 'Consent', 'Liability').
            
            Output Format:
            Return ONLY a JSON object with keys: 
            - "detected_language": String
            - "translated_text": String
            """
            
            response = model.generate_content(prompt)
            
            # Clean possible markdown
            clean_text = response.text.strip().replace("```json", "").replace("```", "")
            
            # Simple JSON parse or fallback
            import json
            try:
                data = json.loads(clean_text)
                return data
            except:
                return {"detected_language": "Unknown", "translated_text": clean_text}
            
        except Exception as e:
            print(f"Translation Error: {str(e)}")
            return {"error": str(e), "translated_text": ""}
