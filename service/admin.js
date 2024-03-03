const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleError } = require('../error/index')
const { generateHashedPassword } = require('../utils/utils')
const { searchUser, phoneNumberFormatter } = require('../tools/index')
const { userInlcude, detailUsers, detailUser, userInlcudeDetails, instrukturDetail, progressTurnitin } = require('../prisma/shortQuery')

const listBiayaTurnitin = async () => {
  try {
    const data = await prisma.strata.findMany({
      select: {
        id: true,
        kode_strata: true,
        biaya: true
      }
    })

    data.map(item => {
      item.kode_strata = (item.kode_strata).toUpperCase()
    })
    return { status: 200, message: "list biaya turnitin berhasil", data: data }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const editBiayaTurnitin = async (id, biaya) => {
  try {
    await prisma.strata.update({
      where: {
        id: Number(id)
      },
      data: {
        biaya: biaya
      }
    })

    return { status: 200, message: "Edit biaya turnitin berhasil", data: null }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}
const getUserData = async (statusAkun, take) => {
  return prisma.users.findMany({
    where: {
      role_id: 3,
      status_akun: statusAkun,
    },
    take: take,
    orderBy: {
      update_at: 'desc',
    },
    select: {
      id: true,
      username: true,
      update_at: true,
      email: true,
      status_akun: true,
    },
  });
};


const fiveUsersTimeLine = async () => {
  let dataReturn = []
  try {
    const userNonAktifPromise = getUserData('non_aktif', 2);
    const userAktifPromise = getUserData('aktif', 2);
    const userLulusPromise = getUserData('lulus', 1);

    const [userNonAktif, userAktif, userLulus] = await Promise.all([
      userNonAktifPromise,
      userAktifPromise,
      userLulusPromise,
    ]);

    [userNonAktif, userAktif, userLulus].forEach((users, index) => {
      const statusAkun =
        index === 0 ? 'non_aktif' : index === 1 ? 'aktif' : 'lulus';

      users.forEach((user) => {
        let content = '';
        if (statusAkun === 'aktif') {
          content = `${user.email}, User terakhir diaktifkan`;
        } else if (statusAkun === 'non_aktif') {
          content = `${user.email}, User pendaftaran terakhir`;
        } else if (statusAkun === 'lulus') {
          content = `${user.email}, User terakhir lulus`;
        }
        user.content = content;
        delete user.password;
        dataReturn.push(user);
      });
    });
    return { status: 200, message: "data success", data: dataReturn }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}
const createInstruktur = async (_data) => {
  try {
    const { username, email } = _data
    const user = await searchUser({ username: username, email: email })
    if (user) return { status: 400, message: "username atau email sudah digunakan", data: null }
    let data = await prisma.users.create({
      data: {
        email: _data.email,
        username: _data.username,
        role_id: 2,
        password: generateHashedPassword(_data.password),
        created_at: new Date(),
        no_hp: phoneNumberFormatter(_data.no_hp),
        update_at: new Date(),

      }
    })
    return { status: 201, message: "data berhasil ditambahkan", data: data }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }

  }
}

const listInstruktur = async () => {
  let count
  try {
    const data = await prisma.users.findMany({
      where: {
        role_id: 2
      },
      select: {
        id: true,
        email: true,
        username: true,
        status_akun: true,
        image: {
          select: {
            image: true,
            jenis_image_id: true
          }
        }
      }
    })
    await Promise.all(data.map(async (items, index) => {
      if (items.image.length > 0) {
        items.image.map((item) => {
          if (item.jenis_image_id === 1) data[index].imageProfile = item.image
          else data[index].imagePembayaran = item.image
        })
      } else {
        data[index].imageProfile = null
        data[index].imagePembayaran = null
      }
      delete data[index].image
      count = await prisma.users.count({
        where: {
          instruktur_id: items.id,
          status_akun: 'aktif'
        }
      })
      data[index].jumlahUsers = count
    }))

    return { status: 200, message: "list instruktur berhasil", data: data }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const listInstrukturDetail = async (id) => {
  try {
    const data = await prisma.users.findUnique({
      where: {
        id: Number(id)
      },
      include: {
        image: true,
        status: true,
        role: true
      }
    })

    if (data.image.length > 0) {
      data.image = data.image[0].image
    }
    data.role = data.role.role
    data.status = data.status.status
    count = await prisma.users.groupBy({
      by: ['status_akun'],
      where: {
        instruktur_id: data.id
      },
      _count: {
        status_akun: true
      }
    })
    data.aktif = 0
    data.non_aktif = 0
    count.map((items) => {
      data[items.status_akun] = items._count.status_akun
    })

    delete data.password
    delete data.role_id
    delete data.status_id
    delete data.prodi_id
    delete data.ability_id

    return { status: 200, message: "list instruktur detail", data: data }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const listUsersByInstruktur = async (data) => {
  const { month, years, id } = data
  try {
    const users = await prisma.users.findMany({
      where: {
        instruktur_id: Number(id),
        turnitin: {
          tgl_pendaftaran: {
            gte: new Date(`${years}-${month}-01`),
            lte: new Date(`${years}-${month}-31`)
          }
        }
      },
      include: {
        image: {
          select: {
            image: true,
            jenis_image_id: true
          }
        },
        prodi: {
          select: {
            prodi: true,
            fakultas: {
              select: {
                fakultas: true
              }
            }
          }
        },
        status: true,
        turnitin: {
          include: {
            proses: true
          }
        }
      }
    })

    await Promise.all(users.map(async (items, index) => {
      if (items.image.length > 0) {
        items.image.map((item) => {
          if (item.jenis_image_id === 1) users[index].imageProfile = item.image
          else users[index].imagePembayaran = item.image
        })
      } else {
        users[index].imageProfile = null
        users[index].imagePembayaran = null
      }

      users[index].fakultas = items.prodi.fakultas.fakultas
      users[index].prodi = items.prodi.prodi
      users[index].status = items.status.status

      if (items.turnitin !== null && items.turnitin.proses !== null) {
        users[index].progress = progressTurnitin(items.turnitin)
      } else {
        users[index].progress = 0
      }


      delete users[index].image
      delete items.password
      delete items.role_id
      delete items.status_id
      delete items.prodi_id
      delete items.ability_id
    }))

    return { status: 200, data: users }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const updateInstruktur = async (id, _data) => {
  try {
    const data = await prisma.users.update({
      where: {
        id: Number(id)
      },
      data: _data
    })
    return { status: 200, message: "update instruktur berhasil", data: data }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const listUsers = async (data) => {
  const { status } = data
  try {
    const data = await prisma.users.findMany({
      where: {
        role_id: 3,
        status_akun: status
      },
      include: userInlcude
    })
    const users = await detailUsers(data)
    return { status: 200, message: "list users berhasil ", data: users }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const aktivasiUsers = async (data) => {
  const { id, status_akun } = data
  try {
    const data = await prisma.users.update({
      where: {
        id: Number(id)
      },
      data: {
        status_akun: status_akun,
        update_at: new Date()
      }
    })
    return { status: 200, message: "aktivasi users berhasil", data: data }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const deleteUsers = async (data) => {
  const { id } = data
  try {
    const deleleUser = await prisma.users.delete({
      where: {
        id: Number(id)
      },
      select: {
        id: true,
        username: true,
        email: true,
        turnitin: true,
        image: true
      }
    })
    if (deleleUser.turnitin != null) {
      await prisma.turnitin.delete({
        where: {
          id: Number(id)
        }
      })
    }
    if (deleleUser.image.length > 0) {
      await prisma.image.deleteMany({
        where: {
          user_id: Number(id)
        }
      })
    }

    return { status: 200, message: "delete user berhasil", data: null }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }

  }
}

const usersDetailById = async (userID) => {
  let instruktur = {}
  try {
    const data = await prisma.users.findUnique({
      where: {
        id: Number(userID)
      },
      include: userInlcudeDetails
    })
    instruktur = await prisma.users.findUnique({
      where: {
        id: Number(data.instruktur_id)
      },
      include: {
        image: {
          select: {
            image: true,
            jenis_image_id: true
          }
        }
      }
    })

    const users = await detailUser(data)
    users.instruktur = await instrukturDetail(instruktur)
    return { status: 200, message: "users detail berhasil", data: users }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const dataDashboard = async () => {
  let countUsers = {}, returnData = {}
  try {
    const data = await prisma.users.groupBy({
      by: ['status_akun'],
      where: {
        role_id: 3
      },
      _count: {
        status_akun: true
      }
    })
    data.map(item => {
      countUsers[item.status_akun] = item._count.status_akun
    })
    countUsers.pendaftar = countUsers.non_aktif + countUsers.aktif

    let fakultas = {}
    const users = await prisma.users.findMany({
      where: {
        NOT: {
          prodi_id: 0
        },
        role_id: 3
      },
      include: {
        prodi: {
          select: {
            _count: {
              select: {
                users: true
              }
            },
            fakultas: {
              select: {
                fakultas: true
              }
            }
          }
        }
      }
    })
    users.map(item => {
      if (!fakultas[item.prodi.fakultas.fakultas]) {
        fakultas[item.prodi.fakultas.fakultas] = 1
      } else {
        fakultas[item.prodi.fakultas.fakultas] += 1
      }
    })
    const lastUsers = await prisma.users.findMany({
      orderBy: {
        created_at: 'desc'
      },
      select: {
        update_at: true,
      },
      take: 1
    })

    returnData.countUsers = countUsers
    returnData.fakultas = fakultas
    returnData.timeLastUpdate = lastUsers[0].update_at

    return { status: 200, message: "Data Dashboard Berhasil", data: returnData }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const changeHasHasilTurnitin = async (idProdi, status) => {
  try {
    const update = await prisma.prodi.update({
      where: {
        id: Number(idProdi)
      },
      data: {
        has_bab_results: status
      }
    })
    return { status: 200, message: "update berhasil", data: update }
  } catch (err) {
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }
  }
}

const listProdi = async () => {
  try {
    const data = await prisma.prodi.findMany({
      where: {
        NOT: {
          id: 0
        }
      },
      select: {
        id: true,
        prodi: true,
        has_bab_results: true,
        fakultas: {
          select: {
            fakultas: true
          }
        },
        strata: {
          select: {
            kode_strata: true,
            biaya: true
          }
        }
      }
    })

    data.map(_data => {
      _data['fakultas'] = _data['fakultas'].fakultas
      _data['biaya'] = _data.strata?.biaya
      _data['kode_strata'] = (_data.strata?.kode_strata).toUpperCase()
      delete _data.strata
    })
    return { status: 200, message: "List Prodi Berhasil", data: data }
  } catch (err) {
    console.log(err, 'error code');
    let error = handleError(err)
    return { status: error.errorCode, message: error.message, data: null }

  }
}
module.exports = {
  createInstruktur,
  listInstruktur,
  updateInstruktur,
  listUsers,
  aktivasiUsers,
  deleteUsers,
  listInstrukturDetail,
  usersDetailById,
  fiveUsersTimeLine,
  dataDashboard,
  listUsersByInstruktur,
  changeHasHasilTurnitin,
  listProdi,
  listBiayaTurnitin,
  editBiayaTurnitin
}
