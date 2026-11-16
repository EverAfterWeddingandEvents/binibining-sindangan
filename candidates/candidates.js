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
  const head = document.querySelector(".phead");
  let queued = false;
  function update() {
    queued = false;
    const max = root.scrollHeight - window.innerHeight;
    root.style.setProperty("--scroll", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : "0");
    // --p runs 0 → 1 as the header scrolls away: the statue drifts and the rays fade.
    if (!reduceMotion) head.style.setProperty("--p", Math.min(1, window.scrollY / head.offsetHeight).toFixed(4));
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
        const node = entry.target;
        node.classList.add("is-in");
        io.unobserve(node);
        // Once it has arrived, drop the stagger so hover effects respond at once.
        setTimeout(() => (node.style.transitionDelay = ""), 1800);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );
  items.forEach((node, i) => {
    const delay = (i % 5) * 70 + "ms";
    node.style.transitionDelay = delay;
    node.style.setProperty("--d", delay); // the card's light sweep and number badge follow the same stagger
    io.observe(node);
  });
})();

/* ---- Header: title letters, ray centre, pause when out of view ---- */
(function header() {
  const head = document.querySelector(".phead");
  const statue = head.querySelector(".statue--page");
  const fx = head.querySelector(".phead__fx");

  // Split the title into letters so they can land one by one.
  const h1 = head.querySelector("h1");
  const text = h1.textContent.trim();
  h1.setAttribute("aria-label", text);
  h1.classList.remove("gold-text"); // each letter carries the gold fill instead
  h1.textContent = "";
  let i = 0;
  text.split(" ").forEach((word, w, all) => {
    const wordEl = make("span", "word");
    wordEl.setAttribute("aria-hidden", "true");
    for (const ch of word) {
      const letter = make("span", "lt gold-text", ch);
      letter.style.setProperty("--i", i++);
      wordEl.appendChild(letter);
    }
    h1.appendChild(wordEl);
    if (w < all.length - 1) h1.appendChild(document.createTextNode(" "));
  });

  // Keep the rays and the opening bloom centred on the statue's body.
  function aim() {
    fx.style.setProperty("--ray-x", (statue.offsetLeft + statue.offsetWidth * 0.49).toFixed(1) + "px");
    fx.style.setProperty("--ray-y", (statue.offsetTop + statue.offsetHeight * 0.46).toFixed(1) + "px");
  }
  window.addEventListener("resize", aim);
  window.addEventListener("load", aim);
  aim();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => head.classList.toggle("is-away", !entry.isIntersecting)).observe(head);
  }
})();

/* ---- Cards: a soft glow follows the pointer ---- */
(function spotlight() {
  if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(".roll__item, .sched__item");
    if (!card) return;
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", (event.clientX - box.left).toFixed(0) + "px");
    card.style.setProperty("--my", (event.clientY - box.top).toFixed(0) + "px");
  }, { passive: true });
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

  /* -- Auto-save: answers are kept in this browser as they are typed, and stay after the form is sent,
        so a candidate can come back later (for example to add her music link) without typing it all again.
        The tick box is never saved: it is ticked again for each submission. -- */
  const SAVE_KEY = "bs2026-candidate-draft";
  const SAVED_FIELDS = TEXT_FIELDS.concat("candidatePick");
  const savedNote = document.getElementById("savedNote");
  const savedText = document.getElementById("savedText");
  const saveChip = document.getElementById("saveChip");
  const saveChipText = document.getElementById("saveChipText");
  function showSaved(message) {
    savedNote.hidden = !message;
    if (message && savedText.textContent !== message) savedText.textContent = message;
    // The pinned badge shows the same state wherever she is in the form.
    saveChip.hidden = !message;
    saveChip.classList.remove("is-saving");
    saveChipText.textContent = "Saved on this device";
  }

  let draftTimer = 0;
  function saveDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(flushDraft, 400);
    saveChip.hidden = false;
    saveChip.classList.add("is-saving");
    saveChipText.textContent = "Saving…";
  }
  // Write any answers typed since the last save right away.
  function flushDraft() {
    if (!draftTimer) return;
    clearTimeout(draftTimer);
    draftTimer = 0;
    const draft = {};
    SAVED_FIELDS.forEach((name) => {
      if (form[name].value) draft[name] = form[name].value;
    });
    try {
      if (Object.keys(draft).length) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(draft));
        showSaved("Your answers are saved on this device.");
      } else {
        localStorage.removeItem(SAVE_KEY);
        showSaved("");
      }
    } catch (err) {
      showSaved(""); // private browsing or storage full: the form still works, it just cannot remember
    }
  }
  window.addEventListener("pagehide", flushDraft);

  // Bring back what was saved on an earlier visit.
  try {
    const draft = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    let restored = false;
    SAVED_FIELDS.forEach((name) => {
      if (typeof draft[name] !== "string") return;
      form[name].value = draft[name];
      if (form[name].value) restored = true;
    });
    if (restored) showSaved("Welcome back. The answers saved on this device are filled in.");
  } catch (err) { /* nothing saved, or storage is unavailable */ }

  document.getElementById("clearSaved").addEventListener("click", () => {
    if (!window.confirm("Clear all the answers saved on this device?")) return;
    clearTimeout(draftTimer);
    draftTimer = 0;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) { /* nothing to clear */ }
    form.reset();
    form.querySelectorAll(".field.has-error [name]").forEach((input) => setError(input, ""));
    status.className = "form__status";
    status.textContent = "";
    showSaved("");
    form.candidateNo.focus();
  });

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
    saveChip.hidden = true;
    thanks.hidden = false;
    thanks.focus({ preventScroll: true });
    thanks.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    // Gold dust bursts from the star once the panel has settled.
    setTimeout(() => {
      const mark = thanks.querySelector(".thanks__mark").getBoundingClientRect();
      if (window.goldBurst) window.goldBurst(mark.left + mark.width / 2, mark.top + mark.height / 2, 120);
    }, 600);
  }

  document.getElementById("againBtn").addEventListener("click", () => {
    thanks.hidden = true;
    form.hidden = false;
    saveChip.hidden = savedNote.hidden;
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
      showThanks(data);
    } catch (err) {
      console.error("Candidate form failed:", err);
      setBusy(false);
      showFailure("We couldn’t send your details.");
    }
  });
})();

/* ---- Gold dust: drifting sparkles behind the page, and bursts on demand ---- */
(function sparkles() {
  const canvas = document.getElementById("sparkles");
  const ctx = canvas && canvas.getContext("2d");
  if (!ctx) return;
  let w, h, dots, raf;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const sparks = [];
  const SPARK_COLORS = ["#fff1c2", "#f6d98b", "#e9c46a", "#c9962f"];

  function build() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(110, (w * h) / 11000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.9 + 0.3,
      drift: Math.random() * 0.12 + 0.03,
      star: Math.random() < 0.08,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f6d98b";
    for (const d of dots) {
      const glow = 0.25 + 0.75 * Math.abs(Math.sin(d.phase + (t / 1000) * d.speed));
      ctx.globalAlpha = glow * 0.85;
      ctx.beginPath();
      if (d.star) {
        // A four-point star that swells as it twinkles
        const s = d.r * 3.2 * glow;
        ctx.moveTo(d.x, d.y - s);
        ctx.quadraticCurveTo(d.x, d.y, d.x + s, d.y);
        ctx.quadraticCurveTo(d.x, d.y, d.x, d.y + s);
        ctx.quadraticCurveTo(d.x, d.y, d.x - s, d.y);
        ctx.quadraticCurveTo(d.x, d.y, d.x, d.y - s);
      } else {
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      }
      ctx.fill();
      d.y -= d.drift;
      if (d.y < -4) {
        d.y = h + 4;
        d.x = Math.random() * w;
      }
    }
    // Burst particles: fly out, fall, fade.
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.985;
      s.vy = s.vy * 0.985 + 0.045;
      s.life -= s.decay;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, s.life);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  window.goldBurst = (x, y, count) => {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 1.5;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        r: Math.random() * 2.2 + 0.6,
        life: 1.2,
        decay: Math.random() * 0.012 + 0.008,
        color: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
      });
    }
  };

  function loop(t) {
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  build();
  if (reduceMotion) draw(0);
  else raf = requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      if (reduceMotion) draw(0);
    }, 150);
  });
  document.addEventListener("visibilitychange", () => {
    if (reduceMotion) return;
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(loop);
  });

  // A first shower of gold as the statue arrives.
  window.addEventListener("load", () => {
    const statue = document.querySelector(".statue--page").getBoundingClientRect();
    setTimeout(() => window.goldBurst(statue.left + statue.width / 2, statue.top + statue.height * 0.45, 70), 500);
  });
})();
