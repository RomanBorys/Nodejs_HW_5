import { Router } from 'express'
import {
  register,
  login,
  refresh,
  logout,
  me,
} from '../controllers/auth.controller.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Creates a new user and returns tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *                 example: test_user
 *               password:
 *                 type: string
 *                 example: 123456
 *               name:
 *                 type: string
 *                 example: John
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: User already exists
 */
router.post('/register', register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user and returns tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh tokens
 *     description: Returns new access + refresh tokens
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', refresh)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Removes refresh token and clears cookie
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, logout)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, me)

export default router