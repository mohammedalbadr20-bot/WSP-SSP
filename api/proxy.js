import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // ضروري لقبول FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const contentType = req.headers["content-type"] || "";

  // حالة FormData (رفع الملفات)
  if (contentType.includes("multipart/form-data")) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ status: "error", message: err.message });

      const targetURL = fields.targetURL;
      const file = files.file;

      if (!file) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
      }

      const formData = new FormData();
      formData.append("file", fs.createReadStream(file.filepath), file.originalFilename);

      try {
        const response = await fetch(targetURL, {
          method: "POST",
          body: formData,
          headers: formData.getHeaders(),
        });
        const data = await response.json();
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
      }
    });
  } else {
    // حالة JSON
    let bodyData = "";
    req.on("data", (chunk) => (bodyData += chunk));
    req.on("end", async () => {
      try {
        const { targetURL, body } = JSON.parse(bodyData);

        const response = await fetch(targetURL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        res.status(200).json(data);
      } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
      }
    });
  }
}
