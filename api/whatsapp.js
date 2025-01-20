const axios = require('axios');
<<<<<<< HEAD
let urlDev = 'https://whatsapp.devnolife.site'
=======
let urlDev = 'http:/213.35.111.95:5000/whatsapp'
>>>>>>> ed5bc49470bdcced3afc2246ecf6f13597603d35

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
<<<<<<< HEAD
    checkNumber,
    sendMessages
=======
  checkNumber,
  sendMessages
>>>>>>> ed5bc49470bdcced3afc2246ecf6f13597603d35
}
