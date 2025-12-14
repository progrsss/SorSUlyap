// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT un.*, n.Message, n.Date_Sent, n.NotificationType, n.EventID, n.AnnouncementID
       FROM User_Notification un
       JOIN Notification n ON un.NotificationID = n.NotificationID
       WHERE un.UserID = ?
       ORDER BY n.Date_Sent DESC
       LIMIT 50`,
      [req.user.UserID]
    );

    const unreadCount = notifications.filter(n => !n.Read_Status).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE User_Notification SET Read_Status = TRUE, Date_Viewed = NOW() WHERE UserNotificationID = ? AND UserID = ?',
      [req.params.id, req.user.UserID]
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE User_Notification SET Read_Status = TRUE, Date_Viewed = NOW() WHERE UserID = ? AND Read_Status = FALSE',
      [req.user.UserID]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM User_Notification WHERE UserNotificationID = ? AND UserID = ?',
      [req.params.id, req.user.UserID]
    );

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
