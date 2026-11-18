
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import userRoutes from './routes/users.js'
import recipeRoutes from './routes/recipes.js'

dotenv.config()

const app = express()

app.use(cors({ origin: true }))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Recipe Share API is running!' })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected'
  })
})

app.use('/api/users', userRoutes)
app.use('/api/recipes', recipeRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    await mongoose.connect(process.env.DATABASE_URL)
    console.log('MongoDB connected')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }
}

startServer()
