export default async function handler(req, res) {
  // السماح لأي نطاق بالوصول
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // للتعامل مع طلبات preflight
  }

  try {
    // رابط سكريبت Google Apps Script الخاص بك
    const googleScriptURL = "https://script.google.com/macros/s/AKfycbwm-xoojxIaAJ8-cLLIRFAthMHT1FFWS8w0gHtf6xlhU5xP3eqB47CQucqea4GDEm0Zlw/exec";

    // إرسال الطلب إلى Google Script
    const response = await fetch(googleScriptURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(req.body).toString()
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error communicating with Google Script");
  }
}
