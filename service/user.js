const { PrismaClient, Prisma } = require('@prisma/client');
const { detailUser, userInlcudeDetails, instrukturDetail } = require('../prisma/shortQuery')
const prisma = new PrismaClient();
const { handleError } = require('../error')
const {
    getValidationStatus
} = require('../tools')

const checkTurnitin = async (userID) => {
    try {
        const data = await prisma.users.findUnique({
            where: {
                id: Number(userID)
            },
            select: {
                turnitin_status: true
            }
        })
        return { status: 200, message: "", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}
const profileUser = async (userID) => {
    try {
        const data = await prisma.users.findUnique({
            where: {
                id: Number(userID)
            },
            include: userInlcudeDetails
        })
        const user = await detailUser(data)
        return { status: 200, message: "", data: user }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}

const updateUser = async (_data, users_id) => {
    try {
        if (_data.hasOwnProperty('nim')) {
            const { nim } = _data
            const checkNim = await prisma.users.findMany({
                where: {
                    nim: nim,
                    id: Number(users_id)
                }
            })

            if (checkNim.length > 0) {
                return { status: 400, message: "Nim telah digunakan", data: null }
            }
        }

        const data = await prisma.users.update({
            where: {
                id: Number(users_id)
            },
            data: _data
        })

        return { status: 200, message: "", data: data }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}


const getInstrukturData = async (userID) => {
    try {
        const data = await prisma.users.findMany({
            where: {
                id: Number(userID)
            },
            select: {
                id: true,
                nama: true,
                no_hp: true
            }
        })
        return { status: 200, data: data }
    } catch (err) {
        throw new Error(err.message);
    }
}

const usersDetail = async (id) => {
    try {
        const data = await prisma.users.findUnique({
            where: {
                id: Number(id)
            },
            include: userInlcudeDetails
        })
        const instruktur = await prisma.users.findUnique({
            where: {
                id: Number(data.instruktur_id)
            },
            include: {
                image: {
                    select: {
                        image: true,
                        jenis_image_id: true
                    }
                }
            }
        })
        const users = await detailUser(data)
        users.instruktur = await instrukturDetail(instruktur)
        return { status: 200, message: "", data: users }
    } catch (err) {
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}

const createTurnitin = async (_data, users_id) => {
    const { nama } = _data
    const updateNama = prisma.users.update({
        where: {
            id: Number(users_id)
        },
        data: {
            nama: nama
        }
    })
    delete _data.nama
    _data.users_id = users_id
    const createTurnitin = prisma.turnitin.upsert({
        where: {
            users_id: Number(users_id)
        },
        update: _data,
        create: _data
    })
    try {
        const data = await prisma.$transaction([updateNama, createTurnitin])
        return { status: 201, message: "", data: data }
    } catch (err) {
        console.log("🚀 ~ createTurnitin ~ err:", err)
        let error = handleError(err);
        return {
            status: error?.errorCode || 500,
            message: error?.message || 'An unexpected error occurred',
            data: null
        };
    }
}

const updateTurnitin = async (_data, users_id) => {
    console.log("🚀 ~ updateTurnitin ~ _data:", _data)
    try {
        const data = await prisma.turnitin.update({
            where: {
                users_id: Number(users_id)
            },
            data: _data
        })
        return { status: 200, message: "", data: data }
    } catch (err) {
        console.log("🚀 ~ updateTurnitin ~ err:", err)
        let error = handleError(err)
        return { status: error.status, message: error.message, data: null }
    }
}

const validationUser = async (users_id) => {
    try {
        const users = await prisma.users.findUnique({
            where: {
                id: Number(users_id)
            },
            include: {
                turnitin: {
                    select: {
                        judul: true,
                        proposal: true,
                        hasil: true,
                        tutup: true,
                        nama_bank: true,
                        tanggal_pembayaran: true
                    }
                },
                image: {
                    select: {
                        jenis_image_id: true
                    }
                }
            }
        });

        let validation = {
            tahap_1: null,
            tahap_2: null,
            tahap_3: null,
            tahap_4: null
        }

        if (users.turnitin !== null) {
            if (!users.nama || !users.turnitin.judul) {
                validation.tahap_1 = 1;
            }
            if (
                users.status_id === 4 ||
                (!users.turnitin.proposal && !users.turnitin.hasil && !users.turnitin.tutup)
            ) {
                validation.tahap_2 = 2;
            }

            if (!users.turnitin.nama_bank || !users.turnitin.tanggal_pembayaran || users.image.length === 0) {
                validation.tahap_3 = 3;
            }

            if (users.turnitin_status === 'false' || !users.turnitin_status) {
                validation.tahap_4 = 4;
            }
        } else {
            validation.tahap_1 = 1;
            validation.tahap_2 = 2;
            validation.tahap_3 = 3;
            validation.tahap_4 = 4;
        }


        await prisma.form_turnitin.upsert({
            where: {
                users_id: Number(users_id)
            },
            update: validation,
            create: {
                users_id: Number(users_id),
                ...validation
            }
        });

        const validationData = await getValidationStatus(users_id);
        return { status: 200, message: 'validasi data berhasil', data: validationData };
    } catch (err) {
        throw new Error(err.message);
    }
};


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

        if (data === null) return { status: 200, data: { message: 'User Belum Melengkapi Data' } }
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
        return { status: 200, message: "", data: returnData }
    } catch (err) {
        let error = handleError(err)
        return { status: error.errorCode, message: error.message, data: err.message }
    }
}

module.exports = {
    updateUser,
    createTurnitin,
    updateTurnitin,
    validationUser,
    usersDetail,
    profileUser,
    checkTurnitin,
    nilaiTurnitin
}
