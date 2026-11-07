<template>
  <div class="min-h-[calc(100vh-4rem)] bg-base-200 p-4 sm:p-6">
    <div class="mx-auto max-w-6xl space-y-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button type="button" class="btn btn-ghost btn-sm mb-2 -ml-3" @click="goBack">
            <ArrowLeft class="h-4 w-4" />
            Back
          </button>
          <h1 class="text-2xl font-bold sm:text-3xl">DASS-21 Submission Details</h1>
          <p class="mt-1 text-sm text-base-content/60">Read-only counselor review</p>
        </div>
        <div v-if="submission" class="text-left sm:text-right">
          <p class="text-xs uppercase tracking-wide text-base-content/60">Submitted</p>
          <p class="font-medium">{{ formatDate(submission.submittedAt) }}</p>
        </div>
      </header>

      <div v-if="pending" class="rounded-box bg-base-100 p-8 text-center shadow-sm" role="status">
        <span class="loading loading-spinner loading-md text-primary"></span>
        <p class="mt-3">Loading submission details...</p>
      </div>

      <div v-else-if="error" class="alert alert-error" role="alert">
        <span>{{ error.message }}</span>
      </div>

      <template v-else-if="submission">
        <section class="card border border-base-200 bg-base-100 shadow-sm" aria-labelledby="student-summary-heading">
          <div class="card-body">
            <h2 id="student-summary-heading" class="card-title">Student Profile</h2>
            <dl class="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt class="text-sm text-base-content/60">Student name</dt>
                <dd class="font-semibold">{{ submission.student.name }}</dd>
              </div>
              <div>
                <dt class="text-sm text-base-content/60">Student number</dt>
                <dd class="font-semibold">{{ submission.student.studentNumber }}</dd>
              </div>
              <div>
                <dt class="text-sm text-base-content/60">Program</dt>
                <dd class="font-semibold">{{ submission.student.program }}</dd>
              </div>
              <div>
                <dt class="text-sm text-base-content/60">Year level</dt>
                <dd class="font-semibold">Year {{ submission.student.yearLevel }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section v-if="submission.flaggedSubscales.length" class="alert alert-warning shadow-sm" role="alert">
          <TriangleAlert class="h-6 w-6 shrink-0" />
          <div>
            <h2 class="font-bold">Follow-up attention required</h2>
            <p>
              {{ flaggedSubscaleText }} reached a Severe or Extremely Severe level.
            </p>
          </div>
        </section>

        <section aria-labelledby="scores-heading">
          <div class="mb-3">
            <h2 id="scores-heading" class="text-xl font-bold">Subscale Scores</h2>
            <p class="text-sm text-base-content/60">Final scores are calculated from the raw score multiplied by two.</p>
          </div>
          <div class="grid gap-4 md:grid-cols-3">
            <article
              v-for="subscale in submission.subscales"
              :key="subscale.name"
              class="card border border-base-200 bg-base-100 shadow-sm"
            >
              <div class="card-body">
                <h3 class="card-title">{{ subscale.name }}</h3>
                <div class="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p class="text-sm text-base-content/60">Final score</p>
                    <p class="text-4xl font-bold">{{ subscale.finalScore }}</p>
                  </div>
                  <span :class="['badge badge-lg', severityClass(subscale.severity)]">
                    {{ subscale.severity }}
                  </span>
                </div>
                <p class="mt-3 text-sm text-base-content/60">Raw score: {{ subscale.rawScore }} x 2</p>
              </div>
            </article>
          </div>
        </section>

        <section class="card border border-base-200 bg-base-100 shadow-sm" aria-labelledby="responses-heading">
          <div class="card-body p-0">
            <div class="border-b border-base-200 p-5">
              <h2 id="responses-heading" class="card-title">Item Responses</h2>
              <p class="text-sm text-base-content/60">The student's selected response for each DASS-21 item.</p>
            </div>
            <ol class="divide-y divide-base-200">
              <li v-for="answer in submission.answers" :key="answer.itemNumber" class="grid gap-3 p-5 md:grid-cols-[3rem_1fr_auto] md:items-start">
                <span class="font-bold text-primary">#{{ answer.itemNumber }}</span>
                <p>{{ answer.statement }}</p>
                <span class="badge badge-outline h-auto whitespace-normal py-2 text-left md:max-w-80">
                  {{ answer.selectedLabel }}
                </span>
              </li>
            </ol>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ArrowLeft, TriangleAlert } from 'lucide-vue-next'

  const route = useRoute()
  const router = useRouter()
  const submissionId = computed(() => String(route.query.id || 'mock-dass-21-submission'))
  const { data: submission, pending, error } = useDass21Detail(submissionId.value)

  const flaggedSubscaleText = computed(() => {
    if (!submission.value) {
      return ''
    }

    if (submission.value.flaggedSubscales.length === 1) {
      return submission.value.flaggedSubscales[0]
    }

    const names = submission.value.flaggedSubscales
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
  })

  function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(new Date(value))
  }

  function severityClass(severity: string) {
    if (severity === 'Normal') return 'badge-success'
    if (severity === 'Mild') return 'badge-info'
    if (severity === 'Moderate') return 'badge-warning'
    return 'badge-error'
  }

  async function goBack() {
    const source = typeof route.query.from === 'string' ? route.query.from : ''

    if (source.startsWith('/') && !source.startsWith('//')) {
      await router.push(source)
      return
    }

    if (window.history.length > 1) {
      router.back()
      return
    }

    await navigateTo('/counselor/dass-21')
  }
</script>
