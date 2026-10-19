import { connectToMongoDB } from '../utils/mongodb'

async function checkHealth() {
  try {
    await connectToMongoDB()
    return { status: 'ok' }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    return { status: 'error', message: 'An error has occurred in the server.' }
  }
}

export default defineEventHandler(checkHealth)