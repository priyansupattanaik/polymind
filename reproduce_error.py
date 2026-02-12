
import httpx
import asyncio
import os
import json

async def test():
    url = "http://localhost:8001/api/council"
    headers = {"Content-Type": "application/json"}
    data = {
        "prompt": "Test",
        "active_models": ["or-aurora"],
        "dream_mode": False
    }

    try:
        async with httpx.AsyncClient() as client:
            print(f"Sending request to {url}...")
            response = await client.post(url, headers=headers, json=data, timeout=60.0)
            print(f"Status: {response.status_code}")
            # Print only individual responses to see the error
            data = response.json()
            print(json.dumps(data.get("individual_responses", []), indent=2))
    except Exception as e:
        print(f"Script Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
