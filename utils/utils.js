const { check } = require('express-validator')
const md5 = require('md5')
const sha256 = require('sha256')
const {
    PASSWORD_IS_EMPTY,
    PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
    EMAIL_IS_EMPTY,
    EMAIL_IS_IN_WRONG
} = require('./message')

const generateHashedPassword = (password) => md5(sha256(password));

const handleServerResponse = (res, status, message = '', data = null, error = null) => {
    if (error) {
        return res.status(status || 500).json({
            code: status || 500,
            message: message || 'Internal Server Error',
            fullError: error
        });
    }

    return res.status(status).json({
        message,
        data,
    });
};


const registerValidaton = [
    check("email")
        .exists()
        .withMessage(EMAIL_IS_EMPTY)
        .isEmail()
        .withMessage(EMAIL_IS_IN_WRONG),
    check("password")
        .exists()
        .withMessage(PASSWORD_IS_EMPTY)
        .isLength({ min: 8 })
        .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8)
];

const loginValidation = [
    check("password")
        .exists()
        .withMessage(PASSWORD_IS_EMPTY)
]


module.exports = {
    generateHashedPassword,
    handleServerResponse,
    registerValidaton,
    loginValidation
}
