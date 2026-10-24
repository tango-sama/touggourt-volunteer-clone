/**
 * Deploy this script as a Web App:
 * Execute as: Me
 * Access: Anyone (if permitted by your Google account/domain).
 *
 * Keep the linked Google Sheet private. This endpoint is public, so add
 * additional abuse protection before large-scale promotion if needed.
 */
const SPREADSHEET_ID = "PASTE_GOOGLE_SHEET_ID_HERE";
const SHEET_NAME = "الطلبات";

const HEADERS = [
  "تاريخ التسجيل", "الاسم واللقب", "العمر", "رقم الهاتف",
  "البريد الإلكتروني", "مكان الإقامة", "مجال التطوع",
  "مدى التفرغ", "خبرة سابقة", "مهارات أو ملاحظات", "الموافقة"
];

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "Volunteer registration endpoint is running." })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = (e && e.parameter) || {};
    const required = ["fullName", "age", "phone", "residence", "volunteerArea", "availability", "experience", "consent"];
    for (const key of required) {
      if (!String(p[key] || "").trim()) return output("error", "يرجى ملء جميع الحقول الإلزامية.");
    }

    const age = Number(p.age);
    if (!Number.isInteger(age) || age < 16 || age > 100) return output("error", "العمر غير صالح.");
    const phone = String(p.phone).trim();
    if (!/^(05|06|07)\d{8}$/.test(phone)) return output("error", "رقم الهاتف غير صالح.");
    if (String(p.fullName).length > 150 || String(p.notes || "").length > 1000) {
      return output("error", "بعض الحقول تتجاوز الطول المسموح.");
    }

    lock.waitLock(10000);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    const safe = value => {
      const s = String(value || "").trim();
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    // Store phone as text to preserve its leading zero.
    sheet.appendRow([
      new Date(), safe(p.fullName), age, "'" + phone,
      safe(p.email), safe(p.residence), safe(p.volunteerArea),
      safe(p.availability), safe(p.experience), safe(p.notes), "موافق"
    ]);
    return output("success", "تم استلام طلبك بنجاح.");
  } catch (error) {
    console.error(error);
    return output("error", "تعذر حفظ الطلب. يرجى المحاولة لاحقًا.");
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function output(status, message) {
  return ContentService.createTextOutput(JSON.stringify({ status, message }))
    .setMimeType(ContentService.MimeType.JSON);
}
