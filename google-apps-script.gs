/**
 * Form receiver for the Binibining Sindangan 2026 website. One script, one Google Sheet:
 *   - Sponsors' Gathering RSVPs            -> the "RSVPs" tab
 *   - Top 20 candidate forms (/candidates) -> the "Candidates" tab (created by the first answer)
 *     Talent music and LED backdrops arrive as links the candidates paste in.
 *
 * FIRST-TIME SETUP (about 5 minutes, done once)
 * 1. Create a new Google Sheet (sheets.new) using the account that should own the answers.
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code and paste this whole file.
 * 3. Click Deploy > New deployment > type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Click Deploy and approve the permission prompt.
 * 4. Copy the "Web app URL" (ends in /exec) and paste it between the quotes in
 *    script.js (RSVP_ENDPOINT) and candidates/candidates.js (ENDPOINT).
 *
 * UPDATING AN EXISTING DEPLOYMENT (e.g. to add the candidate form to the RSVP script)
 * 1. Open the Sheet > Extensions > Apps Script and replace the code with this whole file. Save.
 * 2. Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy.
 *    The Web app URL stays the same, so the website needs no change.
 */

/* ---- Sponsors' Gathering RSVPs ---- */
const SHEET_NAME = "RSVPs";
const HEADERS = ["Received", "Name", "Company / Organization", "Mobile", "Email", "Attending", "Seats", "Message"];

/* ---- Top 20 candidates ---- */
const CANDIDATE_SHEET = "Candidates";
// [column title, field name sent by the website, longest text kept]
const CANDIDATE_COLUMNS = [
  ["Full Name", "fullName", 120],
  ["Nickname", "nickname", 60],
  ["Representing", "representing", 160],
  ["Age", "age", 3],
  ["Birthday", "birthday", 20],
  ["Home Address", "address", 240],
  ["Mobile", "phone", 30],
  ["Email", "email", 160],
  ["Facebook", "facebook", 240],
  ["Parent / Guardian / Handler", "guardianName", 120],
  ["Guardian Mobile", "guardianPhone", 30],
  ["Height", "height", 30],
  ["Vital Statistics", "vitalStats", 40],
  ["Shoe Size", "shoeSize", 20],
  ["Shirt Size", "shirtSize", 10],
  ["School / Occupation", "occupation", 200],
  ["Hobbies", "hobbies", 300],
  ["Motto", "motto", 400],
  ["Advocacy", "advocacy", 800],
  ["Talent", "talent", 200],
  ["Talent Description", "talentDescription", 800],
  ["Talent Music (link)", "musicLink", 500],
  ["Music Notes", "musicNotes", 500],
  ["LED Backdrop (link)", "backdropLink", 500],
  ["Backdrop Notes", "backdropNotes", 500],
];
const CANDIDATE_HEADERS = ["Received", "Candidate No."].concat(CANDIDATE_COLUMNS.map(function (c) { return c[0]; }));

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.form === "candidate") return reply(saveCandidate(p));
    return reply(saveRsvp(p));
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function doGet() {
  return reply({ ok: true, info: "Form endpoint is running." });
}

/* ---- RSVP ---- */
function saveRsvp(p) {
  if (!p.name || !p.company) return { ok: false, error: "Missing name or company" };
  return withLock(function () {
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
    return { ok: true };
  });
}

/* ---- Candidate form ---- */
function saveCandidate(p) {
  const number = parseInt(p.candidateNo, 10);
  if (!p.fullName || !(number >= 1 && number <= 999)) return { ok: false, error: "Missing candidate number or name" };
  const row = [new Date(), number].concat(
    CANDIDATE_COLUMNS.map(function (column) {
      return clean(p[column[1]], column[2]);
    })
  );
  return withLock(function () {
    candidateSheet().appendRow(row);
    return { ok: true };
  });
}

function candidateSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(CANDIDATE_SHEET) || book.insertSheet(CANDIDATE_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CANDIDATE_HEADERS);
    sheet.getRange(1, 1, 1, CANDIDATE_HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(3);
    // Plain text keeps answers exactly as typed: "0917…" keeps its zero, "10-11-12" is not turned into a date.
    sheet.getRange(2, 3, sheet.getMaxRows() - 1, CANDIDATE_HEADERS.length - 2).setNumberFormat("@");
  }
  return sheet;
}

/* ---- Helpers ---- */

/** Run one step at a time, so two answers arriving together cannot land on the same row. */
function withLock(work) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    return work();
  } finally {
    lock.releaseLock();
  }
}

/** Trim, cap the length, and stop text from being treated as a spreadsheet formula. */
function clean(value, max) {
  const text = String(value || "").trim().slice(0, max);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
