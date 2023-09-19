const { formatMessage } = require('../tools/index');
const moment = require('moment');
moment.locale('id');

const registerMessage = (user) => {
    let message = ``;
    message += `*Perpustakaan Universitas Muhammadiyah Makassar* \n\n`;
    message += `*Pendaftaran User Baru:* \n`;
    message += `ID Pendaftaran: ${user.id} \n`;
    message += `Username: ${user.username} \n`;
    message += `Nama: ${user.nama} \n`;
    message += `Email: ${user.email} \n`;
    message += `No. HP: ${user.no_hp} \n`;
    message += `\n*Terima Kasih*`;
    return message;
}

const activationMessage = (user) => {
    let message = ``;
    message += `*Perpustakaan Universitas Muhammadiyah Makassar* \n\n`;
    message += `*Aktivasi User:* \n`;
    message += `ID Pendaftaran: ${user.id} \n`;
    message += `Username: ${user.username} \n`;
    message += `Nama: ${user.nama} \n`;
    message += `Email: ${user.email} \n`;
    message += `No. HP: ${user.no_hp} \n`;
    message += `\n*Telah diaktifkan silahkan login kembali di website Library Unismuh https://turnitin.if.unismuh.ac.id*`;
    return message;
}


const sendInstruktur = (noInstruktur, user) => {
    let message = ``;
    message += `https://api.whatsapp.com/send?phone=${noInstruktur}&text=`
    message += `*Nama*%20:%20${formatMessage(user.nama)}%0A`
    user.nim != null ? message += `*Nim*%20:${formatMessage(user.nim)}%0A` : message += `*Nim*%20%20%20%20%20:%0A`
    message += `*Judul*%20:%20${formatMessage(user.judul)}%0A`
    message += `*Tahap*%20:%20${formatMessage(user.tahap)}%0A`
    message += `*Nomor%20registrasi*:%20${user.id}%0A`
    message += `*Tanggal%20Pembayaran%20Turnitin*%20:%20${moment(user.tanggal_pembayaran).format('L')}%0A`
    message += `*Nama%20Bank*:%20${formatMessage(user.nama_bank)}%0A`
    return message;
}

const changePassword = (data, password) => {
    let message = ``;
    message += `*Perpustakaan Universitas Muhammadiyah Makassar* \n\n`;
    message += `*Ganti Password:* \n`;
    message += `Username: ${data.username} \n`;
    message += `Email: ${data.email} \n`;
    message += `Password Terbaru: ${password} \n`;
    message += `\n*Silahkan login kembali menggunakan password yang telah dirubah , pada https://turnitin.if.unismuh.ac.id*`;
    message += `\n*Terima Kasih*`;
    return message;
}

const messageByAdmin = (username, pesan) => {
    let message = ``;
    message += `*Perpustakaan Universitas Muhammadiyah Makassar* \n\n`;
    message += `*Pesan dari Admin:* \n`;
    message += `Terhomat, ${username} \n`;
    message += `Pesan: ${pesan} \n`;
    message += `\n*Terima Kasih*`;
    return message;
}


const complaintByUser = (user, pesan) => {
    let message = ``;
    message += `*Perpustakaan Universitas Muhammadiyah Makassar* \n\n`;
    message += `*Pengaduan:* \n`;
    message += `ID Pendaftaran: ${user.id} \n`;
    message += `Username: ${user.username} \n`;
    message += `Email: ${user.email} \n`;
    message += `Pesan Pengaduan: ${pesan} \n`;
    message += `\n*Terima Kasih*`;
    return message;
}

module.exports = {
    registerMessage,
    activationMessage,
    sendInstruktur,
    changePassword,
    messageByAdmin,
    complaintByUser
}