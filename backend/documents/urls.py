from django.urls import path
from . import views

urlpatterns = [
    path("upload/", views.UploadDocumentView.as_view(), name="documents-upload"),
    path("", views.ListDocumentsView.as_view(), name="documents-list"),
    path("<int:pk>/", views.DeleteDocumentView.as_view(), name="documents-detail"),
]
