<template>
  <div class="drawer-side z-50">
    <!-- Overlay (To Close Drawer) -->
    <label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <aside class="bg-base-100 flex min-h-screen w-[85vw] flex-col p-4 shadow-xl">
      <!-- Logo & Title -->
      <NuxtLink to="/" class="mb-6 flex items-center gap-3 px-2">
        <img src="~/assets/logos/sdca-logo.png" alt="SDCA Logo" class="h-9 w-9 object-contain"/>
        <span class="whitespace-nowrap text-xl font-bold">SDCA-GCO</span>
      </NuxtLink>
      <!-- User Info -->
      <div class="mb-4 flex items-center gap-3 rounded-box bg-base-200 p-3">
        <div class="avatar placeholder">
          <div class="w-10 rounded-full flex items-center justify-center px-2">
            <UserRound class="h-5 w-5"/>
          </div>
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
          <p class="text-base-content/60 truncate text-xs">{{ currentUser?.emailAddress }}</p>
        </div>
      </div>
      <!-- Nav Links -->
      <ul class="menu w-full flex-1">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        </li>
      </ul>
      <!-- Sign Out -->
      <button class="btn btn-outline btn-error btn-sm w-full" @click="signOut">
        <LogOut class="h-4 w-4"/>
        Sign Out
      </button>
    </aside>
  </div>
</template>

<script setup lang="ts">
  import { UserRound, LogOut } from 'lucide-vue-next'

  const { currentUser } = useCurrentUser()

  const navLinks = [
    { label: 'Dashboard', to: '/' },
    { label: 'Academic Terms', to: '/academic-terms' },
    { label: 'Reports', to: '/reports' },
  ]

  async function signOut() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  }

</script>
