import mongoose from 'mongoose'

let connection: Promise<typeof mongoose> | undefined

export function connectToMongoDB() {
  const config = useRuntimeConfig()

  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is not configured.')
  }

  if (!connection) {
    connection = mongoose.connect(config.mongodbUri).catch((error) => {
      connection = undefined
      throw error
    })
  }

  return connection
}