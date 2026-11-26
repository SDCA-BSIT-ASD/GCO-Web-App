# Frontend Test Plan: Counselor - Show Student List

**GitHub Issue:** #44  
**Feature:** Counselor: Show Student List  
**Scope:** Frontend  
**Status:** Prepared - Awaiting Implementation

## 1. Testing Objective

Verify that authenticated counselors can access the Students List page, view student records, handle loading and empty states, navigate to student details, and use the page in a read-only manner.

## 2. Functional Test Scenarios

| Test ID | Scenario | Expected Result |
|---|---|---|
| FE-01 | A counselor views the navbar. | A Students navigation option is visible. |
| FE-02 | A counselor clicks Students in the navbar. | The application navigates to the Students List page. |
| FE-03 | The Students List page loads successfully with records. | A table displays one row per student. |
| FE-04 | Student table columns are displayed. | The table contains student number, full name, email address, program, year level, and status. |
| FE-05 | The page is loading student data. | A loading indicator or loading message is displayed. |
| FE-06 | The API returns no student records. | An empty-state message indicates that no students are currently on record. |
| FE-07 | The API request fails. | A clear error message is displayed. |
| FE-08 | A counselor clicks a student row. | The application navigates to that student's detail page. |
| FE-09 | A counselor views the Students List page. | No Add Student, edit, delete, or other management controls are displayed. |
| FE-10 | A counselor views the Students List page. | No search or filter controls are displayed for this feature. |

## 3. Component Testing

### Student List Table

Verify that:

- All required column headings are rendered.
- Student rows render the correct values.
- Full name is displayed using the student's first and last names.
- Multiple student records render as separate rows.
- Year level and status values are displayed correctly.
- Long names and program names do not prevent the table from rendering.

### Empty State

Verify that:

- The empty state appears when the student array is empty.
- No student rows are displayed.
- The message clearly indicates that no students are currently on record.

### Read-Only Behavior

Verify that:

- Add Student controls are not rendered.
- Edit and delete controls are not rendered.
- No other student-management actions are available.
- No search or filter controls are rendered.

## 4. Integration and E2E Scenarios

### Scenario FE-E2E-01: View Student List

**Preconditions:**

- At least two student records exist.
- The user is authenticated as a counselor.

**Steps:**

1. Log in as a counselor.
2. Click Students in the navbar.
3. Inspect the Students List page.

**Expected Result:**

The Students List page opens and displays one row per student with all required columns and values. No management controls are visible.

### Scenario FE-E2E-02: Empty Student List

**Preconditions:**

- No student records exist.
- The user is authenticated as a counselor.

**Steps:**

1. Log in as a counselor.
2. Click Students in the navbar.
3. Inspect the page.

**Expected Result:**

The page displays the empty-state message and no student rows.

### Scenario FE-E2E-03: Navigate to Student Detail

**Preconditions:**

- At least one student record exists.
- The user is authenticated as a counselor.

**Steps:**

1. Open the Students List page.
2. Note a student's name and student number.
3. Click that student's row.

**Expected Result:**

The application navigates to the correct student detail page, which displays the selected student's information.

## 5. Recommended Tools

- Vitest
- Vue Test Utils
- Playwright
- Visual Studio Code

## 6. Completion Criteria

Frontend testing is complete when:

- Students navigation works for counselors.
- The student table displays the required columns and data.
- Loading, empty, and error states work correctly.
- Student row navigation opens the correct detail page.
- The page remains read-only.
- No search or filter functionality is displayed.