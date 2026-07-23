# OpenAuth-Service

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Microservices](https://img.shields.io/badge/Microservices-Architecture-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A scalable, production-ready authentication microservice built with FastAPI. Database-agnostic design with clean architecture and enterprise-grade security.**

---

## 🎯 Project Overview

OpenAuth-Service is a standalone authentication microservice designed to be integrated into distributed systems. It handles user registration, login, token generation, token validation, and role-based access control with industry-standard practices.

**Why this service?**
- ✅ **Microservices ready** — Deploy independently
- ✅ **Database agnostic** — Works with PostgreSQL, MongoDB, MySQL
- ✅ **JWT-based** — Stateless authentication
- ✅ **Clean architecture** — Testable and maintainable
- ✅ **Production hardened** — Rate limiting, input validation, encryption

---

## ✨ Features

### Authentication
- 🔐 User registration with email verification
- 🔑 Secure login with password hashing (bcrypt)
- 🎫 JWT token generation with configurable expiry
- 🔄 Refresh token mechanism
- 🚪 Logout with token blacklist

### Authorization
- 👤 Role-based access control (RBAC)
- 📋 Permission management
- 🛡️ Scope-based authorization

### Security
- 🔒 Password hashing with bcrypt
- 🚫 Rate limiting (Slowhttptest protection)
- ✔️ Input validation (Pydantic)
- 📝 Audit logging
- 🔐 CORS configuration
- 🧪 CSRF protection ready

### API Features
- 📚 Auto-generated OpenAPI documentation
- ✅ Request/response validation
- 🔍 Structured error responses
- 📊 Health check endpoint

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Docker (optional)
- PostgreSQL 13+ (or any database)

### Installation

```bash
git clone https://github.com/devberatzengin/OpenAuth-Service.git
cd OpenAuth-Service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials
```

### Running Locally

```bash
# Database migrations
alembic upgrade head

# Start service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API docs: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Running with Docker

```bash
docker build -t openauth-service .
docker run -p 8000:8000 --env-file .env openauth-service
```

---

## 📚 API Endpoints

### Authentication

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

```http
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

```http
POST /api/v1/auth/refresh
{
  "refresh_token": "eyJ..."
}
```

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### User Management

```http
GET /api/v1/users/me
Authorization: Bearer <token>

PUT /api/v1/users/me
Authorization: Bearer <token>
{
  "first_name": "Jane",
  "last_name": "Smith"
}

PATCH /api/v1/users/me/password
{
  "current_password": "old_pass",
  "new_password": "new_pass123!"
}
```

### Admin Endpoints

```http
GET /api/v1/admin/users
Authorization: Bearer <admin_token>

GET /api/v1/admin/users/{user_id}

PATCH /api/v1/admin/users/{user_id}/role
{
  "role": "admin"
}

DELETE /api/v1/admin/users/{user_id}
```

---

## 🏗️ Architecture

### Clean Layers

```
app/
├── main.py                 # FastAPI app
├── config.py              # Settings (Pydantic)
├── api/
│   ├── v1/
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   └── admin.py
│   │   └── dependencies.py  # Dependency injection
├── services/              # Business logic
│   ├── auth_service.py
│   ├── user_service.py
│   └── token_service.py
├── models/                # Database models (SQLAlchemy)
├── schemas/               # Pydantic models
├── database/              # DB connection, session
│   └── base.py
├── security/              # Hash, JWT, crypto
└── tests/
    ├── conftest.py        # Fixtures
    ├── test_auth.py
    └── test_users.py
```

### Request Flow

```
HTTP Request
    ↓
Route Handler (API endpoint)
    ↓
Dependency Injection (auth verification)
    ↓
Service Layer (business logic)
    ↓
Database Layer (ORM)
    ↓
Response (JSON)
```

---

## 🔒 Security Implementation

### Password Hashing
```python
# Using bcrypt with salt
from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12
)

hashed = pwd_context.hash("password")
verified = pwd_context.verify("password", hashed)
```

### JWT Tokens
```python
import jwt
from datetime import datetime, timedelta

payload = {
    "sub": user_id,
    "email": email,
    "role": role,
    "exp": datetime.utcnow() + timedelta(hours=1)
}

token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```

### Rate Limiting
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/auth/login")
@limiter.limit("5/minute")
def login(request: LoginSchema):
    # Max 5 login attempts per minute
    pass
```

---

## 🧪 Testing

```bash
# Run all tests
pytest -v

# Run with coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_auth.py -v
```

### Example Test

```python
def test_user_registration(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

---

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- User roles junction
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Token blacklist (logout)
CREATE TABLE token_blacklist (
    id UUID PRIMARY KEY,
    token TEXT NOT NULL,
    blacklisted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
```

---

## 🚀 Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/openauth

# JWT
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Security
CORS_ORIGINS=["http://localhost:3000"]
RATE_LIMIT=10/minute

# Email (optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Production Checklist

- [ ] Set strong `SECRET_KEY`
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Setup email verification
- [ ] Enable rate limiting
- [ ] Monitor logs and errors
- [ ] Use managed database (not localhost)
- [ ] Setup CI/CD pipeline

---

## 📈 Monitoring & Logging

```python
import logging

logger = logging.getLogger(__name__)

@app.post("/auth/login")
def login(credentials: LoginSchema):
    logger.info(f"Login attempt for {credentials.email}")
    try:
        # auth logic
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
```

---

## 🔄 Future Roadmap

- [ ] OAuth 2.0 / OpenID Connect
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Permission scopes (fine-grained)
- [ ] API key authentication
- [ ] Service-to-service JWT
- [ ] Audit logging dashboard
- [ ] WebSocket token validation

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/new-auth`)
3. Write tests first
4. Commit with clear messages
5. Push and create Pull Request

---

## 📖 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)

---
