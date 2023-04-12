import fs from "fs";
import * as dotenv from "dotenv";
import express from "express";
import path from "path";

dotenv.config();
const app = express();
const rootDir = process.env.ROOT_DIR ?? "./audio";

function getWavFiles(dir: string, files: { [key: string]: string } = {}) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      getWavFiles(filePath, files);
    } else if (path.extname(file) === ".wav") {
      const key = path.basename(file, ".wav");
      files[key] = filePath;
    }
  });

  return files;
}

const wavFiles = getWavFiles(rootDir);

app.get("/audio/:fileName", (req, res) => {
  const { fileName } = req.params;
  const filePath = wavFiles[fileName];

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).send("File not found");
      return;
    }

    res.setHeader("Content-Type", "audio/wav");
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
