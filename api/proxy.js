export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const googleScriptURL = "https://script.google.com/macros/s/AKfycbwm-xoojxIaAJ8-cLLIRFAthMHT1FFWS8w0gHtf6xlhU5xP3eqB47CQucqea4GDEm0Zlw/exec";

    console.log("🔹 Forwarding request to:", googleScriptURL);
    console.log("🔹 Body received from frontend:", req.body);

    // نحافظ على نفس نوع الطلب (GET أو POST)
    const response = await fetch(googleScriptURL, {
      method: req.method,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(req.body).toString(),
    });

    const text = await response.text();
    console.log("🔹 Google Script Response:", text);

    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      res.status(200).send(text);
    }

  } catch (error) {
    console.error("❌ Proxy Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
}
