import { defineEventHandler, setResponseStatus } from 'h3'

import { EmployeeModel } from '../../models/Employee'
import { StudentResponseModel } from '../../models/StudentResponse'
import { UserModel } from '../../models/User'
import { getSessionUser } from '../../utils/auth'
import { getPhq9AccessError } from '../../utils/phq9-access'
import { toPhq9EntryRow } from '../../utils/phq9-entries'

export default defineEventHandler(async (event) => {
  const sessionUser = getSessionUser(event)

  const employee = sessionUser?.emailAddress
    ? await EmployeeModel.findOne({ emailAddress: sessionUser.emailAddress }).lean()
    : null

  const accessError = getPhq9AccessError(sessionUser, employee)
  if (accessError) {
    setResponseStatus(event, accessError.status)
    return { success: false, message: accessError.message }
  }
  
  const responses = await StudentResponseModel.aggregate([
    // CHECK: 'PHQ-9' must match the assessmentType saved by the student submit feature
    { $match: { assessmentType: 'PHQ-9' } },
    { $sort: { submittedAt: -1 } },
    {
      $lookup: {
        from: UserModel.collection.name,
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $project: {
        submittedAt: 1,
        overallSeverity: 1,
        answers: 1, // only used to compute "flagged"; not returned
        'student.firstName': 1,
        'student.lastName': 1,
        'student.studentNumber': 1
      }
    }
  ])

  return {
    success: true,
    data: responses.map(toPhq9EntryRow)
  }
})                                         