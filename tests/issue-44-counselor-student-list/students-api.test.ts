import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setResponseStatus } from 'h3'
import { StudentModel } from '../../server/models/Student'
import { getCounselorAccessError } from '../../server/utils/counselor-auth'
import studentsHandler from '../../server/api/students.get'

vi.mock('h3', () => ({
  defineEventHandler: (handler: unknown) => handler,
  setResponseStatus: vi.fn()
}))

vi.mock('../../server/models/Student', () => ({
  StudentModel: {
    find: vi.fn()
  }
}))

vi.mock('../../server/utils/counselor-auth', () => ({
  getCounselorAccessError: vi.fn()
}))

const mockedStudentModel = vi.mocked(StudentModel)
const mockedGetCounselorAccessError = vi.mocked(getCounselorAccessError)

function mockStudentQuery(students: unknown[]) {
  const lean = vi.fn().mockResolvedValue(students)
  const select = vi.fn().mockReturnValue({ lean })

  mockedStudentModel.find.mockReturnValue({ select } as never)

  return { lean, select }
}

describe('GET /api/students', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the agreed student fields for an authorized counselor', async () => {
    mockedGetCounselorAccessError.mockResolvedValue(null)
    const query = mockStudentQuery([
      {
        _id: 'student-id',
        studentNumber: '202600123',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        emailAddress: 'juan.delacruz@sdca.edu.ph',
        programName: 'Bachelor of Science in Information Technology',
        yearLevel: 3,
        status: 'Regular',
        googleId: 'private-value'
      }
    ])

    await expect(studentsHandler({} as never)).resolves.toEqual({
      success: true,
      data: [
        {
          studentNumber: '202600123',
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          emailAddress: 'juan.delacruz@sdca.edu.ph',
          programName: 'Bachelor of Science in Information Technology',
          yearLevel: 3,
          status: 'Regular'
        }
      ]
    })
    expect(query.select).toHaveBeenCalledWith(
      'studentNumber firstName lastName emailAddress programName yearLevel status'
    )
    expect(query.lean).toHaveBeenCalledOnce()
  })

  it('returns an empty data array when no students exist', async () => {
    mockedGetCounselorAccessError.mockResolvedValue(null)
    mockStudentQuery([])

    await expect(studentsHandler({} as never)).resolves.toEqual({
      success: true,
      data: []
    })
  })

  it('returns 401 when authentication is required', async () => {
    mockedGetCounselorAccessError.mockResolvedValue({
      statusCode: 401,
      message: 'Authentication required.'
    })

    await expect(studentsHandler({} as never)).resolves.toEqual({
      success: false,
      message: 'Authentication required.'
    })
    expect(setResponseStatus).toHaveBeenCalledWith({}, 401)
    expect(mockedStudentModel.find).not.toHaveBeenCalled()
  })

  it('returns 403 when counselor access is required', async () => {
    mockedGetCounselorAccessError.mockResolvedValue({
      statusCode: 403,
      message: 'Counselor access required.'
    })

    await expect(studentsHandler({} as never)).resolves.toEqual({
      success: false,
      message: 'Counselor access required.'
    })
    expect(setResponseStatus).toHaveBeenCalledWith({}, 403)
    expect(mockedStudentModel.find).not.toHaveBeenCalled()
  })
})
