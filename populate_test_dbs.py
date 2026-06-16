import asyncio
import os

async def populate_mysql():
    import aiomysql
    try:
        conn = await aiomysql.connect(
            host='mysql-test', port=3306,
            user='root', password='mysql_pass', db='test_db'
        )
        async with conn.cursor() as cur:
            await cur.execute("DROP TABLE IF EXISTS users;")
            await cur.execute("""
                CREATE TABLE users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    department VARCHAR(255)
                );
            """)
            await cur.execute("TRUNCATE TABLE users;")
            await cur.execute("INSERT INTO users (name, department) VALUES ('Alice', 'Engineering'), ('Bob', 'HR'), ('Charlie', 'Sales');")
            await conn.commit()
            print("MySQL populated")
    except Exception as e:
        print(f"MySQL error: {e}")

async def populate_mongodb():
    import motor.motor_asyncio
    try:
        uri = "mongodb://mongo_user:mongo_pass@mongodb-test:27017/test_db?authSource=admin"
        client = motor.motor_asyncio.AsyncIOMotorClient(uri)
        db = client['test_db']
        await db.users.drop()
        await db.users.insert_many([
            {'name': 'Alice', 'department': 'Engineering'},
            {'name': 'Bob', 'department': 'HR'},
            {'name': 'Charlie', 'department': 'Sales'}
        ])
        print("MongoDB populated")
    except Exception as e:
        print(f"MongoDB error: {e}")

async def main():
    await populate_mysql()
    await populate_mongodb()

if __name__ == '__main__':
    asyncio.run(main())
