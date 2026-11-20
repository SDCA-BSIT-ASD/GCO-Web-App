<template>
  <div class="flex justify-center px-4 py-10">
    <div class="card w-full max-w-150 border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body p-6 sm:p-8">
        <div class="mb-6">
          <h2 class="card-title text-2xl">Add New Employee</h2>
          <p class="text-sm text-base-content/60">Fill in the required fields below.</p>
        </div>

        <form class="space-y-5" @submit.prevent="submitEmployee" novalidate>
          <!-- First Name & Last Name -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="first-name">
                <span class="label-text font-medium">First Name</span>
                <span class="label-text-alt text-error" aria-label="required">*</span>
              </label>
              <input id="first-name" v-model="firstName" type="text" maxlength="60" placeholder="e.g. Juan" class="input input-bordered w-full"/>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="last-name">
                <span class="label-text font-medium">Last Name</span>
                <span class="label-text-alt text-error" aria-label="required">*</span>
              </label>
              <input id="last-name" v-model="lastName" type="text" maxlength="60" placeholder="e.g. Dela Cruz" class="input input-bordered w-full" />
            </div>
          </div>

          <!-- Email Address -->
          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="email">
              <span class="label-text font-medium">Email Address</span>
              <span class="label-text-alt text-error" aria-label="required">*</span>
            </label>
            <input id="email" v-model="email" type="email" autocomplete="off" maxlength="120" placeholder="e.g. juan.delacruz@sdca.edu.ph" class="input input-bordered w-full" />
          </div>

          <!-- Employee Number -->
          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="employee-number">
              <span class="label-text font-medium">Employee Number</span>
              <span class="label-text-alt text-error" aria-label="required">*</span>
            </label>
            <input id="employee-number" v-model="employeeNumber" type="text" autocomplete="off" maxlength="30" class="input input-bordered w-full" />
          </div>

          <!-- Employee Type -->
          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="employee-type">
              <span class="label-text font-medium">Employee Type</span>
              <span class="label-text-alt text-error" aria-label="required">*</span>
            </label>
            <select id="employee-type" v-model="type" class="select select-bordered w-full">
              <option value="" disabled>Select employee type</option>
              <option value="Faculty">Faculty</option>
              <option value="Counselor">Counselor</option>
              <option value="ICT Personnel">ICT Personnel</option>
            </select>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  type type = '' | 'Faculty' | 'Counselor' | 'ICT Personnel'

  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const employeeNumber = ref('')
  const type = ref<type>('')

</script>