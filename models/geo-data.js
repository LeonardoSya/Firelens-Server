const mongoose = require("mongoose");

const geoDataSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  bright_ti4: {
    type: Number,
    required: true,
  },
  scan: {
    type: Number,
    required: true,
  },
  track: {
    type: Number,
    required: true,
  },
  acq_date: {
    type: Date,
    required: true,
  },
  acq_time: {
    type: Number,
    required: true,
  },
  satellite: {
    type: String,
    required: true,
  },
  confidence: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  bright_ti5: {
    type: Number,
    required: true,
  },
  frp: {
    type: Number,
    required: true,
  },
  daynight: {
    type: String,
    required: true,
  },
});

geoDataSchema.index({ latitude: 1, longitude: 1 });

const GeoData = mongoose.model("GeoData", geoDataSchema, "global-48h-data");

module.exports = GeoData;
