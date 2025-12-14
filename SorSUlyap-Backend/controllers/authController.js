const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { sendOTPEmail } = require('../utils/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user (creates immediately active account - no approval needed)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, program, yearLevel } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Validate university email
    if (!email.endsWith('@sorsu.edu.ph')) {
      return res.status(400).json({
        success: false,
        message: 'Please use your university email (@sorsu.edu.ph) to register'
      });
    }

    // Validate required fields based on role
    if (role === 'Student' && (!program || !yearLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Students must provide program and year level'
      });
    }

    // Check if user exists
    const [existingUser] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password and store user data - immediately active and approved
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO User (Name, Email, Password, Role, Program, YearLevel, IsVerified, IsActive, IsApproved) VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE, TRUE)',
      [name, email, hashedPassword, role, program || null, yearLevel || null]
    );

    res.status(200).json({
      success: true,
      message: 'Account created successfully! You can now login with your email and password.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, otpType } = req.body;

    // Check OTP validity
    const [otpRecord] = await db.query(
      'SELECT * FROM OTP_Verification WHERE Email = ? AND OtpCode = ? AND OtpType = ? AND ExpiresAt > NOW() AND IsUsed = FALSE',
      [email, otp, otpType]
    );

    if (otpRecord.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    await db.query(
      'UPDATE OTP_Verification SET IsUsed = TRUE WHERE Email = ? AND OtpCode = ? AND OtpType = ?',
      [email, otp, otpType]
    );

    // Update user verification status
    await db.query('UPDATE User SET IsVerified = TRUE WHERE Email = ?', [email]);

    // Get user data
    const [users] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    const user = users[0];

    // Generate token
    const token = generateToken(user.UserID);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
        role: user.Role,
        department: user.Department,
        program: user.Program,
        yearLevel: user.YearLevel
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// @desc    Login user (temp no DB)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT * FROM User WHERE Email = ? AND IsActive = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check if approved
    if (!user.IsApproved) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending admin approval'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await db.query('UPDATE User SET LastLogin = NOW() WHERE UserID = ?', [user.UserID]);

    // Generate token
    const token = generateToken(user.UserID);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
        role: user.Role,
        program: user.Program,
        yearLevel: user.YearLevel
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + process.env.OTP_EXPIRE_MINUTES * 60 * 1000);

    // Store OTP
    await db.query(
      'INSERT INTO OTP_Verification (UserID, Email, OtpCode, OtpType, ExpiresAt) VALUES (?, ?, ?, ?, ?)',
      [users[0].UserID, email, otp, 'forgot_password', expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp, 'forgot_password');

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reset password (OTP verification removed)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Verify email exists
    const [users] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE User SET Password = ? WHERE Email = ?', [hashedPassword, email]);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
