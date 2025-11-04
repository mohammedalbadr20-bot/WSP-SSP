export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, target-url");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const targetUrl = req.headers["target-url"] || process.env.SCRIPT_URL;
  if (!targetUrl) {
    return res.status(400).json({ status: "error", message: "Missing target URL" });
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    body: req.method === "POST" ? req.body : undefined,
    headers: { "Content-Type": req.headers["content-type"] || "application/json" }
  });

  const data = await response.text();
  res.status(response.status).send(data);
}
