# Employee API tests

These are Vitest **integration tests**: they send HTTP requests to a running
app and check the real `GET /api/employees` response. They do not need the
frontend. The backend endpoint is not available yet, so run them after it is
implemented.

## Run the tests

1. Start the app using a dedicated test database. For the populated-list run,
   add the `EMP-001` record from [employees.json](./fixtures/employees.json).
   For the empty-list run, use a test database with no employees.
2. In PowerShell, set the app URL, valid test-session cookies, and which data
   setup is currently in the test database:

   ```powershell
   $env:EMPLOYEE_API_BASE_URL = "http://localhost:3000"
   $env:EMPLOYEE_API_ADMIN_COOKIE = "gco_session=<admin-session>"
   $env:EMPLOYEE_API_NON_ADMIN_COOKIE = "gco_session=<non-admin-session>"
   $env:EMPLOYEE_API_DATASET = "populated"
   npm run test:employee-api
   ```

3. To test the empty-list case, prepare the empty test database, change
   `EMPLOYEE_API_DATASET` to `"empty"`, and run the command again.

The test database and sessions must be prepared by the backend team's test
setup. Do not use production or shared data, and do not commit real session
cookies.

## What Vitest checks

- With `populated`, an admin gets `200`, the success message, and employee
  records with the contract's five fields.
- With `empty`, an admin gets `200`, the empty-list message, and `"data": []`.
- Without a session, the API returns the agreed `401` response.
- With a non-admin session, the API returns the agreed `403` response.

The populated and empty checks run in separate executions because the database
must contain different data for each. These are integration tests, not backend
unit tests; backend unit tests can be added when the endpoint's internal
database behavior is implemented and testable in isolation.
