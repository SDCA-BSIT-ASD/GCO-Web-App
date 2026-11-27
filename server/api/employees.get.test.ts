
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  findAdmin: vi.fn(),
  findEmployees: vi.fn()
}))

vi.mock('../models/Employee', () => ({
  EmployeeModel: {
    findOne: mocks.findAdmin,
    find: mocks.findEmployees
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

  it('returns the employee list with required fields for admins', async () => {
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

    expect(event.node.res.statusCode).toBe(200)
    expect(mocks.findEmployees).toHaveBeenCalledWith({})
  })

  it('returns an empty list when no employee records exist', async () => {
    mocks.findEmployees.mockReturnValue({
      select: () => ({
        lean: () => Promise.resolve([])
      })
    })

    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: true,
      message: 'Employee Records Are Currently Empty',
      data: []
    })

    expect(event.node.res.statusCode).toBe(200)
  })

  it('returns 401 when the user is not logged in', async () => {
    mocks.getSessionUser.mockReturnValue(null)
    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: false,
      message: 'Authentication required. Please log in.'
    })

    expect(event.node.res.statusCode).toBe(401)
    expect(mocks.findAdmin).not.toHaveBeenCalled()
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

  it('returns 500 when employee retrieval fails', async () => {
    mocks.findAdmin.mockRejectedValue(new Error('database unavailable'))
    const event = createEvent()

    await expect(getEmployees(event)).resolves.toEqual({
      success: false,
      message: 'Failed To Retrieve Employees Data.'
    })

    expect(event.node.res.statusCode).toBe(500)
  })
})
