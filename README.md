# Sansei

Sansei is a full-stack web application consisting of a React + TypeScript frontend and a Node.js + Express + Prisma backend.

## Project Structure

```
├── sansai/           # Frontend (React 19, TypeScript, Vite, TailwindCSS, Redux Toolkit)
├── SansaiBackend/    # Backend (Node.js, Express, TypeScript, Prisma, PostgreSQL)
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- [Yarn](https://yarnpkg.com/) or `npm`

---

### 2. Backend Setup (`SansaiBackend`)

1. Navigate to the backend directory:
   ```bash
   cd SansaiBackend
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your PostgreSQL database URL, JWT secret, Cloudinary, and Razorpay credentials.

4. Run Prisma migrations and generate client:
   ```bash
   yarn generate
   yarn migrate:dev
   ```

5. Start the backend development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

Backend server runs by default on `http://localhost:3001`.

---

### 3. Frontend Setup (`sansai`)

1. Navigate to the frontend directory:
   ```bash
   cd sansai
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Start the frontend development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

Frontend application runs by default on `http://localhost:5173`.

---

## Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS
- **State Management:** Redux Toolkit
- **Routing:** React Router v7
- **UI & Animations:** Framer Motion, Lucide Icons, Recharts, Canvas Confetti

### Backend
- **Server:** Node.js + Express + TypeScript
- **Database ORM:** Prisma ORM with PostgreSQL
- **Authentication:** JWT, Google Auth Library, Bcrypt
- **Cloud Storage:** Cloudinary
- **Payment Gateway:** Razorpay
- **Documentation:** Swagger UI Express
