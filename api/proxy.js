import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // ترويسات CORS
  res.setHeader("Access-Control-Allow-Origin", "https://mohammedalbadr20-bot.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ status: "error", message: "Method not allowed" });

  const contentType = req.headers["content-type"] || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });

        const targetURL = fields.targetURL;
        if (!targetURL) return res.status(400).json({ status: "error", message: "targetURL is required" });

        const file = files.file;
        if (!file) return res.status(400).json({ status: "error", message: "File not found" });

        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

        const response = await fetch(targetURL, { method: "POST", body: formData });
        const text = await response.text();

        // محاولة تحويل النص إلى JSON
        try {
          const data = JSON.parse(text);
          return res.status(200).json(data);
        } catch {
          return res.status(500).json({ status: "error", message: "Target returned non-JSON response" });
        }
      });
    } else {
      // JSON payload
      let raw = "";
      req.on("data", chunk => raw += chunk);
      req.on("end", async () => {
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return res.status(400).json({ status: "error", message: "Invalid JSON" });
        }

        const { targetURL, body: payload } = parsed;
        if (!targetURL || !payload) return res.status(400).json({ status: "error", message: "targetURL or body missing" });

        const response = await fetch(targetURL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(payload)
        });

        const text = await response.text();
        try {
          const data = JSON.parse(text);
          return res.status(200).json(data);
        } catch {
          return res.status(500).json({ status: "error", message: "Target returned non-JSON response" });
        }
      });
    }
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ status: "error", message: err.message || "غير معروف" });
  }
}
