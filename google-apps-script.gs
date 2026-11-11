/**
 * RSVP receiver for the Binibining Sindangan 2026 Sponsors' Gathering site.
 * Saves every RSVP from the website as a new row in a Google Sheet.
 *
 * SETUP (about 5 minutes, done once)
 * 1. Create a new Google Sheet (sheets.new) using the account that should own the RSVPs.
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code and paste this whole file.
 * 3. Click Deploy > New deployment > type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Click Deploy and approve the permission prompt.
 * 4. Copy the "Web app URL" (ends in /exec).
 * 5. Open script.js in the website and paste it between the quotes:
 *      const RSVP_ENDPOINT = "https://script.google.com/macros/s/XXXX/exec";
 *
 * If you edit this script later, use Deploy > Manage deployments > Edit > New version
 * so the same URL keeps working.
 */

const SHEET_NAME = "RSVPs";
const HEADERS = ["Received", "Name", "Company / Organization", "Mobile", "Email", "Attending", "Seats", "Message"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const p = (e && e.parameter) || {};
    if (!p.name || !p.company) return reply({ ok: false, error: "Missing name or company" });

    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      clean(p.name, 120),
      clean(p.company, 160),
      clean(p.phone, 30),
      clean(p.email, 160),
      p.attending === "No" ? "No" : "Yes",
      Math.min(10, Math.max(0, parseInt(p.seats, 10) || 0)),
      clean(p.message, 600),
    ]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return reply({ ok: true, info: "RSVP endpoint is running." });
}

/** Trim, cap the length, and stop text from being treated as a spreadsheet formula. */
function clean(value, max) {
  const text = String(value || "").trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
