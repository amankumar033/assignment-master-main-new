# Authentication System Implementation

This document describes the authentication features implemented in the application.

## Features Implemented

### 1. User Authentication
- **Login System**: Users can log in with email and password
- **Persistent Login**: Users stay logged in when reloading the page
- **Logout Functionality**: Users can log out and are redirected to home page
- **Token-based Authentication**: Simple token system for session management

### 2. Dynamic Navbar
- **Conditional Display**: Shows login/signup buttons when not logged in
- **User Menu**: Shows user profile dropdown when logged in
- **Profile & Logout**: User can access profile page and logout from navbar

### 3. User Data Management
- **Console Logging**: Complete user data from database is logged to console
- **Profile Page**: Dedicated page to view user information
- **Protected Routes**: Profile page is protected and requires authentication

### 4. Database Integration
- **MySQL Integration**: Connects to kriptocar.Users table
- **Password Hashing**: Uses bcrypt for secure password comparison
- **User Data Retrieval**: Fetches complete user data from database

## File Structure

```
src/
├── lib/
│   └── auth.ts                 # Authentication utilities
├── contexts/
│   └── AuthContext.tsx         # Authentication context provider
├── components/
│   ├── Navbar.tsx             # Updated navbar with auth buttons
│   └── ProtectedRoute.tsx     # Route protection component
├── app/
│   ├── api/
│   │   ├── login/
│   │   │   └── route.ts       # Login API endpoint
│   │   └── logout/
│   │       └── route.ts       # Logout API endpoint
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── profile/
│   │   └── page.tsx           # User profile page
│   └── layout.tsx             # Root layout with AuthProvider
```

## How It Works

### 1. Login Flow
1. User enters email and password on login page
2. Form submits to `/api/login` endpoint
3. API validates credentials against database
4. If valid, returns user data and token
5. Frontend stores token and user data in localStorage
6. User is redirected to home page
7. Navbar updates to show user menu

### 2. Persistent Login
1. On app load, AuthContext checks localStorage for token
2. If token exists, user data is retrieved and set in context
3. User remains logged in across page reloads
4. Complete user data is logged to console

### 3. Logout Flow
1. User clicks logout in navbar dropdown
2. Logout API is called
3. Token and user data are removed from localStorage
4. User is redirected to home page
5. Navbar updates to show login/signup buttons

### 4. Protected Routes
1. Profile page is wrapped with ProtectedRoute component
2. If user is not logged in, they are redirected to login page
3. If user is logged in, they can access the protected content

## Console Logging

The application logs user data to the console in several places:
- When user logs in
- When app loads and user is already logged in
- When user clicks "Log User Data to Console" button on profile page

This includes all data from the Users table in the database.

## Environment Variables

Make sure these environment variables are set in your `.env.local` file:
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

## Usage

1. **Login**: Navigate to `/login` and enter your credentials
2. **Profile**: Click on your name in the navbar to access profile page
3. **Logout**: Click logout in the user dropdown menu
4. **Console Data**: Check browser developer tools console to see logged user data

The authentication system is now fully functional and provides a seamless user experience with persistent login and proper session management. 