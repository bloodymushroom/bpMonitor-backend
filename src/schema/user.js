import mongoose, { Schema } from 'mongoose';
import moment from 'moment'

import BloodPressure from './bloodPressure'

const userSchema = new Schema({
  username: String,
  email: String,
  clientID: String,
  bloodPressures: [{
    type: Schema.Types.ObjectId,
    ref: 'BloodPressure'
  }]
})

let getQuery = function(model, instances, sortParams) {
  if (Array.isArray(instances)) {
    var result = model.find( {
      '_id': {
        $in: 
          instances.map((instance) => {
            return mongoose.Types.ObjectId(instance)
          })
      }
    }).sort(sortParams);
    // console.log('got', result, 'pressures')
    return sortParams? result.sort(sortParams) : result;
  } else {
    return model.find(instances._id)
  }
}

userSchema.methods.getPressures = function() {
  // console.log('got', this.bloodPressures.length, 'pressures')
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
  console.log('added bp', this.email)
  if (typeof bloodPressure === 'BloodPressure') {
    console.log('right type')
  }
  // console.log('date', bloodPressure.date)

  // return this.update({
  //   bloodPressures: {
  //     $elemMatch: {
  //       date: new Date(bloodPressure.date)
  //     }
  //   }},
  //   {
  //     $set : {
  //       'bloodPressures.$.systole': bloodPressure.systole,
  //       'bloodPressures.$.diastole': bloodPressure.diastole,
  //     }
  //   }
  // )
  return this.update({
    $addToSet: {
      bloodPressures: bloodPressure
    }
  })
}

export { userSchema }

export default mongoose.model('User', userSchema)

