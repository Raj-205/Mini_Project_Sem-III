# Student Expense Tracker - Project and Connection Notes

## Project Overview

This workspace contains a React/Vite frontend and an Express/MongoDB backend for a student expense tracker.

- `frontend/`: React application, UI pages, and API client.
- `backend/`: Express API, authentication, transaction endpoints, and MongoDB models.

## Frontend and Backend Connection

The frontend sends API requests to the backend using the shared Axios instance in `frontend/src/utils/axiosInstance.js`. The base API URL is configured in `frontend/src/utils/apiPath.js` and can be overridden with the frontend environment variable `VITE_API_URL`.

The local development settings are aligned as follows:

| Setting | Local value | Purpose |
| --- | --- | --- |
| Backend `PORT` | `5000` | Port used by Express |
| Frontend `VITE_API_URL` | `http://localhost:5000` | Backend base URL used by Axios |
| Backend `FRONTEND_URL` | `http://localhost:5173` | Browser origin allowed by CORS |

The backend applies CORS middleware with credentials enabled. It allows `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS`, and accepts `Content-Type` and `Authorization` headers. For local development, open the frontend at `http://localhost:5173` so its origin matches `FRONTEND_URL`.

### Connection Change Made

The backend `.env` configures port `5000`, but the frontend had been pointing at port `8000`. That mismatch meant API requests could go to the wrong port. The frontend target was corrected in two places:

- `frontend/.env`: `VITE_API_URL=http://localhost:5000`
- `frontend/src/utils/apiPath.js`: fallback API URL changed to `http://localhost:5000`

The fallback keeps the frontend pointed at the local backend if `VITE_API_URL` is not provided. Vite reads environment variables at startup, so restart the frontend dev server after changing `frontend/.env`.

## Local Setup

Prerequisites: Node.js with npm, a reachable MongoDB database, and the environment variables listed below.

Install dependencies once in each app folder:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

Create or update `backend/.env` with the required values. Do not commit `.env` files or share their secret values:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a strong private signing secret>
GOOGLE_CLIENT_ID=<OAuth client ID, if email/reset-password integration is used>
GOOGLE_CLIENT_SECRET=<OAuth client secret, if email/reset-password integration is used>
GOOGLE_REFRESH_TOKEN=<OAuth refresh token, if email/reset-password integration is used>
GOOGLE_USER=<sender email, if email/reset-password integration is used>
```

The frontend `.env` should contain:

```env
VITE_API_URL=http://localhost:5000
```

Start the backend and frontend in separate terminals from the workspace root:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173`. The backend root health endpoint is `http://localhost:5000/` and should return a JSON status response when the server is running.

## API Routes

All API routes use the `/api/v1` prefix.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Register a user |
| `POST` | `/api/v1/auth/login` | No | Sign in and receive a token |
| `GET` | `/api/v1/auth/me` | Bearer token | Get the current user |
| `POST` | `/api/v1/auth/forgot-password` | No | Start password/E-PIN recovery |
| `POST` | `/api/v1/auth/reset-password` | No | Reset password/E-PIN |
| `GET` | `/api/v1/income` | Bearer token | List the signed-in user's income records |
| `POST` | `/api/v1/income` | Bearer token | Add an income record |
| `DELETE` | `/api/v1/income/:id` | Bearer token | Delete an income record |
| `GET` | `/api/v1/expenses` | Bearer token | List the signed-in user's expense records |
| `POST` | `/api/v1/expenses` | Bearer token | Add an expense record |
| `DELETE` | `/api/v1/expenses/:id` | Bearer token | Delete an expense record |
| `GET` | `/api/v1/dashboard` | Bearer token | Get balance totals and recent transactions |

For protected endpoints, the Axios request interceptor reads the token from browser `localStorage` and sends it as `Authorization: Bearer <token>`. If the API returns `401`, the frontend removes the stored token and redirects to `/login`.

## Verification Performed

- `npm run build` in `frontend/` completed successfully after the API URL was aligned.
- The frontend loaded at `http://localhost:5173`.
- The backend health endpoint at `http://localhost:5000/` returned HTTP `200` with an OK status response.
- A browser request from the frontend origin to the backend health endpoint also returned HTTP `200`.
- Backend startup output confirmed it was listening on port `5000`, accepting requests from `http://localhost:5173`, and connected to MongoDB.

## Troubleshooting

- **Connection refused / network error:** Confirm the backend is running on port `5000`, and check `VITE_API_URL` in `frontend/.env`.
- **CORS error:** Open the frontend using the exact origin configured in backend `FRONTEND_URL`; local default is `http://localhost:5173`. Restart the backend after changing its `.env`.
- **Frontend still calls the old port:** Restart Vite after changing `frontend/.env`; environment values are loaded when Vite starts.
- **MongoDB connection issue:** Check `MONGO_URI` in `backend/.env` and confirm the database can be reached.
- **Protected endpoint responds with `401`:** Sign in again to obtain a valid token and confirm `JWT_SECRET` is configured consistently for the backend.
- **Email or password recovery fails:** Check the Google OAuth/email environment variables if that integration is being used.
