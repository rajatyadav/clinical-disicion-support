"""RAG pipeline using ChromaDB retrieval + Groq (Llama 3.3)."""
import os
from typing import AsyncGenerator
from groq import Groq
from dotenv import load_dotenv
from .ingest import get_vectorstore

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are a clinical decision support assistant helping a care team monitor patients and vitals.

You ONLY answer based on the provided context (retrieved medical knowledge and patient data).
If the answer is not in the context, say "I don't have enough information in my knowledge base to answer that."

IMPORTANT RULES:
- Be concise but clinically precise
- Always cite which source you're drawing from (e.g., "Per the sepsis protocol...", "According to vitals thresholds...")
- Do not make up clinical facts
- If a patient's vitals suggest danger, clearly flag it
- Format responses with clear structure when listing multiple points"""


def retrieve_context(question: str, k: int = 4) -> tuple[str, list[str]]:
    """Retrieve relevant chunks from ChromaDB."""
    vectorstore = get_vectorstore()
    docs = vectorstore.as_retriever(search_kwargs={"k": k}).invoke(question)

    context_parts = []
    sources = []
    for doc in docs:
        source = doc.metadata.get("source", "knowledge_base")
        context_parts.append(f"[Source: {source}]\n{doc.page_content}")
        if source not in sources:
            sources.append(source)

    return "\n\n---\n\n".join(context_parts), sources


def build_prompt(question: str, retrieved_context: str, patient_context: str = "") -> str:
    prompt = ""
    if patient_context:
        prompt += f"CURRENT PATIENT CONTEXT:\n{patient_context}\n\n"
    prompt += f"RETRIEVED KNOWLEDGE BASE CONTEXT:\n{retrieved_context}\n\n"
    prompt += f"QUESTION: {question}"
    return prompt


async def stream_rag_response(
    question: str,
    patient_context: str = "",
) -> AsyncGenerator[str, None]:
    """Stream a RAG-grounded response from Groq (Llama 3.3)."""
    retrieved_context, sources = retrieve_context(question)
    user_prompt = build_prompt(question, retrieved_context, patient_context)

    # Yield sources metadata first as a special marker
    yield f"__SOURCES__:{','.join(sources)}\n"

    stream = client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        stream=True,
    )
    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content


def get_rag_response(question: str, patient_context: str = "") -> dict:
    """Non-streaming RAG response."""
    retrieved_context, sources = retrieve_context(question)
    user_prompt = build_prompt(question, retrieved_context, patient_context)

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return {
        "answer": response.choices[0].message.content,
        "sources": sources,
    }
