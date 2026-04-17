# Frontend-Backend Integration Guide

## ✅ **Integration Status: COMPLETE**

This document provides the complete integration between your React frontend and Node.js backend.

## 🔧 **Backend API Endpoints**

### Authentication Routes (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user  
- `GET /api/auth/me` - Get current user info (protected)

### Service Routes (`/api/services`)
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/domain/:domain` - Get services by domain
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Appointment Routes (`/api/appointments`)
- `POST /api/appointments/create` - Create appointment (customer only)
- `GET /api/appointments/by-customer/:customerId` - Get customer appointments
- `GET /api/appointments/admin` - Get all appointments (admin only)
- `PUT /api/appointments/:id/accept` - Accept appointment (admin only)
- `PUT /api/appointments/:id/reject` - Reject appointment (admin only)
- `PUT /api/appointments/:id/cancel` - Cancel appointment (customer only)

## 🔧 **Frontend Service Files**

### Updated API Services
- `src/services/authService.js` - Authentication API calls
- `src/services/servicesService.js` - Services CRUD operations
- `src/services/appointmentsService.js` - Appointments management
- `src/services/usersService.js` - User management (admin functions)
- `src/services/api.js` - Base API configuration with Axios

### Key Features Implemented
- ✅ JWT token management with localStorage
- ✅ Automatic token injection in headers
- ✅ 401 error handling with auto-logout
- ✅ Request/response interceptors
- ✅ Error handling and user feedback

## 🔧 **Authentication Flow**

### Login Process
1. User submits email/password
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials and returns JWT token + user data
4. Frontend stores token and user data in localStorage
5. Axios interceptor automatically adds token to all subsequent requests

### Registration Process
1. User submits name, email, password, role
2. Frontend calls `POST /api/auth/signup`
3. Backend creates user and returns JWT token + user data
4. Frontend stores token and user data in localStorage
5. User is automatically logged in

### Protected Routes
- All API endpoints (except `/auth/login` and `/auth/signup`) require JWT token
- Admin endpoints require `adminAuth` middleware
- Customer endpoints require `customerAuth` middleware
- Frontend automatically handles token validation and refresh

## 🔧 **Data Models**

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'customer']
}
```

### Service Model
```javascript
{
  name: String,
  domain: String,
  description: String,
  providerName: String,
  availableDays: [String],
  availableTimeSlots: [String]
}
```

### Appointment Model
```javascript
{
  customerId: ObjectId,
  serviceId: ObjectId,
  date: Date,
  timeSlot: String,
  status: ['pending', 'accepted', 'rejected'],
  providerName: String,
  serviceName: String,
  customerName: String,
  customerEmail: String
}
```

## 🔧 **Environment Configuration**

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/appointment-scheduler
PORT=5000
```

## 🔧 **CORS Configuration**

Backend CORS is already configured in `server.js`:
```javascript
app.use(cors());
```

## 🔧 **Error Handling**

### Frontend Error Handling
- API errors are caught and displayed as toast notifications
- 401 errors automatically logout user and redirect to login
- Form validation errors are displayed inline
- Network errors show user-friendly messages

### Backend Error Handling
- Validation middleware checks required fields
- Authentication middleware validates JWT tokens
- Role-based middleware checks user permissions
- Global error handler catches unexpected errors

## 🔧 **Testing the Integration**

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm start
```

### 3. Test Authentication
- Navigate to `/signup` and create a new user
- Navigate to `/login` and test login functionality
- Check that JWT token is stored in localStorage
- Test protected routes with valid/invalid tokens

### 4. Test Services
- Admin can create, edit, and delete services
- Customers can view and filter services
- Test service search and domain filtering

### 5. Test Appointments
- Customers can book appointments
- Admin can view, accept, and reject appointments
- Test appointment status updates
- Test appointment cancellation

## 🔧 **Folder Structure**

```
c:/appointment-project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   └── Appointment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   └── appointments.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Toast.js
│   │   │   ├── Loading.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   └── admin/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── servicesService.js
│   │   │   ├── appointmentsService.js
│   │   │   └── usersService.js
│   │   ├── App.js
│   │   └── index.js
│   ├── .env
│   └── package.json
└── README.md
```

## 🔧 **Key Integration Points**

### 1. API Base URL
- Frontend uses `http://localhost:5000/api` as base URL
- Configured in `.env` file and `src/services/api.js`

### 2. Authentication Headers
- JWT token automatically added to all requests via Axios interceptor
- Token stored in localStorage as "token"
- User data stored in localStorage as "user"

### 3. Error Handling
- Frontend handles 401 errors with automatic logout
- Backend validates all requests and returns appropriate error messages
- User feedback via toast notifications

### 4. Data Flow
- Frontend → Backend API → Database → Backend → Frontend
- All CRUD operations properly mapped to REST endpoints
- Real-time updates via state management

## 🔧 **Troubleshooting**

### Common Issues
1. **CORS Errors**: Ensure backend CORS is configured
2. **401 Unauthorized**: Check JWT token in localStorage
3. **403 Forbidden**: Verify user role and permissions
4. **Network Errors**: Check backend is running on correct port
5. **Validation Errors**: Check request body format matches backend expectations

### Debug Steps
1. Check browser console for errors
2. Verify backend logs for request details
3. Check localStorage for token and user data
4. Test API endpoints directly with Postman
5. Verify MongoDB connection and data

## ✅ **Integration Complete**

Your frontend and backend are now fully integrated! All authentication, services, and appointment functionality should work seamlessly together.
