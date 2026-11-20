<template>
  <div class="px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">Employees</h1>
      </div>

      <NuxtLink to="/employees/new" class="btn btn-primary">
        Add Employee
      </NuxtLink>
    </div>
  </div>
</template>