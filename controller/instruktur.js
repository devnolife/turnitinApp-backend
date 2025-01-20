const {
    listUsersByInstruktur,
    userInstrukturDetail,
    fiveUsersTimeLine,
    infoNilaiTurnitin,
    updateNilaiTurntin,
    updateHasilBab
} = require('../service/instruktur')
const { roleValidations } = require('../validation/index')

const { handleServerResponse } = require('../utils/utils')

const updateHasilBabHandler = roleValidations(2, async (req, res, next) => {
    const data = await updateHasilBab(req.params.idUser, req.body)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const updateNilaiTurntinHandler = roleValidations(2, async (req, res, next) => {
    const data = await updateNilaiTurntin(req.params.id, req.body)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const timeLineHandler = roleValidations(2, async (req, res, next) => {
    const data = await fiveUsersTimeLine(req.user.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const listUsersByInstrukturHandler = roleValidations(2, async (req, res, next) => {
    const data = await listUsersByInstruktur(req.user.id, req.params.status)
    return handleServerResponse(res, data.status, data.message, data.data)
})

const userInstrukturDetailHandler = roleValidations(2, async (req, res, next) => {
    const data = await userInstrukturDetail(req.user.id, req.params.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})


const infoNilaiTurnitinHandler = roleValidations(2, async (req, res, next) => {
    const data = await infoNilaiTurnitin(req.params.id)
    return handleServerResponse(res, data.status, data.message, data.data)
})

module.exports = {
    listUsersByInstrukturHandler,
    userInstrukturDetailHandler,
    timeLineHandler,
    infoNilaiTurnitinHandler,
    updateNilaiTurntinHandler,
    updateHasilBabHandler
}
