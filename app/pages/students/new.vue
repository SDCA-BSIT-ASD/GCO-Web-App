
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

        <form class="space-y-5" @submit.prevent>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="first-name">
                <span class="label-text font-medium">First Name</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                id="first-name"
                type="text"
                class="input input-bordered w-full"
                placeholder="Enter first name"
                required
              />
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="last-name">
                <span class="label-text font-medium">Last Name</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <input
                id="last-name"
                type="text"
                class="input input-bordered w-full"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="email-address">
              <span class="label-text font-medium">Email Address</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input
              id="email-address"
              type="email"
              class="input input-bordered w-full"
              placeholder="student@sdca.edu.ph"
              required
            />
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="student-number">
              <span class="label-text font-medium">Student Number</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <input
              id="student-number"
              type="text"
              class="input input-bordered w-full"
              placeholder="Enter student number"
              required
            />
          </div>

          <div class="form-control w-full">
            <label class="label justify-start gap-1 p-0" for="program">
              <span class="label-text font-medium">Academic Program</span>
              <span class="label-text-alt text-error">*</span>
            </label>
            <select id="program" class="select select-bordered w-full" required>
              <option value="" disabled selected>Select academic program</option>
            </select>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="year-level">
                <span class="label-text font-medium">Year Level</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <select id="year-level" class="select select-bordered w-full" required>
                <option value="" disabled selected>Select year level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div class="form-control w-full">
              <label class="label justify-start gap-1 p-0" for="status">
                <span class="label-text font-medium">Status</span>
                <span class="label-text-alt text-error">*</span>
              </label>
              <select id="status" class="select select-bordered w-full" required>
                <option value="" disabled selected>Select status</option>
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" class="btn btn-outline btn-error hover:text-white">
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
