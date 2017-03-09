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
  console.log('register', req.body)
  res.send({
    user: 'user',
    bp: [1, 2, 3, 4]
  })
})

app.post('/login', (req, res) => {
  console.log('login', req.body)
  res.json('okay')
})


app.get('/', (req, res) => {
  res.json({ data: 'hello world'})
})


app.listen(port, () => {
  console.log(`Server listening on port ${port}!`)
})
