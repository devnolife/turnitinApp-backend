  
const express = require('express')
const router = express.Router()
const passport = require('passport')
const path = require('path')
const multer = require('multer')

const { loginValidation, registerValidaton } = require('../utils/utils')
const { v4: uuidv4 } = require('uuid')

const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'photoProfile') {
            cb(null, 'images/photoProfile');
        } else if (file.fieldname === 'buktiPembayaran') {
            const destinationDirectory = 'images/buktiPembayaran';
            if (!fs.existsSync(destinationDirectory)) {
                fs.mkdirSync(destinationDirectory, { recursive: true });
            }
            cb(null, destinationDirectory);
        } else if (file.fieldname === 'fileTurnitin') {
            cb(null, 'files');
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'fileTurnitin') {
            let extArray = file.mimetype.split("/");
            let extension = extArray[extArray.length - 1];
            cb(null, uuidv4().substring(0, 9) + req.params.username + '-' + req.params.bab + '.' + extension);
        } else {
            cb(null, uuidv4() + path.extname(file.originalname));
        }
    }
});

const upload = multer({ storage: storage });
const auth = passport.authenticate('jwt', { session: false })


const profileFile = upload.single('photoProfile')
const buktiBayar = upload.single('buktiPembayaran')
const fileTurnitin = upload.single('fileTurnitin')
// Controllers

const authController = require('../controller').Auth
const adminController = require('../controller').Admin
const commonController = require('../controller').Common
const instrukturController = require('../controller').Instruktur
const imagesController = require('../controller').Images
const usersController = require('../controller').User
const whatsappController = require('../controller').Whatsapp
const filesController = require('../controller').Files

//auth Routes
router.post('/register', registerValidaton, authController.register)
router.post('/login', loginValidation, authController.login)
router.post('/check-token', authController.checkToken)
router.post('/change-password', auth, authController.changePasswordUser)

//admin Routes
router.get('/admin/dashboard', auth, adminController.dataDashboardHandler)
router.get('/admin/time-line', auth, adminController.userTimeLineHandler)
router.get('/admin/list-users/:status', auth, adminController.listUsersHandler)
router.get('/admin/users-detail/:id', auth, adminController.usersDetailByIdHandler)
router.get('/admin/list-instruktur', auth, adminController.listInstrukturHandler)
router.get('/admin/list-instruktur/:id', auth, adminController.listInstrukturDetailHandler)
router.get('/admin/list-instruktur/:id/:month/:years', auth, adminController.listUsersByInstrukturHandler)
router.post('/admin/list-instruktur/edit/:id', auth, adminController.updateInstrukturHandler)
router.post('/admin/create-instruktur', auth, adminController.crateInstrukturHandler)
router.post('/admin/aktivasi-users', auth, adminController.aktivasiUsersHandler)
router.delete('/admin/delete-users/:id', auth, adminController.deleteUsersHandler)
router.post('/admin/send-message/:username', auth, adminController.messageServiceHandler)
router.post('/admin/change-status-hasil/:id', auth, adminController.changeHasHasilTurnitinHandler)
router.get('/admin/list-prodi', auth, adminController.listProdiHandler)
router.get('/admin/list-biaya-turnitin', auth, adminController.listBiayaTurnitinHandler)
router.post('/admin/edit-biaya-turnitin/:id', auth, adminController.editBiayaTurnitinHandler)

//instruktur Routes
router.get('/instruktur/list-users/:status', auth, instrukturController.listUsersByInstrukturHandler)
router.get('/instruktur/list-users-detail/:id', auth, instrukturController.userInstrukturDetailHandler)
router.get('/instruktur/time-line', auth, instrukturController.timeLineHandler)
router.get('/instruktur/info-nilai/:id', auth, instrukturController.infoNilaiTurnitinHandler)
router.post('/instruktur/update-nilai/:id', auth, instrukturController.updateNilaiTurntinHandler)
router.post('/instruktur/update-hasil/:idUser', auth, instrukturController.updateHasilBabHandler)

//common Routes
router.get('/common/list-fakultas', commonController.ListFakultas)
router.get('/common/time-users', commonController.TimeMonthYearsUsers)
router.get('/common/list-prodi/:fakultasId', commonController.ListProdiByFakultas)
router.get('/common/list-ujian', commonController.ListTahapUjian)
router.get('/common/number-admin', commonController.AdminNumber)
router.get('/common/info-nilai/:id', auth, commonController.NilaiTurnitin)
router.get('/common/check-prodi/:idProdi/:idUser', commonController.CheckProdibabHandler)

//images Routes
router.post('/images/upload-profile', auth, profileFile, imagesController.UploadProfile)
router.post('/images/upload-bukti-pembayaran', auth, buktiBayar, imagesController.UploadBuktiBayar)
router.get('/images/profile', auth, imagesController.ImageProfile)

//user Routes
router.get('/user/profile', auth, usersController.profileUserHandler)
router.get('/user/detail', auth, usersController.usersDetailByIdHandler)
router.get('/user/validation', auth, usersController.validationUserHandler)
router.post('/user/update-user', auth, usersController.updateUserHandler)
router.post('/user/update-turnitin', auth, usersController.updateTurnitinHandler)
router.post('/user/create-turnitin', auth, usersController.createTurnitinHandler)
router.post('/user/complaint-message', auth, usersController.complaintMessageHandler)
router.get('/user/check-turnitin', auth, usersController.checkTurnitinHandler)
router.get('/user/nilai-turnitin', auth, usersController.infoNilaiTurnitinHandler)

//whatsapp Routes
router.post('/whatsapp/check-number', whatsappController.checkNomorWhatsapp)
router.get('/whatsapp/send-notification', auth, whatsappController.sendNotificationRegistry)
router.get('/whatsapp/send-notification/activation/:username', whatsappController.sendNotificationActivation)
router.get('/whatsapp/send-message-instruktur', auth, whatsappController.InstrukturMessage)
router.post('/whatsapp/change-password/:username', whatsappController.ChangePasswordMessage)

//files Routes
router.get('/files/laporan-turnitin/:id/:month/:years', auth, filesController.DownloadLaporan)
router.post('/files/upload-file-turnitin/:id/:username/:bab', auth, fileTurnitin, filesController.uplpoadFileTurnitinHandler)
// router.get('/files/download-file-turnitin/:bab', auth, filesController.DownloadFileTurnitin)
router.get('/files/info-file/:id', auth, filesController.infoFileUploadHandler)
router.get('/files/download-file/:bab', auth, filesController.DownloadFile)
router.get('/files/delete-file/:id/:bab', auth, filesController.deleteFileTurnitinHandler)


module.exports = router
