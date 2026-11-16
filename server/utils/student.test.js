// backend mock unit tests for student input validation and duplicate email/student number

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { StudentModel } from '../models/Student'

// file .student and functions imported are assumed values at this point (mock)
import { validateStudentInput, assertStudentIsUnique } from './student'

vi.mock('../models/Student', () => ({
  StudentModel: { findOne: vi.fn() }
}))

const findOne = vi.mocked(StudentModel.findOne)

// example of a valid payload
const valid = {
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  emailAddress: 'juan.delacruz@sdca.edu.ph',
  studentNumber: 202400123,
  programName: 'Bachelor of Science in Information Technology',
  yearLevel: 2,
  status: 'Regular'
}

describe('validateStudentInput', () => {
  it('accepts a valid payload and trims edges', () => {
    expect(validateStudentInput({ ...valid, firstName: '  Juan  ' })).toEqual(valid)
  })

  it.each([
    'firstName', 'lastName', 'emailAddress', 'studentNumber',
    'programName', 'yearLevel', 'status'
  ])('rejects a payload missing %s', (field) => {
    const payload = { ...valid }
    delete payload[field]

    expect(() => validateStudentInput(payload)).toThrow(
      'First name, last name, email, student number, program, year level, and status are required.'
    )
  })

  it.each([
    'juan@gmail.com',
    'juan@sdca.edu.ph.fake.com',
    'juan@sdca.edu',
    'not-an-email'
  ])('rejects the non-SDCA email %s', (emailAddress) => {
    expect(() => validateStudentInput({ ...valid, emailAddress })).toThrow(
      'Email must be an @sdca.edu.ph address.'
    )
  })

  it.each(['abc', 2024.5, -1, NaN])('rejects the invalid student number %s', (studentNumber) => {
    expect(() => validateStudentInput({ ...valid, studentNumber })).toThrow()
  })

  it('rejects a status other than Regular or Irregular', () => {
    expect(() => validateStudentInput({ ...valid, status: 'Pending' })).toThrow(
      'Status must be either Regular or Irregular.'
    )
  })

  it.each(['Regular', 'Irregular'])('accepts the status %s', (status) => {
    expect(validateStudentInput({ ...valid, status }).status).toBe(status)
  })

  it('rejects an abbreviated or unknown program', () => {
    expect(() => validateStudentInput({ ...valid, programName: 'BSIT' })).toThrow('Invalid program.')
  })

  it('rejects a non-numeric year level', () => {
    expect(() => validateStudentInput({ ...valid, yearLevel: 'two' })).toThrow(
      'Year level must be a valid number.'
    )
  })

  it.each([0, 6, -1, 2.5])('rejects the out-of-range year level %s', (yearLevel) => {
    expect(() => validateStudentInput({ ...valid, yearLevel })).toThrow(
      'Year level must be a valid number.'
    )
  })

  it.each([1, 5])('accepts the boundary year level %s', (yearLevel) => {
    expect(validateStudentInput({ ...valid, yearLevel }).yearLevel).toBe(yearLevel)
  })
})

describe('assertStudentIsUnique', () => {
  beforeEach(() => {
    findOne.mockReset()
  })

  it('passes when no existing student matches', async () => {
    findOne.mockResolvedValue(null)

    await expect(
      assertStudentIsUnique('new@sdca.edu.ph', 202499999)
    ).resolves.not.toThrow()
  })

  it('rejects with 409 when the email already exists', async () => {
    findOne.mockResolvedValueOnce({ _id: '1' })

    await expect(
      assertStudentIsUnique('juan.delacruz@sdca.edu.ph', 202499999)
    ).rejects.toMatchObject({ statusCode: 409, message: 'Email is already in use.' })
  })

  it('rejects with 409 when the student number already exists', async () => {
    findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: '1' })

    await expect(
      assertStudentIsUnique('new@sdca.edu.ph', 202400123)
    ).rejects.toMatchObject({ statusCode: 409, message: 'Student number is already in use.' })
  })
})