export const PROGRAM_CODE_PATTERN = /^[A-Za-z0-9]+$/
export const PROGRAM_NAME_PATTERN = /^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/

export function validateAcademicProgramInput(payload) {
  console.log(payload)
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Academic program payload is required.')
  }

  const programCode = typeof payload.programCode === 'string' ? payload.programCode.trim() : ''
  const programName = typeof payload.programName === 'string' ? payload.programName.trim() : ''

  if (!programCode) {
    throw new Error('programCode is required.')
  }

  if (!programName) {
    throw new Error('programName is required.')
  }

  if (!PROGRAM_CODE_PATTERN.test(programCode)) {
    throw new Error('programCode must contain only alphanumeric characters with no spaces or special characters.')
  }

  if (!PROGRAM_NAME_PATTERN.test(programName)) {
    throw new Error('programName must contain only alphanumeric characters and spaces, with no special characters.')
  }

  return {
    programCode,
    programName,
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true
  }
}
