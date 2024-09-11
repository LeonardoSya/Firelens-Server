import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import downloadCsv from "../utils/download-csv.js";
import convertCsvToGeojson from "../utils/csv-to-geojson.js";

const checkAndUpdateData = async (geoJsonPath, csvUrl, csvPath) => {
  try {
    const stats = await promisify(fs.stat)(geoJsonPath).catch(() => null);
    const today = new Date();

    if (!stats || stats.mtime.toDateString() !== today.toDateString()) {
      console.log("GeoJSON 文件不是最新数据,正在从NASA下载新数据...");
      await downloadCsv(csvUrl, csvPath);
      console.log("CSV 文件下载完成，正在转换为 GeoJSON...");
      await convertCsvToGeojson(
        path.basename(csvPath),
        "J2_VIIRS_C2_Global_48h"
      );
      console.log("数据更新完成，即将进行数据入库");

      // 数据入库
      const importCommand = `mongoimport --uri "mongodb://localhost:27017/firelens" --collection "global-48h-data" --type csv --file ${csvPath} --headerline --drop`;
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
    } else {
      console.log("GeoJSON 文件为最新数据,无需更新");
    }
  } catch (error) {
    console.error("检查或更新文件时出错:", error);
  }
};

export default checkAndUpdateData;
