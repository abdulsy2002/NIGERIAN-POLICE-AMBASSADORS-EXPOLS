# EX-POLS KANO APP (NPAE)

A full-stack web application for the National Management Panel (NPAE) to manage Alumni, Ambassadors, board members, events, and reunions.

## Project Structure

The repository is structured as a monorepo containing two main parts:

- **`frontend/`**: The Next.js 16 (App Router) React application.
- **`backend/`**: The Node.js/Express API built using Clean Architecture principles.

### Tech Stack

**Frontend**:
- Framework: Next.js 16 (React 18)
- Styling: Custom CSS, Tailwind CSS
- Authentication: NextAuth.js
- Payment Gateway: Paystack
- Additional Libraries: `lucide-react` (icons), `jspdf` / `html2canvas` (ID card generation)

**Backend**:
- Framework: Node.js with Express
- Architecture: Clean Architecture (Core/Domain, Use Cases, Infrastructure, Presentation)
- Database: MongoDB via Mongoose
- Security: JWT, bcryptjs, Helmet
- Email Service: Resend

## Key Features

- **User Registration & Dashboards**: Dedicated flows and dashboards for Alumni and Ambassadors.
- **Admin Management Panel**: A comprehensive dashboard for super/national admins to:
  - Approve pending user registrations
  - Manage and review board members (Leadership page)
  - Review and approve user profile update requests
  - View event/reunion registrations and track payments
  - Broadcast messages to users by State/Base
  - Manage the public photo gallery
  - Respond to user support tickets
- **Payments (Paystack)**: Integrated event and reunion payments (Early bird / Regular pricing logic).
- **ID Card Generation**: Users can generate and download their official digital ID cards.
- **Security & Rate Limiting**: Robust security layers on the backend utilizing clean architecture, rate-limiting, and JWT authentication.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas cluster)

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and populate necessary secrets:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   RESEND_API_KEY=your_resend_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000` (or whatever `PORT` you specify).

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Architecture Note (Backend)

The backend strictly follows **Clean Architecture**:
- `src/core/domain`: Contains business entities and repository interfaces.
- `src/core/application/use-cases`: Contains the business logic orchestrations.
- `src/infrastructure`: Contains MongoDB models, repository implementations, and external services (like Resend).
- `src/presentation`: Contains Express controllers, routes, and middleware.
