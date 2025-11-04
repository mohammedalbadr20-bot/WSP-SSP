export default async function handler(req, res) {
  // هيدرز CORS لكل طلب
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, target-url");

  // الرد على طلب preflight OPTIONS مع نفس الهيدرز
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const targetUrl = req.headers["target-url"] || process.env.SCRIPT_URL;
  if (!targetUrl) {
    return res.status(400).json({ status: "error", message: "Missing target URL" });
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers, // إرسال نفس الهيدرز للمصدر النهائي
      body: req.method === "POST" ? req.body : undefined,
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.error("Proxy fetch error:", err);
    res.status(500).json({ status: "error", message: "Proxy failed to fetch target URL" });
  }
}
