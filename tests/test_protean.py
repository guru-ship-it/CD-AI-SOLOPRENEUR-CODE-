import unittest
from unittest.mock import patch, mock_open, MagicMock
import sys
import os

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.gateways.protean import ProteanGateway

class TestProteanGateway(unittest.TestCase):
    
    def test_secrets_loading(self):
        """Test that the gateway loads the API key from the secret file."""
        mock_key = "test-secret-key"
        m = mock_open(read_data=mock_key)
        
        # Patch open to simulate the secret file existing
        with patch("builtins.open", m), patch("os.path.exists", return_value=True):
            gateway = ProteanGateway()
            self.assertEqual(gateway.api_key, mock_key)
            print("\n[PASS] Secrets Loading: Key loaded successfully.")

    def test_jws_signature(self):
        """Test JWS signature generation."""
        gateway = ProteanGateway()
        payload = {"name": "Test User"}
        
        # We assume the mocked key or default "MOCK_KEY"
        signature = gateway.sign_request(payload)
        self.assertIsInstance(signature, str)
        self.assertGreater(len(signature), 0)
        print(f"[PASS] JWS Signature: Generated Token -> {signature[:20]}...")

    def test_encryption(self):
        """Test AES-256 encryption."""
        gateway = ProteanGateway()
        data = "Sensitive Data"
        encrypted = gateway.encrypt_body(data)
        
        self.assertIsInstance(encrypted, bytes)
        self.assertNotEqual(data.encode(), encrypted)
        print(f"[PASS] AES Encryption: Encrypted '{data}' -> {encrypted.hex()[:20]}...")

    def test_circuit_breaker_logic(self):
        """Test that the circuit breaker opens after failures."""
        gateway = ProteanGateway()
        
        # Simulate 5 failures
        print("[TEST] Simulating 5 failures for Circuit Breaker...")
        for i in range(5):
            try:
                # Mock verify_id internals to raise exception
                with patch.object(gateway.breaker, 'record_failure', wraps=gateway.breaker.record_failure) as mock_record:
                    # Manually trigger failure recording for test since we aren't making real HTTP calls to fail
                    gateway.breaker.record_failure()
            except:
                pass
        
        self.assertTrue(gateway.breaker.is_open())
        print("[PASS] Circuit Breaker: State is OPEN.")
        
        # Test fallback
        result = gateway.verify_id("12345")
        self.assertEqual(result["status"], "QUEUED")
        print("[PASS] Circuit Breaker: Fallback to QUEUED mode confirmed.")

if __name__ == "__main__":
    unittest.main()
