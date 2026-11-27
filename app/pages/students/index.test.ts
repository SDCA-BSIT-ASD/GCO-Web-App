import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import StudentListPage from './index.vue'

const student = {
  studentNumber: '202600901',
  firstName: 'Avery',
  lastName: 'Santos',
  emailAddress: 'avery.santos@sdca.edu.ph',
  programName: 'Bachelor of Science in Information Technology',
  yearLevel: 2,
  status: 'Regular'
}

function mockStudentsFetch({
  data = null,
  pending = false,
  error = null,
  query = {}
}: {
  data?: { success: boolean; data: typeof student[]; message?: string } | null
  pending?: boolean
  error?: unknown
  query?: Record<string, string>
} = {}) {
  const fetchMock = vi.fn().mockReturnValue({
    data: ref(data),
    pending: ref(pending),
    error: ref(error)
  })
  vi.stubGlobal('useFetch', fetchMock)
  vi.stubGlobal('useRoute', () => ({ query }))
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Students list page', () => {
  it('fetches students from the agreed endpoint and shows a loading state', () => {
    const fetchMock = mockStudentsFetch({ pending: true })
    const wrapper = mount(StudentListPage)

    expect(fetchMock).toHaveBeenCalledWith('/api/students', { server: false, immediate: true })
    expect(wrapper.get('[role="status"]').text()).toBe('Loading student records...')
  })

  it('shows the table headers and an empty row when the API returns no students', () => {
    mockStudentsFetch({ data: { success: true, data: [] } })
    const wrapper = mount(StudentListPage)

    expect(wrapper.findAll('thead th')).toHaveLength(6)
    expect(wrapper.get('tbody td').text()).toBe('No student records found.')
    expect(wrapper.get('tbody td').attributes('colspan')).toBe('6')
  })

  it('renders the agreed student columns and records without management controls', () => {
    mockStudentsFetch({ data: { success: true, data: [student] } })
    const wrapper = mount(StudentListPage, {
      global: {
        stubs: {
          NuxtLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.findAll('thead th').map((header) => header.text())).toEqual([
      'Student Number',
      'Full Name',
      'Email Address',
      'Program',
      'Year Level',
      'Status'
    ])
    expect(wrapper.findAll('tbody td').map((cell) => cell.text())).toEqual([
      student.studentNumber,
      'Avery Santos',
      student.emailAddress,
      student.programName,
      '2',
      student.status
    ])
    expect(wrapper.text()).not.toContain('Add Student')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })

  it('navigates to student details when a row is clicked', async () => {
    mockStudentsFetch({ data: { success: true, data: [student] } })
    const navigateTo = vi.fn()
    vi.stubGlobal('navigateTo', navigateTo)
    const wrapper = mount(StudentListPage, {
      global: {
        stubs: {
          NuxtLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>'
          }
        }
      }
    })

    await wrapper.get('tbody tr').trigger('click')

    expect(navigateTo).toHaveBeenCalledWith('/students/202600901')
    expect(wrapper.get('tbody a').attributes('href')).toBe('/students/202600901')
  })

  it('renders labeled sample data in development preview mode without fetching', () => {
    const fetchMock = mockStudentsFetch({ query: { preview: 'students' } })
    const wrapper = mount(StudentListPage)

    expect(fetchMock).toHaveBeenCalledWith('/api/students', { server: false, immediate: false })
    expect(wrapper.get('[role="note"]').text()).toContain('sample data only')
    expect(wrapper.text()).toContain('Avery Santos')
    expect(wrapper.text()).toContain('avery.santos@example.test')
  })

  it('shows the API error message when loading fails', () => {
    mockStudentsFetch({ error: { data: { message: 'Counselor access required.' } } })
    const wrapper = mount(StudentListPage)

    expect(wrapper.get('[role="alert"]').text()).toBe('Counselor access required.')
  })

  it('shows the response message when the API reports an unsuccessful response', () => {
    mockStudentsFetch({
      data: {
        success: false,
        data: [],
        message: 'Authentication required.'
      }
    })
    const wrapper = mount(StudentListPage)

    expect(wrapper.get('[role="alert"]').text()).toBe('Authentication required.')
  })
})
