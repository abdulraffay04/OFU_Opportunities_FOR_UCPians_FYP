from rag import knowledge_base


class AcademicAdvisor:

    def search_policy(
        self,
        question
    ):

        results = knowledge_base.search(
            question,
            k=5
        )

        docs = results["documents"][0]

        return "\n\n".join(docs)


advisor = AcademicAdvisor()