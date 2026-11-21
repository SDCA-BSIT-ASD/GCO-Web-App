export function formatStudentProfile(rawStudent) {
  if (!rawStudent) {
    throw new Error('Student data is required.')
  }

  return {
    id: String(rawStudent.id),
    studentNumber: rawStudent.studentNumber,
    fullName: `${rawStudent.firstName} ${rawStudent.lastName}`.trim(),
    emailAddress: rawStudent.emailAddress,
    programName: rawStudent.programName,
    yearLevel: rawStudent.yearLevel,
    status: rawStudent.status
  }
}