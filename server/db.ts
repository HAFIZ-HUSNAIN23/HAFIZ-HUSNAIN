import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'madrasa.sqlite');

let dbInstance: Database | null = null;

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export function saveDatabase() {
  if (dbInstance) {
    try {
      const data = dbInstance.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }
}

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      console.log('Loaded existing SQLite database from', DB_FILE);
    } catch (e) {
      console.warn('Error reading database file, creating fresh database:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
    console.log('Initialized new in-memory SQLite database, will save to', DB_FILE);
  }

  initSchema(dbInstance);
  saveDatabase();
  return dbInstance;
}

export function queryAll(sql: string, params: any[] = []): any[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql: string, params: any[] = []): any | null {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function runQuery(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  stmt.run(params);
  stmt.free();

  const infoStmt = dbInstance.prepare('SELECT changes() as changes, last_insert_rowid() as lastInsertRowid');
  infoStmt.step();
  const info = infoStmt.getAsObject() as { changes: number; lastInsertRowid: number };
  infoStmt.free();

  saveDatabase();
  return info;
}

export function calculateTargetEndDate(startDate: string, durationDays: number = 30): string {
  const days = Math.max(1, parseInt(String(durationDays), 10) || 30);
  const d = new Date(startDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + (days - 1)); // inclusive period: Day 1 + (days - 1) = Day N
  return d.toISOString().split('T')[0];
}

export function calculate30DayEndDate(startDate: string): string {
  return calculateTargetEndDate(startDate, 30);
}

export function formatQuarter(val: number): number {
  return Math.round(val * 4) / 4;
}

export function recalculateStudentProgress(studentId: string) {
  const today = new Date().toISOString().split('T')[0];
  let target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
  if (!target) {
    const sDate = today;
    const dur = 30;
    const eDate = calculateTargetEndDate(sDate, dur);
    runQuery(
      `INSERT INTO student_targets (student_id, target_paras, duration_days, target_duration_days, start_date, end_date, total_read, progress_percent, status, updated_at)
       VALUES (?, 2.0, ?, ?, ?, ?, 0.0, 0.0, 'Not Started', ?)`,
      [studentId, dur, dur, sDate, eDate, today]
    );
    target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
  }

  const durationDays = Math.max(1, parseInt(String(target.duration_days || target.target_duration_days), 10) || 30);
  const startDate = target.start_date || today;
  const endDate = target.end_date || calculateTargetEndDate(startDate, durationDays);

  // Sum all daily reading for this student strictly within target date range
  const totalRow = queryOne(
    `SELECT COALESCE(SUM(reading_amount), 0) as total
     FROM daily_reports
     WHERE student_id = ? AND report_date >= ? AND report_date <= ?`,
    [studentId, startDate, endDate]
  );

  const totalReading = formatQuarter(totalRow ? Number(totalRow.total) : 0);
  const targetParas = Number(target.target_paras) > 0 ? Number(target.target_paras) : 2.0;

  // Formula: Progress % = (Total reading during student's target period / Student's target miqdaar) × 100
  let progressPercent = Math.round(((totalReading / targetParas) * 100) * 10) / 10;
  if (progressPercent > 100) {
    progressPercent = 100;
  }

  let status = 'Not Started';
  if (progressPercent >= 100) {
    status = 'Target Completed';
  } else if (totalReading > 0) {
    status = 'In Progress';
  }

  runQuery(
    `UPDATE student_targets SET
      total_read = ?,
      progress_percent = ?,
      status = ?,
      duration_days = ?,
      target_duration_days = ?,
      end_date = ?,
      updated_at = ?
     WHERE student_id = ?`,
    [totalReading, progressPercent, status, durationDays, durationDays, endDate, today, studentId]
  );

  return {
    studentId,
    targetParas,
    durationDays,
    totalRead: totalReading,
    progressPercent,
    status,
    startDate,
    endDate,
  };
}

function initSchema(db: Database) {
  // Foreign keys & schema
  db.run(`PRAGMA foreign_keys = ON;`);

  // Admins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      login_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
      created_at TEXT NOT NULL
    );
  `);

  // Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      father_name TEXT NOT NULL,
      dob TEXT,
      gender TEXT DEFAULT 'Male',
      course TEXT NOT NULL,
      class_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      father_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      previous_education TEXT,
      admission_date TEXT NOT NULL,
      monthly_fee REAL NOT NULL,
      login_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Student Targets table (for Quran 30-day Para target)
  db.run(`
    CREATE TABLE IF NOT EXISTS student_targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      target_paras REAL NOT NULL DEFAULT 2.0,
      duration_days INTEGER DEFAULT 30,
      target_duration_days INTEGER DEFAULT 30,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_read REAL DEFAULT 0.0,
      progress_percent REAL DEFAULT 0.0,
      status TEXT DEFAULT 'Not Started',
      updated_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Daily Reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      report_date TEXT NOT NULL,
      para_no INTEGER NOT NULL CHECK(para_no >= 1 AND para_no <= 30),
      reading_amount REAL NOT NULL,
      listener TEXT NOT NULL,
      mistakes INTEGER DEFAULT 0,
      stumbles INTEGER DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      UNIQUE(student_id, report_date, para_no),
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Attendance table
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      attendance_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Leave')),
      course TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(student_id, attendance_date),
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Fee Challans table
  db.run(`
    CREATE TABLE IF NOT EXISTS fee_challans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challan_no TEXT UNIQUE NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      father_name TEXT NOT NULL,
      course TEXT NOT NULL,
      class_name TEXT NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      fee_amount REAL NOT NULL,
      status TEXT DEFAULT 'Unpaid' CHECK(status IN ('Paid', 'Unpaid', 'Overdue')),
      address TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Results table
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course TEXT NOT NULL,
      exam_name TEXT NOT NULL,
      subject TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      marks REAL NOT NULL,
      total_marks REAL NOT NULL,
      percentage REAL NOT NULL,
      grade TEXT NOT NULL,
      remarks TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    );
  `);

  // Exams table
  db.run(`
    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_name TEXT NOT NULL,
      course TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      remarks TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Timings table
  db.run(`
    CREATE TABLE IF NOT EXISTS timings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      days TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      room TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Announcements table
  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Published' CHECK(status IN ('Published', 'Draft')),
      created_at TEXT NOT NULL
    );
  `);

  // Admissions table (Public Applications)
  db.run(`
    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_no TEXT UNIQUE NOT NULL,
      student_name TEXT NOT NULL,
      father_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      course TEXT NOT NULL,
      class_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      father_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      previous_education TEXT,
      admission_date TEXT NOT NULL,
      monthly_fee REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
      created_at TEXT NOT NULL
    );
  `);

  // Indexes for fast querying
  db.run(`CREATE INDEX IF NOT EXISTS idx_students_id ON students(student_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_daily_reports_id ON daily_reports(student_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, attendance_date);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_fee_challans_student ON fee_challans(student_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);`);

  // Enable foreign key cascading
  db.run(`PRAGMA foreign_keys = ON;`);

  // Purge any legacy sample/test student records so the system starts with ZERO students
  cleanTestStudentsAndOldData(db);

  // Seed general institution data (admin, timings, exams, announcements) if empty
  seedInitialData(db);

  // Migrate existing table schemas to support multiple paras per day & individual targets
  migrateDailyReportsTable(db);
  migrateTo30DaySystem(db);
}

function cleanTestStudentsAndOldData(db: Database) {
  try {
    // Update branding in existing announcements if present
    db.run(`UPDATE announcements 
      SET title = REPLACE(title, 'Protectors of The Quran', 'Madrassa Arabiyyah Misbah Ul Quran For Huffaz'),
          message = REPLACE(message, 'Protectors of The Quran', 'Madrassa Arabiyyah Misbah Ul Quran For Huffaz')
      WHERE title LIKE '%Protectors of The Quran%' OR message LIKE '%Protectors of The Quran%'`);
  } catch (err) {
    console.error('Error during student cleanup:', err);
  }
}

function migrateDailyReportsTable(db: Database) {
  try {
    const tblRes = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_reports';");
    if (tblRes.length > 0 && tblRes[0].values && tblRes[0].values.length > 0) {
      const createSql = String(tblRes[0].values[0][0]);
      if (createSql.includes("UNIQUE(student_id, report_date)") && !createSql.includes("UNIQUE(student_id, report_date, para_no)")) {
        console.log("Migrating daily_reports table to allow multiple paras on same date: UNIQUE(student_id, report_date, para_no)...");
        db.run("BEGIN TRANSACTION;");
        db.run(`
          CREATE TABLE daily_reports_migrated (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            report_date TEXT NOT NULL,
            para_no INTEGER NOT NULL CHECK(para_no >= 1 AND para_no <= 30),
            reading_amount REAL NOT NULL,
            listener TEXT NOT NULL,
            mistakes INTEGER DEFAULT 0,
            stumbles INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT,
            UNIQUE(student_id, report_date, para_no),
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
          );
        `);
        db.run(`
          INSERT OR IGNORE INTO daily_reports_migrated (id, student_id, report_date, para_no, reading_amount, listener, mistakes, stumbles, notes, created_at, updated_at)
          SELECT id, student_id, report_date, para_no, reading_amount, listener, mistakes, stumbles, notes, created_at, updated_at
          FROM daily_reports;
        `);
        db.run("DROP TABLE daily_reports;");
        db.run("ALTER TABLE daily_reports_migrated RENAME TO daily_reports;");
        db.run("CREATE INDEX IF NOT EXISTS idx_daily_reports_id ON daily_reports(student_id);");
        db.run("CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);");
        db.run("COMMIT;");
        console.log("Migration of daily_reports constraint completed successfully.");
      }
    }
  } catch (err) {
    console.error("Migration error for daily_reports constraint:", err);
    try { db.run("ROLLBACK;"); } catch {}
  }
}

function migrateTo30DaySystem(db: Database) {
  try {
    // 1. Ensure daily_reports has notes and updated_at columns
    const reportColsRes = db.exec("PRAGMA table_info(daily_reports);");
    if (reportColsRes.length > 0 && reportColsRes[0].values) {
      const colNames = reportColsRes[0].values.map((c: any) => c[1]);
      if (!colNames.includes('notes')) {
        db.run("ALTER TABLE daily_reports ADD COLUMN notes TEXT DEFAULT '';");
      }
      if (!colNames.includes('updated_at')) {
        db.run("ALTER TABLE daily_reports ADD COLUMN updated_at TEXT;");
      }
    }
  } catch (e) {
    console.warn('Migration warning for daily_reports columns:', e);
  }

  try {
    // 2. Ensure student_targets has target_duration_days column
    const targetColsRes = db.exec("PRAGMA table_info(student_targets);");
    if (targetColsRes.length > 0 && targetColsRes[0].values) {
      const colNames = targetColsRes[0].values.map((c: any) => c[1]);
      if (!colNames.includes('target_duration_days')) {
        db.run("ALTER TABLE student_targets ADD COLUMN target_duration_days INTEGER DEFAULT 30;");
      }
    }
  } catch (e) {
    console.warn('Migration warning for student_targets columns:', e);
  }

  try {
    // 3. Recalculate any active students' progress according to their own target
    const allStudentsRes = db.exec("SELECT student_id FROM students;");
    if (allStudentsRes.length > 0 && allStudentsRes[0].values) {
      for (const row of allStudentsRes[0].values) {
        const sid = String(row[0]);
        try {
          recalculateStudentProgress(sid);
        } catch (e) {
          // ignore individual progress errors
        }
      }
    }
  } catch (err) {
    console.warn('Error during progress recalculation migration:', err);
  }
}

function seedInitialData(db: Database) {
  // Check admin
  const adminCheck = db.prepare('SELECT COUNT(*) as count FROM admins');
  adminCheck.step();
  const adminCount = (adminCheck.getAsObject() as { count: number }).count;
  adminCheck.free();

  if (adminCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const adminPassHash = bcrypt.hashSync('POQ@2026', salt);
    const now = new Date().toISOString().split('T')[0];

    db.run(
      `INSERT INTO admins (name, login_id, password_hash, status, created_at)
       VALUES (?, ?, ?, 'active', ?)`,
      ['Chief Administrator', 'admin', adminPassHash, now]
    );
    console.log('Seeded default admin: admin / POQ@2026');
  }

  // CRITICAL REQUIREMENT:
  // ZERO students are seeded. The system begins with 0 students.
  // Admin must manually add the first student.
  const today = new Date().toISOString().split('T')[0];

  // Seed sample general class timings if empty
  const timingsCheck = db.prepare('SELECT COUNT(*) as count FROM timings');
  timingsCheck.step();
  const timingsCount = (timingsCheck.getAsObject() as { count: number }).count;
  timingsCheck.free();

  if (timingsCount === 0) {
    const timingsData = [
      { course: 'Hifzul Quran', days: 'Monday - Saturday', start_time: '4:00 PM', end_time: '6:00 PM', room: 'Hall A', notes: 'Memorization and Sabaq' },
      { course: 'Nazra Quran', days: 'Monday - Saturday', start_time: '5:00 PM', end_time: '7:00 PM', room: 'Room 1', notes: 'Fluency and basic tajweed' },
      { course: 'Gardaan', days: 'Monday - Saturday', start_time: '4:00 PM', end_time: '5:00 PM', room: 'Room 2', notes: 'Sarf and morphology exercises' },
      { course: 'Tajweed', days: 'Monday - Saturday', start_time: '6:00 PM', end_time: '8:00 PM', room: 'Hall B', notes: 'Makharij and Sifaat theoretical & practical' }
    ];
    for (const t of timingsData) {
      db.run(
        `INSERT INTO timings (course, days, start_time, end_time, room, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [t.course, t.days, t.start_time, t.end_time, t.room, t.notes, today]
      );
    }
  }

  // Seed sample general exams schedule if empty
  const examsCheck = db.prepare('SELECT COUNT(*) as count FROM exams');
  examsCheck.step();
  const examsCount = (examsCheck.getAsObject() as { count: number }).count;
  examsCheck.free();

  if (examsCount === 0) {
    const examsData = [
      { exam_name: 'Monthly Test', course: 'Hifzul Quran', exam_date: '2026-09-15', start_time: '4:00 PM', end_time: '5:00 PM', venue: 'Main Hall', remarks: 'Revision of assigned paras' },
      { exam_name: 'Tajweed Monthly Exam', course: 'Tajweed', exam_date: '2026-09-18', start_time: '6:00 PM', end_time: '7:00 PM', venue: 'Hall B', remarks: 'Oral and practical pronunciation assessment' },
      { exam_name: 'Gardaan Test', course: 'Gardaan', exam_date: '2026-09-20', start_time: '4:00 PM', end_time: '5:00 PM', venue: 'Room 2', remarks: 'Past and present verb conjugations' }
    ];
    for (const e of examsData) {
      db.run(
        `INSERT INTO exams (exam_name, course, exam_date, start_time, end_time, venue, remarks, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.exam_name, e.course, e.exam_date, e.start_time, e.end_time, e.venue, e.remarks, today]
      );
    }
  }

  // Seed sample general announcements if empty
  const announcementsCheck = db.prepare('SELECT COUNT(*) as count FROM announcements');
  announcementsCheck.step();
  const announcementsCount = (announcementsCheck.getAsObject() as { count: number }).count;
  announcementsCheck.free();

  if (announcementsCount === 0) {
    const announcementsData = [
      {
        title: 'Welcome to Madrassa Arabiyyah Misbah Ul Quran For Huffaz',
        message: 'Classes for the new academic semester have commenced. Parents are requested to ensure punctuality and review daily progress cards.',
        date: today,
        status: 'Published'
      },
      {
        title: 'Monthly Examination Schedule (September 2026)',
        message: 'The monthly tests for all courses will begin on September 15, 2026. Please check the Exams section for exact date sheet and timing details.',
        date: today,
        status: 'Published'
      },
      {
        title: 'Special Tajweed Workshop on Sundays',
        message: 'A specialized weekend recitation workshop focusing on Ahkam-e-Tajweed and Tarteel will be held every Sunday from 10:00 AM to 12:00 PM.',
        date: today,
        status: 'Published'
      }
    ];
    for (const a of announcementsData) {
      db.run(
        `INSERT INTO announcements (title, message, date, status, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [a.title, a.message, a.date, a.status, today]
      );
    }
  }
}
