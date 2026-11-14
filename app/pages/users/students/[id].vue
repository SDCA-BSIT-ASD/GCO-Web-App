<template>
  <div class="flex justify-center px-4 py-10">
    <div class="card w-full max-w-150 border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body p-6 sm:p-8">
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="card-title text-2xl">Student Details</h2>
            <p class="text-sm text-base-content/60">
              {{ isEditing ? 'Update student profile information below.' : 'View student profile information.' }}
            </p>
          </div>

          <button
            v-if="!isLoading && student && !isEditing"
            type="button"
            class="btn btn-primary"
            @click="enterEditMode"
          >
            Edit
          </button>
        </div>

        <div v-if="isLoading" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-md"></span>
        </div>

        <div v-else-if="loadError" class="alert alert-error text-sm shadow-sm">
          <span>{{ loadError }}</span>
        </div>

        <template v-else-if="student">
          <div v-if="successMessage && !isEditing" class="alert alert-success mb-5 text-sm shadow-sm">
            <span>{{ successMessage }}</span>
          </div>

          <!-- READ-ONLY MODE -->
          <div v-if="!isEditing" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="rounded-box bg-base-200/60 p-4">
                <p class="text-xs uppercase tracking-wide text-base-content/60">First Name</p>
                <p class="mt-1 font-medium">{{ student.firstName }}</p>
              </div>
              <div class="rounded-box bg-base-200/60 p-4">
                <p class="text-xs uppercase tracking-wide text-base-content/60">Last Name</p>
                <p class="mt-1 font-medium">{{ student.lastName }}</p>
              </div>
            </div>

            <div class="rounded-box bg-base-200/60 p-4">
              <p class="text-xs uppercase tracking-wide text-base-content/60">Email Address</p>
              <p class="mt-1 font-medium">{{ student.emailAddress }}</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="rounded-box bg-base-200/60 p-4">
                <p class="text-xs uppercase tracking-wide text-base-content/60">Student Number</p>
                <p class="mt-1 font-medium">{{ student.studentNumber }}</p>
              </div>
              <div class="rounded-box bg-base-200/60 p-4">
                <p class="text-xs uppercase tracking-wide text-base-content/60">Status</p>
                <p class="mt-1 font-medium">{{ student.status }}</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="rounded-box bg-base-200/60 p-4 sm:col-span-2">
                <p class="text-xs uppercase tracking-wide text-base-content/60">Program</p>
                <p class="mt-1 font-medium">{{ student.programName }}</p>
              </div>
              <div class="rounded-box bg-base-200/60 p-4">
                <p class="text-xs uppercase tracking-wide text-base-content/60">Year Level</p>
                <p class="mt-1 font-medium">{{ student.yearLevel }}</p>
              </div>
            </div>
          </div>

          <!-- INLINE EDIT MODE -->
          <form v-else class="space-y-5" novalidate @submit.prevent="saveStudent">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="form-control w-full">
                <label class="label justify-start gap-1 p-0" for="first-name">
                  <span class="label-text font-medium">First Name</span>
                  <span class="label-text-alt text-error" aria-label="required">*</span>
                </label>
                <input
                  id="first-name"
                  v-model="form.firstName"
                  type="text"
                  :disabled="isSubmitting"
                  :class="['input input-bordered w-full', { 'input-error': errors.firstName }]"
                />
                <label v-if="errors.firstName" class="label p-0 pt-2">
                  <span class="label-text-alt text-error">{{ errors.firstName }}</span>
                </label>
              </div>

              <div class="form-control w-full">
                <label class="label justify-start gap-1 p-0" for="last-name">
                  <span class="label-text font-medium">Last Name</span>
                  <span class="label-text-alt text-error" aria-label="required">*</span>
                </label>
                <input
                  id="last-name"
                  v-model="form.lastName"
                  type="text"
                  :disabled="isSubmitting"
                  :class="['input input-bordered w-full', { 'input-error': errors.lastName }]"
                />
                <label v-if="errors.lastName" class="label p-0 pt-2">
                  <span class="label-text-alt text-error">{{ errors.lastName }}</span>
                </label>
              </div>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="email-address">
                <span class="label-text font-medium">Email Address</span>
                <span class="label-text-alt text-error" aria-label="required">*</span>
              </label>
              <input
                id="email-address"
                v-model="form.emailAddress"
                type="email"
                placeholder="e.g. juan.delacruz@sdca.edu.ph"
                :disabled="isSubmitting"
                :class="['input input-bordered w-full', { 'input-error': errors.emailAddress }]"
              />
              <label v-if="errors.emailAddress" class="label p-0 pt-2">
                <span class="label-text-alt text-error">{{ errors.emailAddress }}</span>
              </label>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="student-number">
                <span class="label-text font-medium">Student Number</span>
                <span class="label-text-alt text-error" aria-label="required">*</span>
              </label>
              <input
                id="student-number"
                v-model="form.studentNumber"
                type="text"
                inputmode="numeric"
                placeholder="e.g. 202600123"
                :disabled="isSubmitting"
                :class="['input input-bordered w-full', { 'input-error': errors.studentNumber }]"
              />
              <label v-if="errors.studentNumber" class="label p-0 pt-2">
                <span class="label-text-alt text-error">{{ errors.studentNumber }}</span>
              </label>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="program-name">
                <span class="label-text font-medium">Program</span>
                <span class="label-text-alt text-error" aria-label="required">*</span>
              </label>
              <select
                id="program-name"
                v-model="form.programName"
                :disabled="isSubmitting || isLoadingPrograms"
                :class="['select select-bordered w-full', { 'select-error': errors.programName }]"
              >
                <option disabled value="">
                  {{ isLoadingPrograms ? 'Loading programs...' : 'Select a program' }}
                </option>
                <option
                  v-for="program in programOptions"
                  :key="program"
                  :value="program"
                >
                  {{ program }}
                </option>
              </select>
              <label v-if="errors.programName" class="label p-0 pt-2">
                <span class="label-text-alt text-error">{{ errors.programName }}</span>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="form-control w-full">
                <label class="label justify-start gap-1 p-0" for="year-level">
                  <span class="label-text font-medium">Year Level</span>
                  <span class="label-text-alt text-error" aria-label="required">*</span>
                </label>
                <input
                  id="year-level"
                  v-model.number="form.yearLevel"
                  type="number"
                  min="1"
                  max="5"
                  step="1"
                  :disabled="isSubmitting"
                  :class="['input input-bordered w-full', { 'input-error': errors.yearLevel }]"
                />
                <label v-if="errors.yearLevel" class="label p-0 pt-2">
                  <span class="label-text-alt text-error">{{ errors.yearLevel }}</span>
                </label>
              </div>

              <div class="form-control w-full">
                <label class="label justify-start gap-1 p-0" for="status">
                  <span class="label-text font-medium">Status</span>
                  <span class="label-text-alt text-error" aria-label="required">*</span>
                </label>
                <select
                  id="status"
                  v-model="form.status"
                  :disabled="isSubmitting"
                  :class="['select select-bordered w-full', { 'select-error': errors.status }]"
                >
                  <option value="Regular">Regular</option>
                  <option value="Irregular">Irregular</option>
                </select>
                <label v-if="errors.status" class="label p-0 pt-2">
                  <span class="label-text-alt text-error">{{ errors.status }}</span>
                </label>
              </div>
            </div>

            <div v-if="errors.submit" class="alert alert-error text-sm shadow-sm">
              <span>{{ errors.submit }}</span>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                class="btn btn-outline btn-error hover:text-white"
                :disabled="isSubmitting"
                @click="cancelEdit"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
                {{ isSubmitting ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StudentProfile {
  firstName: string
  lastName: string
  emailAddress: string
  studentNumber: string
  programName: string
  yearLevel: number
  status: 'Regular' | 'Irregular'
}

interface AcademicProgramItem {
  _id?: string
  programCode: string
  programName: string
}

const route = useRoute()
const studentId = computed(() => String(route.params.id || ''))

const student = ref<StudentProfile | null>(null)
const programs = ref<AcademicProgramItem[]>([])
const isLoading = ref(true)
const isLoadingPrograms = ref(false)
const loadError = ref('')

const isEditing = ref(false)
const isSubmitting = ref(false)
const successMessage = ref('')

const form = ref<StudentProfile>({
  firstName: '',
  lastName: '',
  emailAddress: '',
  studentNumber: '',
  programName: '',
  yearLevel: 1,
  status: 'Regular'
})

const errors = ref({
  firstName: '',
  lastName: '',
  emailAddress: '',
  studentNumber: '',
  programName: '',
  yearLevel: '',
  status: '',
  submit: ''
})

const programOptions = computed(() => {
  const names = programs.value.map((p) => p.programName).filter(Boolean)
  if (student.value?.programName && !names.includes(student.value.programName)) {
    return [student.value.programName, ...names]
  }
  return names
})

function resetErrors() {
  errors.value = {
    firstName: '',
    lastName: '',
    emailAddress: '',
    studentNumber: '',
    programName: '',
    yearLevel: '',
    status: '',
    submit: ''
  }
}

function syncFormWithStudent(data: StudentProfile) {
  form.value = {
    firstName: data.firstName,
    lastName: data.lastName,
    emailAddress: data.emailAddress,
    studentNumber: String(data.studentNumber),
    programName: data.programName,
    yearLevel: Number(data.yearLevel),
    status: data.status
  }
}

async function fetchPrograms() {
  isLoadingPrograms.value = true
  try {
    const response = await $fetch<AcademicProgramItem[]>('/api/academic-programs')
    programs.value = Array.isArray(response) ? response : []
  } catch {
    programs.value = []
  } finally {
    isLoadingPrograms.value = false
  }
}

async function fetchStudent() {
  isLoading.value = true
  loadError.value = ''

  // Local preview helper before backend GET /api/student/:id is merged (?demo=1)
  if (route.query.demo === '1') {
    student.value = {
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      emailAddress: 'juan.delacruz@sdca.edu.ph',
      studentNumber: '202600123',
      programName: 'Bachelor of Science in Information Technology',
      yearLevel: 3,
      status: 'Regular'
    }
    syncFormWithStudent(student.value)
    isLoading.value = false
    return
  }

  try {
    const response = await $fetch<any>(`/api/student/${studentId.value}`)
    const data = response?.data ?? response
    student.value = {
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.emailAddress,
      studentNumber: String(data.studentNumber),
      programName: data.programName,
      yearLevel: Number(data.yearLevel),
      status: data.status
    }
    syncFormWithStudent(student.value)
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status
    if (statusCode === 404) {
      loadError.value = 'Student not found.'
    } else if (statusCode === 401) {
      loadError.value = 'Authentication required. Please log in.'
    } else {
      loadError.value = error?.data?.message || 'Unable to load student details.'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchStudent(), fetchPrograms()])
})

function enterEditMode() {
  if (!student.value) return
  successMessage.value = ''
  resetErrors()
  syncFormWithStudent(student.value)
  isEditing.value = true
}

function cancelEdit() {
  if (student.value) {
    syncFormWithStudent(student.value)
  }
  resetErrors()
  isEditing.value = false
}

function validateForm(): boolean {
  resetErrors()
  let isValid = true

  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'First name is required.'
    isValid = false
  }

  if (!form.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required.'
    isValid = false
  }

  const email = form.value.emailAddress.trim()
  if (!email) {
    errors.value.emailAddress = 'Email address is required.'
    isValid = false
  } else if (!/^[^\s@]+@sdca\.edu\.ph$/i.test(email)) {
    errors.value.emailAddress = 'Email address must belong to the @sdca.edu.ph domain.'
    isValid = false
  }

  const rawStudentNumber = String(form.value.studentNumber).trim()
  if (!rawStudentNumber) {
    errors.value.studentNumber = 'Student number is required.'
    isValid = false
  } else if (!/^\d+$/.test(rawStudentNumber)) {
    errors.value.studentNumber = 'Student number must contain digits only.'
    isValid = false
  }

  const selectedProgram = form.value.programName.trim()
  const validProgramNames = programs.value.map((p) => p.programName)
  if (!selectedProgram) {
    errors.value.programName = 'Program is required.'
    isValid = false
  } else if (validProgramNames.length > 0 && !validProgramNames.includes(selectedProgram)) {
    errors.value.programName = 'Program must be a non-empty name matching an existing program.'
    isValid = false
  }

  const year = Number(form.value.yearLevel)
  if (!Number.isInteger(year) || year < 1 || year > 5) {
    errors.value.yearLevel = 'Year level must be an integer between 1 and 5.'
    isValid = false
  }

  if (form.value.status !== 'Regular' && form.value.status !== 'Irregular') {
    errors.value.status = "Status must be either 'Regular' or 'Irregular'."
    isValid = false
  }

  return isValid
}

async function saveStudent() {
  successMessage.value = ''

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      emailAddress: form.value.emailAddress.trim(),
      studentNumber: Number(String(form.value.studentNumber).trim()),
      programName: form.value.programName.trim(),
      yearLevel: Number(form.value.yearLevel),
      status: form.value.status
    }

    const response = await $fetch<{
      success: boolean
      message: string
      data: StudentProfile
    }>(`/api/student/${studentId.value}`, {
      method: 'PATCH',
      body: payload
    })

    const updatedData = response?.data ?? payload
    student.value = {
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      emailAddress: updatedData.emailAddress,
      studentNumber: String(updatedData.studentNumber),
      programName: updatedData.programName,
      yearLevel: Number(updatedData.yearLevel),
      status: updatedData.status
    }

    syncFormWithStudent(student.value)
    successMessage.value = response?.message || 'Student profile updated successfully.'
    isEditing.value = false
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status
    const responseData = error?.data || {}
    const fieldErrors = responseData?.errors || {}

    if (statusCode === 422 || statusCode === 409) {
      if (fieldErrors.firstName) errors.value.firstName = fieldErrors.firstName
      if (fieldErrors.lastName) errors.value.lastName = fieldErrors.lastName
      if (fieldErrors.emailAddress) errors.value.emailAddress = fieldErrors.emailAddress
      if (fieldErrors.studentNumber) errors.value.studentNumber = fieldErrors.studentNumber
      if (fieldErrors.program || fieldErrors.programName) {
        errors.value.programName = fieldErrors.program || fieldErrors.programName
      }
      if (fieldErrors.yearLevel) errors.value.yearLevel = fieldErrors.yearLevel
      if (fieldErrors.status) errors.value.status = fieldErrors.status

      if (responseData.message) {
        errors.value.submit = responseData.message
      }
    } else if (statusCode === 401) {
      errors.value.submit = responseData.message || 'Authentication required. Please log in.'
    } else if (statusCode === 403) {
      errors.value.submit = responseData.message || 'You do not have permission.'
    } else if (statusCode === 404) {
      errors.value.submit = responseData.message || 'Student not found.'
    } else if (statusCode === 400) {
      errors.value.submit = responseData.message || 'Invalid request format.'
    } else {
      errors.value.submit = responseData.message || 'Unable to update student details. Please try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>