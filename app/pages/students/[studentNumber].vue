<template>
  <main class="space-y-4">
    <h2>Student Details</h2>
    <p>Student details are not available yet.</p>
    <p>Student Number: {{ studentNumber }}</p>
    <NuxtLink to="/students" class="link">Back to Students</NuxtLink>
  </main>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const route = useRoute()
  const studentNumber = computed(() => {
    const parameter = route.params.studentNumber
    return Array.isArray(parameter) ? parameter[0] ?? '' : parameter ?? ''
  })
</script>
