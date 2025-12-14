const db = require('../config/database');

// @desc    Sync data for offline use
// @route   POST /api/offline/sync
// @access  Private
exports.syncData = async (req, res) => {
  try {
    const userId = req.user.UserID;
    const userRole = req.user.Role;
    const { lastSyncTime } = req.body;

    const syncTime = lastSyncTime ? new Date(lastSyncTime) : new Date(0);
    const data = {};

    // Get user profile
    const [userProfile] = await db.query(
      'SELECT UserID, Name, Email, Role, Department, Program, YearLevel FROM User WHERE UserID = ?',
      [userId]
    );
    data.profile = userProfile[0];

    // Sync schedules based on role
    if (userRole === 'Student') {
      const [schedules] = await db.query(
        `SELECT s.*, u.Name as Posted_By_Name 
         FROM Schedule s 
         JOIN User u ON s.Posted_By = u.UserID 
         WHERE s.Program = ? AND s.YearLevel = ? AND s.Status = 'Active' 
         AND s.UpdatedAt > ?
         ORDER BY s.Date_Posted DESC`,
        [req.user.Program, req.user.YearLevel, syncTime]
      );
      data.schedules = schedules;
    } else {
      const [schedules] = await db.query(
        `SELECT s.*, u.Name as Posted_By_Name 
         FROM Schedule s 
         JOIN User u ON s.Posted_By = u.UserID 
         WHERE s.Status = 'Active' AND s.UpdatedAt > ?
         ORDER BY s.Date_Posted DESC`,
        [syncTime]
      );
      data.schedules = schedules;
    }

    // Sync announcements
    let announcementQuery = `
      SELECT a.*, u.Name as Posted_By_Name 
      FROM Announcement a 
      JOIN User u ON a.Posted_By = u.UserID 
      WHERE a.IsActive = TRUE AND a.UpdatedAt > ?
    `;
    const announcementParams = [syncTime];

    if (userRole === 'Student') {
      announcementQuery += ` AND (a.TargetAudience = 'All' 
                             OR a.TargetAudience = 'Students' 
                             OR (a.TargetAudience = 'Specific_Program' AND a.TargetProgram = ?))`;
      announcementParams.push(req.user.Program);
    } else if (userRole === 'Faculty') {
      announcementQuery += ` AND (a.TargetAudience = 'All' OR a.TargetAudience = 'Faculty')`;
    }

    announcementQuery += ' ORDER BY a.Date_Posted DESC';
    const [announcements] = await db.query(announcementQuery, announcementParams);

    // Get attachments for announcements
    if (announcements.length > 0) {
      const announcementIds = announcements.map(a => a.AnnouncementID);
      const [attachments] = await db.query(
        'SELECT * FROM Attachment WHERE AnnouncementID IN (?)',
        [announcementIds]
      );

      announcements.forEach(announcement => {
        announcement.attachments = attachments.filter(
          att => att.AnnouncementID === announcement.AnnouncementID
        );
      });
    }
    data.announcements = announcements;

    // Sync events
    let eventQuery = `
      SELECT e.*, u.Name as Created_By_Name 
      FROM Event e 
      JOIN User u ON e.Created_By = u.UserID 
      WHERE e.Date >= CURDATE() AND e.UpdatedAt > ?
    `;
    const eventParams = [syncTime];

    if (userRole === 'Student') {
      eventQuery += ` AND (e.TargetAudience = 'All' 
                      OR e.TargetAudience = 'Students' 
                      OR (e.TargetAudience = 'Specific_Program' AND e.TargetProgram = ?))`;
      eventParams.push(req.user.Program);
    } else if (userRole === 'Faculty') {
      eventQuery += ` AND (e.TargetAudience = 'All' OR e.TargetAudience = 'Faculty')`;
    }

    eventQuery += ' ORDER BY e.Date ASC';
    const [events] = await db.query(eventQuery, eventParams);
    data.events = events;

    // Sync notifications (last 100)
    const [notifications] = await db.query(
      `SELECT un.*, n.Message, n.Date_Sent, n.NotificationType, n.EventID, n.AnnouncementID
       FROM User_Notification un
       JOIN Notification n ON un.NotificationID = n.NotificationID
       WHERE un.UserID = ? AND n.Date_Sent > ?
       ORDER BY n.Date_Sent DESC
       LIMIT 100`,
      [userId, syncTime]
    );
    data.notifications = notifications;

    // Get items that were deleted since last sync (temporarily disabled - Activity_Log table not created)
    data.deletedSchedules = [];
    data.deletedAnnouncements = [];
    data.deletedEvents = [];

    res.status(200).json({
      success: true,
      syncTime: new Date().toISOString(),
      data
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during sync'
    });
  }
};

// @desc    Queue offline actions
// @route   POST /api/offline/queue
// @access  Private
exports.queueAction = async (req, res) => {
  try {
    const { actions } = req.body;
    const results = [];

    for (const action of actions) {
      try {
        let result;
        
        switch (action.type) {
          case 'MARK_NOTIFICATION_READ':
            await db.query(
              'UPDATE User_Notification SET Read_Status = TRUE, Date_Viewed = NOW() WHERE UserNotificationID = ? AND UserID = ?',
              [action.data.notificationId, req.user.UserID]
            );
            result = { success: true, actionId: action.id };
            break;

          case 'UPDATE_PROFILE':
            let query = 'UPDATE User SET Name = ?';
            const params = [action.data.name];

            if (req.user.Role === 'Student') {
              query += ', Department = ?, Program = ?, YearLevel = ?';
              params.push(action.data.department, action.data.program, action.data.yearLevel);
            } else if (req.user.Role === 'Faculty') {
              query += ', Department = ?';
              params.push(action.data.department);
            }

            query += ' WHERE UserID = ?';
            params.push(req.user.UserID);

            await db.query(query, params);
            result = { success: true, actionId: action.id };
            break;

          default:
            result = { success: false, actionId: action.id, error: 'Unknown action type' };
        }

        results.push(result);
      } catch (error) {
        results.push({ success: false, actionId: action.id, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Queue action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing queued actions'
    });
  }
};

// @desc    Check server status for offline mode
// @route   GET /api/offline/status
// @access  Public
exports.checkStatus = async (req, res) => {
  try {
    // Simple database ping
    await db.query('SELECT 1');
    
    res.status(200).json({
      success: true,
      online: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      online: false,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { syncData, queueAction, checkStatus };
