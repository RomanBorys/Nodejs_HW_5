import { Router } from 'express'
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcements.controller.js'

import {
  createAnnouncementValidator,
  updateAnnouncementValidator,
  idValidator,
} from '../validators/announcements.validator.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements
 *     description: Returns list with pagination, search and sorting
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */

router.get('/', getAnnouncements)

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Get announcement by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Found
 *       404:
 *         description: Not found
 */

router.get('/:id', idValidator, getAnnouncementById)

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create announcement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - contactInfo
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */

router.post(
  '/',
  authenticate,
  createAnnouncementValidator,
  createAnnouncement
)


/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update announcement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */

router.patch(
  '/:id',
  authenticate,
  idValidator,
  updateAnnouncementValidator,
  updateAnnouncement
)


/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete announcement
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 */

router.delete(
  '/:id',
  authenticate,
  idValidator,
  deleteAnnouncement
)

export default router

