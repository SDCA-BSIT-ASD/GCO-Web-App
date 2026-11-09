<template>
  <main class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2>Academic Programs</h2>
      <NuxtLink to="/academic-programs/new" class="btn btn-sm btn-primary">
        Add New Academic Program
      </NuxtLink>
    </div>

    <p v-if="pending" role="status">Loading academic programs...</p>
    <p v-else-if="error" role="alert">Unable to load academic programs. Please try again.</p>
    <p v-else-if="academicPrograms.length === 0">No academic programs found.</p>
    <div v-else class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Program Code</th>
            <th>Program Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="program in academicPrograms" :key="program.programCode">
            <td>{{ program.programCode }}</td>
            <td>{{ program.programName }}</td>
            <td>{{ program.isActive ? 'Active' : 'Inactive' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup lang="ts">
  import type { AcademicProgram } from '#shared/types/AcademicProgram'

  const { data: academicPrograms, pending, error } = useFetch<AcademicProgram[]>('/api/academic-programs', {
    server: false,
    default: () => []
  })
</script>