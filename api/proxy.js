// pages/api/proxy.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data"; // لتجنب مشاكل FormData في Node

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // ✅ CORS
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
        const file = files.file;

        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

        const response = await fetch(targetURL, { method: "POST", body: formData });
        const data = await response.json();
        res.status(200).json(data);
      });
    } else {
      let body = "";
      req.on("data", chunk => { body += chunk.toString(); });
      req.on("end", async () => {
        const { targetURL, body: payload } = JSON.parse(body);
        const response = await fetch(targetURL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await response.json();
        res.status(200).json(data);
      });
    }
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
}
