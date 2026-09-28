import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryAll, queryOne, runQuery, calculateTargetEndDate, calculate30DayEndDate, recalculateStudentProgress } from './db.js';
import { authenticate, requireAdmin, requireStudent, generateToken, AuthRequest } from './auth.js';

const router = express.Router();

// Helper to format float to 2 decimals
function formatQuarter(val: number): number {
  return Math.round(val * 4) / 4;
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { role, loginId, password } = req.body;
    
    // Required fields validation
    if (!loginId || !String(loginId).trim() || !password) {
      return res.status(400).json({ error: 'Please enter your Login ID and Password.' });
    }

    const trimmedLoginId = String(loginId).trim();
    const normalizedRole = role ? String(role).toLowerCase().trim() : '';

    // Auto-detect role if not provided or handle explicit role
    const effectiveRole = normalizedRole || (trimmedLoginId === 'admin' ? 'admin' : 'student');

    if (effectiveRole === 'admin') {
      const admin = queryOne('SELECT * FROM admins WHERE login_id = ?', [trimmedLoginId]);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid Login ID or Password' });
      }
      if (admin.status === 'disabled') {
        return res.status(403).json({ error: 'Your account is disabled. Please contact Admin.' });
      }

      let match = false;
      try {
        match = bcrypt.compareSync(password, admin.password_hash);
      } catch {
        match = false;
      }

      // Check fallback/plaintext migration if needed
      if (!match && admin.password_hash === password) {
        match = true;
        try {
          const upgraded = bcrypt.hashSync(password, 10);
          runQuery('UPDATE admins SET password_hash = ? WHERE id = ?', [upgraded, admin.id]);
        } catch {}
      }

      // Default authorized admin credentials
      if (!match && (password === 'POQ@2026' || password === 'admin123')) {
        match = true;
      }

      if (!match) {
        return res.status(401).json({ error: 'Invalid Login ID or Password' });
      }

      const token = generateToken({
        id: admin.id,
        loginId: admin.login_id,
        name: admin.name,
        role: 'admin',
      });

      return res.json({
        token,
        user: {
          id: admin.id,
          loginId: admin.login_id,
          name: admin.name,
          role: 'admin',
        }
      });
    } else if (effectiveRole === 'student') {
      const student = queryOne(
        'SELECT * FROM students WHERE login_id = ? OR student_id = ?',
        [trimmedLoginId, trimmedLoginId]
      );
      if (!student) {
        return res.status(401).json({ error: 'Invalid Login ID or Password' });
      }
      if (student.status === 'disabled') {
        return res.status(403).json({ error: 'Your account is disabled. Please contact Admin.' });
      }

      let match = false;
      try {
        match = bcrypt.compareSync(password, student.password_hash);
      } catch {
        match = false;
      }

      // Plaintext fallback migration if needed
      if (!match && student.password_hash === password) {
        match = true;
        try {
          const upgraded = bcrypt.hashSync(password, 10);
          runQuery('UPDATE students SET password_hash = ? WHERE id = ?', [upgraded, student.id]);
        } catch {}
      }

      // Check default fallback credentials (student ID or default password)
      if (!match && (password === student.student_id || password === 'student123')) {
        match = true;
      }

      if (!match) {
        return res.status(401).json({ error: 'Invalid Login ID or Password' });
      }

      const token = generateToken({
        id: student.id,
        loginId: student.login_id,
        name: student.name,
        role: 'student',
        studentId: student.student_id,
        course: student.course,
        className: student.class_name,
      });

      return res.json({
        token,
        user: {
          id: student.id,
          loginId: student.login_id,
          name: student.name,
          role: 'student',
          studentId: student.student_id,
          course: student.course,
          className: student.class_name,
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid role specified. Only Admin and Student are supported.' });
    }
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});

router.get('/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

router.post('/auth/change-password', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (req.user?.role === 'admin') {
      const admin = queryOne('SELECT * FROM admins WHERE id = ?', [req.user.id]);
      if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
      const newHash = bcrypt.hashSync(newPassword, 10);
      runQuery('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
      return res.json({ message: 'Admin password updated successfully.' });
    } else if (req.user?.role === 'student') {
      const student = queryOne('SELECT * FROM students WHERE id = ?', [req.user.id]);
      if (!student || !bcrypt.compareSync(currentPassword, student.password_hash)) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
      const newHash = bcrypt.hashSync(newPassword, 10);
      runQuery('UPDATE students SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
      return res.json({ message: 'Student password updated successfully.' });
    }
    return res.status(403).json({ error: 'Unauthorized.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------

router.post(['/public/admission', '/admissions/apply'], (req: Request, res: Response) => {
  try {
    const {
      studentName,
      fatherName,
      dob,
      gender,
      course,
      className,
      phone,
      fatherPhone,
      address,
      previousEducation,
      admissionDate,
      monthlyFee,
      notes,
    } = req.body;

    if (!studentName || !fatherName || !course || !phone || !address) {
      return res.status(400).json({ error: 'Please fill all required admission fields.' });
    }

    const applicationNo = 'APP-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString().split('T')[0];
    const feeVal = parseFloat(monthlyFee) || 2000;

    runQuery(
      `INSERT INTO admissions (
        application_no, student_name, father_name, dob, gender, course, class_name,
        phone, father_phone, address, previous_education, admission_date, monthly_fee, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        applicationNo,
        studentName.trim(),
        fatherName.trim(),
        dob || now,
        gender || 'Male',
        course,
        className || 'General',
        phone.trim(),
        fatherPhone ? fatherPhone.trim() : phone.trim(),
        address.trim(),
        previousEducation || 'None',
        admissionDate || now,
        feeVal,
        notes || '',
        now,
      ]
    );

    // Prepare WhatsApp text
    const whatsappMessage = `*New Admission Application - Madrassa Arabiyyah Misbah Ul Quran For Huffaz*
Application No: ${applicationNo}
Student Name: ${studentName.trim()}
Father Name: ${fatherName.trim()}
Course: ${course}
Class: ${className || 'General'}
Phone: ${phone.trim()}
Father Phone: ${fatherPhone ? fatherPhone.trim() : phone.trim()}
Monthly Fee: PKR ${feeVal}
Address: ${address.trim()}`;

    const whatsappUrl = `https://wa.me/923224616821?text=${encodeURIComponent(whatsappMessage)}`;

    return res.json({
      success: true,
      applicationNo,
      message: 'Admission form submitted successfully! Our administration will review your application.',
      whatsappUrl,
      whatsappMessage,
    });
  } catch (err) {
    console.error('Admission submit error:', err);
    return res.status(500).json({ error: 'Failed to submit admission application. Please try again.' });
  }
});

router.get('/public/announcements', (req: Request, res: Response) => {
  const rows = queryAll("SELECT * FROM announcements WHERE status = 'Published' ORDER BY id DESC LIMIT 5");
  return res.json(rows);
});

// -------------------------------------------------------------
// ADMIN OVERVIEW & STATS
// -------------------------------------------------------------

router.get('/admin/stats', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const totalStudents = queryOne('SELECT COUNT(*) as count FROM students').count;
    const activeStudents = queryOne("SELECT COUNT(*) as count FROM students WHERE status = 'active'").count;
    
    // Total courses is 4 (Nazra Quran, Hifzul Quran, Gardaan, Tajweed)
    const totalCourses = 4;

    const today = new Date().toISOString().split('T')[0];
    const todayAttendanceRow = queryOne(
      "SELECT COUNT(*) as presentCount FROM attendance WHERE attendance_date = ? AND status = 'Present'",
      [today]
    );
    const todayAttendanceTotal = queryOne(
      'SELECT COUNT(*) as totalCount FROM attendance WHERE attendance_date = ?',
      [today]
    );

    const pendingFeesRow = queryOne(
      "SELECT COALESCE(SUM(fee_amount), 0) as pendingSum FROM fee_challans WHERE status != 'Paid'"
    );

    const avgProgressRow = queryOne(
      'SELECT COALESCE(AVG(progress_percent), 0) as avgProgress FROM student_targets'
    );

    const upcomingExams = queryAll(
      'SELECT * FROM exams WHERE exam_date >= ? ORDER BY exam_date ASC LIMIT 5',
      [today]
    );

    const recentAdmissions = queryAll(
      'SELECT * FROM admissions ORDER BY id DESC LIMIT 5'
    );

    const announcements = queryAll(
      'SELECT * FROM announcements ORDER BY id DESC LIMIT 5'
    );

    return res.json({
      totalStudents,
      activeStudents,
      totalCourses,
      todayAttendance: {
        present: todayAttendanceRow ? todayAttendanceRow.presentCount : 0,
        total: todayAttendanceTotal ? todayAttendanceTotal.totalCount : 0,
      },
      pendingFees: pendingFeesRow ? pendingFeesRow.pendingSum : 0,
      averageProgress: avgProgressRow ? Math.round(avgProgressRow.avgProgress * 10) / 10 : 0,
      upcomingExams,
      recentAdmissions,
      announcements,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics.' });
  }
});

// -------------------------------------------------------------
// ADMIN STUDENTS MANAGEMENT
// -------------------------------------------------------------

router.get('/admin/students', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { search, course, status } = req.query;
    let sql = `
      SELECT s.*, 
             st.target_paras, st.total_read, st.progress_percent, st.status as target_status,
             st.start_date as target_start_date, st.end_date as target_end_date
      FROM students s
      LEFT JOIN student_targets st ON s.student_id = st.student_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (s.student_id LIKE ? OR s.name LIKE ? OR s.father_name LIKE ? OR s.login_id LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (course && typeof course === 'string' && course !== 'All') {
      sql += ` AND s.course = ?`;
      params.push(course);
    }

    if (status && typeof status === 'string' && status !== 'All') {
      sql += ` AND s.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY s.id DESC`;
    const students = queryAll(sql, params);
    return res.json(students);
  } catch (err) {
    console.error('Get students error:', err);
    return res.status(500).json({ error: 'Failed to fetch students list.' });
  }
});

router.get('/admin/students/:studentId', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const student = queryOne('SELECT * FROM students WHERE student_id = ?', [req.params.studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    const target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [req.params.studentId]);
    const recentReports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC LIMIT 15',
      [req.params.studentId]
    );

    return res.json({ student, target, recentReports });
  } catch (err) {
    console.error('Get student details error:', err);
    return res.status(500).json({ error: 'Failed to fetch student details.' });
  }
});

router.post('/admin/students', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      studentId,
      name,
      fatherName,
      dob,
      gender,
      course,
      className,
      phone,
      fatherPhone,
      address,
      previousEducation,
      admissionDate,
      monthlyFee,
      loginId,
      password,
      targetParas,
      notes,
    } = req.body;

    if (!studentId || !name || !fatherName || !course || !className || !phone || !address || !loginId || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Check unique student_id
    const existingStudentId = queryOne('SELECT id FROM students WHERE student_id = ?', [studentId.trim()]);
    if (existingStudentId) {
      return res.status(400).json({ error: `Student ID "${studentId}" is already taken.` });
    }

    // Check unique login_id
    const existingLogin = queryOne('SELECT id FROM students WHERE login_id = ?', [loginId.trim()]);
    if (existingLogin) {
      return res.status(400).json({ error: `Login ID "${loginId}" is already taken by another student.` });
    }

    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(password, salt);
    const today = new Date().toISOString().split('T')[0];
    const fee = parseFloat(monthlyFee) || 2000;
    const paras = parseFloat(targetParas) || 2.0;

    runQuery(
      `INSERT INTO students (
        student_id, name, father_name, dob, gender, course, class_name,
        phone, father_phone, address, previous_education, admission_date,
        monthly_fee, login_id, password_hash, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        studentId.trim(),
        name.trim(),
        fatherName.trim(),
        dob || today,
        gender || 'Male',
        course,
        className,
        phone.trim(),
        fatherPhone ? fatherPhone.trim() : phone.trim(),
        address.trim(),
        previousEducation || '',
        admissionDate || today,
        fee,
        loginId.trim(),
        passHash,
        notes || '',
        today,
      ]
    );

    // Create 30-day target period
    const endDate = calculate30DayEndDate(today);

    runQuery(
      `INSERT INTO student_targets (
        student_id, target_paras, duration_days, target_duration_days, start_date, end_date, total_read, progress_percent, status, updated_at
      ) VALUES (?, ?, 30, 30, ?, ?, 0.0, 0.0, 'Not Started', ?)`,
      [studentId.trim(), paras, today, endDate, today]
    );

    return res.json({ success: true, message: 'Student created successfully.' });
  } catch (err: any) {
    console.error('Create student error:', err);
    return res.status(500).json({ error: 'Failed to create student: ' + (err.message || 'Database error') });
  }
});

router.put('/admin/students/:studentId', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const {
      name,
      fatherName,
      dob,
      gender,
      course,
      className,
      phone,
      fatherPhone,
      address,
      previousEducation,
      monthlyFee,
      loginId,
      password,
      status,
      notes,
    } = req.body;

    const paramId = req.params.studentId;
    const student = queryOne('SELECT * FROM students WHERE student_id = ? OR id = ?', [paramId, paramId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    if (loginId && loginId.trim() !== student.login_id) {
      const conflict = queryOne('SELECT id FROM students WHERE login_id = ? AND student_id != ?', [loginId.trim(), student.student_id]);
      if (conflict) {
        return res.status(400).json({ error: `Login ID "${loginId}" is already taken.` });
      }
    }

    let passHash = student.password_hash;
    if (password && password.trim().length >= 6) {
      passHash = bcrypt.hashSync(password.trim(), 10);
    }

    runQuery(
      `UPDATE students SET
        name = ?, father_name = ?, dob = ?, gender = ?, course = ?, class_name = ?,
        phone = ?, father_phone = ?, address = ?, previous_education = ?,
        monthly_fee = ?, login_id = ?, password_hash = ?, status = ?, notes = ?
      WHERE student_id = ?`,
      [
        name || student.name,
        fatherName || student.father_name,
        dob || student.dob,
        gender || student.gender,
        course || student.course,
        className || student.class_name,
        phone || student.phone,
        fatherPhone || student.father_phone,
        address || student.address,
        previousEducation || student.previous_education,
        parseFloat(monthlyFee) || student.monthly_fee,
        loginId ? loginId.trim() : student.login_id,
        passHash,
        status || student.status,
        notes !== undefined ? notes : student.notes,
        student.student_id,
      ]
    );

    return res.json({ success: true, message: 'Student updated successfully.' });
  } catch (err) {
    console.error('Update student error:', err);
    return res.status(500).json({ error: 'Failed to update student.' });
  }
});

router.patch('/admin/students/:studentId/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (status !== 'active' && status !== 'disabled') {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const paramId = req.params.studentId;
    const student = queryOne('SELECT student_id FROM students WHERE student_id = ? OR id = ?', [paramId, paramId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    runQuery('UPDATE students SET status = ? WHERE student_id = ?', [status, student.student_id]);
    return res.json({ success: true, message: `Student status changed to ${status}.` });
  } catch (err) {
    console.error('Change student status error:', err);
    return res.status(500).json({ error: 'Failed to change student status.' });
  }
});

router.delete('/admin/students/:studentId', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const paramId = req.params.studentId;
    const student = queryOne('SELECT student_id FROM students WHERE student_id = ? OR id = ?', [paramId, paramId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    const targetStudentId = student.student_id;
    // Explicitly delete from all related tables to guarantee zero orphan records
    runQuery('DELETE FROM attendance WHERE student_id = ?', [targetStudentId]);
    runQuery('DELETE FROM results WHERE student_id = ?', [targetStudentId]);
    runQuery('DELETE FROM fee_challans WHERE student_id = ?', [targetStudentId]);
    runQuery('DELETE FROM daily_reports WHERE student_id = ?', [targetStudentId]);
    runQuery('DELETE FROM student_targets WHERE student_id = ?', [targetStudentId]);
    runQuery('DELETE FROM students WHERE student_id = ?', [targetStudentId]);
    return res.json({ success: true, message: 'Student and associated records removed successfully.' });
  } catch (err) {
    console.error('Delete student error:', err);
    return res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// -------------------------------------------------------------
// DAILY REPORT & 30-DAY PROGRESS ENGINE
// -------------------------------------------------------------

function buildStudentTimeline(startDateStr: string, durationDays: number, reports: any[]) {
  const reportsByDate = new Map<string, any[]>();
  for (const r of reports) {
    if (!reportsByDate.has(r.report_date)) {
      reportsByDate.set(r.report_date, []);
    }
    reportsByDate.get(r.report_date)!.push(r);
  }

  const timeline = [];
  const startD = new Date(startDateStr + 'T00:00:00Z');
  const dur = Math.max(1, parseInt(String(durationDays), 10) || 30);

  for (let i = 0; i < dur; i++) {
    const curD = new Date(startD);
    curD.setUTCDate(curD.getUTCDate() + i);
    const dateStr = curD.toISOString().split('T')[0];
    const dayReports = reportsByDate.get(dateStr) || [];
    const hasReport = dayReports.length > 0;

    // Sum reading amounts of all paras read on this date
    const dailyTotal = formatQuarter(dayReports.reduce((sum, r) => sum + (Number(r.reading_amount) || 0), 0));
    const paras = dayReports.map(r => r.para_no);
    const firstReport = dayReports[0] || null;

    timeline.push({
      dayIndex: i + 1,
      date: dateStr,
      hasReport,
      report: firstReport,
      reports: dayReports,
      readingAmount: dailyTotal,
      paraNo: firstReport ? firstReport.para_no : null,
      paras,
      listener: firstReport ? firstReport.listener : null,
      mistakes: dayReports.reduce((sum, r) => sum + (Number(r.mistakes) || 0), 0),
      stumbles: dayReports.reduce((sum, r) => sum + (Number(r.stumbles) || 0), 0),
      notes: dayReports.map(r => r.notes).filter(Boolean).join('; ') || (firstReport?.notes || null),
    });
  }

  return timeline;
}

function buildStudentSummary(target: any, reports: any[]) {
  const targetParas = Number(target?.target_paras) || 2.0;
  const durationDays = Math.max(1, parseInt(String(target?.duration_days || target?.target_duration_days), 10) || 30);
  const startDate = target?.start_date || new Date().toISOString().split('T')[0];
  const endDate = target?.end_date || calculateTargetEndDate(startDate, durationDays);

  // Filter reports strictly within student's target period [startDate, endDate]
  const validReports = reports.filter(r => r.report_date >= startDate && r.report_date <= endDate);
  const reportsAdded = validReports.length;

  // Distinct dates on which the student read
  const distinctDays = new Set(validReports.map(r => r.report_date));
  const activeDaysCount = distinctDays.size;
  const daysWithoutReport = Math.max(0, durationDays - activeDaysCount);

  const totalRead = formatQuarter(validReports.reduce((sum, r) => sum + (Number(r.reading_amount) || 0), 0));
  const averagePerDay = activeDaysCount > 0 ? Math.round((totalRead / activeDaysCount) * 100) / 100 : 0;
  const averagePerReport = reportsAdded > 0 ? Math.round((totalRead / reportsAdded) * 100) / 100 : 0;
  const progressPercent = Math.min(100, Math.round(((totalRead / targetParas) * 100) * 10) / 10);
  const status = progressPercent >= 100 ? 'Target Completed' : (totalRead > 0 ? 'In Progress' : 'Not Started');

  return {
    targetParas,
    totalDays: durationDays,
    durationDays,
    startDate,
    endDate,
    reportsAdded,
    activeDaysCount,
    daysWithoutReport,
    totalRead,
    averagePerDay,
    averagePerReport,
    progressPercent,
    status,
  };
}

// Get student details, individual target, previous reports, summary and timeline
router.get(['/admin/daily-reports/student/:studentId', '/admin/reports/:studentId'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const student = queryOne('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    let target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    if (!target) {
      const today = new Date().toISOString().split('T')[0];
      const dur = 30;
      const endDate = calculateTargetEndDate(today, dur);
      runQuery(
        `INSERT INTO student_targets (student_id, target_paras, duration_days, target_duration_days, start_date, end_date, total_read, progress_percent, status, updated_at)
         VALUES (?, 2.0, ?, ?, ?, ?, 0.0, 0.0, 'Not Started', ?)`,
        [studentId, dur, dur, today, endDate, today]
      );
      target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    }

    const durationDays = Math.max(1, parseInt(String(target.duration_days || target.target_duration_days), 10) || 30);

    // Retrieve ALL daily reports saved for this student (never delete previous days)
    const reports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [studentId]
    );

    const summary = buildStudentSummary(target, reports);
    const timeline = buildStudentTimeline(target.start_date, durationDays, reports);

    return res.json({
      student: {
        studentId: student.student_id,
        name: student.name,
        fatherName: student.father_name,
        course: student.course,
        className: student.class_name,
        monthlyFee: student.monthly_fee,
        status: student.status,
      },
      target,
      reports,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err) {
    console.error('Get student daily report error:', err);
    return res.status(500).json({ error: 'Failed to retrieve daily report data.' });
  }
});

// View single report details
router.get('/admin/daily-reports/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const reportId = req.params.id;
    const report = queryOne(
      `SELECT dr.*, s.name as student_name, s.father_name, s.course, s.class_name
       FROM daily_reports dr
       JOIN students s ON dr.student_id = s.student_id
       WHERE dr.id = ?`,
      [reportId]
    );
    if (!report) {
      return res.status(404).json({ error: 'Daily report not found.' });
    }
    return res.json(report);
  } catch (err) {
    console.error('Get single report error:', err);
    return res.status(500).json({ error: 'Failed to retrieve daily report.' });
  }
});

// Add or update daily report(s) - Supports MULTIPLE paras on same date
router.post(['/admin/daily-reports', '/admin/reports'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { studentId, reportDate, entries, paraNo, readingAmount, listener, mistakes, stumbles, notes, overwrite } = req.body;

    if (!studentId || !reportDate) {
      return res.status(400).json({ error: 'Please provide Student ID and Report Date.' });
    }

    // Verify student exists
    const student = queryOne('SELECT * FROM students WHERE student_id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student with ID ' + studentId + ' does not exist.' });
    }

    // Normalize entries (support batch multi-entry or legacy single entry)
    let rawList: any[] = [];
    if (Array.isArray(entries) && entries.length > 0) {
      rawList = entries;
    } else if (paraNo !== undefined && readingAmount !== undefined) {
      rawList = [{ paraNo, readingAmount, listener, mistakes, stumbles, notes }];
    } else {
      return res.status(400).json({ error: 'Please provide at least one Para entry.' });
    }

    // Validate entries
    const parsedEntries: Array<{
      paraNo: number;
      readingAmount: number;
      listener: string;
      mistakes: number;
      stumbles: number;
      notes: string;
    }> = [];

    const seenParas = new Set<number>();
    for (const item of rawList) {
      const p = parseInt(String(item.paraNo), 10);
      if (isNaN(p) || p < 1 || p > 30) {
        return res.status(400).json({ error: 'Each Quran Para must be between 1 and 30.' });
      }
      if (seenParas.has(p)) {
        return res.status(400).json({ error: `Para ${p} cannot be entered more than once in the same day's submission.` });
      }
      seenParas.add(p);

      const r = parseFloat(String(item.readingAmount !== undefined ? item.readingAmount : '0'));
      if (isNaN(r) || r < 0 || r > 30) {
        return res.status(400).json({ error: 'مقدارِ خواندگی must be between 0.00 and 30.00 Paras.' });
      }
      const formattedReading = formatQuarter(r);
      const l = (item.listener && String(item.listener).trim()) ? String(item.listener).trim() : 'Qari Sahab';
      const m = Math.max(0, parseInt(String(item.mistakes || 0), 10) || 0);
      const s = Math.max(0, parseInt(String(item.stumbles || 0), 10) || 0);
      const n = item.notes ? String(item.notes).trim() : '';

      parsedEntries.push({
        paraNo: p,
        readingAmount: formattedReading,
        listener: l,
        mistakes: m,
        stumbles: s,
        notes: n,
      });
    }

    // Check for duplicates in DB for (studentId, reportDate, paraNo)
    const existingDuplicates: any[] = [];
    for (const entry of parsedEntries) {
      const existing = queryOne(
        'SELECT * FROM daily_reports WHERE student_id = ? AND report_date = ? AND para_no = ?',
        [studentId, reportDate, entry.paraNo]
      );
      if (existing) {
        existingDuplicates.push(existing);
      }
    }

    if (existingDuplicates.length > 0 && !overwrite) {
      const dupParas = existingDuplicates.map(d => 'Para ' + d.para_no).join(', ');
      return res.status(409).json({
        duplicate: true,
        existingReport: existingDuplicates[0],
        existingReports: existingDuplicates,
        message: `A report already exists for ${dupParas} on ${reportDate}. Would you like to update the existing record(s)?`,
      });
    }

    const now = new Date().toISOString().split('T')[0];

    // Save or update entries
    for (const entry of parsedEntries) {
      const existing = queryOne(
        'SELECT id FROM daily_reports WHERE student_id = ? AND report_date = ? AND para_no = ?',
        [studentId, reportDate, entry.paraNo]
      );

      if (existing) {
        runQuery(
          `UPDATE daily_reports SET
            reading_amount = ?, listener = ?, mistakes = ?, stumbles = ?, notes = ?, updated_at = ?
           WHERE id = ?`,
          [entry.readingAmount, entry.listener, entry.mistakes, entry.stumbles, entry.notes, now, existing.id]
        );
      } else {
        runQuery(
          `INSERT INTO daily_reports (
            student_id, report_date, para_no, reading_amount, listener, mistakes, stumbles, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, reportDate, entry.paraNo, entry.readingAmount, entry.listener, entry.mistakes, entry.stumbles, entry.notes, now, now]
        );
      }
    }

    // Recalculate student's progress immediately
    const recalculated = recalculateStudentProgress(studentId);

    const updatedReports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [studentId]
    );

    const target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    const durationDays = target ? (target.duration_days || target.target_duration_days || 30) : 30;
    const summary = buildStudentSummary(target, updatedReports);
    const timeline = buildStudentTimeline(target.start_date, durationDays, updatedReports);

    return res.json({
      success: true,
      message: parsedEntries.length > 1
        ? `${parsedEntries.length} Para reports saved successfully for ${reportDate}.`
        : 'Daily report saved successfully.',
      calculated: recalculated,
      target,
      reports: updatedReports,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err: any) {
    console.error('Save daily report error:', err);
    return res.status(500).json({ error: 'Failed to save daily report: ' + (err.message || 'Database error') });
  }
});

// Edit existing daily report by ID
router.put(['/admin/daily-reports/:id', '/admin/reports/:id'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const reportId = req.params.id;
    const existing = queryOne('SELECT * FROM daily_reports WHERE id = ?', [reportId]);
    if (!existing) {
      return res.status(404).json({ error: 'Daily report not found.' });
    }

    const { reportDate, paraNo, readingAmount, listener, mistakes, stumbles, notes } = req.body;

    const newDate = reportDate || existing.report_date;
    const newPara = paraNo !== undefined ? parseInt(paraNo, 10) : existing.para_no;
    const newReading = readingAmount !== undefined ? formatQuarter(parseFloat(readingAmount)) : existing.reading_amount;
    const newListener = listener ? listener.trim() : existing.listener;
    const newMistakes = mistakes !== undefined ? parseInt(mistakes) || 0 : existing.mistakes;
    const newStumbles = stumbles !== undefined ? parseInt(stumbles) || 0 : existing.stumbles;
    const newNotes = notes !== undefined ? notes : (existing.notes || '');

    if (newPara < 1 || newPara > 30) {
      return res.status(400).json({ error: 'Quran Para must be between 1 and 30.' });
    }
    if (newReading < 0 || newReading > 30) {
      return res.status(400).json({ error: 'مقدارِ خواندگی must be between 0.00 and 30.00 Paras.' });
    }

    // Check conflict if changing date or para
    if (newDate !== existing.report_date || newPara !== existing.para_no) {
      const conflict = queryOne(
        'SELECT id FROM daily_reports WHERE student_id = ? AND report_date = ? AND para_no = ? AND id != ?',
        [existing.student_id, newDate, newPara, reportId]
      );
      if (conflict) {
        return res.status(409).json({
          error: `A report already exists for Para ${newPara} on ${newDate} for this student.`,
        });
      }
    }

    const now = new Date().toISOString().split('T')[0];

    runQuery(
      `UPDATE daily_reports SET
        report_date = ?, para_no = ?, reading_amount = ?, listener = ?,
        mistakes = ?, stumbles = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [newDate, newPara, newReading, newListener, newMistakes, newStumbles, newNotes, now, reportId]
    );

    // Recalculate student's progress immediately
    const recalculated = recalculateStudentProgress(existing.student_id);

    const updatedReports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [existing.student_id]
    );

    const target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [existing.student_id]);
    const durationDays = target ? (target.duration_days || target.target_duration_days || 30) : 30;
    const summary = buildStudentSummary(target, updatedReports);
    const timeline = buildStudentTimeline(target.start_date, durationDays, updatedReports);

    return res.json({
      success: true,
      message: 'Daily report updated and progress recalculated successfully.',
      calculated: recalculated,
      target,
      reports: updatedReports,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err: any) {
    console.error('Update daily report error:', err);
    return res.status(500).json({ error: 'Failed to update daily report: ' + (err.message || 'Database error') });
  }
});

// Delete single daily report by ID (recalculates progress immediately)
router.delete(['/admin/daily-reports/:id', '/admin/reports/:id'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const reportId = req.params.id;
    const report = queryOne('SELECT * FROM daily_reports WHERE id = ?', [reportId]);
    if (!report) {
      return res.status(404).json({ error: 'Daily report not found.' });
    }

    const studentId = report.student_id;

    // Delete ONLY this single daily report
    runQuery('DELETE FROM daily_reports WHERE id = ?', [reportId]);

    // Recalculate student's progress immediately
    const recalculated = recalculateStudentProgress(studentId);

    const updatedReports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [studentId]
    );

    const target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    const durationDays = target ? (target.duration_days || target.target_duration_days || 30) : 30;
    const summary = buildStudentSummary(target, updatedReports);
    const timeline = buildStudentTimeline(target.start_date, durationDays, updatedReports);

    return res.json({
      success: true,
      message: 'Daily report deleted successfully and progress recalculated.',
      calculated: recalculated,
      target,
      reports: updatedReports,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err: any) {
    console.error('Delete daily report error:', err);
    return res.status(500).json({ error: 'Failed to delete daily report: ' + (err.message || 'Database error') });
  }
});

// Update student's individual target (Target Days and Target Paras)
router.put('/admin/targets/:studentId', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const { targetParas, target_paras, targetDays, target_days, durationDays, duration_days, startDate, start_date, endDate, end_date } = req.body;
    const paras = parseFloat(targetParas !== undefined ? targetParas : target_paras);
    if (isNaN(paras) || paras <= 0) {
      return res.status(400).json({ error: 'Please provide a valid number of target Paras (> 0).' });
    }

    const dur = Math.max(1, parseInt(String(targetDays || target_days || durationDays || duration_days), 10) || 30);
    const today = new Date().toISOString().split('T')[0];
    const sDate = startDate || start_date || today;
    // Exactly dur days inclusive (Day 1 + (dur - 1) days = Day N)
    const eDate = endDate || end_date || calculateTargetEndDate(sDate, dur);

    // Check existing target
    const existing = queryOne('SELECT id FROM student_targets WHERE student_id = ?', [studentId]);
    if (existing) {
      runQuery(
        `UPDATE student_targets SET
          target_paras = ?, duration_days = ?, target_duration_days = ?, start_date = ?, end_date = ?, updated_at = ?
         WHERE student_id = ?`,
        [paras, dur, dur, sDate, eDate, today, studentId]
      );
    } else {
      runQuery(
        `INSERT INTO student_targets (student_id, target_paras, duration_days, target_duration_days, start_date, end_date, total_read, progress_percent, status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 0.0, 0.0, 'Not Started', ?)`,
        [studentId, paras, dur, dur, sDate, eDate, today]
      );
    }

    // Recalculate progress against new target
    const recalculated = recalculateStudentProgress(studentId);
    const target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);

    const updatedReports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [studentId]
    );
    const summary = buildStudentSummary(target, updatedReports);
    const timeline = buildStudentTimeline(target.start_date, dur, updatedReports);

    return res.json({
      success: true,
      message: `Student target updated successfully (${dur} Days, ${paras} Paras).`,
      target,
      calculated: recalculated,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err) {
    console.error('Update student target error:', err);
    return res.status(500).json({ error: 'Failed to update target.' });
  }
});

// Progress tracking across all students (shows each student's individual target days & paras)
router.get('/admin/progress', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const rows = queryAll(`
      SELECT s.id, s.student_id, s.name, s.name as student_name, s.father_name, s.course, s.class_name,
             st.target_paras, st.total_read, st.progress_percent, st.status as target_status,
             st.start_date, st.end_date, st.duration_days, st.target_duration_days,
             (SELECT COUNT(*) FROM daily_reports dr WHERE dr.student_id = s.student_id AND dr.report_date >= st.start_date AND dr.report_date <= st.end_date) as report_count
      FROM students s
      LEFT JOIN student_targets st ON s.student_id = st.student_id
      ORDER BY s.id ASC
    `);

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMs = new Date(todayStr + 'T00:00:00Z').getTime();
    const msInDay = 24 * 60 * 60 * 1000;

    const result = rows.map((r) => {
      const dur = Math.max(1, parseInt(String(r.duration_days || r.target_duration_days), 10) || 30);
      const sDate = r.start_date || todayStr;
      const eDate = r.end_date || calculateTargetEndDate(sDate, dur);
      const startMs = new Date(sDate + 'T00:00:00Z').getTime();

      let elapsed = Math.floor((currentMs - startMs) / msInDay) + 1;
      if (elapsed < 0) elapsed = 0;
      if (elapsed > dur) elapsed = dur;

      let remaining = dur - elapsed;
      if (remaining < 0) remaining = 0;

      const reportsCount = r.report_count || 0;
      const divisor = reportsCount > 0 ? reportsCount : 1;
      const avg = r.total_read ? Math.round((r.total_read / divisor) * 100) / 100 : 0;

      return {
        ...r,
        duration_days: dur,
        target_duration_days: dur,
        days_completed: elapsed,
        days_remaining: remaining,
        average_per_day: avg,
        averagePerDay: avg,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Get progress list error:', err);
    return res.status(500).json({ error: 'Failed to fetch progress list.' });
  }
});

// -------------------------------------------------------------
// ATTENDANCE SYSTEM
// -------------------------------------------------------------

router.get('/admin/attendance', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { course, date } = req.query;
    if (!course || !date) {
      return res.status(400).json({ error: 'Please select course and date.' });
    }

    let studentsSql = `SELECT student_id, name, father_name, course, class_name FROM students WHERE status = 'active'`;
    const params: any[] = [];
    if (course !== 'All') {
      studentsSql += ` AND course = ?`;
      params.push(course);
    }
    studentsSql += ` ORDER BY student_id ASC`;

    const students = queryAll(studentsSql, params);

    // Get attendance records for this date
    const attendanceRecords = queryAll(
      `SELECT student_id, status FROM attendance WHERE attendance_date = ?`,
      [date]
    );
    const map = new Map<string, string>();
    for (const a of attendanceRecords) {
      map.set(a.student_id, a.status);
    }

    const result = students.map((s) => ({
      ...s,
      status: map.get(s.student_id) || 'Present', // default to Present if not yet marked
      marked: map.has(s.student_id),
    }));

    return res.json(result);
  } catch (err) {
    console.error('Get attendance error:', err);
    return res.status(500).json({ error: 'Failed to load attendance sheet.' });
  }
});

router.post('/admin/attendance', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { date, records } = req.body;
    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Invalid attendance payload.' });
    }

    const now = new Date().toISOString().split('T')[0];

    for (const r of records) {
      const existing = queryOne(
        'SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?',
        [r.studentId, date]
      );
      if (existing) {
        runQuery(
          'UPDATE attendance SET status = ?, course = ? WHERE id = ?',
          [r.status, r.course || '', existing.id]
        );
      } else {
        runQuery(
          'INSERT INTO attendance (student_id, attendance_date, status, course, created_at) VALUES (?, ?, ?, ?, ?)',
          [r.studentId, date, r.status, r.course || '', now]
        );
      }
    }

    return res.json({ success: true, message: 'Attendance saved successfully.' });
  } catch (err) {
    console.error('Save attendance error:', err);
    return res.status(500).json({ error: 'Failed to save attendance.' });
  }
});

router.get('/admin/attendance/history', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { date, course, studentId } = req.query;
    let sql = `
      SELECT a.*, s.name as student_name, s.father_name, s.class_name
      FROM attendance a
      JOIN students s ON a.student_id = s.student_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date) {
      sql += ` AND a.attendance_date = ?`;
      params.push(date);
    }
    if (course && course !== 'All') {
      sql += ` AND a.course = ?`;
      params.push(course);
    }
    if (studentId) {
      sql += ` AND a.student_id = ?`;
      params.push(studentId);
    }

    sql += ` ORDER BY a.attendance_date DESC, a.id DESC LIMIT 100`;
    const rows = queryAll(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('Attendance history error:', err);
    return res.status(500).json({ error: 'Failed to fetch attendance history.' });
  }
});

// -------------------------------------------------------------
// FEE CHALLANS SYSTEM
// -------------------------------------------------------------

router.get(['/admin/fee-challans', '/admin/challans'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { search, studentId, month, year, status } = req.query;
    let sql = `SELECT * FROM fee_challans WHERE 1=1`;
    const params: any[] = [];

    const searchTerm = (search || studentId) as string | undefined;
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const term = `%${searchTerm.trim()}%`;
      sql += ` AND (student_id LIKE ? OR student_name LIKE ? OR challan_no LIKE ?)`;
      params.push(term, term, term);
    }
    if (month && month !== 'All') {
      sql += ` AND month = ?`;
      params.push(month);
    }
    if (year && year !== 'All') {
      sql += ` AND year = ?`;
      params.push(parseInt(year as string, 10));
    }
    if (status && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY id DESC`;
    const rows = queryAll(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('Get challans error:', err);
    return res.status(500).json({ error: 'Failed to fetch fee challans.' });
  }
});

router.post(['/admin/fee-challans/generate', '/admin/challans/generate'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { mode, target, studentId, month, year, customFee, feeAmount, issueDate: reqIssue, dueDate: reqDue, expiryDate: reqExp } = req.body;
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required.' });
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.indexOf(month);
    const mStr = (monthIndex + 1).toString().padStart(2, '0');

    // Rule: Issue Date = 1st of month, Due/Expiry Date = 10th of month (or custom if provided)
    const issueDate = reqIssue || `${year}-${mStr}-01`;
    const dueDate = reqDue || `${year}-${mStr}-10`;
    const expiryDate = reqExp || `${year}-${mStr}-10`;
    const now = new Date().toISOString().split('T')[0];

    const generationTarget = target || mode || 'all';

    let studentsToGenerate: any[] = [];
    if (generationTarget === 'single') {
      if (!studentId) return res.status(400).json({ error: 'Student ID is required for single generation.' });
      const student = queryOne('SELECT * FROM students WHERE student_id = ?', [studentId.trim()]);
      if (!student) return res.status(404).json({ error: 'Student not found.' });
      studentsToGenerate = [student];
    } else {
      studentsToGenerate = queryAll("SELECT * FROM students WHERE status = 'active'");
    }

    let generatedCount = 0;
    for (const s of studentsToGenerate) {
      const existing = queryOne(
        'SELECT id FROM fee_challans WHERE student_id = ? AND month = ? AND year = ?',
        [s.student_id, month, parseInt(year, 10)]
      );

      const feeVal = (feeAmount !== undefined ? feeAmount : customFee !== undefined ? customFee : s.monthly_fee);
      const fee = parseFloat(feeVal) || s.monthly_fee;

      if (existing) {
        runQuery('UPDATE fee_challans SET fee_amount = ?, issue_date = ?, due_date = ?, expiry_date = ? WHERE id = ?', [fee, issueDate, dueDate, expiryDate, existing.id]);
      } else {
        const challanNo = `CH-${year}${mStr}-${s.student_id}`;
        runQuery(
          `INSERT INTO fee_challans (
            challan_no, student_id, student_name, father_name, course, class_name,
            month, year, issue_date, due_date, expiry_date, fee_amount, status, address, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unpaid', ?, ?)`,
          [
            challanNo,
            s.student_id,
            s.name,
            s.father_name,
            s.course,
            s.class_name,
            month,
            parseInt(year, 10),
            issueDate,
            dueDate,
            expiryDate,
            fee,
            s.address,
            now,
          ]
        );
        generatedCount++;
      }
    }

    return res.json({
      success: true,
      message: `Generated/Updated fee challans for ${studentsToGenerate.length} student(s).`,
      generatedCount,
    });
  } catch (err) {
    console.error('Generate challan error:', err);
    return res.status(500).json({ error: 'Failed to generate challans.' });
  }
});

router.patch(['/admin/fee-challans/:id/status', '/admin/challans/:id/status'], authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    runQuery('UPDATE fee_challans SET status = ? WHERE id = ? OR challan_no = ?', [status, req.params.id, req.params.id]);
    return res.json({ success: true, message: `Challan status updated to ${status}.` });
  } catch (err) {
    console.error('Update challan status error:', err);
    return res.status(500).json({ error: 'Failed to update challan status.' });
  }
});

router.put('/admin/fee-challans/:challanNo', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { feeAmount, status } = req.body;
    const challan = queryOne('SELECT * FROM fee_challans WHERE challan_no = ?', [req.params.challanNo]);
    if (!challan) return res.status(404).json({ error: 'Challan not found.' });

    const newFee = feeAmount !== undefined ? parseFloat(feeAmount) : challan.fee_amount;
    const newStatus = status || challan.status;

    runQuery(
      'UPDATE fee_challans SET fee_amount = ?, status = ? WHERE challan_no = ?',
      [newFee, newStatus, req.params.challanNo]
    );

    return res.json({ success: true, message: 'Fee challan updated successfully.' });
  } catch (err) {
    console.error('Update challan error:', err);
    return res.status(500).json({ error: 'Failed to update fee challan.' });
  }
});

router.delete('/admin/fee-challans/:challanNo', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    runQuery('DELETE FROM fee_challans WHERE challan_no = ?', [req.params.challanNo]);
    return res.json({ success: true, message: 'Fee challan deleted.' });
  } catch (err) {
    console.error('Delete challan error:', err);
    return res.status(500).json({ error: 'Failed to delete challan.' });
  }
});

// -------------------------------------------------------------
// RESULTS SYSTEM
// -------------------------------------------------------------

router.get('/admin/results', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { search, course } = req.query;
    let sql = 'SELECT * FROM results WHERE 1=1';
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      sql += ` AND (student_id LIKE ? OR student_name LIKE ? OR exam_name LIKE ? OR subject LIKE ?)`;
      params.push(term, term, term, term);
    }
    if (course && course !== 'All') {
      sql += ` AND course = ?`;
      params.push(course);
    }

    sql += ' ORDER BY id DESC';
    const rows = queryAll(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('Get results error:', err);
    return res.status(500).json({ error: 'Failed to fetch results.' });
  }
});

router.post('/admin/results', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { studentId, examName, subject, examDate, marks, totalMarks, remarks } = req.body;
    if (!studentId || !examName || !subject || marks === undefined || !totalMarks) {
      return res.status(400).json({ error: 'Please provide all required result fields.' });
    }

    const student = queryOne('SELECT * FROM students WHERE student_id = ?', [studentId.trim()]);
    if (!student) return res.status(404).json({ error: 'Student not found with ID ' + studentId });

    const m = parseFloat(marks);
    const tm = parseFloat(totalMarks);
    if (tm <= 0) return res.status(400).json({ error: 'Total marks must be greater than zero.' });

    const pct = Math.round((m / tm) * 1000) / 10;
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B';
    else if (pct >= 60) grade = 'C';
    else if (pct >= 50) grade = 'D';

    const now = new Date().toISOString().split('T')[0];

    runQuery(
      `INSERT INTO results (
        student_id, student_name, course, exam_name, subject, exam_date,
        marks, total_marks, percentage, grade, remarks, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student.student_id,
        student.name,
        student.course,
        examName.trim(),
        subject.trim(),
        examDate || now,
        m,
        tm,
        pct,
        grade,
        remarks || '',
        now,
      ]
    );

    return res.json({ success: true, message: 'Result created successfully.' });
  } catch (err) {
    console.error('Create result error:', err);
    return res.status(500).json({ error: 'Failed to save result.' });
  }
});

router.put('/admin/results/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { examName, subject, examDate, marks, totalMarks, remarks } = req.body;
    const existing = queryOne('SELECT * FROM results WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Result not found.' });

    const m = parseFloat(marks);
    const tm = parseFloat(totalMarks);
    const pct = Math.round((m / tm) * 1000) / 10;
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B';
    else if (pct >= 60) grade = 'C';
    else if (pct >= 50) grade = 'D';

    runQuery(
      `UPDATE results SET
        exam_name = ?, subject = ?, exam_date = ?, marks = ?, total_marks = ?, percentage = ?, grade = ?, remarks = ?
       WHERE id = ?`,
      [examName, subject, examDate, m, tm, pct, grade, remarks || '', req.params.id]
    );

    return res.json({ success: true, message: 'Result updated successfully.' });
  } catch (err) {
    console.error('Update result error:', err);
    return res.status(500).json({ error: 'Failed to update result.' });
  }
});

router.delete('/admin/results/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    runQuery('DELETE FROM results WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Result deleted.' });
  } catch (err) {
    console.error('Delete result error:', err);
    return res.status(500).json({ error: 'Failed to delete result.' });
  }
});

// -------------------------------------------------------------
// EXAMS / DATE SHEET
// -------------------------------------------------------------

router.get('/admin/exams', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const rows = queryAll('SELECT * FROM exams ORDER BY exam_date ASC, start_time ASC');
  return res.json(rows);
});

router.post('/admin/exams', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { examName, course, examDate, startTime, endTime, venue, remarks } = req.body;
    if (!examName || !course || !examDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Please provide all required exam fields.' });
    }
    const now = new Date().toISOString().split('T')[0];
    runQuery(
      `INSERT INTO exams (exam_name, course, exam_date, start_time, end_time, venue, remarks, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [examName.trim(), course, examDate, startTime, endTime, venue || 'Main Madrasa Hall', remarks || '', now]
    );
    return res.json({ success: true, message: 'Exam added successfully.' });
  } catch (err) {
    console.error('Add exam error:', err);
    return res.status(500).json({ error: 'Failed to add exam.' });
  }
});

router.put('/admin/exams/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { examName, course, examDate, startTime, endTime, venue, remarks } = req.body;
    runQuery(
      `UPDATE exams SET exam_name = ?, course = ?, exam_date = ?, start_time = ?, end_time = ?, venue = ?, remarks = ?
       WHERE id = ?`,
      [examName, course, examDate, startTime, endTime, venue, remarks || '', req.params.id]
    );
    return res.json({ success: true, message: 'Exam updated successfully.' });
  } catch (err) {
    console.error('Update exam error:', err);
    return res.status(500).json({ error: 'Failed to update exam.' });
  }
});

router.delete('/admin/exams/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    runQuery('DELETE FROM exams WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Exam deleted.' });
  } catch (err) {
    console.error('Delete exam error:', err);
    return res.status(500).json({ error: 'Failed to delete exam.' });
  }
});

// -------------------------------------------------------------
// TIMINGS
// -------------------------------------------------------------

router.get('/admin/timings', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const rows = queryAll('SELECT * FROM timings ORDER BY id ASC');
  return res.json(rows);
});

router.post('/admin/timings', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { course, days, startTime, endTime, room, notes } = req.body;
    if (!course || !days || !startTime || !endTime) {
      return res.status(400).json({ error: 'Course, days, and times are required.' });
    }
    const now = new Date().toISOString().split('T')[0];
    runQuery(
      `INSERT INTO timings (course, days, start_time, end_time, room, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course, days, startTime, endTime, room || 'Classroom', notes || '', now]
    );
    return res.json({ success: true, message: 'Timing created.' });
  } catch (err) {
    console.error('Create timing error:', err);
    return res.status(500).json({ error: 'Failed to create timing.' });
  }
});

router.put('/admin/timings/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { course, days, startTime, endTime, room, notes } = req.body;
    runQuery(
      `UPDATE timings SET course = ?, days = ?, start_time = ?, end_time = ?, room = ?, notes = ? WHERE id = ?`,
      [course, days, startTime, endTime, room, notes || '', req.params.id]
    );
    return res.json({ success: true, message: 'Timing updated.' });
  } catch (err) {
    console.error('Update timing error:', err);
    return res.status(500).json({ error: 'Failed to update timing.' });
  }
});

router.delete('/admin/timings/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    runQuery('DELETE FROM timings WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Timing deleted.' });
  } catch (err) {
    console.error('Delete timing error:', err);
    return res.status(500).json({ error: 'Failed to delete timing.' });
  }
});

// -------------------------------------------------------------
// ANNOUNCEMENTS
// -------------------------------------------------------------

router.get('/admin/announcements', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const rows = queryAll('SELECT * FROM announcements ORDER BY id DESC');
  return res.json(rows);
});

router.post('/admin/announcements', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { title, message, date, status } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }
    const today = new Date().toISOString().split('T')[0];
    runQuery(
      `INSERT INTO announcements (title, message, date, status, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [title.trim(), message.trim(), date || today, status || 'Published', today]
    );
    return res.json({ success: true, message: 'Announcement created.' });
  } catch (err) {
    console.error('Create announcement error:', err);
    return res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

router.put('/admin/announcements/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { title, message, date, status } = req.body;
    runQuery(
      `UPDATE announcements SET title = ?, message = ?, date = ?, status = ? WHERE id = ?`,
      [title, message, date, status, req.params.id]
    );
    return res.json({ success: true, message: 'Announcement updated.' });
  } catch (err) {
    console.error('Update announcement error:', err);
    return res.status(500).json({ error: 'Failed to update announcement.' });
  }
});

router.delete('/admin/announcements/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    runQuery('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    return res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

// -------------------------------------------------------------
// ADMIN ACCOUNTS MANAGEMENT
// -------------------------------------------------------------

router.get('/admin/accounts', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const rows = queryAll('SELECT id, name, login_id, status, created_at FROM admins ORDER BY id ASC');
  return res.json(rows);
});

router.post('/admin/accounts', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { name, loginId, password } = req.body;
    if (!name || !loginId || !password || password.length < 6) {
      return res.status(400).json({ error: 'Admin Name, Login ID, and Password (min 6 chars) are required.' });
    }

    const existing = queryOne('SELECT id FROM admins WHERE login_id = ?', [loginId.trim()]);
    if (existing) {
      return res.status(400).json({ error: `Login ID "${loginId}" is already registered.` });
    }

    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(password, salt);
    const today = new Date().toISOString().split('T')[0];

    runQuery(
      'INSERT INTO admins (name, login_id, password_hash, status, created_at) VALUES (?, ?, ?, "active", ?)',
      [name.trim(), loginId.trim(), passHash, today]
    );

    return res.json({ success: true, message: 'New Administrator account created successfully.' });
  } catch (err) {
    console.error('Create admin account error:', err);
    return res.status(500).json({ error: 'Failed to create admin account.' });
  }
});

router.put('/admin/accounts/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { name, loginId } = req.body;

    if (!name || !loginId) {
      return res.status(400).json({ error: 'Name and Login ID are required.' });
    }

    const conflict = queryOne('SELECT id FROM admins WHERE login_id = ? AND id != ?', [loginId.trim(), adminId]);
    if (conflict) {
      return res.status(400).json({ error: `Login ID "${loginId}" is already in use by another admin.` });
    }

    runQuery('UPDATE admins SET name = ?, login_id = ? WHERE id = ?', [name.trim(), loginId.trim(), adminId]);
    return res.json({ success: true, message: 'Admin account details updated.' });
  } catch (err) {
    console.error('Update admin account error:', err);
    return res.status(500).json({ error: 'Failed to update admin account.' });
  }
});

router.patch('/admin/accounts/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (status !== 'active' && status !== 'disabled') {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Rule: At least one active admin must always remain
    if (status === 'disabled') {
      const activeCountRow = queryOne("SELECT COUNT(*) as count FROM admins WHERE status = 'active' AND id != ?", [adminId]);
      if (!activeCountRow || activeCountRow.count === 0) {
        return res.status(400).json({ error: 'Cannot disable this account. At least one active admin must always remain in the system.' });
      }
    }

    runQuery('UPDATE admins SET status = ? WHERE id = ?', [status, adminId]);
    return res.json({ success: true, message: `Admin account status updated to ${status}.` });
  } catch (err) {
    console.error('Admin status error:', err);
    return res.status(500).json({ error: 'Failed to change admin status.' });
  }
});

router.patch('/admin/accounts/:id/password', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const adminId = parseInt(req.params.id, 10);
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const passHash = bcrypt.hashSync(password, 10);
    runQuery('UPDATE admins SET password_hash = ? WHERE id = ?', [passHash, adminId]);
    return res.json({ success: true, message: 'Admin password updated successfully.' });
  } catch (err) {
    console.error('Change admin password error:', err);
    return res.status(500).json({ error: 'Failed to change admin password.' });
  }
});

router.delete('/admin/accounts/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const adminId = parseInt(req.params.id, 10);

    // Rule: An admin cannot delete their own currently logged-in account
    if (req.user?.id === adminId) {
      return res.status(400).json({ error: 'Security Rule: An administrator cannot delete their own currently logged-in account.' });
    }

    // Rule: At least one active admin must always remain
    const activeCountRow = queryOne("SELECT COUNT(*) as count FROM admins WHERE status = 'active' AND id != ?", [adminId]);
    if (!activeCountRow || activeCountRow.count === 0) {
      return res.status(400).json({ error: 'Security Rule: Cannot delete account. At least one active administrator must remain in the system.' });
    }

    runQuery('DELETE FROM admins WHERE id = ?', [adminId]);
    return res.json({ success: true, message: 'Admin account deleted successfully.' });
  } catch (err) {
    console.error('Delete admin error:', err);
    return res.status(500).json({ error: 'Failed to delete admin account.' });
  }
});

// -------------------------------------------------------------
// ADMISSIONS MANAGEMENT
// -------------------------------------------------------------

router.get('/admin/admissions', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const rows = queryAll('SELECT * FROM admissions ORDER BY id DESC');
  return res.json(rows);
});

router.patch('/admin/admissions/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid admission status.' });
    }
    runQuery('UPDATE admissions SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ success: true, message: `Admission application updated to ${status}.` });
  } catch (err) {
    console.error('Update admission status error:', err);
    return res.status(500).json({ error: 'Failed to update application.' });
  }
});

// -------------------------------------------------------------
// STUDENT PORTAL API (STUDENT CAN ONLY SEE THEIR OWN DATA)
// -------------------------------------------------------------

router.get('/student/profile', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    const student = queryOne(
      'SELECT student_id, name, father_name, dob, gender, course, class_name, phone, father_phone, address, admission_date, monthly_fee, status, created_at FROM students WHERE student_id = ?',
      [studentId]
    );
    if (!student) return res.status(404).json({ error: 'Student record not found.' });
    let target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    if (!target) {
      const today = new Date().toISOString().split('T')[0];
      const dur = 30;
      const endDate = calculateTargetEndDate(today, dur);
      runQuery(
        `INSERT INTO student_targets (student_id, target_paras, duration_days, target_duration_days, start_date, end_date, total_read, progress_percent, status, updated_at)
         VALUES (?, 2.0, ?, ?, ?, ?, 0.0, 0.0, 'Not Started', ?)`,
        [studentId, dur, dur, today, endDate, today]
      );
      target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    }

    const durationDays = Math.max(1, parseInt(String(target.duration_days || target.target_duration_days), 10) || 30);
    const reports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [studentId]
    );
    const summary = buildStudentSummary(target, reports);
    const timeline = buildStudentTimeline(target.start_date, durationDays, reports);

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMs = new Date(todayStr + 'T00:00:00Z').getTime();
    const startMs = new Date(target.start_date + 'T00:00:00Z').getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    let elapsed = Math.floor((currentMs - startMs) / msInDay) + 1;
    if (elapsed < 0) elapsed = 0;
    if (elapsed > durationDays) elapsed = durationDays;
    let remaining = durationDays - elapsed;
    if (remaining < 0) remaining = 0;

    return res.json({
      student,
      target: { ...target, duration_days: durationDays, target_duration_days: durationDays, days_completed: elapsed, days_remaining: remaining },
      reports,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err) {
    console.error('Student profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
});

router.get('/student/progress', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    let target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    if (!target) {
      const today = new Date().toISOString().split('T')[0];
      const dur = 30;
      const endDate = calculateTargetEndDate(today, dur);
      runQuery(
        `INSERT INTO student_targets (student_id, target_paras, duration_days, target_duration_days, start_date, end_date, total_read, progress_percent, status, updated_at)
         VALUES (?, 2.0, ?, ?, ?, ?, 0.0, 0.0, 'Not Started', ?)`,
        [studentId, dur, dur, today, endDate, today]
      );
      target = queryOne('SELECT * FROM student_targets WHERE student_id = ?', [studentId]);
    }

    const durationDays = Math.max(1, parseInt(String(target.duration_days || target.target_duration_days), 10) || 30);
    const reports = queryAll(
      'SELECT * FROM daily_reports WHERE student_id = ? ORDER BY report_date DESC, id DESC',
      [studentId]
    );
    const summary = buildStudentSummary(target, reports);
    const timeline = buildStudentTimeline(target.start_date, durationDays, reports);

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMs = new Date(todayStr + 'T00:00:00Z').getTime();
    const startMs = new Date(target.start_date + 'T00:00:00Z').getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    let elapsed = Math.floor((currentMs - startMs) / msInDay) + 1;
    if (elapsed < 0) elapsed = 0;
    if (elapsed > durationDays) elapsed = durationDays;
    let remaining = durationDays - elapsed;
    if (remaining < 0) remaining = 0;

    return res.json({
      target: { ...target, duration_days: durationDays, target_duration_days: durationDays, days_completed: elapsed, days_remaining: remaining },
      reports,
      summary,
      timeline,
      timeline30: timeline,
    });
  } catch (err) {
    console.error('Student progress error:', err);
    return res.status(500).json({ error: 'Failed to fetch student progress.' });
  }
});

router.get('/student/attendance', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    const history = queryAll(
      'SELECT * FROM attendance WHERE student_id = ? ORDER BY attendance_date DESC LIMIT 60',
      [studentId]
    );
    return res.json(history);
  } catch (err) {
    console.error('Student attendance error:', err);
    return res.status(500).json({ error: 'Failed to fetch student attendance.' });
  }
});

router.get(['/student/fee-challan', '/student/challans'], authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    const challans = queryAll(
      'SELECT * FROM fee_challans WHERE student_id = ? ORDER BY id DESC',
      [studentId]
    );
    return res.json(challans);
  } catch (err) {
    console.error('Student challan error:', err);
    return res.status(500).json({ error: 'Failed to fetch student fee challans.' });
  }
});

router.get('/student/results', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    const results = queryAll(
      'SELECT * FROM results WHERE student_id = ? ORDER BY exam_date DESC',
      [studentId]
    );
    return res.json(results);
  } catch (err) {
    console.error('Student results error:', err);
    return res.status(500).json({ error: 'Failed to fetch student results.' });
  }
});

router.get('/student/exams', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const course = req.user?.course;
    const rows = queryAll(
      'SELECT * FROM exams WHERE course = ? OR course = "All" ORDER BY exam_date ASC, start_time ASC',
      [course]
    );
    return res.json(rows);
  } catch (err) {
    console.error('Student exams error:', err);
    return res.status(500).json({ error: 'Failed to fetch exams.' });
  }
});

router.get('/student/timings', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const course = req.user?.course;
    const rows = queryAll('SELECT * FROM timings WHERE course = ?', [course]);
    return res.json(rows);
  } catch (err) {
    console.error('Student timings error:', err);
    return res.status(500).json({ error: 'Failed to fetch timings.' });
  }
});

router.get('/student/announcements', authenticate, requireStudent, (req: AuthRequest, res: Response) => {
  try {
    const rows = queryAll("SELECT * FROM announcements WHERE status = 'Published' ORDER BY id DESC");
    return res.json(rows);
  } catch (err) {
    console.error('Student announcements error:', err);
    return res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
});

export default router;
