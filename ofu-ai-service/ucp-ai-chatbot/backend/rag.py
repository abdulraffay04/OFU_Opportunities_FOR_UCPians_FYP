import os

import chromadb

from sentence_transformers import SentenceTransformer

from langchain_text_splitters import RecursiveCharacterTextSplitter

from pdf_loader import load_all_pdfs

from config import Config


class UCPKnowledgeBase:

    def __init__(self):

        self.embedding_model = (
            SentenceTransformer(
                "all-MiniLM-L6-v2"
            )
        )

        self.client = chromadb.PersistentClient(
            path=Config.CHROMA_DB_PATH
        )

        self.collection = (
            self.client.get_or_create_collection(
                name="ucp_documents"
            )
        )

    def build_database(self):

        docs = load_all_pdfs()

        splitter = (
            RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
        )

        count = 0

        for doc in docs:

            chunks = splitter.split_text(
                doc["content"]
            )

            for chunk in chunks:

                embedding = (
                    self.embedding_model.encode(
                        chunk
                    ).tolist()
                )

                self.collection.add(
                    ids=[str(count)],
                    documents=[chunk],
                    embeddings=[embedding],
                    metadatas=[
                        {
                            "source": doc["filename"],
                            "chunk_id": count
                        }
                    ]
                )

                count += 1

        print(
            f"{count} chunks indexed."
        )

    def search(
        self,
        query,
        k=5
    ):

        query_embedding = (
            self.embedding_model
            .encode(query)
            .tolist()
        )

        results = (
            self.collection.query(
                query_embeddings=[
                    query_embedding
                ],
                n_results=k
            )
        )

        return results


knowledge_base = UCPKnowledgeBase()