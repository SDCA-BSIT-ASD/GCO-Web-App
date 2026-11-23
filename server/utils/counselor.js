export const COUNSELOR_TYPE = 'counselor';

export function isCounselor(user) {
  return Boolean(user) && typeof user.type === 'string' && user.type.trim().toLowerCase() === COUNSELOR_TYPE;
}