from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.schemas.ask import ConfusionItem, StatuteItem


class NoteContent(BaseModel):
    concept: str
    elements: list[str]
    example: str
    mistakes: list[str]
    statutes: list[StatuteItem]
    confusions: list[ConfusionItem]


class NoteCreateRequest(BaseModel):
    title: Annotated[str, Field(min_length=1, max_length=200)]
    question: Annotated[str, Field(min_length=1, max_length=500)]
    summary: Annotated[str, Field(min_length=1, max_length=1000)]
    tags: list[str] = Field(default_factory=list)
    content: NoteContent

    @field_validator("title", "question", "summary")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("field must not be empty")
        return stripped

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: list[str]) -> list[str]:
        return [tag.strip() for tag in value if tag.strip()]


class NoteResponse(BaseModel):
    id: int
    title: str
    question: str
    summary: str
    tags: list[str]
    content: NoteContent
    created_at: datetime
    updated_at: datetime


class NoteListItemResponse(BaseModel):
    id: int
    title: str
    summary: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime
    key_points_count: int
    review_status: str
