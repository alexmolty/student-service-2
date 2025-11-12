import Joi from "joi";

export const studentSchema = Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
        password: Joi.string().required()
    }
)

export const updateSchema = Joi.object({
    name: Joi.string(),
    password: Joi.string()
})

export const scoreSchema = Joi.object({
    examName: Joi.string().required(),
    score: Joi.number().min(0).max(100).required()
})