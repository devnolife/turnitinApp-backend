const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const { config } = require('../auth/passport-jwt')
const {
    generateHashedPassword,
    handleServerResponse
} = require('../utils/utils')

const { searchUser, createUser } = require('../tools/index')

const register = async (req, res) => {
    const errorAfterValidation = validationResult(req);
    if (!errorAfterValidation.isEmpty()) {
        return handleServerResponse(res, 400, "Register validation error", errorAfterValidation.array(), true);
    }
    const { username, email, nim } = req.body;
    try {
        const user = await searchUser(username, email, nim);
        if (user) {
            throw {
                statusCode: 400,
                message: "User telah terdaftar",
                data: null,
                error: true
            };
        } else {
            await createUser(req.body, 3, 4, 3);
            const newUser = await searchUser({ username: username });
            if (newUser) {
                delete newUser.password;
                return res.status(201).json({
                    user: newUser,
                    message: "User created successfully"
                });
            } else {
                throw {
                    statusCode: 500,
                    message: "Failed to create user",
                    data: null,
                    error: true
                };
            }
        }
    } catch (err) {
        const { statusCode, message } = err;
        return handleServerResponse(res, statusCode, message, null, err);
    }
};



const login = async (req, res) => {
    const errorAfterValidation = validationResult(req);
    if (!errorAfterValidation.isEmpty()) {
        return handleServerResponse(res, 400, "Login validation error", errorAfterValidation.array());
    } else {
        const { username, password } = req.body;
        try {
            const user = await searchUser({
                username: username,
                email: username,
                nim: username
            });
            if (!user) {
                return handleServerResponse(res, 404, "Login Error, User tidak ditemukan", true, null);
            }
            const isPasswordMatch = generateHashedPassword(password) === user.password;
            if (!isPasswordMatch) {
                return handleServerResponse(res, 403, "Password Salah", true, null);
            }
            const token = jwt.sign({ username }, config.passport.secret, { expiresIn: 1000 });
            delete user.password;
            res.status(200).json({
                userData: user,
                token: token
            })

        } catch (err) {
            return handleServerResponse(res, 500, "Login Error", err.message, "server");
        }
    }
}

const changePasswordUser = async (req, res) => {
    const { currentPassword, newPassword } = req.body
    const { id } = req.user
    try {
        const user = await prisma.users.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                password: true,
                username: true,
                email: true
            }
        })
        if (user.password !== generateHashedPassword(currentPassword)) {
            throw {
                statusCode: 400,
                message: "Password Lama Salah",
                data: null,
                error: true
            }
        }
        else {
            await prisma.users.update({
                where: {
                    id: Number(id)
                },
                data: {
                    password: generateHashedPassword(newPassword)
                }
            })
            delete user.password
            res.status(200).json({
                userData: user,
                message: "Password Berhasil Diubah"
            })
        }
    }
    catch (err) {
        const { statusCode, message } = err
        return handleServerResponse(res, statusCode, message, null, err)
    }
}

const checkToken = async (req, res) => {
    try {
        if (!token) {
            return res.status(400).json({
                status: false,
                message: "Token Not Found"
            });
        }
        const decodedToken = jwt.verify(token, config.passport.secret);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
            return res.status(200).json({
                status: false,
                message: "Token Expired"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Token Valid"
        });
    } catch (error) {
        return res.status(500).json({

            status: false,
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    register,
    login,
    changePasswordUser,
    checkToken
}