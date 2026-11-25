/* =========================================================
   Binibining Sindangan 2026 — Reveal of the Top 20 & Sponsors' Night
   Runs after ../script.js, which provides RSVP_ENDPOINT, reduceMotion
   and goldBurst, plus the curtain, music and scroll effects.
   ========================================================= */

const EVENTS = {
  reveal: {
    name: "Reveal of the Top 20",
    title: "Reveal of the Top 20 | Binibining Sindangan 2026",
    start: "2026-12-01T18:00:00+08:00", // 6:00 PM Philippine Time
    end: "2026-12-01T21:00:00+08:00",   // assumed 3 hours; adjust if needed
    location: "Municipal Grounds, Sindangan, Zamboanga del Norte",
    description:
      "Presentation of the Official Top 20 Candidates: Sashing, Drawing of Lots, Contract Signing and Press Conference.\n" +
      "Attire: Formal.\n" +
      "Contact: (0915) 227 6737 / (065) 917 8385",
  },
  night: {
    name: "Sponsors’ Night",
    title: "Sponsors' Night | Binibining Sindangan 2026",
    start: "2026-12-15T19:00:00+08:00", // 7:00 PM Philippine Time
    end: "2026-12-15T22:00:00+08:00",   // assumed 3 hours; adjust if needed
    location: "Municipal Building, Sindangan, Zamboanga del Norte",
    description:
      "Sponsors' Night with the Lovely 20 candidates.\n" +
      "Dress code: Modern Cocktail Elegance (Burgundy, Champagne, Taupe, Navy, Charcoal or Classic Black).\n" +
      "Contact: (0915) 227 6737 / (065) 917 8385",
  },
};

/* ---- Countdown to whichever evening comes next ---- */
(function countdown() {
  const box = document.getElementById("nextCountdown");
  const label = document.getElementById("countdownLabel");
  const cells = {};
  box.querySelectorAll("[data-unit]").forEach((el) => (cells[el.dataset.unit] = el));
  const pad = (n) => String(n).padStart(2, "0");
  const list = Object.values(EVENTS);

  function tick() {
    const now = Date.now();
    const next = list.find((e) => now < new Date(e.end).getTime());
    if (!next) {
      label.hidden = true;
      box.classList.add("is-over");
      box.textContent = "Thank you for joining us";
      clearInterval(timer);
      return;
    }
    const diff = new Date(next.start).getTime() - now;
    if (diff <= 0) {
      label.textContent = next.name;
      Object.values(cells).forEach((el) => (el.textContent = "00"));
      cells.days.textContent = "0";
      return;
    }
    label.textContent = "Until the " + next.name;
    const s = Math.floor(diff / 1000);
    cells.days.textContent = String(Math.floor(s / 86400));
    cells.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    cells.minutes.textContent = pad(Math.floor((s % 3600) / 60));
    cells.seconds.textContent = pad(s % 60);
  }
  const timer = setInterval(tick, 1000);
  tick();
})();

/* ---- Add to calendar, one pair of buttons per evening ---- */
(function calendar() {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t) => t.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  document.querySelectorAll("[data-gcal]").forEach((link) => {
    const e = EVENTS[link.dataset.gcal];
    link.href =
      "https://calendar.google.com/calendar/render?" +
      new URLSearchParams({
        action: "TEMPLATE",
        text: e.title,
        dates: stamp(e.start) + "/" + stamp(e.end),
        details: e.description,
        location: e.location,
      });
  });

  document.querySelectorAll("[data-ics]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const key = btn.dataset.ics;
      const e = EVENTS[key];
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Binibining Sindangan 2026//" + key + "//EN",
        "BEGIN:VEVENT",
        "UID:" + key + "-2026@binibining-sindangan",
        "DTSTAMP:" + stamp(new Date().toISOString()),
        "DTSTART:" + stamp(e.start),
        "DTEND:" + stamp(e.end),
        "SUMMARY:" + esc(e.title),
        "DESCRIPTION:" + esc(e.description),
        "LOCATION:" + esc(e.location),
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "binibining-sindangan-" + (key === "reveal" ? "top-20-reveal" : "sponsors-night") + ".ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    })
  );
})();

/* ---- RSVP: one answer and seat count per evening ---- */
(function rsvp() {
  const form = document.getElementById("eventsForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const thanks = document.getElementById("thanks");

  const clamp = (input) => {
    const n = Math.min(10, Math.max(1, parseInt(input.value, 10) || 1));
    input.value = n;
    return n;
  };

  // Each evening: its yes/no answer shows or hides its own seat stepper.
  const blocks = {};
  form.querySelectorAll(".rsvp-event").forEach((block) => {
    const key = block.dataset.event;
    const seatsField = block.querySelector("[data-seats]");
    const seats = seatsField.querySelector("input");
    blocks[key] = { seats };
    block.querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        seats.value = (parseInt(seats.value, 10) || 1) + Number(b.dataset.step);
        clamp(seats);
      })
    );
    seats.addEventListener("change", () => clamp(seats));
    block.querySelectorAll('input[type="radio"]').forEach((r) =>
      r.addEventListener("change", () => {
        seatsField.hidden = form[key].value !== "Yes";
      })
    );
  });

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
      note = document.createElement("p");
      note.className = "field__error";
      field.appendChild(note);
    }
    note.textContent = message;
  }

  function validate() {
    const checks = [
      [form.name, (v) => (v ? "" : "Please enter your name.")],
      [form.company, (v) => (v ? "" : "Please enter your company or organization.")],
      [form.phone, (v) => (v.replace(/\D/g, "").length >= 7 ? "" : "Please enter a contact number we can reach.")],
      [form.email, (v) => (!v || /^\S+@\S+\.\S+$/.test(v) ? "" : "That email address doesn't look right.")],
    ];
    let firstBad = null;
    checks.forEach(([input, rule]) => {
      const message = rule(input.value.trim());
      setError(input, message);
      if (message && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  form.querySelectorAll("input, textarea").forEach((el) =>
    el.addEventListener("input", () => {
      if (el.closest(".field")?.classList.contains("has-error")) setError(el, "");
    })
  );

  function showThanks(data) {
    const going = [];
    if (data.reveal === "Yes") going.push("the Reveal of the Top 20 on December 1");
    if (data.night === "Yes") going.push("the Sponsors’ Night on December 15");
    document.getElementById("thanksTitle").textContent = going.length ? "See you there!" : "Thank you!";
    document.getElementById("thanksText").textContent = going.length
      ? "Your RSVP has been received. We look forward to seeing you at " + going.join(" and ") + "."
      : "Thank you for letting us know. We hope to see you at Binibining Sindangan 2026.";
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus({ preventScroll: true });
    thanks.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    if (going.length && window.goldBurst) setTimeout(() => window.goldBurst(innerWidth / 2, innerHeight / 2, 120), 500);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form__status";
    status.textContent = "";
    if (!validate()) return;
    if (form.website.value) return; // spam trap filled: silently drop

    const data = {
      form: "events",
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };
    Object.keys(blocks).forEach((key) => {
      data[key] = form[key].value;
      data[key + "Seats"] = data[key] === "Yes" ? String(clamp(blocks[key].seats)) : "0";
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch(RSVP_ENDPOINT, { method: "POST", body: new URLSearchParams(data) });
      const out = await res.json();
      // An Apps Script that has not been updated yet would file this under the old gathering; treat that as a failure.
      if (!out.ok || out.form !== "events") throw new Error(out.error || "Not saved");
      showThanks(data);
    } catch (err) {
      console.error("RSVP failed:", err);
      status.classList.add("is-error");
      status.innerHTML =
        'We couldn’t send your RSVP. Please try again, or call <a href="tel:+639152276737">(0915) 227 6737</a>.';
      submitBtn.disabled = false;
      submitBtn.textContent = "Send RSVP";
    }
  });
})();
