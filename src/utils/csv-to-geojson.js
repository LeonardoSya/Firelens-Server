import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function convertCsvToGeojson(inputFileName, outputFileNamePrefix) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const outputFileName = `${outputFileNamePrefix}_${today}.geojson`;
  const csvDir = path.join(__dirname, "..", "..", "data", "csv");
  const geojsonDir = path.join(__dirname, "..", "..", "data", "geojson");
  const inputFilePath = path.join(csvDir, inputFileName);
  const outputFilePath = path.join(geojsonDir, outputFileName);

  return new Promise((resolve, reject) => {
    const existingGeojsonFiles = fs.readdirSync(geojsonDir);
    const isOutdated = existingGeojsonFiles.every(
      (file) => !file.includes(today)
    );

    if (isOutdated) {
      console.log("检测到现有GeoJSON文件不是今天的日期,清空文件夹...");
      existingGeojsonFiles.forEach((file) => {
        fs.unlinkSync(path.join(geojsonDir, file));
        console.log(`已删除GeoJSON文件: ${file}`);
      });
    }

    if (!fs.existsSync(inputFilePath)) {
      console.log(`错误：找不到CSV文件 ${inputFileName}`);
      reject(new Error(`找不到文件 ${inputFileName}`));
      return;
    }

    if (fs.existsSync(outputFilePath)) {
      console.log("今日的Geojson文件已存在，无需重新生成");
      resolve(outputFilePath);
      return;
    }

    const results = [];

    fs.createReadStream(inputFilePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const geojson = {
          type: "FeatureCollection",
          features: results.map((row) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [
                parseFloat(row.longitude),
                parseFloat(row.latitude),
              ],
            },
            properties: {
              bright_ti4: parseFloat(row.bright_ti4),
              scan: parseFloat(row.scan),
              track: parseFloat(row.track),
              acq_date: row.acq_date,
              acq_time: row.acq_time,
              satellite: row.satellite,
              confidence: row.confidence,
              version: row.version,
              bright_ti5: parseFloat(row.bright_ti5),
              frp: parseFloat(row.frp),
              daynight: row.daynight,
            },
          })),
        };

        fs.writeFileSync(outputFilePath, JSON.stringify(geojson, null, 2));
        console.log(`转换完成,已生成 ${outputFileName} 文件`);
        resolve(outputFilePath);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

export default convertCsvToGeojson;
