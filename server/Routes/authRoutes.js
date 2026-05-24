const express = require('express');
const authController = require('../controllers/authController');

/**
 * Authentication Routes
 * Handles user registration, login, and user retrieval
 * All routes delegate to authController for business logic
 */

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with email validation
 * Automatically sends welcome email after successful registration
 * Request body: { fullName, email, password }
 * Response: { success: boolean, message: string }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * Request body: { email, password }
 * Response: { success: boolean, user: object, token: string }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/admin/login
 * Authenticate admin user (hardcoded credentials)
 * Request body: { email, password }
 * Response: { success: boolean, user: object, token: string }
 */
router.post('/admin/login', authController.adminLogin);

/**
 * GET /api/auth/users
 * Retrieve all registered users (admin endpoint)
 * Response: Array of user objects sorted by creation date
 */
router.get('/users', authController.getUsers);

module.exports = router;
