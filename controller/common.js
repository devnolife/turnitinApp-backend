const {
    listFakultas,
    listProdiByFakultas,
    listTahapUjian,
    nilaiTurnitin,
    timeMonthYearsUsers,
    checkProdiBab
} = require('../service/common')

const { getNumberAdmin } = require('../tools')

const CheckProdibabHandler = async (req, res) => {
    const data = await checkProdiBab(req.params)
    return res.status(data.status).send(data.data)
}

const TimeMonthYearsUsers = async (req, res) => {
    const data = await timeMonthYearsUsers()
    return res.status(data.status).send(data.data)
}

const NilaiTurnitin = async (req, res) => {
    const data = await nilaiTurnitin(req.params.id)
    return res.status(data.status).send(data.data)
}

const ListTahapUjian = async (req, res) => {
    const data = await listTahapUjian()
    return res.status(data.status).send(data.data)
}

const AdminNumber = async (req, res) => {
    const data = await getNumberAdmin()
    return res.status(200).send({ data: data })
}


const ListFakultas = async (req, res) => {
    const data = await listFakultas()
    return res.status(data.status).send(data.data)
}

const ListProdiByFakultas = async (req, res) => {
    const data = await listProdiByFakultas(req.params.fakultasId)
    return res.status(data.status).send(data.data)
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