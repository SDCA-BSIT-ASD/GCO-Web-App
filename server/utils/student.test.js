import { describe, expect, it } from 'vitest'

import { validateStudentInput } from './student.js'

const validStudent = {
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  emailAddress: 'juan.delacruz@sdca.edu.ph',
  studentNumber: 202600123,
  programName: 'Bachelor of Science in Information Technology',
  yearLevel: 3,
  status: 'Regular'
}

  //validateStudentInput is a sample test file 
describe('validateStudentInput', () => {
  it('accepts a valid student payload and trims names', () => {
    expect(validateStudentInput({ ...validStudent, firstName: '  Juan  ' })).toEqual(validStudent)
  })

  //checks if the email address is valid and belongs to the @sdca.edu.ph domain
  it.each([
    'juan@gmail.com',
    'juan@sdca.edu.ph.fake.com',
    'juan@sdca.edu',
    'not-an-email'
  ])('rejects an email outside the @sdca.edu.ph domain: %s', (emailAddress) => {
    expect(() => validateStudentInput({ ...validStudent, emailAddress })).toThrow(
      'A valid email address belonging to the @sdca.edu.ph domain is required.'
    )
  })

  //checks if invalid year levels are rejected.
  it.each(['two', 0, 6, -1, 2.5])('rejects an invalid year level: %s', (yearLevel) => {
    expect(() => validateStudentInput({ ...validStudent, yearLevel })).toThrow(
      'Year level must be an integer between 1 and 5.'
    )
  })

  //checks if the status is either "Regular" or "Irregular"
  it.each(['Pending', 'Suspended', ''])('rejects a disallowed status: %s', (status) => {
    expect(() => validateStudentInput({ ...validStudent, status })).toThrow(
      'Status must be either "Regular" or "Irregular".'
    )
  })

  //checks if inclusive boundary values(1-5) are accepted
  it.each([1, 5])('accepts the year-level boundary %s', (yearLevel) => {
    expect(validateStudentInput({ ...validStudent, yearLevel }).yearLevel).toBe(yearLevel)
  })

  //checks if the status is either "Regular" or "Irregular"
  it.each(['Regular', 'Irregular'])('accepts the status %s', (status) => {
    expect(validateStudentInput({ ...validStudent, status }).status).toBe(status)
  })
})