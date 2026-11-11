/* =========================================================
   Binibining Sindangan 2026 — Sponsors' Gathering
   ========================================================= */

/* ---- SETTINGS ------------------------------------------------
   RSVP_ENDPOINT: paste the Google Apps Script "Web app URL" here
   (see google-apps-script.gs for the 5-minute setup). While it is
   empty, the form falls back to opening an email to RSVP_EMAIL.   */
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbz3IUTwcUSp-1lPs-gh-0M6QQajf85keqexuaj3zb1nM_7ib0yxWPoVl2UV55D4qdh7/exec";
const RSVP_EMAIL = "bb.sindangan@gmail.com";

const EVENT = {
  title: "Sponsors' Gathering | Binibining Sindangan 2026",
  start: "2026-11-22T19:00:00+08:00", // 7:00 PM Philippine Time
  end: "2026-11-22T22:00:00+08:00",   // assumed 3 hours; adjust if needed
  location: "Sound Check Lounge and Bar, Sindangan, Zamboanga del Norte",
  description:
    "Sponsors' Meeting and Fellowship with Hon. Glona G. Labadlabad, Municipal Mayor of Sindangan.\n" +
    "Hosted by the Local Government of Sindangan and the Binibining Sindangan 2026 Committee.\n" +
    "Contact: (0915) 227 6737 / (065) 917 8385",
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

/* ---- Opening curtain ---- */
(function cover() {
  const cover = document.getElementById("cover");
  const btn = document.getElementById("openBtn");
  const open = () => {
    cover.classList.add("is-open");
    root.classList.remove("sealed");
    root.classList.add("opened");
  };
  btn.addEventListener("click", () => {
    window.scrollTo(0, 0);
    open();
    // Gold dust bursts through as the curtain parts.
    setTimeout(() => window.goldBurst && window.goldBurst(innerWidth / 2, innerHeight * 0.42, 90), 900);
  });
  // Links that point at a section (e.g. …/#rsvp) skip the curtain.
  if (location.hash && document.querySelector(location.hash)) open();
  else btn.focus({ preventScroll: true });
})();

/* ---- Title: split into letters so they can land one by one ---- */
(function splitTitle() {
  const h1 = document.querySelector(".hero h1");
  const text = h1.textContent.trim();
  h1.setAttribute("aria-label", text);
  h1.classList.remove("gold-text"); // each letter carries the gold fill instead
  h1.textContent = "";
  let i = 0;
  text.split(" ").forEach((word, w, all) => {
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    wordEl.setAttribute("aria-hidden", "true");
    for (const ch of word) {
      const el = document.createElement("span");
      el.className = "ch gold-text";
      el.style.setProperty("--i", i++);
      el.textContent = ch;
      wordEl.appendChild(el);
    }
    h1.appendChild(wordEl);
    if (w < all.length - 1) h1.appendChild(document.createTextNode(" "));
  });
})();

/* ---- Scroll: progress bar and hero parallax ---- */
(function scrollFx() {
  const hero = document.querySelector(".hero");
  let queued = false;
  function update() {
    queued = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty("--scroll", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");
    if (reduceMotion) return;
    root.classList.toggle("scrolled", y > 4);
    hero.style.setProperty("--p", Math.min(1, y / hero.offsetHeight).toFixed(4));
  }
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  // Keep the light rays centred on the statue's body, wherever the layout puts her.
  const statue = hero.querySelector(".statue--hero");
  function aimRays() {
    hero.style.setProperty("--ray-x", (statue.offsetLeft + statue.offsetWidth * 0.49).toFixed(1) + "px");
    hero.style.setProperty("--ray-y", (statue.offsetTop + statue.offsetHeight * 0.46).toFixed(1) + "px");
  }
  window.addEventListener("resize", () => {
    aimRays();
    update();
  });
  window.addEventListener("load", aimRays);
  aimRays();
  update();
})();

/* ---- Floating background music ----
   Plays assets/music.mp3 on a loop. It starts when the guest taps
   "Open Invitation" (browsers only allow sound after a tap), and the
   floating button pauses or resumes it. If the file is missing, the
   button never appears. */
(function music() {
  const audio = document.getElementById("bgm");
  const btn = document.getElementById("musicBtn");
  let available = false;
  let wanted = false; // the guest's choice: should music be on?

  const VOLUME = 0.6;
  let fadeTimer;
  // Ease the volume instead of cutting in and out. (iOS ignores volume changes; it just plays.)
  function fadeTo(target, ms, done) {
    clearInterval(fadeTimer);
    const from = audio.volume;
    const start = performance.now();
    fadeTimer = setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / ms);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k === 1) {
        clearInterval(fadeTimer);
        if (done) done();
      }
    }, 50);
  }

  function render() {
    const playing = !audio.paused;
    btn.classList.toggle("is-playing", playing);
    btn.setAttribute("aria-pressed", String(playing));
    const label = playing ? "Pause background music" : "Play background music";
    btn.setAttribute("aria-label", label);
    btn.title = playing ? "Pause music" : "Play music";
  }
  function play() {
    wanted = true;
    if (!available) return;
    if (audio.paused) audio.volume = 0;
    audio.play().then(() => fadeTo(VOLUME, 3000)).catch(() => {}).finally(render);
  }
  function pause() {
    wanted = false;
    fadeTo(0, 600, () => audio.pause());
  }

  function ready() {
    if (available) return;
    available = true;
    btn.hidden = false;
    if (wanted) play();
  }
  audio.addEventListener("loadedmetadata", ready);
  audio.addEventListener("error", () => {
    available = false;
    btn.hidden = true;
  });
  if (audio.readyState >= 1) ready();

  audio.addEventListener("play", render);
  audio.addEventListener("pause", render);
  btn.addEventListener("click", () => (audio.paused ? play() : pause()));
  document.getElementById("openBtn").addEventListener("click", play);

  // Don't keep playing when the guest switches apps or tabs.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(fadeTimer);
      audio.pause();
    } else if (wanted && available) play();
  });
})();

/* ---- Scroll reveal ---- */
(function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
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
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  items.forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    io.observe(el);
  });
})();

/* ---- Countdown ---- */
(function countdown() {
  const box = document.getElementById("countdown");
  const target = new Date(EVENT.start).getTime();
  const end = new Date(EVENT.end).getTime();
  const cells = {};
  box.querySelectorAll("[data-unit]").forEach((el) => (cells[el.dataset.unit] = el));
  const pad = (n) => String(n).padStart(2, "0");

  // Update a digit and replay its roll animation only when the value changes.
  function set(el, value) {
    if (el.textContent === value) return;
    const first = el.textContent === "--";
    el.textContent = value;
    if (first || reduceMotion) return;
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function tick() {
    const now = Date.now();
    let diff = target - now;
    if (diff <= 0) {
      box.classList.add("is-over");
      box.textContent = now < end ? "The gathering is happening now" : "Thank you for joining us";
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    set(cells.days, String(Math.floor(s / 86400)));
    set(cells.hours, pad(Math.floor((s % 86400) / 3600)));
    set(cells.minutes, pad(Math.floor((s % 3600) / 60)));
    set(cells.seconds, pad(s % 60));
  }
  const timer = setInterval(tick, 1000);
  tick();
})();

/* ---- Add to calendar ---- */
(function calendar() {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const dates = stamp(EVENT.start) + "/" + stamp(EVENT.end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: EVENT.title,
    dates,
    details: EVENT.description,
    location: EVENT.location,
  });
  document.getElementById("gcalBtn").href = "https://calendar.google.com/calendar/render?" + params;

  document.getElementById("icsBtn").addEventListener("click", () => {
    const esc = (t) => t.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Binibining Sindangan 2026//Sponsors Gathering//EN",
      "BEGIN:VEVENT",
      "UID:sponsors-gathering-2026@binibining-sindangan",
      "DTSTAMP:" + stamp(new Date().toISOString()),
      "DTSTART:" + stamp(EVENT.start),
      "DTEND:" + stamp(EVENT.end),
      "SUMMARY:" + esc(EVENT.title),
      "DESCRIPTION:" + esc(EVENT.description),
      "LOCATION:" + esc(EVENT.location),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "binibining-sindangan-sponsors-gathering.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
})();

/* ---- RSVP form ---- */
(function rsvp() {
  const form = document.getElementById("rsvpForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  const seatsField = document.getElementById("seatsField");
  const seats = document.getElementById("seats");
  const thanks = document.getElementById("thanks");

  const clampSeats = () => {
    const n = Math.min(10, Math.max(1, parseInt(seats.value, 10) || 1));
    seats.value = n;
    return n;
  };
  form.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => {
      seats.value = (parseInt(seats.value, 10) || 1) + Number(b.dataset.step);
      clampSeats();
    })
  );
  seats.addEventListener("change", clampSeats);

  form.querySelectorAll('input[name="attending"]').forEach((r) =>
    r.addEventListener("change", () => {
      seatsField.hidden = form.attending.value !== "Yes";
    })
  );

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

  function showThanks(data, viaEmail) {
    const attending = data.attending === "Yes";
    document.getElementById("thanksTitle").textContent = attending ? "See you there!" : "Thank you!";
    document.getElementById("thanksText").textContent = viaEmail
      ? "Your email app should now be open with your RSVP ready. Please press send to confirm."
      : attending
        ? "Your RSVP has been received. We look forward to spending this inspiring evening with you."
        : "Thank you for letting us know. We hope to see you at Binibining Sindangan 2026.";
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus({ preventScroll: true });
    thanks.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    if (attending && window.goldBurst) setTimeout(() => window.goldBurst(innerWidth / 2, innerHeight / 2, 120), 500);
  }

  function emailFallback(data) {
    const body = [
      "RSVP for the Sponsors' Gathering (November 22, 2026, 7:00 PM, Sound Check Lounge and Bar)",
      "",
      "Name: " + data.name,
      "Company / Organization: " + data.company,
      "Mobile: " + data.phone,
      "Email: " + (data.email || "-"),
      "Attending: " + data.attending,
      "Seats: " + data.seats,
      "Message: " + (data.message || "-"),
    ].join("\n");
    location.href =
      "mailto:" + RSVP_EMAIL +
      "?subject=" + encodeURIComponent("RSVP: Sponsors' Gathering - " + data.company) +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "form__status";
    status.textContent = "";
    if (!validate()) return;
    if (form.website.value) return; // spam trap filled: silently drop

    const attending = form.attending.value;
    const data = {
      name: form.name.value.trim(),
      company: form.company.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      attending,
      seats: attending === "Yes" ? String(clampSeats()) : "0",
      message: form.message.value.trim(),
    };

    if (!RSVP_ENDPOINT) {
      emailFallback(data);
      showThanks(data, true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      const res = await fetch(RSVP_ENDPOINT, { method: "POST", body: new URLSearchParams(data) });
      const out = await res.json();
      if (!out.ok) throw new Error(out.error || "Not saved");
      showThanks(data, false);
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

/* ---- Gold sparkles ---- */
(function sparkles() {
  const canvas = document.getElementById("sparkles");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let w, h, dots, raf;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
    for (const d of dots) {
      const glow = 0.25 + 0.75 * Math.abs(Math.sin(d.phase + (t / 1000) * d.speed));
      ctx.globalAlpha = glow * 0.85;
      ctx.fillStyle = "#f6d98b";
      if (d.star) {
        const s = d.r * 3.2 * glow;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - s);
        ctx.quadraticCurveTo(d.x, d.y, d.x + s, d.y);
        ctx.quadraticCurveTo(d.x, d.y, d.x, d.y + s);
        ctx.quadraticCurveTo(d.x, d.y, d.x - s, d.y);
        ctx.quadraticCurveTo(d.x, d.y, d.x, d.y - s);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
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

  const sparks = [];
  const SPARK_COLORS = ["#fff1c2", "#f6d98b", "#e9c46a", "#c9962f"];
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
})();
