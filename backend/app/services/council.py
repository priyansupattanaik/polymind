
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class CouncilMember:
    def __init__(self, id: str, name: str, provider: str, url: str, model_id: str, headers: Dict, payload_template: Dict):
        self.id = id
        self.name = name
        self.provider = provider
        self.url = url
        self.model_id = model_id
        self.headers = headers
        self.payload_template = payload_template

# Define Headers
groq_headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {settings.GROQ_API_KEY}"
}

nvidia_headers = {
    "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

openrouter_headers = {
    "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

# Register Models
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
    ),
    CouncilMember(
        id="openrouter-trinity",
        name="Trinity Large (OpenRouter)",
        provider="openrouter",
        url="https://openrouter.ai/api/v1/chat/completions",
        model_id="arcee-ai/trinity-large-preview:free",
        headers=openrouter_headers,
        payload_template={"reasoning": {"enabled": True}}
    )
]

class CouncilService:
    @staticmethod
    async def fetch_model_response(client: httpx.AsyncClient, member: CouncilMember, prompt: str) -> Dict[str, Any]:
        payload = member.payload_template.copy()
        payload["model"] = member.model_id
        payload["messages"] = [{"role": "user", "content": prompt}]
        payload["stream"] = False

        try:
            response = await client.post(member.url, headers=member.headers, json=payload, timeout=60.0)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return {"id": member.id, "name": member.name, "content": content, "status": "success"}
        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP Error {e.response.status_code}: {e.response.text}"
            if e.response.status_code == 401:
                error_msg = "Authentication Failed: Please check your API Key."
            elif e.response.status_code == 402:
                error_msg = "Payment Required: Insufficient credits."
            return {"id": member.id, "name": member.name, "content": f"Error: {error_msg}", "status": "error"}
        except Exception as e:
            return {"id": member.id, "name": member.name, "content": f"Error: {str(e)}", "status": "error"}

    @staticmethod
    async def synthesize_responses(client: httpx.AsyncClient, prompt: str, responses: List[Dict[str, Any]]) -> str:
        max_response_len = 500
        truncated_prompt = prompt[:1000] + "... (truncated)" if len(prompt) > 1000 else prompt

        active_responses_count = sum(1 for r in responses if r["status"] == "success")
        if active_responses_count > 0:
            max_response_len = max(200, 3000 // active_responses_count)

        council_report = ""
        for r in responses:
            if r["status"] == "success":
                content_snippet = r['content'][:max_response_len]
                if len(r['content']) > max_response_len:
                    content_snippet += "... (truncated for brevity)"
                council_report += f"--- OPINION FROM {r['name']} ---\n{content_snippet}\n\n"
        
        system_prompt = (
            "You are the Chairman of the 'PolyMind' AI Council. "
            "Synthesize these responses into a single, cohesive answer. "
            "Identify consensus, resolve contradictions. "
            "Do not explicitly mention 'The council says' unless necessary. "
            "CRITICAL: Do not hallucinate information. Only use the provided Council Responses as your source of truth. "
            "If the council members do not know the answer, state that you do not know. "
            "Prioritize accuracy over creativity."
        )
        
        synthesis_payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Original Query: {truncated_prompt}\n\nCouncil Responses:\n{council_report}"}
            ],
            "temperature": 0.6,
            "max_completion_tokens": 1024
        }

        try:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=groq_headers,
                json=synthesis_payload,
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"Synthesis Exception: {str(e)}")
            return f"Synthesis failed: {str(e)}"

    @staticmethod
    def get_models() -> List[Dict[str, str]]:
        return [{"id": m.id, "name": m.name} for m in MODELS]

    @staticmethod
    def get_active_members(active_model_ids: List[str]) -> List[CouncilMember]:
        selected = [m for m in MODELS if m.id in active_model_ids]
        if not selected:
             selected = [m for m in MODELS if m.id == "groq-llama8b"]
        return selected

council_service = CouncilService()
