const express = require('express');
const port = 8080;
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const passport = require('passport')
const { applyPassportStrategy } = require('./auth/passport-jwt')
const apiRouter = require('./router/index')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const { handleError } = require('./error/index');

app.use(bodyParser.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(cors());

applyPassportStrategy(passport)
app.use(passport.initialize());

(async () => {
    await prisma.$connect()
        .then(() => {
            console.log(`\nDatabase connected success`)
            console.log(`Info : \n Server :${process.env.nameServer} \n Port :${process.env.port} \n Database :${process.env.databaseName}`);
            app.use('/api', apiRouter);
            app.get('/', (req, res) => {
                return res.status(200).send({
                    message: "backend"
                })
            })
            app.listen(port, () => {
                console.log(`Server is running at http://localhost:${port}`);
            })
        })
        .catch((err) => {
            console.log('Database connected :failed')
            console.log(err.message);
        })
})()

// Global error handler middleware
app.use((err, req, res, next) => {
    const error = handleError(err);
    res.status(error.errorCode || 500).json({
        message: error.message || 'Internal Server Error',
        serverError: error.serverError || null
    });
});
