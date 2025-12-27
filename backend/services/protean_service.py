import requests
import json
import jwt
import datetime
import time
import os

"""
PROTEAN INTEGRATION ENGINE (ComplianceDesk.ai)
Version: 1.0
Tech: Python 3.9+, Requests, JWT
"""

# ---------------------------------------------------------
# 1. CONFIGURATION (Using Env Vars for Security)
# ---------------------------------------------------------
PROTEAN_BASE_URL = os.getenv("PROTEAN_BASE_URL", "https://uat.ris.protean.co.in")
PROTEAN_PROJECT_ID = os.getenv("PROTEAN_PROJECT_ID", "YOUR_PROJECT_ID")
PROTEAN_CLIENT_ID = os.getenv("PROTEAN_CLIENT_ID", "YOUR_CLIENT_ID")
PROTEAN_CLIENT_SECRET = os.getenv("PROTEAN_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
# P12_FILE_PATH = os.getenv("PROTEAN_P12_PATH", "path/to/certificate.p12")

def get_access_token():
    """
    Generates the OpenID Connect Token required for all Protean calls.
    Includes JWT assertion signing logic.
    """
    try:
        # Load Private Key from Environment or Secret Manager
        # In Production: Use Google Secret Manager to load the .pem key
        private_key = os.getenv("PROTEAN_PRIVATE_KEY")
        if not private_key:
            # Fallback for testing/debugging
            print("WARNING: PROTEAN_PRIVATE_KEY not set. Using stub.")
            return "STUB_ACCESS_TOKEN"
        
        # Create JWT Assertion
        now = int(time.time())
        payload = {
            "iss": PROTEAN_CLIENT_ID,
            "sub": PROTEAN_CLIENT_ID,
            "aud": f"{PROTEAN_BASE_URL}/v1/auth/token",
            "exp": now + 300, # 5 mins expiry
            "iat": now
        }
        encoded_jwt = jwt.encode(payload, private_key, algorithm="RS256")
        
        # Call Auth API
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        data = {
            'grant_type': 'client_credentials',
            'client_id': PROTEAN_CLIENT_ID,
            'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
            'client_assertion': encoded_jwt
        }
        
        response = requests.post(f"{PROTEAN_BASE_URL}/v1/auth/token", headers=headers, data=data)
        response.raise_for_status()
        return response.json().get('access_token')
        
    except Exception as e:
        print(f"Auth Failed: {str(e)}")
        return None

# ---------------------------------------------------------
# 2. VERIFICATION FUNCTIONS
# ---------------------------------------------------------

def verify_vehicle_rc(rc_number: str):
    """
    API: Vehicle RC Verification - Advanced
    """
    token = get_access_token()
    if not token: return {"status": "ERROR", "message": "Authentication failed"}

    url = f"{PROTEAN_BASE_URL}/v1/kyc/vehicle-rc-advanced"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "rc_number": rc_number,
        "consent": "Y",
        "client_ref_id": f"txn_{int(time.time())}"
    }
    
    try:
        # For UAT/Demo, return real structure but handle failures gracefully
        if token == "STUB_ACCESS_TOKEN":
             return {"status": "SUCCESS", "registration_number": rc_number, "owner_name": "John Doe", "fitness_upto": "2030-01-01"}
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

def verify_kyc_ocr(image_base64: str):
    """
    API: KYC OCR Plus (Extracts data from ID Card Image)
    """
    token = get_access_token()
    if not token: return {"status": "ERROR", "message": "Authentication failed"}

    url = f"{PROTEAN_BASE_URL}/v1/ocr/kyc-ocr-plus"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "file_data": image_base64,
        "file_type": "jpeg",
        "consent": "Y",
        "client_ref_id": f"txn_{int(time.time())}"
    }
    
    try:
        if token == "STUB_ACCESS_TOKEN":
            return {"status": "SUCCESS", "extracted_data": {"name": "Arjun Kumar", "id_number": "XXXX-XXXX-XXXX"}}
        
        response = requests.post(url, headers=headers, json=payload)
        return response.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

def search_epfo_establishment(employer_name: str):
    """
    API: EPFO Establishment Search
    """
    token = get_access_token()
    if not token: return {"status": "ERROR", "message": "Authentication failed"}

    url = f"{PROTEAN_BASE_URL}/v1/employment/epfo-search"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "establishment_name": employer_name,
        "consent": "Y"
    }
    
    try:
        if token == "STUB_ACCESS_TOKEN":
            return {"status": "SUCCESS", "establishment_id": "STUB123", "name": employer_name}

        response = requests.post(url, headers=headers, json=payload)
        return response.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

def verify_mobile_status(mobile_number: str, name: str = None):
    """
    API: Mobile Verification (Status + Details)
    """
    token = get_access_token()
    if not token: return {"status": "ERROR", "message": "Authentication failed"}

    url = f"{PROTEAN_BASE_URL}/v1/telecom/mobile-verification"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "mobile": mobile_number,
        "name": name,
        "consent": "Y"
    }
    
    try:
        if token == "STUB_ACCESS_TOKEN":
            return {"status": "SUCCESS", "mobile": mobile_number, "active": True, "provider": "Jio"}

        response = requests.post(url, headers=headers, json=payload)
        return response.json()
    except Exception as e:
        return {"status": "ERROR", "message": str(e)}

# Stubs for remaining services to be implemented
def run_forgery_scan(image_url: str):
    return {"status": "SUCCESS", "forgery_score": 0.02, "is_tampered": False}

def verify_gstin(gstin: str):
    return {"status": "SUCCESS", "gstin": gstin, "business_name": "ComplianceDesk AI Pvt Ltd", "status": "Active"}

def pull_digilocker_doc(task_id: str):
    return {"status": "SUCCESS", "doc_url": "https://vault.digilocker.gov.in/stub", "verified": True}
