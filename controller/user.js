const {
    updateUser,
    createTurnitin,
    updateTurnitin,
    validationUser,
    usersDetail,
    profileUser,
    checkTurnitin,
    nilaiTurnitin
} = require('../service/user')
const { roleValidations } = require('../validation/index')
const { complaintMessage } = require('../service/whatsapp')
const { handleServerResponse } = require('../utils/utils')

const checkTurnitinHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await checkTurnitin(req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const infoNilaiTurnitinHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await nilaiTurnitin(req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const profileUserHandler = async (req, res, next) => {
    try {
        const data = await profileUser(req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
}

const complaintMessageHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await complaintMessage(req.user.username, req.body.message)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const usersDetailByIdHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await usersDetail(req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})


const validationUserHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await validationUser(req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const updateUserHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await updateUser(req.body, req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const createTurnitinHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await createTurnitin(req.body, req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const updateTurnitinHandler = roleValidations(3, async (req, res, next) => {
    try {
        const data = await updateTurnitin(req.body, req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})


module.exports = {
    checkTurnitinHandler,
    profileUserHandler,
    updateUserHandler,
    createTurnitinHandler,
    updateTurnitinHandler,
    validationUserHandler,
    usersDetailByIdHandler,
    complaintMessageHandler,
    infoNilaiTurnitinHandler
}

