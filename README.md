# Wingman Admin Panel

A React.js admin panel with JWT authentication for the Wingman application, built with Create React App.

## Features

- JWT-based authentication
- Protected routes
- Responsive design with Tailwind CSS
- Login page with form validation
- Dashboard with dummy statistics and activity feed
- Automatic token management
- Axios interceptors for API calls

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   Create a `.env` file in the root directory:
   ```
   REACT_APP_END_POINT=http://localhost:4000
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── Context/
│   └── AuthContext.js          # Authentication context
├── services/
│   ├── authService.js         # Authentication service
│   └── axiosInstance.js       # Axios configuration
├── components/
│   ├── LoginPage.js           # Login page component
│   └── Dashboard.js           # Dashboard component
├── App.js                     # Main app component with routing
├── index.js                   # Entry point
└── index.css                  # Global styles with Tailwind
```

## Authentication Flow

1. User visits the app and is redirected to `/login` if not authenticated
2. User enters credentials on the login page
3. Upon successful login, JWT token is stored in localStorage
4. User is redirected to `/dashboard`
5. All dashboard routes are protected and require authentication
6. Token is automatically included in API requests
7. On token expiration or 401 errors, user is redirected to login

## API Endpoints Expected

The app expects the following backend endpoints:

- `POST /api/auth/user/login` - User login
- `POST /api/auth/user/signup` - User registration  
- `GET /api/auth/user` - Get current user
- `POST /api/auth/google-login` - Google OAuth login

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Customization

- Modify the dashboard components in `src/components/Dashboard.js`
- Update styling by modifying Tailwind classes
- Add new protected routes in `src/App.js`
- Extend authentication context in `src/Context/AuthContext.js`