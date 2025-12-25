
import requests
import os

# Protean Direct Config (You will get these after signing their agreement)
PROTEAN_BASE_URL = "https://ver.nsdl.com/verification" # Example URL
PROTEAN_CLIENT_ID = os.getenv("PROTEAN_CLIENT_ID")
PROTEAN_CLIENT_SECRET = os.getenv("PROTEAN_CLIENT_SECRET")
# The Static IP is handled by Google Cloud Infrastructure, not code.

def verify_pan_direct(pan_number: str):
    """
    Direct verification via NSDL/Protean
    """
    payload = {
        "pan": pan_number,
        "consent": "Y",
        "client_id": PROTEAN_CLIENT_ID
    }
    
    # You generally need to sign the payload with your Digital Signature Certificate (DSC)
    # This is a key requirement for direct NSDL integration.
    signed_payload = sign_with_dsc(payload) 

    try:
        response = requests.post(
            PROTEAN_BASE_URL, 
            json=signed_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'E': # E usually means 'Existing' (Valid)
                return {
                    "valid": True,
                    "name": data.get("name_on_card"),
                    "category": "Individual"
                }
        return {"valid": False, "error": f"Invalid PAN or API Error: {response.status_code}"}

    except Exception as e:
        return {"valid": False, "error": str(e)}

def sign_with_dsc(payload):
    """
    Todo: Implement PKCS#7 signing logic here.
    Note: Direct NSDL integration requires payload to be digitally signed using a PFX certificate.
    """
    return payload
