import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // الترويسات CORS
  res.setHeader("Access-Control-Allow-Origin", "https://mohammedalbadr20-bot.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  // الرد على preflight (OPTIONS) فورًا
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

        // إضافة رسائل تسجيل لمتابعة البيانات
        console.log("Fetching target URL:", targetURL);

        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

        const response = await fetch(targetURL, { method: "POST", body: formData });

        // إضافة فحص إذا كانت الاستجابة تحتوي على JSON
        console.log("Response status:", response.status);
        console.log("Response content-type:", response.headers.get("Content-Type"));

        if (!response.ok) {
          const text = await response.text();
          console.error("Received non-JSON response:", text);
          return res.status(500).json({ status: "error", message: "Non-JSON response from targetURL" });
        }

        // محاولة تحويل الاستجابة إلى JSON
        const data = await response.json();
        console.log("Data received from target URL:", data);
        return res.status(200).json(data);
      });
    } else {
      let raw = "";
      req.on("data", chunk => (raw += chunk));
      req.on("end", async () => {
        const { targetURL, body: payload } = JSON.parse(raw);
        
        // إضافة رسائل تسجيل لمتابعة البيانات
        console.log("Fetching target URL:", targetURL);
        
        const response = await fetch(targetURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        console.log("Response status:", response.status);
        console.log("Response content-type:", response.headers.get("Content-Type"));

        if (!response.ok) {
          const text = await response.text();
          console.error("Received non-JSON response:", text);
          return res.status(500).json({ status: "error", message: "Non-JSON response from targetURL" });
        }

        const data = await response.json();
        console.log("Data received from target URL:", data);
        return res.status(200).json(data);
      });
    }
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ status: "error", message: err.message || "غير معروف" });
  }
}
