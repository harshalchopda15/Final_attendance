const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { body, validationResult } = require('express-validator');

// Validation rules
const createUserValidation = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'teacher', 'admin']).withMessage('Role must be student, teacher, or admin')
];

const updateUserValidation = [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('role').optional().isIn(['student', 'teacher', 'admin']).withMessage('Role must be student, teacher, or admin')
];

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT 
                id,
                name,
                email,
                role,
                created_at,
                updated_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: {
                users: users,
                total: users.length
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        // Get the created user
        const [newUser] = await pool.execute(`
            SELECT 
                id,
                name,
                email,
                role,
                created_at
            FROM users
            WHERE id = ?
        `, [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: newUser[0]
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { name, email, role } = req.body;

        // Check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is already taken by another user
        if (email) {
            const [emailCheck] = await pool.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, id]
            );

            if (emailCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already taken by another user'
                });
            }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];

        if (name) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (role) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id);

        // Update user
        await pool.execute(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        // Get updated user
        const [updatedUser] = await pool.execute(`
            SELECT 
                id,
                name,
                email,
                role,
                created_at,
                updated_at
            FROM users
            WHERE id = ?
        `, [id]);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: updatedUser[0]
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const [existingUsers] = await pool.execute(
            'SELECT id, role FROM users WHERE id = ?',
            [id]
        );

        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting the last admin
        if (existingUsers[0].role === 'admin') {
            const [adminCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
            );

            if (adminCount[0].count <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the last admin user'
                });
            }
        }

        // Delete user (cascade will handle related records)
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get attendance reports
const getAttendanceReports = async (req, res) => {
    try {
        // Get overall statistics
        const [overallStats] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
                (SELECT COUNT(*) FROM classes) as total_classes,
                (SELECT COUNT(*) FROM attendance) as total_attendance_records,
                (
                    SELECT 
                        ROUND(AVG(student_attendance.attendance_percentage), 2)
                    FROM (
                        SELECT 
                            COUNT(DISTINCT a.class_id) / NULLIF((SELECT COUNT(DISTINCT id) FROM classes), 0) * 100 as attendance_percentage
                        FROM users u
                        LEFT JOIN attendance a ON u.id = a.student_id
                        WHERE u.role = 'student'
                        GROUP BY u.id
                    ) as student_attendance
                ) as average_attendance_percentage
        `);

        // Get attendance by student
        const [studentStats] = await pool.execute(`
            SELECT 
                u.id,
                u.name,
                u.email,
                (SELECT COUNT(*) FROM classes) as total_classes,
                COUNT(DISTINCT a.class_id) as attended_classes,
                ROUND((COUNT(DISTINCT a.class_id) / NULLIF((SELECT COUNT(*) FROM classes), 0)) * 100, 2) as attendance_percentage
            FROM users u
            LEFT JOIN attendance a ON u.id = a.student_id
            WHERE u.role = 'student'
            GROUP BY u.id, u.name, u.email
            ORDER BY attendance_percentage DESC
        `);

        // Get attendance by subject
        const [subjectStats] = await pool.execute(`
            SELECT 
                c.subject,
                COUNT(DISTINCT c.id) as total_classes,
                COUNT(DISTINCT a.student_id) as unique_students_attended,
                COUNT(a.id) as total_attendance_records,
                ROUND((COUNT(a.id) / NULLIF((COUNT(DISTINCT c.id) * (SELECT COUNT(*) FROM users WHERE role = 'student')), 0)) * 100, 2) as attendance_percentage
            FROM classes c
            LEFT JOIN attendance a ON c.id = a.class_id
            GROUP BY c.subject
            ORDER BY attendance_percentage DESC
        `);

        // Get daily attendance trends (last 30 days)
        const [dailyTrends] = await pool.execute(`
            SELECT 
                DATE(c.date) as date,
                COUNT(DISTINCT c.id) as classes_held,
                COUNT(a.id) as attendance_records,
                ROUND((COUNT(a.id) / NULLIF((COUNT(DISTINCT c.id) * (SELECT COUNT(*) FROM users WHERE role = 'student')), 0)) * 100, 2) as daily_attendance_percentage
            FROM classes c
            LEFT JOIN attendance a ON c.id = a.class_id
            WHERE c.date >= CURDATE() - INTERVAL 30 DAY
            GROUP BY DATE(c.date)
            ORDER BY date DESC
        `);

        res.json({
            success: true,
            data: {
                overall: overallStats[0],
                students: studentStats,
                subjects: subjectStats,
                dailyTrends: dailyTrends
            }
        });

    } catch (error) {
        console.error('Get attendance reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        // Get counts
        const [counts] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
                (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
                (SELECT COUNT(*) FROM classes) as total_classes,
                (SELECT COUNT(*) FROM attendance) as total_attendance_records
        `);

        // Get recent activity
        const [recentClasses] = await pool.execute(`
            SELECT 
                c.id,
                c.subject,
                c.date,
                u.name as teacher_name,
                COUNT(a.id) as attendance_count
            FROM classes c
            JOIN users u ON c.teacher_id = u.id
            LEFT JOIN attendance a ON c.id = a.class_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
            LIMIT 5
        `);

        const [recentAttendance] = await pool.execute(`
            SELECT 
                a.timestamp,
                u.name as student_name,
                c.subject,
                t.name as teacher_name
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            JOIN classes c ON a.class_id = c.id
            JOIN users t ON c.teacher_id = t.id
            ORDER BY a.timestamp DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                counts: counts[0],
                recentClasses: recentClasses,
                recentAttendance: recentAttendance
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAttendanceReports,
    getDashboardStats,
    createUserValidation,
    updateUserValidation
};
