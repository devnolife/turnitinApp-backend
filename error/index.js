const { Prisma } = require('@prisma/client');

const prismaError = {
    'P1000': {
        errorCode: 400,
        message: 'Koneksi ke database gagal'
    },
    'P2000': {
        errorCode: 400,
        message: 'Nilai dari kolom melampaui batas maksimum'
    },
    'P2001': {
        errorCode: 402,
        message: 'Kondisi yang dicari tidak ditemukan,periksa kembali nilai dari kolom'
    },
    'P2002': {
        errorCode: 400,
        message: 'Kolom harus bernilai unik'
    },
    'P2005': {
        errorCode: 405,
        message: 'Nilai dari kolom tidak sesuai dengan tipe data'
    },
    'P2018': {
        errorCode: 400,
        message: 'Koneksi kolom tidak ditemukan'
    },
    'P2019': {
        errorCode: 400,
        message: 'Inputan Error'
    },
    'P2025': {
        errorCode: 400,
        message: 'satu atau beberapa field yang dibutuhkan tidak ditemukan'
    },
    'P2028': {
        errorCode: 400,
        message: 'Transaksi API Error'
    }

}

const handlePrismaError = (value) => {
    key = Object.keys(prismaError).find((key) => key === value)
    return prismaError[key];
}

const handleError = (err) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        let error = handlePrismaError(err.code)
        return error

    } else {
        return {
            errorCode: 500,
            message: 'Internal Server Error',
            serverError: err.message
        }
    }
}


module.exports = {
    handleError
}