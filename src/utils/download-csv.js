import fs from "fs";
import got from "got";

const downloadCsv = async (url, dest) => {
  const writeStream = fs.createWriteStream(dest);
  try {
    await got
      .stream(url)
      .on("downloadProgress", (progress) => {
        const percent = (progress.percent * 100).toFixed(2);
        process.stdout.write(`下载进度: ${percent}%\r`);
      })
      .pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    console.log("\nCSV 文件下载完成");
    const stats = await fs.promises.stat(dest);
    console.log("下载完成，文件大小:", stats.size, "字节");
  } catch (error) {
    console.error("下载出错:", error);
  }
};

export default downloadCsv;
