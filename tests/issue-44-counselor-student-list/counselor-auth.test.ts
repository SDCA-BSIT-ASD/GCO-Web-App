import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

const { getSessionUser, findOne } = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  findOne: vi.fn()
}))

vi.mock('../../server/utils/auth', () => ({ getSessionUser }))
vi.mock('../../server/models/Employee', () => ({
  EmployeeModel: { findOne }
}))

import { getCounselorAccessError } from '../../server/utils/counselor-auth'

const event = {} as H3Event

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getCounselorAccessError', () => {
  describe('unauthenticated requests -> 401', () => {
    it('returns 401 when there is no session user', async () => {
      getSessionUser.mockReturnValue(null)

      const error = await getCounselorAccessError(event)

      expect(error).toEqual({ statusCode: 401, message: 'Authentication required.' })
      expect(findOne).not.toHaveBeenCalled()
    })

    it('returns 401 when the session user has no emailAddress', async () => {
      getSessionUser.mockReturnValue({ firstName: 'No', lastName: 'Email' })

      const error = await getCounselorAccessError(event)

      expect(error?.statusCode).toBe(401)
      expect(findOne).not.toHaveBeenCalled()
    })

    it('returns 401 when the emailAddress is an empty string', async () => {
      getSessionUser.mockReturnValue({ emailAddress: '' })

      const error = await getCounselorAccessError(event)

      expect(error?.statusCode).toBe(401)
    })

    it('returns 401 when the emailAddress is not a string', async () => {
      getSessionUser.mockReturnValue({ emailAddress: 12345 })

      const error = await getCounselorAccessError(event)

      expect(error?.statusCode).toBe(401)
    })
  })

  describe('authenticated but not a counselor -> 403', () => {
    it('returns 403 for a signed-in user with no matching counselor record (e.g. a student)', async () => {
      getSessionUser.mockReturnValue({ emailAddress: 'student@sdca.edu.ph' })
      findOne.mockResolvedValue(null)

      const error = await getCounselorAccessError(event)

      expect(error).toEqual({ statusCode: 403, message: 'Counselor access required.' })
    })

    it('only looks for Employees of type "Counselor" matching the session email', async () => {
      getSessionUser.mockReturnValue({ emailAddress: 'someone@sdca.edu.ph' })
      findOne.mockResolvedValue(null)

      await getCounselorAccessError(event)

      // A non-counselor employee (e.g. another employee type) is filtered out by this query
      expect(findOne).toHaveBeenCalledWith({
        emailAddress: 'someone@sdca.edu.ph',
        type: 'Counselor'
      })
    })
  })

  describe('authorized counselor', () => {
    it('returns null when a matching counselor record exists', async () => {
      getSessionUser.mockReturnValue({ emailAddress: 'counselor@sdca.edu.ph' })
      findOne.mockResolvedValue({ emailAddress: 'counselor@sdca.edu.ph', type: 'Counselor' })

      const error = await getCounselorAccessError(event)

      expect(error).toBeNull()
    })
  })
})
