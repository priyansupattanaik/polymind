import os
import httpx
import json
from typing import List, Dict, Any

class CouncilService:
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.nvidia_key = os.getenv("NVIDIA_API_KEY")
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")
        
        # Exact model mapping from user request
        self.models_config = {
            "groq-qwen": {
                "name": "Qwen 3 32B (Groq)", 
                "provider": "groq", 
                "model": "qwen/qwen3-32b",
                "params": {
                    "temperature": 0.6,
                    "max_completion_tokens": 1024,
                    "top_p": 0.95,
                    "reasoning_effort": "default"
                }
            },
            "groq-gptoss": {
                "name": "GPT OSS 20B (Groq)", 
                "provider": "groq", 
                "model": "openai/gpt-oss-20b",
                "params": {
                    "temperature": 1,
                    "max_completion_tokens": 1024,
                    "top_p": 1,
                    "reasoning_effort": "medium"
                }
            },
            "groq-versatile": {
                "name": "Llama 3.3 70B (Groq)", 
                "provider": "groq", 
                "model": "llama-3.3-70b-versatile",
                "params": {
                    "temperature": 1,
                    "max_completion_tokens": 1024,
                    "top_p": 1
                }
            },
            "or-aurora": {
                "name": "Aurora Alpha (OpenRouter)", 
                "provider": "openrouter", 
                "model": "openrouter/aurora-alpha",
                "params": { "max_tokens": 512 },
                "extra_body": { "reasoning": { "enabled": True } }
            },
            "or-trinity": {
                "name": "Trinity Large Preview (OpenRouter)", 
                "provider": "openrouter", 
                "model": "arcee-ai/trinity-large-preview:free",
                "params": { "max_tokens": 512 },
                "extra_body": { "reasoning": { "enabled": True } }
            },
            "or-liquid": {
                "name": "Liquid LFM 2.5 (OpenRouter)", 
                "provider": "openrouter", 
                "model": "liquid/lfm-2.5-1.2b-thinking:free",
                "params": { "max_tokens": 512 }
            },
            "or-seed": {
                "name": "Seedream 4.5 (OpenRouter)", 
                "provider": "openrouter", 
                "model": "bytedance-seed/seedream-4.5",
                "extra_body": { "modalities": ["image"] }
            },
            "nvidia-deepseek": {
                "name": "DeepSeek V3.1 (Nvidia)", 
                "provider": "nvidia", 
                "model": "deepseek-ai/deepseek-v3.1",
                "params": {
                    "temperature": 0.2,
                    "top_p": 0.7,
                    "max_tokens": 1024,
                    "seed": 42
                },
                "extra_body": {
                    "chat_template_kwargs": { "thinking": True }
                }
            }
        }

    def get_models(self):
        return [{"id": k, "name": v["name"]} for k, v in self.models_config.items()]

    def get_active_members(self, active_model_ids: List[str]):
        return [self.models_config[mid] for mid in active_model_ids if mid in self.models_config]

    async def fetch_model_response(self, client: httpx.AsyncClient, member: Dict[str, Any], prompt: str):
        try:
            if member["provider"] == "groq":
                return await self._call_provider(
                    client, 
                    "https://api.groq.com/openai/v1/chat/completions",
                    self.groq_key,
                    member,
                    prompt
                )
            elif member["provider"] == "nvidia":
                return await self._call_provider(
                    client,
                    "https://integrate.api.nvidia.com/v1/chat/completions",
                    self.nvidia_key,
                    member,
                    prompt
                )
            elif member["provider"] == "openrouter":
                return await self._call_provider(
                    client,
                    "https://openrouter.ai/api/v1/chat/completions",
                    self.openrouter_key,
                    member,
                    prompt
                )
            return {"name": member["name"], "content": "Provider not supported."}
        except Exception as e:
            print(f"Error fetching response from {member['name']}: {e}")
            return {"name": member["name"], "content": f"Model '{member['name']}' encountered an error. Please try again."}

    async def _call_provider(self, client: httpx.AsyncClient, url: str, key: str, member_config: Dict[str, Any], prompt: str):
        if not key:
             return {"name": member_config["name"], "content": "API Key missing."}
        
        # Base payload
        payload = {
            "model": member_config["model"],
            "messages": [{"role": "user", "content": prompt}],
            "stream": False # We are not streaming in this backend implementation yet
        }

        # Merge specific params (temperature, max_tokens, etc.)
        if "params" in member_config:
            payload.update(member_config["params"])

        # Merge extra body vars (reasoning, modalities, etc.)
        if "extra_body" in member_config:
            payload.update(member_config["extra_body"])

        try:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            
            # Handle standard OpenAI format choices
            if "choices" in data and len(data["choices"]) > 0:
                choice = data["choices"][0]
                message = choice.get("message", {})
                content = message.get("content", "") or ""
                
                # Fallback 1: reasoning_content (thinking models)
                if not content.strip():
                    content = message.get("reasoning_content", "") or ""
                
                # Fallback 2: reasoning field (some OpenRouter models)
                if not content.strip():
                    content = message.get("reasoning", "") or ""

                # Fallback 3: text field at choice level
                if not content.strip():
                    content = choice.get("text", "") or ""
                
                # Debug: log the full response structure when all fallbacks fail
                if not content.strip():
                    print(f"[DEBUG] Empty content for {member_config['name']}. Full choice: {json.dumps(choice, default=str)[:2000]}")
                
                # Handle Seedream/OpenRouter image generation response format
                if not content.strip() and "images" in message:
                    try:
                        images = message["images"]
                        if images and len(images) > 0:
                            image_url = images[0].get("image_url", {}).get("url")
                            if image_url:
                                content = f"![Dream Generated]({image_url})"
                    except Exception as e:
                        print(f"Error parsing image response: {e}")
                        content = "Error generating image."

                return {"name": member_config["name"], "content": content.strip() if content.strip() else "No response generated."}
            else:
                 print(f"[DEBUG] No choices for {member_config['name']}. Full data keys: {list(data.keys())}")
                 return {"name": member_config["name"], "content": "No content returned."}

        except httpx.HTTPStatusError as e:
            print(f"API Error for {member_config['name']}: {e.response.status_code} - {e.response.text}")
            return {"name": member_config["name"], "content": f"API returned an error (status {e.response.status_code}). Please try again later."}
        except Exception as e:
            print(f"Connection Error for {member_config['name']}: {e}")
            return {"name": member_config["name"], "content": "Connection error. Please check your network and try again."}

    async def synthesize_responses(self, client: httpx.AsyncClient, prompt: str, results: List[Dict[str, Any]]):
        if not results:
            return "No active council members available to deliberate."

        # Format the deliberations for the chairman
        deliberation_text = "\n\n".join([f"=== {r['name']} ===\n{r['content']}" for r in results])
        
        synthesis_prompt = f"""
        You are the Chairman of the AI Council.
        
        The user asked: "{prompt}"
        
        Here are the deliberations from the council members:
        {deliberation_text}
        
        Based on these inputs, provide a comprehensive, synthesized final answer. 
        Acknowledge reliable points, resolve conflicts, and give a unified conclusion.
        Do not just summarize; provide the best possible answer.
        """
        
        # Use Groq Llama 3.3 70B as the Chairman (Versatile)
        chairman_config = {
            "name": "Chairman",
            "model": "llama-3.3-70b-versatile",
            "params": {"temperature": 0.7, "max_completion_tokens": 1024}
        }
        
        chairman_response = await self._call_provider(
            client,
            "https://api.groq.com/openai/v1/chat/completions",
            self.groq_key,
            chairman_config,
            synthesis_prompt
        )
        
        return chairman_response["content"]
