import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import session from 'express-session'

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


// start a session for the user
app.use(session({
  store: new MongoStore({
    url: dbConfig.url
  }),
  secret: dbConfig.secret,
  resave: false,
  saveUninitialized: false
}))
// app.use(passport.initialize())
// app.use(passport.session())

// body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

// allow CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Credentials', 'true')

  next()
})

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

app.post('/login', (req, res) => {
  User.findOne({
    email: req.body.email,
    password: req.body.password
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

app.post('/BP', (req, res) => {
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
  res.json({ data: 'hello world'})
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}!`)
})
