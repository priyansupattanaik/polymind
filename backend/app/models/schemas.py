
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    prompt: str
    active_models: List[str]

class ChatResponse(BaseModel):
    unified_response: str
    individual_responses: List[Dict[str, Any]]
    chairman_model: str

class ModelInfo(BaseModel):
    id: str
    name: str
