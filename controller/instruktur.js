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
    try {
        const data = await updateHasilBab(req.params.idUser, req.body)
        return handleServerResponse(res, data.status, data.message, data.data)
    }catch(err){
        next(err)
    }
})

const updateNilaiTurntinHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await updateNilaiTurntin(req.params.id, req.body)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const timeLineHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await fiveUsersTimeLine(req.user.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const listUsersByInstrukturHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await listUsersByInstruktur(req.user.id, req.params.status)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const userInstrukturDetailHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await userInstrukturDetail(req.user.id, req.params.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})


const infoNilaiTurnitinHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await infoNilaiTurnitin(req.params.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

module.exports = {
    listUsersByInstrukturHandler,
    userInstrukturDetailHandler,
    timeLineHandler,
    infoNilaiTurnitinHandler,
    updateNilaiTurntinHandler,
    updateHasilBabHandler
}