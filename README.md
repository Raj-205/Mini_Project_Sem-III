# Student Expense Tracker

A full-stack expense management application for students. The project helps users record income and expenses, split shared bills with friends, review their full transaction history, and understand their spending through live charts, with a light and dark theme.

## Table of Contents

- [Project Overview](#project-overview)
- [Why Student Expense Tracker](#why-student-expense-tracker)
- [Core Objectives](#core-objectives)
- [Key Features](#key-features)
- [Split Expenses](#split-expenses)
- [System Architecture](#system-architecture)
- [End-to-End Workflow](#end-to-end-workflow)
- [Working Pipeline](#working-pipeline)
- [Application Flow](#application-flow)
- [Project Folder Structure](#project-folder-structure)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Security Architecture](#security-architecture)
- [Data Flow](#data-flow)
- [API Overview](#api-overview)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Testing and Validation](#testing-and-validation)
- [Project Documentation](#project-documentation)
- [Research Direction](#research-direction)
- [Project Links](#project-links)
- [References](#references)
- [Future Scope](#future-scope)
- [Conclusion](#conclusion)

## Project Overview

Student Expense Tracker is a responsive MERN application that allows a user to manage personal income and expenses from one dashboard. The application includes authentication with password or E-PIN login, email-OTP password reset, transaction management, a month-wise dashboard, a combined history view, bill splitting with in-app notifications, real-time analysis charts, an editable profile, and a dark/light theme.

The project is suitable for students who want a simple way to track scholarship money, family support, freelance income, food, travel, books, rent, recharge, and shared costs with friends or roommates.

## Why Student Expense Tracker

Students often manage money from different sources but do not maintain a clear record of where it is spent. Shared costs such as meals, trips, and rent make this harder, because only part of a bill is really the student's own expense.

This project provides a single, organized interface for recording transactions, splitting bills so that each person's real share is tracked, and understanding financial activity through charts.

## Core Objectives

- Create secure user registration and login, with password reset by email OTP.
- Store income and expense records for each user.
- Show totals and balance for a selected month, with this month and last month one click apart.
- Show a complete, filterable history built from the user's income and expenses.
- Let a user pay a bill in full, split it with friends, and record only their own share as an expense.
- Notify registered friends inside the app so they can accept or decline their share.
- Represent financial information using live charts built from the logged-in user's own data.
- Prevent transactions from being dated in the future.
- Provide a responsive interface with a light and a dark theme.

## Key Features

| Feature | Description |
| --- | --- |
| User authentication | Signup, login with password or E-PIN, logout, and protected user-specific data using JWT. |
| Password reset | A 6-digit OTP is emailed to the user (valid for 10 minutes) and is used to set a new password and E-PIN. |
| Dashboard | Shows balance, income, expenses, and transactions for the selected month, with **This month** and **Last month** tabs. |
| Income management | Add, view, and delete income records. |
| Expense management | Add, view, and delete expense records. Split shares appear here with a "Split: ..." note. |
| Split expenses | Pay a full bill, add friends by username, divide the amount equally or with custom shares. See [Split Expenses](#split-expenses). |
| Notifications | A bell dropdown in the top bar shows split requests and updates, with an unread badge. Friends can accept or decline. |
| History | One list of all income and expenses for the logged-in user, with a filter and delete option. |
| Spend analysis | Live charts: cumulative spending (this month vs last month), spending by category, and income vs expense for the last 6 months. |
| Profile | Shows the details given at registration as read-only. Fields can be edited only after clicking **Edit**. |
| Dark / light mode | A toggle in the top bar. The choice is remembered in the browser. |
| Date rules | The date picker in income, expense, and split forms does not allow days after today. The server checks this too. |
| Responsive design | Works across desktop, tablet, and mobile screen sizes. |

## Split Expenses

The Split page works like the Income and Expense pages. The user who paid the bill is the **payer**.

1. The payer enters the title, category, total bill amount, and date.
2. The payer adds friends by **username**. The app checks whether the username exists:
   - **Registered friend:** is added with a notification badge and will receive a request.
   - **Not on the site:** is added as a **guest** by name. No notification is sent, and the payer tracks that share.
3. The amount is divided **equally**, or the payer can enter **custom amounts**. Any rounding remainder is kept on the payer.
4. The payer's own share is saved in the payer's **Expense** section immediately.
5. Each registered friend receives a notification in the bell dropdown.
6. The friend can **Accept** (their share is added to their own expenses) or **Decline**.
7. The payer receives a notification about the friend's reply, and the status on the Split page changes (`pending`, `accepted`, `declined`, `guest`).

```text
Payer pays full bill
        ↓
Add friends by username
        ↓
Amount divided (equal / custom)
        ↓
Payer's share → payer's Expenses
        ↓
Registered friends → bell notification
        ↓
Accept → share added to friend's Expenses
Decline → no expense is created
        ↓
Payer is notified of the reply
```

## System Architecture

```text
+----------------------------+
| React Frontend             |
| Pages, Forms, Charts, UI   |
+-------------+--------------+
              |
              | Axios HTTP requests
              v
+----------------------------+
| Node.js + Express Backend  |
| Routes, Controllers, JWT   |
+-------------+--------------+
              |
              | Mongoose
              v
+----------------------------+
| MongoDB Database           |
| Users, Income, Expenses,   |
| Splits, Notifications      |
+----------------------------+
```

The frontend sends requests to the Express API. The backend authenticates the request, performs the required database operation, and sends a JSON response back to React. The notification bell, dashboard, and analysis page refresh from the API on a timer, so new data appears without a manual reload.

## End-to-End Workflow

1. The user creates an account using the signup page (username, name, mobile number, email, password, and E-PIN).
2. The backend validates the details and hashes the password and E-PIN.
3. After login with a password or an E-PIN, the backend returns a JWT token.
4. The frontend uses the token when calling protected APIs.
5. The user adds income and expense records, or splits a bill with friends.
6. MongoDB stores each record with the authenticated user's ID.
7. Registered friends receive a notification and accept or decline their share.
8. The dashboard requests totals and recent transactions for the selected month. The analysis page requests chart data.
9. The user can delete a transaction, open the history, or edit their profile.
10. On logout, the frontend removes the authentication session.

## Working Pipeline

```text
User action
    ↓
React form or button
    ↓
Axios API request
    ↓
JWT authentication middleware
    ↓
Express route
    ↓
Controller validation and business logic
    ↓
Mongoose database operation
    ↓
JSON response
    ↓
React state update and UI refresh
```

## Application Flow

```text
Login / Signup / Reset Password
              ↓
          Dashboard  ── This month / Last month
   ┌─────┬────┴────┬─────────┬──────────┐
 Income Expense  Split    History   Analysis
   │      │        │          │         │
 Add/   Add/    Add/Accept   Filter/   Live
 List/  List/   Decline      Delete    Charts
 Delete Delete  (bell)
              ↓
   Profile (Edit toggle) · Dark / Light mode
```

The dashboard combines both transaction types for the selected month:

```text
Month Income  = sum of income dated in the selected month
Month Expense = sum of expenses dated in the selected month
Balance       = all income up to the end of the month − all expenses up to the end of the month
```

## Project Folder Structure

```text
student-expense-tracker/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       ├── Layout.jsx        # top bar, notification bell, theme toggle
│   │   │       └── Sidebar.jsx
│   │   ├── context/
│   │   │   ├── userContext.jsx
│   │   │   └── themeContext.jsx      # dark / light mode
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── SignUp.jsx
│   │   │   │   ├── ResetPassword.jsx
│   │   │   │   └── auth.css
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   └── dashboard.css     # shared styles and theme variables
│   │   │   ├── Income/Income.jsx
│   │   │   ├── Expense/Expense.jsx
│   │   │   ├── Split/split.jsx
│   │   │   ├── History/History.jsx
│   │   │   ├── Analysis/Analysis.jsx
│   │   │   └── Profile/Profile.jsx
│   │   ├── utils/
│   │   │   ├── apiPath.js
│   │   │   ├── axiosInstance.js
│   │   │   ├── data.js
│   │   │   └── helper.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js  # income, expense, dashboard, history, analysis
│   │   ├── splitController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Income.js
│   │   ├── Expense.js
│   │   ├── Split.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── splitRoutes.js
│   │   ├── userRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   ├── analysis.js               # chart data and split-share calculation
│   │   └── dates.js                  # future-date check
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Technology Stack

| Layer | Technology | Use |
| --- | --- | --- |
| Frontend | React.js (Vite) | User interface and reusable components. |
| Styling | Tailwind CSS and custom CSS | Responsive layout and the light/dark theme variables. |
| Routing | React Router | Navigation between application pages. |
| HTTP client | Axios | Communication between frontend and backend. |
| State management | React Context API | Shared authentication, user, and theme state. |
| Charts | Chart.js with react-chartjs-2 | Line, bar, and doughnut charts. |
| Icons | Lucide React | Interface icons. |
| Backend | Node.js | Server-side JavaScript runtime. |
| API framework | Express.js | REST API routes and middleware. |
| Database | MongoDB | Stores users, income, expenses, splits, and notifications. |
| ODM | Mongoose | MongoDB schemas and database queries. |
| Authentication | JSON Web Token | Protects private API routes. |
| Password security | bcryptjs | Hashes passwords and E-PINs. |
| Email | Nodemailer with Google APIs (OAuth2) | Sends the password-reset OTP through Gmail. |
| Cross-origin access | cors | Allows the frontend origin to call the API. |
| Configuration | dotenv | Loads environment variables. |

## Frontend Architecture

The frontend is a React single-page application.

- `pages/` contains complete screens: Login, SignUp, ResetPassword, Dashboard, Income, Expense, Split, History, Analysis, and Profile.
- `components/Layout/` contains the sidebar and the top bar with the notification bell, the theme toggle, and the user menu.
- `context/userContext.jsx` stores the logged-in user. `context/themeContext.jsx` stores the theme and saves it in the browser.
- `utils/axiosInstance.js` configures API communication and authentication headers.
- `utils/helper.js` contains currency and date formatting, the "today" date used to limit date pickers, and month helpers for the dashboard tabs.
- Theme colours are CSS variables in `dashboard.css`; dark mode changes the variables rather than each component.
- Pages that show live data (dashboard, analysis, notifications, split status) refresh on a timer and when data changes elsewhere in the app.

## Backend Architecture

The backend follows a route-controller-model structure.

- `routes/` defines the API endpoints.
- `controllers/` contains validation, calculations, database operations, and responses.
- `models/` defines Mongoose schemas for users, income, expenses, splits, and notifications.
- `middleware/authMiddleware.js` verifies JWT tokens.
- `config/db.js` connects the server to MongoDB.
- `utils/analysis.js` builds the analysis data (monthly totals, daily cumulative spending, category totals) and calculates split shares.
- `utils/dates.js` rejects dates in the future.
- `server.js` starts Express, loads middleware, connects the database, and registers routes.

History is not a separate collection. It is built on request from the user's Income and Expense records, so it always matches the stored data.

## Security Architecture

- Passwords and E-PINs are hashed before storage.
- Protected routes require a valid JWT.
- Every income, expense, split, history, and notification query is filtered using the authenticated user's ID.
- A user can delete only their own records.
- A user can accept or decline only notifications addressed to them.
- Friend lookup returns only a username and full name, and a user cannot add themselves to a split.
- Password-reset OTPs expire after 10 minutes.
- The cors setting allows only the configured frontend origin.
- Database credentials, JWT secrets, and Google credentials are stored in `.env` files.
- `.env` files and `node_modules` must not be committed to GitHub.
- Input validation is applied on both frontend and backend, including the no-future-date rule.

## Data Flow

```text
User enters transaction
        ↓
Frontend validates form (date limited to today)
        ↓
Axios sends JSON with JWT
        ↓
Backend verifies JWT
        ↓
Controller validates request
        ↓
MongoDB saves transaction
        ↓
Backend returns updated result
        ↓
Dashboard, history, and charts refresh
```

### Main data models

#### User

```js
{
  _id: ObjectId,
  username: String,      // unique, used to find friends for splits
  fullName: String,
  mobileNo: String,
  email: String,         // unique
  password: String,      // hashed
  ePin: String,          // hashed
  resetOtp: String,
  otpExpiry: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Income

```js
{
  _id: ObjectId,
  userId: ObjectId,
  source: String,
  amount: Number,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Expense

```js
{
  _id: ObjectId,
  userId: ObjectId,
  category: String,
  note: String,          // e.g. "Split: Pizza night"
  splitId: ObjectId,     // set when the expense came from a split
  amount: Number,
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Split

```js
{
  _id: ObjectId,
  payerId: ObjectId,
  title: String,
  category: String,
  totalAmount: Number,   // full bill paid by the payer
  payerShare: Number,    // payer's own part
  date: Date,
  participants: [{
    userId: ObjectId,    // null for a guest
    username: String,
    name: String,
    share: Number,
    status: 'pending' | 'accepted' | 'declined' | 'guest'
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification

```js
{
  _id: ObjectId,
  userId: ObjectId,      // who receives it
  type: 'split_request' | 'split_update',
  fromUserId: ObjectId,
  splitId: ObjectId,
  message: String,
  amount: Number,
  status: 'pending' | 'accepted' | 'declined' | 'info',
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Overview

All routes start with `/api/v1`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a new user. |
| `POST` | `/auth/login` | No | Log in with username and password, or username and E-PIN. Returns a token. |
| `GET` | `/auth/me` | Yes | Get current user information. |
| `PUT` | `/auth/me` | Yes | Update name, email, and mobile number. |
| `POST` | `/auth/forgot-password` | No | Email a 6-digit OTP to the user. |
| `POST` | `/auth/reset-password` | No | Set a new password and E-PIN using the OTP. |
| `POST` | `/income` | Yes | Add an income record. |
| `GET` | `/income` | Yes | List the user's income records. |
| `DELETE` | `/income/:id` | Yes | Delete an income record. |
| `POST` | `/expenses` | Yes | Add an expense record. |
| `GET` | `/expenses` | Yes | List the user's expense records. |
| `DELETE` | `/expenses/:id` | Yes | Delete an expense record. |
| `GET` | `/dashboard?month=YYYY-MM` | Yes | Get totals and transactions for a month (defaults to the current month). |
| `GET` | `/history` | Yes | List all income and expenses of the user, newest first. |
| `DELETE` | `/history/:type/:id` | Yes | Delete an item, where `type` is `income` or `expense`. |
| `GET` | `/analysis` | Yes | Get chart data built from the user's income and expenses. |
| `GET` | `/users/lookup?username=` | Yes | Check whether a friend's username is registered. |
| `POST` | `/splits` | Yes | Create a split and notify registered friends. |
| `GET` | `/splits` | Yes | List splits the user paid for or was added to. |
| `GET` | `/notifications` | Yes | List notifications and the unread count. |
| `PUT` | `/notifications/read-all` | Yes | Mark all notifications as read. |
| `PUT` | `/notifications/:id/read` | Yes | Mark one notification as read. |
| `POST` | `/notifications/:id/accept` | Yes | Accept a split request and add the share to expenses. |
| `POST` | `/notifications/:id/decline` | Yes | Decline a split request. |

## Local Development Setup

### Prerequisites

- Node.js and npm.
- MongoDB Atlas or a local MongoDB server.
- Git.
- A Google Cloud OAuth2 client with a refresh token, only if you want the password-reset email to work.

### Installation

```bash
git clone <your-repository-url>
cd student-expense-tracker

cd backend
npm install
npm run dev

# Open a second terminal
cd frontend
npm install
npm run dev
```

Open the local frontend URL displayed by Vite, usually `http://localhost:5173`.

If you see "vite is not recognised" or "Cannot find module 'dotenv'", run `npm install` inside that folder first.

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173

# Password-reset email (Gmail OAuth2)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_gmail_address
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Do not commit these files to GitHub.

When deploying, set `VITE_API_URL` on the frontend host to the deployed backend URL, and set `FRONTEND_URL` on the backend to the deployed frontend URL. Otherwise the browser will block API requests.

## Testing and Validation

Before deployment, verify the following:

- New users can register successfully.
- Incorrect login details are rejected, and both password login and E-PIN login work.
- The password-reset OTP email arrives and the new password works.
- Protected pages cannot be opened without authentication.
- Income and expense records are created with valid amount, source or category, and date values.
- The date pickers do not allow days after today, and the API rejects future dates.
- Dashboard totals for **This month** and **Last month** equal the stored transaction data for those months.
- History shows only the logged-in user's income and expenses, and deleting an item removes it.
- Creating a split adds only the payer's share to the payer's expenses.
- A registered friend receives a bell notification, and accepting adds the share to the friend's expenses.
- A guest friend is saved without a notification.
- Charts on the Analysis page match the stored data and update after new records are added.
- Profile fields are read-only until **Edit** is clicked, and saved changes persist after a refresh.
- The dark/light toggle works on every page and is remembered after a refresh.
- Users cannot access or delete another user's records.
- The interface works on mobile and desktop screens.

## Project Documentation

This README documents the project purpose, features, architecture, folder structure, database design, API routes, setup process, security practices, and future scope. Add screenshots, a live-demo link, and your repository URL after completing your own implementation.

## Research Direction

The project can be used as a starting point for studying personal-finance behavior among students. Future analysis could examine common expense categories, monthly spending patterns, how often shared bills are split, and the effect of visual dashboards on budgeting habits.

## Project Links


- **Live application:** https://student-expense-traker0001.vercel.app/

## References

- Official React documentation.
- Official Node.js documentation.
- Official Express.js documentation.
- Official MongoDB and Mongoose documentation.
- Official Tailwind CSS documentation.
- Official Axios documentation.
- Official Chart.js documentation.
- Official JSON Web Token documentation.
- Official Nodemailer documentation.

## Future Scope

- Add edit/update functionality for existing transactions.
- Add search and date-range filters in History.
- Add a "mark as paid back" option so split balances can be settled.
- Add monthly budget limits with alerts.
- Add recurring income and expense records.
- Add Excel or CSV export of transactions.
- Add a profile image with cloud storage.
- Add automated frontend and backend tests.

## Conclusion

Student Expense Tracker is a practical MERN application for managing personal finances. It combines secure authentication, MongoDB-based transaction storage, a month-wise dashboard, bill splitting with in-app notifications, live analysis charts, and a light/dark interface in one responsive system.

The project demonstrates important full-stack concepts: React component design and context, REST APIs, Express middleware, MongoDB data modeling across related collections, JWT authentication, polling for near real-time updates, and frontend-backend integration.
