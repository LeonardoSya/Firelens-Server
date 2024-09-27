import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDB from "./config/database.js";
import router from "./routes/router.js";
import checkAndUpdateData from "./services/check-update.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;
const csvFileName = "J2_VIIRS_C2_Global_48h.csv";
const ndviCsvFileName = "J2_VIIRS_C2_Global_48h.csv";
const geoJsonFileNamePrefix = "J2_VIIRS_C2_Global_48h";
const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const csvUrl = `https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/${csvFileName}`;
const csvPath = path.join(__dirname, "data", "csv", csvFileName);
const ndviCsvPath = path.join(__dirname, "data", "csv", ndviCsvFileName);
const tifPath = path.join(__dirname, "data", "ndvi_tif", "ndvi2407.tif");
const geoJsonPath = path.join(
  __dirname,
  "data",
  "geojson",
  `${geoJsonFileNamePrefix}_${today}.geojson`
);

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/api", router);

app.listen(port, () => {
  checkAndUpdateData(geoJsonPath, csvUrl, csvPath, ndviCsvPath, tifPath, port);
});
