from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Simple home endpoint to check if API is running
def home(request):
    return JsonResponse({"message": "API is running!"})

urlpatterns = [
    path("", home),  # Root API check
    path("admin/", admin.site.urls),

    # User authentication endpoints
    path("api/users/", include("users.urls")),  # your signup/login views
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),  # JWT login
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),   # JWT refresh

    # Chat endpoints
    path("api/chat/", include("chat.urls")),
    path("api/documents/", include("documents.urls")),
]
