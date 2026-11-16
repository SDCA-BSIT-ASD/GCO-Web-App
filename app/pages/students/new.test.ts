// frontent mock unit tests 

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, afterEach } from 'vitest'

// file to be created by frontend
import NewStudentPage from './new.vue'

const programName = 'Bachelor of Science in Information Technology'

// helper function to fill fields with valid data for tests 
// ids are assumed as of now
async function fillValidForm(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('#first-name').setValue('Juan')
  await wrapper.get('#last-name').setValue('Dela Cruz')
  await wrapper.get('#email-address').setValue('juan.delacruz@sdca.edu.ph')
  await wrapper.get('#student-number').setValue('202400123')  
  await wrapper.get('#program-name').setValue(programName)
  await wrapper.get('#year-level').setValue('2')
  await wrapper.get('#status').setValue('Regular')
}

describe('Add Student form page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // test 1: the form must show every required field and both buttons
  it('renders all required fields and action buttons', () => {
    const wrapper = mount(NewStudentPage)

    for (const id of [
      '#first-name', '#last-name', '#email-address', '#student-number',
      '#program-name', '#year-level', '#status'
    ]) {
      expect(wrapper.find(id).exists()).toBe(true)
    }
    expect(wrapper.get('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.get('button[type="button"]').text()).toBe('Cancel')
  })

  // test 2: form must not ask for a password
  it('does not render a password field', () => {
    const wrapper = mount(NewStudentPage)

    expect(wrapper.find('input[type="password"]').exists()).toBe(false)
  })


  
})