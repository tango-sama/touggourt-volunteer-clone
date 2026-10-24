# قافلة مد جسور المواطنة الشبابية — نسخة التسجيل

Arabic RTL static site inspired by the publicly visible volunteer website. It uses a Netlify Function as a same-origin proxy and Google Apps Script to append applications to a private Google Sheet.

## Important
- This is a recreation, not the original site's source code.
- The decorative "جسور" mark is a placeholder, not the association's official logo. Replace it with the official approved logo/image files before publishing.
- Confirm project details, village names, targets, consent text, and age rules with the association before collecting real applications.
- Keep the Google Sheet private.
- Test end-to-end using dummy data before sharing publicly.
- The Apps Script URL is public by design. The included honeypot is only basic spam protection; consider stronger abuse controls (such as CAPTCHA and rate limiting) before a public campaign.

## 1. Create the Google Sheet
1. Sign into the association's Google account.
2. Create a private spreadsheet, e.g. `تسجيل المتطوعين – قافلة توقرت 2026`.
3. Copy the ID from its URL: the segment between `/d/` and `/edit`.
4. Keep the sheet private; do not publish it to the web.

## 2. Deploy Google Apps Script
1. Visit https://script.google.com and create a project.
2. Paste `apps-script/Code.gs` into the editor.
3. Replace `PASTE_GOOGLE_SHEET_ID_HERE` with the spreadsheet ID.
4. Save.
5. Select **Deploy → New deployment → Web app**.
6. Choose **Execute as: Me**. Set access to **Anyone** only if permitted by the account's policy and appropriate for the public form.
7. Deploy, authorize, and copy the URL ending in `/exec`.
8. Test the URL in a browser; it should return a small JSON health response.

## 3. Put the project in GitHub
1. Create a new repository on GitHub, preferably private while you prepare the site.
2. Upload all files in this project, preserving folder paths. Or from a terminal in the extracted project folder:
   ```bash
   git init
   git add .
   git commit -m "Create Touggourt volunteer registration site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```
3. Replace the example remote with your own repository URL. Do not commit private credentials or real applicant data.

## 4. Deploy to Netlify
1. Sign in to https://app.netlify.com.
2. Choose **Add new project → Import an existing project → GitHub**.
3. Authorize Netlify for this repository and select it.
4. Netlify reads `netlify.toml`; publish directory is `.` and functions directory is `netlify/functions`.
5. Before submitting real data, open **Site configuration → Environment variables** (wording may vary) and add:
   - Key: `APPS_SCRIPT_URL`
   - Value: the Apps Script `/exec` URL from step 2
6. Trigger a new deploy after adding the environment variable.

## 5. Test before going live
1. Open the deployed Netlify URL.
2. Submit one dummy application with a made-up name and a test phone number matching the format `05xxxxxxxx`, `06xxxxxxxx`, or `07xxxxxxxx`.
3. Confirm the browser shows success.
4. Open the private spreadsheet and confirm exactly one new row appears with the correct columns.
5. Test invalid age/phone and missing consent; those should be rejected.
6. Delete test data after testing.
7. Only then share the public link.

## Field mapping
The form sends `fullName`, `age`, `phone`, `email`, `residence`, `volunteerArea`, `availability`, `experience`, `notes`, and `consent`. The Netlify function forwards these as URL-encoded parameters to Apps Script. The browser calls the same-origin Netlify function, avoiding browser CORS problems with Apps Script redirects.

## Security and privacy
- A public form endpoint can receive spam. The honeypot is not a complete anti-abuse system.
- Do not expose the spreadsheet to public viewers.
- Limit spreadsheet access to trusted association staff.
- Confirm the association has an appropriate privacy notice and a process for handling/deleting requests.
- The form currently requires age 16 or above and Algerian mobile numbers starting 05, 06, or 07. Change these rules only after confirming the association's requirements.
- Official logos are not included because only the public URL was available; replace the placeholder branding with authorized logo assets.
