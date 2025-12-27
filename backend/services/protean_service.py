import requests
import json
import jwt
import time
import os

"""
PROTEAN GRID GATEWAY (ComplianceDesk.ai)
Version: 1.2
Architecture: Grid/Adapter Pattern
"""

# ---------------------------------------------------------
# 1. API GRID REGISTRY (The Modular Cells)
# ---------------------------------------------------------
PROTEAN_API_GRID = {
    # Core KYC/KYB
    "vehicle_rc": {"url": "/v1/kyc/vehicle-rc-advanced", "method": "POST", "required": ["rc_number"]},
    "kyc_ocr": {"url": "/v1/ocr/kyc-ocr-plus", "method": "POST", "required": ["file_data", "file_type"]},
    "epfo_search": {"url": "/v1/employment/epfo-search", "method": "POST", "required": ["establishment_name"]},
    "mobile_verify": {"url": "/v1/telecom/mobile-verification", "method": "POST", "required": ["mobile"]},
    
    # Utilities Grid
    "electricity_bill": {"url": "/v1/utility/electricity-bill", "method": "POST", "required": ["consumer_id", "provider_id"]},
    "png_verify": {"url": "/v1/utility/png-verification", "method": "POST", "required": ["consumer_id"]},
    
    # Professional Grid
    "icsi_membership": {"url": "/v1/professional/icsi-membership", "method": "POST", "required": ["membership_number"]},
    "shop_establishment": {"url": "/v1/business/shop-establishment", "method": "POST", "required": ["registration_number", "state_code"]},
    
    # Identity & Fraud Grid
    "voter_id": {"url": "/v1/kyc/voter-id-verify", "method": "POST", "required": ["epic_number"]},
    "name_match": {"url": "/v1/identity/name-match", "method": "POST", "required": ["name1", "name2"]},
    "face_liveness": {"url": "/v1/biometric/face-liveness-passive", "method": "POST", "required": ["image"]},
    "email_fraud": {"url": "/v1/fraud/email-fraud-check", "method": "POST", "required": ["email"]},
    
    # Logistics Grid
    "vehicle_reverse_rc": {"url": "/v1/kyc/vehicle-reverse-rc", "method": "POST", "required": ["engine_number", "chassis_number"]},
    
    # Workflow Grid
    "esign_pro": {"url": "/v1/workflow/esign-pro", "method": "POST", "required": ["document_data"]}
}

class ProteanGateway:
    def __init__(self):
        self.base_url = os.getenv("PROTEAN_BASE_URL", "https://uat.ris.protean.co.in")
        self.client_id = os.getenv("PROTEAN_CLIENT_ID", "YOUR_CLIENT_ID")
        self.client_secret = os.getenv("PROTEAN_CLIENT_SECRET", "YOUR_CLIENT_SECRET")
        self.private_key = os.getenv("PROTEAN_PRIVATE_KEY")

    def get_access_token(self):
        """Standardized JWT-based Auth"""
        if not self.private_key:
            return "STUB_ACCESS_TOKEN"
        
        try:
            now = int(time.time())
            payload = {
                "iss": self.client_id,
                "sub": self.client_id,
                "aud": f"{self.base_url}/v1/auth/token",
                "exp": now + 300,
                "iat": now
            }
            encoded_jwt = jwt.encode(payload, self.private_key, algorithm="RS256")
            
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}
            data = {
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                'client_assertion': encoded_jwt
            }
            
            response = requests.post(f"{self.base_url}/v1/auth/token", headers=headers, data=data)
            response.raise_for_status()
            return response.json().get('access_token')
        except Exception as e:
            print(f"Auth Failed: {str(e)}")
            return None

    def execute(self, api_slug: str, data: dict):
        """The Central Dispatcher (Grid Cell Executor)"""
        grid_cell = PROTEAN_API_GRID.get(api_slug)
        if not grid_cell:
            return {"status": "ERROR", "message": f"API Slug '{api_slug}' not found in grid."}
        
        # 1. Auth check
        token = self.get_access_token()
        if not token:
            return {"status": "ERROR", "message": "Authentication failed"}
        
        # 2. Stub handling for Dev
        if token == "STUB_ACCESS_TOKEN":
            return {"status": "SUCCESS", "message": f"Stubbed response for {api_slug}", "data": data}
        
        # 3. Real call execution
        url = f"{self.base_url}{grid_cell['url']}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Inject standard fields
        data["consent"] = data.get("consent", "Y")
        data["client_ref_id"] = data.get("client_ref_id", f"txn_{int(time.time())}")
        
        try:
            response = requests.request(
                method=grid_cell["method"],
                url=url,
                headers=headers,
                json=data
            )
            return response.json()
        except Exception as e:
            return {"status": "ERROR", "message": str(e)}

# ---------------------------------------------------------
# 3. BACKWARD COMPATIBILITY WRAPPERS
# ---------------------------------------------------------
gateway = ProteanGateway()

def verify_vehicle_rc(rc_number: str):
    return gateway.execute("vehicle_rc", {"rc_number": rc_number})

def verify_kyc_ocr(image_base64: str):
    return gateway.execute("kyc_ocr", {"file_data": image_base64, "file_type": "jpeg"})

def search_epfo_establishment(employer_name: str):
    return gateway.execute("epfo_search", {"establishment_name": employer_name})

def verify_mobile_status(mobile_number: str, name: str = None):
    return gateway.execute("mobile_verify", {"mobile": mobile_number, "name": name})

# Example calls for new Grid Cells
def verify_voter_id(epic_number: str):
    return gateway.execute("voter_id", {"epic_number": epic_number})

def verify_electricity_bill(consumer_id: str, provider_id: str):
    return gateway.execute("electricity_bill", {"consumer_id": consumer_id, "provider_id": provider_id})

def run_face_liveness(image_base64: str):
    return gateway.execute("face_liveness", {"image": image_base64})

# Legacy Stubs
def run_forgery_scan(image_url: str):
    return {"status": "SUCCESS", "forgery_score": 0.02, "is_tampered": False}

def verify_gstin(gstin: str):
    return {"status": "SUCCESS", "gstin": gstin, "business_name": "ComplianceDesk AI Pvt Ltd", "status": "Active"}

def pull_digilocker_doc(task_id: str):
    return {"status": "SUCCESS", "doc_url": "https://vault.digilocker.gov.in/stub", "verified": True}
