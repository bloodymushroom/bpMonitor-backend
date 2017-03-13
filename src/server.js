import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

// auth
import session from 'express-session'
import passport from 'passport'
import Auth0Strategy from 'passport-auth0'
import setup, {isAuthenticated} from './passportConfig.js'
import jwt from 'express-jwt'

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
// setup(passport);
// app.use(passport.initialize())
// app.use(passport.session())

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// jwt
var authenticate = jwt({
  secret: process.env.CLIENT_SECRET,
  audience: process.env.CLIENT_ID
});

console.log('jwt: ', process.env.CLIENT_SECRET, process.env.CLIENT_ID)

// allow CORS
app.use((req, res, next) => {
  console.log('req headers', req.headers)
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3002')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,HEAD,DELETE,OPTIONS'),
  // res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers"),

  next()
})

// app.use(isAuthenticated);
// app.use('/BP', jwt({ secret: process.env.CLIENT_SECRET}));
app.use(authenticate)
// app.use('/Auth0', authenticate)

app.post('/register', (req, res) => {
  console.log('in register')
  User.findOne({
    clientID: req.body.clientID
  })
  .then( (user) => {
    if (user) {
      console.log('found user', user)
      user.getPressures()
      .then((bps) => {
        console.log('bps',bps)
        res.json({
          user,
          bps
        })
      })
    }

    console.log('regiestered: ', req.body)
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      clientID: req.body.clientID
    })

    newUser.save();
    res.json({
      user: newUser,
      bps: []
    })
  })
})

app.get('/auth0', function (req, res) {
  console.log('req');
   console.log('user', req.user)
  res.json({ status : 'auth0'});
})

app.post('/login', (req, res) => {
  console.log('req', req.body.email)
  User.findOne({
    email: req.body.email,
  })
  .then( (user) => {
    console.log('user', user)
    if (!user) {
      console.log('no user found')
      // res.redirect('/register');
      throw new Error('user does not exist')
    }

    console.log('success')

    user.getPressures()
    .then((bps) => {
      console.log('got bps', bps)
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

app.post('/BP', (req, res) => {
  User.findOne({
    email: req.body.email,
    clientId: req.body.clientID
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
  res.json({ data: 'hello world'})
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}!`)
})
