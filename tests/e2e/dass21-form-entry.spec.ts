import { createPage, setup, url, type NuxtPage } from '@nuxt/test-utils/e2e'
import { expect, test } from 'vitest'

// Every testIDs used in this file are subject for changes based on the final design of the DASS-21 form page
// Every URL path below is a temporary placeholder to be replaced also
const assessmentListPath = '/assessments'
const dass21FormPath = '/assessments/dass-21'
const dass21ResultsPath = '/assessments/dass-21/results'
const counselorDashboardPath = '/counselor/dashboard'
const dass21SubmissionApi = '**/api/assessments/dass-21'
const flaggedResponsesApi = '**/api/flagged-responses'

// DASS-21 subscale item groupings
const depressionItems = [3, 5, 10, 13, 16, 17, 21]
const anxietyItems = [2, 4, 7, 9, 15, 19, 20]
const stressItems = [1, 6, 8, 11, 12, 14, 18]

type Subscale = {
  rawScore: number
  finalScore: number
  severity: string
}

type FlaggedSubmission = {
  id: string
  assessmentName: string
  studentName: string
  status: string
}

let page: NuxtPage
let userRole = 'student'
let submissions: Array<Record<string, number>> = []
let flaggedSubmissions: FlaggedSubmission[] = []

await setup({ browser: true })

// Functions to be used for test cases
function getSubscale(responses: Record<string, number>, items: number[], scale: 'depression' | 'anxiety' | 'stress'): Subscale {
  const rawScore = items.reduce((total, item) => total + responses[`item${item}`], 0)
  const finalScore = rawScore * 2
  const severity = scale === 'depression'
    ? finalScore <= 9 ? 'Normal' : finalScore <= 13 ? 'Mild' : finalScore <= 20 ? 'Moderate' : finalScore <= 27 ? 'Severe' : 'Extremely Severe'
    : scale === 'anxiety'
      ? finalScore <= 7 ? 'Normal' : finalScore <= 9 ? 'Mild' : finalScore <= 14 ? 'Moderate' : finalScore <= 19 ? 'Severe' : 'Extremely Severe'
      : finalScore <= 14 ? 'Normal' : finalScore <= 18 ? 'Mild' : finalScore <= 25 ? 'Moderate' : finalScore <= 33 ? 'Severe' : 'Extremely Severe'

  return { rawScore, finalScore, severity }
}

async function expectVisible(locator: ReturnType<NuxtPage['locator']>) {
  await expect.poll(() => locator.isVisible()).toBe(true)
}

async function expectText(locator: ReturnType<NuxtPage['locator']>, text: string | RegExp) {
  if (text instanceof RegExp) {
    await expect.poll(() => locator.innerText()).toMatch(text)
    return
  }

  await expect.poll(() => locator.innerText()).toContain(text)
}

async function openDass21Form() {
  await page.goto(url(assessmentListPath))
  await page.getByRole('link', { name: /DASS-21/i }).click()
  await expect.poll(() => page.url()).toMatch(new RegExp(`${dass21FormPath}$`))
  await expectVisible(page.getByTestId('dass21-form'))
}

async function selectResponses(valueForItem: (item: number) => number, skippedItems: number[] = []) {
  for (let item = 1; item <= 21; item++) {
    if (skippedItems.includes(item)) continue
    await page.locator(`input[name="item${item}"][value="${valueForItem(item)}"]`).check()
  }
}

test.describe('DASS-21 form entry', () => {
  test.beforeEach(async () => {
    userRole = 'student'
    submissions = []
    flaggedSubmissions = []
    page = await createPage()
    await page.context().addCookies([
      {
        name: 'gco_session',
        value: 'e2e-dass21-session',
        url: url('/')
      }
    ])

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            emailAddress: userRole === 'student' ? 'student@school.edu.ph' : 'counselor@school.edu.ph',
            firstName: userRole === 'student' ? 'Test' : 'Test Counselor',
            lastName: userRole === 'student' ? 'Student' : 'User',
            role: userRole
          }
        })
      })
    })

    await page.route(dass21SubmissionApi, async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback()
        return
      }

      const requestBody = route.request().postDataJSON() as { responses: Record<string, number> }
      const responses = requestBody.responses
      submissions.push(responses)

      const scores = {
        depression: getSubscale(responses, depressionItems, 'depression'),
        anxiety: getSubscale(responses, anxietyItems, 'anxiety'),
        stress: getSubscale(responses, stressItems, 'stress')
      }
      const counselorAlertTriggered = Object.values(scores).some(
        ({ severity }) => severity === 'Severe' || severity === 'Extremely Severe'
      )
      const assessmentId = 'e2e-dass21-submission'

      if (counselorAlertTriggered) {
        flaggedSubmissions.push({
          id: assessmentId,
          assessmentName: 'DASS-21 Form',
          studentName: 'Test Student',
          status: 'Flagged'
        })
      }

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ assessmentId, scores, counselorAlertTriggered })
      })
    })

    await page.route(flaggedResponsesApi, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(flaggedSubmissions)
      })
    })
  })

  test.afterEach(async () => {
    await page.close()
  })

  // Scenario 01 (Navigation & Disclosure)
  test('[SC01] opens the form and expands the disclosure notice', async () => {
    await openDass21Form()

    // Heading name is subject for changes based on the final design of the DASS-21 form page
    await expectVisible(page.getByRole('heading', { name: 'Emotional Health & Wellbeing Check-In' }))
    await expectVisible(page.getByTestId('dass21-instructions'))

    await page.getByTestId('dass21-disclosure-toggle').click()
    const disclosure = page.getByTestId('dass21-disclosure-content')
    await expectVisible(disclosure)
    await expectText(disclosure, /confidential|confidentiality/i)
    await expectText(disclosure, /data/i)
    await expectText(disclosure, /DASS-21/i)
  })


  // Scenario 02 (Successful Submission: Non-Flagged) NORMAL
  test('[SC02a] submits normal responses and shows unflagged results', async () => {
    await openDass21Form()

    // Selecting 0 for all items to simulate normal result
    await selectResponses(() => 0)
    await page.getByRole('button', { name: /submit/i }).click()

    await expect.poll(() => page.url()).toMatch(new RegExp(`${dass21ResultsPath}$`))
    const results = page.getByTestId('dass21-results')
    await expectText(results, /Depression/i)
    await expectText(results, /Anxiety/i)
    await expectText(results, /Stress/i)
    await expectText(results, 'Normal')
    await expect.poll(() => page.getByTestId('dass21-crisis-banner').count()).toBe(0)
    expect(submissions).toHaveLength(1)
    expect(Object.keys(submissions[0])).toHaveLength(21)
  })

  // Scenario 02 (Successful Submission: Non-Flagged) MILD
  test('[SC02b] submits mild responses and shows unflagged results', async () => {
    await openDass21Form()

    // Specific selected responses to simulate mild result
    await selectResponses((item) =>
    [3, 5, 10, 13, 16].includes(item) ? 1   //Depression items
    : [2, 4, 7, 9].includes(item) ? 1   //Anxiety items
    : [1, 6, 8, 11, 12, 14].includes(item) ? 1    //Stress items
    : item === 18 ? 2
    : 0)
    await page.getByRole('button', { name: /submit/i }).click()

    await expect.poll(() => page.url()).toMatch(new RegExp(`${dass21ResultsPath}$`))
    const results = page.getByTestId('dass21-results')
    await expectText(results, /Depression/i)
    await expectText(results, /Anxiety/i)
    await expectText(results, /Stress/i)
    await expectText(results, 'Mild')
    await expect.poll(() => page.getByTestId('dass21-crisis-banner').count()).toBe(0)
    expect(submissions).toHaveLength(1)
    expect(Object.keys(submissions[0])).toHaveLength(21)
  })


  // Scenario 03 (Successful Submission: Flagged)
  test('[SC03] shows outreach for severe results and lists the submission for counselors', async () => {
    await openDass21Form()

    // Specific selected responses to simulate anxiety with flagged result
    await selectResponses((item) => anxietyItems.includes(item) ? 3 : 0)
    await page.getByRole('button', { name: /submit/i }).click()

    await expect.poll(() => page.url()).toMatch(new RegExp(`${dass21ResultsPath}$`))
    await expectVisible(page.getByTestId('dass21-crisis-banner'))
    await expectText(page.getByTestId('dass21-crisis-banner'), /counsel|support|outreach/i)
    await expectText(page.getByTestId('dass21-score-anxiety'), '42')
    await expectText(page.getByTestId('dass21-severity-anxiety'), 'Extremely Severe')

    // Change to counselor's view
    userRole = 'counselor'
    await page.goto(url(counselorDashboardPath))
    const flaggedSubmission = page.getByTestId('flagged-dass21-submission')
    await expectVisible(flaggedSubmission)
    await expectText(flaggedSubmission, 'Test Student')
  })


  // Scenario 04 (Incomplete Submission Validation) 
  test('[SC04] blocks incomplete submissions and focuses the first unanswered item', async () => {
    await openDass21Form()

    // Answering all items except item 11 to simulate incomplete submission
    await selectResponses(() => 0, [11])
    await page.getByRole('button', { name: /submit/i }).click()

    const unansweredItem = page.locator('[name="item11"]').first()
    await expectVisible(unansweredItem)
    await expectText(
      page.getByRole('alert').filter({hasText: /required|answer/i}), /required|answer/i
    )
    //await expect.poll(() => unansweredItem.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    await expect.poll(() => unansweredItem.evaluate((element) => 
      element === document.activeElement || element.contains(document.activeElement))
    ).toBe(true)
    expect(submissions).toHaveLength(0)
  })

  
  // Scenario 05 (Cancel Warning)
  test('[SC05] warns before discarding responses and supports both modal choices', async () => {
    await openDass21Form()

    // Answering items with 0 except items from 0-11
    await selectResponses(() => 0, Array.from({ length: 11 }, (_, index) => index + 1))
    await page.getByRole('button', { name: /cancel/i }).click()

    const cancelDialog = page.getByRole('dialog')
    await expectVisible(cancelDialog)
    await expectText(cancelDialog, /unsaved|discard/i)

    // Chooses the continue to edit button and closes the warning dialog
    await cancelDialog.getByRole('button', { name: /keep editing|continue/i }).click()
    await expect.poll(() => cancelDialog.isVisible()).toBe(false)
    
    // Checks if the answered item 12 still has answer after continuing the form
    await expect.poll(() => page.locator('input[name="item12"][value="0"]').isChecked()).toBe(true)

    // Cancel again and chooses dismiss or discard button then return to the lists of forms
    await page.getByRole('button', { name: /cancel/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: /discard|dismiss|confirm/i }).click()
    await expect.poll(() => page.url()).toMatch(new RegExp(`${assessmentListPath}$`))
  })
})
