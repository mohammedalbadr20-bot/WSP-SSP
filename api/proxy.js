module.exports = async (req, res) => {
  // إضافة رأس CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // يسمح لجميع النطاقات بالوصول
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // إذا كان الطلب من نوع OPTIONS (تأكد من أن الخادم يدعم CORS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // باقي الكود الخاص بالـ Proxy...
};

// api/proxy.js
const fetch = require('node-fetch');  // يجب تثبيت مكتبة node-fetch (أو استخدم fetch المتاحة في Vercel)

module.exports = async (req, res) => {
  // URL الذي تريد إرسال الطلب إليه
  const targetUrl = "https://example.com/api";  // استبدله بعنوان API الخاص بك

  try {
    // التحقق من أن الطلب هو POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // إرسال الطلب إلى الخادم الأصلي (targetUrl)
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',  // تأكد من نوع البيانات المناسب
      },
      body: new URLSearchParams(req.body)  // نقل بيانات الجسم كما هي
    });

    // قراءة استجابة الخادم
    const data = await response.json();

    // إعادة إرسال البيانات إلى العميل
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Error proxying request:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
