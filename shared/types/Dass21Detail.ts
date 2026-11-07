export type Dass21Severity = 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Extremely Severe'

export type Dass21SubscaleName = 'Depression' | 'Anxiety' | 'Stress'

export interface Dass21Answer {
  itemNumber: number
  statement: string
  selectedValue: number
  selectedLabel: string
}

export interface Dass21SubscaleResult {
  name: Dass21SubscaleName
  rawScore: number
  finalScore: number
  severity: Dass21Severity
}

export interface Dass21DetailViewModel {
  id: string
  submittedAt: string
  student: {
    name: string
    studentNumber: string
    program: string
    yearLevel: number
  }
  answers: Dass21Answer[]
  subscales: Dass21SubscaleResult[]
  flaggedSubscales: Dass21SubscaleName[]
}
