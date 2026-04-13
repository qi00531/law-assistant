from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.notes import NoteCreateRequest, NoteListItemResponse, NoteResponse
from app.services.note_service import create_note, get_note_by_id, list_notes


router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note_route(payload: NoteCreateRequest, db: Session = Depends(get_db)) -> NoteResponse:
    return create_note(db, payload)


@router.get("", response_model=list[NoteListItemResponse])
def list_notes_route(db: Session = Depends(get_db)) -> list[NoteListItemResponse]:
    return list_notes(db)


@router.get("/{note_id}", response_model=NoteResponse)
def get_note_route(note_id: int, db: Session = Depends(get_db)) -> NoteResponse:
    note = get_note_by_id(db, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note
