# NexaAI Capstone

A full-stack AI SaaS capstone application built with React/Vite, Express, MongoDB, JWT authentication, Gemini streaming, project workspaces, persistent multi-turn conversations, generation history, profile/settings, and admin management.

## Stack

- Frontend: React 19, Vite, React Router, Axios, Recharts, Lucide
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcrypt
- AI: Google Gemini API with streaming
- Authentication: JWT bearer tokens

## Run locally

### 1. Backend

```bash
cd Backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

Set these values in `Backend/.env`:

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.1-flash-lite
```

### 2. Frontend

```bash
cd Frontend
npm install
copy .env.example .env
npm run dev
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

`Frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Demo accounts after seeding

- Admin: `admin@nexaai.com` / `Admin@123`
- User: `user@nexaai.com` / `User@123`

## Important

Do not commit either `.env` file or API keys. The `.env.example` files are safe templates.

The backend mounts all application routes, including profile and admin routes:

- `/api/auth`
- `/api/projects`
- `/api/generations`
- `/api/conversations`
- `/api/profile`
- `/api/admin`

The workspace accepts `/workspace?project=<projectId>`. Creating a project automatically navigates to the newly created project, so seeded and user-created projects use the same AI generation path.
