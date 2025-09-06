-- Use the database
USE Attendance_database;

-- Clear existing data
DELETE FROM attendance;
DELETE FROM classes;
DELETE FROM users;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE classes AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert teachers (password: teacher123)
INSERT INTO users (name, email, password, role) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher'),
('Prof. Michael Chen', 'michael.chen@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher');

-- Insert students (password: student123)
INSERT INTO users (name, email, password, role) VALUES
('Alice Smith', 'alice.smith@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Bob Wilson', 'bob.wilson@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Carol Davis', 'carol.davis@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('David Brown', 'david.brown@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Emma Taylor', 'emma.taylor@college.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- Insert sample classes
INSERT INTO classes (teacher_id, subject, date, qr_code, qr_expiry_time) VALUES
(2, 'Mathematics', '2024-01-15', 'MATH_QR_001', '2024-01-15 10:30:00'),
(2, 'Mathematics', '2024-01-16', 'MATH_QR_002', '2024-01-16 10:30:00'),
(3, 'Computer Science', '2024-01-15', 'CS_QR_001', '2024-01-15 14:00:00'),
(3, 'Computer Science', '2024-01-17', 'CS_QR_002', '2024-01-17 14:00:00'),
(2, 'Mathematics', '2024-01-18', 'MATH_QR_003', '2024-01-18 10:30:00');

-- Insert sample attendance records
INSERT INTO attendance (student_id, class_id, timestamp) VALUES
(4, 1, '2024-01-15 10:25:00'), -- Alice attended Math class 1
(5, 1, '2024-01-15 10:26:00'), -- Bob attended Math class 1
(6, 1, '2024-01-15 10:27:00'), -- Carol attended Math class 1
(4, 2, '2024-01-16 10:25:00'), -- Alice attended Math class 2
(5, 2, '2024-01-16 10:26:00'), -- Bob attended Math class 2
(7, 2, '2024-01-16 10:27:00'), -- David attended Math class 2
(4, 3, '2024-01-15 13:55:00'), -- Alice attended CS class 1
(6, 3, '2024-01-15 13:56:00'), -- Carol attended CS class 1
(8, 3, '2024-01-15 13:57:00'), -- Emma attended CS class 1
(5, 4, '2024-01-17 13:55:00'), -- Bob attended CS class 2
(7, 4, '2024-01-17 13:56:00'), -- David attended CS class 2
(8, 4, '2024-01-17 13:57:00'); -- Emma attended CS class 2
