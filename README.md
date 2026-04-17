# Online Appointment Scheduler

A full-stack appointment scheduling system built with React, Node.js, Express, and MongoDB.

## Features

- **Role-based authentication** (Admin/Customer)
- **Service management** across multiple domains
- **Appointment booking** with double-booking prevention
- **Dark/Light theme toggle**
- **Responsive design**
- **Real-time availability checking**

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd appointment-project
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**
Create `.env` file in `backend/`:
```env
MONGODB_URI=mongodb://localhost:27017/appointment-scheduler
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account
- Email: admin@example.com
- Password: admin123

## Project Structure

```
appointment-project/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## API Documentation

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Services
- `GET /services` - Get all services
- `POST /services` - Create service (admin only)
- `PUT /services/:id` - Update service (admin only)
- `DELETE /services/:id` - Delete service (admin only)

### Appointments
- `POST /appointments/create` - Book appointment
- `GET /appointments/by-customer/:id` - Get customer appointments
- `GET /appointments/admin` - Get all appointments (admin only)
- `PUT /appointments/:id/accept` - Accept appointment (admin only)
- `PUT /appointments/:id/reject` - Reject appointment (admin only)

## License

MIT License

## Docker Setup

### Prerequisites
- Docker Desktop (or Docker Engine + Compose)

### Environment
Create `backend/.env` (or copy from `backend/.env.example`) and make sure these values exist:

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/appointments
JWT_SECRET=your_secret
```

### Run with Docker Compose

```bash
docker-compose up --build
```

### Services
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: `mongodb://localhost:27017`
