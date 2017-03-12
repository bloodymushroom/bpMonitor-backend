import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

// auth
import session from 'express-session'
import passport from 'passport'
import Auth0Strategy from 'passport-auth0'
import setup, {isAuthenticated} from './passportConfig.js'


// connect db
import connectMongo from 'connect-mongo'
const MongoStore = connectMongo(session);

// import db + schemas
import dbConfig from './db'
import User from './schema/user'
import BloodPressure from './schema/bloodPressure'


// connect mongoDB
mongoose.connect(dbConfig.url)
mongoose.Promise = Promise

// start server
const app = express()
const port = process.env.PORT || 3000


// start a session for the user, saved in mongo
app.use(session({
  store: new MongoStore({
    url: dbConfig.url
  }),
  secret: dbConfig.secret,
  resave: false,
  saveUninitialized: false
}))

// PASSPORT SETUP
setup(passport);
app.use(passport.initialize())
app.use(passport.session())

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,HEAD,DELETE,OPTIONS,PUT'),
  // res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization')
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers"),

  next()
})

// app.use(isAuthenticated);

app.post('/register', (req, res) => {
  User.findOne({
    username: req.body.username
  })
  .then( (user) => {
    if (user) {
      console.log('user exists')

      res.status(400).json({
        status: false
      })
    }

    const newUser = new User({
      username: req.body.username,
      password: req.body.email,
      email: req.body.email
    })

    newUser.save();
    res.json(newUser)
  })
})

app.get('/auth0', isAuthenticated, function (req, res) {
    console.log('in passpart', req, res)
  res.json({ status : 'auth0'});
})

app.post('/login', (req, res) => {
  User.findOne({
    // email: req.body.email,
    // password: req.body.password
    username: 'test',
  })
  .then( (user) => {
    console.log('user', user)
    if (!user) {
      console.log('no user found')
      throw new Error('user does not exist')
    }

    console.log('success')

    user.getPressures()
    .then((bps) => {
      res.json({
        user,
        bps
      })
    })

    console.log('end of login')
  })
  .catch((err) => {
    console.log(err.message)

    res.status(400).json({
      status: false,
      message: err.message
    })
  })
})

app.post('/BP', passport.authenticate('auth0', {}), (req, res) => {
  User.findOne({
    username: req.body.username
  })
  .then((user) => {
    if (!user) {
      throw new Error('no user to add BP to')
    }
    const newBP = new BloodPressure({
      date: req.body.bp.date || new Date(),
      systole: req.body.bp.systole,
      diastole: req.body.bp.diastole
    })

    newBP.save();
    console.log('new bp:', newBP)

    user.addBP(newBP)
    .then( (user) => {
      console.log('add BP complete')
      res.json(user)
    })
    .catch( (e) => {
      console.log('error in adding')
      res.send('error')
    })
  })
  .catch((err) => {
    console.log(err.message)

    res.status(400).json({
      status: false,
      message: err.message
    })
  })
})

app.get('/BP', (req, res) => {
  console.log('req.query', req.query)

  res.send('got a query')
})

app.get('/', (req, res) => {
  passport.authenticate('auth0', {}),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.status(400).json({
      status: false,
      message: err.message
    })
  }
  res.json({ data: 'hello world'})
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}!`)
})
