# 🚀 Complete Authentication & Database Setup Guide

## 📋 Prerequisites

### Node.js & npm
- Node.js v16+ installed
- npm installed with Node.js

### MongoDB
- MongoDB installed locally OR MongoDB Atlas account
- MongoDB Compass (recommended for GUI management)

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Open MongoDB Compass
4. Connect to: `mongodb://localhost:27017`
5. Create database: `appointment-scheduler`

### Option 2: MongoDB Atlas (Cloud)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add your IP to whitelist
5. Create database user

## 🔧 Environment Configuration

### Backend `.env` (c:/appointment-project/backend/.env)
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/appointment-scheduler
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appointment-scheduler

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env` (c:/appointment-project/frontend/.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🌱 Database Seeding

### Create Demo Users
```bash
cd backend
node utils/seedUsers.js
```

This will create:
- **Admin**: admin@example.com / admin123
- **Customer**: john@example.com / customer123
- **Customer**: jane@example.com / customer123

## 🚀 Starting the Application

### 1. Start MongoDB
```bash
# For local MongoDB
mongod

# Or ensure MongoDB service is running
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
# OR
npm start
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Authentication Flow

### Login Process
1. User enters email/password
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token + user data
5. Frontend stores token in localStorage
6. User redirected based on role:
   - Admin → `/admin-dashboard`
   - Customer → `/customer-dashboard`

### Signup Process
1. User fills registration form
2. Frontend calls `POST /api/auth/signup`
3. Backend validates input & hashes password
4. Backend creates user & returns JWT token
5. Frontend stores token & redirects to login

### Role-Based Access
- **Admin**: Can manage services, view all appointments
- **Customer**: Can book appointments, view own appointments

## 🛡️ Protected Routes

### Frontend Protected Routes
- `/customer-dashboard` - Requires customer role
- `/admin-dashboard` - Requires admin role

### Backend Protected Endpoints
- All appointment endpoints require authentication
- Admin endpoints require admin role
- Customer endpoints require customer role

## 🧪 Testing the Authentication

### 1. Test Admin Login
- Email: admin@example.com
- Password: admin123
- Should redirect to `/admin-dashboard`

### 2. Test Customer Login
- Email: john@example.com
- Password: customer123
- Should redirect to `/customer-dashboard`

### 3. Test New Signup
- Create new account
- Should be able to login after signup

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Appointments
- `POST /api/appointments/create` - Book appointment
- `GET /api/appointments/by-customer/:id` - Get customer appointments
- `GET /api/appointments/admin` - Get all appointments (admin only)

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
❌ MongoDB connection error
```
**Solution:**
- Check MongoDB is running
- Verify connection string in `.env`
- Check network/firewall settings

#### JWT Token Error
```
❌ Token is not valid
```
**Solution:**
- Clear localStorage
- Check JWT_SECRET in backend `.env`
- Ensure token is being sent in Authorization header

#### CORS Error
```
Access to fetch at 'http://localhost:5000' has been blocked by CORS
```
**Solution:**
- Check frontend URL in backend CORS config
- Ensure both servers are running

#### Role Access Denied
```
❌ Access denied. Admin role required
```
**Solution:**
- Check user role in database
- Ensure correct role-based redirects
- Verify protected route configuration

### Database Verification with MongoDB Compass
1. Connect to your MongoDB instance
2. Select `appointment-scheduler` database
3. Check `users` collection for seeded accounts
4. Verify user roles and password hashes

## 📝 Development Notes

### Password Security
- Passwords are hashed using bcryptjs
- Minimum 6 characters required
- Hashing done in User model pre-save hook

### JWT Tokens
- Tokens expire after 30 days
- Stored in localStorage
- Sent in Authorization header: `Bearer <token>`

### Validation
- Backend uses express-validator for input validation
- Frontend has basic form validation
- Email format validation on both ends

### Error Handling
- Consistent error messages across frontend/backend
- Proper HTTP status codes
- User-friendly error notifications

## 🔄 Next Steps

1. **Add More Services**: Use admin dashboard to add services
2. **Test Appointments**: Book appointments as customer
3. **Admin Features**: Test appointment management
4. **Security**: Update JWT secret for production
5. **Deployment**: Configure for production environment
