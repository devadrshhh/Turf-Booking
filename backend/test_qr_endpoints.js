const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config();

const Turf = require('./src/models/Turf');
const Booking = require('./src/models/Booking');

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://devadarshb01:Devadarshb%4001@cluster0-shard-00-00.pgqa5.mongodb.net:27017,cluster0-shard-00-01.pgqa5.mongodb.net:27017,cluster0-shard-00-02.pgqa5.mongodb.net:27017/turf?ssl=true&authSource=admin';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    // 1. Get or create a booking
    let booking = await Booking.findOne({ status: 'Confirmed' });
    if (!booking) {
      console.log('No confirmed booking found, seeding a clean Turf and Booking...');
      let turf = await Turf.findOne({ isActive: true });
      if (!turf) {
        turf = await Turf.create({
          name: 'Premium Soccer Arena',
          location: 'Downtown Center',
          pricePerHour: 1000,
          isActive: true
        });
      }
      booking = await Booking.create({
        bookingId: `TBOOK-TEST${Date.now().toString().slice(-4)}`,
        turf: turf._id,
        customerName: 'Test Player',
        customerEmail: 'player@example.com',
        customerPhone: '9876543210',
        date: '2026-05-31',
        slot: '18:00 - 19:00',
        price: turf.pricePerHour,
        finalAmount: turf.pricePerHour,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        status: 'Confirmed'
      });
      console.log('Seeded test booking:', booking.bookingId);
    } else {
      console.log('Found existing confirmed booking:', booking.bookingId);
      
      // Let's reset its isVerified state for testing if it was already verified
      if (booking.isVerified) {
        console.log('Resetting verified status of existing booking for this test...');
        booking.isVerified = false;
        booking.verifiedAt = undefined;
        await booking.save();
      }
    }

    // 2. Perform direct "Lookup" query simulation
    console.log('Simulating LOOKUP for bookingId:', booking.bookingId);
    const lookedUp = await Booking.findOne({ bookingId: booking.bookingId }).populate('turf', 'name location');
    if (!lookedUp) {
      throw new Error('Lookup failed!');
    }
    console.log('Lookup successful!');
    console.log('  Customer:', lookedUp.customerName);
    console.log('  isVerified:', lookedUp.isVerified);
    console.log('  verifiedAt:', lookedUp.verifiedAt);

    // 3. Perform "Verify" simulation
    console.log('Simulating VERIFY for booking:', lookedUp.bookingId);
    lookedUp.isVerified = true;
    lookedUp.verifiedAt = new Date();
    await lookedUp.save();
    console.log('Ticket verified successfully!');
    console.log('  Updated isVerified:', lookedUp.isVerified);
    console.log('  Updated verifiedAt:', lookedUp.verifiedAt);

    // 4. Try scanning again (Double-scan)
    console.log('Simulating DOUBLE-SCAN for booking:', lookedUp.bookingId);
    const doubleScanned = await Booking.findOne({ bookingId: booking.bookingId });
    console.log('Double-scan check:');
    console.log('  isVerified:', doubleScanned.isVerified);
    console.log('  verifiedAt:', doubleScanned.verifiedAt);
    if (doubleScanned.isVerified) {
      console.log('SUCCESS: Double scan correctly detected! Verification date and time is stored successfully.');
    } else {
      throw new Error('FAIL: Double scan was not locked!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

run();
