const path = require('path')
const fs = require('fs')


const { uploadFileTurnitin,
    infoFileUpload,
    downloadFile,
    deleteFile,
    downloadLaporan
} = require('../service/files')

const { handleServerResponse } = require('../utils/utils')


const { roleValidations } = require('../validation/index')


const DownloadLaporan = async (req, res, next) => {
    const { id } = req.user
    if (id === undefined)
        return handleServerResponse(res, 401, "Maaf anda tidak memiliki akses untuk mengunduh laporan", null)
    try {
        const data = await downloadLaporan(req.params)
        if (data.status === 500) {
            return handleServerResponse(res, data.status, data.message, data.data)
        } else {
            const directoryFile = path.join(__dirname, `../files/template/${data.data.fileName}`)
            fs.readFile(directoryFile, (err, file) => {
                if (err) {
                    return res.status(500).send({ message: "Maaf terjadi kesalahan saat mengunduh file" })
                }
                res.setHeader('Content-Type', 'application/vnd.ms-excel')
                res.setHeader('Content-Disposition', 'attachment; filename=' + data.data.fileName)
                res.send(file).status(200)
            })
        }
    } catch (err) {
        next(err)
    }
}

const deleteFileTurnitinHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await deleteFile(req.params.id, req.params.bab)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const uplpoadFileTurnitinHandler = roleValidations(2, async (req, res, next) => {
    try {
        const data = await uploadFileTurnitin(req.params, req.file, req.params)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
})

const infoFileUploadHandler = async (req, res, next) => {
    try {
        const data = await infoFileUpload(req.params.id)
        return handleServerResponse(res, data.status, data.message, data.data)
    } catch (err) {
        next(err)
    }
}


<<<<<<< HEAD
const DownloadFile = async (req, res) => {
    const data = await downloadFile(req.user.id, req.params.bab)
    if (data.status === 500) {
        return handleServerResponse(res, data.status, data.message, data.data)
    } else {
        const directoryFile = path.join(__dirname, `../files/${data.data}`)
        fs.readFile(directoryFile, (err, file) => {
            if (err) {
                return res.status(500).send({ message: "Maaf terjadi kesalahan saat mengunduh file" })
            }
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="${data.data}"`);
            res.status(200).end(file);
        })
=======
const DownloadFile = async (req, res, next) => {
    try {
        const data = await downloadFile(req.user.id, req.params.bab)
        if (data.status === 500) {
            return handleServerResponse(res, data.status, data.message, data.data)
        } else {
            const directoryFile = path.join(__dirname, `../files/${data.data}`)
            fs.readFile(directoryFile, (err, file) => {
                if (err) {
                    return res.status(500).send({ message: "Maaf terjadi kesalahan saat mengunduh file" })
                }
                res.setHeader('Content-Type', 'application/pdf')
                res.setHeader('Content-Disposition', 'attachment; filename=' + data.data)
                res.send({
                    file: file,
                    fileName: data.data
                }).status(200)
            })
        }
    } catch (err) {
        next(err)
>>>>>>> ed5bc49470bdcced3afc2246ecf6f13597603d35
    }
}

module.exports = {
    uplpoadFileTurnitinHandler,
    infoFileUploadHandler,
    deleteFileTurnitinHandler,
    DownloadFile,
    deleteFileTurnitinHandler,
    DownloadLaporan
}
