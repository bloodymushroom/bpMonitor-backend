import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

// auth
import session from 'express-session'
import jwt from 'express-jwt'
import dotenv from 'dotenv'
dotenv.config()
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
// allow CORS
app.use((req, res, next) => {
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
  User.findOne({
    email: req.body.email
  })
  .then( (user) => {
    if (user) {
      user.getPressures()
      .then((bps) => {
        console.log('got', bps.length, 'BPs')
        res.json({
          user,
          bps
        })
      })
    } else {
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
    }
  })
})

app.get('/auth0', function (req, res) {
  res.json({ status : 'auth0'});
})

app.post('/login', (req, res) => {
  User.findOne({
    email: req.body.email,
  })
  .then( (user) => {
    if (!user) {
      throw new Error('user does not exist')
    }

    user.getPressures()
    .then((bps) => {
      res.json({
        user,
        bps
      })
    })
  })
  .catch((err) => {

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

    // console.log(new Date(req.body.bp.date))

    // user.getPressures().update({
    //   systole: 120
    // }, {
    //   systole: req.body.bp.systole,
    //   diastole: req.body.bp.diastole
    // }, {
    //   upsert: true
    // })
    // .then( (data) => {
    //   console.log('updated', data),
    //   res.json(data)
    // })
    // .catch( (err) => {
    //   console.log('error')
    //   res.json(err)
    // })

    const newBP = new BloodPressure({
      date: new Date(req.body.bp.date) || new Date(),
      systole: req.body.bp.systole,
      diastole: req.body.bp.diastole
    })

    newBP.save();

    user.addBP(newBP)
    .then( (user) => {
      console.log('updated', user)
      res.json(user)
    })
    .catch( (e) => {
      res.send('error')
    })
  })
  .catch((err) => {
    res.status(400).json({
      status: false,
      message: err.message
    })
  })
})

app.get('/BP', (req, res) => {

  res.send('got a query')
})

app.get('/', (req, res) => {
  res.json({ data: 'hello world'})
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}!`)
})
