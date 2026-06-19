import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../../prisma/client.js'

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export const register = async (req, res) => {
  const { username, password, name } = req.body

  const existing = await prisma.user.findUnique({
    where: { username },
  })

  if (existing) {
    return res.status(409).json({
      error: 'User with this username already exists',
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  })

  const tokens = generateTokens(user)

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
    },
  })

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: false,
  })

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    ...tokens,
  })
}

export const login = async (req, res) => {
  const { username, password } = req.body

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const tokens = generateTokens(user)

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  })

  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
    },
  })

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: false,
  })

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
    ...tokens,
  })
}

export const refresh = async (req, res) => {
  const tokenFromCookie = req.cookies?.refreshToken
  const tokenFromBody = req.body?.refreshToken

  const refreshToken = tokenFromCookie || tokenFromBody

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' })
  }

  let payload

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  })

  if (!storedToken) {
    return res.status(401).json({ error: 'Refresh token not found' })
  }

  await prisma.refreshToken.delete({
    where: { token: refreshToken },
  })

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  })

  const accessToken = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const newRefreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
    },
  })

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: false,
  })

  res.json({
    accessToken,
    refreshToken: newRefreshToken,
  })
}

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token },
    })
  }

  res.clearCookie('refreshToken')

  res.json({ message: 'Logged out successfully' })
}

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
    },
  })

  res.json(user)
}