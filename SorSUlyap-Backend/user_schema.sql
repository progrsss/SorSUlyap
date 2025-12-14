-- User Table Schema
CREATE TABLE IF NOT EXISTS User (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  Password VARCHAR(255) NOT NULL,
  Role ENUM('Admin', 'Faculty', 'Student') NOT NULL,
  Department VARCHAR(255),
  Program VARCHAR(255),
  YearLevel VARCHAR(50),
  IsVerified BOOLEAN DEFAULT FALSE,
  IsApproved BOOLEAN DEFAULT FALSE,
  IsActive BOOLEAN DEFAULT TRUE,
  LastLogin DATETIME,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- OTP Verification Table Schema
CREATE TABLE IF NOT EXISTS OTP_Verification (
  OTPID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT,
  Email VARCHAR(255) NOT NULL,
  OtpCode VARCHAR(10) NOT NULL,
  OtpType VARCHAR(50) NOT NULL,
  IsUsed BOOLEAN DEFAULT FALSE,
  ExpiresAt DATETIME NOT NULL,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

-- Announcement Table Schema
CREATE TABLE IF NOT EXISTS Announcement (
  AnnouncementID INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(255) NOT NULL,
  Content TEXT NOT NULL,
  Posted_By INT NOT NULL,
  TargetAudience ENUM('All', 'Students', 'Faculty', 'Specific_Program') NOT NULL,
  TargetProgram VARCHAR(100),
  TargetYearLevel VARCHAR(50),
  IsActive BOOLEAN DEFAULT TRUE,
  Date_Posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Posted_By) REFERENCES User(UserID) ON DELETE CASCADE
);

-- Attachment Table Schema (for announcement file uploads)
CREATE TABLE IF NOT EXISTS Attachment (
  AttachmentID INT AUTO_INCREMENT PRIMARY KEY,
  AnnouncementID INT NOT NULL,
  File_Name VARCHAR(255) NOT NULL,
  File_Type VARCHAR(100) NOT NULL,
  File_Path VARCHAR(500) NOT NULL,
  File_Size INT NOT NULL,
  Date_Uploaded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AnnouncementID) REFERENCES Announcement(AnnouncementID) ON DELETE CASCADE
);

-- Notification Table Schema
CREATE TABLE IF NOT EXISTS Notification (
  NotificationID INT AUTO_INCREMENT PRIMARY KEY,
  Message TEXT NOT NULL,
  AnnouncementID INT,
  NotificationType VARCHAR(50) NOT NULL DEFAULT 'General',
  Is_Read BOOLEAN DEFAULT FALSE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (AnnouncementID) REFERENCES Announcement(AnnouncementID) ON DELETE CASCADE
);

-- User Notification Mapping Table
CREATE TABLE IF NOT EXISTS User_Notification (
  UserNotificationID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  NotificationID INT NOT NULL,
  Is_Read BOOLEAN DEFAULT FALSE,
  ReadAt TIMESTAMP NULL,
  FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE,
  FOREIGN KEY (NotificationID) REFERENCES Notification(NotificationID) ON DELETE CASCADE,
  UNIQUE KEY unique_user_notification (UserID, NotificationID)
);

-- Indexes for performance (drop if exists to avoid duplicates)
DROP INDEX IF EXISTS idx_user_email ON User;
CREATE INDEX idx_user_email ON User(Email);
DROP INDEX IF EXISTS idx_otp_email_code ON OTP_Verification;
CREATE INDEX idx_otp_email_code ON OTP_Verification(Email, OtpCode);
DROP INDEX IF EXISTS idx_announcement_posted_by ON Announcement;
CREATE INDEX idx_announcement_posted_by ON Announcement(Posted_By);
DROP INDEX IF EXISTS idx_announcement_target_audience ON Announcement;
CREATE INDEX idx_announcement_target_audience ON Announcement(TargetAudience);
DROP INDEX IF EXISTS idx_announcement_active ON Announcement;
CREATE INDEX idx_announcement_active ON Announcement(IsActive);
DROP INDEX IF EXISTS idx_attachment_announcement ON Attachment;
CREATE INDEX idx_attachment_announcement ON Attachment(AnnouncementID);
DROP INDEX IF EXISTS idx_notification_type ON Notification;
CREATE INDEX idx_notification_type ON Notification(NotificationType);
DROP INDEX IF EXISTS idx_user_notification_user ON User_Notification;
CREATE INDEX idx_user_notification_user ON User_Notification(UserID);
DROP INDEX IF EXISTS idx_user_notification_read ON User_Notification;
CREATE INDEX idx_user_notification_read ON User_Notification(Is_Read);
