const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ImageBase64 } = require('../tools/index')
const { handleError } = require('../error')
const uploadProfile = async (req) => {
    const { id } = req.user
    const image = req.file
    try {
        const imageBase64 = await ImageBase64(image)
        const users = await prisma.images.upsert({
            where: {
                users_id_jenis_image_id: {
                    users_id: id,
                    jenis_image_id: Number(1)
                }
            },
            update: {
                image: imageBase64
            },
            create: {
                users_id: Number(id),
                jenis_image_id: Number(1),
                image: imageBase64
            }
        })
        return { status: 200, message: "Upload Profile Berhasil", data: users }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const uploadBuktiBayar = async (req) => {
    const { id } = req.user
    const image = req.file
    try {
        const imageBase64 = await ImageBase64(image)
        await prisma.images.upsert({
            where: {
                users_id_jenis_image_id: {
                    users_id: id,
                    jenis_image_id: Number(2)
                }
            },
            update: {
                image: imageBase64
            },
            create: {
                users_id: Number(id),
                jenis_image_id: Number(2),
                image: imageBase64
            }
        })
        return { status: 200, message: "Upload Bukti Bayar Berhasil", data: null }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

const imageProfile = async (userID) => {
    try {
        const image = await prisma.images.findUnique({
            where: {
                users_id_jenis_image_id: {
                    users_id: userID,
                    jenis_image_id: 1
                }
            }
        })
        return { status: 200, message: "image profile berhasil", data: image }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: null }
    }
}

module.exports = {
    uploadProfile,
    uploadBuktiBayar,
    imageProfile
}