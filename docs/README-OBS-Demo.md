# OBS-Demo — Academic Information System

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Role Based](https://img.shields.io/badge/RBAC-Authorization-ff69b4?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

**A comprehensive academic management system with role-based portals for Root Admin, Academicians, and Students. Features course management, grade tracking, enrollment, and transcript generation.**

---

## 🎯 Project Overview

OBS (Online Banking System renamed to Onboard System here) is an enterprise-grade academic information system demonstrating:
- Multi-role authentication & authorization
- Complex business logic (enrollment, grading, transcripts)
- Department and faculty management
- Real-time grade reporting
- Student academic history tracking

---

## ✨ Key Features

### 👨‍💼 Root Admin Portal
- 📊 System overview & analytics
- 👥 User management (create, deactivate, assign roles)
- 🏫 Department management
- 📋 Faculty management
- 🔐 System configuration & security

### 👨‍🏫 Academician (Faculty) Portal
- 📚 Manage assigned courses
- 📝 Create & update course content
- 📊 Grade students
- 👀 View student performance
- 📈 Generate class reports
- 🗂️ Manage attendance

### 👨‍🎓 Student Portal
- 📖 View available courses
- ✅ Enroll in courses
- 👁️ Check grades & transcripts
- 📑 View course materials
- 📅 Track academic progress
- 🎓 Download transcript

### System Features
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Course enrollment validation
- ✅ GPA calculation
- ✅ Transcript generation
- ✅ Audit logging
- ✅ Data export (PDF reports)

---

## 🏗️ Technical Architecture

### Backend Stack
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security + JWT
- **ORM:** Hibernate/JPA
- **Database:** PostgreSQL
- **API:** RESTful with OpenAPI docs
- **Validation:** Bean Validation
- **Caching:** Spring Cache (Redis ready)

### Frontend Stack
- **UI Framework:** React 18
- **State Management:** Context API / Redux
- **Styling:** Tailwind CSS / Bootstrap
- **HTTP Client:** Axios
- **Routing:** React Router v6
- **Component Library:** Custom + Ant Design (optional)

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Users (base for all roles)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50),  -- ADMIN, ACADEMICIAN, STUDENT
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20),
    description TEXT
);

-- Programs (Degree programs like BS, MS)
CREATE TABLE programs (
    id UUID PRIMARY KEY,
    department_id UUID REFERENCES departments(id),
    name VARCHAR(100),
    duration_years INT,
    total_credits INT
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    department_id UUID REFERENCES departments(id),
    credit_hours INT,
    description TEXT,
    max_students INT
);

-- Faculty (Academicians)
CREATE TABLE faculty (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    department_id UUID REFERENCES departments(id),
    qualification VARCHAR(100)
);

-- Course Offerings (semester-based)
CREATE TABLE course_offerings (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    faculty_id UUID REFERENCES faculty(id),
    semester VARCHAR(20),  -- Spring2024, Fall2024
    capacity INT,
    schedule JSONB  -- Days and times
);

-- Enrollments
CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES users(id),
    course_offering_id UUID REFERENCES course_offerings(id),
    enrollment_date TIMESTAMP,
    status VARCHAR(50),  -- ACTIVE, COMPLETED, DROPPED
    UNIQUE(student_id, course_offering_id)
);

-- Grades
CREATE TABLE grades (
    id UUID PRIMARY KEY,
    enrollment_id UUID REFERENCES enrollments(id),
    assignment_name VARCHAR(100),
    marks DECIMAL(5,2),
    max_marks DECIMAL(5,2),
    grade_type VARCHAR(50),  -- ASSIGNMENT, EXAM, PARTICIPATION
    UNIQUE(enrollment_id, assignment_name)
);

-- Transcripts
CREATE TABLE transcripts (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES users(id),
    semester VARCHAR(20),
    gpa DECIMAL(3,2),
    total_credits INT,
    generated_at TIMESTAMP
);
```

---

## 📚 API Endpoints

### Authentication
```http
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Admin Endpoints
```http
GET /api/v1/admin/users
POST /api/v1/admin/users
GET /api/v1/admin/departments
POST /api/v1/admin/departments

GET /api/v1/admin/programs
POST /api/v1/admin/programs

GET /api/v1/admin/analytics
```

### Academician Endpoints
```http
GET /api/v1/academician/courses
GET /api/v1/academician/courses/{courseId}/students
POST /api/v1/academician/courses/{courseId}/grades
  {
    "enrollmentId": "uuid",
    "marks": 85.5,
    "assignmentName": "Midterm"
  }

GET /api/v1/academician/courses/{courseId}/report
```

### Student Endpoints
```http
GET /api/v1/student/courses/available
POST /api/v1/student/enrollments
  {
    "courseOfferingId": "uuid"
  }

GET /api/v1/student/enrollments
GET /api/v1/student/grades
GET /api/v1/student/transcript
GET /api/v1/student/transcript/download  # PDF
```

---

## 🧪 Testing

```bash
# Backend tests
mvn test

# Run specific test
mvn test -Dtest=EnrollmentServiceTest

# With coverage
mvn test jacoco:report

# Frontend tests
cd frontend
npm test

# E2E with Cypress
npm run e2e
```

---

## 🚀 Running the Project

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
# API: http://localhost:8080
# Docs: http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd frontend
npm install
npm start
# UI: http://localhost:3000
```

### With Docker

```bash
docker-compose up -d
# Services running on configured ports
```

---

## 📋 Enrollment Workflow

```
1. Student views available courses
   ↓
2. Student clicks "Enroll"
   ↓
3. Backend validates:
   - Prerequisites passed?
   - Not already enrolled?
   - Capacity available?
   ↓
4. If valid → Create enrollment record
   ↓
5. Student can now see course in dashboard
   ↓
6. Academician enters grades
   ↓
7. System calculates course grade
   ↓
8. Semester transcript generated
```

---

## 📊 GPA Calculation

```
GPA = Σ(Credit Hours × Grade Point) / Σ Credit Hours

Grade Map:
A (4.0) = 90-100
B (3.0) = 80-89
C (2.0) = 70-79
D (1.0) = 60-69
F (0.0) = Below 60
```

---

## 🔒 Security

- ✅ JWT tokens with expiry
- ✅ Role-based access (@PreAuthorize)
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention
- ✅ CORS configuration
- ✅ Audit logging for sensitive operations

---

## 📈 Performance Considerations

- Caching frequently accessed data
- Indexed queries on student_id, course_id
- Pagination for large result sets
- Lazy loading for related entities
- Connection pooling with HikariCP

---

## 🔄 Future Enhancements

- [ ] Course prerequisites validation
- [ ] Waitlist for full courses
- [ ] Transcript notarization
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Course recommendations
- [ ] Student performance predictions (ML)

---

## 📂 Project Structure

```
obs-demo/
├── backend/
│   ├── src/main/java/com/obs/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   └── dto/
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── package.json
```

---
