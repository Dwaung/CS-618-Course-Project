import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

function createToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.'
      })
    }

    if (username.trim().length < 3 || password.length < 8) {
      return res.status(400).json({
        message: 'Username must have at least 3 characters and password at least 8.'
      })
    }

    const existing = await User.findOne({
      username: username.trim()
    })

    if (existing) {
      return res.status(409).json({
        message: 'Username already exists.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      username: username.trim(),
      password: hashedPassword
    })

    const token = createToken(user._id.toString())

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      message: 'Unable to create account.'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required.'
      })
    }

    const user = await User.findOne({
      username: username.trim()
    }).select('+password')

    if (!user) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      })
    }

    const token = createToken(user._id.toString())

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Unable to log in.'
    })
  }
})

export default router
