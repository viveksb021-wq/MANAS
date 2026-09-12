# 🧠 MANAS — Memory Assistance & Neural Adaptive System
> **Smart India Hackathon (SIH 2026)** — AI-Powered Assistive Platform for Elderly Cognitive Support & Caregiver Monitoring

MANAS is an intelligent, multi-modal cognitive support platform designed for elderly individuals experiencing memory impairment, early-stage Alzheimer's, or dementia. It integrates **real-time facial recognition**, **multilingual voice assistance**, **adaptive cognitive training games**, and **clinical guardian monitoring**.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │               MANAS FRONTEND                 │
                               │       (React 18 + Vite + TypeScript)         │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                           REST API / JWT Auth / Speech API
                                                      │
                               ┌──────────────────────▼───────────────────────┐
                               │                MANAS BACKEND                 │
                               │         (FastAPI + Python 3.14 + Pydantic)   │
                               └──────────┬───────────────────────┬───────────┘
                                          │                       │
                             SQLAlchemy / Alembic          AI / Vector Engine
                                          │                       │
                               ┌──────────▼──────────┐ ┌──────────▼───────────┐
                               │  PostgreSQL / SQLite │ │ Biometrics & Speech │
                               │  Relational Storage │ │ NLU Intent Parser   │
                               └─────────────────────┘ └─────────────────────┘
```

---

## 🛠️ Tech Stack & Key Modules

| Layer | Technology | Key Features |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Lucide Icons, Recharts | Senior-friendly UI, 44px+ touch targets, WCAG AAA accessibility, cascading text scaling, offline sync queue |
| **Backend** | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, SlowAPI | Rate-limiting, JWT passkey auth, REST endpoints, zero-hallucination voice router |
| **Database** | PostgreSQL (Production) / SQLite (Development) | Alembic migrations, SQLAlchemy ORM models, audit logging |
| **AI / Biometrics** | Vector Cosine Embedding, Web Speech API | Client-side facial descriptor extraction, Indic language translation (Hindi, Bengali, Assamese, Manipuri) |
| **Mobile** | Flutter / Dart (`manas_dart/`) | Cross-platform mobile companion app |

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env` in both the workspace root and `backend/` directory:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### Backend Config (`backend/.env`)

```env
# Database Connection (Supports SQLite for local dev, PostgreSQL for production)
DATABASE_URL=sqlite:///./manas.db
# Example PostgreSQL Connection URL:
# DATABASE_URL=postgresql://user:password@localhost:5432/manas_db

# Security & JWT Authentication
JWT_SECRET_KEY=your_super_secret_64_character_hex_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Allowed Origins (Comma-separated string)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Environment (development / production)
ENVIRONMENT=development

# Automatic Seeding (Set to false in production)
AUTO_SEED=true
```

### Frontend Config (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_ENABLE_DEMO_BAR=true
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `3.10` or higher
- **Git**

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API interactive documentation will be available at: `http://localhost:8000/docs`

### 3. Database Migrations (Alembic)
```bash
cd backend

# Apply migrations to the latest schema version
alembic upgrade head

# Generate a new migration after updating SQLAlchemy models
alembic revision --autogenerate -m "Add new feature tables"
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend web app will launch at: `http://localhost:5173`

---

## 🧪 Testing Suite

### Backend Pytest Suite
```bash
cd backend
python -m pytest tests/ -v
```
Includes coverage for:
- 🔐 Auth flow & JWT refresh token rotation (`test_auth_security.py`)
- 🎮 Adaptive difficulty scoring engine (`test_adaptive_engine_phase3.py`)
- 👤 Facial recognition vector matching (`test_face_recognition_phase2.py`)
- 🎙️ Multilingual NLU & zero-hallucination voice router (`test_voice_assistant_phase4.py`)

### Frontend Type Checking & Build
```bash
cd frontend
npm run build
```

---

## 🌐 Production Deployment Guide

### Frontend (Vercel)
The repository contains a pre-configured [`vercel.json`](file:///c:/Users/Personal/OneDrive/Desktop/MANAS/frontend/vercel.json).
```bash
cd frontend
vercel --prod
```

### Backend (Render / Railway / Fly.io / Docker)
Deploy the FastAPI backend using your preferred host:
- Set `DATABASE_URL` to your production PostgreSQL database instance.
- Set `ENVIRONMENT=production` and `AUTO_SEED=false`.
- Set `CORS_ORIGINS` to your production frontend domain (e.g. `https://manas-app.vercel.app`).
- Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4`

---

## 📄 License
Licensed under the [MIT License](LICENSE). Developed for **Smart India Hackathon (SIH 2026)**.
