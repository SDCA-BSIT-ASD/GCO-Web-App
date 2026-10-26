<template>
  <div class="bg-base-200 min-h-[calc(100vh-4rem)] p-6">
    <div class="mx-auto max-w-3xl rounded-box bg-base-100 p-6 shadow">
      <div v-if="currentUser" class="space-y-4">
        <div>
          <p class="text-sm uppercase tracking-wide text-base-content/60">Signed in as</p>
          <h1 class="text-2xl font-bold">{{ currentUser.firstName }} {{ currentUser.lastName }}</h1>
        </div>
        <div class="rounded-box bg-base-200 p-4">
          <p><strong>Email:</strong> {{ currentUser.emailAddress }}</p>
        </div>
      </div>
      <div v-else class="text-center">
        <p class="text-lg">You are not signed in.</p>
        <NuxtLink to="/login" class="btn btn-primary mt-4">Go to sign in</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  const { currentUser } = useCurrentUser()
</script>