
# Student Expense Tracker

A clean full-stack expense management application for students. The project helps users record income and expenses, view their financial summary, analyze spending through charts, and export records as Excel files.

## Table of Contents

- [Project Overview](#project-overview)
- [Why Student Expense Tracker](#why-student-expense-tracker)
- [Core Objectives](#core-objectives)
- [Key Features](#key-features)
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
- [Team](#team)
- [Institute](#institute)
- [Project Links](#project-links)
- [References](#references)
- [Future Scope](#future-scope)
- [Conclusion](#conclusion)

## Project Overview



Student Expense Tracker is a responsive MERN application that allows a user to manage personal income and expenses from one dashboard. The application includes authentication, transaction management, visual summaries, profile-image upload, and Excel export.

The project is suitable for students who want a simple way to track scholarship money, family support, freelance income, food, travel, books, rent, recharge, and other daily expenses.

## Why Student Expense Tracker

Students often manage money from different sources but do not maintain a clear record of where it is spent. This project provides a single, organized interface for recording transactions and understanding financial activity.

The application focuses on the essential functions required in the video without adding unnecessary modules or complex features.

## Core Objectives

- Create secure user registration and login.
- Store income and expense records for each user.
- Calculate total income, total expense, and current balance.
- Display recent transactions in an easy-to-read dashboard.
- Represent financial information using simple charts.
- Allow users to delete records and download Excel reports.
- Provide a responsive interface for desktop and mobile screens.

## Key Features

| Feature | Description |
| --- | --- |
| User authentication | Signup, login, logout, and protected user-specific data using JWT. |
| Profile image | Upload and display a user profile image. |
| Dashboard | Displays balance, total income, total expense, recent transactions, and charts. |
| Income management | Add, view, delete, and export income records. |
| Expense management | Add, view, delete, and export expense records. |
| Charts | Shows financial overview and recent income/expense trends. |
| Excel export | Downloads income and expense records as spreadsheet files. |
| Responsive design | Works across desktop, tablet, and mobile screen sizes. |
| Notifications | Shows success and error messages after user actions. |

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
| Users, Income, Expenses    |
+----------------------------+
```

The frontend sends requests to the Express API. The backend authenticates the request, performs the required database operation, and sends a JSON response back to React.

## End-to-End Workflow

1. The user creates an account using the signup page.
2. The backend validates the details and hashes the password.
3. After login, the backend returns a JWT token.
4. The frontend uses the token when calling protected APIs.
5. The user adds income and expense records.
6. MongoDB stores each record with the authenticated user's ID.
7. The dashboard requests totals, recent transactions, and chart data.
8. The user can delete a transaction or download an Excel report.
9. On logout, the frontend removes the authentication session.

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
Landing / Login
       ↓
    Signup or Login
       ↓
     Dashboard
     ↙        ↘
Income       Expenses
  ↓             ↓
Add/List/Delete  Add/List/Delete
  ↓             ↓
Excel Export   Excel Export
```

The dashboard combines both transaction types and calculates the current balance:

```text
Total Balance = Total Income - Total Expense
```

## Project Folder Structure

```text
student-expense-tracker/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── Cards/
│   │   │   ├── Charts/
│   │   │   ├── Dashboard/
│   │   │   ├── Expense/
│   │   │   ├── Income/
│   │   │   ├── Inputs/
│   │   │   ├── Layout/
│   │   │   └── common/
│   │   ├── context/
│   │   │   └── userContext.jsx
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── SignUp.jsx
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Income/
│   │   │   │   └── Income.jsx
│   │   │   └── Expense/
│   │   │       └── Expense.jsx
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
│   │   ├── incomeController.js
│   │   ├── expenseController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Income.js
│   │   └── Expense.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/
│   │   └── profile-images/
│   ├── utils/
│   │   ├── createToken.js
│   │   └── excelExport.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── README.md
└── LICENSE
```

## Technology Stack

| Layer | Technology | Use |
| --- | --- | --- |
| Frontend | React.js | User interface and reusable components. |
| Styling | Tailwind CSS | Responsive utility-first styling. |
| Routing | React Router | Navigation between application pages. |
| HTTP client | Axios | Communication between frontend and backend. |
| State management | React Context API | Shared authentication and user state. |
| Charts | React chart library | Pie, bar, and line data visualization. |
| Backend | Node.js | Server-side JavaScript runtime. |
| API framework | Express.js | REST API routes and middleware. |
| Database | MongoDB | Stores users, income, and expense documents. |
| ODM | Mongoose | MongoDB schemas and database queries. |
| Authentication | JSON Web Token | Protects private API routes. |
| Password security | bcrypt | Hashes user passwords. |
| File upload | Multer or equivalent | Handles profile-image uploads. |
| Excel export | XLSX or equivalent | Creates downloadable spreadsheet files. |
| Configuration | dotenv | Loads environment variables. |

## Frontend Architecture

The frontend is a React single-page application.

- `pages/` contains complete screens such as Login, SignUp, Dashboard, Income, and Expense.
- `components/` contains reusable forms, cards, charts, sidebar elements, and common UI components.
- `context/` stores shared user and authentication state.
- `utils/axiosInstance.js` configures API communication and authentication headers.
- `utils/helper.js` contains formatting and chart-data helper functions.
- Tailwind CSS provides responsive styling.

## Backend Architecture

The backend follows a route-controller-model structure.

- `routes/` defines the API endpoints.
- `controllers/` contains validation, calculations, database operations, and responses.
- `models/` defines Mongoose schemas for users, income, and expenses.
- `middleware/authMiddleware.js` verifies JWT tokens.
- `middleware/uploadMiddleware.js` handles profile-image uploads.
- `config/db.js` connects the server to MongoDB.
- `utils/excelExport.js` creates spreadsheet downloads.
- `server.js` starts Express, loads middleware, connects the database, and registers routes.

## Security Architecture

- Passwords are hashed before storage.
- Protected routes require a valid JWT.
- Every income and expense query is filtered using the authenticated user's ID.
- A user can delete only their own records.
- Database credentials and JWT secrets are stored in `.env` files.
- `.env`, uploads, and generated private data should not be committed to GitHub.
- Input validation should be applied on both frontend and backend.

## Data Flow

```text
User enters transaction
        ↓
Frontend validates form
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
Dashboard refreshes totals and charts
```

### Main data models

#### User

```js
{
  _id: ObjectId,
  fullName: String,
  email: String,
  password: String,
  profileImageUrl: String,
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
  icon: String,
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
  amount: Number,
  date: Date,
  icon: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Overview

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Register a new user. |
| `POST` | `/api/v1/auth/login` | No | Authenticate a user and return a token. |
| `GET` | `/api/v1/auth/me` | Yes | Get current user information. |
| `POST` | `/api/v1/income` | Yes | Add an income record. |
| `GET` | `/api/v1/income` | Yes | List the user's income records. |
| `DELETE` | `/api/v1/income/:id` | Yes | Delete an income record. |
| `GET` | `/api/v1/income/export` | Yes | Download income records. |
| `POST` | `/api/v1/expenses` | Yes | Add an expense record. |
| `GET` | `/api/v1/expenses` | Yes | List the user's expense records. |
| `DELETE` | `/api/v1/expenses/:id` | Yes | Delete an expense record. |
| `GET` | `/api/v1/expenses/export` | Yes | Download expense records. |
| `GET` | `/api/v1/dashboard` | Yes | Get totals, recent transactions, and chart data. |

## Local Development Setup

### Prerequisites

- Node.js and npm.
- MongoDB Atlas or a local MongoDB server.
- Git.

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

## Environment Variables

Create `backend/.env`:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Do not commit these files to GitHub.

## Testing and Validation

Before deployment, verify the following:

- New users can register successfully.
- Incorrect login details are rejected.
- Protected pages cannot be opened without authentication.
- Income records are created with valid amount, source, and date values.
- Expense records are created with valid amount, category, and date values.
- Dashboard totals equal the stored transaction data.
- Charts display correct income and expense information.
- Users cannot access or delete another user's records.
- Excel files download correctly.
- The interface works on mobile and desktop screens.

## Project Documentation

This README documents the project purpose, features, architecture, folder structure, database design, API routes, setup process, security practices, and future scope. Add screenshots, a live-demo link, and your repository URL after completing your own implementation.

## Research Direction

The project can be used as a starting point for studying personal-finance behavior among students. Future analysis could examine common expense categories, monthly spending patterns, and the effect of visual dashboards on budgeting habits.

## Team

| Role | Name |
| --- | --- |
| Project developer | Add your name here |
| Backend developer | Add name here if applicable |
| Frontend developer | Add name here if applicable |
| Project guide | Add guide name here if applicable |

## Institute

- **Institute:** Add your college/institute name.
- **Course:** B.Tech.
- **Academic year:** Add academic year.
- **Department:** Add department name.

## Project Links

- **GitHub repository:** Add repository URL.
- **Live application:** Add deployment URL if available.
- **API:** Add deployed backend URL if available.
- **Demo video:** Add your own demonstration video if available.

## References

- Official React documentation.
- Official Node.js documentation.
- Official Express.js documentation.
- Official MongoDB and Mongoose documentation.
- Official Tailwind CSS documentation.
- Official Axios documentation.
- Official JSON Web Token documentation.

## Future Scope

- Add edit/update functionality for existing transactions.
- Add search and date filters.
- Add monthly budget limits.
- Add recurring income and expense records.
- Add password reset functionality.
- Add cloud storage for profile images.
- Add automated frontend and backend tests.

These improvements should be added only when they are required; the current version intentionally focuses on the main features demonstrated in the project.

## Conclusion

Student Expense Tracker is a simple and practical MERN application for managing personal finances. It combines secure authentication, MongoDB-based transaction storage, dashboard summaries, charts, and Excel export in one responsive system.

The project demonstrates important full-stack concepts: React component design, REST APIs, Express middleware, MongoDB data modeling, JWT authentication, file upload handling, and frontend-backend integration.
