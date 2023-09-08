const {
    uploadProfile,
    uploadBuktiBayar,
    imageProfile
} = require('../service/images')


const UploadProfile = async (req, res) => {
    const upload = await uploadProfile(req)
    res.status(upload.status).send(upload.data)
}

const UploadBuktiBayar = async (req, res) => {
    const upload = await uploadBuktiBayar(req)
    res.status(upload.status).send(upload.data)
}

const ImageProfile = async (req, res) => {
    const data = await imageProfile(req.user)
    res.status(data.status).send(data.data)
}

module.exports = {
    UploadProfile,
    UploadBuktiBayar,
    ImageProfile
}