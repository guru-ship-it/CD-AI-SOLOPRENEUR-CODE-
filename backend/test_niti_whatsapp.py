import requests
import json

BASE_URL = "http://localhost:8000/whatsapp/hook"
USER_ID = "whatsapp_test_user"

def send(msg, image_url=None):
    payload = {
        "user_id": USER_ID,
        "message": msg,
        "image_url": image_url
    }
    print(f"--- Sending: {msg} ---")
    resp = requests.post(BASE_URL, json=payload)
    data = resp.json()
    print(f"Response: {data['response']}")
    print(f"Next State: {data['next_state']}\n")
    return data

try:
    # 1. Start NITI
    send("NITI")
    
    # 2. Select Language (1 - English)
    send("1")
    
    # 3. Agree to DPDP
    send("1")
    
    # 4. Select Individual
    send("1")
    
    # 5. Select KYC
    send("1")
    
    # 6. Mark as PAID
    send("PAID")
    
    # 7. Upload image
    send("", image_url="http://example.com/aadhaar.jpg")

except Exception as e:
    print(f"Error: {e}")
