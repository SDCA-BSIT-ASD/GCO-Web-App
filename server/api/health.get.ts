import mongoose from 'mongoose'

async function checkHealth() {
  const isConnected = mongoose.connection.readyState === 1

  return {
    status: isConnected ? 'Okay' : 'Degraded',
    message: isConnected ? 'MongoDB connected.' : 'MongoDB not connected yet.'
  }
}

export default defineEventHandler(checkHealth)