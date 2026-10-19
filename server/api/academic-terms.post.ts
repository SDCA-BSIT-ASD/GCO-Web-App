import { createError, defineEventHandler, type H3Event, readBody } from 'h3'
import { AcademicTermModel } from '../models/AcademicTerm'

async function createAcademicTerm(event: H3Event) {
  const body = await readBody(event)

  if (
    !body
    || typeof body.title !== 'string'
    || typeof body.startDate !== 'string'
    || typeof body.endDate !== 'string'
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title, start date, and end date are required.'
    })
  }

  try {
    return await AcademicTermModel.create({
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate
    })
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
        statusMessage: 'An academic term with this title already exists.'
      })
    }

    throw error
  }
}

export default defineEventHandler(createAcademicTerm)
