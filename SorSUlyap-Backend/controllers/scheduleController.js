const db = require('../config/database');

// @desc    Get all schedules (filtered by user role)
// @route   GET /api/schedules
// @access  Private
exports.getAllSchedules = async (req, res) => {
  try {
    let query = 'SELECT s.*, u.Name as Posted_By_Name FROM Schedule s JOIN User u ON s.Posted_By = u.UserID WHERE s.Status = "Active"';
    const params = [];

    // Filter for students - only show schedules for their program and year
    if (req.user.Role === 'Student') {
      query += ' AND s.Program = ? AND s.YearLevel = ?';
      params.push(req.user.Program, req.user.YearLevel);
    }

    query += ' ORDER BY s.Date_Posted DESC';

    const [schedules] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create schedule
// @route   POST /api/schedules
// @access  Private (Admin, Faculty)
exports.createSchedule = async (req, res) => {
  try {
    const { title, description, program, yearLevel, section, semester, academicYear } = req.body;
    const fileName = req.file ? req.file.filename : null;
    const filePath = req.file ? req.file.path : null;

    const [result] = await db.query(
      'INSERT INTO Schedule (Title, Description, File_Name, File_Path, Program, YearLevel, Section, Semester, AcademicYear, Posted_By) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, fileName, filePath, program, yearLevel, section, semester, academicYear, req.user.UserID]
    );

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      scheduleId: result.insertId
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private (Admin, Faculty)
exports.updateSchedule = async (req, res) => {
  try {
    const { title, description, program, yearLevel, section, semester, academicYear, status } = req.body;
    
    await db.query(
      'UPDATE Schedule SET Title = ?, Description = ?, Program = ?, YearLevel = ?, Section = ?, Semester = ?, AcademicYear = ?, Status = ? WHERE ScheduleID = ?',
      [title, description, program, yearLevel, section, semester, academicYear, status, req.params.id]
    );

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Admin, Faculty)
exports.deleteSchedule = async (req, res) => {
  try {
    await db.query('DELETE FROM Schedule WHERE ScheduleID = ?', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
