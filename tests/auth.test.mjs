import test from 'node:test'
import assert from 'node:assert/strict'

import { isAllowedEmail, normalizeAllowedDomains, encodeSessionValue, decodeSessionValue } from '../server/utils/auth.js'

test('normalizeAllowedDomains trims and lowercases configured domains', () => {
  assert.deepEqual(normalizeAllowedDomains('School.edu.ph, admin.school.edu.ph , example.com'), [
    'school.edu.ph',
    'admin.school.edu.ph',
    'example.com'
  ])
})

test('isAllowedEmail allows exact or subdomain matches', () => {
  assert.equal(isAllowedEmail('student@school.edu.ph', 'school.edu.ph'), true)
  assert.equal(isAllowedEmail('student@sub.school.edu.ph', 'school.edu.ph'), true)
  assert.equal(isAllowedEmail('student@gmail.com', 'school.edu.ph'), false)
})

test('session payloads can be encoded and decoded', () => {
  const payload = { emailAddress: 'student@school.edu.ph', firstName: 'Ada', lastName: 'Lovelace' }
  const encoded = encodeSessionValue(payload)
  assert.equal(typeof encoded, 'string')
  assert.deepEqual(decodeSessionValue(encoded), payload)
})
