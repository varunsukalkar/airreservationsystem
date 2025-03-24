const Joi = require('joi').extend(require('@joi/date'));

const StaffRegInfo = Joi.object(
).options({ abortEarly: false }).keys({
    empId: Joi.string().trim().required().label('Employee Id')
        .length(6, 'utf8')
        .message('"Employee Id" must be of format Bxxxxx')
        .regex(/^[B][0-9]{5}$/)
        .message('Employee ID must be in B99999 format'),
    category: Joi.string().required().valid('admin', 'manager', 'general').label('Employee Type'),
    password: Joi.string().trim().min(5).max(20)
        .required()
        .label('Password'),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).label('Confirmation Password')
        .messages({ 'any.only': '{{#label}} does not match "Password"' }),
    firstName: Joi.string().trim().min(2).max(30)
        .required()
        .label('First Name'),
    lastName: Joi.string().trim().min(2).max(30)
        .required()
        .label('Last Name'),
    contactNo: Joi.string().trim().required()
        .min(10)
        .message('"Contact Number" must be at least 10 digits')
        .max(15)
        .message('"Contact Number" must be less than 15 digits')
        .regex(/^\d+$/)
        .message('"Contact Number" contains invalid characters'),
    email: Joi.string().trim().email().required()
        .label('E-mail'),
    dob: Joi.date().format('YYYY-MM-DD').utc().label('Date of Birth'),
    gender: Joi.string().required().valid('Male', 'Female', 'Other').label('Gender'),
    country: Joi.string().trim().min(2).max(30)
        .required(),
    securityKey: Joi.string().allow(''),
    airport: Joi.string().allow(''),
});

const StaffLoginInfo = Joi.object().keys({
    empId: Joi.string().trim().required()
        .label('Employee ID'),
    password: Joi.string().trim().required(),
});

const staffEditInfo = Joi.object(
).options({ abortEarly: false }).keys({
    firstName: Joi.string().trim().min(2).max(30)
        .required()
        .label('First Name'),
    lastName: Joi.string().trim().min(2).max(30)
        .required()
        .label('Last Name'),
    contactNo: Joi.string().trim().required()
        .min(10)
        .message('"Contact Number" must be at least 10 digits')
        .max(15)
        .message('"Contact Number" must be less than 15 digits')
        .regex(/^\d+$/)
        .message('"Contact Number" contains invalid characters'),
    email: Joi.string().trim().email().required()
        .label('E-mail'),
    country: Joi.string().trim().min(2).max(30)
        .required(),
});

const ChangePasswordInfo = Joi.object().options({ abortEarly: false }).keys({
    old_pwd: Joi.string().trim().required().label('Old Password'),
    new_pwd: Joi.string().trim().min(5).max(20)
        .required()
        .label('Password'),
    confirm_pwd: Joi.string().trim().required().valid(Joi.ref('new_pwd'))
        .label('Confirmation Password')
        .messages({ 'any.only': '{{#label}} does not match "New Password"' }),
});

module.exports = {
    StaffRegInfo, StaffLoginInfo, staffEditInfo, ChangePasswordInfo,
};
