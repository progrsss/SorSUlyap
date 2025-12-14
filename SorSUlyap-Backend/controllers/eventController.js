// Import database connection
const db = require('../config/database');

// @desc    Get all events (filtered by user role)
// @route   GET /api/events
// @access  Private
exports.getAllEvents = async (req, res) => {
  try {
    let query = `
      SELECT e.*, u.Name as Created_By_Name
      FROM Event e
      JOIN User u ON e.Created_By = u.UserID
      WHERE e.Date >= CURDATE()
    `;
    const params = [];

    // Show all events to all users (no role-based filtering)
    // All users can see all events

    query += ' ORDER BY e.Date ASC, e.Time ASC';

    const [events] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, u.Name as Created_By_Name
       FROM Event e
       JOIN User u ON e.Created_By = u.UserID
       WHERE e.EventID = ?`,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: events[0]
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private (Admin, Faculty)
exports.createEvent = async (req, res) => {
  try {
    console.log('🚀 Event creation request:', req.body);
    console.log('👤 User authenticated:', req.user ? `ID: ${req.user.UserID}, Role: ${req.user.Role}` : 'No user');

    const { eventName, description, date, time, location, targetAudience, targetProgram } = req.body;

    // Validate required fields
    if (!eventName || !date) {
      console.log('❌ Missing required fields:', { eventName, date });
      return res.status(400).json({
        success: false,
        message: 'Event name and date are required'
      });
    }

    console.log('📝 Inserting event into database...');
    const [result] = await db.query(
      `INSERT INTO Event (Event_Name, Description, Date, Time, Location, TargetAudience, TargetProgram, Created_By)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventName, description, date, time || null, location, targetAudience, targetProgram || null, req.user.UserID]
    );

    const eventId = result.insertId;
    console.log('✅ Event created with ID:', eventId);

    // Send notifications (commented out temporarily for debugging)
    // await sendEventNotification(eventId, eventName, targetAudience, targetProgram);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId
    });
  } catch (error) {
    console.error('❌ Create event error:', error.message);
    console.error('❌ Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Helper function to send event notifications
async function sendEventNotification(eventId, eventName, targetAudience, targetProgram) {
  try {
    // Create notification
    const [notifResult] = await db.query(
      'INSERT INTO Notification (Message, EventID, NotificationType) VALUES (?, ?, ?)',
      [`New event: ${eventName}`, eventId, 'Event']
    );

    const notificationId = notifResult.insertId;

    // Get target users
    let userQuery = 'SELECT UserID FROM User WHERE IsActive = TRUE';
    const params = [];

    if (targetAudience === 'Students') {
      userQuery += ' AND Role = ?';
      params.push('Student');
    } else if (targetAudience === 'Faculty') {
      userQuery += ' AND Role = ?';
      params.push('Faculty');
    } else if (targetAudience === 'Specific_Program') {
      userQuery += ' AND Role = ? AND Program = ?';
      params.push('Student', targetProgram);
    }

    const [users] = await db.query(userQuery, params);

    // Insert user notifications
    if (users.length > 0) {
      const notificationInserts = users.map(user => {
        return db.query(
          'INSERT INTO User_Notification (UserID, NotificationID) VALUES (?, ?)',
          [user.UserID, notificationId]
        );
      });
      await Promise.all(notificationInserts);
    }
  } catch (error) {
    console.error('Send notification error:', error);
  }
}

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin, Faculty)
exports.updateEvent = async (req, res) => {
  try {
    const { eventName, description, date, time, location, status, targetAudience, targetProgram } = req.body;

    await db.query(
      `UPDATE Event 
       SET Event_Name = ?, Description = ?, Date = ?, Time = ?, Location = ?, Status = ?, 
           TargetAudience = ?, TargetProgram = ?
       WHERE EventID = ?`,
      [eventName, description, date, time || null, location, status, targetAudience, targetProgram || null, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin, Faculty)
exports.deleteEvent = async (req, res) => {
  try {
    await db.query('DELETE FROM Event WHERE EventID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
