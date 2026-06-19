import prisma from '../../prisma/client.js'
import logger from '../logger.js'
import cloudinary from '../lib/cloudinary.js'
import fs from 'fs-extra'
import logger from '../logger.js'

export const getAnnouncements = async (req, res) => {
  const { search = '', sort = 'newest', page = 1 } = req.query

  const perPage = 10
  const skip = (Number(page) - 1) * perPage

  const where = search
    ? {
        title: {
          contains: search,
        },
      }
    : {}

  const orderBy =
    sort === 'oldest'
      ? { createdAt: 'asc' }
      : { createdAt: 'desc' }

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
    }),
    prisma.announcement.count({ where }),
  ])

  res.json({
    data,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  })
}

export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id)

  const item = await prisma.announcement.findUniqueOrThrow({
    where: { id },
  })

  res.json(item)
}

export const createAnnouncement = async (req, res) => {
  let imageUrl = null

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'announcements',
    })

    imageUrl = result.secure_url

    await fs.remove(req.file.path)

    logger.info(
      {
        file: result.secure_url,
        userId: req.user.id,
      },
      'Image uploaded'
    )
  }

  const data = await prisma.announcement.create({
    data: {
      ...req.body,
      price: Number(req.body.price),
      userId: req.user.id,
      imageUrl,
    },
  })

  logger.info(
    {
      announcementId: data.id,
      userId: data.userId,
    },
    'Announcement created'
  )

  res.status(201).json(data)
}

export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id)

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  })

  if (!announcement) {
    return res.status(404).json({ error: 'Not found' })
  }

  if (announcement.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: req.body,
  })

  res.json(updated)
}

export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id)

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  })

  if (!announcement) {
    return res.status(404).json({ error: 'Not found' })
  }

  if (announcement.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' })
  }

  await prisma.announcement.delete({
    where: { id },
  })

  res.status(204).end()
}