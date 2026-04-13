import unittest
from unittest.mock import patch

from pydantic import ValidationError

from app.schemas.ask import AskRequest
from app.services.llm_service import _build_user_prompt, _to_response, generate_learning_result


class AskSchemaAndLlmServiceTests(unittest.TestCase):
    def test_ask_request_accepts_history_items(self):
        payload = {
            "question": "继续解释撤销权和解除权的区别",
            "history": [
                {
                    "question": "什么是撤销权？",
                    "answer": {
                        "question": "什么是撤销权？",
                        "concept": "撤销权是对可撤销民事法律行为的救济方式。",
                        "elements": ["存在可撤销事由"],
                        "example": "受欺诈签约一方可请求撤销。",
                        "mistakes": ["把撤销权和解除权混同"],
                        "statutes": [
                            {
                                "title": "《中华人民共和国民法典》",
                                "article": "第一百四十七条",
                                "content": "基于重大误解实施的民事法律行为，行为人有权请求人民法院或者仲裁机构予以撤销。",
                            }
                        ],
                        "confusions": [],
                    },
                }
            ],
        }

        parsed = AskRequest.model_validate(payload)

        self.assertEqual(parsed.history[0].question, "什么是撤销权？")
        self.assertEqual(parsed.history[0].answer.statutes[0].article, "第一百四十七条")

    def test_to_response_parses_structured_statutes(self):
        parsed = _to_response(
            "继续解释撤销权和解除权的区别",
            {
                "question": "继续解释撤销权和解除权的区别",
                "concept": "解除权针对合同关系消灭。",
                "elements": ["存在法定或约定解除事由"],
                "example": "一方迟延履行后，对方可依法解除合同。",
                "mistakes": ["把解除权与撤销权适用对象混同"],
                "statutes": [
                    {
                        "title": "《中华人民共和国民法典》",
                        "article": "第五百六十三条",
                        "content": "有下列情形之一的，当事人可以解除合同。",
                    }
                ],
                "confusions": [],
            },
        )

        self.assertEqual(parsed.statutes[0].title, "《中华人民共和国民法典》")
        self.assertEqual(parsed.statutes[0].article, "第五百六十三条")
        self.assertTrue(parsed.statutes[0].content.startswith("有下列情形之一"))

    def test_build_user_prompt_appends_retrieved_context(self):
        prompt = _build_user_prompt(
            "什么是不安抗辩权？",
            [],
            [
                "《中华人民共和国民法典》第五百二十七条：应当先履行债务的当事人，有确切证据证明对方有下列情形之一的，可以中止履行。",
                "先履行一方发现对方明显丧失履约能力时，可以依法中止履行。",
            ],
        )

        self.assertIn("检索到的相关法律材料", prompt)
        self.assertIn("材料1", prompt)
        self.assertIn("第五百二十七条", prompt)

    @patch("app.services.llm_service.LLM_ENABLED", True)
    @patch("app.services.llm_service._call_llm")
    @patch("app.services.llm_service.retrieve_relevant_chunks")
    def test_generate_learning_result_falls_back_when_retrieval_fails(
        self,
        mock_retrieve,
        mock_call_llm,
    ):
        mock_retrieve.side_effect = RuntimeError("chroma unavailable")
        mock_call_llm.return_value = {
            "question": "什么是不安抗辩权？",
            "concept": "不安抗辩权是在先履行一方发现对方履约风险时依法中止履行的权利。",
            "elements": ["存在双务合同关系", "一方应当先履行"],
            "example": "甲应先交货，但发现乙已严重资不抵债，甲可暂缓交货。",
            "mistakes": ["没有确切证据时不能当然中止履行"],
            "statutes": [
                {
                    "title": "《中华人民共和国民法典》",
                    "article": "第五百二十七条",
                    "content": "应当先履行债务的当事人，有确切证据证明对方有下列情形之一的，可以中止履行。",
                }
            ],
            "confusions": [],
        }

        result = generate_learning_result("什么是不安抗辩权？")

        self.assertEqual(result.question, "什么是不安抗辩权？")
        mock_call_llm.assert_called_once_with("什么是不安抗辩权？", [], [])


if __name__ == "__main__":
    unittest.main()
