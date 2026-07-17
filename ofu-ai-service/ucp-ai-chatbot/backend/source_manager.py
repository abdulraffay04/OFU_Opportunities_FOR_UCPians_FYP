class SourceManager:

    def format_sources(
        self,
        results
    ):

        sources = []

        if "metadatas" not in results:
            return []

        metadata_list = (
            results["metadatas"][0]
        )

        for item in metadata_list:

            source = (
                item.get(
                    "source",
                    "Unknown"
                )
            )

            if source not in sources:

                sources.append(
                    source
                )

        return sources


source_manager = (
    SourceManager()
)