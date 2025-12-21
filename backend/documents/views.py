import os
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.core.files.storage import default_storage

from .models import Document, DocumentChatMapping
from .serializers import DocumentSerializer

from chat.models import Chat
from . import embeddings as doc_embeddings

#import io

try:
    from PyPDF2 import PdfReader
except Exception:
    PdfReader = None

try:
    import docx
except Exception:
    docx = None


def extract_text_from_file(fpath):
    """Extract text from PDF, DOCX or TXT files."""
    ext = os.path.splitext(fpath)[1].lower()
    text = ""
    try:
        if ext == ".pdf" and PdfReader:
            with open(fpath, "rb") as fh:
                reader = PdfReader(fh)
                for p in reader.pages:
                    try:
                        text += p.extract_text() or ""
                    except Exception:
                        continue
        elif ext in (".docx",) and docx:
            doc = docx.Document(fpath)
            for para in doc.paragraphs:
                text += para.text + "\n"
        else:
            # txt or fallback
            with open(fpath, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
    except Exception as e:
        print("Error extracting text:", e)
    return text


class UploadDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        # File size limit 100 MB
        if file_obj.size > 100 * 1024 * 1024:
            return Response({"detail": "File too large (max 100 MB)"}, status=status.HTTP_400_BAD_REQUEST)

        filename = file_obj.name
        # Allowed types
        allowed = [".pdf", ".txt", ".docx"]
        ext = os.path.splitext(filename)[1].lower()
        if ext not in allowed:
            return Response({"detail": "Unsupported file type"}, status=status.HTTP_400_BAD_REQUEST)

        # Save file
        save_path = default_storage.save(f"documents/user_{request.user.id}/{filename}", file_obj)
        full_path = os.path.join(settings.MEDIA_ROOT, save_path)

        # Extract text
        extracted = extract_text_from_file(full_path)

        doc = Document.objects.create(user=request.user, file=save_path, title=filename, extracted_text=extracted)

        # Create a Chat for this document so user can chat about it
        chat = Chat.objects.create(user=request.user, title=filename)

        # Map chat to document
        DocumentChatMapping.objects.create(chat_id=chat.id, document=doc)

        # Generate embeddings and store in Chroma (async could be better, but synchronous for now)
        try:
            doc_embeddings.upsert_document_embeddings(doc)
        except Exception as e:
            print("Embedding upsert failed:", e)

        serializer = DocumentSerializer(doc, context={"request": request})
        return Response({"document": serializer.data, "chat_id": chat.id}, status=status.HTTP_201_CREATED)


class ListDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        docs = Document.objects.filter(user=request.user).order_by("-uploaded_at")
        # include linked chat id if exists
        data = []
        for d in docs:
            mapping = DocumentChatMapping.objects.filter(document=d).first()
            data.append({
                "id": d.id,
                "title": d.title,
                "file": d.file.url if d.file else None,
                "uploaded_at": d.uploaded_at,
                "linked_chat_id": mapping.chat_id if mapping else None,
            })
        return Response(data)


class DeleteDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            doc = Document.objects.get(pk=pk, user=request.user)
        except Document.DoesNotExist:
            return Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        # delete mapping(s)
        DocumentChatMapping.objects.filter(document=doc).delete()

        # remove file from storage
        try:
            doc.file.delete(save=False)
        except Exception:
            pass

        # remove chroma collection
        try:
            import chromadb
            from chromadb.config import Settings
            client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory=os.path.join(settings.BASE_DIR, "chroma_db")))
            cname = f"document_{doc.id}"
            try:
                client.delete_collection(name=cname)
            except Exception:
                pass
        except Exception:
            pass

        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
