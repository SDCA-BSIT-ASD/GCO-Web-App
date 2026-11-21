import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface EmployeeRecord {
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  employeeType: string
}

interface EmployeeListResponse {
  success: boolean
  message: string
  data: EmployeeRecord[]
}

const baseUrl = process.env.EMPLOYEE_API_BASE_URL
const adminCookie = process.env.EMPLOYEE_API_ADMIN_COOKIE
const nonAdminCookie = process.env.EMPLOYEE_API_NON_ADMIN_COOKIE
const dataset = process.env.EMPLOYEE_API_DATASET

if (!baseUrl || !adminCookie || !nonAdminCookie || (dataset !== 'populated' && dataset !== 'empty')) {
  throw new Error(
    'Set EMPLOYEE_API_BASE_URL, EMPLOYEE_API_ADMIN_COOKIE, EMPLOYEE_API_NON_ADMIN_COOKIE, and ' +
      'EMPLOYEE_API_DATASET (populated or empty) before running employee API tests.'
  )
}

const fixtureEmployees: EmployeeRecord[] = JSON.parse(
  readFileSync(new URL('./fixtures/employees.json', import.meta.url), 'utf8')
)
const expectedEmployeeKeys = ['email', 'employeeNumber', 'employeeType', 'firstName', 'lastName']

async function getEmployees(cookie?: string) {
  const headers = cookie ? { Cookie: cookie } : undefined
  const response = await fetch(new URL('/api/employees', baseUrl), { headers })

  return {
    status: response.status,
    body: await response.json()
  }
}

describe('GET /api/employees', () => {
  it.skipIf(dataset !== 'populated')('returns employee records with the contract fields', async () => {
    const response = await getEmployees(adminCookie)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Employee data retrieved successfully')
    expect(response.body.data).toContainEqual(fixtureEmployees[0])

    for (const employee of response.body.data as EmployeeRecord[]) {
      expect(Object.keys(employee).sort()).toEqual(expectedEmployeeKeys)
    }
  })

  it.skipIf(dataset !== 'empty')('returns an empty list when there are no employees', async () => {
    const response = await getEmployees(adminCookie)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      message: 'Employee Records Are Currently Empty',
      data: []
    })
  })

  it('rejects a request without a session', async () => {
    const response = await getEmployees()

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      success: false,
      message: 'Authentication required. Please log in.'
    })
  })

  it('rejects a non-admin session', async () => {
    const response = await getEmployees(nonAdminCookie)

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      message: 'Only admins are authorized to view the employee list.'
    })
  })
})
