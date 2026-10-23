import type { SchemaDefinition } from 'mongoose'
import { Schema } from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose'

import type { FlaggedResponse } from '#shared/types/FlaggedResponse'

const flaggedResponseSchema: SchemaDefinition<FlaggedResponse> = {
  responseId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentResponse',
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true
  },
  resolvedAt: {
    type: Date
  }
}

export const FlaggedResponseModel = defineMongooseModel<FlaggedResponse>({
  name: 'FlaggedResponse',
  schema: flaggedResponseSchema,
  options: {
    collection: 'flagged_responses',
    timestamps: true
  }
})