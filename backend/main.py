import os
import asyncio
import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI(title="PolyMind API")

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

# --- Configuration based on provided CURLs ---

class CouncilMember:
    def __init__(self, id: str, name: str, provider: str, url: str, model_id: str, headers: Dict, payload_template: Dict):
        self.id = id
        self.name = name
        self.provider = provider
        self.url = url
        self.model_id = model_id
        self.headers = headers
        self.payload_template = payload_template

# Define Groq Headers
groq_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GROQ_API_KEY}"
}

# Define Nvidia Headers
nvidia_headers = {
    "Authorization": f"Bearer {NVIDIA_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

# Register Models (Council Members)
# We map the exact parameters from your CURL commands here.
MODELS = [
    CouncilMember(
        id="groq-qwen",
        name="Qwen 3 32B (Groq)",
        provider="groq",
        url="https://api.groq.com/openai/v1/chat/completions",
        model_id="qwen/qwen3-32b",
        headers=groq_headers,
        payload_template={"temperature": 0.6, "max_completion_tokens": 4096, "top_p": 0.95, "stream": False, "reasoning_effort": "default"}
    ),
    CouncilMember(
        id="groq-llama8b",
        name="Llama 3.1 8B (Groq)",
        provider="groq",
        url="https://api.groq.com/openai/v1/chat/completions",
        model_id="llama-3.1-8b-instant",
        headers=groq_headers,
        payload_template={"temperature": 1, "max_completion_tokens": 1024, "top_p": 1, "stream": False}
    ),
    CouncilMember(
        id="groq-llama17b",
        name="Llama 4 Scout 17B (Groq)",
        provider="groq",
        url="https://api.groq.com/openai/v1/chat/completions",
        model_id="meta-llama/llama-4-scout-17b-16e-instruct",
        headers=groq_headers,
        payload_template={"temperature": 1, "max_completion_tokens": 1024, "top_p": 1, "stream": False}
    ),
    CouncilMember(
        id="groq-kimi",
        name="Kimi K2 (Groq)",
        provider="groq",
        url="https://api.groq.com/openai/v1/chat/completions",
        model_id="moonshotai/kimi-k2-instruct-0905",
        headers=groq_headers,
        payload_template={"temperature": 0.6, "max_completion_tokens": 4096, "top_p": 1, "stream": False}
    ),
    CouncilMember(
        id="groq-gptoss",
        name="GPT OSS 120B (Groq)",
        provider="groq",
        url="https://api.groq.com/openai/v1/chat/completions",
        model_id="openai/gpt-oss-120b",
        headers=groq_headers,
        payload_template={"temperature": 1, "max_completion_tokens": 8192, "top_p": 1, "stream": False, "reasoning_effort": "medium"}
    ),
    CouncilMember(
        id="nvidia-minimax",
        name="Minimax M2.1 (Nvidia)",
        provider="nvidia",
        url="https://integrate.api.nvidia.com/v1/chat/completions",
        model_id="minimaxai/minimax-m2.1",
        headers=nvidia_headers,
        payload_template={"temperature": 1, "top_p": 0.7, "max_tokens": 4096, "stream": False, "seed": 42}
    ),
    CouncilMember(
        id="nvidia-step",
        name="Step 3.5 Flash (Nvidia)",
        provider="nvidia",
        url="https://integrate.api.nvidia.com/v1/chat/completions",
        model_id="stepfun-ai/step-3.5-flash",
        headers=nvidia_headers,
        payload_template={"temperature": 1, "top_p": 0.9, "max_tokens": 16384, "stream": False}
    ),
    CouncilMember(
        id="nvidia-mistral",
        name="Devstral 123B (Nvidia)",
        provider="nvidia",
        url="https://integrate.api.nvidia.com/v1/chat/completions",
        model_id="mistralai/devstral-2-123b-instruct-2512",
        headers=nvidia_headers,
        payload_template={"temperature": 0.15, "top_p": 0.95, "max_tokens": 8192, "seed": 42, "stream": False}
    )
]

# Request Models
class ChatRequest(BaseModel):
    prompt: str
    active_models: List[str] # List of model IDs to consult

class ChatResponse(BaseModel):
    unified_response: str
    individual_responses: Dict[str, str]

async def fetch_model_response(client: httpx.AsyncClient, member: CouncilMember, prompt: str) -> Dict:
    """
    Executes the request for a specific council member using their specific config.
    """
    payload = member.payload_template.copy()
    payload["model"] = member.model_id
    payload["messages"] = [{"role": "user", "content": prompt}]
    
    # Remove 'stream' if it exists in template as we handle sync for aggregation
    payload["stream"] = False

    try:
        response = await client.post(member.url, headers=member.headers, json=payload, timeout=60.0)
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return {"id": member.id, "name": member.name, "content": content, "status": "success"}
    except Exception as e:
        print(f"Error fetching {member.name}: {e}")
        return {"id": member.id, "name": member.name, "content": f"Error: {str(e)}", "status": "error"}

async def synthesize_responses(client: httpx.AsyncClient, prompt: str, responses: List[Dict]) -> str:
    """
    Uses the Chairman Model (Llama 3.1 8B on Groq) to unify the answers.
    """
    # Format the inputs for the synthesizer
    council_report = ""
    for r in responses:
        if r["status"] == "success":
            council_report += f"--- OPINION FROM {r['name']} ---\n{r['content']}\n\n"
    
    system_prompt = (
        "You are the Chairman of the 'PolyMind' AI Council. "
        "You have received input from several distinct AI models regarding a user query. "
        "Your task is to synthesize these responses into a single, cohesive, and high-quality answer. "
        "1. Identify the consensus among the models. "
        "2. Resolve any contradictions based on logic. "
        "3. Provide a clear, direct final response to the user. "
        "Do not explicitly mention 'The council says' or 'Model X said' unless necessary for context. Just give the best answer."
    )
    
    synthesis_payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Original Query: {prompt}\n\nCouncil Responses:\n{council_report}"}
        ],
        "temperature": 0.6,
        "max_completion_tokens": 2048
    }

    try:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=groq_headers,
            json=synthesis_payload,
            timeout=60.0
        )
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Synthesis failed: {str(e)}. However, here is the raw data: {council_report[:500]}..."

@app.post("/api/council", response_model=ChatResponse)
async def conduct_council_meeting(request: ChatRequest):
    async with httpx.AsyncClient() as client:
        # 1. Select Active Models
        selected_members = [m for m in MODELS if m.id in request.active_models]
        if not selected_members:
             # If none selected, default to Llama 8b
             selected_members = [m for m in MODELS if m.id == "groq-llama8b"]

        # 2. Parallel Execution (The Council Meeting)
        tasks = [fetch_model_response(client, member, request.prompt) for member in selected_members]
        results = await asyncio.gather(*tasks)

        # 3. Synthesis (The Chairman's Decision)
        unified_answer = await synthesize_responses(client, request.prompt, results)

        # 4. Format Output
        individual_responses_map = {r["name"]: r["content"] for r in results}
        
        return ChatResponse(
            unified_response=unified_answer,
            individual_responses=individual_responses_map
        )

@app.get("/api/models")
async def get_models():
    """Returns the list of available models for the frontend toggle."""
    return [{"id": m.id, "name": m.name} for m in MODELS]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)