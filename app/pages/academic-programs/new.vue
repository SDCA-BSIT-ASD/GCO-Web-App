<template>
  <div class="flex justify-center px-4 py-10">
    <div class="card w-full max-w-150 border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="card-title text-2xl">Add Academic Program</h2>
          <p class="text-sm text-base-content/60">Fill in the required fields below.</p>
        </div>
        <form class="space-y-5" @submit.prevent="submitProgram" novalidate>
          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="program-code">
              <span class="label-text font-medium">Program Code</span>
              <span class="label-text-alt text-error" aria-label="required">*</span>
            </label>
            <input
              id="program-code"
              v-model="programCode"
              type="text"
              inputmode="text"
              autocomplete="off"
              maxlength="20"
              placeholder="e.g. BSIT"
              @input="handleCodeInput"
              @blur="validateProgramCode"
              :class="['input input-bordered w-full', { 'input-error': errors.code } ]"
            />
            <label v-if="errors.code" class="label p-0 pt-2">
              <span class="label-text-alt text-error">{{ errors.code }}</span>
            </label>
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="program-name">
              <span class="label-text font-medium">Program Name</span>
              <span class="label-text-alt text-error" aria-label="required">*</span>
            </label>
            <input
              id="program-name"
              v-model="programName"
              type="text"
              maxlength="120"
              placeholder="e.g. Bachelor of Science in Information Technology"
              @input="handleNameInput"
              @blur="validateProgramName"
              :class="['input input-bordered w-full', { 'input-error': errors.name } ]"
            />
            <label v-if="errors.name" class="label p-0 pt-2">
              <span class="label-text-alt text-error">{{ errors.name }}</span>
            </label>
          </div>
          <div v-if="errors.submit" class="alert alert-error text-sm shadow-sm">
            <span>{{ errors.submit }}</span>
          </div>
          <div v-if="successMessage" class="alert alert-success text-sm shadow-sm">
            <span>{{ successMessage }}</span>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="btn btn-outline btn-error hover:text-white" @click="handleCancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              {{ isSubmitting ? 'Saving...' : 'Add Program' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const programCode = ref('')
  const programName = ref('')
  const isSubmitting = ref(false)
  const successMessage = ref('')

  const errors = ref({
    code: '',
    name: '',
    submit: ''
  })

  function clearForm() {
    programCode.value = ''
    programName.value = ''
    errors.value = {
      code: '',
      name: '',
      submit: ''
    }
  }

  function formatProgramCode(value: string) {
    return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  }

  function validateProgramCode() {
    const value = programCode.value.trim()

    if (!value) {
      errors.value.code = 'Program code is required.'
      return false
    }

    if (!/^[A-Z0-9]+$/.test(value)) {
      errors.value.code =
        'Program code must contain only letters and numbers, with no spaces or special characters.'
      return false
    }

    errors.value.code = ''
    return true
  }

  function validateProgramName() {
    const value = programName.value.trim()

    if (!value) {
      errors.value.name = 'Program name is required.'
      return false
    }

    if (value.length < 3) {
      errors.value.name = 'Program name must be at least 3 characters long.'
      return false
    }

    errors.value.name = ''
    return true
  }

  function validateForm() {
    const codeIsValid = validateProgramCode()
    const nameIsValid = validateProgramName()
    return codeIsValid && nameIsValid
  }

  function handleCodeInput(event: Event) {
    const target = event.target as HTMLInputElement
    programCode.value = formatProgramCode(target.value)

    if (errors.value.code) {
      validateProgramCode()
    }
  }

  function handleNameInput() {
    if (errors.value.name) {
      validateProgramName()
    }
  }

  async function submitProgram() {
    successMessage.value = ''
    errors.value.submit = ''

    if (!validateForm()) {
      return
    }

    isSubmitting.value = true

    try {
      await $fetch('/api/academic-programs', {
        method: 'POST',
        body: {
          programCode: programCode.value,
          programName: programName.value
        }
      })

      successMessage.value = 'Academic program created successfully.'
      clearForm()
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.response?.status
      const message = error?.data?.statusMessage || error?.statusMessage || error?.message

      if (statusCode === 409) {
        errors.value.submit = 'An academic program already exists with those details.'
      } else if (statusCode === 400 || statusCode === 422) {
        errors.value.submit = message || 'Invalid academic program data.'
      } else if (statusCode === 401 || statusCode === 403) {
        errors.value.submit = 'You are not authorized to create academic programs.'
      } else {
        errors.value.submit = 'Unable to create academic program. Please try again.'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  async function handleCancel() {
    clearForm()
    successMessage.value = ''
    await navigateTo('/academic-programs')
  }
</script>