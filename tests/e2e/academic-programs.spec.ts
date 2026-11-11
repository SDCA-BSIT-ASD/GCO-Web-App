import { createPage, setup, url, type NuxtPage } from '@nuxt/test-utils/e2e'
import { expect, test } from 'vitest'

const programName = 'Bachelor of Science in Information Technology'
let programs: Array<{ programCode: string; programName: string; isActive: boolean }> = []
let createStatus = 201

await setup({ browser: true })

let page: NuxtPage

async function openAddProgramPage() {
  await page.getByRole('link', { name: 'Add New Academic Program' }).click()
  await expect.poll(() => page.url()).toMatch(/\/academic-programs\/new$/)
}

async function expectVisible(locator: ReturnType<NuxtPage['locator']>) {
  await expect.poll(() => locator.isVisible()).toBe(true)
}

test.describe('Academic programs', () => {
  test.beforeEach(async () => {
    programs = []
    createStatus = 201
    page = await createPage()
    await page.context().addCookies([
      {
        name: 'gco_session',
        value: 'e2e-admin-session',
        url: url('/')
      }
    ])

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            emailAddress: 'admin@school.edu.ph',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          }
        })
      })
    })

    await page.route('**/api/academic-programs', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(programs)
        })
        return
      }

      if (route.request().method() === 'POST') {
        if (createStatus === 409) {
          await route.fulfill({
            status: 409,
            contentType: 'application/json',
            body: JSON.stringify({ statusMessage: 'Duplicate academic program' })
          })
          return
        }

        const submittedProgram = route.request().postDataJSON() as {
          programCode: string
          programName: string
        }
        const program = { ...submittedProgram, isActive: true }
        programs.push(program)
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Academic program created successfully.', data: program })
        })
        return
      }

      await route.continue()
    })

    await page.goto(url('/academic-programs'))
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('[SC01] opens the Add Program form from the list', async () => {
    await openAddProgramPage()

    await expectVisible(page.getByRole('heading', { name: 'Add Academic Program' }))
    await expectVisible(page.locator('#program-code'))
    await expectVisible(page.locator('#program-name'))
    await expectVisible(page.getByRole('button', { name: 'Cancel' }))
    await expectVisible(page.getByRole('button', { name: 'Add Program' }))
  })

  test('[SC02] creates a program and shows it on the list', async () => {
    await openAddProgramPage()
    await page.locator('#program-code').fill('BSIT')
    await page.locator('#program-name').fill(programName)
    await page.getByRole('button', { name: 'Add Program' }).click()

    await expectVisible(page.getByText('Academic program created successfully.'))
    await page.goto(url('/academic-programs'))
    await expectVisible(page.getByText('BSIT'))
    await expectVisible(page.getByText(programName))
  })

  test('[SC03] reports a duplicate program', async () => {
    createStatus = 409

    await openAddProgramPage()
    await page.locator('#program-code').fill('BSIT')
    await page.locator('#program-name').fill(programName)
    await page.getByRole('button', { name: 'Add Program' }).click()

    await expectVisible(page.getByText('An academic program already exists with those details.'))
  })

  test('[SC04a] requires both fields and shows inline validation errors', async () => {
    let submitted = false
    await page.route('**/api/academic-programs', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback()
        return
      }

      submitted = true
      await route.fulfill({ status: 201, body: '{}' })
    })

    await openAddProgramPage()
    await page.getByRole('button', { name: 'Add Program' }).click()

    await expectVisible(page.getByText('Program code is required.'))
    await expectVisible(page.getByText('Program name is required.'))
    await expect.poll(() => page.locator('#program-code').getAttribute('class')).toContain('input-error')
    await expect.poll(() => page.locator('#program-name').getAttribute('class')).toContain('input-error')
    expect(submitted).toBe(false)
  })

  test('[SC04b] rejects program codes containing spaces or special characters', async () => {
    let submitted = false
    await page.route('**/api/academic-programs', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.fallback()
        return
      }

      submitted = true
      await route.fulfill({ status: 201, body: '{}' })
    })

    await openAddProgramPage()
    await page.locator('#program-code').fill('BS IT!')
    await page.locator('#program-name').fill(programName)
    await page.getByRole('button', { name: 'Add Program' }).click()

    await expectVisible(page.getByText(
      'Program code must contain only letters and numbers, with no spaces or special characters.'
    ))
    await expect.poll(() => page.locator('#program-code').getAttribute('class')).toContain('input-error')
    expect(submitted).toBe(false)
  })

  test('[SC05] cancels and discards unsaved form input', async () => {
    await openAddProgramPage()
    await page.locator('#program-code').fill('BSIT')
    await page.locator('#program-name').fill(programName)
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect.poll(() => page.url()).toMatch(/\/academic-programs$/)
    await expectVisible(page.getByRole('heading', { name: 'Academic Programs' }))
    await openAddProgramPage()
    await expect.poll(() => page.locator('#program-code').inputValue()).toBe('')
    await expect.poll(() => page.locator('#program-name').inputValue()).toBe('')
  })
})
