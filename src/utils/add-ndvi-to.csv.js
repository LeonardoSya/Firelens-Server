import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import { fromFile } from "geotiff";

const addNdviToCsv = async (csvInputPath, csvOutputPath, tifPath) => {
  try {
    console.log("正在分析每个火点ndvi值...");

    const tiff = await fromFile(tifPath);
    const image = await tiff.getImage();
    const rasters = await image.readRasters();
    const bbox = image.getBoundingBox();

    const [xMin, yMin, xMax, yMax] = bbox;
    const width = image.getWidth();
    const height = image.getHeight();

    const getNdvi = (lat, lon) => {
      const x = ((lon - xMin) / (xMax - xMin)) * width;
      const y = ((yMax - lat) / (yMax - yMin)) * height;
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix < 0 || ix >= width || iy < 0 || iy >= height) return null;
      return rasters[0][iy * width + ix];
    };

    const results = [];
    const headers = [
      "latitude",
      "longitude",
      "bright_ti4",
      "scan",
      "track",
      "acq_date",
      "acq_time",
      "satellite",
      "confidence",
      "version",
      "bright_ti5",
      "frp",
      "daynight",
      "ndvi",
    ];

    fs.createReadStream(csvInputPath)
      .pipe(csv())
      .on("data", (data) => {
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        const ndvi = getNdvi(lat, lon);
        data.ndvi = ndvi !== null ? ndvi : "";
        results.push(data);
      })
      .on("end", async () => {
        const csvWriter = createObjectCsvWriter({
          path: csvOutputPath,
          header: headers.map((header) => ({ id: header, title: header })),
        });

        await csvWriter.writeRecords(results);
        console.log("已添加ndvi并保存到新的csv文件");
      });
  } catch (error) {
    console.error("添加ndvi时出错", error);
  }
};

export default addNdviToCsv;
