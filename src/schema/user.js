import mongoose, { Schema } from 'mongoose';
import moment from 'moment'

import BloodPressure from './bloodPressure'

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  bloodPressures: [{
    type: Schema.Types.ObjectId,
    ref: 'BloodPressure'
  }]
})

let getQuery = function(model, instances, sortParams) {
  if (Array.isArray(instances)) {
    if (sortParams) {
      return model.find(instances.map((instance) => instance._id)).sort(sortParams)
    }
      return model.find(instances.map((instance) => instance._id))
  } else {
    return model.find(instances._id)
  }
}

userSchema.methods.getPressures = function() {
  return getQuery(BloodPressure, this.bloodPressures, { date: 1 })
  // .then( (data) => {
  //   return data.sortBy({ date: -1 })
  // })
  // .catch( (err) => {
  //   return err
  // })
}

// userSchema.methods.filterPressuresByDate = function(int0, int1) {
//   // days = 30, 60, 90, etc...
//   var rangeStart = int0? moment || moment().now('YYYY-MM-DD');
//   var rangeEnd = 
//   getQuery(BloodPressure, this.bloodPressures)
//   .then( (data) => {
//     data.findAll({
//       date: {
//         $
//       }
//     })
//   })
//   return getQuery(BloodPressure, this.bloodPressures)

// }

userSchema.methods.addBP = function(bloodPressure) {
  console.log('added bp')
  if (typeof bloodPressure === 'BloodPressure') {
    console.log('right type')
  }
  return this.update({
    $addToSet: {
      bloodPressures: bloodPressure
    }
  })
}

export { userSchema }

export default mongoose.model('User', userSchema)

