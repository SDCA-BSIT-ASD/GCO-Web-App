
<script setup lang="ts">
useHead({
  title: 'Employees | SDCA-GCO',
})

// TEMPORARY MOCK DATA WILL BE REPLACED ONCE API IS DONE AND CONFIRMED BY GROUP MEMBER

interface Employee {
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  employeeType: string
}

const employees = ref<Employee[]>([
  {
    employeeNumber: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    employeeType: 'Regular',
  },
  {
    employeeNumber: 'EMP-002',
    firstName: 'Anthony',
    lastName: 'Chen',
    email: 'antonychen@example.com',
    employeeType: 'Regular',
  },
  {
    employeeNumber: 'EMP-003',
    firstName: 'Tony',
    lastName: 'Stark',
    email: 'tonystark@example.com',
    employeeType: 'Part-Time',
  },
])

// Navigate to the employee detail page
function openEmployee(employeeNumber: string) {
  navigateTo(`/employees/${employeeNumber}`)
}
</script>

<template>
  <div class="p-6">
    <!-- PAGE HEADER -->
    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold">Employees</h1>
        <p class="text-sm text-base-content/60">
          Manage and view employee records.
        </p>
      </div>

      <NuxtLink
        to="/employees/add"
        class="btn btn-primary"
      >
        + Add Employee
      </NuxtLink>
    </div>

    <!-- EMPLOYEES TABLE -->
    <div class="card bg-base-100 shadow-md">
      <div class="card-body p-0">
        <div v-if="employees.length > 0" class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Employee Number</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Employee Type</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="employee in employees"
                :key="employee.employeeNumber"
                class="cursor-pointer hover"
                tabindex="0"
                role="link"
                @click="openEmployee(employee.employeeNumber)"
                @keydown.enter="openEmployee(employee.employeeNumber)"
              >
                <td>{{ employee.employeeNumber }}</td>
                <td class="font-medium">{{ employee.firstName }} {{ employee.lastName }}</td>
                <td>{{ employee.email }}</td>
                <td>{{ employee.employeeType }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <h2 class="text-lg font-semibold">No Employees Found</h2>
          <p class="mt-1 text-sm text-base-content/60">
            There are currently no employee records to display.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
