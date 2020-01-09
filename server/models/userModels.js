'use strict'; // so Mongo would not sort the coordinate numbers
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//set schema for user
const userSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: Number, required: true, unique: true },
  pass: { type: String, required: true },
  car: {
    car_make: { type: String },
    car_model: { type: String },
    car_color: { type: String }
  }
});

const User = mongoose.model('User', userSchema);

const parkingSchema = new Schema({
  spot: {
    coordinate: { type: [Number, Number], required: true },
    available_time: { type: Date, expires: 180, default: Date.now },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'user'
    },
    username: String,
    feature: { type: String, default: 'Add Pin' }
  }
});

const Parking = mongoose.model('parking', parkingSchema);

const countDownSchema = new Schema({
  spot: {
    coordinate: { type: [Number, Number], required: true},
    available_time: { type: Date, default: Date.now},
    user_id: {
      type: Schema.Types.ObjectId,
      ref:'user'
    },
    username: String,
    feature: { type: String, default: 'Add Park' }
  }
});

const CountDown = mongoose.model('countdown', countDownSchema);

module.exports = {
  User,
  Parking,
  CountDown
};
