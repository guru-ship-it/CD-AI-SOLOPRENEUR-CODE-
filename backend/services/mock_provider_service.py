import random
import uuid
from datetime import datetime

class MockProviderService:
    """
    Simulates a 'Truth Source' ID Verification Provider (e.g., Protean, NSDL, Zoop).
    Allows testing the full flow without external API keys or whitelisting.
    """

    @staticmethod
    def verify_id(id_type: str, id_number: str) -> dict:
        """
        Simulates verification logic based on ID patterns.
        """
        # 1. Deterministic Failure
        if id_number.startswith("0000"):
            return {
                "status": "FAILED",
                "error_code": "INVALID_ID_NUMBER",
                "message": "ID Number does not exist in government records.",
                "transaction_id": str(uuid.uuid4())
            }
        
        # 2. Deterministic Success (The "Happy Path")
        # Default behavior for demo purposes is SUCCESS to show value
        
        # Simulate Network Latency? (Not needed for async tasks, but good for mental model)
        
        # Mock Data Generation
        mock_data = {
            "full_name": "Arjun Kumar Verified",
            "father_name": "Rajesh Kumar",
            "dob": "1990-05-15",
            "gender": "M",
            "address": {
                "line1": "Flat 402, Sai Residency",
                "city": "Hyderabad",
                "state": "Telangana",
                "pincode": "500081"
            }
        }
        
        return {
            "status": "SUCCESS",
            "data": mock_data,
            "provider_ref": f"MOCK-{uuid.uuid4().hex[:8].upper()}",
            "verified_at": datetime.utcnow().isoformat(),
            "source": "MOCK_PROTEAN_GATEWAY"
        }
