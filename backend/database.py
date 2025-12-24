import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# --- APPLICATION DATABASE (Operational Data) ---
# Use /tmp/ for Firebase Cloud Functions (Read-Only FS)
DATABASE_URL_APP = os.getenv("DATABASE_URL_APP", "sqlite+aiosqlite:////tmp/main.db")

engine_app = create_async_engine(DATABASE_URL_APP, echo=False)
SessionLocalApp = async_sessionmaker(bind=engine_app, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocalApp() as session:
        yield session

# --- COMPLIANCE VAULT (Strict Retention - Audit Logs & Consents) ---
# Physically separate database file
DATABASE_URL_COMPLIANCE = os.getenv("DATABASE_URL_COMPLIANCE", "sqlite+aiosqlite:////tmp/compliance_vault.db")

engine_compliance = create_async_engine(DATABASE_URL_COMPLIANCE, echo=False)
SessionLocalCompliance = async_sessionmaker(bind=engine_compliance, class_=AsyncSession, expire_on_commit=False)

class BaseCompliance(DeclarativeBase):
    pass

async def get_compliance_db():
    async with SessionLocalCompliance() as session:
        yield session

