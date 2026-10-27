<template>
  <div class="navbar bg-base-100 shadow-md">
    <!-- Left: Logo & Title -->
    <div class="navbar-start">
      <!-- Hamburger (Mobile Only) -->
      <label for="app-drawer" class="btn btn-ghost btn-square lg:hidden drawer-button">
        <Menu class="h-5 w-5"/>
      </label>
      <NuxtLink to="/" class="flex items-center gap-2 px-2">
        <img src="~/assets/logos/sdca-logo.png" alt="SDCA Logo" class="h-8 w-8 object-contain"/>
        <span class="whitespace-nowrap text-lg font-bold">SDCA-GCO</span>
      </NuxtLink>
    </div>
    <!-- Center: Nav links (Desktop Only) -->
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to" class="btn btn-ghost btn-sm">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </div>
    <!-- Right: User Info & Dropdown -->
    <div class="navbar-end gap-2">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="flex cursor-pointer items-center gap-2 mr-2">
          <span class="hidden text-sm font-medium lg:inline mr-1">
            {{ currentUser?.firstName }} {{ currentUser?.lastName }}
          </span>
          <div class="avatar placeholder">
            <div class="bg-gray-600 text-white w-9 rounded-full flex items-center justify-center px-2">
              <UserRound class="h-4 w-4"/>
            </div>
          </div>
        </div>
        <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 mt-3 w-48 p-2 shadow-lg">
          <li>
            <button class="text-error" @click="signOut">
              <LogOut class="h-4 w-4"/>
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { UserRound, LogOut, Menu } from 'lucide-vue-next'

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