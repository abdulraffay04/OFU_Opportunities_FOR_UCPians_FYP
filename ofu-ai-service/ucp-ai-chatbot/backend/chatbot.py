from groq import Groq

from rag import knowledge_base
from config import Config
from intent_router import detect_intent
from degree_planner import planner
from academic_advisor import advisor
from source_manager import source_manager
import os
from query_expander import expand_query

client = Groq(
    api_key=Config.GROQ_API_KEY
)


class UCPChatbot:

    def __init__(self):

        self.memory = []

        base_dir = os.path.dirname(
            os.path.abspath(__file__)
        )

        prompt_file = os.path.join(
            base_dir,
            "system_prompt.txt"
        )

        with open(
            prompt_file,
            "r",
            encoding="utf-8"
        ) as file:

            self.system_prompt = file.read()

    def retrieve_context(
        self,
        question,
        k=8
    ):

        try:

            results = knowledge_base.search(
                question
            )

            documents = (
                results["documents"][0]
            )

            context = "\n\n".join(
                documents
            )

            sources = (
                source_manager
                .format_sources(
                    results
                )
            )

            return context, sources

        except Exception as e:

            print(
                f"Retrieval Error: {e}"
            )

            return "", []

    def get_intent_context(
        self,
        question,
        intent
    ):

        extra_context = ""

        try:

            if intent == "degree":

                extra_context = (
                    planner.get_requirements(
                        question
                    )
                )

            elif intent == "scholarship":

                extra_context = (
                    advisor.search_policy(
                        "scholarship policy"
                    )
                )

            elif intent == "admission":

                extra_context = (
                    advisor.search_policy(
                        "admission policy"
                    )
                )

            elif intent == "fee":

                extra_context = (
                    advisor.search_policy(
                        "fee structure"
                    )
                )

            elif intent == "attendance":

                extra_context = (
                    advisor.search_policy(
                        "attendance policy"
                    )
                )

            elif intent == "hostel":

                extra_context = (
                    advisor.search_policy(
                        "hostel policy"
                    )
                )

            elif intent == "exam":

                extra_context = (
                    advisor.search_policy(
                        "exam rules"
                    )
                )

        except Exception as e:

            print(
                f"Intent Context Error: {e}"
            )

        return extra_context

    def build_messages(
        self,
        question,
        context
    ):

        messages = [

            {
                "role": "system",
                "content": self.system_prompt
            },

            {
                "role": "system",
                "content": f"""
Retrieved UCP Documents:

{context}

Instructions:

1. Use retrieved UCP documents first.

2. Never invent policies.

3. If information is missing,
   say that it was not found
   in the available documents.

4. Mention relevant policy
   information clearly.

5. Structure answers using
   bullet points when useful.
"""
            }

        ]

        messages.extend(
            self.memory[-10:]
        )

        messages.append(
            {
                "role": "user",
                "content": question
            }
        )

        return messages

    def ask(
        self,
        question
    ):

        intent = detect_intent(
            question
        )

        expanded_query = expand_query(question)

        context, sources = (
           self.retrieve_context(
               expanded_query
           )
        )

        extra_context = (
            self.get_intent_context(
                question,
                intent
            )
        )

        final_context = f"""
USER QUESTION:
{question}

DETECTED INTENT:
{intent}

DOCUMENT CONTEXT:
{context}

EXTRA CONTEXT:
{extra_context}
"""

        messages = (
            self.build_messages(
                question,
                final_context
            )
        )

        response = (
            client.chat.completions.create(
                model=Config.MODEL_NAME,
                messages=messages,
                temperature=0.2,
                max_tokens=1200
            )
        )

        answer = (
            response
            .choices[0]
            .message
            .content
        )



        self.memory.append(
            {
                "role": "user",
                "content": question
            }
        )

        self.memory.append(
            {
                "role": "assistant",
                "content": answer
            }
        )

        if len(self.memory) > 20:

            self.memory = (
                self.memory[-20:]
            )

        return answer

    def clear_memory(self):

        self.memory = []

    def get_history(self):

        return self.memory


chatbot = UCPChatbot()