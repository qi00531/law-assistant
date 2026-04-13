import json

from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.notes import NoteContent, NoteCreateRequest, NoteListItemResponse, NoteResponse


def create_note(db: Session, payload: NoteCreateRequest) -> NoteResponse:
    note = Note(
        title=payload.title,
        question=payload.question,
        summary=payload.summary,
        tags=json.dumps(payload.tags, ensure_ascii=False),
        content=json.dumps(payload.content.model_dump(), ensure_ascii=False),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return _serialize_note(note)


def list_notes(db: Session) -> list[NoteListItemResponse]:
    notes = db.query(Note).order_by(Note.updated_at.desc(), Note.id.desc()).all()
    items: list[NoteListItemResponse] = []

    for note in notes:
        content = _parse_content(note.content)
        items.append(
            NoteListItemResponse(
                id=note.id,
                title=note.title,
                summary=note.summary,
                tags=_parse_tags(note.tags),
                created_at=note.created_at,
                updated_at=note.updated_at,
                key_points_count=len(content.elements),
                review_status="待复习",
            )
        )

    return items


def get_note_by_id(db: Session, note_id: int) -> NoteResponse | None:
    note = db.get(Note, note_id)
    if note is None:
        return None
    return _serialize_note(note)


def _serialize_note(note: Note) -> NoteResponse:
    return NoteResponse(
        id=note.id,
        title=note.title,
        question=note.question,
        summary=note.summary,
        tags=_parse_tags(note.tags),
        content=_parse_content(note.content),
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


def _parse_tags(raw_tags: str) -> list[str]:
    return json.loads(raw_tags) if raw_tags else []


def _parse_content(raw_content: str) -> NoteContent:
    return NoteContent.model_validate_json(raw_content)
