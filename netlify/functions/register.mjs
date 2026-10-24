const requiredFields = [
  "fullName", "age", "phone", "residence",
  "volunteerArea", "availability", "experience", "consent"
];

export default async (request) => {
  if (request.method !== "POST") {
    return json({ status: "error", message: "طريقة الطلب غير مدعومة." }, 405);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ status: "error", message: "تعذر قراءة بيانات النموذج." }, 400);
  }

  // Honeypot field for basic bot filtering.
  if (String(data.website || "").trim()) {
    return json({ status: "success", message: "تم استلام طلبك بنجاح." });
  }

  for (const field of requiredFields) {
    if (!String(data[field] ?? "").trim()) {
      return json({ status: "error", message: "يرجى ملء جميع الحقول الإلزامية." }, 400);
    }
  }

  const age = Number(data.age);
  if (!Number.isInteger(age) || age < 16 || age > 100) {
    return json({ status: "error", message: "العمر غير صالح." }, 400);
  }
  if (!/^(05|06|07)\d{8}$/.test(String(data.phone).trim())) {
    return json({ status: "error", message: "رقم الهاتف يجب أن يتكون من 10 أرقام جزائرية ويبدأ بـ 05 أو 06 أو 07." }, 400);
  }
  if (String(data.fullName).length > 150 || String(data.notes || "").length > 1000) {
    return json({ status: "error", message: "بعض الحقول تتجاوز الطول المسموح." }, 400);
  }
  if (String(data.email || "").length > 254) {
    return json({ status: "error", message: "البريد الإلكتروني طويل جدًا." }, 400);
  }

  const endpoint = process.env.APPS_SCRIPT_URL;
  if (!endpoint || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) {
    return json({ status: "error", message: "لم يتم إعداد خدمة استقبال الطلبات بعد." }, 503);
  }

  const body = new URLSearchParams();
  for (const key of ["fullName", "age", "phone", "email", "residence", "volunteerArea", "availability", "experience", "notes", "consent"]) {
    body.set(key, String(data[key] ?? ""));
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
      redirect: "follow"
    });
    const text = await upstream.text();
    let result;
    try { result = JSON.parse(text); } catch { result = null; }
    if (!upstream.ok || !result || result.status !== "success") {
      console.error("Apps Script submission failed", upstream.status, text.slice(0, 500));
      return json({ status: "error", message: result?.message || "تعذر حفظ الطلب حاليًا. يرجى المحاولة لاحقًا." }, 502);
    }
    return json({ status: "success", message: "تم استلام طلبك بنجاح. شكرًا لمساهمتك!" });
  } catch (error) {
    console.error("Apps Script request error", error);
    return json({ status: "error", message: "تعذر الاتصال بخدمة التسجيل. يرجى المحاولة لاحقًا." }, 502);
  }
};

function json(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
