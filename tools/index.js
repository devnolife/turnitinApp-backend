const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient();
const base64Img = require('base64-img')
const { generateHashedPassword, check } = require('../utils/utils')
const Filter = require('bad-words'),
  filter = new Filter();


const fs = require('fs');
const XlsxTemplate = require('xlsx-template');
const path = require('path');

const readSQL = (nameFile) => {
  return fs.readFileSync(path.join(__dirname, `../sql/${nameFile}`), 'utf8');
}

const getValidationStatus = async (users_id) => {
  try {
    const formTurnitin = await prisma.form_turnitin.findUnique({
      where: {
        users_id: Number(users_id)
      }
    });

    const { tahap_1, tahap_2, tahap_3, tahap_4 } = formTurnitin;
    let validationStatus = [];

    const pushStatus = (tahap, index) => {
      if (tahap === null) {
        validationStatus = []
      } else if (!tahap) {
        validationStatus.push(index);
      } else {
        validationStatus.push(tahap);
      }
    };

    pushStatus(tahap_1, 1);
    pushStatus(tahap_2, 2);
    pushStatus(tahap_3, 3);
    pushStatus(tahap_4, 4);

    return validationStatus
  } catch (err) {
    throw new Error(err.message);
  }
};


const monthCondition = (month, year) => {
  let cond
  if (month == 12) {
    cond = {
      gte: new Date(`${year}-${month}`),
      lte: new Date(`${year + 1}-1`)
    }
  } else {
    cond = {
      gte: new Date(`${year}-${month}`),
      lte: new Date(`${year}-${month + 1}`)
    }
  }
  return cond
}

const progresTurnitin = (data) => {
  let lengthData = 0
  Object.keys(data).forEach((key) => {
    if (data[key] != null) {
      lengthData++
    }
  })
}
const checkMounth = (date) => {
  const MonthNow = new Date().getMonth() + 1;
  const Month = new Date(date).getMonth() + 1;
  if (MonthNow === Month) {
    return true;
  }
  return false;
}


const generateIDCard = async (instruktur_id) => {
  try {
    const getIdByLastInstrukur = await prisma.users.findMany({
      where: {
        instruktur_id: instruktur_id
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id_card: true,
        created_at: true
      },
      take: 1
    })

    if (getIdByLastInstrukur.length == 0) {
      return 1
    } else {
      const check = checkMounth(getIdByLastInstrukur[0].created_at)
      if (check) {
        id_card = getIdByLastInstrukur[0].id_card + 1
      } else {
        id_card = 1
      }
      return id_card
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

const lastUserID = async () => {
  try {
    const user = await prisma.users.findMany({
      where: {
        role_id: 3
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 1,
      select: {
        instruktur_id: true
      }
    })
    return user[0].instruktur_id
  } catch (err) {
    throw new Error(err.message);
  }
}

const firstIntruktur = async () => {
  try {
    const user = await prisma.users.findFirst({
      where: {
        role_id: 2
      },
      select: {
        id: true
      }
    })
    return user.id
  } catch (err) {
    throw new Error(err.message);
  }
}



const listInstruktur = async () => {
  try {
    const intruktur = await prisma.users.findMany({
      where: {
        AND: [
          { role_id: 2 },
          { status_akun: 'aktif' }
        ]
      },
      select: {
        id: true
      }
    })
    return intruktur
  } catch (err) {
    throw new Error(err.message);
  }
}

const setIntruktur = async () => {
  try {
    let lastID = await lastUserID();
    if (lastUserID == null) {
      let data = await firstIntruktur()
      return data
    } else {
      let data = await listInstruktur()
      let index = data.findIndex((item) => item.id == lastID)
      if (index == data.length - 1) {
        index = 0
      } else {
        index += 1
      }
      return data[index].id
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

const createUser = async (_data, role, status, ability) => {
  let intruktur = await setIntruktur()
  _data.instruktur_id = intruktur
  _data.created_at = new Date();
  _data.update_at = new Date();
  _data.password = generateHashedPassword(_data.password);
  _data.role_id = role;
  _data.status_id = status;
  _data.ability_id = ability;
  _data.no_hp = saveNumberFormatter(_data.no_hp);
  _data.id_card = await generateIDCard(intruktur);

  
  try {
    const user = await prisma.users.create({
      data: _data
    })
    return user;
  } catch (err) {
    throw err;
  }
}

const searchUser = async ({ username, email, nim }) => {
  try {
    const whereClause = [];

    if (username) {
      whereClause.push({ username: username });
    }
    if (email) {
      whereClause.push({ email: email });
    } 
    if (nim) {
      whereClause.push({ nim: nim });
    }

    
    const user = await prisma.users.findFirst({
      where: {
        OR: whereClause
      },
      include: {
        ability: {
          select: {
            action: true,
            subject: true,
          }
        },
        status: {
          select: {
            status: true
          }
        },
        role: {
          select: {
            role: true
          }
        }
      }
    });


    if (user != null) {
      delete user.role_id
      delete user.status_id
      delete user.ability_id
      delete user.prodi_id
      if (user.role != null) {
        user.role = user.role.role
      }
      if (user.status != null) {
        user.status = user.status.status
      }
      return user;
    } else {
      return false;
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

const searchUsers = async (username) => {
  try {
    const data = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username },
          { nim: username },
          { email: username }
        ]
      }
    })
    return data
  } catch (err) {
    throw new Error(err.message);
  }
}

const ImageBase64 = (image) => {
  try {
    const { path } = image
    const data = base64Img.base64Sync(path)
    return data;
  } catch (e) {
    return e.message
  }
}

const phoneNumberFormatter = function (number) {
  let formatted = number.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substr(1);
  }

  if (!formatted.endsWith('@c.us')) {
    formatted += '@c.us';
  }
  return formatted;
}

const saveNumberFormatter = function (number) {
  let formatted = number.replace(/\D/g, '');
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substr(1);
  }

  return formatted;
}

const getNumberAdmin = async () => {
  try {
    const number = await prisma.users.findFirst({
      where: {
        role_id: 1
      },
      select: {
        no_hp: true
      }
    })
    return number.no_hp
  } catch (err) {
    throw new Error(err.message);
  }
}

const getNumberUser = async (userId) => {
  try {
    const number = await prisma.users.findUnique({
      where: {
        id: Number(userId)
      },
      select: {
        no_hp: true
      }
    })
    return number.no_hp
  } catch (err) {
    throw new Error(err.message);
  }
}

const formatMessage = (message) => {
  message = message.replace(/ /g, '%20')
  return message
}

const generatePassword = () => {
  let password = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    password += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return password;
}

const checkKataBuruk = (message) => {
  filter.addWords(
    'goblok',
    'anjing',
    'asu',
    'bangsat',
    'bajingan',
    'Babi',
    'Kampret',
    'kontol',
    'memek',
    'ngentot',
    'ngewe',
    'Sampah',
    'sundala',
    'tolol',
    'tai',
    'suntili',
    'tailaso',
    'kongkong',
    'Telaso',
    'dumb',
    'fuck',
    'tolo',
    'bitch'
  )
  return filter.clean(message)
}

let numerals = {
  v: 5,
  iv: 4,
  i: 1,
};

const convertToRoman = (num) => {
  let newNumeral = "";
  for (let i in numerals) {
    while (num >= numerals[i]) {
      newNumeral += i;
      num -= numerals[i];
    }
  }
  return newNumeral;
}

const getMonthName = (month) => {
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  return monthNames[month - 1]
}

const generateLaporan = async (users, instruktur, jumlah, month, years, s1, s2, s3) => {
  const pathExcel = fs.readFileSync(path.join(__dirname, '../files/template', 'template-turnitin.xlsx'));
  const template = new XlsxTemplate(pathExcel);
  const fileName = `${instruktur.nama}-${month}-${years}`;
  const nameMonth = getMonthName(month);

  let totalS1 = '';
  let totalS2 = '';
  let totalS3 = '';

  if (s1 !== '') {
    totalS1 = `${s1} x Rp.50.000 = Rp. ${s1 * 50000}`;
  }

  if (s2 !== '') {
    totalS2 = `${s2} x Rp.75.000 = Rp. ${s2 * 75000}`;
  }

  if (s3 !== '') {
    totalS3 = `${s3} x Rp.100.000 = Rp. ${s3 * 100000}`;
  }

  const values = {
    tanggal: `${nameMonth}-${years}`,
    users,
    jumlah,
    nama_instruktur: instruktur.nama,
    totalS1,
    totalS2,
    totalS3,
    namaBulan: nameMonth
  };

  template.substitute(1, values);

  try {
    const data = await template.generate();

    const filePath = path.join(__dirname, '../files/template/', `${fileName.replace(" ", "-")}.xlsx`);
    fs.writeFileSync(filePath, data, 'binary');

    await prisma.laporan.upsert({
      where: {
        tgl_laporan_instruktur_id: {
          instruktur_id: instruktur.id,
          tgl_laporan: `${month}-${years}`
        }
      },
      update: {
        nama_file: fileName.replace(" ", "-")
      },
      create: {
        instruktur_id: instruktur.id,
        nama_file: fileName.replace(" ", "-"),
        tgl_laporan: `${month}-${years}`
      }
    });

    return {
      status: true,
      fileName: `${fileName.replace(" ", "-")}.xlsx`
    };
  } catch (err) {
    return {
      status: false,
      message: err.message
    };
  }
};




module.exports = {
  formatMessage,
  searchUser,
  createUser,
  phoneNumberFormatter,
  ImageBase64,
  getNumberUser,
  getNumberAdmin,
  saveNumberFormatter,
  generatePassword,
  checkKataBuruk,
  searchUsers,
  convertToRoman,
  progresTurnitin,
  generateLaporan,
  readSQL,
  monthCondition,
  getValidationStatus
}