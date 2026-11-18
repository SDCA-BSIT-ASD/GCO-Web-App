<script setup lang="ts">
import { reactive } from 'vue'

type StudentField =
  | 'firstName'
  | 'lastName'
  | 'emailAddress'
  | 'studentNumber'
  | 'programName'
  | 'yearLevel'
  | 'status'

const form = reactive({
  firstName: '',
  lastName: '',
  emailAddress: '',
  studentNumber: '',
  programName: '',
  yearLevel: '',
  status: '',
})

const errors = reactive<Record<StudentField, string>>({
  firstName: '',
  lastName: '',
  emailAddress: '',
  studentNumber: '',
  programName: '',
  yearLevel: '',
  status: '',
})

const validateField = (field: StudentField) => {
  const value = form[field].trim()

  if (!value) {
    errors[field] = 'This field is required.'
    return false
  }

  if (field === 'emailAddress') {
    const emailPattern = /^[^\s@]+@sdca\.edu\.ph$/i

    if (!emailPattern.test(value)) {
      errors[field] = 'Please enter a valid @sdca.edu.ph email address.'
      return false
    }
  }

  if (field === 'yearLevel' && !['1', '2', '3', '4'].includes(value)) {
    errors[field] = 'Please select a valid year level.'
    return false
  }

  if (field === 'status' && !['Regular', 'Irregular'].includes(value)) {
    errors[field] = 'Please select a valid student status.'
    return false
  }

  errors[field] = ''
  return true
}

const validateForm = () => {
  const fields = Object.keys(form) as StudentField[]
  const results = fields.map(validateField)

  return results.every(Boolean)
}

const handleSubmit = () => {
  if (!validateForm()) return
}
</script>

<template>
  <div class="flex justify-center px-4 py-10">
    <div class="card w-full max-w-2xl border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="card-title text-2xl">Add New Student</h2>
          <p class="text-sm text-base-content/60">
            Fill in the required student information below.
          </p>
        </div>

        <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="first-name">
                <span class="label-text font-medium">First Name</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                id="first-name"
                v-model="form.firstName"
                type="text"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.firstName }"
                placeholder="Enter first name"
                :aria-invalid="!!errors.firstName"
                @blur="validateField('firstName')"
              />
              <p v-if="errors.firstName" class="mt-1 text-sm text-error">
                {{ errors.firstName }}
              </p>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="last-name">
                <span class="label-text font-medium">Last Name</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                id="last-name"
                v-model="form.lastName"
                type="text"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.lastName }"
                placeholder="Enter last name"
                :aria-invalid="!!errors.lastName"
                @blur="validateField('lastName')"
              />
              <p v-if="errors.lastName" class="mt-1 text-sm text-error">
                {{ errors.lastName }}
              </p>
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="email-address">
              <span class="label-text font-medium">Email Address</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input
              id="email-address"
              v-model="form.emailAddress"
              type="email"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.emailAddress }"
              placeholder="student@sdca.edu.ph"
              :aria-invalid="!!errors.emailAddress"
              @blur="validateField('emailAddress')"
            />
            <p v-if="errors.emailAddress" class="mt-1 text-sm text-error">
              {{ errors.emailAddress }}
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="student-number">
              <span class="label-text font-medium">Student Number</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input
              id="student-number"
              v-model="form.studentNumber"
              type="text"
              class="input input-bordered w-full"
              :class="{ 'input-error': errors.studentNumber }"
              placeholder="Enter student number"
              :aria-invalid="!!errors.studentNumber"
              @blur="validateField('studentNumber')"
            />
            <p v-if="errors.studentNumber" class="mt-1 text-sm text-error">
              {{ errors.studentNumber }}
            </p>
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="program">
              <span class="label-text font-medium">Academic Program</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <select
              id="program"
              v-model="form.programName"
              class="select select-bordered w-full"
              :class="{ 'select-error': errors.programName }"
              :aria-invalid="!!errors.programName"
              @blur="validateField('programName')"
            >
              <option value="" disabled>Select academic program</option>
            </select>
            <p v-if="errors.programName" class="mt-1 text-sm text-error">
              {{ errors.programName }}
            </p>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="year-level">
                <span class="label-text font-medium">Year Level</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <select
                id="year-level"
                v-model="form.yearLevel"
                class="select select-bordered w-full"
                :class="{ 'select-error': errors.yearLevel }"
                :aria-invalid="!!errors.yearLevel"
                @blur="validateField('yearLevel')"
              >
                <option value="" disabled>Select year level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              <p v-if="errors.yearLevel" class="mt-1 text-sm text-error">
                {{ errors.yearLevel }}
              </p>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="status">
                <span class="label-text font-medium">Status</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <select
                id="status"
                v-model="form.status"
                class="select select-bordered w-full"
                :class="{ 'select-error': errors.status }"
                :aria-invalid="!!errors.status"
                @blur="validateField('status')"
              >
                <option value="" disabled>Select status</option>
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
              </select>
              <p v-if="errors.status" class="mt-1 text-sm text-error">
                {{ errors.status }}
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
             <button
              type="button"
              class="btn btn-outline btn-error hover:text-white"
              @click="navigateTo('/students')"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Add Student
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
