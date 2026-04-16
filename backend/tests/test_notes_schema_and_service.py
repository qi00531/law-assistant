import unittest

from app.db.init_db import init_db
from app.db.session import SessionLocal
from app.schemas.notes import NoteCreateRequest
from app.services.note_service import create_note


class NotesSchemaAndServiceTests(unittest.TestCase):
    def test_note_create_request_accepts_structured_statutes(self):
        payload = {
            "title": "共同犯罪",
            "question": "共同犯罪的构成条件",
            "summary": "共同犯罪的简要总结",
            "tags": ["刑法"],
            "content": {
                "concept": "共同犯罪是二人以上共同故意犯罪。",
                "elements": ["主体为二人以上", "存在共同故意"],
                "example": "甲乙共同实施盗窃。",
                "mistakes": ["误把同时犯当共同犯罪"],
                "statutes": [
                    {
                        "title": "中华人民共和国刑法",
                        "article": "第二十五条",
                        "content": "共同犯罪是指二人以上共同故意犯罪。",
                    }
                ],
                "confusions": [{"term": "共同犯罪", "difference": "不同于同时犯"}],
            },
        }

        parsed = NoteCreateRequest.model_validate(payload)

        self.assertEqual(parsed.content.statutes[0].article, "第二十五条")
        self.assertEqual(parsed.content.statutes[0].title, "中华人民共和国刑法")

    def test_create_note_persists_structured_statutes(self):
        init_db()
        payload = NoteCreateRequest.model_validate(
            {
                "title": "共同犯罪",
                "question": "共同犯罪的构成条件",
                "summary": "共同犯罪的简要总结",
                "tags": ["刑法"],
                "content": {
                    "concept": "共同犯罪是二人以上共同故意犯罪。",
                    "elements": ["主体为二人以上", "存在共同故意"],
                    "example": "甲乙共同实施盗窃。",
                    "mistakes": ["误把同时犯当共同犯罪"],
                    "statutes": [
                        {
                            "title": "中华人民共和国刑法",
                            "article": "第二十五条",
                            "content": "共同犯罪是指二人以上共同故意犯罪。",
                        }
                    ],
                    "confusions": [{"term": "共同犯罪", "difference": "不同于同时犯"}],
                },
            }
        )

        with SessionLocal() as db:
            note = create_note(db, payload)

        self.assertEqual(note.content.statutes[0].article, "第二十五条")
        self.assertEqual(note.content.confusions[0].term, "共同犯罪")


if __name__ == "__main__":
    unittest.main()
