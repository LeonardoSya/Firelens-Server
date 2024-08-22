const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 创建Mongoose模型来匹配GeoJSON数据结构
const geoDataSchema = new Schema([{
  type: {
    type: String,
    emun: ['FeatureCollection'],
    required: true
  },
  features: [
    {
      type: {
        type: String,
        enum: ['Feature'],
        required: true
      },
      geometry: {
        geodesic: Boolean,
        type: {
          type: String,
          enum: ['Point', 'LineString', 'Polygon'],
          required: true
        },
        coordinates: {
          type: [[Number]],
          required: true
        }
      },
      id: String,
      properties: {
        Bright_ti5: Number,
        DayNight: Number,
        confidence: Number,
        fire_point: Number,
        frp: Number,
      },
      date: {
        type: String,
        required: true
      }
    }
  ]
}])

const GeoData = mongoose.model('GeoData', geoDataSchema, 'feature-collection')

module.exports = GeoData