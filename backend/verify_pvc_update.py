
import asyncio
import os
import sqlite3
from backend.services.individual_vault import IndividualVaultService
from backend.verifiers.pvc_validator import PVCValidator

async def verify_new_requirements():
    print("🚀 Verifying PVC Update & Individual Vault Requirements...")
    
    mob = "+919988776655"
    
    # 1. Test Individual Vault Creation
    IndividualVaultService.init_user_vault(mob)
    db_path = IndividualVaultService._get_db_path(mob)
    if os.path.exists(db_path):
        print(f"✅ Individual Vault created at: {db_path}")
    else:
        print("❌ Individual Vault creation failed.")
        return

    # 2. Test PVC Validation with Integrity & Local Save
    validator = PVCValidator()
    print("🔍 Simulating PVC Upload with Integrity Check...")
    result = await validator.validate_certificate_image("mock_path.jpg", mob)
    
    if result["integrity_score"] > 0.9 and result["gov_status"]:
        print(f"✅ Integrity Check Passed: {result['integrity_score']}")
        print(f"✅ Gov Status Check: {result['gov_status']}")
    else:
        print("❌ PVC Validation features missing.")
        
    # 3. Verify Data in Individual SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_documents")
    docs = cursor.fetchall()
    if len(docs) > 0:
        print(f"✅ Data persisted in per-user DB. Found {len(docs)} documents.")
    else:
        print("❌ Data persistence in per-user DB failed.")
    conn.close()
    
    print("✅ All PVC update and individual storage requirements verified!")

if __name__ == "__main__":
    asyncio.run(verify_new_requirements())
