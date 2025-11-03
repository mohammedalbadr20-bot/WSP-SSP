export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // للتعامل مع طلبات preflight
  }

  try {
    const googleScriptURL = "https://script.google.com/macros/s/AKfycbwm-xoojxIaAJ8-cLLIRFAthMHT1FFWS8w0gHtf6xlhU5xP3eqB47CQucqea4GDEm0Zlw/exec";

    // إرسال الطلب إلى Google Script
    const response = await fetch(googleScriptURL, {
      method: req.method,
      body: req.body,
    });

    // نحاول قراءة الرد كنص ثم نحوله إلى JSON
    const text = await response.text();
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      res.status(200).send(text); // في حالة الرد مش JSON
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
}
