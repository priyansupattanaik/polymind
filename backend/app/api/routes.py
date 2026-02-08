
from fastapi import APIRouter, HTTPException
import httpx
import asyncio
from app.services.council import CouncilService
from app.models.schemas import ChatRequest, ChatResponse, ModelInfo
from typing import List

router = APIRouter()
council_service = CouncilService()

@router.post("/council", response_model=ChatResponse)
async def conduct_council_meeting(request: ChatRequest):
    async with httpx.AsyncClient() as client:
        # 1. Select Active Models
        selected_members = council_service.get_active_members(request.active_models)

        # 2. Parallel Execution
        tasks = [council_service.fetch_model_response(client, member, request.prompt) for member in selected_members]
        results = await asyncio.gather(*tasks)

        # 3. Synthesis
        unified_answer = await council_service.synthesize_responses(client, request.prompt, results)

        # 4. Format Output
        return ChatResponse(
            unified_response=unified_answer,
            individual_responses=results,
            chairman_model="Llama 3.1 8B (Groq)"
        )

@router.get("/models", response_model=List[ModelInfo])
async def get_models():
    return council_service.get_models()
