
import asyncio
from backend.database import engine
from sqlalchemy import select
from backend.models import Verification

async def verify_masking():
    print("🛡️ Verifying NRIC Masking in Database...")
    async with engine.connect() as conn:
        result = await conn.execute(select(Verification))
        rows = result.fetchall()
        
        found_sg = False
        for row in rows:
            if "*" in row.applicant_id:
                print(f"✅ Masking Verified: {row.applicant_name} -> {row.applicant_id}")
                found_sg = True
        
        if not found_sg:
            print("⚠️ No masked IDs found. This is normal if no SG users were processed yet.")
        
        print(f"📊 Total Verifications: {len(rows)}")

if __name__ == "__main__":
    asyncio.run(verify_masking())
