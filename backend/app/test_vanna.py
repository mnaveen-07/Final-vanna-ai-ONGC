import asyncio
import httpx

async def main():
    print("Testing connection to vanna-service...")
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            res = await client.post('http://vanna-service:8001/generate-sql', json={'question': 'Show total orders created this month', 'profile_id': 1})
            print(f"Status: {res.status_code}")
            print(res.text)
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
