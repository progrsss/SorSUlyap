// Import database connection
const db = require('../config/database');

// @desc    Get all announcements (filtered by user role)
// @route   GET /api/announcements

exports.getAllAnnouncements = async (req, res) => {
  try {
    let query = `
      SELECT a.*, u.Name as Posted_by_Name,
      (SELECT COUNT(*) FROM Attachment WHERE AnnouncementID = a.AnnouncementID) as Attachment_Count
      FROM Announcement a
      JOIN User u ON a.Posted_by = u.UserID
      WHERE a.IsActive = 1
    `;
    const params = [];

    // Search functionality
    const { search, dateFrom, dateTo } = req.query;
    if (search) {
      query += ' AND (a.Title LIKE ? OR a.Content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Date range filter
    if (dateFrom) {
      query += ' AND a.Date_Posted >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND a.Date_Posted <= ?';
      params.push(dateTo + ' 23:59:59');
    }

    // Limit for pagination (optional)
    const limit = parseInt(req.query.limit) || 50;
    query += ' ORDER BY a.date_posted DESC LIMIT ?';
    params.push(limit);

    const [announcements] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single announcement with attachments
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = async (req, res) => {
  try {
    const [announcements] = await db.query(
      `SELECT a.*, u.Name as Posted_by_Name
       FROM Announcement a
       JOIN User u ON a.Posted_by = u.UserID
       WHERE a.AnnouncementID = ?`,
      [req.params.id]
    );

    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Get attachments
    const [attachments] = await db.query(
      'SELECT * FROM Attachment WHERE AnnouncementID = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...announcements[0],
        attachments
      }
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin, Faculty)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Insert announcement using your table schema
    const [result] = await db.query(
      `INSERT INTO Announcement (Title, Content, Posted_by)
       VALUES (?, ?, ?)`,
      [title, content, req.user.UserID]
    );

    const announcementId = result.insertId;

    // Handle file attachments if any
    if (req.files && req.files.length > 0) {
      const attachmentQueries = req.files.map(file => {
        return db.query(
          'INSERT INTO Attachment (File_Name, File_Type, File_Path, AnnouncementID) VALUES (?, ?, ?, ?)',
          [file.originalname, file.mimetype, file.path, announcementId]
        );
      });
      await Promise.all(attachmentQueries);
    }

    // Send basic notification to all users (simplified for your schema)
    await sendBasicAnnouncementNotification(announcementId, title);

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcementId
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to send announcement notifications (simplified for your database schema)
async function sendBasicAnnouncementNotification(announcementId, title) {
  try {
    // Create notification using your Notification table structure
    const [notifResult] = await db.query(
      'INSERT INTO Notification (Message, AnnouncementID) VALUES (?, ?)',
      [`New announcement: ${title}`, announcementId]
    );

    const notificationId = notifResult.insertId;

    // Get all active users (no targeting in your schema)
    const [users] = await db.query('SELECT UserID FROM User WHERE 1=1');

    // Insert user notifications for all users
    if (users.length > 0) {
      const notificationInserts = users.map(user => {
        return db.query(
          'INSERT INTO User_Notification (Read_Status, UserID, NotificationID) VALUES (?, ?, ?)',
          [FALSE, user.UserID, notificationId]
        );
      });
      await Promise.all(notificationInserts);
    }
  } catch (error) {
    console.error('Send notification error:', error);
  }
}

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin, Faculty)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    await db.query(
      `UPDATE Announcement
       SET Title = ?, Content = ?
       WHERE AnnouncementID = ?`,
      [title, content, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully'
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin, Faculty)
exports.deleteAnnouncement = async (req, res) => {
  try {
    await db.query('DELETE FROM Announcement WHERE AnnouncementID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
