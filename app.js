const form = document.querySelector("#volunteer-form");
const statusBox = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusBox.className = "form-status";
  statusBox.textContent = "";

  if (!form.reportValidity()) return;

  const data = new FormData(form);
  if (String(data.get("website") || "").trim()) {
    // Quietly ignore automated submissions.
    statusBox.className = "form-status success";
    statusBox.textContent = "تم استلام طلبك بنجاح.";
    form.reset();
    return;
  }

  const payload = Object.fromEntries(data.entries());
  payload.consent = data.get("consent") === "yes" ? "yes" : "";
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "جارٍ إرسال الطلب…";

  try {
    const response = await fetch("/.netlify/functions/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "تعذر إرسال الطلب.");
    }
    statusBox.className = "form-status success";
    statusBox.textContent = result.message || "تم استلام طلبك بنجاح.";
    form.reset();
  } catch (error) {
    statusBox.className = "form-status error";
    statusBox.textContent = error.message || "تعذر إرسال الطلب. يرجى المحاولة لاحقًا.";
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "إرسال طلب التطوع";
  }
});
