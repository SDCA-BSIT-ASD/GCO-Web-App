import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, afterEach } from 'vitest'
import NewStudentPage from './new.vue'

describe('Add Student form page', () => {
  // test 1: the form must show every required field and both buttons
  it('renders all required fields and action buttons', () => {
    const wrapper = mount(NewStudentPage)

    for (const id of [
      '#first-name', '#last-name', '#email-address', '#student-number',
      '#program', '#year-level', '#status'
    ]) {
      expect(wrapper.find(id).exists()).toBe(true)
    }
    expect(wrapper.get('button[type="submit"]').text()).toBe('Add Student')
    expect(wrapper.get('button[type="button"]').text()).toBe('Cancel')
  })

  // test 2: form must not ask for a password
  it('does not render a password field', () => {
    const wrapper = mount(NewStudentPage)

    expect(wrapper.find('input[type="password"]').exists()).toBe(false)
  })

})