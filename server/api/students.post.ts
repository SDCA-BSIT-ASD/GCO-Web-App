import { createError, defineEventHandler, readBody, setResponseStatus, type H3Event } from 'h3'
import { EmployeeModel } from '../models/Employee'
import { AcademicProgramModel } from '../models/AcademicProgram'
import { StudentModel } from '../models/Student'
import { getSessionUser } from '../utils/auth'
import type { Student } from '#shared/types/User'

const ALLOWED_STATUSES = new Set(['Regular', 'Irregular'])

// Converts numeric form values to numbers; returns null when the input is unusable.
function parseNumericInput(value: unknown): number | null {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    return Number(value)
  }

  return null
}

// Checks the submitted fields and returns a trimmed, normalized student record.
function validateStudentInput(body: unknown) {
  const input: Record<string, unknown> =
    body && typeof body === 'object' && !Array.isArray(body)
      ? body as Record<string, unknown>
      : {}

  const {
    firstName,
    lastName,
    emailAddress,
    studentNumber,
    programName,
    yearLevel,
    status
  } = input

  const parsedStudentNumber = parseNumericInput(studentNumber)
  if (
    typeof firstName !== 'string' || !firstName.trim()
    || typeof lastName !== 'string' || !lastName.trim()
    || typeof emailAddress !== 'string' || !emailAddress.trim()
    || typeof programName !== 'string' || !programName.trim()
    || typeof status !== 'string' || !status.trim()
    || parsedStudentNumber === null
    || !Number.isSafeInteger(parsedStudentNumber)
    || parsedStudentNumber < 1
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'First name, last name, email, student number, program, year level, and status are required.'
    })
  }

  const normalizedEmail = emailAddress.trim().toLowerCase()
  const parsedYearLevel = parseNumericInput(yearLevel)
  if (
    parsedYearLevel === null
    || !Number.isInteger(parsedYearLevel)
    || parsedYearLevel < 1
    || parsedYearLevel > 5
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Year level must be a valid number.'
    })
  }

  const normalizedStatus = status.trim()
  if (!ALLOWED_STATUSES.has(normalizedStatus)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Status must be either Regular or Irregular.'
    })
  }

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    emailAddress: normalizedEmail,
    studentNumber: parsedStudentNumber,
    programName: programName.trim(),
    yearLevel: parsedYearLevel,
    status: normalizedStatus
  }
}

// Confirms the signed-in user's email belongs to an admin employee record.
async function requireAdmin(emailAddress: string) {
  const admin = await EmployeeModel.findOne({
    emailAddress,
    isAdmin: true
  })

  if (!admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only admins can add students.'
    })
  }
}

// Applies session and admin checks before running a route handler.
function defineAdminEventHandler(handler: (event: H3Event) => Promise<unknown>) {
  return defineEventHandler(async (event) => {
    const sessionUser = getSessionUser(event)

    if (!sessionUser?.emailAddress) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required.'
      })
    }

    await requireAdmin(sessionUser.emailAddress)
    return handler(event)
  })
}

function createDuplicateStudentError() {
  return createError({
    statusCode: 409,
    statusMessage: 'A student with that email address or student number already exists.'
  })
}

async function requireActiveProgram(programName: string) {
  const program = await AcademicProgramModel.findOne({
    programName,
    isActive: true
  })

  if (!program) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid program.'
    })
  }

  return program
}

async function ensureStudentDoesNotExist(student: Pick<Student, 'emailAddress' | 'studentNumber'>) {
  const existingStudent = await StudentModel.findOne({
    $or: [
      { emailAddress: student.emailAddress },
      { studentNumber: student.studentNumber }
    ]
  })

  if (existingStudent) {
    throw createDuplicateStudentError()
  }
}

// Validates the student data, checks for conflicts, and creates the record.
async function createStudent(event: H3Event) {
  const body = await readBody(event)
  const student = validateStudentInput(body)

  if (!/^[^\s@]+@sdca\.edu\.ph$/.test(student.emailAddress)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email must be an @sdca.edu.ph address.'
    })
  }

  const validProgram = await requireActiveProgram(student.programName)
  await ensureStudentDoesNotExist(student)

  try {
    const studentData: Omit<Student, 'createdAt' | 'updatedAt'> = {
      firstName: student.firstName,
      lastName: student.lastName,
      emailAddress: student.emailAddress,
      studentNumber: student.studentNumber,
      programName: validProgram.programName,
      yearLevel: student.yearLevel,
      status: student.status
    }
    const newStudent = await StudentModel.create(studentData)

    setResponseStatus(event, 201)
    return {
      message: 'Student created successfully.',
      data: {
        id: newStudent._id.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        emailAddress: student.emailAddress,
        studentNumber: String(student.studentNumber),
        programName: validProgram.programName,
        yearLevel: student.yearLevel,
        status: student.status
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    if (error instanceof Error && 'code' in error && error.code === 11000) {
      throw createDuplicateStudentError()
    }

    throw error
  }
}

export default defineAdminEventHandler(createStudent)