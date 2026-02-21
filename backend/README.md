# LectureLens Backend API

Django REST Framework backend for LectureLens - a lecture transcription and RAG chatbot platform.

## Project Structure

```
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── config/                  # Django project configuration
│   ├── settings.py          # Main settings
│   ├── urls.py              # Root URL configuration
│   ├── wsgi.py              # WSGI entry point
│   └── asgi.py              # ASGI entry point
└── apps/                    # Django applications
    ├── authentication/      # User authentication & JWT
    ├── users/              # User profiles
    ├── courses/            # Course/Subject management
    ├── lectures/           # Lectures and materials
    ├── transcriptions/     # Transcription workflow
    └── chat/               # RAG chatbot (future)
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and customized settings.

### 4. Setup PostgreSQL Database

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database and user
psql postgres
```

In `psql`:

```sql
CREATE USER lecturelens_user WITH PASSWORD 'strongpassword';
CREATE DATABASE lecturelens;
GRANT ALL PRIVILEGES ON DATABASE lecturelens TO lecturelens_user;
\q
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/logout/` - Logout (blacklist token)
- `POST /api/auth/refresh/` - Refresh access token

### Users
- `GET /api/users/me/` - Get current user profile
- `PUT /api/users/me/` - Update current user profile

### Courses (Subjects)
- `POST /api/courses/` - Create course (teachers only)
- `GET /api/courses/` - List all courses
- `GET /api/courses/{id}/` - Get course details

### Lectures
- `POST /api/lectures/` - Create lecture with audio upload
- `GET /api/lectures/` - List lectures
- `GET /api/lectures/{id}/` - Get lecture details
- `DELETE /api/lectures/{id}/` - Delete lecture

### Transcriptions
- `POST /api/transcriptions/{lecture_id}/start/` - Start transcription
- `GET /api/transcriptions/{lecture_id}/status/` - Check status
- `GET /api/transcriptions/{lecture_id}/` - Get transcript

## Admin Panel

Access the Django admin at `http://127.0.0.1:8000/admin/` with your superuser credentials.

## Authentication

This API uses JWT (JSON Web Tokens) for authentication. Include the access token in requests:

```
Authorization: Bearer <your-access-token>
```

## User Roles

- **STUDENT** - Can view courses, lectures, and chat
- **TEACHER** - Can create/manage courses and lectures
- **ADMIN** - Full system access

## File Uploads

Audio files are uploaded to `media/uploads/lectures/{lecture_id}/`

Configure cloud storage (S3, GCS) for production use.

## Next Steps

1. Integrate AI service for transcription (Whisper)
2. Implement RAG chatbot functionality
3. Add vector database integration (Pinecone)
4. Deploy to production environment
