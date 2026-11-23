require('dotenv').config();
const mydb = require('./config/db')

const session = require('express-session')
const mysqlstore = require('express-mysql-session')(session);
const options = {
         host: process.env.TIDB_HOST,
            user: process.env.TIDB_USER,
            database: process.env.TIDB_DATABASE,
            password: process.env.TIDB_PASSWORD,
            port: process.env.TIDB_PORT,
            ssl: {}

}

const sessionstore = new mysqlstore({},mydb.pool)


const createController = require('./controller/controller')

// 

const express = require('express');
const app = express();
app.use(express.static('public'))
const http = require('http')
const { Server } = require('socket.io');

// 
app.use(express.urlencoded({ extended: false }))
// session mild
const sessionmildware = (session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionstore,
    cookie: {
        maxAge: 10 * 60 * 1000
    }
}));
app.use(sessionmildware)
const port = process.env.PORT

async function server() {
    try {

        const db = await mydb();
        const httpserver = http.createServer(app)
        const io = new Server(httpserver)
        io.engine.use(sessionmildware)
        io.on('connection', (socket) => {
            const userid = socket.request.session.usersID;
            const sessionid = socket.request.sessionID;


            console.log('connected user:', userid)
            socket.join(`user_${userid}`)

            const sessioncheck = setInterval(() => {
                sessionstore.get(sessionid, (err, storedSession) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log(`session id`, sessionid)
                    console.log('stored session', storedSession)
                    if (!storedSession) {
                        socket.emit('logout');
                        clearInterval(sessioncheck)
                    }
                })


            }, 5000)

            socket.on('disconnect', () => {
                clearInterval(sessionstore)
            })

            console.log('jonined room:', ` user_${userid}`)

            console.log('broswer ')

        })

        const authcontroller = createController(db)

        app.get('/', (req, res) => {
            res.render('index.ejs')
        })
        app.get('/admin', async (req,res)=>{
              if (!req.session.usersID) {
                return res.redirect('/')
              }
               if (req.session.role !== 'admin') {
                return res.redirect('/')
              }

              const display = req.session.usersID;
              const [search] = await db.query('SELECT * FROM users')
        
            res.render('admindashboard.ejs', {search : search})
        })
        app.get('/register', (req, res) => {

            const msg = req.session.namev;
            req.session.namev = null;
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate,private')
            res.set('Pragma', 'no-cache');
            res.render('register.ejs', { mgss: msg })
        })


        app.post('/register', (authcontroller.register));
        app.post('/login', (authcontroller.login));



        app.get('/dashboard', (req, res) => {
            if (!req.session.usersID) {
                return res.redirect('/')
            }
            return res.render('dashboard.ejs', { name: req.session.name })
        })
        app.get('/logout', (req, res) => {

            const loggingusersID = req.session.usersID;

            req.session.destroy((err) => {
                if (err) {
                    return res.send('could not log out')
                }
                console.log('sending logout:', ` user_${loggingusersID}`)

                io.to(`user_${loggingusersID}`).emit('logout')

                res.redirect('/')
            })


        })

        app.get('/{*splat}', (req, res) => {
            res.status(404).render('404.ejs')
        })
        httpserver.listen(port, () => {
            console.log(`server is running at ${port}`)
        })
    } catch (error) {
        console.log(error.message + "" + 'not sucessfull')
    }
}
server()

