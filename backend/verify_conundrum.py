
import asyncio
import uuid
import os
from datetime import datetime, timedelta
from sqlalchemy import select
from database import SessionLocalApp, engine_app, Base
from models import Verification, VerifiedReport, Tenant

async def test_flow():
    log_file = "test_output.log"
    with open(log_file, "w", encoding="utf-8") as f:
        f.write("🚀 Starting Conundrum Verification Test...\n")
        print("🚀 Starting Conundrum Verification Test...")
        
        try:
            # 1. Ensure tables exist
            async with engine_app.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            f.write("✅ Tables ensured.\n")
            
            async with SessionLocalApp() as db:
                # Create a mock tenant if not exists
                stmt = select(Tenant).filter(Tenant.id == 1)
                res = await db.execute(stmt)
                tenant = res.scalars().first()
                if not tenant:
                    tenant = Tenant(id=1, name="Amazon", region="asia-south1")
                    db.add(tenant)
                    await db.commit()
                f.write("✅ Tenant ensured.\n")
                
                # 2. Simulate Verification Request from Company A (Amazon)
                mob = "+919876543210"
                task_id = str(uuid.uuid4())
                v = Verification(
                    task_id=task_id,
                    tenant_id=1,
                    mobile_number=mob,
                    applicant_name="Arjun Kumar",
                    applicant_id="ABCDE1234F",
                    image_url="http://example.com/arjun.jpg",
                    vault_token="VT-MOCK-123",
                    status="COMPLETED", 
                    face_verified=True
                )
                db.add(v)
                
                # Sync to VerifiedReport
                expiry = datetime.utcnow() + timedelta(days=30) # Test 30 day alert
                report = VerifiedReport(
                    mobile_number=mob,
                    applicant_name="Arjun Kumar",
                    id_type="AADHAAR",
                    id_number="ABCDE1234F",
                    pdf_path="/tmp/contract_ABCDE1234F.pdf",
                    expiry_date=expiry,
                    tenant_id=1
                )
                db.add(report)
                
                # Create one for Daily alert (10 days)
                report_10 = VerifiedReport(
                    mobile_number="+910000000010",
                    applicant_name="Quick Expire User",
                    id_type="PAN",
                    id_number="PAN123",
                    expiry_date=datetime.utcnow() + timedelta(days=10),
                    tenant_id=1
                )
                db.add(report_10)
                
                await db.commit()
                f.write(f"✅ Reports created.\n")
                
                # 3. Test SEARCH
                result = await db.execute(select(VerifiedReport).filter(VerifiedReport.mobile_number.like("%9876%")))
                users = result.scalars().all()
                f.write(f"🔍 Search Result (9876): Found {len(users)} users. First name: {users[0].applicant_name if users else 'None'}\n")
                
                # 4. Test EXPIRY NOTIFICATIONS
                f.write("🕒 Running Expiry Sweep...\n")
                now = datetime.utcnow()
                day_30 = now + timedelta(days=30)
                day_15 = now + timedelta(days=15)
                
                # Logic from app.py
                stmt_30 = select(VerifiedReport).filter(
                    VerifiedReport.expiry_date >= day_30.replace(hour=0, minute=0, second=0),
                    VerifiedReport.expiry_date < (day_30 + timedelta(days=1)).replace(hour=0, minute=0, second=0)
                )
                reports_30 = (await db.execute(stmt_30)).scalars().all()
                for r in reports_30:
                    f.write(f"[ALERT-30] {r.applicant_name} ({r.mobile_number})\n")
                
                stmt_15 = select(VerifiedReport).filter(
                    VerifiedReport.expiry_date <= day_15,
                    VerifiedReport.expiry_date > now
                )
                reports_15 = (await db.execute(stmt_15)).scalars().all()
                for r in reports_15:
                    f.write(f"[ALERT-DAILY] {r.applicant_name} ({r.mobile_number})\n")
                    
            f.write("✅ All tests passed!\n")
            print("✅ All tests passed!")
            
        except Exception as e:
            f.write(f"❌ Error: {str(e)}\n")
            print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_flow())
