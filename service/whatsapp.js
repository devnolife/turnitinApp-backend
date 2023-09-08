const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
    getNumberAdmin,
    searchUsers,
    phoneNumberFormatter,
    getNumberUser,
    generatePassword,
    checkKataBuruk
} = require('../tools/index');
const {
    sendMessages
} = require('../api/whatsapp')
const {
    registerMessage,
    activationMessage,
    sendInstruktur,
    changePassword,
    messageByAdmin,
    complaintByUser
} = require('../whatsapp/message');
const { generateHashedPassword } = require('../utils/utils');
const { updateUser } = require('./user')


const complaintMessage = async (username, message) => {
    let response, code
    try {
        const users = await searchUsers(username)
        if (users.no_hp === null) {
            response = "Nomor Whatsapp Belum Terdaftar"
            code = 422
        } else {
            const numberAdmin = await getNumberAdmin()
            const number = phoneNumberFormatter(numberAdmin)
            const _message = complaintByUser(users, checkKataBuruk(message))
            await sendMessages(number, _message)
                .then(() => {
                    response = "Notifikasi Berhasil Dikirim"
                    code = 200
                }).catch(() => {
                    response = "Notifikasi Gagal Dikirim"
                    code = 500
                })
            return { status: code, data: { message: response } }
        }
    } catch (err) {
        return { status: 500, data: { message: err.message } }
    }
}

const messageByAdminService = async (username, message) => {
    let response, code
    try {
        const users = await searchUsers(username)
        if (users.no_hp === null) {
            response = "Nomor Whatsapp Belum Terdaftar"
            code = 422
        } else {

            const number = phoneNumberFormatter(users.no_hp)
            const _message = messageByAdmin(users.username, message)
            await sendMessages(number, _message)
                .then(() => {
                    response = "Notifikasi Berhasil Dikirim"
                    code = 200
                }).catch(() => {
                    response = "Notifikasi Gagal Dikirim"
                    code = 500
                })
            return { status: code, data: { message: response } }
        }
    } catch (err) {
        return { status: 500, data: { message: err.message } }
    }
}

const notificationRegistry = async (username) => {
    let response, code
    try {
        const users = await searchUsers(username)
        const numberAdmin = await getNumberAdmin()
        const number = phoneNumberFormatter(numberAdmin)
        const message = registerMessage(users)
        await sendMessages(number, message)
            .then(() => {
                response = "Notifikasi Berhasil Dikirim"
                code = 200
            }).catch((err) => {
                console.log(err, "error");
                response = "Notifikasi Gagal Dikirim"
                code = 500
            })
        return { status: code, data: { message: response } }
    } catch (err) {
        return { status: 500, data: { message: err.message } }
    }
}

const notificationActivation = async (username) => {
    let response, code
    try {
        const users = await searchUsers(username)
        if (users.no_hp === null) {
            response = "Nomor Whatsapp Belum Terdaftar"
            code = 422
        } else {
            const number = phoneNumberFormatter(users.no_hp)
            const message = activationMessage(users)
            await sendMessages(number, message)
                .then(() => {
                    response = "Notifikasi Berhasil Dikirim"
                    code = 200
                }).catch(() => {
                    response = "Notifikasi Gagal Dikirim"
                    code = 500
                })
            return { status: code, data: { message: response } }
        }
    } catch (err) {
        return { status: 500, data: { message: err.message } }
    }
}


const sendInstrukturMessage = async (userID) => {
    let tahap = ''
    try {
        const user = await prisma.users.findUnique({
            where: {
                id: Number(userID)
            },
            include: {
                turnitin: true
            }
        })

        if (user.turnitin != null) {
            if (user.turnitin.proposal == 1) {
                tahap += 'Proposal'
            } else if (user.turnitin.proposal == 1 && user.turnitin.hasil == 1) {
                tahap += 'Hasil'
            } else if (user.turnitin.proposal == 1 && user.turnitin.hasil == 1 && user.turnitin.laporan == 1) {
                tahap += 'Tutup'
            }

            user.judul = user.turnitin.judul
            user.tahap = tahap
            user.tgl_pendaftaran = user.turnitin.tgl_pendaftaran
            user.nama_bank = user.turnitin.nama_bank
        }
        delete user.turnitin
        const number = await getNumberUser(user.instruktur_id)
        const message = sendInstruktur(number, user)

        return { status: 200, data: message, message: "Notifikasi Berhasil Dikirim" }
    } catch (err) {
        return { status: 500, data: { message: err.message } }
    }
}

const changePasswordMessage = async (username) => {
    let response, code, password
    try {
        const users = await searchUsers(username)
        if (users === null) {
            response = "Username atau Email Tidak Ditemukan"
            code = 404
            return { status: code, data: { message: response } }
        }
        if (users.no_hp === null) {
            response = "Nomor Whatsapp Belum Terdaftar"
            code = 422
            return { status: code, data: { message: response } }
        } else {
            password = generatePassword()
            updateUser({ password: generateHashedPassword(password) }, users.id)
            const number = phoneNumberFormatter(users.no_hp)
            const message = changePassword(users, password)
            await sendMessages(number, message)
                .then(() => {
                    response = "Notifikasi Berhasil Dikirim"
                    code = 200
                }).catch(() => {
                    response = "Notifikasi Gagal Dikirim"
                    code = 500
                })
            return { status: code, data: { message: response } }
        }
    } catch (err) {
        return { status: 500, data: { message: err.message } }
    }
}


module.exports = {
    notificationRegistry,
    notificationActivation,
    sendInstrukturMessage,
    changePasswordMessage,
    messageByAdminService,
    complaintMessage
}
