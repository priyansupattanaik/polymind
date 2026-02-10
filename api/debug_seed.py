import asyncio
import os
import sys
from dotenv import load_dotenv
import json

# Add app to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.council import CouncilService
import httpx

# Load env vars from parent directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

async def main():
    service = CouncilService()
    
    if not service.openrouter_key:
        print("Error: OPENROUTER_API_KEY not found in env", flush=True)
        return

    config = service.models_config["or-seed"]
    print(f"Testing model: {config['name']}", flush=True)

    async with httpx.AsyncClient() as client:
        url = "https://openrouter.ai/api/v1/chat/completions"
        payload = {
            "model": config["model"],
            "messages": [{"role": "user", "content": "Generate an image of a red apple"}],
            "stream": False
        }
        if "extra_body" in config:
            payload.update(config["extra_body"])

        print(f"Payload: {json.dumps(payload)}", flush=True)

        try:
            print("Sending request...", flush=True)
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {service.openrouter_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000", 
                    "X-Title": "PolyMind Debug"
                },
                json=payload,
                timeout=60.0
            )
            print(f"Status: {response.status_code}", flush=True)
            
            with open("api/debug_response.json", "w", encoding="utf-8") as f:
                f.write(response.text)
            
            print("Response saved to api/debug_response.json", flush=True)
            
        except Exception as e:
            print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
