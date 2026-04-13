from fastapi import APIRouter, HTTPException

from app.schemas.ask import AskRequest, LearningResultResponse
from app.services.llm_service import (
    LLMParseError,
    LLMServiceError,
    generate_learning_result,
)


router = APIRouter(prefix="/api", tags=["ask"])


@router.post("/ask", response_model=LearningResultResponse)
def ask_question(payload: AskRequest) -> LearningResultResponse:
    try:
        return generate_learning_result(payload.question, payload.history)
    except LLMServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except LLMParseError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
