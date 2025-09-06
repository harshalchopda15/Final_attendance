module.exports = {
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_CONFIG: {
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'Attendance_database'
    }
};
