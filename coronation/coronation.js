/* =========================================================
   Binibining Sindangan 2026 — Preliminary & Coronation Night
   Runs after ../script.js, which provides RSVP_ENDPOINT, reduceMotion
   and goldBurst, plus the curtain and scroll effects.
   ========================================================= */

const VENUE = "Sindangan People's Cultural and Sports Center, Sindangan, Zamboanga del Norte";

const EVENTS = {
  preliminary: {
    file: "preliminary-night",
    title: "Preliminary Night | Binibining Sindangan 2026",
    // The time is not announced yet. Once it is, fill these in (Philippine Time) and the
    // time card and the calendar buttons appear on their own, for example:
    //   time: "6:00 PM", start: "2026-12-17T18:00:00+08:00", end: "2026-12-17T22:00:00+08:00",
    time: "",
    start: "",
    end: "",
    location: VENUE,
    description:
      "Preliminary Night: Festival Wear Competition, Talent Competition and Sponsors' Awards.\n" +
      "Open to all.\n" +
      "Contact: (0915) 227 6737 / (065) 917 8385",
  },
  coronation: {
    file: "coronation-night",
    title: "Coronation Night | Binibining Sindangan 2026",
    start: "2026-12-20T19:00:00+08:00", // 7:00 PM Philippine Time
    end: "2026-12-20T23:00:00+08:00",   // assumed 4 hours; adjust if needed
    location: VENUE,
    description:
      "Coronation Night of Binibining Sindangan 2026.\n" +
      "Admission is by ticket.\n" +
      "Contact: (0915) 227 6737 / (065) 917 8385",
  },
};

/* ---- Add to calendar, one pair of buttons per night ---- */
(function calendar() {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (t) => t.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  // A night without a set time shows no calendar buttons yet.
  document.querySelectorAll("[data-actions]").forEach((row) => {
    row.hidden = !EVENTS[row.dataset.actions].start;
  });
  document.querySelectorAll("[data-time]").forEach((el) => {
    const time = EVENTS[el.dataset.time].time;
    if (time) el.textContent = time;
  });

  document.querySelectorAll("[data-gcal]").forEach((link) => {
    const e = EVENTS[link.dataset.gcal];
    if (!e.start) return;
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
      if (!e.start) return;
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
      a.download = "binibining-sindangan-" + e.file + ".ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    })
  );
})();

/* ---- RSVP (guest page only) ----
   Preliminary Night is open to all, so guests only say whether they are coming.
   Coronation Night is by ticket, so guests also say how many seats they need. */
(function rsvp() {
  const form = document.getElementById("finalsForm");
  if (!form) return; // the public page (/coronation) has no RSVP; only the guest page (/coronation/guest) does
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const thanks = document.getElementById("thanks");
  const seats = form.coronationSeats;

  const clamp = (input) => {
    const n = Math.min(10, Math.max(1, parseInt(input.value, 10) || 1));
    input.value = n;
    return n;
  };

  // Coronation Night: the yes/no answer shows or hides the seat count.
  form.querySelectorAll(".rsvp-event").forEach((block) => {
    const key = block.dataset.event;
    const extra = block.querySelector("[data-extra]");
    if (!extra) return; // Preliminary Night has nothing more to ask
    block.querySelectorAll('input[name="' + key + '"]').forEach((r) =>
      r.addEventListener("change", () => {
        extra.hidden = form[key].value !== "Yes";
      })
    );
  });

  form.querySelectorAll(".stepper").forEach((stepper) => {
    const input = stepper.querySelector("input");
    stepper.querySelectorAll("[data-step]").forEach((b) =>
      b.addEventListener("click", () => {
        input.value = (parseInt(input.value, 10) || 1) + Number(b.dataset.step);
        clamp(input);
      })
    );
    input.addEventListener("change", () => clamp(input));
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
      [form.company, (v) => (v ? "" : "Please enter your company, organization or title.")],
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
    if (data.preliminary === "Yes") going.push("the Preliminary Night on December 17");
    if (data.coronation === "Yes") going.push("the Coronation Night on December 20");
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

    const preliminary = form.preliminary.value;
    const coronation = form.coronation.value;
    const data = {
      form: "finals",
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      preliminary,
      coronation,
      coronationSeats: coronation === "Yes" ? String(clamp(seats)) : "0",
      message: form.message.value.trim(),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch(RSVP_ENDPOINT, { method: "POST", body: new URLSearchParams(data) });
      const out = await res.json();
      // An Apps Script that has not been updated yet would file this under the old gathering; treat that as a failure.
      if (!out.ok || out.form !== "finals") throw new Error(out.error || "Not saved");
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
