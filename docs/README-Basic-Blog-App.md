# Basic-Blog-App (MiniSocial)

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Full Stack](https://img.shields.io/badge/Full--Stack-Web%20App-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A full-stack social blogging platform where users can create posts, like and comment on content, follow others, and explore shared posts with real-time interactions.**

---

## 🎯 Project Overview

MiniSocial is a Twitter/Medium-inspired platform built with **Spring Boot (backend)** and **React (frontend)**. It demonstrates full-stack development with user authentication, feed algorithms, real-time updates, and database optimization.

**Key Highlights:**
- 🔐 JWT-based authentication & authorization
- 👥 User follow/unfollow system
- 📝 Create, edit, delete posts
- ❤️ Like and unlike posts
- 💬 Comment on posts (nested)
- 🔍 Discover & search functionality
- 📱 Responsive UI with React

---

## ✨ Features

### User Management
- ✅ User registration and login
- ✅ Profile customization
- ✅ Follow/unfollow users
- ✅ User discovery
- ✅ Profile viewing

### Content Creation
- ✅ Write rich-text posts
- ✅ Edit own posts
- ✅ Delete posts
- ✅ Image uploads (optional)
- ✅ Draft posts

### Social Interactions
- ✅ Like posts (toggle on/off)
- ✅ Unlike posts
- ✅ Like count tracking
- ✅ Comment on posts
- ✅ Nested comment threads
- ✅ Comment likes

### Feed & Discovery
- ✅ Personalized feed (posts from followed users)
- ✅ Global explore feed
- ✅ Search posts by keywords
- ✅ Filter by date, popularity
- ✅ Pagination
- ✅ Load more (infinite scroll)

### Real-time Features
- ✅ Like count updates
- ✅ Comment notifications
- ✅ Post deletion sync
- ✅ Live feed refresh

---

## 🏗️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 17+
- **Database:** PostgreSQL
- **ORM:** Hibernate/JPA
- **Security:** Spring Security + JWT
- **Build:** Maven
- **API:** RESTful

### Frontend
- **Framework:** React 18
- **Language:** JavaScript/JSX
- **State:** Context API / Redux
- **Styling:** CSS3, Bootstrap/Tailwind
- **HTTP:** Axios
- **Routing:** React Router

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL 13+
- Maven 3.8+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create database
createdb minisocial

# Install dependencies & build
mvn clean install

# Run migrations
mvn flyway:migrate

# Start server (runs on http://localhost:8080)
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build
```

---

## 📚 API Endpoints

### Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response: 201
{
  "id": "uuid",
  "token": "eyJ...",
  "user": { ... }
}
```

```http
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### User Endpoints

```http
GET /api/users/{userId}
GET /api/users/{userId}/profile
GET /api/users/search?q=john

POST /api/users/{userId}/follow
DELETE /api/users/{userId}/follow

GET /api/users/{userId}/followers
GET /api/users/{userId}/following
```

### Posts

```http
POST /api/posts
{
  "content": "My first post!",
  "imageUrl": "https://..."
}

GET /api/posts
GET /api/posts/{postId}
GET /api/posts/feed
GET /api/posts/explore

PUT /api/posts/{postId}
DELETE /api/posts/{postId}

POST /api/posts/{postId}/like
DELETE /api/posts/{postId}/like

GET /api/posts/{postId}/likes
```

### Comments

```http
POST /api/posts/{postId}/comments
{
  "content": "Great post!"
}

GET /api/posts/{postId}/comments
PUT /api/comments/{commentId}
DELETE /api/comments/{commentId}

POST /api/comments/{commentId}/like
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
```

### Follows Table
```sql
CREATE TABLE follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
```

### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id),
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
```

### Likes Table
```sql
CREATE TABLE likes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_likes_post ON likes(post_id);
```

---

## 🔄 Feed Algorithm

### Personal Feed
```sql
-- Posts from users I follow
SELECT p.* FROM posts p
WHERE p.user_id IN (
    SELECT following_id FROM follows WHERE follower_id = ?
)
ORDER BY p.created_at DESC
LIMIT 20;
```

### Discover Feed
```sql
-- Popular posts (trending)
SELECT p.* FROM posts p
WHERE p.created_at > NOW() - INTERVAL '7 days'
ORDER BY p.likes_count DESC
LIMIT 20;
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserControllerTest

# With coverage
mvn test jacoco:report
```

### Frontend Tests

```bash
# Run tests
npm test

# With coverage
npm test -- --coverage

# E2E tests (if using Cypress)
npm run cypress:open
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Access at http://localhost:80
```

### Environment Variables

**Backend (.env)**
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/minisocial
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000  # 24 hours
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 📊 Performance Optimizations

### Database
- ✅ Indexes on frequently queried columns
- ✅ Query result caching with Redis (optional)
- ✅ Pagination to limit result sets
- ✅ Connection pooling (HikariCP)

### API
- ✅ Data transfer object (DTO) pattern
- ✅ Lazy loading for related entities
- ✅ Batch operations where possible

### Frontend
- ✅ Code splitting
- ✅ Lazy loading components
- ✅ Image optimization
- ✅ Service worker caching

---

## 🛡️ Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT token-based auth
- ✅ CORS configuration
- ✅ SQL injection prevention (Prepared statements)
- ✅ XSS protection
- ✅ Input validation
- ✅ Rate limiting

---

## 📈 Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Hashtags and trending
- [ ] Direct messaging
- [ ] Post scheduling
- [ ] User blocking
- [ ] Content moderation
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

---

## 📂 Project Structure

```
minisocial/
├── backend/
│   ├── src/
│   │   ├── main/java/com/minisocial/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   └── security/
│   │   └── resources/
│   │       └── application.yml
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── hooks/
    │   └── App.jsx
    └── package.json
```

---

## 🤝 Contributing

1. Fork and clone
2. Create feature branch
3. Write tests
4. Submit PR with description

---

## 📖 Resources

- [Spring Boot Guide](https://spring.io/guides)
- [React Documentation](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Built with ❤️ by Berat Zengin**
