from rag import knowledge_base


class DegreePlanner:

    def get_requirements(
        self,
        program
    ):

        query = f"""
        {program}
        credit hours
        graduation requirements
        """

        results = knowledge_base.search(
            query,
            k=5
        )

        docs = results["documents"][0]

        return "\n\n".join(
            docs
        )


planner = DegreePlanner()