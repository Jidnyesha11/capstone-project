# NexaAI

> AI-powered SaaS workspace for creating, managing, and organizing AI-generated content with authentication, projects, persistent conversations, streaming responses, usage limits, and an administrative dashboard.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Application Modules](#application-modules)
- [Prerequisites](#prerequisites)
- [Project Installation](#project-installation)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Gemini API Setup](#gemini-api-setup)
- [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
- [Demo Accounts](#demo-accounts)
- [AI Generation Flow](#ai-generation-flow)
- [AI Conversation and Memory](#ai-conversation-and-memory)
- [Usage Limits](#usage-limits)
- [API Documentation](#api-documentation)
- [Frontend Routes](#frontend-routes)
- [Project Structure](#project-structure)
- [Responsive Design](#responsive-design)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Production Checklist](#production-checklist)
- [Future Enhancements](#future-enhancements)
- [Capstone Project Highlights](#capstone-project-highlights)
- [License](#license)

---

# Overview

NexaAI is a full-stack AI SaaS platform designed to provide users with a modern workspace for AI-powered content creation and project management.

The application combines a responsive React frontend with a Node.js/Express backend, MongoDB database, JWT authentication, and Google's Gemini API.

Users can create projects, generate AI content, maintain persistent AI conversations, stream AI responses in real time, track usage, and manage their generation history.

The platform also provides an administrator dashboard for managing users and monitoring platform activity.

---

# Key Features

## 🔐 Authentication

- User registration
- User login
- JWT authentication
- Protected routes
- Persistent authentication
- Logout
- Password hashing using bcrypt
- Role-based authorization
- Admin authentication

---

## 🤖 AI Workspace

NexaAI provides a dedicated AI workspace for content generation.

Supported generation types include:

- Blog
- Marketing
- Social Media
- Email
- Summary
- General
- Chat

Features include:

- Gemini API integration
- Streaming responses
- Real-time output rendering
- Stop generation
- Copy generated output
- Persistent generation records
- Project-specific AI generation
- Usage tracking

---

# 💬 AI Conversation and Multi-Turn Memory

NexaAI supports persistent AI conversations.

Each conversation belongs to a specific user and project.

Example:

```text
User:
Remember that my project is called NexaAI.

AI:
Got it. Your project is called NexaAI.

User:
What is my project called?

AI:
Your project is called NexaAI.
````

Conversation messages are stored in MongoDB.

The application sends previous messages to Gemini as conversation context so the AI can maintain multi-turn context.

Conversation structure:

```text
User
│
└── Project
    │
    └── Conversation
        │
        ├── User Message
        ├── AI Response
        ├── User Message
        └── AI Response
```

---

# 📁 Project Management

Users can:

* Create projects
* Edit projects
* Archive projects
* Select projects
* Open project-specific AI workspaces
* Generate content inside projects

Every project is associated with its owner.

Newly created projects automatically receive their MongoDB `_id` and are opened using:

```text
/workspace?project=<project-id>
```

This ensures that seeded projects and newly created projects use the same AI generation workflow.

---

# 📚 AI Generation History

The History module allows users to manage previous generations.

Features:

* View previous generations
* Search history
* Copy output
* Regenerate content
* Delete generations
* Export TXT
* Export JSON
* View project association
* View generation timestamp
* View model information

---

# 📊 Usage Management

NexaAI includes plan-based usage limits.

Default configuration:

| Plan       | Generations | Tokens    | Max Output |
| ---------- | ----------- | --------- | ---------- |
| Free       | 10/month    | 20,000    | 2,048      |
| Pro        | 100/month   | 200,000   | 4,096      |
| Enterprise | 1,000/month | 2,000,000 | 8,192      |

Usage information includes:

```text
generations
tokensUsed
tokensReserved
periodStart
lastGenerationAt
```

The backend reserves usage before starting an AI request.

If generation succeeds:

```text
Reservation
    ↓
Actual token usage
    ↓
Usage finalized
```

If generation fails:

```text
Reservation
    ↓
Generation failure
    ↓
Reservation released
```

This prevents failed requests from permanently consuming usage.

---

# 👤 Profile

Users can manage:

* Name
* Email
* Bio
* Avatar
* Password
* Usage information
* Account information

Profile APIs are protected by JWT authentication.

---

# 🛠️ Admin Dashboard

Administrators have access to a protected admin dashboard.

Admin functionality includes:

* View users
* View platform statistics
* Manage user roles
* Manage user status
* Delete users
* Monitor usage
* Review platform activity

Normal users cannot access administrator endpoints.

---

# 🎨 Modern Responsive Frontend

NexaAI is designed for both desktop and mobile devices.

## Desktop

```text
┌──────────────┬──────────────────────────────┐
│              │                              │
│   Sidebar    │        Main Content           │
│              │                              │
│ Dashboard    │        Dashboard              │
│ Projects     │        Workspace              │
│ Workspace    │        History                │
│ History      │        Profile                │
│ Profile      │        Settings               │
│ Settings     │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

## Mobile

```text
┌──────────────────────────┐
│       Header / Nav       │
├──────────────────────────┤
│                          │
│      Main Content        │
│                          │
│      AI Workspace        │
│                          │
├──────────────────────────┤
│     Mobile Navigation    │
└──────────────────────────┘
```

The interface includes:

* Responsive sidebar
* Mobile navigation
* Dashboard cards
* Project cards
* AI workspace
* Chat interface
* History
* Profile
* Settings
* Admin dashboard
* Loading states
* Empty states
* Error states
* Toast notifications

---

# 🧱 Technology Stack

## Frontend

| Technology   | Purpose                      |
| ------------ | ---------------------------- |
| React        | User interface               |
| React Router | Application routing          |
| Axios        | HTTP requests                |
| Lucide React | Icons                        |
| Recharts     | Charts and analytics         |
| Vite         | Development and build system |
| CSS          | Responsive styling           |

## Backend

| Technology       | Purpose                    |
| ---------------- | -------------------------- |
| Node.js          | Runtime                    |
| Express          | REST API                   |
| MongoDB          | Database                   |
| Mongoose         | MongoDB ODM                |
| JWT              | Authentication             |
| bcryptjs         | Password hashing           |
| Google GenAI SDK | Gemini integration         |
| Morgan           | HTTP logging               |
| CORS             | Cross-origin configuration |
| dotenv           | Environment variables      |
| Nodemon          | Development server         |

---

# 🏗️ Application Architecture

```text
                    NexaAI
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
      Frontend                   Backend
       React                    Express
          │                         │
          │ HTTP/JWT                │
          └─────────────┬───────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
           MongoDB             Gemini API
              │                   │
              │                   │
              ├── Users           ├── AI
              ├── Projects        ├── Streaming
              ├── Usage           └── Conversations
              ├── Generations
              └── Conversations
```

---

# 📦 Application Modules

## Public Pages

```text
/
├── Landing
├── Login
└── Register
```

## User Pages

```text
/dashboard
/projects
/workspace
/chat
/history
/profile
/settings
```

## Admin

```text
/admin
```

---

# ⚙️ Prerequisites

Before installing NexaAI, install:

* Node.js 18+
* npm
* MongoDB or MongoDB Atlas
* Google Gemini API key

Verify Node.js:

```bash
node --version
```

Verify npm:

```bash
npm --version
```

---

# 🚀 Project Installation

Clone the repository:

```bash
git clone <your-github-repository-url>
```

Enter the project:

```bash
cd capstone-project-main
```

The project contains:

```text
Backend/
Frontend/
```

---

# 📦 Backend Installation

```bash
cd Backend
npm install
```

---

# 📦 Frontend Installation

Open another terminal:

```bash
cd Frontend
npm install
```

---

# 🔑 Environment Variables

## Backend

Create:

```text
Backend/.env
```

Add:

```env
PORT=5000

MONGODB_URI=your-mongodb-connection-string

JWT_SECRET=your-long-random-jwt-secret

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your-gemini-api-key

GEMINI_MODEL=gemini-3.1-flash-lite
```

---

## Frontend

Create:

```text
Frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# ⚠️ Environment Security

Never commit:

```text
.env
```

to GitHub.

Never expose:

```text
GEMINI_API_KEY
JWT_SECRET
MONGODB_URI
```

in frontend code.

The Gemini API key must remain on the backend.

---

# 🤖 Gemini API Setup

NexaAI uses Google's Gemini API for AI generation.

Create an API key using Google AI Studio:

```text
https://aistudio.google.com/apikey
```

Add the key to:

```text
Backend/.env
```

Example:

```env
GEMINI_API_KEY=your-api-key
```

Model:

```env
GEMINI_MODEL=gemini-3.1-flash-lite
```

Restart the backend after changing `.env`.

---

# 🗄️ MongoDB Setup

NexaAI uses MongoDB.

## MongoDB Atlas

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Configure network access.
5. Copy the MongoDB connection string.
6. Add it to `.env`.

Example:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexaai
```

## Local MongoDB

Example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/nexaai
```

---

# 🌱 Database Seeding

The backend includes demo seed data.

Run:

```bash
cd Backend
npm run seed
```

The seed script creates demo:

* Users
* Admin account
* Projects
* Generations
* Usage records

> Do not run the seed script against a production database containing real user data.

---

# ▶️ Running the Application

## Start Backend

```bash
cd Backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "NexaAI backend is running."
}
```

---

## Start Frontend

Open another terminal:

```bash
cd Frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 👥 Demo Accounts

After running:

```bash
npm run seed
```

you can use:

## Admin

```text
Email:
admin@nexaai.com

Password:
Admin@123
```

## User

```text
Email:
user@nexaai.com

Password:
User@123
```

Change these credentials before production deployment.

---

# 🔄 AI Generation Flow

The AI generation process works as follows:

```text
User enters prompt
        │
        ▼
Frontend validation
        │
        ▼
JWT authentication
        │
        ▼
Project ownership validation
        │
        ▼
Usage limit validation
        │
        ▼
Reserve usage
        │
        ▼
Gemini API
        │
        ▼
Streaming response
        │
        ▼
Frontend displays chunks
        │
        ▼
Generation completed
        │
        ▼
Save generation
        │
        ▼
Save conversation
        │
        ▼
Record actual tokens
        │
        ▼
Finalize usage
```

---

# 🌊 Streaming

NexaAI uses streaming AI responses.

Instead of waiting for the entire response:

```text
Generate
   ↓
Wait
   ↓
Complete response
```

the application receives:

```text
Generate
   ↓
Chunk 1
   ↓
Chunk 2
   ↓
Chunk 3
   ↓
Chunk 4
   ↓
Completed
```

This creates a more responsive AI experience.

The backend uses Server-Sent Events (SSE) to stream generated content to the React frontend.

---

# 💾 Persistent Output

Generated output is saved to MongoDB after successful completion.

The frontend also maintains the streamed content in React state.

Therefore:

```text
Gemini streaming
       ↓
React output state
       ↓
Complete output
       ↓
MongoDB
```

The output remains visible after generation finishes and can be restored from conversation/generation history.

---

# 🔗 Project-Specific Generation

Each AI generation belongs to a project.

Example:

```text
Project A
    │
    ├── Conversation 1
    ├── Conversation 2
    └── Generations

Project B
    │
    ├── Conversation 1
    └── Generations
```

Project ownership is validated on the backend.

This prevents a user from generating content using another user's project ID.

---

# 📡 API Overview

Base API URL:

```text
http://localhost:5000/api
```

---

## Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

---

## Projects

```text
GET    /projects
GET    /projects/:id
POST   /projects
PUT    /projects/:id
DELETE /projects/:id
```

---

## AI Generations

```text
GET    /generations
GET    /generations/usage
POST   /generations
POST   /generations/stream
POST   /generations/:id/regenerate
DELETE /generations/:id
```

---

## Conversations

```text
GET    /conversations
POST   /conversations
GET    /conversations/:id
DELETE /conversations/:id
```

---

## Profile

```text
GET /profile
PUT /profile
PUT /profile/password
```

---

## Admin

```text
GET    /admin/dashboard
GET    /admin/users
PUT    /admin/users/:id/role
PUT    /admin/users/:id/status
DELETE /admin/users/:id
```

---

## Health

```text
GET /health
```

---

# 🛣️ Frontend Routes

| Route        | Access | Description        |
| ------------ | ------ | ------------------ |
| `/`          | Public | Landing page       |
| `/login`     | Public | Login              |
| `/register`  | Public | Registration       |
| `/dashboard` | User   | Dashboard          |
| `/projects`  | User   | Project management |
| `/workspace` | User   | AI workspace       |
| `/chat`      | User   | AI conversations   |
| `/history`   | User   | Generation history |
| `/profile`   | User   | Profile            |
| `/settings`  | User   | Settings           |
| `/admin`     | Admin  | Admin dashboard    |

Project-specific workspace:

```text
/workspace?project=<project-id>
```

---

# 📂 Project Structure

```text
capstone-project-main/
│
├── Backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── conversationController.js
│   │   ├── generationController.js
│   │   ├── profileController.js
│   │   └── projectController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── Conversation.js
│   │   ├── Generation.js
│   │   ├── Project.js
│   │   ├── Usage.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── generationRoutes.js
│   │   ├── profileRoutes.js
│   │   └── projectRoutes.js
│   │
│   ├── scripts/
│   │   └── seed.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   └── usageService.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── DOCUMENTATION_API.md
├── README.md
└── .gitignore
```

---

# 🔐 Security

NexaAI implements:

* JWT authentication
* Password hashing
* Protected routes
* Role-based authorization
* Project ownership validation
* User-scoped conversations
* User-scoped generation history
* Backend-only Gemini API key
* Environment variables for secrets
* CORS configuration
* Input validation
* Usage-limit enforcement
* Error handling

For production, additional security measures such as rate limiting, HTTPS, stronger validation, audit logs, and secret management should be added.

---

# 🐛 Troubleshooting

## Backend does not start

Check:

```bash
node --version
npm --version
```

Then:

```bash
cd Backend
npm install
npm run dev
```

---

## `Cannot access 'app' before initialization`

Make sure:

```javascript
const app = express();
```

appears before:

```javascript
app.use(...)
```

or:

```javascript
app.get(...)
```

---

## MongoDB connection error

Check:

```env
MONGODB_URI=...
```

Make sure MongoDB is running or your Atlas network access allows your IP.

---

## Gemini API error

Check:

```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.1-flash-lite
```

Restart the backend after modifying `.env`.

---

## Frontend cannot connect to backend

Check:

```env
VITE_API_URL=http://localhost:5000/api
```

Then open:

```text
http://localhost:5000/api/health
```

---

## Project created but AI generation fails

Check that the URL contains:

```text
/workspace?project=<project-id>
```

Also verify the project document contains:

```text
owner
```

matching the authenticated user's MongoDB ID.

---

## Generated output disappears

The frontend must retain the streamed output and only replace it with the final server response if a valid final response exists.

The backend sends:

```text
event: delta
```

for streaming chunks.

After completion:

```text
event: done
```

contains the complete result.

---

## HTTP 429 error

A 429 response can come from:

1. Application usage limits.
2. Gemini API quota/rate limits.

Check the response body in browser DevTools.

For application usage, inspect:

```text
Backend/services/usageService.js
```

Check:

```text
generations
tokensUsed
tokensReserved
```

---

## Profile route returns 404

Verify `server.js` includes:

```javascript
const profileRoutes =
    require("./routes/profileRoutes");

app.use(
    "/api/profile",
    profileRoutes
);
```

---

# 🧪 Development Commands

## Backend

Install:

```bash
npm install
```

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Seed:

```bash
npm run seed
```

---

## Frontend

Install:

```bash
npm install
```

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

---

# 🚀 Production Checklist

## Environment

* [ ] Production MongoDB configured
* [ ] Strong JWT secret configured
* [ ] Production Gemini API key configured
* [ ] Production frontend URL configured
* [ ] Production backend URL configured
* [ ] `.env` excluded from Git
* [ ] Demo credentials changed

## Backend

* [ ] HTTPS enabled
* [ ] CORS restricted
* [ ] Rate limiting enabled
* [ ] Request validation enabled
* [ ] Error logging configured
* [ ] MongoDB backups configured
* [ ] Gemini usage monitored
* [ ] Admin authorization verified

## Frontend

* [ ] Production build tested
* [ ] Responsive UI tested
* [ ] Mobile navigation tested
* [ ] Authentication tested
* [ ] Logout tested
* [ ] Session expiry tested
* [ ] API URL configured

## Database

* [ ] Production database created
* [ ] Database user configured
* [ ] Database backups enabled
* [ ] Seed script not executed on production
* [ ] Indexes reviewed

---

# 🎓 Capstone Project Highlights

NexaAI demonstrates a complete full-stack SaaS architecture.

## Frontend Development

* React component architecture
* React Router
* Protected routes
* Authentication state
* API service abstraction
* Responsive design
* Dashboard UI
* Charts
* AI streaming interface
* Mobile navigation

## Backend Development

* REST API
* Express
* MVC-style architecture
* JWT authentication
* Role-based authorization
* Middleware
* Error handling
* Service layer
* AI integration
* Streaming API
* Usage management

## Database

MongoDB stores:

```text
Users
Projects
Conversations
Generations
Usage
```

Relationships are maintained using MongoDB ObjectIds and Mongoose references.

## Artificial Intelligence

The project demonstrates:

* Gemini API integration
* AI content generation
* Streaming responses
* Multi-turn conversations
* Persistent AI memory
* Token tracking
* Usage limits
* Generation history

## SaaS Architecture

The application separates:

```text
Authentication
        │
        ├── Projects
        │
        ├── AI Workspace
        │
        ├── Conversations
        │
        ├── Generation History
        │
        ├── Usage
        │
        ├── Profile
        │
        └── Administration
```

This modular architecture makes the application easier to maintain and extend.

---

# 🔮 Future Enhancements

Potential future improvements include:

* Subscription billing
* Stripe integration
* Team workspaces
* Project collaboration
* File uploads
* PDF/document analysis
* RAG
* Vector database
* Prompt templates
* AI model selection
* Advanced analytics
* Customer API keys
* Email notifications
* Audit logs
* Automated testing
* CI/CD
* Docker
* Redis rate limiting
* Background AI jobs
* Cloud object storage
* AI image generation
* Voice input/output

---

# 📄 License

This project was developed as an educational/capstone project.

Add your preferred license before public distribution.

Example:

```text
MIT License
```

---

# 👨‍💻 Project

## NexaAI

AI-powered SaaS workspace for modern content creation and intelligent project management.

### Core Technologies

```text
React
Node.js
Express
MongoDB
Mongoose
JWT
Gemini API
Vite
```

### Main Capabilities

```text
Authentication
Projects
AI Generation
Streaming
AI Chat
Conversation Memory
Generation History
Usage Limits
Profile
Admin Dashboard
Responsive UI
```

---

## ⭐ NexaAI

> Create. Converse. Generate. Manage.

```
