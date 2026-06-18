import { celebrate, Segments, Joi } from 'celebrate'

export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().greater(0).required(),
    category: Joi.string()
      .valid('sale', 'service', 'job', 'other')
      .required(),
    contactInfo: Joi.string().min(5).required(),
  }),
})

export const updateAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object()
    .min(1)
    .keys({
      title: Joi.string().min(5).max(100),
      description: Joi.string().min(10),
      price: Joi.number().positive(),
      category: Joi.string().valid('sale', 'service', 'job', 'other'),
      contactInfo: Joi.string().min(5),
    }),
})

export const idValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().required(),
  }),
})