
<script setup lang="ts">
useHead({
  title: 'Employees | SDCA-GCO',
})

// EMPLOYEE DATA STRUCTURE
interface Employee {
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  employeeType: string
}

// MOCK EMPLOYEE DATA
const mockEmployees: Employee[] = [
  {
    employeeNumber: 'EMP-001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    employeeType: 'Regular',
  },
  {
    employeeNumber: 'EMP-002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'janesmith@example.com',
    employeeType: 'Part-Time',
  },
  {
    employeeNumber: 'EMP-003',
    firstName: 'Michael',
    lastName: 'Reyes',
    email: 'michaelreyes@example.com',
    employeeType: 'Regular',
  },
]

// EMPLOYEE RECORDS
const employees = ref<Employee[]>([])

// LOADING STATE
const isLoading = ref(true)

// ERROR STATE
const errorMessage = ref('')

// SIMULATE FETCHING EMPLOYEES
onMounted(() => {
  setTimeout(() => {
    employees.value = mockEmployees
    isLoading.value = false
  }, 1500)
})

// NAVIGATE TO EMPLOYEE DETAIL PAGE
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
     
      <!--LINKS TO ADD EMPLOYEE PAGE BUT NOT YET CONNECTED-->
      <NuxtLink 
        to="/employees/add"
        class="btn btn-primary"
      >
        + Add Employee 
      </NuxtLink>
    </div>

    <div v-if="isLoading">
      Loading employees list...
    </div>

    <div v-else-if="errorMessage">
      {{ errorMessage }}
      
    </div>

    <div v-else>
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
  </div>
</template>
