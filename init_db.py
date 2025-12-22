
import asyncio
from backend.database import engine, Base
from backend.models import Verification, Grievance, Tenant, Incident

async def init_db():
    print("🚀 Initializing Compliance Database...")
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database Initialized Successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
