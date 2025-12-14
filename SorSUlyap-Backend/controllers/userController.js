// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, program } = req.query;
    
    let query = 'SELECT UserID, Name, Email, Role, Department, Program, YearLevel, IsVerified, IsApproved, IsActive, CreatedAt FROM User WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND Role = ?';
      params.push(role);
    }
    if (department) {
      query += ' AND Department = ?';
      params.push(department);
    }
    if (program) {
      query += ' AND Program = ?';
      params.push(program);
    }

    query += ' ORDER BY CreatedAt DESC';

    const [users] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT UserID, Name, Email, Role, Department, Program, YearLevel, IsActive, CreatedAt, LastLogin FROM User WHERE UserID = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, department, program, yearLevel } = req.body;

    let query = 'UPDATE User SET Name = ?';
    const params = [name];

    if (req.user.Role === 'Student') {
      query += ', Department = ?, Program = ?, YearLevel = ?';
      params.push(department, program, yearLevel);
    } else if (req.user.Role === 'Faculty') {
      query += ', Department = ?';
      params.push(department);
    }

    query += ' WHERE UserID = ?';
    params.push(req.user.UserID);

    await db.query(query, params);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const [users] = await db.query('SELECT Password FROM User WHERE UserID = ?', [req.user.UserID]);

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].Password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query('UPDATE User SET Password = ? WHERE UserID = ?', [hashedPassword, req.user.UserID]);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin)
exports.deactivateUser = async (req, res) => {
  try {
    await db.query('UPDATE User SET IsActive = FALSE WHERE UserID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Activate user account
// @route   PUT /api/users/:id/activate
// @access  Private (Admin)
exports.activateUser = async (req, res) => {
  try {
    await db.query('UPDATE User SET IsActive = TRUE WHERE UserID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Approve user account (Admin approval workflow)
// @route   PUT /api/users/:id/approve
// @access  Private (Admin)
exports.approveUser = async (req, res) => {
  try {
    const { role } = req.body; // Admin can update the role during approval

    if (role) {
      // Validate role
      const validRoles = ['Student', 'Faculty', 'Admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      await db.query('UPDATE User SET IsApproved = TRUE, Role = ? WHERE UserID = ?', [role, req.params.id]);
    } else {
      await db.query('UPDATE User SET IsApproved = TRUE WHERE UserID = ?', [req.params.id]);
    }

    res.status(200).json({
      success: true,
      message: 'User approved successfully'
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Deny user account (Admin rejection workflow)
// @route   PUT /api/users/:id/deny
// @access  Private (Admin)
exports.denyUser = async (req, res) => {
  try {
    // Instead of deleting, we'll deactivate the account
    await db.query('UPDATE User SET IsActive = FALSE, IsApproved = FALSE WHERE UserID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'User denied and deactivated successfully'
    });
  } catch (error) {
    console.error('Deny user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
