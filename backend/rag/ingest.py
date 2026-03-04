"""Load, chunk, and embed medical knowledge base documents into ChromaDB."""
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

KNOWLEDGE_BASE_DIR = Path(__file__).parent / "knowledge_base"
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
COLLECTION_NAME = "healthcare_rag"


def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
    )


def get_vectorstore():
    embeddings = get_embeddings()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
    )


def ingest_documents():
    """Load all knowledge base docs, chunk them, and store in ChromaDB."""
    docs = []
    for txt_file in KNOWLEDGE_BASE_DIR.glob("*.txt"):
        loader = TextLoader(str(txt_file), encoding="utf-8")
        raw_docs = loader.load()
        for doc in raw_docs:
            doc.metadata["source"] = txt_file.name
        docs.extend(raw_docs)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n===", "\n\n", "\n", " "],
    )
    chunks = splitter.split_documents(docs)

    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_PERSIST_DIR,
    )
    print(f"Ingested {len(chunks)} chunks from {len(docs)} documents into ChromaDB.")
    return vectorstore


if __name__ == "__main__":
    ingest_documents()
