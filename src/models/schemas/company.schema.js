const uniqueValidator = require('mongoose-unique-validator');
const { Schema } = require('../../config/config.database');

const eventPreviewSchema = require('./eventPreview.schema');
const establishmentPreviewSchema = require('./establishmentPreview.schema');

const companySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: 'Users' },
    companyName: { type: String, unique: true, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    nit: { type: String, required: true, unique: true },
    establishments: [establishmentPreviewSchema],
    events: [eventPreviewSchema],
  },
  {
    timestamps: true,
  },
);

companySchema.plugin(uniqueValidator);

module.exports = companySchema;