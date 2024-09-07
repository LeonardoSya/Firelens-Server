const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

function convertCsvToGeojson() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const inputFileName = "J2_VIIRS_C2_Global_48h.csv";
  const outputFileName = `J2_VIIRS_C2_Global_48h_${today}.geojson`;
  const csvDir = path.join(__dirname, "..", "data", "csv");
  const geojsonDir = path.join(__dirname, "..", "data", "geojson");
  const inputFilePath = path.join(csvDir, inputFileName);
  const outputFilePath = path.join(geojsonDir, outputFileName);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputFilePath)) {
      console.log(`错误：找不到今天的CSV文件 ${inputFileName}`);
      reject(new Error(`找不到文件 ${inputFileName}`));
      return;
    }

    if (fs.existsSync(outputFilePath)) {
      console.log("今日的Geojson文件已存在，无需重新生成");
      resolve(outputFilePath);
      return;
    }

    fs.readdirSync(csvDir).forEach((file) => {
      if (file !== inputFileName) {
        fs.unlinkSync(path.join(csvDir, file));
        console.log(`已删除旧CSV文件: ${file}`);
      }
    });

    fs.readdirSync(geojsonDir).forEach((file) => {
      if (file !== outputFileName) {
        fs.unlinkSync(path.join(geojsonDir, file));
        console.log(`已删除旧GeoJSON文件: ${file}`);
      }
    });

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

module.exports = convertCsvToGeojson;
