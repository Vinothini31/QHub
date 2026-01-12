# QHub - AI Chat & Document RAG Backend

QHub is a Django-based backend application that powers real-time chat with **Retrieval-Augmented Generation (RAG)**. Users can upload documents and interact with an AI assistant (Google Gemini), which retrieves relevant information from uploaded documents to provide context-aware responses. The backend handles authentication, document management, vector embeddings (Chroma DB), and chat logic.

## 🎯 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Real-time Chat API**: Endpoints for chat with AI assistant
- **Document Upload**: Upload and manage PDF/documents (up to 100MB)
- **RAG Integration**: AI retrieves relevant document excerpts for context-aware answers
- **Vector Embeddings**: Chroma DB for document chunking and similarity search
- **Chat History**: Persistent chat conversations with document mapping
- **Gemini AI Integration**: Google Gemini API for intelligent responses

## 🛠️ Tech Stack

- **Framework**: Django 5.2, Django REST Framework
- **Database**: SQLite (dev) / PostgreSQL (prod recommended)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **AI Model**: Google Gemini 2.0
- **Vector DB**: Chroma DB (embeddings, semantic search)
- **File Storage**: Django media files
- **Deployment**: Render, Heroku, AWS, DigitalOcean

## 📁 Project Structure

```
QHub/
├── backend/
│   ├── manage.py                 # Django management script
│   ├── requirements.txt          # Python dependencies
│   ├── requirements-prod.txt     # Production dependencies
│   ├── runtime.txt               # Python runtime version
│   ├── Procfile                  # Deployment process file
│   ├── db.sqlite3                # Development database
│   ├── check_db.py               # DB check script
│   ├── backend/
│   │   ├── settings.py           # Django configuration
│   │   ├── urls.py               # Root URL routing
│   │   ├── wsgi.py               # WSGI app
│   │   └── asgi.py               # ASGI app
│   ├── chat/                     # Chat app (models, views, serializers, migrations)
│   ├── users/                    # User app (models, views, serializers, migrations)
│   ├── documents/                # Document app (models, embeddings, views, migrations)
│   ├── core/                     # Core utilities and logic
│   ├── frontend/                 # (Django app for static/templates, not React)
│   ├── chroma_db/                # Vector DB files (Chroma)
│   ├── media/                    # Uploaded user documents
│   └── staticfiles/              # Collected static files
├── render.yaml                   # Render deployment config
├── README.md                     # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8+
- Git
- Google Gemini API key (free tier available)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Vinothini31/QHub.git
cd QHub/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Create superuser (optional, for Django admin)
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

The backend will run on `http://127.0.0.1:8000`

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory (or set these in your deployment environment):

```env
# Django settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database (optional, defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/qhub

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# CORS (if using a frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# Email (optional, for password reset)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## 📱 API Endpoints (Sample)

### Authentication

- `POST /api/token/` — Obtain JWT token (login)
- `POST /api/token/refresh/` — Refresh JWT token
- `POST /api/users/signup/` — User registration

### Chat

- `GET /api/chat/chats/` — List all user chats
- `POST /api/chat/chats/` — Create new chat
- `GET /api/chat/chats/{id}/messages/` — Get chat messages
- `POST /api/chat/chats/{id}/messages/` — Send message & get AI response

### Documents

- `POST /api/documents/upload/` — Upload document
- `GET /api/documents/` — List user documents
- `DELETE /api/documents/{id}/` — Delete document

## 💬 Usage Flow

1. **Signup**: Register a new user via API.
2. **Login**: Obtain JWT token for authentication.
3. **Upload Document**: Upload PDF/doc files via API. Chunks are embedded and stored in Chroma DB.
4. **Start Chat**: Create a chat and send messages. The AI will use document context for RAG.
5. **Document Mapping**: Uploaded documents are linked to chats; AI retrieves relevant excerpts for each query.

## 🔄 How RAG Works

1. **Document Upload**: User uploads PDF/document
2. **Extraction**: Text extracted from document
3. **Chunking**: Document split into overlapping chunks
4. **Embedding**: Chunks converted to vector embeddings (Chroma)
5. **Storage**: Embeddings stored in Chroma DB
6. **Query**: User message embedded and compared with document embeddings
7. **Retrieval**: Top 3 similar chunks retrieved
8. **Context**: Retrieved excerpts added to system prompt
9. **Response**: Gemini AI generates response using document context

## 🐛 Error Handling

### Common Errors & Solutions

**404 on chat messages endpoint**

- Django server cache issue
- Solution: Restart server with `python manage.py runserver`

**CORS errors**

- Frontend and backend on different domains
- Solution: Add domain to `CORS_ALLOWED_ORIGINS` in settings.py

**Gemini API quota exceeded**

- Solution: Check API usage in Google Cloud console
- Free tier has rate limits, upgrade if needed

**Document upload fails**

- File size too large (max 100MB)
- Unsupported file format
- Chroma DB connection issue

**Mobile sidebar not clickable**

- Clear browser cache (Ctrl+Shift+Delete)
- Verify `.close-btn` has `pointer-events: auto` in CSS

## 🚀 Deployment (Render Example)

### Backend Deployment

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Build command: `pip install -r backend/requirements.txt && python backend/manage.py migrate`
6. Start command: `gunicorn backend.backend.wsgi:application --bind 0.0.0.0:$PORT`
7. Add environment variables (GEMINI_API_KEY, SECRET_KEY, etc.)
8. Deploy

## 📊 Database Schema (Simplified)

**Users**: id, email, password, created_at

**Chat**: id, user_id, title, created_at

**Message**: id, chat_id, role, content, created_at

**Document**: id, user_id, file, extracted_text, created_at

**DocumentChatMapping**: id, document_id, chat_id

## 🔐 Security Features

- JWT authentication tokens
- Password hashing (PBKDF2)
- CORS protection
- CSRF tokens (Django forms/admin)
- User-scoped data queries
- File upload validation
- Input sanitization
- SQL injection prevention (ORM)

## 📈 Performance Optimizations

- Prefetch related messages for chats
- Pagination for large chat histories
- Chroma DB vector indexing for fast similarity search
- Gzip compression on responses

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Vinothini M**

- GitHub: [@Vinothini31](https://github.com/Vinothini31)
- Email: vinothinim012@gmail.com

## 🔗 Links

- **GitHub Repository**: https://github.com/Vinothini31/QHub
- **Google Gemini API**: https://ai.google.dev/
- **Chroma DB**: https://www.trychroma.com/
- **Django REST Framework**: https://www.django-rest-framework.org/

## 📞 Support

For issues, questions, or suggestions:

1. Open an issue on GitHub
2. Email: vinothinim012@gmail.com
3. Check documentation above

---

**Made with ❤️ for AI-powered conversations**
