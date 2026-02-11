
import httpx
import json
import asyncio

async def test():
    url = "http://localhost:8000/api/council"
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
    }
    data = {
        "prompt": "Test",
        "active_models": ["groq-qwen"],
        "dream_mode": False
    }

    try:
        print(f"Sending POST to {url}...")
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data, timeout=30.0)
            with open("output.txt", "w") as f:
                f.write(f"Status Code: {response.status_code}\n")
                f.write("Headers:\n")
                for k, v in response.headers.items():
                    f.write(f"  {k}: {v}\n")
                f.write("\nBody:\n")
                f.write(response.text)
            print("Output written to output.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
