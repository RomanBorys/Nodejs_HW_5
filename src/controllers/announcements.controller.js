import prisma from '../../prisma/client.js'
// GET ALL
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

// GET BY ID
export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id)

  const item = await prisma.announcement.findUniqueOrThrow({
    where: { id },
  })

  res.json(item)
}

// CREATE
export const createAnnouncement = async (req, res) => {
  console.log("BODY:", req.body)

  const data = await prisma.announcement.create({
    data: req.body,
  })

  res.status(201).json(data)
}

// PATCH
export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id)

  const updated = await prisma.announcement.update({
    where: { id },
    data: req.body,
  })

  res.json(updated)
}

// DELETE
export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id)

  await prisma.announcement.delete({
    where: { id },
  })

  res.status(204).end()
}

