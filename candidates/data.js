/* =========================================================
   Binibining Sindangan 2026 — Top 20 Candidates page
   CONTENT. Edit this file to update what the page shows;
   nothing else needs to change.
   ========================================================= */

/* ---- The Top 20 ------------------------------------------------
   While this list is empty the page hides the "Top 20" section and
   candidates type their own number and name in the form.
   Once it is filled in, the page shows the list and each candidate
   can pick her name to fill in her number automatically.

   One line per candidate, for example:
   { no: 1, name: "Maria Clara Santos", rep: "Barangay Poblacion" },   */
const TOP20 = [];

/* ---- Activities and attires ------------------------------------
   One block per date, in the order they happen. While the list is
   empty the page says the schedule will be posted soon.

   Every value except "date" is optional; leave it out (or as "") and
   it is simply not shown:
     date    "December 1"
     day     "Tuesday"
     time    "4 PM onwards"
     title   the main activity, shown large
     note    a short line under the title
     events  ["Sashing", "Press Conference"], a list of what happens that day
     venue   where it is held
     attire  what to wear, e.g. "White top, denim jeans, nude heels".
             Add this line to a date when the attire is decided.        */
const ACTIVITIES = [
  {
    date: "November 21–22",
    day: "Saturday and Sunday",
    time: "9:00 AM – 5:00 PM",
    title: "Screening Day 1 & 2",
    note: "1st & 2nd set of Bb. Sindangan aspirants",
    venue: "Sindangan People's Cultural and Sports Center",
  },
  {
    date: "December 1",
    day: "Tuesday",
    time: "4 PM onwards",
    events: ["Arrival of Candidates", "Lights On", "Reveal of Top 20", "Sashing", "Contract Signing", "Press Conference"],
    venue: "Sindangan Municipal Grounds",
  },
  {
    date: "December 2–3",
    day: "Wednesday and Thursday",
    title: "Photo and Video Shoot",
    note: "Day 1 & 2",
    venue: "Sindangan Landmarks",
  },
  {
    date: "December 15",
    day: "Tuesday",
    events: ["Arrival of Candidates", "Sponsor's Night"],
    venue: "Alba City and Sound Check Lounge & Bar",
  },
  {
    date: "December 16",
    day: "Wednesday",
    events: ["Float Parade", "Rehearsal"],
    venue: "Municipal Hall and Sindangan People's Cultural and Sports Center",
  },
  {
    date: "December 17",
    day: "Thursday",
    title: "Preliminary Night",
    events: ["Festival Wear Photoshoot", "Festival Wear Competition", "Talent Competition", "Sponsor's Awards"],
    venue: "Sindangan People's Cultural and Sports Center",
  },
  {
    date: "December 18",
    day: "Friday",
    title: "Stage Rehearsal",
    note: "Whole day",
    venue: "Sindangan People's Cultural and Sports Center",
  },
  {
    date: "December 19",
    day: "Saturday",
    time: "5 PM",
    title: "Technical Rehearsal",
    venue: "Sindangan People's Cultural and Sports Center",
  },
  {
    date: "December 20",
    day: "Sunday",
    events: ["Closed Door Interview (1 PM)", "Coronation Night (7 PM)"],
    venue: "3rd Floor Municipal Ground & Sindangan People's Cultural and Sports Center",
  },
];
