# QHub - AI Chat Application with Document Upload & RAG

A full-stack web application that combines real-time chat with **Retrieval-Augmented Generation (RAG)** capabilities. Users can upload documents and chat with an AI assistant powered by Google Gemini, which retrieves relevant information from uploaded documents to provide context-aware responses.

## 🎯 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Real-time Chat**: Interactive messaging interface with AI responses
- **Document Upload**: Upload PDF and document files (up to 100MB)
- **RAG Integration**: AI retrieves relevant document excerpts for context-aware answers
- **Vector Embeddings**: Chroma DB for document chunking and similarity search
- **Chat History**: Persistent chat conversations with document mapping
- **Mobile Responsive**: Fully responsive UI with hamburger menu and sidebar toggle
- **Gemini AI Integration**: Latest Google Gemini API for intelligent responses

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 5.2 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production recommended)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **AI Model**: Google Gemini 2.0 (latest)
- **Vector DB**: Chroma DB for embeddings and semantic search
- **File Storage**: Django media files with document extraction

### Frontend

- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS3 with responsive design
- **State Management**: React Hooks (useState, useCallback, useEffect)

### Infrastructure

- **Backend Server**: Gunicorn + Django development server
- **Frontend Server**: React Scripts
- **Deployment**: Render, Heroku, AWS, or DigitalOcean

## 📁 Project Structure

```
QHub/
├── backend/
│   ├── manage.py                 # Django management script
│   ├── requirements.txt           # Python dependencies
│   ├── backend/
│   │   ├── settings.py           # Django configuration
│   │   ├── urls.py               # Root URL routing
│   │   ├── wsgi.py               # WSGI app
│   │   └── asgi.py               # ASGI app
│   ├── chat/
│   │   ├── models.py             # Chat & Message models
│   │   ├── views.py              # Chat API views (ChatViewSet)
│   │   ├── serializers.py        # DRF serializers
│   │   ├── urls.py               # Chat URL routing
│   │   └── migrations/           # Database migrations
│   ├── users/
│   │   ├── models.py             # User model
│   │   ├── views.py              # Auth views (signup/login)
│   │   ├── serializers.py        # User serializers
│   │   └── migrations/           # User migrations
│   ├── documents/
│   │   ├── models.py             # Document & DocumentChatMapping models
│   │   ├── embeddings.py         # Chroma DB integration
│   │   ├── views.py              # Document upload & query
│   │   └── migrations/           # Document migrations
│   ├── media/
│   │   └── documents/            # Uploaded user documents
│   ├── chroma_db/                # Vector database (embeddings)
│   └── db.sqlite3                # Development database
├── frontend/
│   ├── package.json              # NPM dependencies
│   ├── public/
│   │   └── index.html            # HTML entry point
│   ├── src/
│   │   ├── api.js                # Axios instance & API calls
│   │   ├── App.js                # Main app routing
│   │   ├── App.css               # Global styles
│   │   ├── index.js              # React DOM render
│   │   ├── components/
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Signup.jsx        # Signup form
│   │   │   ├── Sidebar.jsx       # Chat history sidebar
│   │   │   ├── ChatWindow.jsx    # Chat messages display
│   │   │   └── ChatMessage.jsx   # Individual message bubble
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx      # Main chat interface
│   │   │   └── Documents.jsx     # Document management
│   │   └── styles/
│   │       ├── chat.css          # Chat & responsive styles
│   │       ├── Login.css         # Login styles
│   │       └── Signup.css        # Signup styles
│   └── .gitignore                # Git ignore rules
├── .gitignore                    # Root git ignore
└── README.md                     # This file
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 14+
- Git
- Google Gemini API key (free tier available)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

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

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Create .env file
echo REACT_APP_API_URL=http://127.0.0.1:8000 > .env

# Start React development server
npm start
```

The frontend will run on `http://localhost:3000`

## 🔑 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory:

```env
# Django settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database (optional, defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/qhub

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# CORS (frontend domain)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# Email (optional, for password reset)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env)

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_API_URL=https://your-backend-api.com
```

## 📱 API Endpoints

### Authentication

- `POST /api/token/` - Obtain JWT token (login)
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/users/signup/` - User registration

### Chat

- `GET /api/chat/chats/` - List all user chats
- `POST /api/chat/chats/` - Create new chat
- `GET /api/chat/chats/{id}/messages/` - Get chat messages
- `POST /api/chat/chats/{id}/messages/` - Send message & get AI response

### Documents

- `POST /api/documents/upload/` - Upload document
- `GET /api/documents/` - List user documents
- `DELETE /api/documents/{id}/` - Delete document

## 💬 Usage

### 1. Signup

- Navigate to `/signup`
- Enter email and password
- Account created automatically

### 2. Login

- Navigate to `/login`
- Enter email and password
- Redirected to chat page

### 3. Chat

- Click "+ New Chat" to start conversation
- Type message and press Enter or click send button
- AI responds with context from uploaded documents (if available)

### 4. Upload Document

- Click "📁 Upload Document"
- Select PDF or document file (max 100MB)
- Document chunks stored in Chroma DB
- Future messages use document excerpts for RAG

### 5. Document Mapping

- Uploaded documents are linked to specific chats
- AI retrieves top 3 relevant excerpts for each query
- System prompt includes document context automatically

### 6. Mobile Responsive

- On mobile: Click hamburger (☰) to open sidebar
- Click X (✕) or overlay to close sidebar
- Full chat functionality on all screen sizes

## 🔄 How RAG Works

1. **Document Upload**: User uploads PDF/document
2. **Extraction**: Text extracted from document
3. **Chunking**: Document split into overlapping chunks
4. **Embedding**: Chunks converted to vector embeddings using Chroma
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

## 🚀 Deployment on Render

### Backend Deployment

1. Push code to GitHub (done ✅)
2. Go to [render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repo
5. Build command: `pip install -r backend/requirements.txt && python backend/manage.py migrate`
6. Start command: `gunicorn backend.backend.wsgi:application --bind 0.0.0.0:$PORT`
7. Add environment variables (GEMINI_API_KEY, SECRET_KEY, etc.)
8. Deploy

### Frontend Deployment

1. Go to [render.com](https://render.com)
2. Create new Static Site
3. Connect GitHub repo
4. Build command: `cd frontend && npm install && npm run build`
5. Publish directory: `frontend/build`
6. Set environment variables
7. Deploy

## 📊 Database Schema

### Users Table

- `id` (PK)
- `email` (unique)
- `password` (hashed)
- `created_at`

### Chat Table

- `id` (PK)
- `user_id` (FK)
- `title`
- `created_at`

### Message Table

- `id` (PK)
- `chat_id` (FK)
- `role` (user/assistant/system)
- `content` (text)
- `created_at`

### Document Table

- `id` (PK)
- `user_id` (FK)
- `file` (uploaded file)
- `extracted_text` (full text)
- `created_at`

### DocumentChatMapping Table

- `id` (PK)
- `document_id` (FK)
- `chat_id` (FK)
- Enables document context in specific chats

## 🔐 Security Features

- JWT authentication tokens
- Password hashing (PBKDF2)
- CORS protection
- CSRF tokens on forms
- User-scoped data queries (can't access other user's chats)
- File upload validation
- Input sanitization
- SQL injection prevention (ORM)

## 📈 Performance Optimizations

- Prefetch related messages for chats
- Pagination support for large chat histories
- Chroma DB vector indexing for fast similarity search
- Gzip compression on responses
- CSS minification (production build)
- React lazy loading (optional)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

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
