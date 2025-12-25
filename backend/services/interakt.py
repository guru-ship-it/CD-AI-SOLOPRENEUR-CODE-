
import os
import requests

def send_interakt_reply(user_phone: str, message: str):
    """
    Sends a WhatsApp reply via Interakt API.
    """
    api_key = os.getenv("INTERAKT_API_KEY", "MOCK_KEY")
    print(f"[INTERAKT] Sending to {user_phone}: {message}")
    
    # Real implementation:
    # url = "https://api.interakt.ai/v1/public/message/"
    # headers = {"Authorization": f"Basic {api_key}", "Content-Type": "application/json"}
    # payload = {"phoneNumber": user_phone, "type": "Text", "message": message}
    # requests.post(url, headers=headers, json=payload)

def send_support_alert_email(subject: str, body: str):
    """
    Simulates sending a support email alert.
    """
    print(f"[EMAIL-ALERT] 📧 {subject}")
    print(f"Body: {body}")
    # Integration with SendGrid/SMTP would go here.
