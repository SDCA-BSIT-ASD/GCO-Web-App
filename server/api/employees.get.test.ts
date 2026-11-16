import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  findAdmin: vi.fn(),
  findEmployees: vi.fn()
}))

vi.mock('../models/Employee', () => ({
  EmployeeModel: {
    find: mocks.findEmployees
  }
}))

vi.mock('../models/User', () => ({
  UserModel: {
    findOne: mocks.findAdmin
  }
}))

vi.mock('../utils/auth', () => ({
  getSessionUser: mocks.getSessionUser
}))

import getEmployees from './employees.get'

function createEvent() {
  return {
    node: {
      res: {
        statusCode: 200
      }
    }
  } as Parameters<typeof getEmployees>[0]
}

describe('GET /api/employees', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSessionUser.mockReturnValue({ emailAddress: 'admin@example.com' })
    mocks.findAdmin.mockResolvedValue({ emailAddress: 'admin@example.com' })
    mocks.findEmployees.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([{
          employeeNumber: 'EMP-001',
          firstName: 'John',
          lastName: 'Doe',
          emailAddress: 'johndoe@example.com',
          type: 'Regular'
        }])
      })
    })
  })

  it('returns the agreed employee response for admins', async () => {
    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: true,
      message: 'Employee data retrieved successfully',
      data: [{
        employeeNumber: 'EMP-001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        employeeType: 'Regular'
      }]
    })
  })

  it('returns the empty-record response when no employees exist', async () => {
    mocks.findEmployees.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([])
      })
    })

    await expect(getEmployees(createEvent())).resolves.toEqual({
      success: true,
      message: 'Employee Records Are Currently Empty',
      data: []
    })
  })

  it('returns 401 when the user is not logged in', async () => {
    mocks.getSessionUser.mockReturnValue(null)
    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: false,
      message: 'Authentication required. Please log in.'
    })
    expect(event.node.res.statusCode).toBe(401)
  })

  it('returns 403 when the logged-in user is not an admin', async () => {
    mocks.findAdmin.mockResolvedValue(null)
    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: false,
      message: 'Only admins are authorized to view the employee list.'
    })
    expect(event.node.res.statusCode).toBe(403)
    expect(mocks.findEmployees).not.toHaveBeenCalled()
  })

  it('returns the generic 500 response when retrieval fails', async () => {
    mocks.findAdmin.mockRejectedValue(new Error('database unavailable'))
    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: false,
      message: 'Failed To Retrieve Employees Data.'
    })
    expect(event.node.res.statusCode).toBe(500)
  })
})
