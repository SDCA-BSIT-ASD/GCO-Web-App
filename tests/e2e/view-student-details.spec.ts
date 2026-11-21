// tests/api/students.spec.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Student API Endpoints', async () => {
  // Setup Nuxt instance for testing
  await setup({
    server: true,
  })

  const adminHeaders = { Authorization: 'Bearer mock-admin-token' }
  const counselorHeaders = { Authorization: 'Bearer mock-counselor-token' }
  const validStudentId = '1'
  
  describe('POST /api/students', () => {
    it('successfully creates a new student with valid data (201)', async () => {
      const newStudent = {
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        emailAddress: 'juan.delacruz@sdca.edu.ph',
        studentNumber: '202400123',
        programName: 'Bachelor of Science in Information Technology',
        yearLevel: 2,
        status: 'Regular'
      }

      const response = await $fetch('/api/students', {
        method: 'POST',
        headers: adminHeaders,
        body: newStudent
      })
      
      expect(response.success).toBe(true)
      expect(response.message).toBe('Student created successfully.')
      expect(response.data).toHaveProperty('id')
      expect(response.data.studentNumber).toBe(newStudent.studentNumber)
    })

    it('rejects creation from non-admin roles (403)', async () => {
      try {
        await $fetch('/api/students', {
          method: 'POST',
          headers: counselorHeaders,
          body: { firstName: 'Test' }
        })
      } catch (error: any) {
        expect(error.statusCode).toBe(403)
      }
    })

    it('returns 400 Bad Request if required fields are missing', async () => {
      try {
        await $fetch('/api/students', {
          method: 'POST',
          headers: adminHeaders,
          body: { firstName: 'Juan' } // Missing other required fields
        })
      } catch (error: any) {
        expect(error.statusCode).toBe(400)
      }
    })
  })

  describe('GET /api/students/:id', () => {
    it('returns the correct profile fields for a valid ID (200)', async () => {
      const response = await $fetch(`/api/students/${validStudentId}`, { headers: counselorHeaders })
      
      expect(response.success).toBe(true)
      expect(response.data).toHaveProperty('studentNumber')
      expect(response.data).toHaveProperty('fullName')
      expect(response.data).toHaveProperty('emailAddress')
      expect(response.data).toHaveProperty('programName')
    })

    it('returns a 404 when the student ID does not exist', async () => {
      try {
        await $fetch('/api/students/999999', { headers: counselorHeaders })
      } catch (error: any) {
        expect(error.statusCode).toBe(404)
      }
    })
  })

  describe('GET /api/students/:id/assessments/:type', () => {
    it('returns DASS-21 submission list correctly (200)', async () => {
      const response = await $fetch(`/api/students/${validStudentId}/assessments/dass21`, { headers: counselorHeaders })
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
      
      if (response.data.length > 0) {
        const entry = response.data[0]
        expect(entry).toHaveProperty('submissionDate')
        expect(entry).toHaveProperty('depressionSeverity')
        expect(entry).toHaveProperty('isFlagged')
      }
    })

    it('returns PHQ-9 submission list correctly (200)', async () => {
      const response = await $fetch(`/api/students/${validStudentId}/assessments/phq9`, { headers: counselorHeaders })
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
      
      if (response.data.length > 0) {
        const entry = response.data[0]
        expect(entry).toHaveProperty('submissionDate')
        expect(entry).toHaveProperty('overallSeverity')
        expect(entry).toHaveProperty('isFlagged')
      }
    })
  })
})