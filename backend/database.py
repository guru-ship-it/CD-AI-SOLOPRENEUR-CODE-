import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# --- APPLICATION DATABASE (Operational Data) ---
# Use /tmp/ for Firebase (Cloud Run/Functions) to avoid Read-Only FS errors
IS_WINDOWS = os.name == "nt"
DB_PATH_APP = "./main.db" if IS_WINDOWS else "/tmp/main.db"
DB_PATH_COMPLIANCE = "./compliance_vault.db" if IS_WINDOWS else "/tmp/compliance_vault.db"

DATABASE_URL_APP = os.getenv("DATABASE_URL_APP", f"sqlite+aiosqlite:///{DB_PATH_APP}")

engine_app = create_async_engine(DATABASE_URL_APP, echo=False)
SessionLocalApp = async_sessionmaker(bind=engine_app, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocalApp() as session:
        yield session

# --- COMPLIANCE VAULT (Strict Retention - Audit Logs & Consents) ---
DATABASE_URL_COMPLIANCE = os.getenv("DATABASE_URL_COMPLIANCE", f"sqlite+aiosqlite:///{DB_PATH_COMPLIANCE}")

engine_compliance = create_async_engine(DATABASE_URL_COMPLIANCE, echo=False)
SessionLocalCompliance = async_sessionmaker(bind=engine_compliance, class_=AsyncSession, expire_on_commit=False)

class BaseCompliance(DeclarativeBase):
    pass

async def get_compliance_db():
    async with SessionLocalCompliance() as session:
        yield session

