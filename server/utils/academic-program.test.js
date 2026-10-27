import { describe, it, expect } from 'vitest'

import { validateAcademicProgramInput } from './academic-program.js'

describe('validateAcademicProgramInput', () => {
  it('accepts valid payloads with spaces inside the program name and trims edges', () => {
    const payload = {
      programCode: 'BSCS',
      programName: '  Bachelor of Science in Computer Science  ',
      isActive: false
    }

    expect(validateAcademicProgramInput(payload)).toEqual({
      programCode: 'BSCS',
      programName: 'Bachelor of Science in Computer Science',
      isActive: false
    })
  })

  it('rejects invalid format and missing required fields', () => {
    expect(() => validateAcademicProgramInput({ programCode: 'BS CS', programName: 'Bachelor of Science' })).toThrow(
      'programCode must contain only alphanumeric characters with no spaces or special characters.'
    )

    expect(() => validateAcademicProgramInput({ programCode: 'BSCS', programName: 'Comp@Science' })).toThrow(
      'programName must contain only alphanumeric characters and spaces, with no special characters.'
    )

    expect(() => validateAcademicProgramInput({ programName: 'Bachelor of Science' })).toThrow(
      'programCode is required.'
    )
  })
})
