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
    const data = await checkTurnitin(req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const infoNilaiTurnitinHandler = roleValidations(3, async (req, res, next) => {
    const data = await nilaiTurnitin(req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const profileUserHandler = async (req, res, next) => {
    const data = await profileUser(req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
}

const complaintMessageHandler = roleValidations(3, async (req, res, next) => {
    const data = await complaintMessage(req.user.username, req.body.message)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const usersDetailByIdHandler = roleValidations(3, async (req, res, next) => {
    const data = await usersDetail(req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})


const validationUserHandler = roleValidations(3, async (req, res, next) => {
    const data = await validationUser(req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const updateUserHandler = roleValidations(3, async (req, res, next) => {
    const data = await updateUser(req.body, req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const createTurnitinHandler = roleValidations(3, async (req, res, next) => {
    const data = await createTurnitin(req.body, req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const updateTurnitinHandler = roleValidations(3, async (req, res, next) => {
    const data = await updateTurnitin(req.body, req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
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
