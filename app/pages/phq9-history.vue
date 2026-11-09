<script setup lang="ts">
/**
 * pages/phq9-history.vue
 *
 * Student PHQ-9 assessment history (read-only).
 *
 * Notes
 * - Header, footer and <body> classes from the HTML mockup belong in
 *   layouts/default.vue, not in this page.
 * - Data is fetched client-side only (server: false) so health data is never
 *   serialized into the SSR payload. Pair with routeRules for this page
 *   (ssr: false + Cache-Control: no-store).
 * - The detail view uses a native <dialog> (focus trap, Esc, inert background,
 *   focus restore). No icon library or CDN is required.
 */
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import type { PropType } from 'vue'

// definePageMeta({ middleware: 'auth' }) // enable once your auth middleware exists
useSeoMeta({
  title: 'PHQ-9 history – Student Wellness Portal',
  robots: 'noindex, nofollow',
})

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type IconName =
  | 'check-circle'
  | 'info'
  | 'alert-triangle'
  | 'shield'
  | 'shield-alert'
  | 'x'
  | 'chevron-right'
  | 'lock'
  | 'clipboard'

type SeverityKey = 'minimal' | 'mild' | 'moderate' | 'moderately-severe' | 'severe'

/** Presentation data shared by real severity levels and the "unavailable" fallback. */
interface SeverityDisplay {
  label: string
  icon: IconName
  /** Pill / panel colors (bg + text + border). Full class names so Tailwind can see them. */
  tone: string
  /** Icon badge colors (bg + text). */
  badge: string
  message: string
}

interface SeverityLevel extends SeverityDisplay {
  key: SeverityKey
  min: number
  max: number
}

/** Shape the API is expected to return. */
interface SubmissionDTO {
  id: string
  date: string // ISO 8601 with timezone, e.g. 2026-10-28T06:30:00Z
  score: number // integer, 0–27
}

/** Validated, normalized record. `score` is null when the payload had an invalid score. */
interface Submission {
  id: string
  date: string
  timestamp: number
  score: number | null
}

interface HistoryRow extends Submission {
  severity: SeverityDisplay
  isLatest: boolean
  dateLabel: string
  timeLabel: string
  dateTimeLabel: string
}

interface ParsedHistory {
  items: Submission[]
  skipped: number
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PHQ9_MAX_SCORE = 27

// TODO: point this at your real "take assessment" route.
const NEW_ASSESSMENT_ROUTE = '/phq9'

// TODO: replace with your campus's real crisis / counseling contact details before launch.
const SUPPORT_NOTE =
  'If you are in immediate danger or thinking about harming yourself, contact local emergency services or your campus crisis line right away.'

const SEVERITY_LEVELS: readonly SeverityLevel[] = [
  {
    key: 'minimal',
    min: 0,
    max: 4,
    label: 'Minimal or no depression',
    icon: 'check-circle',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    message:
      'Your results show minimal or no symptoms of depression. Keep up good self-care and balanced daily habits.',
  },
  {
    key: 'mild',
    min: 5,
    max: 9,
    label: 'Mild depression',
    icon: 'info',
    tone: 'bg-sky-50 text-sky-800 border-sky-200',
    badge: 'bg-sky-100 text-sky-800',
    message:
      'Your results show mild depressive symptoms. Consider regular breaks, staying connected with friends, or talking to campus wellness resources if symptoms continue.',
  },
  {
    key: 'moderate',
    min: 10,
    max: 14,
    label: 'Moderate depression',
    icon: 'alert-triangle',
    tone: 'bg-amber-50 text-amber-800 border-amber-200',
    badge: 'bg-amber-100 text-amber-900',
    message:
      'Your results show moderate depressive symptoms. We encourage you to reach out to campus counseling services for support and practical strategies.',
  },
  {
    key: 'moderately-severe',
    min: 15,
    max: 19,
    label: 'Moderately severe depression',
    icon: 'alert-triangle',
    tone: 'bg-orange-50 text-orange-800 border-orange-200',
    badge: 'bg-orange-100 text-orange-900',
    message:
      'Your results show moderately severe symptoms. Please schedule a check-in with your campus counselor or a health provider who can support you.',
  },
  {
    key: 'severe',
    min: 20,
    max: PHQ9_MAX_SCORE,
    label: 'Severe depression',
    icon: 'shield-alert',
    tone: 'bg-rose-50 text-rose-800 border-rose-200',
    badge: 'bg-rose-100 text-rose-900',
    message:
      'Your results fall in the severe range. We strongly encourage you to contact campus mental health services or a counselor right away. Support is available.',
  },
]

/** Shown instead of guessing a severity when a score is missing or invalid. */
const UNAVAILABLE_SEVERITY: SeverityDisplay = {
  label: 'Result unavailable',
  icon: 'info',
  tone: 'bg-slate-100 text-slate-700 border-slate-200',
  badge: 'bg-slate-200 text-slate-700',
  message:
    "We couldn't read the score for this record. Please contact your campus counselor if you have questions about it.",
}

/** Typed mock data (matches the API contract). Swap for $fetch in loadSubmissions(). */
const MOCK_SUBMISSIONS: readonly SubmissionDTO[] = [
  { id: 'sub-103', date: '2026-10-28T06:30:00Z', score: 6 },
  { id: 'sub-102', date: '2026-09-14T01:15:00Z', score: 12 },
  { id: 'sub-101', date: '2026-08-01T03:00:00Z', score: 3 },
]

const dateFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
const timeFmt = new Intl.DateTimeFormat('en-US', { timeStyle: 'short' })
const dateTimeFmt = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600'

/* -------------------------------------------------------------------------- */
/* Validation and helpers                                                     */
/* -------------------------------------------------------------------------- */

/** Returns a valid PHQ-9 total (integer 0–27) or null. Never coerces null/strings/NaN. */
function parseScore(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null
  return value >= 0 && value <= PHQ9_MAX_SCORE ? value : null
}

function getSeverity(score: number | null): SeverityDisplay {
  if (score === null) return UNAVAILABLE_SEVERITY
  return SEVERITY_LEVELS.find((level) => score >= level.min && score <= level.max) ?? UNAVAILABLE_SEVERITY
}

/**
 * Validates an untrusted API payload.
 * - Non-array payload -> throws (surfaces the error state).
 * - Rows without a usable id/date (or duplicate ids) are skipped and counted.
 * - Rows with an invalid score are kept and shown as "Result unavailable"
 *   rather than silently dropped or mislabeled.
 */
function normalizeHistory(raw: unknown): ParsedHistory {
  if (!Array.isArray(raw)) throw new Error('Unexpected response shape')

  const items: Submission[] = []
  const seen = new Set<string>()
  let skipped = 0

  for (const row of raw as unknown[]) {
    if (typeof row !== 'object' || row === null) {
      skipped++
      continue
    }
    const { id, date, score } = row as Record<string, unknown>
    if (typeof id !== 'string' || id === '' || typeof date !== 'string' || seen.has(id)) {
      skipped++
      continue
    }
    const timestamp = Date.parse(date)
    if (Number.isNaN(timestamp)) {
      skipped++
      continue
    }
    seen.add(id)
    items.push({ id, date, timestamp, score: parseScore(score) })
  }

  return { items, skipped }
}

async function loadSubmissions(): Promise<unknown> {
  // TODO(prod): return await $fetch('/api/phq9/history')
  return MOCK_SUBMISSIONS
}

/* -------------------------------------------------------------------------- */
/* Data + derived state                                                       */
/* -------------------------------------------------------------------------- */

const { data, status, refresh } = useAsyncData<ParsedHistory>(
  'phq9-history',
  async () => normalizeHistory(await loadSubmissions()),
  {
    server: false, // keep health data out of the SSR payload
    lazy: true, // don't block navigation
    default: () => ({ items: [], skipped: 0 }),
  },
)

const isLoading = computed(() => status.value === 'idle' || status.value === 'pending')
const isError = computed(() => status.value === 'error')
const skipped = computed(() => data.value?.skipped ?? 0)

const rows = computed<HistoryRow[]>(() => {
  const sorted = [...(data.value?.items ?? [])].sort((a, b) => b.timestamp - a.timestamp)
  return sorted.map((sub, index) => ({
    ...sub,
    severity: getSeverity(sub.score),
    isLatest: index === 0,
    dateLabel: dateFmt.format(sub.timestamp),
    timeLabel: timeFmt.format(sub.timestamp),
    dateTimeLabel: dateTimeFmt.format(sub.timestamp),
  }))
})

/* -------------------------------------------------------------------------- */
/* Detail dialog (native <dialog>)                                            */
/* -------------------------------------------------------------------------- */

const dialogRef = ref<HTMLDialogElement | null>(null)
const selected = ref<HistoryRow | null>(null)

// Lock page scroll while the dialog is open; Unhead removes it on unmount.
useHead({
  bodyAttrs: { class: computed(() => (selected.value ? 'overflow-hidden' : '')) },
})

async function openDetails(row: HistoryRow) {
  selected.value = row
  await nextTick()
  const dialog = dialogRef.value
  if (dialog && !dialog.open) dialog.showModal()
}

function closeDetails() {
  dialogRef.value?.close()
}

/** Fires for Esc, the Close buttons, and backdrop clicks. */
function onDialogClosed() {
  selected.value = null
}

function onDialogClick(event: MouseEvent) {
  // The dialog box is exactly the card, so a click that targets the <dialog>
  // itself landed on the backdrop.
  if (event.target === dialogRef.value) closeDetails()
}

/* -------------------------------------------------------------------------- */
/* Inline SVG icons (Feather-style, no dependency)                            */
/* -------------------------------------------------------------------------- */

type SvgNode = readonly [tag: 'path' | 'line' | 'circle' | 'polyline' | 'rect', attrs: Record<string, string | number>]

const SHIELD_PATH = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'

const ICON_NODES: Record<IconName, readonly SvgNode[]> = {
  'check-circle': [
    ['path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }],
    ['polyline', { points: '22 4 12 14.01 9 11.01' }],
  ],
  info: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['line', { x1: 12, y1: 16, x2: 12, y2: 12 }],
    ['line', { x1: 12, y1: 8, x2: 12.01, y2: 8 }],
  ],
  'alert-triangle': [
    ['path', { d: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }],
    ['line', { x1: 12, y1: 9, x2: 12, y2: 13 }],
    ['line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }],
  ],
  shield: [['path', { d: SHIELD_PATH }]],
  'shield-alert': [
    ['path', { d: SHIELD_PATH }],
    ['line', { x1: 12, y1: 8, x2: 12, y2: 12 }],
    ['line', { x1: 12, y1: 16, x2: 12.01, y2: 16 }],
  ],
  x: [
    ['line', { x1: 18, y1: 6, x2: 6, y2: 18 }],
    ['line', { x1: 6, y1: 6, x2: 18, y2: 18 }],
  ],
  'chevron-right': [['polyline', { points: '9 18 15 12 9 6' }]],
  lock: [
    ['rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }],
    ['path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' }],
  ],
  clipboard: [
    ['path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }],
    ['rect', { x: 8, y: 2, width: 8, height: 4, rx: 1, ry: 1 }],
  ],
}

const SvgIcon = defineComponent({
  name: 'SvgIcon',
  props: { name: { type: String as PropType<IconName>, required: true } },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        ICON_NODES[props.name].map(([tag, attrs]) => h(tag, attrs)),
      )
  },
})
</script>

<template>
  <div>
    <section aria-labelledby="phq9-page-title" class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <header class="mb-8">
        <div class="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 id="phq9-page-title" class="text-2xl font-bold tracking-tight text-slate-900">
              PHQ-9 history and trends
            </h1>
            <p class="mt-1 text-sm text-slate-600">
              Review your past check-ins to see how you've been doing over time.
            </p>
          </div>
          <p
            class="inline-flex items-center gap-1.5 self-start rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
          >
            <SvgIcon name="lock" class="h-3.5 w-3.5 text-slate-500" />
            Records are read-only
          </p>
        </div>

        <div
          class="flex items-start gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-4 text-sm leading-relaxed text-emerald-900"
        >
          <SvgIcon name="shield" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <p>
            <span class="font-semibold text-emerald-950">Privacy and support:</span>
            Your answers to individual questions are confidential and visible only to your campus wellness
            counselor. This page shows your summary results. The PHQ-9 is a screening tool, not a diagnosis.
          </p>
        </div>
      </header>

      <!-- Partial-data notice -->
      <p
        v-if="!isLoading && !isError && skipped > 0"
        role="status"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
      >
        {{ skipped }} {{ skipped === 1 ? 'record' : 'records' }} couldn't be displayed. If this looks wrong,
        contact your campus counselor.
      </p>

      <!-- Loading -->
      <div v-if="isLoading" role="status">
        <span class="sr-only">Loading your assessment history…</span>
        <ul class="space-y-3" aria-hidden="true">
          <li
            v-for="n in 3"
            :key="n"
            class="h-[76px] animate-pulse rounded-xl border border-slate-200 bg-white motion-reduce:animate-none"
          />
        </ul>
      </div>

      <!-- Error -->
      <div v-else-if="isError" role="alert" class="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p class="text-sm font-semibold text-rose-900">We couldn't load your history</p>
        <p class="mt-1 text-sm text-rose-800">Check your connection and try again.</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-800"
          :class="FOCUS_RING"
          @click="refresh()"
        >
          Try again
        </button>
      </div>

      <!-- Empty -->
      <div
        v-else-if="rows.length === 0"
        class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12"
      >
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <SvgIcon name="clipboard" class="h-7 w-7" />
        </div>
        <h2 class="mb-1 text-lg font-bold text-slate-800">No assessments yet</h2>
        <p class="mx-auto mb-6 max-w-md text-sm text-slate-600">
          When you complete a PHQ-9 check-in, your results will appear here. Regular check-ins help you notice
          changes over time.
        </p>
        <NuxtLink
          :to="NEW_ASSESSMENT_ROUTE"
          class="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          :class="FOCUS_RING"
        >
          Take your first assessment
        </NuxtLink>
      </div>

      <!-- History -->
      <template v-else>
        <ul role="list" class="space-y-3">
          <li v-for="row in rows" :key="row.id">
            <button
              type="button"
              aria-haspopup="dialog"
              class="group flex w-full flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-teal-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:p-5"
              :class="FOCUS_RING"
              @click="openDetails(row)"
            >
              <span class="flex items-center gap-4">
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  :class="row.severity.badge"
                >
                  <SvgIcon :name="row.severity.icon" class="h-5 w-5" />
                </span>
                <span class="block">
                  <span class="flex items-center gap-2">
                    <time :datetime="row.date" class="text-sm font-semibold text-slate-800">
                      {{ row.dateLabel }}
                    </time>
                    <span
                      v-if="row.isLatest"
                      class="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800"
                    >
                      Latest
                    </span>
                  </span>
                  <span class="mt-0.5 block text-xs text-slate-500">{{ row.timeLabel }}</span>
                </span>
              </span>

              <span
                class="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0"
              >
                <span
                  class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                  :class="row.severity.tone"
                >
                  {{ row.severity.label }}
                </span>
                <SvgIcon
                  name="chevron-right"
                  class="h-4 w-4 text-slate-400 transition-colors group-hover:text-teal-600"
                />
              </span>
            </button>
          </li>
        </ul>

        <p class="mt-6 text-sm text-slate-600">{{ SUPPORT_NOTE }}</p>
      </template>
    </section>

    <!-- Details dialog -->
    <dialog
      ref="dialogRef"
      aria-labelledby="phq9-dialog-title"
      class="m-auto w-[calc(100%-2rem)] max-w-md bg-transparent p-0 text-slate-800 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
      @click="onDialogClick"
      @close="onDialogClosed"
    >
      <div v-if="selected" class="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h2 id="phq9-dialog-title" class="text-sm font-semibold text-slate-700">Assessment details</h2>
          <button
            type="button"
            aria-label="Close"
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
            :class="FOCUS_RING"
            @click="closeDetails"
          >
            <SvgIcon name="x" class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-5 p-6">
          <dl class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5">
            <div>
              <dt class="text-xs font-medium text-slate-500">Date submitted</dt>
              <dd class="mt-0.5 text-sm font-semibold text-slate-800">
                <time :datetime="selected.date">{{ selected.dateTimeLabel }}</time>
              </dd>
            </div>
            <div class="text-right">
              <dt class="text-xs font-medium text-slate-500">Total score</dt>
              <dd class="mt-0.5 text-base font-bold text-slate-700">
                {{ selected.score ?? '—' }} / {{ PHQ9_MAX_SCORE }}
              </dd>
            </div>
          </dl>

          <div>
            <p class="mb-2 text-xs font-medium text-slate-500">Result</p>
            <p
              class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold"
              :class="selected.severity.tone"
            >
              <SvgIcon :name="selected.severity.icon" class="h-4 w-4" />
              {{ selected.severity.label }}
            </p>
          </div>

          <div class="rounded-xl border p-4 text-sm leading-relaxed" :class="selected.severity.tone">
            <p><strong class="font-semibold">Guidance:</strong> {{ selected.severity.message }}</p>
          </div>

          <p class="text-sm text-slate-600">{{ SUPPORT_NOTE }}</p>

          <div class="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
            <SvgIcon name="lock" class="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p>
              This record is read-only. Full item responses are available only to your campus counselor.
            </p>
          </div>
        </div>

        <div class="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-300"
            :class="FOCUS_RING"
            @click="closeDetails"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  dialog[open] {
    animation: phq9-dialog-in 160ms ease-out;
  }
  dialog[open]::backdrop {
    animation: phq9-fade-in 160ms ease-out;
  }
}

@keyframes phq9-dialog-in {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes phq9-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>