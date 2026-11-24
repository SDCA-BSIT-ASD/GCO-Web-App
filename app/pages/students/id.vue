<script setup lang="ts">
// Counselor: View Student Details [Frontend] (#74)
// Route: /students/[id]  (read-only page)

// Set to false once the real endpoints are merged into main.
const USE_MOCK = true

interface Student {
  _id: string
  studentNumber: string
  fullName: string
  email: string
  program: string
  yearLevel: number | string
  status: string
}
interface Dass21Entry {
  _id: string
  submittedAt: string
  depression: string
  anxiety: string
  stress: string
  flagged: boolean
}
interface Phq9Entry {
  _id: string
  submittedAt: string
  severity: string
  flagged: boolean
}

const route = useRoute()
const id = String(route.params.id)

// ---- Mock data (remove with USE_MOCK) ----
const mockStudent: Student = {
  _id: id,
  studentNumber: '2023-00123',
  fullName: 'Juan Dela Cruz',
  email: 'juan.delacruz@example.com',
  program: 'BS Information Technology',
  yearLevel: 3,
  status: 'Active',
}
const mockDass21: Dass21Entry[] = [
  { _id: 'd1', submittedAt: '2026-11-10T09:30:00Z', depression: 'Mild', anxiety: 'Normal', stress: 'Normal', flagged: false },
  { _id: 'd2', submittedAt: '2026-11-17T14:05:00Z', depression: 'Severe', anxiety: 'Moderate', stress: 'Severe', flagged: true },
  { _id: 'd3', submittedAt: '2026-10-28T11:00:00Z', depression: 'Normal', anxiety: 'Normal', stress: 'Mild', flagged: false },
]
const mockPhq9: Phq9Entry[] = [] // empty on purpose, to test the empty state

const fakeFetch = <T,>(data: T, ms = 600) => new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))

// ---- Data fetching: all three load on page load ----
const { data: student, pending: studentPending, error: studentError, refresh: refreshStudent } =
  useAsyncData(`student-${id}`, () =>
    USE_MOCK ? fakeFetch(mockStudent) : $fetch<Student>(`/api/students/${id}`), { lazy: true })

const { data: dass21, pending: dassPending, error: dassError, refresh: refreshDass } =
  useAsyncData(`student-${id}-dass21`, () =>
    USE_MOCK ? fakeFetch(mockDass21, 800) : $fetch<Dass21Entry[]>(`/api/students/${id}/assessments/dass21`), { lazy: true })

const { data: phq9, pending: phqPending, error: phqError, refresh: refreshPhq } =
  useAsyncData(`student-${id}-phq9`, () =>
    USE_MOCK ? fakeFetch(mockPhq9, 1000) : $fetch<Phq9Entry[]>(`/api/students/${id}/assessments/phq9`), { lazy: true })

// Newest first
const byNewest = <T extends { submittedAt: string }>(list: T[] | null | undefined) =>
  [...(list ?? [])].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))

const dassSorted = computed(() => byNewest(dass21.value))
const phqSorted = computed(() => byNewest(phq9.value))

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })

const severityClass = (label: string) => {
  const l = label.toLowerCase()
  if (l.includes('extremely') || l.includes('severe')) return 'badge-error'
  if (l.includes('moderate')) return 'badge-warning'
  if (l.includes('mild')) return 'badge-info'
  return 'badge-success'
}

// TODO: match these routes to the DASS-21 / PHQ-9 entry detail pages your teammates build.
const dassLink = (entryId: string) => `/students/${id}/dass21/${entryId}`
const phqLink = (entryId: string) => `/students/${id}/phq9/${entryId}`
</script>

<template>
  <div class="mx-auto max-w-4xl space-y-6 p-4">
    <NuxtLink to="/students" class="btn btn-ghost btn-sm">Back to students list</NuxtLink>

    <!-- Profile -->
    <section class="card bg-base-100 shadow">
      <div class="card-body">
        <h1 class="card-title">Student profile</h1>

        <div v-if="studentPending" class="space-y-2">
          <div class="skeleton h-5 w-1/2"></div>
          <div class="skeleton h-5 w-2/3"></div>
          <div class="skeleton h-5 w-1/3"></div>
        </div>

        <div v-else-if="studentError" role="alert" class="alert alert-error">
          <span>We couldn't load this student's profile. Check your connection and try again.</span>
          <button class="btn btn-sm" @click="refreshStudent()">Retry</button>
        </div>

        <dl v-else-if="student" class="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div><dt class="text-sm opacity-70">Student number</dt><dd class="font-medium">{{ student.studentNumber }}</dd></div>
          <div><dt class="text-sm opacity-70">Full name</dt><dd class="font-medium">{{ student.fullName }}</dd></div>
          <div><dt class="text-sm opacity-70">Email address</dt><dd class="font-medium">{{ student.email }}</dd></div>
          <div><dt class="text-sm opacity-70">Program</dt><dd class="font-medium">{{ student.program }}</dd></div>
          <div><dt class="text-sm opacity-70">Year level</dt><dd class="font-medium">{{ student.yearLevel }}</dd></div>
          <div><dt class="text-sm opacity-70">Status</dt><dd class="font-medium">{{ student.status }}</dd></div>
        </dl>
      </div>
    </section>

    <!-- DASS-21 -->
    <section class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">DASS-21 submissions</h2>

        <div v-if="dassPending" class="space-y-2">
          <div class="skeleton h-12 w-full"></div>
          <div class="skeleton h-12 w-full"></div>
        </div>

        <div v-else-if="dassError" role="alert" class="alert alert-error">
          <span>We couldn't load the DASS-21 submissions. Try again.</span>
          <button class="btn btn-sm" @click="refreshDass()">Retry</button>
        </div>

        <p v-else-if="!dassSorted.length" class="opacity-70">
          No DASS-21 submissions have been recorded for this student.
        </p>

        <ul v-else class="space-y-2">
          <li v-for="entry in dassSorted" :key="entry._id">
            <NuxtLink
              :to="dassLink(entry._id)"
              class="flex flex-col gap-2 rounded-box border p-3 hover:bg-base-200 sm:flex-row sm:items-center sm:justify-between"
              :class="entry.flagged ? 'border-error bg-error/10' : 'border-base-300'"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ formatDate(entry.submittedAt) }}</span>
                <span v-if="entry.flagged" class="badge badge-error">Flagged</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span class="badge" :class="severityClass(entry.depression)">Depression: {{ entry.depression }}</span>
                <span class="badge" :class="severityClass(entry.anxiety)">Anxiety: {{ entry.anxiety }}</span>
                <span class="badge" :class="severityClass(entry.stress)">Stress: {{ entry.stress }}</span>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- PHQ-9 -->
    <section class="card bg-base-100 shadow">
      <div class="card-body">
        <h2 class="card-title">PHQ-9 submissions</h2>

        <div v-if="phqPending" class="space-y-2">
          <div class="skeleton h-12 w-full"></div>
          <div class="skeleton h-12 w-full"></div>
        </div>

        <div v-else-if="phqError" role="alert" class="alert alert-error">
          <span>We couldn't load the PHQ-9 submissions. Try again.</span>
          <button class="btn btn-sm" @click="refreshPhq()">Retry</button>
        </div>

        <p v-else-if="!phqSorted.length" class="opacity-70">
          No PHQ-9 submissions have been recorded for this student.
        </p>

        <ul v-else class="space-y-2">
          <li v-for="entry in phqSorted" :key="entry._id">
            <NuxtLink
              :to="phqLink(entry._id)"
              class="flex flex-col gap-2 rounded-box border p-3 hover:bg-base-200 sm:flex-row sm:items-center sm:justify-between"
              :class="entry.flagged ? 'border-error bg-error/10' : 'border-base-300'"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium">{{ formatDate(entry.submittedAt) }}</span>
                <span v-if="entry.flagged" class="badge badge-error">Flagged</span>
              </div>
              <span class="badge" :class="severityClass(entry.severity)">{{ entry.severity }}</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
