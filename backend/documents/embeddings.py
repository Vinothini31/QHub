import os
from typing import List
from django.conf import settings

import google.generativeai as genai

try:
    import chromadb
except Exception:
    chromadb = None


# -----------------------
# CONFIGURE GEMINI API KEY
# -----------------------
API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

# Embedding model name
EMBED_MODEL_NAME = "text-embedding-004"


# -----------------------
# CHROMA DB DIRECTORY
# -----------------------
CHROMA_DIR = os.path.join(settings.BASE_DIR, "chroma_db")


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    if not text:
        return []
    chunks = []
    start, length = 0, len(text)

    while start < length:
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap

    return chunks


# -----------------------
# NEW CHROMA CLIENT (NO WARNINGS)
# -----------------------
def get_chroma_client():
    if not chromadb:
        return None

    try:
        return chromadb.PersistentClient(path=CHROMA_DIR)
    except Exception as e:
        print("Chroma client error:", e)
        return None


# -----------------------
# FIXED GEMINI EMBEDDING (CORRECT API)
# -----------------------
def embed_texts(texts: List[str]) -> List[List[float]]:
    embeddings = []

    for t in texts:
        try:
            res = genai.embed_content(
                model=EMBED_MODEL_NAME,
                content=t
            )
            embeddings.append(res["embedding"])
        except Exception as e:
            print("Embedding error:", e)
            embeddings.append([])

    return embeddings


# -----------------------
# UPSERT DOCUMENT EMBEDDINGS
# -----------------------
def upsert_document_embeddings(document):
    if not chromadb:
        print("Chroma not available; skipping embeddings")
        return

    text = document.extracted_text or ""
    chunks = chunk_text(text)

    if not chunks:
        return

    embeddings = embed_texts(chunks)
    client = get_chroma_client()

    if not client:
        return

    collection_name = f"document_{document.id}"
    collection = client.get_or_create_collection(name=collection_name)

    ids = [f"{document.id}_{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document.id, "chunk_index": i} for i in range(len(chunks))]

    # Prevent empty embeddings from breaking Chroma
    clean_embeddings = [emb if emb else [0.0] * 768 for emb in embeddings]

    try:
        collection.add(
            ids=ids,
            embeddings=clean_embeddings,
            metadatas=metadatas,
            documents=chunks
        )
    except Exception as e:
        print("Embedding upsert error:", e)
        return

    try:
        client.persist()
    except:
        pass


# -----------------------
# QUERY DOCUMENT
# -----------------------
def query_document(document_id: int, query: str, top_k: int = 5):

    client = get_chroma_client()
    if not client:
        return []

    try:
        collection = client.get_collection(name=f"document_{document_id}")
    except:
        return []

    # Correct embedding call
    try:
        q = genai.embed_content(
            model=EMBED_MODEL_NAME,
            content=query
        )
        q_emb = q["embedding"]
    except Exception as e:
        print("Query embedding error:", e)
        return []

    try:
        results = collection.query(
            query_embeddings=[q_emb],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
    except Exception as e:
        print("Query error:", e)
        return []

    output = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]

    for i in range(len(docs)):
        output.append({
            "text": docs[i],
            "metadata": metas[i],
            "distance": dists[i]
        })

    return output
