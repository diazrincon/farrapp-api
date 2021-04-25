const { Schema } = require('mongoose');
const locationSchema = require('./location.schema');
const reviewSchema = require('./review.schema');
const eventTicketSchema = require('./eventTicket.schema');

const eventSchema = new Schema({
  eventName: { type: String, required: true },
  description: { type: String, required: true },
  establishment: {
    type: {
      establishmentId: { type: String, required: true },
      establishmentName: { type: String, required: true },
    },
    required: true,
  },
  minAge: { type: Number, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, required: true },
  location: { type: locationSchema, required: true },
  capacity: { type: Number, required: true },
  photoUrls: { type: [String], required: true },
  categories: { type: [String], required: true },
  dressCodes: { type: [String], required: true },
  tickets: { type: [eventTicketSchema], required: true },
  reviews: [reviewSchema],
});

module.exports = eventSchema;
