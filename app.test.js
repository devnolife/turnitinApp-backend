const {
    PrismaClient
} = require('@prisma/client')

const prisma = new PrismaClient();


(async () => {
    let object = {
            username: 'andiagung@student.unismuh.ac.id'
    }
    try {
        const users = await prisma.users.findFirst({
            where: {
                OR: [
                    {
                    username: object.username
                    },
                    {
                    email: object.username
                    }
                ]
            },
        });

        console.log(users);
    } catch (err) {
        console.log(err);
    }
})()