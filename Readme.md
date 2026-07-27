![alt text](image-1.png)
![alt text](image-2.png)



# Secure Messaging Platform (Signal Clone)

A full-stack Signal Messenger clone built as an SDE Full Stack Assignment. The application replicates the core messaging experience of Signal using Next.js, FastAPI, SQLite, and WebSockets.

## Live Demo

Frontend: <ADD_FRONTEND_URL>

Backend: <ADD_BACKEND_URL>

## GitHub Repository

<ADD_GITHUB_REPO_URL>

---

# Features

## Authentication

- Mock OTP Authentication (OTP: `123456`)
- Register using phone number
- Login with existing account
- Session persistence using Local Storage
- Mock JWT Authentication

## Conversations

- View conversation list
- One-to-one conversations
- Group conversations
- Sidebar with recent conversations
- Conversation selection

## Real-Time Messaging

- Native WebSocket implementation
- Instant message delivery
- Two-way real-time communication
- Automatic reconnection
- Persistent message history
- Message timestamps

## Database

- SQLite database
- Persistent conversations
- Persistent messages
- User management
- Group management

---

# Tech Stack

## Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- React Hooks
- Native WebSocket API

## Backend

- FastAPI
- SQLAlchemy
- SQLite
- Native WebSockets
- Pydantic

---

# Project Structure

```
signal-clone/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── websocket/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── signal.db
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Database Schema

## Users

- id
- username
- phone
- display_name
- avatar
- created_at

## Conversations

- id
- type (direct/group)
- name
- created_at

## Conversation Members

- id
- conversation_id
- user_id

## Messages

- id
- conversation_id
- sender_id
- content
- status
- created_at

---

# API Overview

## Authentication

```
POST /auth/register
POST /auth/login
```

---

## Conversations

```
GET /conversations
POST /conversations/direct
POST /conversations/group
GET /conversations/{id}
```

---

## Messages

```
GET /messages/{conversation_id}
POST /messages
PATCH /messages/{message_id}/read
```

---

## WebSocket

```
ws://<backend-url>/ws/{conversation_id}/{user_id}
```

Supports:

- Real-time messaging
- Automatic reconnection
- Live message updates

---

# Setup

## Backend

```bash
cd backend

python -m venv venv

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Runs on:

```
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```
http://localhost:3000
```

---

# Authentication

Mock OTP

```
123456
```

---

# Architecture

```
Next.js Frontend
        │
 REST APIs
        │
 FastAPI Backend
        │
 SQLAlchemy ORM
        │
    SQLite
        │
 Native WebSocket
```

---

# Key Highlights

- Modern Signal-inspired UI
- FastAPI REST APIs
- Native WebSocket implementation
- SQLite persistence
- Real-time messaging
- Group conversations
- Clean component-based architecture
- TypeScript frontend
- Modular backend services

---

# Future Improvements

- Typing indicators
- Read receipts
- Search conversations
- Attachments
- Emoji reactions
- Voice and video calling
- End-to-end encryption
- Dark mode
- Push notifications

---

# Author

**Namit Joshi**

B.Tech Computer Science Engineering

Bennett University