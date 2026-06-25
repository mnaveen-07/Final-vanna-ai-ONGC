import asyncio
from app.db.session import AsyncSessionLocal
from app.models.models import User
from sqlalchemy.future import select

async def main():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == "naveen@ongc.co.in"))
        user = result.scalars().first()
        if user:
            print(f"User found: {user.email}")
        else:
            print("User NOT found")

if __name__ == "__main__":
    asyncio.run(main())
