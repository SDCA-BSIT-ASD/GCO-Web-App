import { createError, defineEventHandler, type H3Event, readBody } from 'h3'

import { AcademicProgramModel } from '../models/AcademicProgram'
import { UserModel } from '../models/User'
import { getSessionUser } from '../utils/auth'
import { validateAcademicProgramInput } from '../utils/academic-program'

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function createAcademicProgram(event: H3Event) {
  const sessionUser = getSessionUser(event)

  if (!sessionUser?.emailAddress) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const employee = await UserModel.findOne({
    emailAddress: sessionUser.emailAddress,
    isAdmin: true
  })

  if (!employee) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Admin access required.'
    })
  }

  const body = await readBody(event)
  const payload = validateAcademicProgramInput(body)

  const existingProgram = await AcademicProgramModel.findOne({
    $or: [
      { programCode: { $regex: new RegExp(`^${escapeRegex(payload.programCode)}$`, 'i') } },
      { programName: { $regex: new RegExp(`^${escapeRegex(payload.programName)}$`, 'i') } }
    ]
  })

  if (existingProgram) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An academic program already exists with those details.'
    })
  }

  try {
    const academicProgram = await AcademicProgramModel.create({
      programCode: payload.programCode.toUpperCase(),
      programName: payload.programName,
      isActive: payload.isActive
    })

    return {
      message: 'Academic program created successfully.',
      data: academicProgram
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    if (error instanceof Error && 'code' in error && error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'An academic program already exists with those details.'
      })
    }

    throw error
  }
}

export default defineEventHandler(createAcademicProgram)
