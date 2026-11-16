/* =========================================================
   Binibining Sindangan 2026 — Top 20 Candidates page
   The lists shown on the page (Top 20, activities and attires)
   live in data.js. This file draws them and runs the form.
   ========================================================= */

/* ---- SETTINGS ------------------------------------------------
   ENDPOINT: the same Google Apps Script "Web app URL" the RSVP form
   uses (see ../google-apps-script.gs). Answers go to the "Candidates"
   tab of that Google Sheet. Music and backdrops come in as links.     */
const ENDPOINT = "https://script.google.com/macros/s/AKfycbz3IUTwcUSp-1lPs-gh-0M6QQajf85keqexuaj3zb1nM_7ib0yxWPoVl2UV55D4qdh7/exec";
const COMMITTEE_PHONE = { href: "tel:+639152276737", label: "(0915) 227 6737" };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/* ---- The Top 20 list ---- */
(function top20() {
  if (!TOP20.length) return;
  const list = document.getElementById("top20List");
  TOP20.forEach((c) => {
    const item = make("li", "roll__item reveal");
    item.appendChild(make("span", "roll__no", String(c.no)));
    const who = make("span", "roll__who");
    who.appendChild(make("span", "roll__name", c.name));
    if (c.rep) who.appendChild(make("span", "roll__rep", c.rep));
    item.appendChild(who);
    list.appendChild(item);
  });
  document.getElementById("top20").hidden = false;
})();

/* ---- Activities and attires ---- */
(function schedule() {
  if (!ACTIVITIES.length) return;
  const list = document.getElementById("scheduleList");
  ACTIVITIES.forEach((a) => {
    const item = make("li", "sched__item reveal");

    const when = make("div", "sched__when");
    if (a.date) when.appendChild(make("span", "sched__date", a.date));
    const time = [a.day, a.time].filter(Boolean).join(" · ");
    if (time) when.appendChild(make("span", "sched__time", time));
    item.appendChild(when);

    const what = make("div", "sched__what");
    what.appendChild(make("h3", "sched__title", a.title));
    if (a.venue) what.appendChild(make("p", "sched__venue", a.venue));
    if (a.attire) {
      const attire = make("p", "sched__attire");
      attire.appendChild(make("b", "", "Attire"));
      attire.appendChild(document.createTextNode(a.attire));
      what.appendChild(attire);
    }
    item.appendChild(what);
    list.appendChild(item);
  });
  document.getElementById("scheduleEmpty").hidden = true;
})();

/* ---- Scroll: progress bar and reveals ---- */
(function scrollFx() {
  let queued = false;
  function update() {
    queued = false;
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--scroll", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : "0");
  }
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener("resize", update);
  update();

  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((node) => node.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );
  items.forEach((node, i) => {
    node.style.transitionDelay = (i % 4) * 60 + "ms";
    io.observe(node);
  });
})();

/* ---- Candidate form ---- */
(function candidateForm() {
  const form = document.getElementById("candidateForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const thanks = document.getElementById("thanks");
  const SUBMIT_LABEL = submitBtn.textContent;

  // Every answer that goes to the Google Sheet, in the order the form asks for it.
  const TEXT_FIELDS = [
    "candidateNo", "nickname", "fullName",
    "representing", "age", "birthday", "address",
    "phone", "email", "facebook", "guardianName", "guardianPhone",
    "height", "vitalStats", "shoeSize", "shirtSize",
    "occupation", "hobbies", "motto", "advocacy",
    "talent", "talentDescription", "musicLink", "musicNotes", "backdropLink", "backdropNotes",
  ];

  const digits = (v) => v.replace(/\D/g, "").length;
  const withScheme = (v) => (!v || /^https?:\/\//i.test(v) ? v : "https://" + v);
  function linkRule(v) {
    try {
      const url = new URL(withScheme(v));
      if (url.hostname.includes(".") && !/\s/.test(v)) return "";
    } catch (err) { /* falls through to the message */ }
    return "That link doesn’t look right. Paste the full link, starting with https://";
  }
  // Checked only when the field has something in it; empty required fields are caught first.
  const RULES = {
    candidateNo: (v) => (/^\d{1,3}$/.test(v) && Number(v) >= 1 ? "" : "Please enter your candidate number, using numbers only."),
    age: (v) => (/^\d{1,2}$/.test(v) && Number(v) >= 1 ? "" : "Please enter your age in years, using numbers only."),
    phone: (v) => (digits(v) >= 7 ? "" : "Please enter a mobile number we can reach."),
    guardianPhone: (v) => (digits(v) >= 7 ? "" : "Please enter a mobile number we can reach."),
    email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? "" : "That email address doesn’t look right."),
    musicLink: linkRule,
    backdropLink: linkRule,
  };

  /* -- Field errors -- */
  function setError(input, message) {
    const field = input.closest(".field");
    let note = field.querySelector(".field__error");
    field.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (!message) {
      if (note) note.remove();
      return;
    }
    if (!note) {
      note = make("p", "field__error");
      field.appendChild(note);
    }
    note.textContent = message;
  }

  function validate() {
    let firstBad = null;
    for (const input of form.elements) {
      if (!input.name || input.name === "website") continue;
      const value = input.type === "checkbox" ? (input.checked ? "yes" : "") : input.value.trim();
      let message = "";
      if (!value) {
        // A number field also reads as empty when letters were typed into it.
        if (input.required) message = (input.validity.badInput && RULES[input.name]?.("")) || input.dataset.error || "Please fill this in.";
      } else if (RULES[input.name]) {
        message = RULES[input.name](value);
      }
      setError(input, message);
      if (message && !firstBad) firstBad = input;
    }
    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      firstBad.closest(".field").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    }
    return !firstBad;
  }

  form.addEventListener("input", (event) => {
    const input = event.target;
    if (input.closest(".field")?.classList.contains("has-error")) setError(input, "");
    saveDraft();
  });

  /* -- "Find your name": fills in the number, name and barangay (only when data.js lists the Top 20) -- */
  if (TOP20.length) {
    const pick = form.candidatePick;
    TOP20.forEach((c, i) => {
      const option = make("option", "", "No. " + c.no + " · " + c.name);
      option.value = String(i);
      pick.appendChild(option);
    });
    document.getElementById("pickField").hidden = false;
    pick.addEventListener("change", () => {
      const c = TOP20[pick.value];
      if (!c) return;
      form.candidateNo.value = c.no;
      form.fullName.value = c.name;
      if (c.rep) form.representing.value = c.rep;
      [form.candidateNo, form.fullName, form.representing].forEach((input) => setError(input, ""));
      saveDraft();
    });
  }

  form.birthday.max = new Date().toLocaleDateString("en-CA"); // today, as YYYY-MM-DD

  /* -- Draft: keep typed answers if the page reloads halfway. Cleared once the form is sent. -- */
  const DRAFT_KEY = "bs2026-candidate-draft";
  let draftTimer = 0;
  function saveDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(flushDraft, 400);
  }
  // Write any answers typed since the last save right away.
  function flushDraft() {
    if (!draftTimer) return;
    clearTimeout(draftTimer);
    draftTimer = 0;
    const draft = {};
    TEXT_FIELDS.forEach((name) => {
      if (form[name].value) draft[name] = form[name].value;
    });
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) { /* private browsing or storage full: the form still works */ }
  }
  window.addEventListener("pagehide", flushDraft);
  function clearDraft() {
    clearTimeout(draftTimer);
    draftTimer = 0;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) { /* nothing to clear */ }
  }
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    TEXT_FIELDS.forEach((name) => {
      if (typeof draft[name] === "string") form[name].value = draft[name];
    });
  } catch (err) { /* no draft */ }

  /* -- Sending -- */
  let busy = false;
  function setBusy(on, message) {
    busy = on;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Sending…" : SUBMIT_LABEL;
    status.className = "form__status";
    status.textContent = message || "";
  }

  async function send(url, body, timeoutMs) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method: "POST", body, signal: abort.signal });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "Not saved");
      return out;
    } finally {
      clearTimeout(timer);
    }
  }

  function showThanks(data) {
    const first = data.nickname || data.fullName.split(/\s+/)[0];
    document.getElementById("thanksTitle").textContent = "Thank you, " + first + "!";
    const missing = [];
    if (!data.musicLink) missing.push("talent music link");
    if (!data.backdropLink) missing.push("LED backdrop link");
    const todo = document.getElementById("thanksTodo");
    todo.hidden = !missing.length;
    todo.textContent = missing.length
      ? "We still need your " + missing.join(" and ") + ". When " + (missing.length > 1 ? "they are" : "it is") + " ready, come back to this page and submit the form again."
      : "";
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus({ preventScroll: true });
    thanks.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  document.getElementById("againBtn").addEventListener("click", () => {
    thanks.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    form.candidateNo.focus({ preventScroll: true });
  });

  function showFailure(lead) {
    status.className = "form__status is-error";
    status.textContent = lead + " Please check your connection and try again, or call ";
    const link = make("a", "", COMMITTEE_PHONE.label);
    link.href = COMMITTEE_PHONE.href;
    status.appendChild(link);
    status.appendChild(document.createTextNode("."));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy) return;
    flushDraft();
    status.className = "form__status";
    status.textContent = "";
    if (!validate()) {
      status.classList.add("is-error");
      status.textContent = "Some answers are missing or need fixing. Please check the boxes marked in red.";
      return;
    }
    if (form.website.value) return; // spam trap filled: silently drop

    const data = {};
    TEXT_FIELDS.forEach((name) => (data[name] = form[name].value.trim()));
    data.musicLink = withScheme(data.musicLink);
    data.backdropLink = withScheme(data.backdropLink);

    setBusy(true, "Sending your details…");
    try {
      await send(ENDPOINT, new URLSearchParams({ form: "candidate", ...data }), 90 * 1000);
      setBusy(false);
      clearDraft();
      showThanks(data);
    } catch (err) {
      console.error("Candidate form failed:", err);
      setBusy(false);
      showFailure("We couldn’t send your details.");
    }
  });
})();
