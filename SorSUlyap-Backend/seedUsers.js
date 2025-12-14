const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUsers() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'sorsulyap_db',
    port: process.env.DB_PORT || 3306
  };

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Insert test users
    const testUsers = [
      { name: 'Admin User', email: 'admin@sorsu.edu.ph', password: 'admin123', role: 'Admin' },
      { name: 'Student One', email: 'student1@sorsu.edu.ph', password: 'student123', role: 'Student', program: 'Computer Science', yearLevel: '2nd Year' },
      { name: 'Faculty Member', email: 'faculty@sorsu.edu.ph', password: 'faculty123', role: 'Faculty', department: 'IT Department' }
    ];

    for (const user of testUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Check if email exists
      const [existing] = await connection.query('SELECT Email FROM User WHERE Email = ?', [user.email]);
      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO User (Name, Email, Password, Role, Department, Program, YearLevel, IsVerified, IsActive, IsApproved)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, TRUE)`,
          [user.name, user.email, hashedPassword, user.role, user.department || null, user.program || null, user.yearLevel || null]
        );
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`⚠️  User already exists: ${user.email}`);
      }
    }

    console.log('🎉 User seeding completed!');
    await connection.end();
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedUsers();
