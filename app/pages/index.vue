<template>
  <main class="min-h-screen bg-base-200 p-6">
    <div class="mx-auto max-w-3xl rounded-box bg-base-100 p-6 shadow">
      <div v-if="currentUser" class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm uppercase tracking-wide text-base-content/60">Signed in as</p>
            <h1 class="text-2xl font-bold">{{ currentUser.firstName }} {{ currentUser.lastName }}</h1>
          </div>
          <button class="btn btn-outline btn-error" @click="signOut">Sign Out</button>
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
  </main>
</template>

<script setup lang="ts">
  const { data, refresh } = await useFetch('/api/auth/session')

  const currentUser = computed(() => data.value?.user ?? null)

  async function signOut() {
    await $fetch('/api/auth/logout', {
      method: 'POST'
    })

    await refresh()
    await navigateTo('/login')
  }
</script>