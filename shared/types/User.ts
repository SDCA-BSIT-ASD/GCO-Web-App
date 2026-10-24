export interface User {
  emailAddress: string
  firstName: string
  lastName: string
  googleId?: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Student extends User {
  programName: string
  yearLevel: number
  status: string
}

export interface Employee extends User {
  type: string
  department: string
  isAdmin: boolean
}