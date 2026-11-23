const bcrypt = require('bcrypt')
function createController(db) {
    async function register(req, res) {
        try {

            const { firstname, email, password } = req.body
            const hashpassword = await bcrypt.hash(password, 10);

            const result = await db.execute('INSERT INTO users(fullname,email,password) VALUES(?,?,?)',
                [firstname, email, hashpassword])
            req.session.namev = 'Account created successfuly'
            return res.redirect('/register')
        } catch (error) {
            console.log(error.message)
            return res.render('register.ejs', { error: 'Email already exist' })


        }

    }

    async function login(req, res) {
        try {

            const { email, password } = req.body;
            const [result2] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (result2.length === 0) {
                return res.render('index.ejs', { errorv: "invalid email or password" })
            }
            const users = result2[0]
            const ismatch = await bcrypt.compare(password, users.password)

            if (!ismatch) {
                return res.render('index.ejs', { notmatch: 'invalid email or password' })
            }
            req.session.usersID = users.id;
            req.session.name = users.fullname;
            req.session.role = users.role
            if (users.role === 'user') {
                return res.redirect('/dashboard')
            }
            return res.redirect('/admin')
        } catch (error) {
            console.log(error)
        }

    }

    return { register, login }
}

module.exports = createController;

