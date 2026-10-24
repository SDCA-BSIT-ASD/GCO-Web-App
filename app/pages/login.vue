<template>
  <main class="min-h-screen flex items-center justify-center bg-base-200 p-6">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body space-y-4">
        <div class="text-center">
          <h1 class="text-2xl font-bold">Sign In</h1>
          <p class="text-sm text-base-content/70">Use your school Google account.</p>
        </div>
        <div v-if="authError" class="alert alert-error text-sm">
          {{ authError }}
        </div>
        <button class="btn btn-primary" @click="handleGoogleSignIn">
          Continue with Google
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  const route = useRoute()

  const authError = computed(() => {
    const error = String(route.query.error || '')

    if (error === 'domain-not-allowed') {
      return 'Only accounts from an approved school domain can sign in.'
    }

    if (error === 'missing-email') {
      return 'Google did not return an email address for this account.'
    }

    if (error === 'google-oauth-error') {
      return 'Google authentication failed. Please try again.'
    }

    return ''
  })

  function handleGoogleSignIn() {
    window.location.href = '/api/auth/google'
  }
</script>