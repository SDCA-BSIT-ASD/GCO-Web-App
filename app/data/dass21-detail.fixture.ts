import type { Dass21DetailViewModel } from '#shared/types/Dass21Detail'

export const dass21ResponseLabels = [
  'Did not apply to me at all',
  'Applied to me to some degree, or some of the time',
  'Applied to me to a considerable degree, or a good part of time',
  'Applied to me very much, or most of the time'
] as const

const statements = [
  'I found it hard to wind down',
  'I was aware of dryness of my mouth',
  'I could not seem to experience any positive feeling at all',
  'I experienced breathing difficulty (e.g. excessively rapid breathing, breathlessness in the absence of physical exertion)',
  'I found it difficult to work up the initiative to do things',
  'I tended to over-react to situations',
  'I experienced trembling (e.g. in the hands)',
  'I felt that I was using a lot of nervous energy',
  'I was worried about situations in which I might panic and make a fool of myself',
  'I felt that I had nothing to look forward to',
  'I found myself getting agitated',
  'I found it difficult to relax',
  'I felt down-hearted and blue',
  'I was intolerant of anything that kept me from getting on with what I was doing',
  'I felt I was close to panic',
  'I was unable to become enthusiastic about anything',
  'I felt I was not worth much as a person',
  'I felt that I was rather touchy',
  'I was aware of the action of my heart in the absence of physical exertion',
  'I felt scared without any good reason',
  'I felt that life was meaningless'
]

const selectedValues = [2, 1, 3, 2, 2, 2, 1, 2, 2, 2, 2, 3, 2, 2, 1, 2, 1, 2, 1, 2, 2]

export const mockDass21Detail: Dass21DetailViewModel = {
  id: 'mock-dass-21-submission',
  submittedAt: '2026-11-06T09:30:00.000Z',
  student: {
    name: 'Jordan Dela Cruz',
    studentNumber: '2024-00123',
    program: 'Bachelor of Science in Information Technology',
    yearLevel: 3
  },
  answers: statements.map((statement, index) => {
    const selectedValue = selectedValues[index]

    return {
      itemNumber: index + 1,
      statement,
      selectedValue,
      selectedLabel: dass21ResponseLabels[selectedValue]
    }
  }),
  subscales: [
    { name: 'Depression', rawScore: 13, finalScore: 26, severity: 'Severe' },
    { name: 'Anxiety', rawScore: 10, finalScore: 20, severity: 'Extremely Severe' },
    { name: 'Stress', rawScore: 15, finalScore: 30, severity: 'Severe' }
  ],
  flaggedSubscales: ['Depression', 'Anxiety', 'Stress']
}
