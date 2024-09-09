const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const GeoData = require("./models/geo-data");
const convertCsvToGeojson = require("./funcs/cvs-to-geojson");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// mongoose.connect(mongoURI)
mongoose.connect("mongodb://localhost:27017/firelens");
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB!");
});

const importCommand = `mongoimport --uri "mongodb://localhost:27017/firelens" --collection "global-48h-data" --type csv --file ./data/csv/J2_VIIRS_C2_Global_48h.csv --headerline --drop`;

exec(importCommand, (error, stdout) => {
  if (error) {
    console.error(`执行错误: ${error}`);
    return;
  }
  console.log(`导入成功 ${stdout}`);
});

// 在服务器启动时检查并生成GeoJSON文件
async function checkAndGenerateGeoJSON() {
  try {
    const geoJsonPath = await convertCsvToGeojson();
    console.log(`GeoJSON文件路径: ${geoJsonPath}`);
  } catch (error) {
    console.error("生成GeoJSON文件时出错:", error);
  }
}

app.get("/api/global-48h-data", async (req, res) => {
  // 数据存储在本地mongodb
  try {
    const { minLat, maxLat, minLon, maxLon } = req.query;

    const query = {
      latitude: { $gte: parseFloat(minLat), $lte: parseFloat(maxLat) },
      longitude: { $gte: parseFloat(minLon), $lte: parseFloat(maxLon) },
    };

    const features = await GeoData.find(query).lean();
    console.log("查询结果数量:", features.length);

    const geoJsonFeatures = features.map((feature) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [feature.longitude, feature.latitude],
      },
      properties: {
        bright_ti4: feature.bright_ti4,
        scan: feature.scan,
        track: feature.track,
        acq_date: feature.acq_date,
        acq_time: feature.acq_time,
        satellite: feature.satellite,
        confidence: feature.confidence,
        version: feature.version,
        bright_ti5: feature.bright_ti5,
        frp: feature.frp,
        daynight: feature.daynight,
      },
    }));

    console.log("示例feature:", geoJsonFeatures.slice(0, 1));

    const responseData = {
      type: "FeatureCollection",
      features: geoJsonFeatures,
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: "获取数据时出错", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  checkAndGenerateGeoJSON();
});
