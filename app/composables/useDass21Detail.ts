import type { Dass21DetailViewModel } from '#shared/types/Dass21Detail'
import { mockDass21Detail } from '~/data/dass21-detail.fixture'

export function useDass21Detail(_submissionId: string) {
  const data = ref<Dass21DetailViewModel | null>(mockDass21Detail)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  return {
    data,
    pending,
    error
  }
}
