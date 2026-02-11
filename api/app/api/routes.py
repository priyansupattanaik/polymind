
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
    # Sanitize prompt
    clean_prompt = request.prompt.strip()
    if not clean_prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    # Enforce 500 character limit
    if len(clean_prompt) > 500:
        raise HTTPException(status_code=400, detail="Input limit exceeded. Please limit your prompt to 500 characters.")

    async with httpx.AsyncClient() as client:
        # 0. Dream Mode Override (use local var to avoid mutating the request)
        models_to_use = ["or-seed"] if request.dream_mode else request.active_models

        # 1. Select Active Models
        selected_members = council_service.get_active_members(models_to_use)

        # 2. Parallel Execution
        tasks = [council_service.fetch_model_response(client, member, clean_prompt) for member in selected_members]
        results = await asyncio.gather(*tasks)

        # 3. Synthesis
        if request.dream_mode:
            # In Dream Mode, return the single model's response directly
            unified_answer = results[0]["content"] if results else "Dream generation failed."
            chairman_name = "Seedream Protocol"
        else:
            unified_answer = await council_service.synthesize_responses(client, clean_prompt, results)
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
