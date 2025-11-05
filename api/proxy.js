// pages/api/proxy.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // 🟢 CORS headers (يجب أن تُرسل دائمًا قبل أي منطق)
  res.setHeader("Access-Control-Allow-Origin", "https://mohammedalbadr20-bot.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  // 🔸 يجب الرد على preflight فورا بدون منطق إضافي
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const contentType = req.headers["content-type"] || "";

  try {
    // 🟡 حالة رفع الملفات
    if (contentType.includes("multipart/form-data")) {
      const form = new formidable.IncomingForm();

      // ⚠️ مهم: لا ترسل أي رد قبل انتهاء الـ form.parse
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Formidable error:", err);
          return res.status(500).json({ status: "error", message: err.message });
        }

        const targetURL = fields.targetURL;
        const file = files.file;

        if (!targetURL || !file) {
          return res.status(400).json({ status: "error", message: "Missing targetURL or file" });
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

        const response = await fetch(targetURL, { method: "POST", body: formData });
        const data = await response.json();
        return res.status(200).json(data);
      });
    }

    // 🟢 حالة JSON العادية
    else {
      let raw = "";
      req.on("data", chunk => { raw += chunk.toString(); });
      req.on("end", async () => {
        try {
          const { targetURL, body: payload } = JSON.parse(raw);
          const response = await fetch(targetURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          return res.status(200).json(data);
        } catch (err) {
          console.error("JSON proxy error:", err);
          return res.status(500).json({ status: "error", message: err.message });
        }
      });
    }
  } catch (err) {
    console.error("General proxy error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
}
