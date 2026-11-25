import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

// ---------------------------------------------------------------------------
// Mocks: isolate the handler from the real DB, the real session, and h3 status
// helpers so we only test the handler's own logic.
// ---------------------------------------------------------------------------
const { find, getCounselorAccessError, setResponseStatus } = vi.hoisted(() => ({
  find: vi.fn(),
  getCounselorAccessError: vi.fn(),
  setResponseStatus: vi.fn()
}))

vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal<typeof import('h3')>()
  return { ...actual, setResponseStatus }
})

vi.mock('../../server/models/Student', () => ({
  StudentModel: { find }
}))

vi.mock('../../server/utils/counselor-auth', () => ({
  getCounselorAccessError
}))

import handler from '../../server/api/students.get'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const event = {} as H3Event

// Mimics Mongoose's StudentModel.find().select(...).lean() chain.
function mockStudentQuery(docs: unknown[]) {
  const lean = vi.fn().mockResolvedValue(docs)
  const select = vi.fn().mockReturnValue({ lean })
  find.mockReturnValue({ select })
  return { select, lean }
}

const EXPECTED_KEYS = [
  'emailAddress',
  'firstName',
  'lastName',
  'programName',
  'status',
  'studentNumber',
  'yearLevel'
]

// Raw documents include extra fields (_id, __v, timestamps, googleId) that the
// endpoint must NOT leak to the client.
const rawStudents = [
  {
    _id: 'abc123',
    __v: 0,
    studentNumber: '2023-00001',
    firstName: 'Maria',
    lastName: 'Santos',
    emailAddress: 'maria.santos@sdca.edu.ph',
    programName: 'BS Medical Technology',
    yearLevel: 3,
    status: 'Active',
    googleId: 'g-111',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02')
  },
  {
    _id: 'def456',
    __v: 0,
    studentNumber: '2024-00042',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    emailAddress: 'juan.delacruz@sdca.edu.ph',
    programName: 'BS Information Technology',
    yearLevel: 2,
    status: 'Inactive'
  }
]

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /api/students handler', () => {
  describe('as an authorized counselor', () => {
    beforeEach(() => {
      getCounselorAccessError.mockResolvedValue(null)
    })

    it('returns student records with the correct object shape', async () => {
      mockStudentQuery(rawStudents)

      const result = await handler(event)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)

      for (const student of result.data!) {
        // exactly the 7 required fields: no more, no less
        expect(Object.keys(student).sort()).toEqual(EXPECTED_KEYS)
      }

      expect(result.data![0]).toEqual({
        studentNumber: '2023-00001',
        firstName: 'Maria',
        lastName: 'Santos',
        emailAddress: 'maria.santos@sdca.edu.ph',
        programName: 'BS Medical Technology',
        yearLevel: 3,
        status: 'Active'
      })
    })

    it('uses the correct field types', async () => {
      mockStudentQuery(rawStudents)

      const { data } = await handler(event)

      for (const student of data!) {
        expect(typeof student.studentNumber).toBe('string')
        expect(typeof student.firstName).toBe('string')
        expect(typeof student.lastName).toBe('string')
        expect(typeof student.emailAddress).toBe('string')
        expect(typeof student.programName).toBe('string')
        expect(typeof student.yearLevel).toBe('number')
        expect(typeof student.status).toBe('string')
      }
    })

    it('does not leak internal fields such as _id, __v, googleId or timestamps', async () => {
      mockStudentQuery(rawStudents)

      const { data } = await handler(event)

      for (const student of data!) {
        expect(student).not.toHaveProperty('_id')
        expect(student).not.toHaveProperty('__v')
        expect(student).not.toHaveProperty('googleId')
        expect(student).not.toHaveProperty('createdAt')
        expect(student).not.toHaveProperty('updatedAt')
      }
    })

    it('returns an empty list when no student records exist', async () => {
      mockStudentQuery([])

      const result = await handler(event)

      expect(result).toEqual({ success: true, data: [] })
    })

    it('does not set an error status code', async () => {
      mockStudentQuery(rawStudents)

      await handler(event)

      expect(setResponseStatus).not.toHaveBeenCalled()
    })
  })

  describe('when access is denied', () => {
    it('rejects unauthenticated requests with 401 and does not query students', async () => {
      getCounselorAccessError.mockResolvedValue({
        statusCode: 401,
        message: 'Authentication required.'
      })

      const result = await handler(event)

      expect(setResponseStatus).toHaveBeenCalledWith(event, 401)
      expect(result).toEqual({ success: false, message: 'Authentication required.' })
      expect(find).not.toHaveBeenCalled()
    })

    it('rejects non-counselor roles (e.g. students) with 403 and does not query students', async () => {
      getCounselorAccessError.mockResolvedValue({
        statusCode: 403,
        message: 'Counselor access required.'
      })

      const result = await handler(event)

      expect(setResponseStatus).toHaveBeenCalledWith(event, 403)
      expect(result).toEqual({ success: false, message: 'Counselor access required.' })
      expect(find).not.toHaveBeenCalled()
    })
  })
})
