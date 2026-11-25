<template>
  <main class="space-y-4">
    <h2>Students</h2>
    <p v-if="isPreviewMode" role="note">
      Preview mode: sample data only; the students API is not being called.
    </p>

    <p v-if="pending" role="status">Loading student records...</p>
    <p v-else-if="hasError" role="alert">{{ errorMessage }}</p>
    <div v-else class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Student Number</th>
            <th>Full Name</th>
            <th>Email Address</th>
            <th>Program</th>
            <th>Year Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="students.length === 0">
            <td colspan="6">No student records found.</td>
          </tr>
          <tr v-for="student in students" :key="student.studentNumber">
            <td>{{ student.studentNumber }}</td>
            <td>{{ student.firstName }} {{ student.lastName }}</td>
            <td>{{ student.emailAddress }}</td>
            <td>{{ student.programName }}</td>
            <td>{{ student.yearLevel }}</td>
            <td>{{ student.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { StudentListResponse } from '#shared/types/StudentList'

  const isPreviewMode = import.meta.env.DEV && useRoute().query.preview === 'students'
  const previewResponse: StudentListResponse = {
    success: true,
    data: [
      {
        studentNumber: '202600901',
        firstName: 'Avery',
        lastName: 'Santos',
        emailAddress: 'avery.santos@example.test',
        programName: 'Bachelor of Science in Information Technology',
        yearLevel: 2,
        status: 'Regular'
      }
    ]
  }

  const { data: apiResponse, pending, error } = useFetch<StudentListResponse>('/api/students', {
    server: false,
    immediate: !isPreviewMode
  })

  const response = computed(() => isPreviewMode ? previewResponse : apiResponse.value)
  const students = computed(() => response.value?.success ? response.value.data : [])
  const hasError = computed(() => Boolean(error.value) || response.value?.success === false || (!pending.value && !response.value))

  const errorMessage = computed(() => {
    if (response.value?.success === false && response.value.message) {
      return response.value.message
    }

    if (error.value && typeof error.value === 'object' && 'data' in error.value) {
      const errorData = error.value.data

      if (
        errorData
        && typeof errorData === 'object'
        && 'message' in errorData
        && typeof errorData.message === 'string'
      ) {
        return errorData.message
      }
    }

    return 'Unable to load student records. Please try again.'
  })
</script>
