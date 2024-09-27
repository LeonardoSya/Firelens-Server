import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import downloadCsv from "../utils/download-csv.js";
import convertCsvToGeojson from "../utils/csv-to-geojson.js";
import addNdviToCsv from "../utils/add-ndvi-to.csv.js";

const checkAndUpdateData = async (
  geoJsonPath,
  csvUrl,
  csvPath,
  ndviCsvPath,
  tifPath,
  port
) => {
  try {
    const stats = await promisify(fs.stat)(geoJsonPath).catch(() => null);
    const today = new Date();

    if (!stats || stats.mtime.toDateString() !== today.toDateString()) {
      console.log("GeoJSON 文件不是最新数据,正在从NASA下载新数据...");

      try {
        await downloadCsv(csvUrl, csvPath);
        console.log("最新热点数据下载完成");
        await addNdviToCsv(csvPath, ndviCsvPath, tifPath);
        console.log("热点数据处理完成，正在转换为 GeoJSON...");
        await convertCsvToGeojson(
          path.basename(ndviCsvPath),
          "J2_VIIRS_C2_Global_48h"
        );
        console.log("数据更新处理完毕，即将进行数据入库");
        // 数据入库
        const importCommand = `mongoimport --uri "mongodb://localhost:27017/firelens" --collection "global-48h-data" --type csv --file ${ndviCsvPath} --headerline --drop`;
        await new Promise((resolve, reject) => {
          exec(importCommand, (error, stdout) => {
            if (error) {
              console.error(`导入数据库错误: ${error}`);
              reject(error);
            }
            console.log(`最新数据已成功导入数据库 ${stdout}`);
            resolve();
          });
        });
        console.log(`\n>>> Firelens Server Successfully Started on port ${port} >>>\n`);
      } catch (error) {
        console.error("数据处理过程中出错:", error);
      }
    } else {
      console.log("热点数据无需更新");
      console.log(`\n>>> Firelens Server Successfully Started on port ${port} >>>\n`);
    }
  } catch (error) {
    console.error("检查或更新文件时出错:", error);
  }
};

export default checkAndUpdateData;
