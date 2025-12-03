import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });
const port = 4000;

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// Helper function to calculate color distance
const colorDistance = (
  color1: [number, number, number],
  color2: [number, number, number]
): number => {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;
  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
};

// Helper function to get color info with additional properties
const getColorInfo = (
  rgb: [number, number, number],
  count: number = 0,
  total: number = 0
) => {
  const [r, g, b] = rgb;
  return {
    hex: rgbToHex(r, g, b),
    red: r,
    green: g,
    blue: b,
    rgb: `rgb(${r}, ${g}, ${b})`,
    count: count,
    percentage: total > 0 ? ((count / total) * 100).toFixed(2) : 0,
    luminance: (0.299 * r + 0.587 * g + 0.114 * b) / 255,
    isDark: 0.299 * r + 0.587 * g + 0.114 * b < 128,
  };
};

// Method 1: Using Sharp with advanced color extraction
app.post("/api/colors", upload.array("images", 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    console.log("Uploaded files:", req.files);


    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file Uploaded" });
    }

    const results = [];

    for (const file of files) {
      const filePath = path.resolve(file.path);
      try {
        const { dominant } = await sharp(filePath).stats();
        const { data, info } = await sharp(filePath)
          .resize(200, 200, { fit: "inside" })
          .raw()
          .toBuffer({ resolveWithObject: true });

        const colorMap = new Map<string, number>();
        const step = 3;
        for (let i = 0; i < data.length; i += info.channels * step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luminance < 20 || luminance > 235) continue;

          const groupedR = Math.round(r / 25) * 25;
          const groupedG = Math.round(g / 25) * 25;
          const groupedB = Math.round(b / 25) * 25;

          const colorKey = `${groupedR},${groupedG},${groupedB}`;
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }

        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20);

        const uniqueColors: Array<{
          color: [number, number, number];
          count: number;
        }> = [];
        const minDistance = 50;

        for (const [colorKey, count] of sortedColors) {
          const [r, g, b] = colorKey.split(",").map(Number) as [
            number,
            number,
            number
          ];

          const isSimilar = uniqueColors.some(
            (existing) => colorDistance(existing.color, [r, g, b]) < minDistance
          );

          if (!isSimilar && uniqueColors.length < 8) {
            uniqueColors.push({ color: [r, g, b], count });
          }
        }

        const totalPixels = data.length / info.channels;
        const palette = uniqueColors.map(({ color, count }) =>
          getColorInfo(color, count, totalPixels)
        );

        // Add result to response array
        results.push({
          fileName: file.originalname,
          dominantColor: getColorInfo([dominant.r, dominant.g, dominant.b]),
          palette,
          imageInfo: {
            width: info.width,
            height: info.height,
            channels: info.channels,
          },
        });

        fs.unlink(filePath, () => {});
      } catch (error) {
        console.error(
          `Failed to process file ${file.originalname}:`,
          error.message
        );
        fs.unlink(filePath, () => {});
        results.push({
          fileName: file.originalname,
          error: "Failed to process image",
          details: error.message,
        });
      }
    }
    return res.json(results);
  } catch (error) {
    console.error("error occured", error);
  }
});
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
