const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const GeoData = require('./models/geoData')
require('dotenv').config()

const mongoURI = process.env.MONGO_URI

const app = express()
const port = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 连接mongodb
mongoose.connect(mongoURI)
// 检查数据库连接
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB!')
})

// 路由
app.get('/api/mapdata', async (req, res) => {
  try {
    const { date, day, night } = req.query
    let filter = {}

    filter.date = date

    if (day && night) {
    } else if (day) {
      filter['features.properties.DayNight'] = 100
    } else if (night) {
      filter['features.properties.DayNight'] = 0
    }

    const geoData = await GeoData.find(filter)
    res.json(geoData)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})