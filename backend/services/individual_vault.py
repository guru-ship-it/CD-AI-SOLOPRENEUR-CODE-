
import os
import sqlite3
import json
from datetime import datetime

VAULT_DIR = os.path.join(os.path.dirname(__file__), "..", "user_vaults")

class IndividualVaultService:
    @staticmethod
    def _get_db_path(mobile_number: str):
        if not os.path.exists(VAULT_DIR):
            os.makedirs(VAULT_DIR)
        # Clean mobile number for filename
        clean_mob = mobile_number.replace("+", "").replace(" ", "")
        return os.path.join(VAULT_DIR, f"{clean_mob}.db")

    @staticmethod
    def init_user_vault(mobile_number: str):
        db_path = IndividualVaultService._get_db_path(mobile_number)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Table for PVC and non-DPDP documents
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_type TEXT NOT NULL,
                doc_path TEXT NOT NULL,
                issue_date TEXT,
                expiry_date TEXT,
                integrity_score REAL,
                verdict TEXT,
                metadata_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Profile table (Minimal)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS profile (
                mobile_number TEXT PRIMARY KEY,
                applicant_name TEXT,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()

    @staticmethod
    def save_pvc(mobile_number: str, name: str, pvc_data: dict, doc_path: str):
        IndividualVaultService.init_user_vault(mobile_number)
        db_path = IndividualVaultService._get_db_path(mobile_number)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Update Profile
        cursor.execute('''
            INSERT OR REPLACE INTO profile (mobile_number, applicant_name, last_updated)
            VALUES (?, ?, ?)
        ''', (mobile_number, name, datetime.utcnow().isoformat()))
        
        # Save Document
        cursor.execute('''
            INSERT INTO user_documents (doc_type, doc_path, issue_date, expiry_date, integrity_score, verdict, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            "PVC",
            doc_path,
            pvc_data.get("issue_date"),
            pvc_data.get("expiry_date"),
            pvc_data.get("integrity_score", 1.0),
            pvc_data.get("verdict", "GENUINE"),
            json.dumps(pvc_data)
        ))
        
        conn.commit()
        conn.close()
        print(f"✅ PVC saved to individual vault for {mobile_number}")

    @staticmethod
    def get_latest_pvc(mobile_number: str):
        db_path = IndividualVaultService._get_db_path(mobile_number)
        if not os.path.exists(db_path):
            return None
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM user_documents WHERE doc_type = 'PVC' ORDER BY created_at DESC LIMIT 1
        ''')
        row = cursor.fetchone()
        conn.close()
        return row
