import { describe, it, expect } from 'vitest'
import { formatStudentProfile } from './view-student.js'

describe('formatStudentProfile', () => {
  it('formats raw database record into the agreed API contract', () => {
    const rawStudent = {
      id: 1,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      emailAddress: 'juan.delacruz@sdca.edu.ph',
      studentNumber: '202400123',
      programName: 'Bachelor of Science in Information Technology',
      yearLevel: 2,
      status: 'Regular',
    }

    expect(formatStudentProfile(rawStudent)).toEqual({
      id: '1',
      studentNumber: '202400123',
      fullName: 'Juan Dela Cruz',
      emailAddress: 'juan.delacruz@sdca.edu.ph',
      programName: 'Bachelor of Science in Information Technology',
      yearLevel: 2,
      status: 'Regular'
    })
  })

  it('rejects empty or null payloads', () => {
    expect(() => formatStudentProfile(null)).toThrow('Student data is required.')
    expect(() => formatStudentProfile(undefined)).toThrow('Student data is required.')
  })
})