// @vitest-environment jsdom
import { describe, it } from 'vitest'

// ---------------------------------------------------------------------------
// Unit tests (frontend) for Counselor: Show Student List
//
// PENDING: app/pages/student-list/index.vue is still a placeholder (static
// heading + hard-coded message). These cases become real tests once the page
// fetches /api/students and renders the table. Replace each it.todo with a
// test that mounts the page (see app/pages/academic-programs/new.test.ts for
// the mounting / $fetch-stubbing pattern).
// ---------------------------------------------------------------------------
describe('Student List page (frontend unit)', () => {
  it.todo('renders the columns: Student Number, Full Name, Email Address, Program, Year Level, Status')
  it.todo('renders one row per student, with full name = first name + last name and correct row data')
  it.todo('renders no Add / Edit / Delete controls')
  it.todo('renders the empty state message when an empty list is returned')
  it.todo('navigates to the student detail page when a row is clicked')
})
