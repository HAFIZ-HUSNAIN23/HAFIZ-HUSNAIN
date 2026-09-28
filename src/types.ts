export type Role = 'admin' | 'student';

export interface UserSession {
  id: number;
  loginId: string;
  name: string;
  role: Role;
  studentId?: string;
  course?: string;
  className?: string;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  father_name: string;
  dob?: string;
  gender: string;
  course: string;
  class_name: string;
  phone: string;
  father_phone: string;
  address: string;
  previous_education?: string;
  admission_date: string;
  monthly_fee: number;
  login_id: string;
  status: 'active' | 'disabled';
  notes?: string;
  created_at: string;
  target_paras?: number;
  total_read?: number;
  progress_percent?: number;
  target_status?: string;
  target_start_date?: string;
  target_end_date?: string;
  days_completed?: number;
  days_remaining?: number;
  average_per_day?: number;
}

export interface StudentTarget {
  id: number;
  student_id: string;
  target_paras: number;
  duration_days: number;
  target_duration_days?: number;
  start_date: string;
  end_date: string;
  total_read: number;
  progress_percent: number;
  status: string;
  updated_at: string;
  days_completed?: number;
  days_remaining?: number;
}

export interface DailyReport {
  id: number;
  student_id: string;
  report_date: string;
  para_no: number;
  reading_amount: number;
  listener: string;
  mistakes: number;
  stumbles: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
  student_name?: string;
  father_name?: string;
  course?: string;
  class_name?: string;
}

export interface DayReportItem {
  dayIndex: number;
  date: string;
  hasReport: boolean;
  report?: DailyReport | null;
  reports?: DailyReport[];
  readingAmount: number;
  paraNo?: number | null;
  paras?: number[];
  listener?: string | null;
  mistakes?: number | null;
  stumbles?: number | null;
  notes?: string | null;
}

export interface ReportSummary30 {
  targetParas: number;
  totalDays: number;
  durationDays?: number;
  startDate: string;
  endDate: string;
  reportsAdded: number;
  activeDaysCount?: number;
  daysWithoutReport: number;
  totalRead: number;
  averagePerDay?: number;
  averagePerReport: number;
  progressPercent: number;
  status: string;
}

export interface AttendanceRecord {
  id: number;
  student_id: string;
  attendance_date: string;
  status: 'Present' | 'Absent' | 'Leave';
  course: string;
  student_name?: string;
  father_name?: string;
  class_name?: string;
}

export interface FeeChallan {
  id: number;
  challan_no: string;
  student_id: string;
  student_name: string;
  father_name: string;
  course: string;
  class_name: string;
  month: string;
  year: number;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  fee_amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  address?: string;
  created_at: string;
}

export interface Result {
  id: number;
  student_id: string;
  student_name: string;
  course: string;
  exam_name: string;
  subject: string;
  exam_date: string;
  marks: number;
  total_marks: number;
  percentage: number;
  grade: string;
  remarks?: string;
}

export interface Exam {
  id: number;
  exam_name: string;
  course: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  remarks?: string;
}

export interface Timing {
  id: number;
  course: string;
  days: string;
  start_time: string;
  end_time: string;
  room: string;
  notes?: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  status: 'Published' | 'Draft';
}

export interface AdminAccount {
  id: number;
  name: string;
  login_id: string;
  status: 'active' | 'disabled';
  created_at: string;
}

export interface AdmissionApplication {
  id: number;
  application_no: string;
  student_name: string;
  father_name: string;
  dob: string;
  gender: string;
  course: string;
  class_name: string;
  phone: string;
  father_phone: string;
  address: string;
  previous_education?: string;
  admission_date: string;
  monthly_fee: number;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}
