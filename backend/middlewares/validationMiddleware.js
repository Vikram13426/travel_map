import Joi from 'joi';

export const registerValidation = (data) => {
    const schema = Joi.object({
        userName: Joi.string()
            .min(3)
            .max(20)
            .required(),
        email: Joi.string()
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required(),
    });

    return schema.validate(data);
};

export const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required(),
    });

    return schema.validate(data);
};