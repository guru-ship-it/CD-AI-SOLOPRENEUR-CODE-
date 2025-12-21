import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Database URL from environment or default (PostgreSQL)
# Format: postgresql+asyncpg://user:password@host/dbname
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://compliance_user:changeme123@localhost/compliancedesk_db")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20
)

SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session
