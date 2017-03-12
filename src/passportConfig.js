import Auth0Strategy from 'passport-auth0'
import dotenv from 'dotenv'

import User from './schema/user'

dotenv.config();


var strategy = new Auth0Strategy({
   domain:       process.env.DOMAIN,
   clientID:     process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET,
   callbackURL:  process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

export default function setup(passport) {
  passport.use(strategy);

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}

export function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()){

    console.log('ok')
    return next();
  }
  else { 
    console.log('not ok', req.headers)
    res.json('not ok')
  }
}

