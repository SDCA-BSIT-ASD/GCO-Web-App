import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import StudentDetailsPage from './[studentNumber].vue'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Student details placeholder page', () => {
  it('displays the student number, placeholder message, and link back to the list', () => {
    vi.stubGlobal('useRoute', () => ({ params: { studentNumber: '202600901' } }))
    const wrapper = mount(StudentDetailsPage, {
      global: {
        stubs: {
          NuxtLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('Student details are not available yet.')
    expect(wrapper.text()).toContain('Student Number: 202600901')
    expect(wrapper.get('a').attributes('href')).toBe('/students')
  })
})
