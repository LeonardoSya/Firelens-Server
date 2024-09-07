const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const GeoData = require("./models/geoData");
const convertCsvToGeojson = require("./funcs/cvs-to-geojson");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

const app = express();
const port = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 连接mongodb
// mongoose.connect(mongoURI)
mongoose.connect("mongodb://localhost:27017/firelens");
// 检查数据库连接
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB!");
});

// 在服务器启动时检查并生成GeoJSON文件
async function checkAndGenerateGeoJSON() {
  try {
    const geoJsonPath = await convertCsvToGeojson();
    console.log(`GeoJSON文件路径: ${geoJsonPath}`);
    // 这里可以添加将GeoJSON数据导入到MongoDB的逻辑
  } catch (error) {
    console.error("生成GeoJSON文件时出错:", error);
  }
}

app.get("/api/global-48h-data", async (req, res) => {
  // 数据存储在node.js
  // try {
  //   const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  //   const fileName = `J2_VIIRS_C2_Global_48h_${today}.geojson`;
  //   const filePath = path.join(__dirname, "data", "geojson", fileName);

  //   if (fs.existsSync(filePath)) {
  //     const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  //     // 获取查询参数
  //     const { minLat, maxLat, minLon, maxLon, zoomLevel } = req.query;

  //     // 根据缩放级别决定是否过滤数据
  //     const zoomThreshold = 5; // 可以根据需要调整这个阈值

  //     let filteredFeatures = data.features;
  //     if (zoomLevel && parseInt(zoomLevel) > zoomThreshold) {
  //       filteredFeatures = data.features.filter((feature) => {
  //         const [lon, lat] = feature.geometry.coordinates;
  //         return (
  //           lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
  //         );
  //       });
  //     }

  //     // 抽样
  //     const maxFeatures = 5000;
  //       if (filteredFeatures.length > maxFeatures) {
  //         const step = Math.floor(filteredFeatures.length / maxFeatures);
  //         filteredFeatures = filteredFeatures.filter((_, index) => index % step === 0);
  //       }

  //     const responseData = {
  //       type: "FeatureCollection",
  //       features: filteredFeatures,
  //     };

  //     res.json(responseData);
  //   } else {
  //     res.status(404).json({ message: "找不到最新的GeoJSON数据文件" });
  //   }
  // } catch (error) {
  //   res.status(500).json({ message: "获取数据时出错", error: error.message });
  // }

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

    console.log("第一个feature:", geoJsonFeatures.slice(0, 1));

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
