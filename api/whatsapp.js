const axios = require('axios');
let urlDev = 'https://whatsapp.devnolife.site'

const checkNumber = async (number) => {
    try {
        const response = await axios.get(`${urlDev}/check-number/${number}`)
        return response.data
    } catch (err) {
        return err.response.data
    }
}

const sendMessages = async (number, message) => {
    try {
        const response = await axios.post(`${urlDev}/send-message`, { number, message })
        return response.data
    } catch (err) {
        return err.response.data
    }
}

module.exports = {
    checkNumber,
    sendMessages
}
