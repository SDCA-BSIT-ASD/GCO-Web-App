import type { H3Event } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  findAdmin: vi.fn(),
  findStudents: vi.fn()
}))

vi.mock('../utils/auth', () => ({
  getSessionUser: mocks.getSessionUser
}))

vi.mock('../models/User', () => ({
  UserModel: {
    findOne: mocks.findAdmin
  }
}))

vi.mock('../models/Student', () => ({
  StudentModel: {
    find: mocks.findStudents
  }
}))

import getStudents from './students.get'

function createEvent() {
  const response = { statusCode: 200 }
  const event = { node: { res: response } } as H3Event
  return { event, response }
}

describe('GET /api/students', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSessionUser.mockReturnValue({ emailAddress: 'admin@school.edu.ph' })
    mocks.findAdmin.mockResolvedValue({ emailAddress: 'admin@school.edu.ph' })
    mocks.findStudents.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([])
    })
  })

  it('returns the agreed 401 response for unauthenticated requests', async () => {
    mocks.getSessionUser.mockReturnValue(null)
    const { event, response } = createEvent()

    await expect(getStudents(event)).resolves.toEqual({
      success: false,
      message: 'Please log in to access student records.'
    })
    expect(response.statusCode).toBe(401)
    expect(mocks.findAdmin).not.toHaveBeenCalled()
  })

  it('returns the agreed 403 response for non-admin users', async () => {
    mocks.findAdmin.mockResolvedValue(null)
    const { event, response } = createEvent()

    await expect(getStudents(event)).resolves.toEqual({
      success: false,
      message: 'Only admins can retrieve student records.'
    })
    expect(response.statusCode).toBe(403)
    expect(mocks.findStudents).not.toHaveBeenCalled()
  })

  it('returns student records with the agreed fields', async () => {
    mocks.findStudents.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{
        studentNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        programName: 'Bachelor of Science in Information Technology',
        yearLevel: 2,
        status: 'Active',
        _id: 'excluded'
      }])
    })
    const { event, response } = createEvent()

    await expect(getStudents(event)).resolves.toEqual({
      success: true,
      data: [{
        studentNumber: '2024-001',
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john@example.com',
        programName: 'Bachelor of Science in Information Technology',
        yearLevel: 2,
        status: 'Active'
      }]
    })
    expect(response.statusCode).toBe(200)
  })

  it('returns an empty data array when no students are found', async () => {
    const { event } = createEvent()

    await expect(getStudents(event)).resolves.toEqual({
      success: true,
      data: []
    })
  })

  it('returns the agreed 500 response when retrieval fails', async () => {
    mocks.findStudents.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockRejectedValue(new Error('database unavailable'))
    })
    const { event, response } = createEvent()

    await expect(getStudents(event)).resolves.toEqual({
      success: false,
      message: 'An unexpected error occurred while retrieving student records.'
    })
    expect(response.statusCode).toBe(500)
  })
})
