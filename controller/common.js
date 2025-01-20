const {
    listFakultas,
    listProdiByFakultas,
    listTahapUjian,
    nilaiTurnitin,
    timeMonthYearsUsers,
    checkProdiBab
} = require('../service/common')

const { getNumberAdmin } = require('../tools')

const CheckProdibabHandler = async (req, res, next) => {
    try {
        const data = await checkProdiBab(req.params)
        return res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const TimeMonthYearsUsers = async (req, res, next) => {
    try {
        const data = await timeMonthYearsUsers()
        return res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const NilaiTurnitin = async (req, res, next) => {
    try {
        const data = await nilaiTurnitin(req.params.id)
        return res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const ListTahapUjian = async (req, res, next) => {
    try {
        const data = await listTahapUjian()
        return res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const AdminNumber = async (req, res, next) => {
    try {
        const data = await getNumberAdmin()
        return res.status(200).send({ data: data })
    } catch (err) {
        next(err)
    }
}

const ListFakultas = async (req, res, next) => {
    try {
        const data = await listFakultas()
        return res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const ListProdiByFakultas = async (req, res, next) => {
    try {
        const data = await listProdiByFakultas(req.params.fakultasId)
        return res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

module.exports = {
    ListFakultas,
    ListProdiByFakultas,
    ListTahapUjian,
    AdminNumber,
    NilaiTurnitin,
    TimeMonthYearsUsers,
    CheckProdibabHandler
}
