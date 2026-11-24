<template>
  <main class="space-y-4">
    <h2>DASS-21 Entries</h2>

    <p v-if="pending" role="status">Loading DASS-21 entries...</p>
    <p v-else-if="error" role="alert">{{ errorMessage }}</p>
    <p v-else-if="entries.length === 0">No DASS-21 submissions have been recorded.</p>
    <div v-else class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Student Number</th>
            <th>Submission Date</th>
            <th>Depression</th>
            <th>Anxiety</th>
            <th>Stress</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in entries"
            :key="entry.id"
            class="cursor-pointer hover"
            :class="{ 'bg-error/10': entry.isFlagged }"
            tabindex="0"
            @click="openEntry(entry.id)"
            @keydown.enter="openEntry(entry.id)"
          >
            <td>{{ entry.studentName }}</td>
            <td>{{ entry.studentNumber }}</td>
            <td>{{ formatDate(entry.submittedAt) }}</td>
            <td>{{ entry.depression.severity }}</td>
            <td>{{ entry.anxiety.severity }}</td>
            <td>{{ entry.stress.severity }}</td>
            <td>
              <span v-if="entry.isFlagged" class="badge badge-error">Flagged</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup lang="ts">
  import type {
    Dass21Submission,
    Dass21SubmissionsResponse
  } from '#shared/types/Dass21Submission'

  const { data: response, pending, error } = useFetch<Dass21SubmissionsResponse>(
    '/api/dass21/submissions',
    { server: false }
  )

  // Newest first by default
  const entries = computed<Dass21Submission[]>(() =>
    [...(response.value?.data ?? [])].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
  )

  const errorMessage = computed(() => {
  const data = error.value?.data as { message?: string } | undefined
  return data?.message ?? 'Unable to load DASS-21 entries. Please try again.'
})

  function formatDate(value: string) {
    return new Date(value).toLocaleString()
  }

  function openEntry(id: string) {
    navigateTo(`/dass21-entries/${id}`)
  }
</script>