const {
    listInstruktur,
    createInstruktur,
    updateInstruktur,
    aktivasiUsers,
    deleteUsers,
    listInstrukturDetail,
    listUsers,
    usersDetailById,
    fiveUsersTimeLine,
    dataDashboard,
    listUsersByInstruktur
} = require('../service/admin')

const { messageByAdminService } = require('../service/whatsapp')
const { roleValidations } = require('../validation/index')
const { handleServerResponse } = require('../utils/utils')

const messageServiceHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await messageByAdminService(req.params.username, req.body.message)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const dataDashboardHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await dataDashboard()
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const userTimeLineHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await fiveUsersTimeLine()
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const usersDetailByIdHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await usersDetailById(req.params.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})


const listUsersHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await listUsers(req.params)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const updateInstrukturHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await updateInstruktur(req.params.id, req.body)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const listUsersByInstrukturHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await listUsersByInstruktur(req.params)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const deleteUsersHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await deleteUsers(req.params)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const aktivasiUsersHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await aktivasiUsers(req.body)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const crateInstrukturHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await createInstruktur(req.body)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})


const listInstrukturHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await listInstruktur()
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const listInstrukturDetailHandler = roleValidations(1, async (req, res, next) => {
    try {
        const data = await listInstrukturDetail(req.params.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})


module.exports = {
    listInstrukturHandler,
    crateInstrukturHandler,
    updateInstrukturHandler,
    aktivasiUsersHandler,
    deleteUsersHandler,
    listInstrukturDetailHandler,
    listUsersHandler,
    usersDetailByIdHandler,
    fiveUsersTimeLine,
    dataDashboardHandler,
    listUsersByInstrukturHandler,
    messageServiceHandler,
    userTimeLineHandler
}