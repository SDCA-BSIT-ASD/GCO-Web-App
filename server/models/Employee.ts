import type { SchemaDefinition } from 'mongoose'
import { defineMongooseDiscriminatorModel } from '#nuxt/mongoose'

import type { Employee } from '#shared/types/User'
import { UserModel } from './User'

const employeeSchema: SchemaDefinition<Employee> = {
  type: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}

export const EmployeeModel = defineMongooseDiscriminatorModel({
  name: 'Employee',
  baseModel: UserModel,
  schema: employeeSchema
})