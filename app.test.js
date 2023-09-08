const {
    PrismaClient
} = require('@prisma/client')

const prisma = new PrismaClient();


(async () => {
    let object = {
        username: 'username22322',
        email: 'andi_agung@student.unismuh.ac.id',
        nim: '201810370311001'
    }
    try {
        const users = await prisma.users.findFirst({
            where: {
                OR: [
                    { username: { contains: object.username } },
                    { email: { contains: object.email } },
                    { nim: { contains: object.nim } },
                ],
            },
        });

        console.log(users);
    } catch (err) {
        console.log(err);
    }
})()