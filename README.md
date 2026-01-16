# Kehadiran - Attendance System

Web-based attendance system with check-in/check-out functionality.

## Tech Stack

- **Backend**: Express.js + Better Auth + MySQL
- **Frontend**: SvelteKit
- **Database**: MySQL (Supabase-ready)

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
cd backend && npm run db:migrate

# Run development
npm run dev
```

## Project Structure

```
kehadiran/
├── backend/     # Express.js API
├── frontend/    # SvelteKit Web App
└── docs/        # Documentation
```

## Environment Variables

Copy `.env.example` to `.env` in the backend folder and configure:

```env
DB_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_DATABASE=kehadiran
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| POST | /api/attendance/check-in | Check in |
| POST | /api/attendance/check-out | Check out |
| GET | /api/attendance/today | Today's attendance |
