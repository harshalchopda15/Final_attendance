# 📚 College-Level Attendance Management System

A comprehensive, professional attendance management system built with React, Node.js, Express, and MySQL. Features role-based authentication, QR code generation/scanning, real-time attendance tracking, and detailed reporting.

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based access**: Student, Teacher, Admin
- **Secure JWT authentication**
- **Form validation** with proper error handling
- **Demo credentials** for easy testing

### 👨‍🎓 Student Features
- **QR Code Scanning**: Mark attendance by scanning or entering QR codes
- **Personal Dashboard**: View attendance statistics and records
- **Subject-wise Reports**: Track attendance by subject
- **Real-time Status**: See active classes and attendance status

### 👨‍🏫 Teacher Features
- **QR Code Generation**: Create time-limited QR codes (30 seconds)
- **Real-time Monitoring**: See students marking attendance live
- **Class Management**: View all classes and attendance records
- **Attendance Analytics**: Track student participation

### 👨‍💼 Admin Features
- **User Management**: CRUD operations for all users
- **System Overview**: Dashboard with key statistics
- **Attendance Reports**: Comprehensive analytics and charts
- **Data Management**: Monitor system-wide attendance trends

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tailwind CSS**: Clean, modern styling
- **Real-time Updates**: Live data refresh
- **Intuitive Navigation**: Role-based sidebar and navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **QRCode.react** - QR code generation
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **QRCode** - QR code generation
- **express-validator** - Input validation

## 📋 Prerequisites

Before running the application, make sure you have:

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd attendance-management-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, backend, frontend)
npm run install-all
```

### 3. Database Setup

#### Prerequisites
- **MySQL Server** must be installed and running
- **MySQL credentials** (as specified in requirements):
  - Host: localhost
  - User: root  
  - Password: Your Password

#### Quick Setup (Windows)
```bash
# Run the automated setup script
setup-database.bat
```

#### Manual Setup
```bash
# Connect to MySQL
mysql -u root -p

# Enter password: 12345678

# Create database
CREATE DATABASE Attendance_database;

# Exit MySQL
exit;

# Import schema
mysql -u root -p Attendance_database < database/schema.sql

# Import seed data  
mysql -u root -p Attendance_database < database/seed.sql
```

#### Verify Installation
```bash
# Check tables were created
mysql -u root -p -e "USE Attendance_database; SHOW TABLES;"

# Check sample data
mysql -u root -p -e "USE Attendance_database; SELECT COUNT(*) FROM users;"
```

> 📋 **Detailed Setup Guide**: See [DATABASE_SETUP.md](DATABASE_SETUP.md) for comprehensive instructions and troubleshooting.

### 4. Environment Configuration

The application uses the following MySQL credentials (as specified in requirements):
- **Host**: localhost
- **User**: root
- **Password**: 12345678
- **Database**: Attendance_database

### 5. Start the Application

#### Development Mode (Recommended)
```bash
# Start both backend and frontend concurrently
npm run dev
```

#### Manual Start
```bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 👤 Demo Credentials

### Admin Account
- **Email**: admin@college.edu
- **Password**: admin123
- **Access**: Full system management

### Teacher Account
- **Email**: sarah.johnson@college.edu
- **Password**: teacher123
- **Access**: Generate QR codes, view attendance

### Student Account
- **Email**: alice.smith@college.edu
- **Password**: student123
- **Access**: Mark attendance, view records

## 📱 How to Use

### For Teachers
1. **Login** with teacher credentials
2. **Generate QR Code** for your class
3. **Share QR string** with students (display on screen)
4. **Monitor attendance** in real-time
5. **View class records** and statistics

### For Students
1. **Login** with student credentials
2. **Scan QR Code** or enter QR string
3. **Mark attendance** before QR expires (30 seconds)
4. **View attendance records** and statistics

### For Admins
1. **Login** with admin credentials
2. **Manage users** (add, edit, delete)
3. **View system reports** and analytics
4. **Monitor overall attendance** trends

## 🏗️ Project Structure

```
attendance-management-system/
├── backend/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── config.js          # App configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── teacherController.js # Teacher operations
│   │   ├── studentController.js # Student operations
│   │   └── adminController.js # Admin operations
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── teacher.js         # Teacher routes
│   │   ├── student.js         # Student routes
│   │   └── admin.js           # Admin routes
│   ├── package.json
│   └── server.js              # Express server
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main app component
│   │   └── index.js          # Entry point
│   ├── package.json
│   └── tailwind.config.js    # Tailwind configuration
├── database/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Sample data
├── package.json              # Root package.json
└── README.md                 # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Teacher
- `POST /api/teacher/generate-qr` - Generate QR code
- `GET /api/teacher/classes` - Get teacher's classes
- `GET /api/teacher/attendance/:classId` - Get class attendance
- `GET /api/teacher/realtime-attendance` - Real-time attendance

### Student
- `POST /api/student/mark-attendance` - Mark attendance
- `GET /api/student/attendance` - Get student attendance
- `GET /api/student/recent-classes` - Get recent classes

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/reports` - Get attendance reports
- `GET /api/admin/dashboard-stats` - Get dashboard statistics

## 🎯 Key Features Explained

### QR Code System
- **30-second expiry** for security
- **Unique strings** per class session
- **Real-time validation** on the backend
- **Visual QR codes** for easy scanning

### Real-time Updates
- **Live attendance tracking** for teachers
- **Automatic data refresh** every 5 seconds
- **Instant feedback** for students
- **Status indicators** for active/expired QR codes

### Security Features
- **JWT token authentication**
- **Password hashing** with bcrypt
- **Role-based access control**
- **Input validation** and sanitization
- **SQL injection protection**

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check MySQL service
sudo service mysql status

# Restart MySQL
sudo service mysql restart

# Verify credentials in backend/config/db.js
```

#### Port Already in Use
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 5000 (backend)
npx kill-port 5000
```

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Express.js** for the robust backend framework
- **MySQL** for reliable data storage

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API documentation](#-api-endpoints)
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ for educational institutions**
