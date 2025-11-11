export default async function handler(req, res) {
  // ✅ تمكين CORS للسماح لموقعك بالوصول إلى هذا الـ Proxy
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // للتعامل مع طلبات OPTIONS الخاصة بالـ preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 🔗 هذا هو Google Apps Script URL الخاص بك
  const targetUrl = "https://script.google.com/macros/s/AKfycbySTLSHN54meG-0lEyLUCYPz8ijSzYEHKYHZe7Syixj5uKtpc3oIgsT0G1m9hSaLArKPA/exec";

  try {
    // تمرير الطلب إلى Google Script
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: req.body ? new URLSearchParams(req.body).toString() : undefined,
    });

    const text = await response.text(); // لأن Google Scripts ترجع نص وليس JSON أحيانًا
    res.status(response.status).send(text);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}
