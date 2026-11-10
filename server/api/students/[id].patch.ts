import { createError, defineEventHandler, type H3Event } from 'h3'

import { AcademicProgramModel } from '../../models/AcademicProgram'
import { EmployeeModel } from '../../models/Employee'
import { StudentModel } from '../../models/Student'
import { UserModel } from '../../models/User'
import { getSessionUser } from '../../utils/auth'

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Verifies admin authorization.
async function verifyAdminAuthorization(event: H3Event) {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required. Please log in.'
    })
  }

  const admin = await EmployeeModel.findOne({
    emailAddress: sessionUser.emailAddress,
    isAdmin: true
  })

  if (!admin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have permission.'
    })
  }

  return admin
}

async function validateStudentEmail(email: unknown, studentId: string) {
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@sdca\.edu\.ph$/.test(normalizedEmail)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A valid email address belonging to the @sdca.edu.ph domain is required.'
    })
  }

  const existingUser = await UserModel.exists({
    emailAddress: { $regex: new RegExp(`^${escapeRegex(normalizedEmail)}$`, 'i') },
    _id: { $ne: studentId }
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Email address is already in use.'
    })
  }

  return normalizedEmail
}