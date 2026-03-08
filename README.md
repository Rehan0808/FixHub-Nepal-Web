# FixHub Nepal - Web & Backend

FixHub Nepal is a comprehensive service management platform designed to connect users with service providers in Nepal. This repository contains the source code for both the Web Frontend and the Backend API.

## 🛠 Tech Stack

### Backend
- **Core:** Node.js, Express, TypeScript
- **Database:** 
  - PostgreSQL (via Prisma ORM) for structured data (Users, Bookings, Services).
  - MongoDB (via Mongoose) for flexible data structures.
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt.js
- **Media Handling:** Multer for file uploads.
- **Real-time:** Socket.io for live messaging and notifications.
- **AI Integration:** Groq SDK (implemented in `gemini` and `chatbot` modules) for an intelligent help bot.
- **Payment Gateway:** eSewa Integration for secure transactions.

### Web Frontend
- **Framework:** Next.js (React), TypeScript
- **Styling:** Tailwind CSS for a modern, responsive UI.
- **Animations:** Framer Motion for smooth transitions and interactive elements.
- **Maps & Location:** Leaflet and React-Leaflet for map-based service selection and booking.
- **State & APIs:** Axios for HTTP requests and Socket.io-client for real-time updates.

## 🔥 Key Features

- **AI-Powered Chatbot:** Integrated Groq AI to assist users with service queries and troubleshooting.
- **Admin Dashboard:** Comprehensive analytics and management interface built with Recharts.
- **Map-Based Booking:** Users can pick locations directly from a map for precise service delivery.
- **eSewa Payment:** Full integration with Nepal's leading payment gateway for seamless bookings.
- **Real-time Communication:** Live messaging between users and service providers.
- **Responsive Design:** Optimized for all screen sizes using modern CSS techniques.

## 🚀 Getting Started

### Backend Setup
1. Navigate to `fixhub-nepal-backend`.
2. Install dependencies: `npm install`.
3. Configure environment variables in `.env` (DB URLs, JWT Secret, Groq API Key, eSewa credentials).
4. Run migrations: `npx prisma migrate dev`.
5. Start server: `npm run dev`.

### Web Frontend Setup
1. Navigate to `fixhub-nepal-frontend`.
2. Install dependencies: `npm install`.
3. Configure environment variables in `.env.local`.
4. Start development server: `npm run dev`.

## 📂 Project Structure
- `fixhub-nepal-backend/`: Node.js/Express API.
- `fixhub-nepal-frontend/`: Next.js web application.
- `prisma/`: Database schema and migrations.
- `src/controllers/`: Business logic for different modules.
- `src/routes/`: API endpoint definitions.
