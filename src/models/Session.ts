
// Session model definition
export interface Session {
  id: string;
  teacherId: string;
  studentId: string;
  teacherName?: string;
  studentName?: string;
  skill: string;
  day: string;
  timeSlot: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRequest {
  teacherId: string;
  studentId: string;
  skill: string;
  day: string;
  timeSlot: string;
}
