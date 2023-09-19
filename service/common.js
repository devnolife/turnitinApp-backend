const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../error')

const listFakultas = async () => {
    try {
        const data = await prisma.fakultas.findMany()
        data.map(_data => {
            _data['value'] = _data['id']
            delete _data['id']
            _data['label'] = _data['fakultas']
            delete _data['fakultas']
        })

        return { status: 200, message: "List Fakultas Berhasil", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const listProdiByFakultas = async (fakultasId) => {
    try {
        const data = await prisma.prodi.findMany({
            where: {
                fakultas_id: Number(fakultasId)
            }
        })
        data.map(_data => {
            _data['value'] = _data['id']
            delete _data['id']
            _data['label'] = _data['prodi']
            delete _data['prodi']
            delete _data.fakultas_id
        })
        return { status: 200, message: "list prodi berhasil", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const listTahapUjian = async () => {
    try {
        const data = await prisma.tahap_turnitin.findMany({
            select: {
                id: true,
                jenis_proses: true
            }
        })
        data.map(_data => {
            _data['value'] = _data['id']
            delete _data['id']
            _data['label'] = _data['jenis_proses']
            delete _data['jenis_proses']
        })
        return { status: 200, message: "list tahap ujian", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const nilaiTurnitin = async (userID) => {
    let returnData = {}
    try {
        const data = await prisma.turnitin.findUnique({
            where: {
                users_id: Number(userID)
            },
            include: {
                proses: {
                    select: {
                        proposal: true,
                        hasil: true,
                        tutup: true
                    }
                }
            }
        })

        if (data === null) return { status: 200, message: 'User Belum Melengkapi Data', data: null }
        delete data.id
        delete data.users_id
        delete data.judul
        delete data.tanggal_pembayaran
        delete data.tgl_pendaftaran
        delete data.nama_bank
        let total = 0, nullData = 0
        if (data.proses !== null) {
            Object.keys(data).forEach((key) => {
                if (data[key] === null) delete data[key]
                if (data[key] === 1 && Object.keys(data.proses).find((item) => item === key) !== undefined) {
                    total += 1
                    if (data.proses[key] === null) nullData += 1
                    data[key] = {
                        status: true,
                        nilai: data.proses[key]
                    }
                }
            })
            delete data.proses
        } else {
            Object.keys(data).forEach((key) => {
                if (data[key] === null) delete data[key]
                if (data[key] === 1) {
                    total += 1
                    nullData += 1
                    data[key] = {
                        status: true,
                        nilai: 0
                    }
                }
            })
        }
        returnData.persen = Number(((total - nullData) / total * 100).toFixed(2))
        returnData.nilai = data
        returnData.div = 12 / total
        return { status: 200, message: "nilai turnitin berhasil", data: returnData }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const timeMonthYearsUsers = async () => {

    const month = [], year = [];
    let ObjectMonth = {}, ObjectYear = {}
    try {
        const data = await prisma.turnitin.findMany({
            select: {
                tgl_pendaftaran: true
            },
            orderBy: {
                tgl_pendaftaran: 'asc'
            }
        })
        data.map(_data => {
            const _month = _data.tgl_pendaftaran.getMonth() + 1;
            const _year = _data.tgl_pendaftaran.getFullYear();
            if (ObjectMonth[_month] === undefined) {
                ObjectMonth[_month] = 1
                month.push({ value: _month, label: _month })
            }
            if (ObjectYear[_year] === undefined) {
                ObjectYear[_year] = 1
                year.push({ value: _year, label: _year })
            }
        })
        return { status: 200, message: "", data: { month, year } }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const checkProdiBab = async (params) => {
    const { idProdi, idUser } = params
    try {
        const data = await prisma.prodi.findUnique({
            where: {
                id: Number(idProdi)
            }, include: {
                turnitin: {
                    where: {
                        users_id: Number(idUser)
                    },
                    select: {
                        files: {
                            select: {
                                bab1_hasil: true,
                                bab2_hasil: true,
                                bab3_hasil: true,
                                bab4_hasil: true,
                                bab5_hasil: true,
                            }
                        }
                    }
                }
            }
        })
        delete data.fakultas_id
        delete data.kode_prodi
        delete data.kode_strata
        data.turnitin = data.turnitin[0].files;
        const babKeys = Object.keys(data.turnitin);
        babKeys.forEach((key) => {
            const babNumber = key.match(/\d+/)[0];
            const babName = `BAB-${babNumber}`;
            data.turnitin[babName] = data.turnitin[key];
            delete data.turnitin[key];

        });
        return { status: 200, message: "list tahap ujian", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

module.exports = {
    listFakultas,
    listProdiByFakultas,
    listTahapUjian,
    nilaiTurnitin,
    timeMonthYearsUsers,
    checkProdiBab
}