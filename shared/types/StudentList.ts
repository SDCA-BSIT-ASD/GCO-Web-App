export interface StudentListItem {
  studentNumber: string
  firstName: string
  lastName: string
  emailAddress: string
  programName: string
  yearLevel: number
  status: string
}

export interface StudentListResponse {
  success: boolean
  data: StudentListItem[]
  message?: string
}
