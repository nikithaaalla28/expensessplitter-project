const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../Models/User');
const ActivityLog = require('../Models/ActivityLog');
const { sendWelcomeEmail } = require('../services/mailService');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication logic
 * Includes welcome email sending for new registrations
 */

const JWT_SECRET = process.env.JWT_SECRET || 'expense-splitter-secret';

/**
 * Register a new user
 * Steps:
 * 1. Validate input fields (fullName, email, password)
 * 2. Check if email already exists in database
 * 3. Hash the password using bcryptjs
 * 4. Create and save new user document
 * 5. Log the registration activity
 * 6. Send welcome email asynchronously (errors don't block registration)
 * 7. Return success response to frontend
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    console.log('Register request received:', { email, fullName });

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name: fullName,
      email,
      passwordHash,
      role: 'user',
      isAdmin: false,
    });

    await user.save();
    console.log('New user saved to MongoDB Atlas:', user._id);
    console.log('Saved to DB:', mongoose.connection.name, 'collection:', user.collection && user.collection.name);

    try {
      await ActivityLog.create({
        action: 'New user registered',
        detail: `${fullName} registered with email ${email}`,
        entity: 'user',
        actor: fullName,
      });
    } catch (logError) {
      console.warn('⚠️  Activity log failed during registration:', logError.message);
    }

    sendWelcomeEmail(email, fullName).catch((error) => {
      console.error(`⚠️  Welcome email sending failed for user ${email}:`, error.message);
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. A welcome email has been sent to your address.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
    });
  }
};

/**
 * Login user
 * Steps:
 * 1. Find user by email
 * 2. Compare provided password with stored hash
 * 3. Update last login timestamp
 * 4. Generate JWT token
 * 5. Log the login activity
 * 6. Return user data and token to frontend
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received for:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    try {
      await ActivityLog.create({
        action: 'User login',
        detail: `${user.name} logged in with email ${user.email}`,
        entity: 'user',
        actor: user.name,
      });
    } catch (logError) {
      console.warn('⚠️  Activity log failed during login:', logError.message);
    }

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.',
    });
  }
};

/**
 * Admin login (hardcoded credentials for demonstration)
 * In production, admin should be managed in database with proper role management
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const expectedEmail = 'nikithaaalla0628@gmail.com';
    const expectedPassword = 'nikitha12';

    // Validate admin credentials
    if (email !== expectedEmail || password !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.',
      });
    }

    // Create admin user object
    const adminUser = {
      name: 'Expense Admin',
      email: expectedEmail,
      role: 'admin',
      isAdmin: true,
    };

    // Generate JWT token for admin (valid for 7 days)
    const token = jwt.sign(
      {
        id: 'admin',
        email: expectedEmail,
        role: 'admin',
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log the admin login activity
    await ActivityLog.create({
      action: 'Admin login',
      detail: 'Admin signed in to the dashboard.',
      entity: 'admin',
      actor: 'Expense Admin',
    });

    // Return admin user data and token
    res.json({
      success: true,
      user: adminUser,
      token,
    });
  } catch (error) {
    // Log error for debugging purposes
    console.error('Admin login error:', error.message);

    // Return generic error message to frontend
    res.status(500).json({
      success: false,
      message: 'Admin login failed. Please try again later.',
    });
  }
};

/**
 * Get all users (admin function)
 * Retrieves all registered users sorted by creation date
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    });
  }
};
