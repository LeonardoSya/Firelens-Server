import express from "express";
import GeoData from "../models/geo-data.js";

const router = express.Router();

router.get("/global-48h-data", async (req, res) => {
  try {
    const {
      minLat,
      maxLat,
      minLon,
      maxLon,
      confidence,
      minBrightTi4,
      maxBrightTi4,
      minBrightTi5,
      maxBrightTi5,
      minFrp,
      maxFrp,
      startDate,
      endDate,
      daynight,
      ndvi,
    } = req.query;

    let query = {
      latitude: { $gte: parseFloat(minLat), $lte: parseFloat(maxLat) },
      longitude: { $gte: parseFloat(minLon), $lte: parseFloat(maxLon) },
    };

    if (confidence) query.confidence = confidence;
    if (minBrightTi4 || maxBrightTi4) {
      query.bright_ti4 = {};
      if (minBrightTi4) query.bright_ti4.$gte = parseFloat(minBrightTi4);
      if (maxBrightTi4) query.bright_ti4.$lte = parseFloat(maxBrightTi4);
    }
    if (minBrightTi5 || maxBrightTi5) {
      query.bright_ti5 = {};
      if (minBrightTi5) query.bright_ti5.$gte = parseFloat(minBrightTi5);
      if (maxBrightTi5) query.bright_ti5.$lte = parseFloat(maxBrightTi5);
    }
    if (minFrp || maxFrp) {
      query.frp = {};
      if (minFrp) query.frp.$gte = parseFloat(minFrp);
      if (maxFrp) query.frp.$lte = parseFloat(maxFrp);
    }
    if (startDate || endDate) {
      query.acq_date = {};
      if (startDate) query.acq_date.$gte = startDate;
      if (endDate) query.acq_date.$lte = endDate;
    }
    if (daynight) query.daynight = daynight;
    if (ndvi) query.ndvi = { $gt: 2000 };

    console.log("查询条件:", JSON.stringify(query, null, 2));

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
        ndvi: feature.ndvi,
      },
    }));

    const responseData = {
      type: "FeatureCollection",
      features: geoJsonFeatures,
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ message: "获取数据时出错", error: error.message });
  }
});

export default router;
