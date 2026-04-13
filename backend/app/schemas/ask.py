from typing import Annotated

from pydantic import BaseModel, Field, field_validator


class StatuteItem(BaseModel):
    title: str
    article: str
    content: str


class ConfusionItem(BaseModel):
    term: str
    difference: str


class LearningResultResponse(BaseModel):
    question: str
    concept: str
    elements: list[str]
    example: str
    mistakes: list[str]
    statutes: list[StatuteItem]
    confusions: list[ConfusionItem]


class AskHistoryItem(BaseModel):
    question: Annotated[str, Field(min_length=1, max_length=500)]
    answer: LearningResultResponse


class AskRequest(BaseModel):
    question: Annotated[str, Field(min_length=1, max_length=500)]
    history: list[AskHistoryItem] = Field(default_factory=list)

    @field_validator("question")
    @classmethod
    def validate_question(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("question must not be empty")
        return stripped
