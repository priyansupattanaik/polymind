
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
    # Enforce 500 character limit
    if len(request.prompt) > 500:
        raise HTTPException(status_code=400, detail="Input limit exceeded. Please limit your prompt to 500 characters.")

    async with httpx.AsyncClient() as client:
        # 0. Dream Mode Override
        if request.dream_mode:
            request.active_models = ["or-seed"]

        # 1. Select Active Models
        selected_members = council_service.get_active_members(request.active_models)

        # 2. Parallel Execution
        tasks = [council_service.fetch_model_response(client, member, request.prompt) for member in selected_members]
        results = await asyncio.gather(*tasks)

        # 3. Synthesis
        if request.dream_mode:
            # In Dream Mode, return the single model's response directly
            unified_answer = results[0]["content"] if results else "Dream generation failed."
            chairman_name = "Seedream Protocol"
        else:
            unified_answer = await council_service.synthesize_responses(client, request.prompt, results)
            chairman_name = "Llama 3.3 70B (Groq)"

        # 4. Format Output
        return ChatResponse(
            unified_response=unified_answer,
            individual_responses=results,
            chairman_model=chairman_name
        )

@router.get("/models", response_model=List[ModelInfo])
async def get_models():
    return council_service.get_models()
