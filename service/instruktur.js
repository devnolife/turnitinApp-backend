const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const { userInlcude, detailUsers, detailUser, userInlcudeDetails, deleteImportanData } = require('../prisma/shortQuery');
const { handleError } = require('../error')

const fiveUsersTimeLine = async (instruktur_id) => {
    let dataReturn = []
    try {
        const userNonAktif = prisma.users.findMany({
            where: {
                role_id: 3,
                status_akun: 'non_aktif',
                instruktur_id: instruktur_id
            },
            take: 2,
            orderBy: {
                update_at: 'desc'
            },
            select: {
                id: true,
                username: true,
                update_at: true,
                status_akun: true,
                email: true,
                image: true
            }
        })
        const userAktif = prisma.users.findMany({
            where: {
                role_id: 3,
                status_akun: 'aktif',
                instruktur_id: instruktur_id
            },
            take: 2,
            orderBy: {
                update_at: 'desc'
            },
            select: {
                id: true,
                username: true,
                update_at: true,
                status_akun: true,
                email: true,
                image: true
            }
        })
        const userLulus = prisma.users.findMany({
            where: {
                role_id: 3,
                status_akun: 'lulus',
                instruktur_id: instruktur_id
            },
            take: 1,
            orderBy: {
                update_at: 'desc'
            },
            select: {
                id: true,
                username: true,
                update_at: true,
                email: true,
                status_akun: true,
                image: true
            }
        })
        const data = await prisma.$transaction([userNonAktif, userAktif, userLulus])
        for (let i = 0; i < data.length; i++) {
            let content = ''
            data[i].map((item) => {
                const imageProfile = item.image.find((item) => item.jenis_image_id === 1)

                if (item.status_akun === 'aktif') {
                    content = `${item.email}, User terakhir diaktifkan`
                }
                else if (item.status_akun === 'non_aktif') {
                    content = `${item.email}, User pendaftaran terakhir`
                }
                else if (item.status_akun === 'lulus') {
                    content = `${item.email}, User terakhir lulus`
                }
                item.content = content
                dataReturn.push(item)

                item.imageProfile = imageProfile !== undefined ? imageProfile.image : null
                delete item.password
                delete item.image
            })
        }
        return { status: 200, message: "data berhasil didapatkan", data: dataReturn }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}
const listUsersByInstruktur = async (instruktur_id, status) => {
    try {
        const data = await prisma.users.findMany({
            where: {
                instruktur_id: Number(instruktur_id),
                status_akun: status
            },
            include: userInlcude
        })
        const users = await detailUsers(data)
        return { status: 200, message: "", data: users }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}

const userInstrukturDetail = async (instruktur_id, user_id) => {
    try {
        const data = await prisma.users.findUnique({
            where: {
                id_instruktur_id: {
                    id: Number(user_id),
                    instruktur_id: Number(instruktur_id)
                }
            },
            include: userInlcudeDetails
        })
        const _data = await detailUser(data)
        const user = await deleteImportanData(_data)
        return { status: 200, message: "", data: user }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }

}

const infoNilaiTurnitin = async (userID) => {
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

        if (data === null) return { status: 200, data: { message: 'User Belum Melengkapi Data' } }
        delete data.users_id
        delete data.judul
        delete data.tanggal_pembayaran
        delete data.tgl_pendaftaran
        delete data.nama_bank
        if (data.proses !== null) {
            Object.keys(data).forEach((key) => {
                if (data[key] === null) delete data[key]
                if (data[key] === 1 && Object.keys(data.proses).find((item) => item === key) !== undefined) data[key] = {
                    status: true,
                    nilai: data.proses[key]
                }
            })
            delete data.proses
        } else {
            Object.keys(data).forEach((key) => {
                if (data[key] === null) delete data[key]
                if (data[key] === 1) data[key] = {
                    status: true,
                    nilai: 0
                }
            })
        }

        (data, 'data');
        return { status: 200, message: "", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: 500, message: error.message, data: null }
    }
}


const updateNilaiTurntin = async (turnitinID, data) => {
    try {
        const update = await prisma.proses_turnitin.upsert({
            where: {
                turnitin_id: Number(turnitinID)
            },
            update: data,
            create: {
                turnitin_id: Number(turnitinID),
                ...data
            }
        })
        return {
            status: 200,
            data: update,
            message: 'Berhasil Update Nilai Turnitin'
        }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const updateHasilBab = async (userId, data) => {
    try {
        await prisma.files.upsert({
            where: {
                users_id: Number(userId)
            },
            update: { ...data },
            create: {
                users_id: Number(userId),
                ...data
            }
        })

        return {
            status: 200,
            data: null,
            message: 'Berhasil Update Hasil Perbab'
        }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}


module.exports = {
    listUsersByInstruktur,
    userInstrukturDetail,
    fiveUsersTimeLine,
    infoNilaiTurnitin,
    updateNilaiTurntin,
    updateHasilBab
}