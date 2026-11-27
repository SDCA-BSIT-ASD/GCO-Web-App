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

    // test 3: status dropdown must contain Regular and Irregular
  it('offers Regular and Irregular as status options', () => {
    const wrapper = mount(NewStudentPage)
    const options = wrapper.findAll('#status option').map(o => o.text())

    expect(options).toEqual(expect.arrayContaining(['Regular', 'Irregular']))
  })

  // test 4: year level must show 1-5
  it('offers year levels 1 to 5', () => {
    const wrapper = mount(NewStudentPage)
    const values = wrapper.findAll('#year-level option')
      .map(o => o.attributes('value'))
      .filter(Boolean)

    expect(values).toEqual(['1', '2', '3', '4', '5'])
  })

  // test 5: submitting an empty form shows a reuired error and a red border on every field
  it('shows a required error under every field when submitting an empty form', async () => {
    const wrapper = mount(NewStudentPage)

    await wrapper.get('form').trigger('submit')

    const errors = wrapper.findAll('p.text-error')
    expect(errors).toHaveLength(7)
    for (const error of errors) {
      expect(error.text()).toBe('This field is required.')
    }
    expect(wrapper.get('#first-name').classes()).toContain('input-error')
  })

    // test 6: leaving a field empty will trigger an inline error validation message
  it('shows an inline error when a required field loses focus empty', async () => {
    const wrapper = mount(NewStudentPage)

    await wrapper.get('#first-name').trigger('blur')

    expect(wrapper.text()).toContain('This field is required.')
  })

  // test 7: non-sdca emails are rejected 
  it('shows a domain error for a non-SDCA email', async () => {
    const wrapper = mount(NewStudentPage)

    await wrapper.get('#email-address').setValue('juan@gmail.com')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Please enter a valid @sdca.edu.ph email address.')
    expect(wrapper.get('#email-address').classes()).toContain('input-error')
  })

})