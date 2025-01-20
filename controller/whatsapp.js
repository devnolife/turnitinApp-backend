const {
    phoneNumberFormatter
} = require('../tools/index')

const { notificationRegistry,
    notificationActivation,
    sendInstrukturMessage,
    changePasswordMessage
} = require('../service/whatsapp')

const {
    checkNumber
} = require('../api/whatsapp')

const ChangePasswordMessage = async (req, res, next) => {
    const { username } = req.params
    try {
        const data = await changePasswordMessage(username)
        res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const InstrukturMessage = async (req, res, next) => {
    try {
        const data = await sendInstrukturMessage(req.user.id)
        res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const sendNotificationActivation = async (req, res, next) => {
    try {
        const data = await notificationActivation(req.params.username)
        res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const sendNotificationRegistry = async (req, res, next) => {
    const { username } = req.user;
    try {
        const data = await notificationRegistry(username);
        res.status(data.status).send(data.data)
    } catch (err) {
        next(err)
    }
}

const checkNomorWhatsapp = async (req, res, next) => {
    const number = phoneNumberFormatter(req.body.no_hp);

    if (number.length < 10) {
        res.status(400).json({
            message: 'Nomor WhatsApp harus memiliki minimal 10 digit',
            data: null
        });
        return;
    }

    try {
        const data = await checkNumber(number);
        res.status(data.code).json({
            message: data.message,
            data: data.data
        });
    } catch (err) {
        next(err)
    }
};

module.exports = {
    checkNomorWhatsapp,
    sendNotificationRegistry,
    sendNotificationActivation,
    InstrukturMessage,
    ChangePasswordMessage
}
