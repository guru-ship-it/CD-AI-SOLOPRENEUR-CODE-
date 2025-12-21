import os
import json
import time
from jwcrypto import jwk, jws
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

class ProteanCircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failures = 0
        self.last_failure_time = 0
        self.state = "CLOSED" # CLOSED (Normal), OPEN (Failing)

    def record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()
        if self.failures >= self.failure_threshold:
            self.state = "OPEN"
            print("Protean Circuit Breaker: OPENED due to failures.")

    def record_success(self):
        self.failures = 0
        self.state = "CLOSED"

    def is_open(self):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN" # Try one request
                return False
            return True
        return False

class ProteanGateway:
    def __init__(self):
        self.api_key_path = "/secrets/protean/key"
        self.breaker = ProteanCircuitBreaker()
        # Load keys only if file exists (Production)
        if os.path.exists(self.api_key_path):
            with open(self.api_key_path, 'r') as f:
                self.api_key = f.read().strip()
        else:
             self.api_key = "MOCK_KEY"

    def sign_request(self, payload: dict) -> str:
        """Sign payload using JWS (Mock implementation of logic)."""
        key = jwk.JWK.generate(kty='oct', size=256)
        payload_json = json.dumps(payload)
        jws_token = jws.JWS(payload_json.encode('utf-8'))
        jws_token.add_signature(key, None, json.dumps({"alg": "HS256"}))
        return jws_token.serialize()

    def encrypt_body(self, data: str) -> bytes:
        """Encrypt body using AES-256 (Mock logic for setup)."""
        key = os.urandom(32)
        iv = os.urandom(16)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        # Padding omitted for brevity in demo
        return iv + encryptor.update(data.encode() + b" " * (16 - len(data) % 16)) + encryptor.finalize()

    def verify_id(self, id_number: str):
        if self.breaker.is_open():
            print("Circuit Open: Switching to Queue Mode (Delaying Task)")
            return {"status": "QUEUED", "reason": "Circuit Breaker Open"}

        try:
            # Simulate External Call
            # request = requests.post(..., headers={"Signature": self.sign_request(...)})
            
            # Simulate Success
            self.breaker.record_success()
            return {"status": "VERIFIED", "source": "Protean"}
        except Exception as e:
            self.breaker.record_failure()
            raise e
