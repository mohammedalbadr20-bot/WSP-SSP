import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "https://mohammedalbadr20-bot.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ status: "error", message: "Method not allowed" });

  const contentType = req.headers["content-type"] || "";

  try {
    // 1️⃣ multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ status: "error", message: err.message });

        const targetURL = fields.targetURL;
        const file = files.file;
        const formData = new FormData();

        if (file) formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

        // إضافة باقي الحقول
        for (const key in fields) if (key !== "targetURL") formData.append(key, fields[key]);

        const response = await fetch(targetURL, { method: "POST", body: formData });
        const text = await response.text();

        try { return res.status(200).json(JSON.parse(text)); }
        catch { return res.status(200).send(text); }
      });

    // 2️⃣ JSON
    } else if (contentType.includes("application/json")) {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        const parsed = JSON.parse(body);
        const targetURL = parsed.targetURL;
        const payload = parsed.body || {};

        const response = await fetch(targetURL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(payload)
        });

        const text = await response.text();
        try { return res.status(200).json(JSON.parse(text)); }
        catch { return res.status(200).send(text); }
      });

    // 3️⃣ غير مدعوم
    } else {
      return res.status(400).json({ status: "error", message: "Unsupported content-type" });
    }
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ status: "error", message: err.message || "غير معروف" });
  }
}
