const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['Percentage', 'Fixed'],
      required: [true, 'Please specify discount type (Percentage or Fixed)'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum booking amount cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: 0, // Max cap for Percentage discounts
      min: [0, 'Maximum discount cap cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
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

module.exports = mongoose.model('Coupon', couponSchema);
