import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { errors as celebrateErrors } from 'celebrate'

import announcementsRouter from './src/routes/announcements.routes.js'
import cookieParser from 'cookie-parser'
import authRouter from './src/routes/auth.routes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())
// Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },

  definition: {
  openapi: '3.0.0',
  info: {
    title: 'REST API',
    version: '1.0.0',
    description: 'REST API documentation',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
},

  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// routes
app.use('/announcements', announcementsRouter)
app.use('/auth', authRouter)

app.use(celebrateErrors())

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// error handler
app.use((err, req, res, next) => {
  console.error(err)

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid JSON',
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' })
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation' })
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Foreign key constraint failed' })
  }

  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`API docs: http://localhost:${PORT}/api-docs`)
})