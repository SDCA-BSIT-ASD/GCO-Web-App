    import { z } from 'zod'
    import { AcademicProgramModel } from '../models/AcademicProgram'
    import { EmployeeModel } from '../models/Employee'


    const createEmployeeSchema = z.object({
      firstName: z.string().trim().min(1, 'First name is required'),

      lastName: z.string().trim().min(1, 'Last name is required'),

      emailAddress: z.string()
        .trim()
        .toLowerCase()
        .email('Invalid email format')
        .refine((email) => email.endsWith('@sdca.edu.ph'), {
          message: 'Email must use the @sdca.edu.ph domain'
        }),

      employeeNumber: z.string()
        .trim()
        .min(1, 'Employee number is required'),

      type: z.enum(['Faculty', 'Counselor', 'ICT Personnel']),

      department: z.string().trim().min(1).nullable(),

      isAdmin: z.boolean().default(false)
    })
    .superRefine((data, ctx) => {
      if (data.type === 'Faculty' && !data.department) {
        ctx.addIssue({
          code: 'custom',
          path: ['department'],
          message: 'Primary program assignment is required for Faculty'
        })
      }

      if (data.type !== 'Faculty' && data.department !== null) {
        ctx.addIssue({
          code: 'custom',
          path: ['department'],
          message: 'Department must be null for non-Faculty employees'
        })
      }

      if (data.type !== 'ICT Personnel' && data.isAdmin) {
        ctx.addIssue({
          code: 'custom',
          path: ['isAdmin'],
          message: 'Admin privileges are only allowed for ICT Personnel'
        })
      }
    })

    export default defineEventHandler(async (event) => {
      const body = await readBody(event)
      const parseResult = createEmployeeSchema.safeParse(body)

      if (!parseResult.success) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation Error',
          data: parseResult.error.flatten().fieldErrors
        })
      }

      const data = parseResult.data

      const existingEmployee = await EmployeeModel.findOne({
        $or: [
          { emailAddress: data.emailAddress } as any,
          { employeeNumber: data.employeeNumber } as any
        ]
      })

      if (existingEmployee) {
        const isEmailDup = (existingEmployee as any).emailAddress === data.emailAddress
        throw createError({
          statusCode: 409,
          statusMessage: isEmailDup
            ? 'An employee record with this email address already exists.'
            : 'An employee record with this employee number already exists.',
        })
      }


      const newEmployee = await EmployeeModel.create({
        firstName: data.firstName,
        lastName: data.lastName,
        emailAddress: data.emailAddress,
        employeeNumber: data.employeeNumber,
        type: data.type,
        department: data.type === 'Faculty' && data.department ? data.department : 'N/A',
        isAdmin: data.type === 'ICT Personnel' ? data.isAdmin : false,
      } as any)

   setResponseStatus(event, 201)

    return {
      success: true,
      message: 'Employee added successfully.'
    }
  })
    