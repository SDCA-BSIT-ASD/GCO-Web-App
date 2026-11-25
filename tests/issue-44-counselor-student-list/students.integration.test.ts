import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, createRouter, toNodeListener } from 'h3'

// ---------------------------------------------------------------------------
// Integration test for GET /api/students
//
// Real:  HTTP server, route wiring, cookie parsing, session signature check,
//        counselor-auth, and the students.get handler.
// Fake:  only the Mongoose models (an in-memory "database"), so this test never
//        touches the real MongoDB Atlas data.
// ---------------------------------------------------------------------------

type FakeStudent = Record<string, unknown>
type FakeEmployee = { emailAddress: string; type: string }

// The fake database. Each test fills these arrays to set up its own data.
const db = vi.hoisted(() => ({
  students: [] as FakeStudent[],
  employees: [] as FakeEmployee[]
}))

vi.mock('../../server/models/Student', () => ({
  StudentModel: {
    find: () => ({
      select: () => ({
        lean: async () => db.students.map((student) => ({ ...student }))
      })
    })
  }
}))

vi.mock('../../server/models/Employee', () => ({
  EmployeeModel: {
    // Honors the same filter the real code uses, so a non-counselor
    // employee really is rejected by the query, not by the test.
    findOne: async (filter: FakeEmployee) =>
      db.employees.find(
        (employee) =>
          employee.emailAddress === filter.emailAddress && employee.type === filter.type
      ) ?? null
  }
}))

import studentsHandler from '../../server/api/students.get'
import { SESSION_COOKIE, encodeSessionValue } from '../../server/utils/auth.js'

// ---------------------------------------------------------------------------
// Test server
// ---------------------------------------------------------------------------
let server: Server
let baseUrl: string

beforeAll(async () => {
  const app = createApp()
  const router = createRouter()
  router.get('/api/students', studentsHandler)
  app.use(router)

  server = createServer(toNodeListener(app))
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

  const { port } = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

beforeEach(() => {
  db.students = []
  db.employees = []
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const COUNSELOR_EMAIL = 'counselor@sdca.edu.ph'

function sessionCookieFor(emailAddress: string) {
  const value = encodeSessionValue({ emailAddress, firstName: 'Test', lastName: 'User' })
  return `${SESSION_COOKIE}=${value}`
}

function getStudents(cookie?: string) {
  return fetch(`${baseUrl}/api/students`, {
    headers: cookie ? { cookie } : {}
  })
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('GET /api/students (integration)', () => {
  describe('as an authenticated counselor', () => {
    beforeEach(() => {
      db.employees = [{ emailAddress: COUNSELOR_EMAIL, type: 'Counselor' }]
    })

    it('returns 200 and student records with the correct data shape', async () => {
      db.students = [
        {
          _id: 'a1',
          studentNumber: '2023-00001',
          firstName: 'Maria',
          lastName: 'Santos',
          emailAddress: 'maria.santos@sdca.edu.ph',
          programName: 'BS Medical Technology',
          yearLevel: 3,
          status: 'Regular',
          googleId: 'private-value'
        },
        {
          _id: 'b2',
          studentNumber: '2024-00042',
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          emailAddress: 'juan.delacruz@sdca.edu.ph',
          programName: 'BS Information Technology',
          yearLevel: 2,
          status: 'Irregular'
        }
      ]

      const response = await getStudents(sessionCookieFor(COUNSELOR_EMAIL))
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(2)

      for (const student of body.data) {
        expect(Object.keys(student).sort()).toEqual(EXPECTED_KEYS)
      }

      expect(body.data[0]).toEqual({
        studentNumber: '2023-00001',
        firstName: 'Maria',
        lastName: 'Santos',
        emailAddress: 'maria.santos@sdca.edu.ph',
        programName: 'BS Medical Technology',
        yearLevel: 3,
        status: 'Regular'
      })
    })

    it('returns 200 and an empty list when there are no student records', async () => {
      const response = await getStudents(sessionCookieFor(COUNSELOR_EMAIL))

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ success: true, data: [] })
    })
  })

  describe('when the request is not allowed', () => {
    beforeEach(() => {
      db.employees = [
        { emailAddress: COUNSELOR_EMAIL, type: 'Counselor' },
        { emailAddress: 'staff@sdca.edu.ph', type: 'Faculty' }
      ]
      db.students = [
        {
          studentNumber: '2023-00001',
          firstName: 'Maria',
          lastName: 'Santos',
          emailAddress: 'maria.santos@sdca.edu.ph',
          programName: 'BS Medical Technology',
          yearLevel: 3,
          status: 'Regular'
        }
      ]
    })

    it('rejects a request without authentication (401) and returns no student data', async () => {
      const response = await getStudents()
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body).toEqual({ success: false, message: 'Authentication required.' })
      expect(body).not.toHaveProperty('data')
    })

    it('rejects a session cookie with a tampered signature (401)', async () => {
      const forged = `${sessionCookieFor(COUNSELOR_EMAIL).slice(0, -4)}0000`

      const response = await getStudents(forged)

      expect(response.status).toBe(401)
      expect(await response.json()).not.toHaveProperty('data')
    })

    it('rejects a signed-in user who is not an employee, e.g. a student (403)', async () => {
      const response = await getStudents(sessionCookieFor('maria.santos@sdca.edu.ph'))
      const body = await response.json()

      expect(response.status).toBe(403)
      expect(body).toEqual({ success: false, message: 'Counselor access required.' })
      expect(body).not.toHaveProperty('data')
    })

    it('rejects an employee whose type is not Counselor (403)', async () => {
      const response = await getStudents(sessionCookieFor('staff@sdca.edu.ph'))

      expect(response.status).toBe(403)
      expect(await response.json()).not.toHaveProperty('data')
    })
  })
})
