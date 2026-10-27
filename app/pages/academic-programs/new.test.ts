import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NewAcademicProgramPage from './new.vue'

describe('Academic program form page', () => {
  it('renders the required fields and action buttons', () => {
    const wrapper = mount(NewAcademicProgramPage)

    expect(wrapper.get('h2').text()).toBe('Add Academic Program')
    expect(wrapper.find('#program-code').element).toBeTruthy()
    expect(wrapper.find('#program-name').element).toBeTruthy()
    expect(wrapper.get('button[type="submit"]').text()).toContain('Add Program')
    expect(wrapper.get('button[type="button"]').text()).toBe('Cancel')
  })

  it('shows inline validation errors when required fields are empty', async () => {
    const wrapper = mount(NewAcademicProgramPage)

    await wrapper.get('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Program code is required.')
    expect(wrapper.text()).toContain('Program name is required.')
  })

  it('formats the program code to uppercase and strips invalid characters while typing', async () => {
    const wrapper = mount(NewAcademicProgramPage)
    const input = wrapper.get('#program-code')

    await input.setValue('bsit-2026!')

    expect((input.element as HTMLInputElement).value).toBe('BSIT2026')
  })
})
