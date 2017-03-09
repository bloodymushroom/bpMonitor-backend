import mongoose, { Schema } from 'mongoose';

import BloodPressure from './bloodPressure'

const userSchema = new Schema({
  name: String,
  email: String,
  bloodPressures: [{
    type: Schema.Types.ObjectId,
    ref: 'BloodPressure'
  }]
})

let getQuery = function(model, instances) {
  if (Array.isArray(instances)) {
    return model.find(instances.map((instance) => instance._id))
  } else {
    return model.find(instances._id)
  }
}

userSchema.methods.getPressures = function() {
  return getQuery(BloodPressure, this.bloodPressures);
}

export { userSchema }

export default mongoose.model('User', userSchema)

