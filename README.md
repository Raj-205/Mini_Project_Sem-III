# Student Expense Tracker – how to run

Open TWO terminals.

## 1) Backend  (folder: testing/backend)
    cd backend
    npm install        # only needed if node_modules is missing
    npm run dev        # or: npm start
Needs `backend/.env` (already included) with: PORT, MONGO_URI, JWT_SECRET, FRONTEND_URL
(+ GOOGLE_* for the forgot-password email). Expect: "Server running on port 5000"
and "MongoDB Connected successfully".

## 2) Frontend (folder: testing/frontend)
    cd frontend
    npm install        # fixes "vite is not recognised"
    npm run dev
Needs `frontend/.env` (already included): VITE_API_URL=http://localhost:5000
Open http://localhost:5173

If you get "vite is not recognised" or "Cannot find module 'dotenv'", you are in the
wrong folder or node_modules is missing -> run `npm install` inside that folder.
