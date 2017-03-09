import mongoose, { Schema } from 'mongoose'

const bloodPressureSchema = new Schema({
  date: Date,
  systole: Number,
  diastole: Number
})

export { bloodPressureSchema }

export default mongoose.model('BloodPressure', bloodPressureSchema)