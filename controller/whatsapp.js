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

const ChangePasswordMessage = async (req, res) => {
    const { username } = req.params
    const data = await changePasswordMessage(username)
    res.status(data.status).send(data.data)
}

const InstrukturMessage = async (req, res) => {
    const data = await sendInstrukturMessage(req.user.id)
    res.status(data.status).send(data.data)
}

const sendNotificationActivation = async (req, res) => {
    const data = await notificationActivation(req.params.username)
    res.status(data.status).send(data.data)
}
const sendNotificationRegistry = async (req, res) => {
    const { username } = req.user;
    const data = await notificationRegistry(username);
    res.status(data.status).send(data.data)
}


const checkNomorWhatsapp = async (req, res) => {
    const number = phoneNumberFormatter(req.body.no_hp);

    if (number.length < 10) {
        res.status(400).json({
            message: 'Nomor WhatsApp harus memiliki minimal 10 digit',
            data: null
        });
        return;
    }

    const data = await checkNumber(number);
    res.status(data.code).json({
        message: data.message,
        data: data.data
    });
};


module.exports = {
    checkNomorWhatsapp,
    sendNotificationRegistry,
    sendNotificationActivation,
    InstrukturMessage,
    ChangePasswordMessage
}