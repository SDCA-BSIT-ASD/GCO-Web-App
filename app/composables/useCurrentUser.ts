export function useCurrentUser() {
  const { data, refresh } = useFetch('/api/auth/session')
  const currentUser = computed(() => data.value?.user ?? null)
  return { currentUser, refresh }
}
