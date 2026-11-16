# Backend Test Plan: Counselor - Show Student List

**GitHub Issue:** #44  
**Feature:** Counselor: Show Student List  
**Scope:** Backend  
**Status:** Prepared - Awaiting Implementation

## 1. Testing Objective

Verify that `GET /api/students` returns the correct student data to authenticated counselors and correctly rejects unauthenticated users and users without counselor authorization.

## 2. API Contract

**Endpoint:** `GET /api/students`

**Request body:** None

### Student Record Shape

Each returned student record must contain:

- `studentNumber`
- `firstName`
- `lastName`
- `emailAddress`
- `programName`
- `yearLevel`
- `status`

## 3. API Test Scenarios

| Test ID | Scenario | Expected Result |
|---|---|---|
| BE-01 | An authenticated counselor sends `GET /api/students`. | HTTP `200` is returned with `success: true` and a data array. |
| BE-02 | Student records exist in the database. | All student records are returned. |
| BE-03 | No student records exist in the database. | HTTP `200` is returned with `success: true` and `data: []`. |
| BE-04 | A request is made without an authenticated session. | HTTP `401` is returned with `Authentication required.` |
| BE-05 | An authenticated student or other non-counselor sends the request. | HTTP `403` is returned with `Counselor access required.` |
| BE-06 | The response object is inspected. | Each record contains the agreed field names. |
| BE-07 | The response field types are inspected. | `yearLevel` is numeric and the remaining fields use the agreed string format. |
| BE-08 | The endpoint is called with no request body. | The request succeeds when the caller is an authorized counselor. |

## 4. Unit Testing

### Endpoint Response

Test that:

- The endpoint returns a list of student records.
- Returned records have the correct object shape.
- Database values are mapped to the agreed API field names.
- Multiple records are returned correctly.
- An empty database produces an empty array instead of an error.

### Authentication and Authorization

Test that:

- Unauthenticated requests are rejected with HTTP `401`.
- Authenticated non-counselor users are rejected with HTTP `403`.
- Authenticated counselors can access the endpoint.
- Authentication and authorization failures use the agreed response messages.

## 5. Integration Testing

### Scenario BE-INT-01: Counselor With Student Records

**Preconditions:**

- Student records exist in the database.
- A valid counselor session is available.

**Steps:**

1. Send `GET /api/students`.
2. Inspect the status code and response body.

**Expected Result:**

The API returns HTTP `200`, `success: true`, and a data array containing the expected student records.

### Scenario BE-INT-02: Counselor With No Student Records

**Preconditions:**

- The database contains no student records.
- A valid counselor session is available.

**Steps:**

1. Send `GET /api/students`.
2. Inspect the response body.

**Expected Result:**

The API returns:

```json
{
  "success": true,
  "data": []
}