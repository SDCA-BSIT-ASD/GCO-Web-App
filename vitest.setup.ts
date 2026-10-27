import { ref } from 'vue'

Object.defineProperty(globalThis, 'ref', {
  value: ref,
  writable: true,
  configurable: true
})
