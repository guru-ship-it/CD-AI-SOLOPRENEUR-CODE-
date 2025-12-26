import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding

class SecurityUtils:
    """
    Handles PII Tokenization (AES-256) and Secret Management.
    """
    
    _ENCRYPTION_KEY = None

    @staticmethod
    def get_encryption_key():
        """
        Retrieves the master encryption key from Secret Manager.
        """
        if SecurityUtils._ENCRYPTION_KEY:
            return SecurityUtils._ENCRYPTION_KEY
        
        # In a real environment, this comes from Secret Manager
        # Using SecretParam via app.py or direct load here
        try:
            from firebase_functions.params import SecretParam
            key = SecretParam('MASTER_ENCRYPTION_KEY').value
            SecurityUtils._ENCRYPTION_KEY = base64.b64decode(key)
        except:
            # Fallback for local/demo (DO NOT USE IN PROD)
            SecurityUtils._ENCRYPTION_KEY = b'1' * 32 # 32 bytes for AES-256
            
        return SecurityUtils._ENCRYPTION_KEY

    @staticmethod
    def encrypt_pii(plain_text: str) -> str:
        """
        Encrypts PII using AES-256.
        """
        if not plain_text:
            return None
            
        key = SecurityUtils.get_encryption_key()
        iv = os.urandom(16)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(plain_text.encode()) + padder.finalize()
        
        encrypted_data = encryptor.update(padded_data) + encryptor.finalize()
        return base64.b64encode(iv + encrypted_data).decode('utf-8')

    @staticmethod
    def decrypt_pii(encrypted_text: str) -> str:
        """
        Decrypts PII using AES-256.
        """
        if not encrypted_text:
            return None
            
        try:
            key = SecurityUtils.get_encryption_key()
            data = base64.b64decode(encrypted_text)
            iv = data[:16]
            encrypted_data = data[16:]
            
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()
            
            padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
            
            unpadder = padding.PKCS7(128).unpadder()
            plain_data = unpadder.update(padded_data) + unpadder.finalize()
            
            return plain_data.decode('utf-8')
        except Exception as e:
            print(f"Decryption Error: {e}")
            return "[ENCRYPTED]"
