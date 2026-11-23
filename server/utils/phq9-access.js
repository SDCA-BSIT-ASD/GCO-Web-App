// Returns null if allowed, or { status, message } if not allowed.
export function getPhq9AccessError(sessionUser, employee) {
  if (!sessionUser?.emailAddress) {
    return { status: 401, message: 'You must be logged in.' }
  }

  if (!employee || String(employee.type).toLowerCase() !== 'counselor') {
    return { status: 403, message: 'Only counselors can view PHQ-9 entries.' }
  }

  return null
}