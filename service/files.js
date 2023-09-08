const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { handleError } = require('../error/index')
const { convertToRoman, generateLaporan } = require('../tools')
const { progressTurnitin } = require('../prisma/shortQuery');
const moment = require('moment');
require('moment/locale/id');


const uploadFileTurnitin = async (user, file, data) => {
    const { bab } = data, fileName = file.filename
    try {
        const data = await prisma.files.upsert({
            where: {
                users_id: Number(user.id)
            },
            update: {
                [bab]: fileName
            },
            create: {
                users_id: Number(user.id),
                [bab]: fileName
            }
        })
        return { status: 200, message: "upload file berhasil", data: data.users_id }
    } catch (err) {
        let error = handleError(err.code)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const infoFileUpload = async (userID) => {
    let returnData = []
    try {
        const data = await prisma.files.findUnique({
            where: {
                users_id: Number(userID)
            }
        })

        if (data === null) {
            const data = []
            for (let i = 1; i <= 5; i++) {
                data.push({
                    fieldName: null,
                    status: false,
                    label: `BAB-${convertToRoman(i)}`.toUpperCase(),
                    params: `bab_${convertToRoman(i)}`
                })
            }

            return {
                status: 200, data: {
                    status: false,
                    data: data
                }
            }
        }

        else {
            delete data.id
            delete data.users_id
            Object.keys(data).map((item) => {
                if (data[item] === null) returnData.push({ fieldName: data[item], status: false, label: item.toUpperCase().replace("_", "-"), params: item })
                else returnData.push({ fieldName: data[item], status: true, label: item.toUpperCase().replace("_", "-"), params: item })
            })
            return {
                status: 200, message: "berhasil file upload", data: {
                    status: true,
                    data: returnData
                }
            }
        }
    } catch (err) {
        let error = handleError(err.code)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const downloadFile = async (userID, bab) => {
    try {
        const data = await prisma.files.findUnique({
            where: {
                users_id: Number(userID)
            }
        })
        if (data !== null) {
            const fileName = data[bab]
            return { status: 200, message: "download file berhasil", data: fileName }
        } else {
            return { status: 404, message: "File tidak ditemukan", data: null }
        }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: "Maaf anda tidak mendownload file", data: null }
    }
}

const deleteFile = async (userID, bab) => {
    try {
        await prisma.files.update({
            where: {
                users_id: Number(userID)
            },
            data: {
                [bab]: null
            }
        })
        return { status: 200, message: "File berhasil dihapus", data: null }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const downloadLaporan = async (data) => {
    const { month, years, id } = data
    let total = 0, s1 = '', s2 = '', s3 = ''
    try {
        const dataInstruktur = await prisma.users.findUnique({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                nama: true
            }
        })

        const users = await prisma.users.findMany({
            where: {
                instruktur_id: Number(id),
                turnitin: {
                    tgl_pendaftaran: {
                        gte: new Date(`${years}-${month}-01`),
                        lte: new Date(`${years}-${month}-31`)
                    }
                },
            },
            include: {
                prodi: {
                    select: {
                        prodi: true,
                        fakultas: {
                            select: {
                                fakultas: true
                            }
                        },
                        strata: true
                    }
                },
                status: true,
                turnitin: {
                    include: {
                        proses: true
                    }
                }
            }
        })

        const dataSkripsi = await prisma.prodi.groupBy({
            by: ['kode_strata'],
            where: {
                users: {
                    some: {
                        instruktur_id: Number(id),
                        turnitin: {
                            tgl_pendaftaran: {
                                gte: new Date(`${years}-${month}-01`),
                                lte: new Date(`${years}-${month}-31`)
                            }
                        }
                    }
                }
            },
            _count: {
                kode_strata: true
            }
        })

        dataSkripsi.map((items) => {
            if (items.kode_strata == 1) s1 = items._count.kode_strata
            if (items.kode_strata == 2) s2 = items._count.kode_strata
            if (items.kode_strata == 3) s3 = items._count.kode_strata
        })

        await Promise.all(users.map(async (items, index) => {

            if (items.turnitin !== null) {
                users[index].tanggal_pembayaran = moment(items.turnitin.tanggal_pembayaran).format('DD-MM-YYYY')
                users[index].namaBank = items.turnitin.nama_bank
                users[index].judulSkripsi = items.turnitin.judul

                if (items.turnitin !== null && items.turnitin.proses !== null) {
                    users[index].proposal = items.turnitin.proses.proposal + '%'
                    users[index].hasil = items.turnitin.proses.hasil + '%'
                    users[index].tutup = items.turnitin.proses.tutup + '%'
                }

                delete users[index].turnitin
                delete users[index].turnitin_status
            }
            if (items.prodi.prodi == ' ') {
                users[index].status = 'Bukan Mahasiswa Unismuh'
            } else {

                users[index].namaProdi = items.prodi.prodi
                users[index].namaFakultas = items.prodi.fakultas.fakultas
                users[index].biaya = items.prodi.strata.biaya
                if (items.prodi.strata.biaya !== null) {
                    total += parseInt(items.prodi.strata.biaya)
                }
            }
            users[index].status = items.status.status
            delete users[index].prodi
            delete users[index].status
            delete users[index].password
            delete users[index].role_id
            delete users[index].instruktur_id
            delete users[index].created_at
            delete users[index].update_at
            delete users[index].email
            delete users[index].no_hp
            delete users[index].status_id
            delete users[index].prodi_id
            delete users[index].ability_id
            delete users[index].instruktur_id
        }))

        const generate = await generateLaporan(
            users,
            dataInstruktur,
            total,
            years,
            month,
            s1,
            s2,
            s3
        )
        if (generate.status == true) {
            return {
                status: 200,
                message: 'Laporan berhasil di download',
                data: {
                    fileName: generate.fileName
                }
            }
        } else {
            return { status: 500, message: generate.message, data: null }
        }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: err.message, data: null }
    }
}

module.exports = {
    uploadFileTurnitin,
    infoFileUpload,
    downloadFile,
    deleteFile,
    downloadLaporan
}