const {
    uploadProfile,
    uploadBuktiBayar,
    imageProfile
} = require('../service/images')


const UploadProfile = async (req, res, next) => {
    try {
        const upload = await uploadProfile(req)
        res.status(upload.status).send(upload.data)
    } catch (err) {
        next(err)
    }
}

const UploadBuktiBayar = async (req, res, next) => {
    try {
        const upload = await uploadBuktiBayar(req)
        res.status(upload.status).send(upload.data)
    } catch (err) {
        next(err)
    }
}

const ImageProfile = async (req, res, next) => {
    try {
        const data = await imageProfile(req.user)
        res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

module.exports = {
    UploadProfile,
    UploadBuktiBayar,
    ImageProfile
}
