const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the turf name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide the location'],
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Please provide the price per hour'],
      min: [0, 'Price cannot be negative'],
      default: 1,
    },
    description: {
      type: String,
      trim: true,
    },
    sportType: {
      type: String,
      required: [true, 'Please specify the sport type (e.g., Football, Cricket)'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Turf', turfSchema);
