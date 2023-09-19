
const userInlcude = {
    image: {
        select: {
            image: true,
            jenis_image_id: true
        }
    },
    prodi: {
        select: {
            prodi: true,
            fakultas: {
                select: {
                    fakultas: true
                }
            }
        }
    },
    status: true
}

const userInlcudeDetails = {
    turnitin: {
        select: {
            judul: true,
            proposal: true,
            hasil: true,
            tutup: true,
            nama_bank: true,
            tanggal_pembayaran: true,
            proses: {
                select: {
                    proposal: true,
                    hasil: true,
                    tutup: true
                }
            }
        }
    },
    image: {
        select: {
            image: true,
            jenis_image_id: true
        }
    },
    prodi: {
        select: {
            prodi: true,
            id: true,
            fakultas: {
                select: {
                    fakultas: true
                }
            }
        }
    },
    status: true,
    role: true
}

const deleteImportanData = (data) => {
    if (data.instruktur_id == 0) delete data.instruktur_id
    if (data.role_id === 1 || data.role_id === 2) {
        delete data.fakultas_id
        delete turnitin_status
        delete data.prodi
    }
    delete data.password
    delete data.role_id
    delete data.ability_id
    delete data.image
    delete data.turnitin
    return data

}

const instrukturDetail = (data) => {
    const imageProfile = data.image.find((item) => item.jenis_image_id === 1)
    deleteImportanData(data)
    return {
        ...data,
        imageProfile: imageProfile !== undefined ? imageProfile.image : null
    }
}

const turnitinDetail = (data) => {
    let tahapUjian = []

    if (data.turnitin !== null) {
        if (data.turnitin.proposal) tahapUjian.push('Proposal')
        if (data.turnitin.hasil) tahapUjian.push('Hasil')
        if (data.turnitin.tutup) tahapUjian.push('Tutup')
        return {
            judul: data.turnitin.judul,
            tahapUjian: tahapUjian,
            namaBank: data.turnitin.nama_bank,
            tanggalPembayaran: data.turnitin.tanggal_pembayaran
        }
    } else {
        return null
    }
}


const detailUser = async (user) => {
    const imageProfile = user.image.find((item) => item.jenis_image_id === 1)
    const imagePembayaran = user.image.find((item) => item.jenis_image_id === 2)
    const turnitin = turnitinDetail(user)
    if (user.turnitin !== null) deleteImportanData(user)
    if (user.role.role !== 'admin' && user.role.role !== 'instruktur') {
        return {
            ...user,
            imageProfile: imageProfile !== undefined ? imageProfile.image : null,
            imagePembayaran: imagePembayaran !== undefined ? imagePembayaran.image : null,
            prodi: user.prodi.prodi,
            fakultas: user.prodi.fakultas.fakultas,
            status: user.status.status,
            role: user.role.role,
            judul: user.turnitin !== null ? turnitin.judul : null,
            tahapUjian: user.turnitin !== null ? turnitin.tahapUjian : null,
            namaBank: user.turnitin !== null ? turnitin.namaBank : null,
            tanggalPembayaran: user.turnitin !== null ? turnitin.tanggalPembayaran : null
        }
    } else {
        deleteImportanData(user)
        return {
            ...user,
            imageProfile: imageProfile !== undefined ? imageProfile.image : null,
            imagePembayaran: imagePembayaran !== undefined ? imagePembayaran.image : null,
            status: user.status.status,
            role: user.role.role
        }
    }
}

const detailUsers = async (users) => {
    return users.map((items, index) => {
        const imageProfile = items.image.find((item) => item.jenis_image_id === 1)
        const imagePembayaran = items.image.find((item) => item.jenis_image_id === 2)
        deleteImportanData(users[index])
        return {
            ...items,
            imageProfile: imageProfile !== undefined ? imageProfile.image : null,
            imagePembayaran: imagePembayaran !== undefined ? imagePembayaran.image : null,
            fakultas: items.prodi.fakultas.fakultas,
            prodi: items.prodi.prodi,
            status: items.status.status
        }
    })
}


const progressTurnitin = (data) => {
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
            }
        })
        delete data.proses
    } else {
        Object.keys(data).forEach((key) => {
            if (data[key] === null) delete data[key]
            if (data[key] === 1) {
                total += 1
                nullData += 1
            }
        })
    }
    let persen = Number(((total - nullData) / total * 100).toFixed(2))
    return persen ? persen : 0
}

module.exports = {
    userInlcude,
    deleteImportanData,
    detailUsers,
    detailUser,
    userInlcudeDetails,
    instrukturDetail,
    progressTurnitin

}