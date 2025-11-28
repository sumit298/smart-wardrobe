"use client";

import { useState } from "react";

interface ColorInfo {
  hex: string;
  red: number;
  green: number;
  blue: number;
  rgb: string;
  count: number;
  percentage: string;
  luminance: number;
  isDark: boolean;
}

interface ColorPaletteData {
  dominantColor: ColorInfo;
  palette: ColorInfo[];
  imageInfo: {
    width: number;
    height: number;
    channels: number;
  };
}

export default function Home() {
  const [file, setFile] = useState<File[] | null>(null);
  const [fileName, setFileName] = useState<string[] | null>([]);
  const [previewUrl, setPreviewUrl] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [colorData, setColorData] = useState<ColorPaletteData[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = Array.from(e.target.files || [])
    if (selectedFile.length > 0) {
      setFile(selectedFile);
      setFileName(selectedFile.map((file) => file.name));
      setColorData(null); // Reset color data when new file is selected

      const previewUrl = selectedFile.map((file) => {
        return URL.createObjectURL(file);
      })

      setPreviewUrl(previewUrl);

      // if (selectedFile.type.startsWith("image/")) {
      //   const reader = new FileReader();
      // dasdskmdsmdms
      //   reader.onload = () => {
      //     setPreviewUrl(reader.result as string);
      //   };
      //   reader.readAsDataURL(selectedFile);
      // } else {
      //   setPreviewUrl(null);
      // }
    }
  };

  const handleSubmit = async () => {
    if (file && file.length === 0) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      file?.map((f) => formData.append('images', f));

      const res = await fetch("http://localhost:4000/api/colors", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data: ColorPaletteData[] = await res.json();
        console.log("Color Palette:", data);
        setColorData(data);
        setMessage("✅ Colors extracted successfully!");
      } else {
        setMessage("❌ Upload failed. Try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage(`📋 Copied ${text} to clipboard!`);
    setTimeout(() => setMessage(""), 2000);
  };

  const resetAll = () => {
    setFile(null);
    setFileName(null);
    setPreviewUrl(null);
    setColorData(null);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                🎨
              </div>
              <label
                htmlFor="file-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer transition duration-200"
              >
                Choose Image
              </label>
              <input
                id="file-upload"
                multiple
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {fileName && (
              <p className="text-sm text-gray-700 text-center">
                Selected file: <span className="font-medium">{fileName}; </span>
              </p>
            )}

            {previewUrl && previewUrl?.length > 0 && (

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {previewUrl.map((preview, idx) => (
                  <img src={preview} alt={`preview`} key={idx} />
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                disabled={!fileName}
                onClick={handleSubmit}
                className={`px-6 py-2 rounded-lg text-white font-semibold transition ${fileName
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                {uploading ? "Extracting Colors..." : "Extract Colors"}
              </button>

              {colorData && (
                <button
                  onClick={resetAll}
                  className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition"
                >
                  Upload New Image
                </button>
              )}
            </div>

            {message && (
              <p className="text-sm text-center text-gray-700">{message}</p>
            )}
          </div>
        </div>

        {/* Color Results Section */}
        {colorData && colorData.map((colorItem, idx) => (
          <div key={idx} className="space-y-6">
            {/* Dominant Color */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Dominant Color</h2>
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: colorItem?.dominantColor?.hex }}
                  onClick={() => copyToClipboard(colorItem?.dominantColor?.hex)}
                  title="Click to copy hex code"
                />
                <div className="space-y-1">
                  <p className="font-mono text-lg font-semibold">{colorItem?.dominantColor?.hex}</p>
                  <p className="text-sm text-gray-600">{colorItem.dominantColor.rgb}</p>
                  <p className="text-sm text-gray-600">
                    Luminance: {(colorItem.dominantColor.luminance * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${colorItem.dominantColor.isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-800"
                      }`}>
                      {colorItem.dominantColor.isDark ? "Dark" : "Light"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Color Palette</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {colorItem.palette.map((color, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-sm cursor-pointer hover:scale-105 transition-transform mb-3"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => copyToClipboard(color.hex)}
                      title="Click to copy hex code"
                    />
                    <div className="space-y-1">
                      <p className="font-mono font-semibold text-sm">{color.hex}</p>
                      <p className="text-xs text-gray-600">{color.rgb}</p>
                      <p className="text-xs text-gray-600">
                        {color.percentage}% of image
                      </p>
                      <p className="text-xs">
                        <span className={`px-2 py-1 rounded text-xs ${color.isDark
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 text-gray-800"
                          }`}>
                          {color.isDark ? "Dark" : "Light"}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Strip */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Color Strip</h2>
              <div className="flex rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                {colorItem.palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1 h-16 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex)}
                    title={`${color.hex} - Click to copy`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Click any color to copy its hex code
              </p>
            </div>

            {/* Image Info */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Image Information</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{colorItem.imageInfo.width}px</p>
                  <p className="text-sm text-gray-600">Width</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{colorItem.imageInfo.height}px</p>
                  <p className="text-sm text-gray-600">Height</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{colorItem.imageInfo.channels}</p>
                  <p className="text-sm text-gray-600">Channels</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}