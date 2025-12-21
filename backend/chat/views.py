from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from django.db import transaction

# optional document mapping for RAG
try:
    from documents.models import DocumentChatMapping
except Exception:
    DocumentChatMapping = None

# embeddings helper (Chroma + Gemini)
try:
    from documents import embeddings as doc_embeddings
except Exception:
    doc_embeddings = None

import os
from google import genai  # Latest Gemini SDK

# Load Gemini API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def get_gemini_model():
    """
    Safely pick a working Gemini model from your account.
    """
    if not client:
        return None
    try:
        models_list = client.models.list()
        # Pick first model whose name contains 'gemini' or 'bison' (chat/LLM model)
        for m in models_list:
            if "gemini" in m.name.lower() or "bison" in m.name.lower():
                return m.name
        # fallback to first model
        if models_list:
            return models_list[0].name
        return None
    except Exception as e:
        print("Error fetching Gemini models:", e)
        return None


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        # Prefetch messages so each chat returned by the API includes all messages
        return Chat.objects.filter(
            user=self.request.user
        ).prefetch_related('messages').order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def messages(self, request, pk=None):
        chat = get_object_or_404(self.get_queryset(), pk=pk)

        if request.method == "GET":
            msgs = chat.messages.order_by("created_at")
            serializer = MessageSerializer(msgs, many=True)
            return Response(serializer.data)

        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Empty message"}, status=400)

        # Prepare user message but don't save yet — we'll persist only on success
        user_msg = Message(chat=chat, role="user", content=content)
        user_ser = MessageSerializer(user_msg)

        # Build conversation lines
        messages_for_llm = [
            f"{m.role.capitalize()}: {m.content}"
            for m in chat.messages.order_by("created_at")
        ]

        # If this chat maps to a document, try to retrieve relevant chunks via embeddings
        try:
            if DocumentChatMapping:
                mapping = (
                    DocumentChatMapping.objects
                    .filter(chat_id=chat.id)
                    .select_related('document')
                    .first()
                )
            else:
                mapping = None
        except Exception:
            mapping = None

        if mapping and mapping.document:
            excerpts = []
            try:
                if doc_embeddings:
                    results = doc_embeddings.query_document(
                        mapping.document.id, content, top_k=3
                    )
                    for r in results:
                        excerpts.append(r.get('text')[:1200])
                else:
                    excerpts.append(mapping.document.extracted_text[:3000])
            except Exception:
                excerpts.append(mapping.document.extracted_text[:3000])

            if excerpts:
                sys_text = "\n\n".join(
                    [f"Excerpt {i+1}:\n{e}" for i, e in enumerate(excerpts)]
                )
                messages_for_llm.insert(
                    0, f"System: Relevant document excerpts:\n{sys_text}"
                )

        messages_for_llm.append(f"User: {content}")

        # AI reply
        assistant_text = call_llm_generate(messages_for_llm)

        # If LLM reported quota/rate-limit, do not persist anything and
        # return only the warning to the client.
        quota_indicators = [
            "RESOURCE_EXHAUSTED",
            "request limits",
            "quota",
            "429",
            "AI is busy",
        ]
        assistant_text_lower = assistant_text.lower() if assistant_text else ""
        if any(indicator.lower() in assistant_text_lower for indicator in quota_indicators):
            return Response({"detail": "Message quota limit reached."}, status=429)

        # Persist both the user message and assistant reply atomically
        try:
            with transaction.atomic():
                user_msg.save()
                assistant_msg = Message.objects.create(
                    chat=chat, role="assistant", content=assistant_text
                )
        except Exception as e:
            print("DB Save Error:", e)
            return Response({"detail": "Failed to save messages."}, status=500)

        assistant_ser = MessageSerializer(assistant_msg)

        return Response(
            {
                "user_message": user_ser.data,
                "assistant_message": assistant_ser.data,
            },
            status=201,
        )


def call_llm_generate(conversation_lines):
    """
    Generate AI response using Gemini v1beta.
    """
    if not client:
        return "Gemini API key missing."

    model_name = get_gemini_model()
    if not model_name:
        return "No valid Gemini model available."

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=conversation_lines
        )
        return response.text if response.text else "AI did not respond."

    except Exception as e:
        error_text = str(e)
        print("Gemini Error:", error_text)

        # ✅ ONLY ADDITION: quota / rate-limit handling
        if "RESOURCE_EXHAUSTED" in error_text or "429" in error_text:
            return "⚠️ AI is busy due to request limits. Please wait a minute and try again."

        return "⚠️ AI service temporarily unavailable. Please try again later."
