import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Database URL from environment or default (Fallback to SQLite for demo)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./compliance.db")

# engine = create_async_engine(
#     DATABASE_URL,
#     echo=False,
#     pool_size=10,
#     max_overflow=20
# )

# SQLite doesn't support pool_size/max_overflow the same way
if "sqlite" in DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=False)
else:
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
