const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const weekdayDescriptors = [
  "Embodying Stillness",
  "Deep Focus and Clarity",
  "Measured Momentum",
  "Thoughtful Collaboration",
  "Finishing with Intention",
  "Flexible Recovery",
  "Quiet Reset"
];
const storeKey = "flowkanso_v6";

const defaultState = {
  profile: { wake: "07:00", sleep: "23:30", learned: false },
  journal: {
    mode: "daily",
    morning: "",
    gratitude: ["", "", ""],
    notes: "",
    archived: true,
    archivedAt: "",
    reflectionsFilter: "all",
    reflectionVariant: 0,
    showAllInsights: false,
    reflectionAnswers: ["", ""],
    reflectionsCompletedAt: ""
  },
  fixed: [
    { id: crypto.randomUUID(), title: "Supervisor Meeting", day: "Monday", start: "11:00", end: "12:30", type: "fixed" },
    { id: crypto.randomUUID(), title: "MRes Deep Work", day: "Tuesday", start: "09:00", end: "12:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "Data Analytics", day: "Thursday", start: "20:00", end: "23:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "Badminton", day: "Friday", start: "18:00", end: "20:00", type: "fixed" }
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "MRes Thesis Writing",
      duration: 120,
      deadline: "",
      important: true,
      urgent: true,
      zone: "q1",
      done: false,
      scheduled: { day: "Monday", start: "09:00", end: "11:00" },
      doneAt: null,
      note: "Drafting the methodology section for the qualitative analysis of urban resilience."
    },
    {
      id: crypto.randomUUID(),
      title: "Gym (Leg Day)",
      duration: 60,
      deadline: "",
      important: true,
      urgent: false,
      zone: "q2",
      done: false,
      scheduled: null,
      doneAt: null,
      note: "Suggested slot: 14:30 - 15:30"
    },
    {
      id: crypto.randomUUID(),
      title: "SQL Advanced Queries",
      duration: 90,
      deadline: "",
      important: true,
      urgent: false,
      zone: "q2",
      done: false,
      scheduled: null,
      doneAt: null,
      note: "Focus: Join optimizations and window functions."
    },
    {
      id: crypto.randomUUID(),
      title: "Research Proposal",
      duration: 45,
      deadline: upcomingDeadline(1, 10),
      important: true,
      urgent: true,
      zone: "q1",
      done: false,
      scheduled: null,
      doneAt: null,
      note: "Deadline: Tomorrow 10am"
    },
    {
      id: crypto.randomUUID(),
      title: "Journaling",
      duration: 10,
      deadline: "",
      important: true,
      urgent: false,
      zone: "q2",
      done: false,
      scheduled: null,
      doneAt: null,
      note: "Daily habit • 10 min"
    }
  ],
  timelineDay: 0,
  editingFixedId: null,
  interactionDays: {},
  collections: { filter: "all" }
};

let state = structuredClone(defaultState);
let composerMode = "task";
let searchQuery = "";
let goalsAiTimeout = null;
let weeklyWeekOffset = 0;
let editingTaskId = null;
const themeStorageKey = "kanso_theme_v1";

const scrollDateTextEl = document.getElementById("scrollDateText");
const scrollTitleTextEl = document.getElementById("scrollTitleText");
const livingScrollEl = document.getElementById("livingScroll");
const weeklyRhythmEl = document.getElementById("weeklyRhythm");
const zenFocusListEl = document.getElementById("zenFocusList");
const wakeMetricEl = document.getElementById("wakeMetric");
const sleepMetricEl = document.getElementById("sleepMetric");
const topbarEl = document.getElementById("appTopbar");
const rhythmDialogEl = document.getElementById("rhythmDialog");
const composerDialogEl = document.getElementById("composerDialog");
const dashboardViewEl = document.getElementById("dashboardView");
const journalViewEl = document.getElementById("journalView");
const weeklyViewEl = document.getElementById("weeklyView");
const matrixViewEl = document.getElementById("matrixView");
const goalsViewEl = document.getElementById("goalsView");
const collectionsViewEl = document.getElementById("collectionsView");
const clarityValueEl = document.getElementById("clarityValue");
const clarityTextEl = document.getElementById("clarityText");
const appShellEl = document.querySelector(".app-shell");
const fabButtonEl = document.getElementById("fabButton");
const goalWeekMiniEl = document.getElementById("goalWeekMini");
const goalSpotlightTitleEl = document.getElementById("goalSpotlightTitle");
const goalSpotlightMetaEl = document.getElementById("goalSpotlightMeta");
const goalProgressValueEl = document.getElementById("goalProgressValue");
const habitDotsEl = document.getElementById("habitDots");
const goalScheduleBtnEl = document.getElementById("goalScheduleBtn");
const journeyScheduleBtnEl = document.getElementById("journeyScheduleBtn");
const topPerformerTitleEl = document.getElementById("topPerformerTitle");
const topPerformerTextEl = document.getElementById("topPerformerText");
const habitGrowthTextEl = document.getElementById("habitGrowthText");
const engineStripTextEl = document.getElementById("engineStripText");
const strengthMetricEl = document.getElementById("strengthMetric");
const mobilityMetricEl = document.getElementById("mobilityMetric");
const strengthBarEl = document.getElementById("strengthBar");
const mobilityBarEl = document.getElementById("mobilityBar");
const goalsPageEl = document.querySelector(".goals-page");
const weeklyDateStripEl = document.getElementById("weeklyDateStrip");
const weeklyBoardGridEl = document.getElementById("weeklyBoardGrid");
const weeklyMonthLabelEl = document.getElementById("weeklyMonthLabel");
const journalDateLabelEl = document.getElementById("journalDateLabel");
const journalMorningInputEl = document.getElementById("journalMorningInput");
const journalGratitudeEls = [
  document.getElementById("journalGratitude1"),
  document.getElementById("journalGratitude2"),
  document.getElementById("journalGratitude3")
];
const journalNotesInputEl = document.getElementById("journalNotesInput");
const journalArchiveTextEl = document.getElementById("journalArchiveText");
const journalDailyPaneEl = document.getElementById("journalDailyPane");
const journalReflectionsPaneEl = document.getElementById("journalReflectionsPane");
const journalNavButtons = {
  journal: document.getElementById("journalNavMain"),
  intentions: document.getElementById("journalNavIntentions"),
  archive: document.getElementById("journalNavArchive"),
  reflections: document.getElementById("journalNavReflections")
};
const reflectionsBarsEl = document.getElementById("reflectionsBars");
const reflectionsPrimaryFocusEl = document.getElementById("reflectionsPrimaryFocus");
const reflectionsQuoteEl = document.getElementById("reflectionsQuote");
const reflectionsInsightIdEl = document.getElementById("reflectionsInsightId");
const reflectionsInsightsGridEl = document.getElementById("reflectionsInsightsGrid");
const reflectionAnswerOneEl = document.getElementById("reflectionAnswerOne");
const reflectionAnswerTwoEl = document.getElementById("reflectionAnswerTwo");
const reflectionsFilterBtnEl = document.getElementById("reflectionsFilterBtn");
const reflectionsMoreBtnEl = document.getElementById("reflectionsMoreBtn");
const reflectionsViewAllBtnEl = document.getElementById("reflectionsViewAllBtn");
const completeReflectionBtnEl = document.getElementById("completeReflectionBtn");
const journalReflectionsBackBtnEl = document.getElementById("journalReflectionsBackBtn");

loadState();

function upcomingDeadline(daysAhead, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

function toMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function toTime(total) {
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hours = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const minutes = String(wrapped % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getSelectedDay() {
  const selected = getSelectedDate();
  const jsDay = selected.getDay();
  const idx = jsDay === 0 ? 6 : jsDay - 1;
  return days[idx];
}

function getTodayTimelineDayIndex() {
  const jsDay = new Date().getDay(); // 0..6 (Sun..Sat)
  return jsDay === 0 ? 6 : jsDay - 1; // 0..6 (Mon..Sun)
}

function getSelectedDate() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const selected = new Date(today);
  selected.setDate(today.getDate() + (Number(state.timelineDay) || 0));
  return selected;
}

function getSelectedDayIndex() {
  const selected = getSelectedDate();
  const jsDay = selected.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getWeekStartDate(offsetWeeks = 0) {
  const today = new Date();
  const jsDay = today.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + offsetWeeks * 7);
  monday.setHours(12, 0, 0, 0);
  return monday;
}

function getWeekDates(offsetWeeks = 0) {
  const monday = getWeekStartDate(offsetWeeks);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function getDateTitle() {
  const selected = getSelectedDate();
  return selected.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function getDateLabel() {
  const descriptor = weekdayDescriptors[getSelectedDayIndex()] || "Balanced focus";
  return descriptor;
}

function zoneLabel(zone) {
  return {
    q1: "Do First",
    q2: "Schedule",
    q3: "Delegate",
    q4: "Eliminate"
  }[zone] || "Schedule";
}

function zoneBadge(zone) {
  return {
    q1: "Deep Work",
    q2: "Fluid Session",
    q3: "Delegated Flow",
    q4: "Lightweight Task"
  }[zone] || "Focus Block";
}

function zoneWeight(zone) {
  return { q1: 4, q2: 3, q3: 2, q4: 1 }[zone] || 0;
}

function matchesQuery(text) {
  if (!searchQuery) return true;
  return text.toLowerCase().includes(searchQuery);
}

function loadState() {
  const raw = localStorage.getItem(storeKey);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    state = {
      ...structuredClone(defaultState),
      ...parsed,
      profile: { ...defaultState.profile, ...(parsed.profile || {}) },
      journal: { ...defaultState.journal, ...(parsed.journal || {}) },
      fixed: Array.isArray(parsed.fixed) ? parsed.fixed : structuredClone(defaultState.fixed),
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(defaultState.tasks),
      interactionDays: parsed.interactionDays && typeof parsed.interactionDays === "object" ? parsed.interactionDays : {},
      collections: { ...defaultState.collections, ...(parsed.collections || {}) }
    };
  } catch {
    state = structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function toLocalDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function markInteractionDay(date = new Date()) {
  const key = toLocalDateKey(date);
  state.interactionDays[key] = true;
}

function getWeeklyInteractionDayCount() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return Object.keys(state.interactionDays || {}).filter((dateKey) => {
    const d = new Date(`${dateKey}T00:00:00`);
    return !Number.isNaN(d.getTime()) && d >= start && d <= end;
  }).length;
}

function getWeeklyTreeStage() {
  return Math.max(1, Math.min(7, getWeeklyInteractionDayCount()));
}

function eventConflicts(day, start, end, ignoreId = null, onDate = "") {
  const dateRef = onDate ? new Date(`${onDate}T00:00:00`) : getSelectedDate();
  const fixedConflict = state.fixed.some((event) => {
    if (event.id === ignoreId) return false;
    if (!eventOccursOn(day, dateRef, event)) return false;
    return start < toMinutes(event.end) && toMinutes(event.start) < end;
  });
  if (fixedConflict) return true;

  return state.tasks.some((task) => {
    if (!task.scheduled || task.id === ignoreId || task.scheduled.day !== day) return false;
    return start < toMinutes(task.scheduled.end) && toMinutes(task.scheduled.start) < end;
  });
}

function suggestQuadrant(task) {
  const deadlineMs = task.deadline ? new Date(task.deadline).getTime() : Infinity;
  const deadlineUrgent = deadlineMs - Date.now() <= 48 * 60 * 60 * 1000;
  const urgent = task.urgent || deadlineUrgent;
  if (task.important && urgent) return "q1";
  if (task.important) return "q2";
  if (urgent) return "q3";
  return "q4";
}

function syncTaskZonesWithRules() {
  let changed = false;
  state.tasks.forEach((task) => {
    const nextZone = suggestQuadrant(task);
    if (task.zone !== nextZone) {
      task.zone = nextZone;
      changed = true;
    }
  });
  if (changed) saveState();
}

function inferRhythmFromHistory() {
  const completed = state.tasks.filter((task) => task.doneAt);
  if (completed.length < 2) return;

  const minutes = completed.map((task) => {
    const date = new Date(task.doneAt);
    return date.getHours() * 60 + date.getMinutes();
  });

  const wake = Math.max(Math.min(...minutes) - 120, 5 * 60);
  const sleep = Math.min(Math.max(...minutes) + 180, 23 * 60 + 30);
  state.profile.wake = toTime(wake);
  state.profile.sleep = toTime(sleep);
  state.profile.learned = true;
}

function dayFromDateString(dateStr) {
  if (!dateStr) return "";
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return days[parsed.getDay() === 0 ? 6 : parsed.getDay() - 1];
}

function toDateInputValue(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function eventOccursOn(dayName, date, event) {
  if (event.recurring) {
    const repeatDays = Array.isArray(event.repeatDays) && event.repeatDays.length ? event.repeatDays : [event.day].filter(Boolean);
    if (!repeatDays.includes(dayName)) return false;
    if (event.startDate) {
      const start = new Date(`${event.startDate}T00:00:00`);
      if (date < start) return false;
    }
    if (event.repeatUntil) {
      const until = new Date(`${event.repeatUntil}T23:59:59`);
      if (date > until) return false;
    }
    return true;
  }

  if (event.startDate) {
    const eventDate = new Date(`${event.startDate}T00:00:00`);
    return sameCalendarDay(date, eventDate);
  }
  return event.day === dayName;
}

function fixedMeta(event) {
  const detailParts = [];
  if (event.location) detailParts.push(event.location);
  if (event.recurring) detailParts.push("Recurring");
  if (event.link) detailParts.push("Meeting link");

  if (event.title.toLowerCase().includes("supervisor")) {
    return {
      badge: "Fixed Appointment",
      people: ["DR", "SV"],
      detail: detailParts.join(" • ") || "Science Block, Room 402"
    };
  }

  return {
    badge: "Fixed Appointment",
    people: ["KC"],
    detail: detailParts.join(" • ") || `${event.day || "Weekly"} commitment`
  };
}

function taskDescription(task) {
  if (task.note) return task.note;
  if (task.deadline) return `Deadline ${new Date(task.deadline).toLocaleString()}`;
  return `${zoneLabel(task.zone)} session`;
}

function renderScrollHeader() {
  if (scrollTitleTextEl) scrollTitleTextEl.textContent = getDateTitle();
  scrollDateTextEl.textContent = getDateLabel();
}

function getCurrentDayEntries() {
  const day = getSelectedDay();
  const selectedDate = getSelectedDate();

  const scheduled = [
    ...state.fixed
      .filter((event) => eventOccursOn(day, selectedDate, event))
      .map((event) => ({
        kind: "fixed",
        sortKey: toMinutes(event.start),
        timeLabel: event.allDay ? "All day" : event.start,
        typeLabel: "",
        data: event
      })),
    ...state.tasks
      .filter((task) => !task.done && task.scheduled?.day === day)
      .map((task) => ({
        kind: "scheduled-task",
        sortKey: toMinutes(task.scheduled.start),
        timeLabel: task.scheduled.start,
        typeLabel: "",
        data: task
      }))
  ]
    .filter((entry) => matchesQuery(`${entry.data.title} ${taskDescription(entry.data)}`))
    .sort((left, right) => left.sortKey - right.sortKey);

  const suggested = computeSuggestedSlots(day)
    .filter((entry) => matchesQuery(`${entry.task.title} ${taskDescription(entry.task)}`))
    .map((entry) => ({
      kind: "suggested-task",
      sortKey: entry.start,
      timeLabel: "",
      typeLabel: "Flexible",
      data: entry.task,
      suggestion: entry
    }));

  return [...scheduled, ...suggested];
}

function computeSuggestedSlots(day) {
  const selectedDate = getSelectedDate();
  const wake = toMinutes(state.profile.wake);
  const sleep = toMinutes(state.profile.sleep);
  const occupied = [
    ...state.fixed
      .filter((event) => eventOccursOn(day, selectedDate, event))
      .map((event) => ({ start: toMinutes(event.start), end: toMinutes(event.end) })),
    ...state.tasks
      .filter((task) => !task.done && task.scheduled?.day === day)
      .map((task) => ({ start: toMinutes(task.scheduled.start), end: toMinutes(task.scheduled.end) }))
  ].sort((left, right) => left.start - right.start);

  const tasks = state.tasks
    .filter((task) => !task.done && !task.scheduled)
    .slice()
    .sort((left, right) => {
      const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Infinity;
      const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Infinity;
      if (zoneWeight(right.zone) !== zoneWeight(left.zone)) return zoneWeight(right.zone) - zoneWeight(left.zone);
      return leftDeadline - rightDeadline;
    });

  const suggestions = [];
  const simulated = occupied.slice();

  tasks.forEach((task) => {
    for (let start = wake; start + task.duration <= sleep; start += 30) {
      const end = start + task.duration;
      const conflict = simulated.some((block) => start < block.end && block.start < end);
      if (conflict) continue;
      simulated.push({ start, end });
      simulated.sort((left, right) => left.start - right.start);
      suggestions.push({ task, start, end });
      break;
    }
  });

  return suggestions;
}

function createPersonStack(people) {
  return `<div class="people-stack">${people
    .map((person) => `<span class="person-avatar">${person}</span>`)
    .join("")}</div>`;
}

const iconPeople = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.96 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`;
const iconFluid = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17h4v4H3v-4zM17 3h4v4h-4V3zM3 3h4v4H3V3zm14 14h4v4h-4v-4zM7 7h10v10H7V7z"/></svg>`;
const iconBook = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h9a2 2 0 0 1 2 2v14l-5-2-5 2V6a2 2 0 0 0-2-2zm9 0h3v16h-3"/></svg>`;
const iconPin = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/></svg>`;

function suggestedCardKind(task) {
  const lower = task.title.toLowerCase();
  if (lower.includes("sql") || lower.includes("self-study")) return "self";
  return "fluid";
}

function timelineMarker(entry) {
  if (entry.typeLabel === "Flexible") return "flex";
  if (entry.kind === "fixed") return "pin";
  return "dot";
}

const MARKER_ARIA = {
  flex: "Flexible slot — suggested time, not fixed on your plan yet",
  pin: "Fixed appointment — pinned to your calendar",
  dot: "Scheduled block on your plan",
};

function markerMarkup(kind) {
  const aria = MARKER_ARIA[kind] || MARKER_ARIA.dot;
  if (kind === "flex")
    return `<span class="entry-marker entry-marker--flex" role="img" aria-label="${aria}"></span>`;
  if (kind === "pin")
    return `<span class="entry-marker entry-marker--pin" role="img" aria-label="${aria}">${iconPin}</span>`;
  return `<span class="entry-marker entry-marker--dot" role="img" aria-label="${aria}"></span>`;
}

function scrollEntryLead(marker, entry) {
  const isFlex = entry.typeLabel === "Flexible";
  const labelText = isFlex ? entry.typeLabel : entry.timeLabel;
  const timeClass = `scroll-entry__time${isFlex ? " is-flex-label" : ""}`;
  return `
    <div class="scroll-entry__timeline">${marker}</div>
    <div class="${timeClass}">${labelText}</div>
  `;
}

function renderLivingScroll() {
  // #region agent log: living scroll render (H1)
  fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1ecfd5"
    },
    body: JSON.stringify({
      sessionId: "1ecfd5",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app.js:renderLivingScroll",
      message: "renderLivingScroll invoked",
      data: {},
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  const entries = getCurrentDayEntries();

  if (!entries.length) {
    livingScrollEl.innerHTML = `
      <article class="scroll-entry">
        ${scrollEntryLead(markerMarkup("flex"), { typeLabel: "Flexible", timeLabel: "" })}
        <div class="entry-card fluid-card empty-scroll">
          <div class="entry-meta">
            <span class="badge-pill badge-pill--deep">Open space</span>
          </div>
          <h3 class="entry-title">A clear scroll for today</h3>
          <p class="entry-copy">Add a task with the plus button or use Smart Scheduler to start shaping the day.</p>
        </div>
      </article>
    `;
    return;
  }

  livingScrollEl.innerHTML = entries
    .map((entry) => {
      const marker = markerMarkup(timelineMarker(entry));

      if (entry.kind === "fixed") {
        const meta = fixedMeta(entry.data);
        return `
          <article class="scroll-entry">
            ${scrollEntryLead(marker, entry)}
            <div class="entry-card entry-card--fixed">
              <div class="entry-meta">
                <span class="badge-pill badge-pill--fixed">${iconPeople}${meta.badge}</span>
                <details class="entry-more">
                  <summary class="entry-more-btn" aria-label="Appointment options">⋯</summary>
                  <div class="entry-more-menu">
                    <button type="button" data-edit-fixed="${entry.data.id}">Edit appointment</button>
                  </div>
                </details>
              </div>
              <h3 class="entry-title">${entry.data.title}</h3>
              <div class="entry-support">
                <div class="people-row">
                  ${createPersonStack(meta.people)}
                  <span class="person-label">${meta.detail}</span>
                </div>
                ${entry.data.link ? `<a class="entry-link" href="${entry.data.link}" target="_blank" rel="noreferrer noopener">Open meeting link</a>` : ""}
              </div>
            </div>
          </article>
        `;
      }

      if (entry.kind === "scheduled-task") {
        const task = entry.data;
        const done = task.done;
        return `
          <article class="scroll-entry">
            ${scrollEntryLead(marker, entry)}
            <div class="entry-card entry-card--deep${done ? " done-card" : ""}">
              <div class="entry-meta">
                <span class="badge-pill badge-pill--deep">Deep work</span>
                <details class="entry-more">
                  <summary class="entry-more-btn" aria-label="Task options">⋯</summary>
                  <div class="entry-more-menu">
                    <button type="button" data-edit-task="${task.id}">Edit task</button>
                    <button type="button" data-toggle-task="${task.id}">${done ? "Mark not done" : "Mark done"}</button>
                    <button type="button" data-delete-task="${task.id}">Remove</button>
                  </div>
                </details>
              </div>
              <h3 class="entry-title">${task.title}</h3>
              <p class="entry-copy">${taskDescription(task)}</p>
            </div>
          </article>
        `;
      }

      const suggestionLabel = `${toTime(entry.suggestion.start)} - ${toTime(entry.suggestion.end)}`;
      const task = entry.data;
      const kind = suggestedCardKind(task);
      const isSelf = kind === "self";
      const badgeLabel = isSelf ? "Self-study" : "Fluid session";
      const badgeIcon = isSelf ? iconBook : iconFluid;
      const cardClass = isSelf ? "entry-card--self" : "entry-card--fluid";
      const copy = isSelf
        ? task.note || taskDescription(task)
        : task.note && task.note.trim().length
          ? task.note
          : `Suggested slot: ${suggestionLabel}`;

      return `
        <article class="scroll-entry">
          ${scrollEntryLead(marker, entry)}
          <div class="entry-card ${cardClass}">
            <div class="entry-meta">
              <span class="badge-pill ${isSelf ? "badge-pill--self" : "badge-pill--fluid"}">${badgeIcon}${badgeLabel}</span>
              <span class="entry-duration-pill">${task.duration} MIN</span>
            </div>
            <h3 class="entry-title">${task.title}</h3>
            <p class="entry-copy">${isSelf ? task.note || copy : copy}</p>
            <div class="entry-actions fluid-actions">
              <button class="entry-action" type="button" data-schedule-task="${task.id}" data-start="${toTime(
                entry.suggestion.start
              )}" data-end="${toTime(entry.suggestion.end)}">Schedule to slot</button>
              <button class="entry-action" type="button" data-delete-task="${task.id}">Remove</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  bindScrollActions();

  // #region agent log: timeline alignment measure (H2)
  requestAnimationFrame(() => {
    try {
      const livingRect = livingScrollEl.getBoundingClientRect();
      const cs = getComputedStyle(livingScrollEl);
      const timelineXRem = parseFloat(cs.getPropertyValue("--timeline-x")) || 0;
      const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const timelineXpx = timelineXRem * rootFont;

      // Measure actual pseudo-element position if supported
      let beforeLeftPx = null;
      try {
        const beforeStyle = getComputedStyle(livingScrollEl, "::before");
        beforeLeftPx = beforeStyle.left ? beforeStyle.left : null;
      } catch (e) {
        beforeLeftPx = null;
      }
      const spineX = livingRect.left + timelineXpx;

      const entryEls = Array.from(livingScrollEl.querySelectorAll(".scroll-entry")).slice(0, 3);
      entryEls.forEach((entryEl, i) => {
        const markerEl = entryEl.querySelector(".entry-marker");
        const timeEl = entryEl.querySelector(".scroll-entry__time");
        const cardEl = entryEl.querySelector(".entry-card");
        if (!markerEl || !timeEl || !cardEl) return;

        const markerRect = markerEl.getBoundingClientRect();
        const markerCs = getComputedStyle(markerEl);
        const timeRect = timeEl.getBoundingClientRect();
        const cardRect = cardEl.getBoundingClientRect();

        const markerCenterX = markerRect.left + markerRect.width / 2;
        const markerCenterY = markerRect.top + markerRect.height / 2;

        const deltaX = markerCenterX - spineX;
        const deltaY_markerToCardTop = markerCenterY - cardRect.top;
        const deltaY_timeToCardTop = timeRect.top - cardRect.top;

        const cardType = cardEl.className.includes("entry-card--fixed")
          ? "fixed"
          : cardEl.className.includes("entry-card--fluid")
            ? "fluid"
            : cardEl.className.includes("entry-card--self")
              ? "self"
              : "other";

        fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1ecfd5" },
          body: JSON.stringify({
            sessionId: "1ecfd5",
            runId: "timeline-align-pre2",
            hypothesisId: "H2",
            location: "app.js:renderLivingScroll:measure",
            message: "marker/time/card vs spine alignment deltas",
            data: {
              i,
              cardType,
              timelineXRem,
              timelineXpx,
              pseudoBeforeLeft: beforeLeftPx,
              spineX,
              markerCenterX,
              markerComputedPosition: markerCs.position,
              markerComputedLeft: markerCs.left,
              markerComputedTop: markerCs.top,
              deltaX,
              markerCenterY,
              deltaY_markerToCardTop,
              timeRectTop: timeRect.top,
              cardRectTop: cardRect.top,
              deltaY_timeToCardTop
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
      });
    } catch (e) {
      // #region agent log: timeline alignment measure error (H2)
      fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1ecfd5" },
        body: JSON.stringify({
          sessionId: "1ecfd5",
          runId: "timeline-align-pre2",
          hypothesisId: "H2",
          location: "app.js:renderLivingScroll:measure",
          message: "alignment measure failed",
          data: { error: String(e && e.message ? e.message : e) },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion
    }
  });
  // #endregion agent log: timeline alignment measure (H2)
}

function bindScrollActions() {
  document.querySelectorAll("[data-edit-fixed]").forEach((button) => {
    button.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
      const event = state.fixed.find((item) => item.id === button.dataset.editFixed);
      if (!event) return;
      openComposer("fixed", event);
      const details = button.closest("details");
      if (details) details.open = false;
    });
  });

  document.querySelectorAll("[data-edit-task]").forEach((button) => {
    button.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
      const task = state.tasks.find((item) => item.id === button.dataset.editTask);
      if (!task) return;
      openComposer("task", task);
      const details = button.closest("details");
      if (details) details.open = false;
    });
  });

  document.querySelectorAll("[data-toggle-task]").forEach((button) => {
    button.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
      const task = state.tasks.find((item) => item.id === button.dataset.toggleTask);
      if (!task) return;
      task.done = !task.done;
      task.doneAt = task.done ? new Date().toISOString() : null;
      if (task.done) markInteractionDay(new Date(task.doneAt));
      inferRhythmFromHistory();
      saveState();
      renderApp();
      const details = button.closest("details");
      if (details) details.open = false;
    });
  });

  document.querySelectorAll("[data-schedule-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.tasks.find((item) => item.id === button.dataset.scheduleTask);
      if (!task) return;
      task.scheduled = {
        day: getSelectedDay(),
        start: button.dataset.start,
        end: button.dataset.end
      };
      saveState();
      renderApp();
    });
  });

  document.querySelectorAll("[data-delete-task]").forEach((button) => {
    button.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
      state.tasks = state.tasks.filter((task) => task.id !== button.dataset.deleteTask);
      saveState();
      renderApp();
      const details = button.closest("details");
      if (details) details.open = false;
    });
  });
}

function progressFor(keyword, target) {
  const total = target;
  const completed = state.tasks.filter((task) => task.title.toLowerCase().includes(keyword) && task.done).length;
  const count = Math.min(completed, total);
  const percentage = total ? Math.round((count / total) * 100) : 0;
  return { count, total, percentage };
}

function renderMomentumDays() {
  const el = document.getElementById("momentumDays");
  if (!el) return;
  const weekDates = getWeekDates(0);
  const today = new Date();
  const letters = ["M", "T", "W", "T", "F", "S", "S"];
  el.innerHTML = weekDates
    .map((date, index) => {
      const done = state.tasks.some((task) => task.doneAt && sameCalendarDay(new Date(task.doneAt), date));
      const isToday = sameCalendarDay(date, today);
      const classes = ["momentum-day"];
      if (done) classes.push("done");
      if (isToday) classes.push("today");
      const inner = done ? "✓" : letters[index];
      return `<span class="${classes.join(" ")}" title="${days[index]}">${inner}</span>`;
    })
    .join("");
}

function renderWeeklyRhythm() {
  const gym = progressFor("gym", 5);
  const sql = progressFor("sql", 3);

  weeklyRhythmEl.innerHTML = `
    <div class="progress-item">
      <div class="progress-label-row">
        <span>Gym Progress</span>
        <span class="progress-value">${gym.count}/${gym.total} Sessions</span>
      </div>
      <div class="progress-track"><div class="progress-bar gym" style="width:${gym.percentage}%"></div></div>
    </div>
    <div class="progress-item">
      <div class="progress-label-row">
        <span>SQL Mastery</span>
        <span class="progress-value">${sql.count}/${sql.total} Blocks</span>
      </div>
      <div class="progress-track"><div class="progress-bar sql" style="width:${sql.percentage}%"></div></div>
    </div>
  `;
  renderMomentumDays();
}

function minutesFromClock(str) {
  if (!str || typeof str !== "string") return 0;
  const parts = str.trim().split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return ((h % 24) * 60 + ((m % 60) + 60) % 60 + 1440) % 1440;
}

/** 0–1 progress of “now” between wake and sleep (same day or across midnight). */
function rhythmProgressBetweenWakeSleep(wakeStr, sleepStr, date = new Date()) {
  const wake = minutesFromClock(wakeStr);
  const sleep = minutesFromClock(sleepStr);
  const now = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;

  if (sleep > wake) {
    const len = sleep - wake;
    if (len <= 0) return 0;
    if (now <= wake) return 0;
    if (now >= sleep) return 1;
    return (now - wake) / len;
  }

  const len = 1440 - wake + sleep;
  if (len <= 0) return 0;
  if (now >= wake) return Math.min(1, (now - wake) / len);
  if (now <= sleep) return Math.min(1, (1440 - wake + now) / len);
  return 1;
}

function updateRhythmNowDot() {
  const line = document.getElementById("rhythmLine");
  if (!line) return;
  const p = rhythmProgressBetweenWakeSleep(state.profile.wake, state.profile.sleep);
  const pct = Math.max(0, Math.min(1, p));
  line.style.setProperty("--rhythm-pct", `${pct * 100}%`);
}

function renderDailyRhythm() {
  wakeMetricEl.textContent = state.profile.wake;
  sleepMetricEl.textContent = state.profile.sleep;
  document.getElementById("rhythmWake").value = state.profile.wake;
  document.getElementById("rhythmSleep").value = state.profile.sleep;
  updateRhythmNowDot();
}

function formatZenDeadline(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((dayStart - today) / 86400000);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return `Deadline: Tomorrow ${time}`;
  if (diffDays === 0) return `Deadline: Today ${time}`;
  return `Deadline: ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
}

function zenFocusScore(task) {
  const now = Date.now();
  const deadlineMs = task.deadline ? new Date(task.deadline).getTime() : Infinity;
  const minutes = Math.max(1, Number(task.duration) || 30);
  const priority = zoneWeight(task.zone) * 60;

  let deadlineBoost = 0;
  if (Number.isFinite(deadlineMs)) {
    const hoursToDeadline = (deadlineMs - now) / 3600000;
    if (hoursToDeadline <= 0) deadlineBoost = 170;
    else if (hoursToDeadline <= 24) deadlineBoost = 140;
    else if (hoursToDeadline <= 48) deadlineBoost = 95;
    else if (hoursToDeadline <= 120) deadlineBoost = 50;
    else deadlineBoost = 20;
  }

  // Prefer "next action" sized tasks that are easy to start now.
  const startability = Math.max(0, 40 - Math.abs(minutes - 45));
  const journalPenalty = task.title.toLowerCase().includes("journal") ? -18 : 0;
  return priority + deadlineBoost + startability + journalPenalty;
}

function zenFocusReason(task) {
  if (task.deadline) return formatZenDeadline(task.deadline);
  if (task.zone === "q1") return "Next best action • High impact now";
  if (task.zone === "q2") return "Next best action • Strategic progress";
  return task.note || `${task.duration} min focus block`;
}

function zenFocusMetaLine(task) {
  return zenFocusReason(task);
}

function renderZenFocus() {
  const focusItems = state.tasks
    .filter((task) => !task.done && matchesQuery(`${task.title} ${taskDescription(task)}`))
    .slice()
    .sort((left, right) => zenFocusScore(right) - zenFocusScore(left))
    .slice(0, 3);

  const meditationIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-1.8 2.6-5 4.5-5 8a5 5 0 0 0 10 0c0-3.5-3.2-5.4-5-8zm-5 14h10v2H7zm3-4h4v2h-4z"/></svg>`;

  zenFocusListEl.innerHTML = focusItems
    .map((task) => {
      const lower = task.title.toLowerCase();
      const isJournal = lower.includes("journal");
      const hasDeadline = Boolean(task.deadline);
      const icon =
        hasDeadline && !isJournal
          ? `<span class="zen-icon-wrap alert" aria-hidden="true">!</span>`
          : `<span class="zen-icon-wrap calm" aria-hidden="true">${meditationIcon}</span>`;
      const meta = zenFocusMetaLine(task);
      return `
        <article class="zen-item">
          <span class="zen-line ${hasDeadline && !isJournal ? "" : "green"}"></span>
          <div class="zen-row">
            ${icon}
            <div class="zen-copy">
              <h4 class="zen-title">${task.title}</h4>
              <p class="zen-meta">${meta}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMatrix() {
  document.querySelectorAll(".bubble-wrap").forEach((wrap) => {
    wrap.innerHTML = "";
  });

  state.tasks
    .filter((task) => !task.done)
    .sort((left, right) => {
      const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Infinity;
      const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Infinity;
      return leftDeadline - rightDeadline;
    })
    .forEach((task) => {
      const bubble = document.createElement("button");
      bubble.type = "button";
      bubble.className = "bubble";
      bubble.draggable = true;
      bubble.dataset.id = task.id;
      bubble.innerHTML = `<strong>${task.title}</strong><small>${task.duration} min | ${zoneLabel(task.zone)}</small>`;
      bubble.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", task.id);
      });
      const target = document.querySelector(`[data-drop="${task.zone}"]`);
      if (target) target.appendChild(bubble);
    });
}

function matrixMeta(task) {
  const durationLabel = `${Math.max(1, Math.round(Number(task.duration) || 0))} min`;
  if (task.title.toLowerCase().includes("research")) return `Due soon • Thesis Project • ${durationLabel}`;
  if (task.title.toLowerCase().includes("gym")) return `Before evening • Wellness • ${durationLabel}`;
  if (task.title.toLowerCase().includes("sql")) return `Personal Growth • ${durationLabel}`;
  if (task.title.toLowerCase().includes("journal")) return `Daily habit • ${durationLabel}`;
  return task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()} • ${durationLabel}` : durationLabel;
}

function renderMatrixPage() {
  syncTaskZonesWithRules();
  document.querySelectorAll("[data-page-drop]").forEach((wrap) => {
    wrap.innerHTML = "";
  });

  state.tasks
    .slice()
    .sort((left, right) => zoneWeight(right.zone) - zoneWeight(left.zone))
    .forEach((task) => {
      if (!matchesQuery(`${task.title} ${taskDescription(task)}`)) return;
      const card = document.createElement("article");
      const isDelegate = task.zone === "q3";
      const isEliminate = task.zone === "q4";
      card.className = `matrix-task-card${isDelegate ? " dashed" : ""}${isEliminate ? " eliminated" : ""}`;
      card.draggable = true;
      card.dataset.id = task.id;
      card.innerHTML = `
        <button class="matrix-task-check" type="button" data-matrix-check-task="${task.id}" aria-label="${
          task.done ? "Mark not done" : "Mark done"
        }"></button>
        <div class="matrix-task-main">
          <div class="matrix-task-head">
            <h4 class="matrix-task-title">${task.title}</h4>
            <details class="entry-more matrix-task-more">
              <summary class="entry-more-btn matrix-more-btn" aria-label="Task options">⋯</summary>
              <div class="entry-more-menu matrix-more-menu">
                <button type="button" data-matrix-edit-task="${task.id}">Edit task</button>
                <button type="button" data-matrix-delete-task="${task.id}">Remove</button>
              </div>
            </details>
          </div>
          <p class="matrix-task-meta">${task.note || matrixMeta(task)}</p>
        </div>
      `;
      card.addEventListener("dragstart", (event) => {
        if (event.target.closest(".matrix-task-check")) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData("text/plain", task.id);
      });

      const target = document.querySelector(`[data-page-drop="${task.zone}"]`);
      if (target) target.appendChild(card);
    });

  document.querySelectorAll("[data-matrix-edit-task]").forEach((button) => {
    button.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
      const task = state.tasks.find((item) => item.id === button.dataset.matrixEditTask);
      if (!task) return;
      openComposer("task", task);
      const details = button.closest("details");
      if (details) details.open = false;
    });
  });

  document.querySelectorAll("[data-matrix-check-task]").forEach((button) => {
    button.addEventListener("pointerdown", (eventDown) => {
      eventDown.preventDefault();
      eventDown.stopPropagation();
    });
    button.addEventListener("click", (eventClick) => {
      eventClick.preventDefault();
      eventClick.stopPropagation();
      const task = state.tasks.find((item) => item.id === button.dataset.matrixCheckTask);
      if (!task) return;
      task.done = true;
      task.doneAt = new Date().toISOString();
      markInteractionDay(new Date(task.doneAt));
      inferRhythmFromHistory();
      saveState();
      renderApp();
    });
  });

  document.querySelectorAll("[data-matrix-delete-task]").forEach((button) => {
    button.addEventListener("click", (eventClick) => {
      eventClick.stopPropagation();
      state.tasks = state.tasks.filter((task) => task.id !== button.dataset.matrixDeleteTask);
      saveState();
      renderApp();
      const details = button.closest("details");
      if (details) details.open = false;
    });
  });

  renderClarityPulse();
}

function renderClarityPulse() {
  const total = state.tasks.length || 1;
  const completedDo = state.tasks.filter((task) => task.zone === "q1" && task.done).length;
  const allDo = state.tasks.filter((task) => task.zone === "q1").length || 1;
  const clarity = Math.round(((completedDo + Math.max(total - allDo, 0)) / total) * 100);
  clarityValueEl.textContent = `${clarity}%`;
  clarityTextEl.textContent =
    clarity >= 60
      ? "You've cleared the most pressing matters in your Do zone. Your cognitive load is breathing naturally."
      : "Your Do zone still holds active pressure points. Move one item into action or scheduling to restore calm.";
}

function setView(view) {
  const journalView = view === "journal";
  const weeklyView = view === "weekly";
  const matrixView = view === "matrix";
  const goalsView = view === "goals";
  const collectionsView = view === "collections";
  dashboardViewEl.classList.toggle("hidden", journalView || weeklyView || matrixView || goalsView || collectionsView);
  journalViewEl.classList.toggle("hidden", !journalView);
  weeklyViewEl.classList.toggle("hidden", !weeklyView);
  matrixViewEl.classList.toggle("hidden", !matrixView);
  goalsViewEl.classList.toggle("hidden", !goalsView);
  if (collectionsViewEl) {
    collectionsViewEl.classList.toggle("hidden", !collectionsView);
  }
  topbarEl.classList.toggle("hidden", journalView || weeklyView || matrixView || goalsView || collectionsView);
  appShellEl.classList.toggle("matrix-mode", false);
  fabButtonEl.classList.toggle("hidden", journalView || weeklyView || matrixView || goalsView || collectionsView);
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document
    .querySelector('[data-nav="dashboard"]')
    .classList.toggle("active", !journalView && !weeklyView && !matrixView && !goalsView && !collectionsView);
  document.getElementById("journalBtn").classList.toggle("active", journalView);
  document.getElementById("weeklyBoardBtn").classList.toggle("active", weeklyView);
  document.getElementById("openMatrixBtn").classList.toggle("active", matrixView);
  document.getElementById("goalsBtn").classList.toggle("active", goalsView);
  const collectionsBtn = document.getElementById("collectionsBtn");
  if (collectionsBtn) {
    collectionsBtn.classList.toggle("active", collectionsView);
  }
}

function bindMatrixDnD() {
  document.querySelectorAll(".zone, .matrix-panel").forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.dataset.hover = "true";
    });

    zone.addEventListener("dragleave", () => {
      zone.dataset.hover = "false";
    });

    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.dataset.hover = "false";
      const taskId = event.dataTransfer.getData("text/plain");
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) return;
      task.zone = zone.dataset.zone;
      saveState();
      renderApp();
    });
  });
}

function sameCalendarDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatWeeklyEventTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = ((hours + 11) % 12) + 1;
  return `${hour12}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function weeklySuggestionTone(task) {
  return task.title.toLowerCase().includes("sql") ? "amber" : "";
}

function renderWeeklyBoardPage() {
  const weekDates = getWeekDates(weeklyWeekOffset);
  const selectedDate = getSelectedDate();
  const selectedIndexCandidate = weekDates.findIndex((date) => sameCalendarDay(date, selectedDate));
  const selectedIndex = selectedIndexCandidate >= 0 ? selectedIndexCandidate : 0;
  const today = new Date();
  const todayIndex = weekDates.findIndex((date) => sameCalendarDay(date, today));
  const monthLabelDate = weekDates[selectedIndex] || weekDates[0];

  weeklyMonthLabelEl.innerHTML = `${monthLabelDate.toLocaleDateString("en-US", { month: "long" })} <span>${monthLabelDate.getFullYear()}</span>`;

  weeklyDateStripEl.innerHTML = weekDates
    .map((date, index) => {
      const active = index === selectedIndex ? "active" : "";
      return `
        <button class="weekly-date-pill ${active}" type="button" data-weekly-pick="${index}">
          <span>${date.toLocaleDateString("en-US", { weekday: "short" })}</span>
          <strong>${date.getDate()}</strong>
        </button>
      `;
    })
    .join("");

  weeklyBoardGridEl.innerHTML = weekDates
    .map((date, index) => {
      const dayName = days[index];
      const fixedEntries = state.fixed.filter((event) => eventOccursOn(dayName, date, event));
      const suggestions = computeSuggestedSlots(dayName).slice(0, 1);
      const isToday = sameCalendarDay(date, today);
      const dimmed = todayIndex !== -1 && !isToday ? "dimmed" : "";
      const todayClass = isToday ? "today" : "";

      const fixedMarkup = fixedEntries
        .map((event) => {
          const amber = event.title.toLowerCase().includes("badminton") || event.title.toLowerCase().includes("data");
          return `
            <article class="weekly-item-fixed ${amber ? "amber" : ""}">
              <div class="weekly-label">Fixed</div>
              <div class="weekly-item-title">${event.title}</div>
              <div class="weekly-item-time">${event.allDay ? "All day" : formatWeeklyEventTime(event.start)}</div>
            </article>
          `;
        })
        .join("");

      const suggestionMarkup = suggestions
        .map(({ task }) => `
          <article class="weekly-suggestion ${weeklySuggestionTone(task)}">
            <div class="weekly-label">Smart Suggestion</div>
            <div class="weekly-item-title">${task.title}</div>
            <p>${task.note || "Based on your weekly goals"}</p>
          </article>
        `)
        .join("");

      let specialCard = "";
      if (!fixedEntries.length && !suggestions.length && dayName === "Tuesday") {
        specialCard = `
          <article class="weekly-empty-card">
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C9 6.8 5 9 5 13a7 7 0 0 0 14 0c0-4-4-6.2-7-11z"></path>
              </svg>
              <div class="weekly-empty-title">Deep Work Focus Day</div>
              <div class="weekly-empty-copy">No fixed meetings</div>
            </div>
          </article>
        `;
      }

      if (!fixedEntries.length && !suggestions.length && dayName === "Sunday") {
        specialCard = `
          <article class="weekly-reset-card">
            <div>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3 8 7h3v5h2V7h3zm-7 9h14v9H5z"></path>
              </svg>
              <div class="weekly-reset-title">Weekly Reset</div>
              <div class="weekly-reset-copy">Review goals and prepare for the upcoming week.</div>
            </div>
          </article>
        `;
      }

      return `
        <article class="weekly-day-card ${todayClass} ${dimmed}">
          ${isToday ? '<span class="weekly-day-tag">Today</span>' : ""}
          ${dayName === "Monday" ? '<span class="weekly-day-watermark">M</span>' : ""}
          <div class="weekly-day-title">${dayName}</div>
          <div class="weekly-day-date">${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</div>
          <div class="weekly-day-content">
            ${fixedMarkup}
            ${suggestionMarkup}
            ${specialCard}
          </div>
          <div class="weekly-card-actions">
            <button class="weekly-card-button ${isToday ? "primary" : ""}" type="button" data-weekly-reflect="${index}">Reflect</button>
            <button class="weekly-card-button icon" type="button" aria-label="Edit" data-weekly-edit="${dayName}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m4 16.5 9.8-9.8 3.5 3.5L7.5 20H4zm13.7-10.8 1.8-1.8a1.3 1.3 0 1 1 1.8 1.8l-1.8 1.8z"></path>
              </svg>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  weeklyDateStripEl.querySelectorAll("[data-weekly-pick]").forEach((button) => {
    button.addEventListener("click", () => {
      const pickedIndex = Number(button.dataset.weeklyPick);
      const targetDate = weekDates[pickedIndex];
      if (!targetDate) return;
      const base = new Date();
      base.setHours(12, 0, 0, 0);
      const normalizedTarget = new Date(targetDate);
      normalizedTarget.setHours(12, 0, 0, 0);
      state.timelineDay = Math.round((normalizedTarget - base) / 86400000);
      saveState();
      renderWeeklyBoardPage();
    });
  });

  weeklyBoardGridEl.querySelectorAll("[data-weekly-reflect]").forEach((button) => {
    button.addEventListener("click", () => {
      const reflectIndex = Number(button.dataset.weeklyReflect);
      const targetDate = weekDates[reflectIndex];
      if (!targetDate) return;
      const base = new Date();
      base.setHours(12, 0, 0, 0);
      const normalizedTarget = new Date(targetDate);
      normalizedTarget.setHours(12, 0, 0, 0);
      state.timelineDay = Math.round((normalizedTarget - base) / 86400000);
      saveState();
      setView("dashboard");
      renderApp();
    });
  });

  weeklyBoardGridEl.querySelectorAll("[data-weekly-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const dayName = button.dataset.weeklyEdit;
      openComposer("fixed");
      const pickedIndex = days.indexOf(dayName);
      const targetDate = weekDates[pickedIndex] || getSelectedDate();
      document.getElementById("fixedStartDate").value = toDateInputValue(targetDate);
      document.getElementById("fixedEndDate").value = toDateInputValue(targetDate);
      document.getElementById("fixedTitle").focus();
    });
  });
}

function renderJournalPage() {
  const today = new Date();
  const month = today.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  journalDateLabelEl.textContent = `TODAY IS ${month} ${today.getDate()}`;
  journalMorningInputEl.value = state.journal.morning;
  journalGratitudeEls.forEach((input, index) => {
    input.value = state.journal.gratitude[index] || "";
  });
  journalNotesInputEl.value = state.journal.notes;
  journalArchiveTextEl.textContent = state.journal.archived ? "Saved to Archive" : "Draft in Progress";
  reflectionAnswerOneEl.value = state.journal.reflectionAnswers?.[0] || "";
  reflectionAnswerTwoEl.value = state.journal.reflectionAnswers?.[1] || "";
  renderReflectionsPage();
  setJournalMode(state.journal.mode || "daily");
}

function setJournalNavActive(key) {
  Object.entries(journalNavButtons).forEach(([name, button]) => {
    if (!button) return;
    button.classList.toggle("active", name === key);
  });
}

function setJournalMode(mode) {
  const nextMode = mode === "reflections" ? "reflections" : "daily";
  state.journal.mode = nextMode;
  journalDailyPaneEl.classList.toggle("hidden", nextMode !== "daily");
  journalReflectionsPaneEl.classList.toggle("hidden", nextMode !== "reflections");
  setJournalNavActive(nextMode === "reflections" ? "reflections" : "journal");
}

function scrollJournalSection(targetId, activeKey = "journal") {
  setJournalMode("daily");
  setJournalNavActive(activeKey);
  requestAnimationFrame(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function journalReflectionInsights() {
  const completedTasks = state.tasks.filter((task) => task.done);
  const q2Tasks = state.tasks.filter((task) => task.zone === "q2");
  const morningTasks = state.tasks.filter((task) => {
    const start = task.scheduled?.start ? toMinutes(task.scheduled.start) : null;
    return start !== null && start < 9 * 60;
  });
  const gratitudeCount = state.journal.gratitude.filter(Boolean).length;
  const notesLength = state.journal.notes.trim().length;
  const filter = state.journal.reflectionsFilter || "all";
  const allInsights = [
    {
      icon: "focus",
      title: "The power of morning silence.",
      copy:
        morningTasks.length >= 2
          ? `Found that ${morningTasks.length} early sessions created your calmest momentum before noon.`
          : "Found that starting the day with 10 minutes of screen-free observation reduces anxiety by noon.",
      date: "May 12, 2024",
      tag: "#habit"
    },
    {
      icon: "leaf",
      title: q2Tasks.length >= 2 ? "Rhythm over speed." : "Progress follows gentler loops.",
      copy:
        q2Tasks.length >= 2
          ? "Sustainable progress isn't about how fast you go, but the consistency of the beat you keep."
          : "Slower planning windows are still building a durable cadence across the week.",
      date: "May 08, 2024",
      tag: "#growth"
    },
    {
      icon: "balance",
      title: gratitudeCount >= 2 ? "Accepting the wabi-sabi." : "Let imperfections stay visible.",
      copy:
        gratitudeCount >= 2
          ? "The cracks in your schedule are where the most unexpected and beautiful moments happen."
          : "Your softer entries suggest the unplanned edges of the week are carrying useful meaning.",
      date: "May 03, 2024",
      tag: "#philosophy"
    },
    {
      icon: "focus",
      title: "Attention grows where it is noticed.",
      copy:
        notesLength > 80
          ? "Your notes show more precision on the days you pause to narrate what mattered."
          : "A few quiet lines are enough to make the day feel witnessed.",
      date: "Apr 29, 2024",
      tag: "#journal"
    },
    {
      icon: "leaf",
      title: "Rest is part of the system.",
      copy:
        completedTasks.length >= 2
          ? `You completed ${completedTasks.length} meaningful blocks without filling every gap.`
          : "Leaving unclaimed space has protected your steadiness more than squeezing in extra tasks.",
      date: "Apr 24, 2024",
      tag: "#balance"
    }
  ];

  if (filter === "focus") return allInsights.filter((item) => item.tag === "#habit" || item.tag === "#growth");
  if (filter === "archive") return allInsights.slice().reverse();
  return allInsights;
}

function reflectionPrimaryFocus() {
  const morningTasks = state.tasks.filter((task) => {
    const start = task.scheduled?.start ? toMinutes(task.scheduled.start) : null;
    return start !== null && start < 9 * 60;
  }).length;
  const q2Count = state.tasks.filter((task) => task.zone === "q2").length;
  const notesLength = state.journal.notes.trim().length;
  const options = [];

  if (notesLength > 120) {
    options.push({
      title: "Narrative Clarity",
      quote: "\"Your reflections deepen when you let the page hold nuance without rushing to resolve it.\"",
      id: "51"
    });
  }

  if (morningTasks >= 2 || q2Count >= 2) {
    options.push({
      title: "Creative Stillness",
      quote: "\"You are most present when the mind is allowed to simply observe without judgment.\"",
      id: "42"
    });
  }

  options.push({
    title: "Gentle Structure",
    quote: "\"A softer rhythm can still carry strong intent when the next step is clear enough.\"",
    id: "47"
  });

  return options[state.journal.reflectionVariant % options.length];
}

function renderReflectionsPage() {
  const weeklyScores = [0.46, 0.68, 0.36, 0.82, 0.58, 0.5, 0.74, 0.9];
  const totalDone = state.tasks.filter((task) => task.done).length;
  const morningCount = state.tasks.filter((task) => {
    const start = task.scheduled?.start ? toMinutes(task.scheduled.start) : null;
    return start !== null && start < 9 * 60;
  }).length;
  const adjustedScores = weeklyScores.map((base, index) => {
    const lift = Math.min(0.12, totalDone * 0.02 + (index % 2 === 0 ? morningCount * 0.01 : 0));
    return Math.min(0.96, base + lift);
  });
  const labels = ["Week 1", "", "", "Week 2", "", "Week 3", "", "Week 4"];

  reflectionsBarsEl.innerHTML = adjustedScores
    .map((value, index) => {
      const dim = value < 0.58 ? "dim" : "";
      return `
        <div class="reflections-bar-wrap">
          <div class="reflections-bar ${dim}" style="height:${Math.round(value * 122)}px"></div>
          <span class="reflections-bar-label">${labels[index] || ""}</span>
        </div>
      `;
    })
    .join("");

  const focus = reflectionPrimaryFocus();
  reflectionsPrimaryFocusEl.textContent = focus.title;
  reflectionsQuoteEl.textContent = focus.quote;
  reflectionsInsightIdEl.textContent = focus.id;

  const insights = journalReflectionInsights();
  const visibleInsights = state.journal.showAllInsights ? insights : insights.slice(0, 3);
  reflectionsInsightsGridEl.innerHTML = visibleInsights.map((insight) => {
    const iconPath =
      insight.icon === "leaf"
        ? '<path d="M12 3C8.5 3.9 6 6.6 6 10.1c0 4 2.9 6.9 7 7.9 3.2-.9 5-3.2 5-6.3C18 7.5 15.7 4.8 12 3zm-1 4.3c.2 2.5-.9 4.7-3.1 6.6"></path>'
        : insight.icon === "balance"
          ? '<path d="M6 7h12M12 7v10M7.5 7 5 12h5zm11.5 0L16.5 12h5zM8 20h8"></path>'
          : '<path d="M12 3a6 6 0 0 0-6 6c0 2.2 1.2 4.2 3 5.2V18h6v-3.8c1.8-1 3-3 3-5.2a6 6 0 0 0-6-6zm-1 18h2"></path>';

    return `
      <article class="reflections-insight-card">
        <span class="reflections-insight-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">${iconPath}</svg>
        </span>
        <h4 class="reflections-insight-title">${insight.title}</h4>
        <p class="reflections-insight-copy">${insight.copy}</p>
        <div class="reflections-insight-meta">
          <span>${insight.date}</span>
          <strong>${insight.tag}</strong>
        </div>
      </article>
    `;
  }).join("");

  reflectionsFilterBtnEl.title = `Filter: ${state.journal.reflectionsFilter || "all"}`;
  reflectionsViewAllBtnEl.textContent = state.journal.showAllInsights ? "Show Fewer Insights" : "View All Insights";
  completeReflectionBtnEl.textContent = state.journal.reflectionsCompletedAt ? "Reflection Completed" : "Complete Reflection";
}

function activeGoalData() {
  const activeGoal = state.tasks.find((task) => task.title.toLowerCase().includes("sql")) || state.tasks[0];
  const doneCount = state.tasks.filter((task) => task.title.toLowerCase().includes("sql") && task.done).length;
  const total = 3;
  const progress = Math.min(100, Math.round((doneCount / total) * 100) || 66);
  return { activeGoal, progress };
}

function goalsInsightData() {
  const normalizedTasks = state.tasks.map((task) => {
    const title = task.title.trim();
    const lower = title.toLowerCase();
    const scheduledStart = task.scheduled?.start ? toMinutes(task.scheduled.start) : null;
    const isMorning = scheduledStart !== null && scheduledStart < 9 * 60;
    const completionBias = task.done ? 18 : 0;
    const zoneBias = task.zone === "q2" ? 10 : task.zone === "q1" ? 8 : 4;
    const morningBias = isMorning ? 16 : 0;
    const titleBias = lower.includes("sql") ? 14 : lower.includes("journal") ? 10 : lower.includes("gym") ? 9 : 6;

    return {
      title,
      lower,
      isMorning,
      score: 50 + completionBias + zoneBias + morningBias + titleBias
    };
  });

  const completedSql = state.tasks.filter((task) => task.title.toLowerCase().includes("sql") && task.done).length;
  const topTask = normalizedTasks.sort((left, right) => right.score - left.score)[0];
  const completedCount = state.tasks.filter((task) => task.done).length;
  const completionRate = Math.max(72, Math.min(97, (topTask?.score || 80)));
  const growth = Math.max(8, Math.min(24, 8 + completedCount * 2 + (topTask?.isMorning ? 2 : 0)));
  const strengthDone = Math.min(3, 1 + Number(state.tasks.some((task) => task.title.toLowerCase().includes("gym") && task.done)) + Number(state.fixed.some((event) => event.title.toLowerCase().includes("badminton"))));
  const mobilityDone = Math.min(1, 1);
  const performerTitle = topTask?.title || "Morning SQL Focus";
  const performerLine = topTask?.isMorning ? `before ${topTask.title.toLowerCase().includes("sql") ? "9 AM" : "10 AM"}` : "this week";
  const habitLead =
    completedCount >= 2
      ? "Your rhythm has stabilized over the last 14 days. Morning sessions are your peak performance window."
      : "Your habit rhythm is still forming. Consistent low-friction sessions will sharpen your peak window.";

  return {
    leadText: habitLead,
    topTitle: performerTitle,
    topText: `${completionRate}% completion rate ${performerLine}`,
    growthText: `+${growth}% from last week`,
    strengthDone,
    strengthTotal: 3,
    mobilityDone,
    mobilityTotal: 1,
    dotPattern: [
      1,
      1,
      completedSql > 0 ? 0.65 : 0.45,
      1,
      1,
      completedSql > 1 ? 0.95 : 0,
      0,
      1,
      1,
      completedSql > 0 ? 0.65 : 0.45,
      1,
      1,
      completedSql > 1 ? 1 : 0.45,
      0
    ]
  };
}

function renderGoalsPage() {
  const { activeGoal, progress } = activeGoalData();
  const insight = goalsInsightData();
  goalSpotlightTitleEl.textContent = "SQL Self-Study";
  goalSpotlightMetaEl.textContent = "3 sessions per week • Database Mastery";
  goalProgressValueEl.textContent = `${progress}%`;
  document.querySelector(".habit-copy p").textContent = insight.leadText;

  const weekData = [
    { day: "Mon", done: true },
    { day: "Wed", done: true },
    { day: "Fri", done: false }
  ];

  goalWeekMiniEl.innerHTML = weekData
    .map(
      (item) => `
        <article class="goal-mini-card">
          <span>${item.day}</span>
          <span class="goal-mini-mark ${item.done ? "" : "pending"}">${item.done ? "✓" : ""}</span>
        </article>
      `
    )
    .join("");

  habitDotsEl.innerHTML = insight.dotPattern
    .map(
      (value) =>
        `<span class="habit-dot ${value >= 0.9 ? "active" : value >= 0.5 ? "mid" : ""} ${value >= 0.9 ? "pulse" : ""}" style="opacity:${Math.max(0.32, value)}"></span>`
    )
    .join("");

  topPerformerTitleEl.textContent = insight.topTitle;
  topPerformerTextEl.textContent = insight.topText;
  habitGrowthTextEl.textContent = insight.growthText;
  strengthMetricEl.textContent = `${insight.strengthDone}/${insight.strengthTotal} done`;
  mobilityMetricEl.textContent = `${insight.mobilityDone}/${insight.mobilityTotal} done`;
  strengthBarEl.style.width = `${Math.round((insight.strengthDone / insight.strengthTotal) * 100)}%`;
  mobilityBarEl.style.width = `${Math.round((insight.mobilityDone / insight.mobilityTotal) * 100)}%`;
  engineStripTextEl.textContent = "Kanso Smart Engine: Optimizing your schedule for Friday morning.";
  goalsPageEl.classList.remove("ai-scheduling");

  if (goalScheduleBtnEl) {
    goalScheduleBtnEl.dataset.taskTitle = activeGoal?.title || "SQL Advanced Queries";
    goalScheduleBtnEl.dataset.taskDuration = String(activeGoal?.duration || 90);
  }
}

function runGoalsAiPlanner(mode) {
  if (goalsAiTimeout) {
    clearTimeout(goalsAiTimeout);
    goalsAiTimeout = null;
  }

  goalsPageEl.classList.add("ai-scheduling");
  engineStripTextEl.textContent =
    mode === "sql"
      ? "Kanso Smart Engine: scanning your rhythm for the calmest SQL focus block..."
      : "Kanso Smart Engine: finding a fluid window for movement recovery and strength...";

  goalsAiTimeout = setTimeout(() => {
    snapFlexibleTasks();

    const scheduledTask = state.tasks.find((task) => task.title.toLowerCase().includes(mode === "sql" ? "sql" : "gym"));
    if (scheduledTask?.scheduled) {
      scheduledTask.note =
        mode === "sql"
          ? `AI placed SQL focus into a quiet block at ${scheduledTask.scheduled.start}.`
          : `AI placed gym recovery into an open slot at ${scheduledTask.scheduled.start}.`;
    }

    const sqlTask = state.tasks.find((task) => task.title.toLowerCase().includes("sql"));
    if (mode === "sql" && sqlTask) {
      sqlTask.done = true;
      sqlTask.doneAt = new Date().toISOString();
      markInteractionDay(new Date(sqlTask.doneAt));
    }

    inferRhythmFromHistory();
    saveState();
    renderApp();
    goalsPageEl.classList.add("ai-scheduling");
    engineStripTextEl.textContent =
      mode === "sql"
        ? "Kanso Smart Engine: Morning SQL focus reserved and momentum lifted."
        : "Kanso Smart Engine: Gym journey balanced into your week with a softer recovery cadence.";
  }, 700);
}

function openComposer(mode, event = null) {
  composerMode = mode;
  editingTaskId = null;
  updateComposerMode();

  if (mode === "fixed" && event) {
    state.editingFixedId = event.id;
    document.getElementById("fixedTitle").value = event.title;
    document.getElementById("fixedLocation").value = event.location || "";
    document.getElementById("fixedLink").value = event.link || "";
    document.getElementById("fixedStartDate").value = event.startDate || toDateInputValue(getSelectedDate());
    document.getElementById("fixedEndDate").value = event.endDate || event.startDate || toDateInputValue(getSelectedDate());
    document.getElementById("fixedStart").value = event.start;
    document.getElementById("fixedEnd").value = event.end;
    document.getElementById("fixedAllDay").checked = Boolean(event.allDay);
    document.getElementById("fixedRecurring").checked = Boolean(event.recurring);
    document.getElementById("fixedRepeatUntil").value = event.repeatUntil || "";
    const repeatChecks = document.querySelectorAll("#fixedRepeatDays input[type='checkbox']");
    const repeatDays = Array.isArray(event.repeatDays) ? event.repeatDays : [];
    repeatChecks.forEach((el) => {
      el.checked = repeatDays.includes(el.value);
    });
    document.getElementById("fixedRecurringFields").hidden = !event.recurring;
    document.getElementById("fixedStart").disabled = Boolean(event.allDay);
    document.getElementById("fixedEnd").disabled = Boolean(event.allDay);
  } else if (mode === "fixed") {
    resetFixedForm();
  }

  if (mode === "task") {
    if (event && event.id && event.title) {
      editingTaskId = event.id;
      document.getElementById("quickTaskName").value = event.title;
      document.getElementById("quickTaskDuration").value = event.duration != null ? event.duration : 0;
      document.getElementById("quickTaskDeadline").value = event.deadline ? event.deadline.slice(0, 16) : "";
      document.getElementById("quickTaskImportant").checked = Boolean(event.important);
      document.getElementById("quickTaskUrgent").checked = Boolean(event.urgent);
    } else {
      document.getElementById("quickTaskForm").reset();
      document.getElementById("quickTaskDuration").value = 0;
      document.getElementById("quickTaskImportant").checked = true;
    }
  }

  composerDialogEl.showModal();
}

function closeComposer() {
  editingTaskId = null;
  resetFixedForm();
  composerDialogEl.close();
}

function updateComposerMode() {
  const taskModeBtn = document.getElementById("taskModeBtn");
  const fixedModeBtn = document.getElementById("fixedModeBtn");
  const taskForm = document.getElementById("quickTaskForm");
  const fixedForm = document.getElementById("fixedForm");
  const title = document.getElementById("composerTitle");
  if (!taskForm || !fixedForm) return;

  const taskActive = composerMode === "task";
  taskModeBtn.classList.toggle("active", taskActive);
  fixedModeBtn.classList.toggle("active", !taskActive);
  /* Use native hidden attribute so visibility does not depend on .hidden class alone */
  if (taskActive) {
    taskForm.removeAttribute("hidden");
    fixedForm.setAttribute("hidden", "");
  } else {
    taskForm.setAttribute("hidden", "");
    fixedForm.removeAttribute("hidden");
  }
  taskForm.setAttribute("aria-hidden", taskActive ? "false" : "true");
  fixedForm.setAttribute("aria-hidden", taskActive ? "true" : "false");
  if (taskActive) {
    title.textContent = editingTaskId ? "Edit task" : "Add to the scroll";
  } else {
    title.textContent = "Shape a fixed appointment";
  }
}

function resetFixedForm() {
  state.editingFixedId = null;
  document.getElementById("fixedForm").reset();
  const today = toDateInputValue(getSelectedDate());
  document.getElementById("fixedStartDate").value = today;
  document.getElementById("fixedEndDate").value = today;
  document.getElementById("fixedStart").value = "09:00";
  document.getElementById("fixedEnd").value = "10:00";
  document.getElementById("fixedStart").disabled = false;
  document.getElementById("fixedEnd").disabled = false;
  document.getElementById("fixedRecurringFields").hidden = true;
  document.querySelectorAll("#fixedRepeatDays input[type='checkbox']").forEach((el) => {
    el.checked = false;
  });
}

function snapFlexibleTasks() {
  const day = getSelectedDay();
  const wake = toMinutes(state.profile.wake);
  const sleep = toMinutes(state.profile.sleep);

  state.tasks
    .filter((task) => !task.done)
    .slice()
    .sort((left, right) => {
      const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Infinity;
      const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Infinity;
      if (zoneWeight(right.zone) !== zoneWeight(left.zone)) return zoneWeight(right.zone) - zoneWeight(left.zone);
      return leftDeadline - rightDeadline;
    })
    .forEach((task) => {
      if (task.scheduled?.day === day) return;

      for (let start = wake; start + task.duration <= sleep; start += 30) {
        const end = start + task.duration;
        if (eventConflicts(day, start, end, task.id)) continue;
        task.scheduled = { day, start: toTime(start), end: toTime(end) };
        break;
      }
    });

  saveState();
  renderApp();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderNotifications() {
  const pop = document.getElementById("notificationPopover");
  if (!pop) return;
  const rows = [];
  state.tasks
    .filter((t) => !t.done && t.deadline)
    .forEach((t) => {
      rows.push({ title: t.title, meta: formatZenDeadline(t.deadline) });
    });
  state.fixed.slice(0, 4).forEach((e) => {
    rows.push({ title: e.title, meta: `${e.day} · ${e.start}` });
  });
  if (!rows.length) {
    pop.innerHTML = `<div class="notification-empty">You are all caught up.</div>`;
    return;
  }
  pop.innerHTML = rows
    .slice(0, 8)
    .map(
      (row) =>
        `<div class="notification-item"><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.meta)}</span></div>`
    )
    .join("");
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
  localStorage.setItem(themeStorageKey, theme);
  const moon = document.getElementById("themeIconMoon");
  const sun = document.getElementById("themeIconSun");
  if (moon && sun) {
    moon.classList.toggle("hidden", theme === "dark");
    sun.classList.toggle("hidden", theme !== "dark");
  }
}

function loadTheme() {
  applyTheme(localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light");
}

const pomodoroStorageKey = "kanso_pomodoro_v1";
const pomodoroState = {
  workMin: 25,
  breakMin: 5,
  phase: "idle",
  remainingSec: 25 * 60,
  timerId: null,
  running: false,
  cycles: 0
};

function loadPomodoroSettings() {
  try {
    const raw = localStorage.getItem(pomodoroStorageKey);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (typeof p.workMin === "number" && p.workMin >= 5 && p.workMin <= 90) pomodoroState.workMin = p.workMin;
    if (typeof p.breakMin === "number" && p.breakMin >= 1 && p.breakMin <= 30) pomodoroState.breakMin = p.breakMin;
    if (typeof p.cycles === "number" && p.cycles >= 0) pomodoroState.cycles = p.cycles;
    pomodoroState.remainingSec = pomodoroState.workMin * 60;
  } catch {
    pomodoroState.remainingSec = pomodoroState.workMin * 60;
  }
}

function savePomodoroSettings() {
  localStorage.setItem(
    pomodoroStorageKey,
    JSON.stringify({
      workMin: pomodoroState.workMin,
      breakMin: pomodoroState.breakMin,
      cycles: pomodoroState.cycles
    })
  );
}

function pomodoroTotalSecForPhase() {
  if (pomodoroState.phase === "break") return Math.max(1, pomodoroState.breakMin) * 60;
  return Math.max(1, pomodoroState.workMin) * 60;
}

function pomodoroFormatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function pomodoroClearTimer() {
  if (pomodoroState.timerId) {
    clearInterval(pomodoroState.timerId);
    pomodoroState.timerId = null;
  }
}

function pomodoroRingProgress() {
  const total = pomodoroTotalSecForPhase();
  if (total <= 0) return 0;
  return 1 - pomodoroState.remainingSec / total;
}

function pomodoroUpdateButtons() {
  const elStart = document.getElementById("pomodoroStartBtn");
  const elPause = document.getElementById("pomodoroPauseBtn");
  const elReset = document.getElementById("pomodoroResetBtn");
  const elSkip = document.getElementById("pomodoroSkipBtn");
  if (!elStart || !elPause) return;
  if (pomodoroState.phase === "idle") {
    elStart.textContent = "Start";
    elStart.disabled = false;
    elPause.disabled = true;
  } else if (pomodoroState.running) {
    elStart.disabled = true;
    elPause.disabled = false;
    elPause.textContent = "Pause";
  } else {
    elStart.textContent = "Resume";
    elStart.disabled = false;
    elPause.disabled = true;
  }
  if (elReset) elReset.disabled = pomodoroState.phase === "idle";
  if (elSkip) elSkip.disabled = pomodoroState.phase === "idle";
}

function pomodoroRender() {
  const elTime = document.getElementById("pomodoroTimeDisplay");
  const elPhase = document.getElementById("pomodoroPhaseLabel");
  const elArc = document.getElementById("pomodoroRingArc");
  const elCard = document.querySelector(".pomodoro-card");
  const elOpen = document.getElementById("pomodoroOpenBtn");
  const elBadge = document.getElementById("pomodoroTopBadge");
  const elCycles = document.getElementById("pomodoroCyclesCount");
  const elWorkR = document.getElementById("pomodoroWorkRange");
  const elBreakR = document.getElementById("pomodoroBreakRange");
  const elWorkVal = document.getElementById("pomodoroWorkVal");
  const elBreakVal = document.getElementById("pomodoroBreakVal");

  if (!elTime || !elArc) return;

  if (elWorkR) {
    elWorkR.value = String(pomodoroState.workMin);
    elBreakR.value = String(pomodoroState.breakMin);
  }
  if (elWorkVal) elWorkVal.textContent = String(pomodoroState.workMin);
  if (elBreakVal) elBreakVal.textContent = String(pomodoroState.breakMin);
  if (elCycles) elCycles.textContent = String(pomodoroState.cycles);

  elTime.textContent = pomodoroFormatTime(pomodoroState.remainingSec);

  if (elPhase) {
    if (pomodoroState.phase === "idle") {
      elPhase.textContent = "Ready";
    } else if (pomodoroState.phase === "work") {
      elPhase.textContent = pomodoroState.running ? "Focus" : "Paused";
    } else {
      elPhase.textContent = pomodoroState.running ? "Break" : "Paused";
    }
  }

  const p = Math.min(1, Math.max(0, pomodoroRingProgress()));
  elArc.style.strokeDashoffset = String(100 * (1 - p));
  elCard?.classList.toggle("phase-break", pomodoroState.phase === "break");
  elOpen?.classList.toggle("phase-break", pomodoroState.phase === "break");

  const locked = pomodoroState.running;
  elCard?.classList.toggle("sliders-locked", locked);

  if (elBadge) {
    if (pomodoroState.phase === "idle") {
      elBadge.classList.add("hidden");
      elBadge.textContent = "";
    } else {
      elBadge.textContent = pomodoroFormatTime(pomodoroState.remainingSec);
      elBadge.classList.remove("hidden");
    }
  }

  elOpen?.classList.toggle("is-running", pomodoroState.running);

  pomodoroUpdateButtons();
}

function pomodoroFlashComplete() {
  const elOpen = document.getElementById("pomodoroOpenBtn");
  elOpen?.classList.add("pomodoro-flash");
  setTimeout(() => elOpen?.classList.remove("pomodoro-flash"), 600);
}

function pomodoroTick() {
  if (!pomodoroState.running) return;
  pomodoroState.remainingSec -= 1;
  if (pomodoroState.remainingSec > 0) {
    pomodoroRender();
    return;
  }
  if (pomodoroState.phase === "work") {
    pomodoroState.cycles += 1;
    savePomodoroSettings();
    pomodoroState.phase = "break";
    pomodoroState.remainingSec = pomodoroState.breakMin * 60;
  } else {
    pomodoroState.phase = "work";
    pomodoroState.remainingSec = pomodoroState.workMin * 60;
  }
  pomodoroRender();
  pomodoroFlashComplete();
}

function pomodoroStartResume() {
  if (pomodoroState.running) return;
  if (pomodoroState.phase === "idle") {
    pomodoroState.phase = "work";
    pomodoroState.remainingSec = pomodoroState.workMin * 60;
  }
  pomodoroState.running = true;
  pomodoroClearTimer();
  pomodoroState.timerId = setInterval(pomodoroTick, 1000);
  pomodoroRender();
}

function pomodoroPause() {
  if (!pomodoroState.running) return;
  pomodoroState.running = false;
  pomodoroClearTimer();
  pomodoroRender();
}

function pomodoroReset() {
  pomodoroClearTimer();
  pomodoroState.running = false;
  pomodoroState.phase = "idle";
  pomodoroState.remainingSec = pomodoroState.workMin * 60;
  pomodoroRender();
}

function pomodoroSkip() {
  if (pomodoroState.phase === "idle") return;
  pomodoroClearTimer();
  pomodoroState.running = false;
  if (pomodoroState.phase === "work") {
    pomodoroState.phase = "break";
    pomodoroState.remainingSec = pomodoroState.breakMin * 60;
  } else {
    pomodoroState.phase = "work";
    pomodoroState.remainingSec = pomodoroState.workMin * 60;
  }
  pomodoroRender();
}

function pomodoroApplyPreset(work, br) {
  pomodoroState.workMin = work;
  pomodoroState.breakMin = br;
  savePomodoroSettings();
  if (pomodoroState.phase === "idle" || (pomodoroState.phase === "work" && !pomodoroState.running)) {
    pomodoroState.remainingSec = pomodoroState.workMin * 60;
  }
  if (pomodoroState.phase === "break" && !pomodoroState.running) {
    pomodoroState.remainingSec = pomodoroState.breakMin * 60;
  }
  pomodoroRender();
}

function bindPomodoroEvents() {
  const dialog = document.getElementById("pomodoroDialog");
  const openBtn = document.getElementById("pomodoroOpenBtn");
  const closeBtn = document.getElementById("pomodoroCloseBtn");
  if (!dialog || !openBtn) return;

  openBtn.addEventListener("click", () => {
    pomodoroRender();
    dialog.showModal();
  });
  closeBtn?.addEventListener("click", () => dialog.close());

  document.getElementById("pomodoroStartBtn")?.addEventListener("click", () => {
    if (pomodoroState.running) return;
    pomodoroStartResume();
  });
  document.getElementById("pomodoroPauseBtn")?.addEventListener("click", () => pomodoroPause());
  document.getElementById("pomodoroResetBtn")?.addEventListener("click", () => pomodoroReset());
  document.getElementById("pomodoroSkipBtn")?.addEventListener("click", () => pomodoroSkip());

  document.getElementById("pomodoroWorkRange")?.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    pomodoroState.workMin = v;
    savePomodoroSettings();
    if (pomodoroState.phase === "idle") {
      pomodoroState.remainingSec = v * 60;
    } else if (pomodoroState.phase === "work" && !pomodoroState.running) {
      pomodoroState.remainingSec = v * 60;
    }
    pomodoroRender();
  });
  document.getElementById("pomodoroBreakRange")?.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    pomodoroState.breakMin = v;
    savePomodoroSettings();
    if (pomodoroState.phase === "break" && !pomodoroState.running) {
      pomodoroState.remainingSec = v * 60;
    }
    pomodoroRender();
  });

  document.querySelectorAll(".pomodoro-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const w = Number(btn.dataset.work);
      const b = Number(btn.dataset.break);
      if (w && b) pomodoroApplyPreset(w, b);
    });
  });
}

function initPomodoro() {
  loadPomodoroSettings();
  bindPomodoroEvents();
  pomodoroRender();
}

function bindEvents() {
  const fixedStartDateInput = document.getElementById("fixedStartDate");
  const fixedEndDateInput = document.getElementById("fixedEndDate");
  const fixedStartInput = document.getElementById("fixedStart");
  const fixedEndInput = document.getElementById("fixedEnd");
  const fixedAllDayInput = document.getElementById("fixedAllDay");
  const fixedRecurringInput = document.getElementById("fixedRecurring");
  const fixedRecurringFields = document.getElementById("fixedRecurringFields");
  const syncFixedComposerToggles = () => {
    fixedRecurringFields.hidden = !fixedRecurringInput.checked;
    const allDay = fixedAllDayInput.checked;
    fixedStartInput.disabled = allDay;
    fixedEndInput.disabled = allDay;
  };
  syncFixedComposerToggles();

  fixedStartDateInput.addEventListener("change", () => {
    if (!fixedEndDateInput.value || fixedEndDateInput.value < fixedStartDateInput.value) {
      fixedEndDateInput.value = fixedStartDateInput.value;
    }
    if (!fixedRecurringInput.checked) return;
    const startDay = dayFromDateString(fixedStartDateInput.value);
    if (!startDay) return;
    document.querySelectorAll("#fixedRepeatDays input[type='checkbox']").forEach((el) => {
      el.checked = el.value === startDay;
    });
  });

  fixedAllDayInput.addEventListener("change", () => {
    syncFixedComposerToggles();
  });

  fixedRecurringInput.addEventListener("change", () => {
    syncFixedComposerToggles();
    if (!fixedRecurringInput.checked) return;
    const startDay = dayFromDateString(fixedStartDateInput.value);
    if (!startDay) return;
    document.querySelectorAll("#fixedRepeatDays input[type='checkbox']").forEach((el) => {
      el.checked = el.value === startDay;
    });
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderLivingScroll();
    renderZenFocus();
    renderMatrix();
    renderMatrixPage();
  });

  document.getElementById("prevDay").addEventListener("click", () => {
    state.timelineDay = (Number(state.timelineDay) || 0) - 1;
    saveState();
    renderApp();
  });

  document.getElementById("nextDay").addEventListener("click", () => {
    state.timelineDay = (Number(state.timelineDay) || 0) + 1;
    saveState();
    renderApp();
  });

  document.getElementById("smartSchedulerBtn").addEventListener("click", snapFlexibleTasks);
  document.getElementById("fabButton").addEventListener("click", () => openComposer("task"));
  document.querySelector('[data-nav="dashboard"]').addEventListener("click", () => {
    setView("dashboard");
  });
  document.getElementById("journalBtn").addEventListener("click", () => {
    setView("journal");
    setJournalMode("daily");
    renderJournalPage();
  });
  document.getElementById("openMatrixBtn").addEventListener("click", () => {
    setView("matrix");
    renderMatrixPage();
  });
  const matrixBackBtn = document.getElementById("matrixBackBtn");
  if (matrixBackBtn) {
    matrixBackBtn.addEventListener("click", () => setView("dashboard"));
  }
  document.getElementById("matrixNewEntryBtn").addEventListener("click", () => openComposer("task"));
  document.getElementById("dailyRhythmCard").addEventListener("click", () => rhythmDialogEl.showModal());
  document.getElementById("cancelRhythmBtn").addEventListener("click", () => rhythmDialogEl.close());

  document.getElementById("taskModeBtn").addEventListener("click", () => {
    composerMode = "task";
    updateComposerMode();
  });

  document.getElementById("fixedModeBtn").addEventListener("click", () => {
    composerMode = "fixed";
    editingTaskId = null;
    updateComposerMode();
  });

  document.getElementById("closeComposerBtn").addEventListener("click", closeComposer);

  document.getElementById("quickTaskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const titleValue = document.getElementById("quickTaskName").value.trim();
    if (!titleValue) return;

    const durationRaw = document.getElementById("quickTaskDuration").value;
    const duration = Number(durationRaw);
    if (!Number.isFinite(duration) || duration <= 0) {
      window.alert("Please enter duration in minutes (1 means 1 minute).");
      return;
    }

    const payload = {
      title: titleValue,
      duration: Math.round(duration),
      deadline: document.getElementById("quickTaskDeadline").value,
      important: document.getElementById("quickTaskImportant").checked,
      urgent: document.getElementById("quickTaskUrgent").checked
    };

    if (editingTaskId) {
      const existing = state.tasks.find((item) => item.id === editingTaskId);
      if (!existing) return;
      Object.assign(existing, payload);
      existing.zone = suggestQuadrant(existing);
      saveState();
      closeComposer();
      renderApp();
      return;
    }

    const task = {
      id: crypto.randomUUID(),
      ...payload,
      zone: "q2",
      done: false,
      scheduled: null,
      doneAt: null,
      note: ""
    };
    task.zone = suggestQuadrant(task);
    state.tasks.push(task);
    saveState();
    closeComposer();
    renderApp();
  });

  document.getElementById("fixedForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const startDate = document.getElementById("fixedStartDate").value;
    const endDate = document.getElementById("fixedEndDate").value;
    const allDay = document.getElementById("fixedAllDay").checked;
    const recurring = document.getElementById("fixedRecurring").checked;
    const repeatDays = Array.from(document.querySelectorAll("#fixedRepeatDays input[type='checkbox']:checked")).map((el) => el.value);
    const startTime = allDay ? "00:00" : document.getElementById("fixedStart").value;
    const endTime = allDay ? "23:59" : document.getElementById("fixedEnd").value;
    const primaryDay = dayFromDateString(startDate) || getSelectedDay();
    const payload = {
      id: state.editingFixedId || crypto.randomUUID(),
      title: document.getElementById("fixedTitle").value.trim(),
      day: primaryDay,
      startDate,
      endDate,
      start: startTime,
      end: endTime,
      allDay,
      recurring,
      repeatDays: recurring ? (repeatDays.length ? repeatDays : [primaryDay]) : [],
      repeatUntil: recurring ? document.getElementById("fixedRepeatUntil").value : "",
      location: document.getElementById("fixedLocation").value.trim(),
      link: document.getElementById("fixedLink").value.trim(),
      createdAt: state.editingFixedId
        ? (state.fixed.find((item) => item.id === state.editingFixedId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
      type: "fixed"
    };

    if (!payload.title) return;
    if (!payload.startDate || !payload.endDate) {
      window.alert("Please choose start and end dates.");
      return;
    }
    if (payload.endDate < payload.startDate) {
      window.alert("End date must be the same day or later than start date.");
      return;
    }
    if (!allDay && payload.startDate === payload.endDate && toMinutes(payload.end) <= toMinutes(payload.start)) {
      window.alert("End time must be after start time.");
      return;
    }
    if (payload.repeatUntil && payload.repeatUntil < payload.startDate) {
      window.alert("Repeat until date must be after start date.");
      return;
    }
    const startMins = toMinutes(payload.start);
    const endMins = toMinutes(payload.end);
    const conflictDays = payload.recurring ? payload.repeatDays : [payload.day];
    const hasConflict = conflictDays.some((dayName) => eventConflicts(dayName, startMins, endMins, payload.id, payload.startDate));
    if (hasConflict) {
      window.alert("This event overlaps with an existing event or scheduled task.");
      return;
    }

    if (state.editingFixedId) {
      state.fixed = state.fixed.map((item) => (item.id === state.editingFixedId ? payload : item));
    } else {
      state.fixed.push(payload);
    }

    markInteractionDay(new Date());
    resetFixedForm();
    saveState();
    closeComposer();
    renderApp();
  });

  document.getElementById("rhythmForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile.wake = document.getElementById("rhythmWake").value;
    state.profile.sleep = document.getElementById("rhythmSleep").value;
    state.profile.learned = true;
    saveState();
    rhythmDialogEl.close();
    renderApp();
  });

  document.getElementById("weeklyBoardBtn").addEventListener("click", () => {
    setView("weekly");
    renderWeeklyBoardPage();
  });
  const weeklyBackBtn = document.getElementById("weeklyBackBtn");
  if (weeklyBackBtn) {
    weeklyBackBtn.addEventListener("click", () => setView("dashboard"));
  }
  document.getElementById("weeklyDashboardBtn").addEventListener("click", () => setView("dashboard"));
  document.getElementById("weeklyGoalsBtn").addEventListener("click", () => {
    setView("goals");
    renderGoalsPage();
  });
  document.getElementById("weeklyMatrixBtn").addEventListener("click", () => {
    setView("matrix");
    renderMatrixPage();
  });
  document.getElementById("weeklyFabBtn").addEventListener("click", () => openComposer("task"));
  document.getElementById("weeklyProfileBtn").addEventListener("click", () => rhythmDialogEl.showModal());
  document.getElementById("weeklyPrevBtn").addEventListener("click", () => {
    weeklyWeekOffset -= 1;
    renderWeeklyBoardPage();
  });
  document.getElementById("weeklyNextBtn").addEventListener("click", () => {
    weeklyWeekOffset += 1;
    renderWeeklyBoardPage();
  });

  document.getElementById("goalsBtn").addEventListener("click", () => {
    setView("goals");
    renderGoalsPage();
  });

  document.getElementById("goalsBackBtn").addEventListener("click", () => setView("dashboard"));
  document.getElementById("goalsNewEntryBtn").addEventListener("click", () => openComposer("task"));
  if (goalScheduleBtnEl) {
    goalScheduleBtnEl.addEventListener("click", () => runGoalsAiPlanner("sql"));
  }
  if (journeyScheduleBtnEl) {
    journeyScheduleBtnEl.addEventListener("click", () => runGoalsAiPlanner("gym"));
  }

  document.getElementById("settingsBtn").addEventListener("click", () => rhythmDialogEl.showModal());
  document.getElementById("supportBtn").addEventListener("click", () => {
    setView("matrix");
    renderMatrixPage();
  });

  const notificationPopoverEl = document.getElementById("notificationPopover");
  const notifyToggleBtnEl = document.getElementById("notifyToggleBtn");
  if (notifyToggleBtnEl && notificationPopoverEl) {
    notifyToggleBtnEl.addEventListener("click", (event) => {
      event.stopPropagation();
      renderNotifications();
      const willShow = notificationPopoverEl.classList.contains("hidden");
      if (willShow) {
        notificationPopoverEl.classList.remove("hidden");
        notifyToggleBtnEl.setAttribute("aria-expanded", "true");
      } else {
        notificationPopoverEl.classList.add("hidden");
        notifyToggleBtnEl.setAttribute("aria-expanded", "false");
      }
    });
    notificationPopoverEl.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("click", () => {
      notificationPopoverEl.classList.add("hidden");
      notifyToggleBtnEl.setAttribute("aria-expanded", "false");
    });
  }

  document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  const profileDialogEl = document.getElementById("profileDialog");
  document.getElementById("profileOpenBtn")?.addEventListener("click", () => profileDialogEl?.showModal());
  document.getElementById("closeProfileBtn")?.addEventListener("click", () => profileDialogEl?.close());
  document.getElementById("profileRhythmBtn")?.addEventListener("click", () => {
    profileDialogEl?.close();
    rhythmDialogEl.showModal();
  });
  document.getElementById("profileDashboardBtn")?.addEventListener("click", () => profileDialogEl?.close());

  document.getElementById("journalNewEntryBtn").addEventListener("click", () => {
    state.journal = { ...structuredClone(defaultState.journal), archived: false };
    saveState();
    renderJournalPage();
    if ((state.journal.mode || "daily") === "reflections") {
      reflectionAnswerOneEl.focus();
    } else {
      journalMorningInputEl.focus();
    }
  });
  document.getElementById("journalArchiveBtn").addEventListener("click", () => {
    state.journal.archived = !state.journal.archived;
    state.journal.archivedAt = state.journal.archived ? new Date().toISOString() : "";
    saveState();
    renderJournalPage();
  });
  document.getElementById("journalSettingsBtn").addEventListener("click", () => rhythmDialogEl.showModal());
  document.getElementById("journalHelpBtn").addEventListener("click", () => window.alert("Use Journal to capture intentions, gratitude, and mindful notes. Everything autosaves."));
  document.getElementById("journalNavMain").addEventListener("click", () => {
    scrollJournalSection("journalIntentionsSection", "journal");
  });
  document.getElementById("journalNavIntentions").addEventListener("click", () => {
    scrollJournalSection("journalIntentionsSection", "intentions");
  });
  document.getElementById("journalNavArchive").addEventListener("click", () => {
    scrollJournalSection("journalNotesSection", "archive");
  });
  document.getElementById("journalNavReflections").addEventListener("click", () => {
    setJournalMode("reflections");
    renderReflectionsPage();
    saveState();
  });
  document.querySelectorAll("[data-journal-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.journalTarget;
      const activeKey = targetId === "journalIntentionsSection" ? "intentions" : targetId === "journalNotesSection" ? "archive" : "journal";
      scrollJournalSection(targetId, activeKey);
    });
  });
  journalMorningInputEl.addEventListener("input", () => {
    state.journal.morning = journalMorningInputEl.value;
    state.journal.archived = false;
    saveState();
    journalArchiveTextEl.textContent = "Draft in Progress";
  });
  journalGratitudeEls.forEach((input, index) => {
    input.addEventListener("input", () => {
      state.journal.gratitude[index] = input.value;
      state.journal.archived = false;
      saveState();
      journalArchiveTextEl.textContent = "Draft in Progress";
    });
  });
  journalNotesInputEl.addEventListener("input", () => {
    state.journal.notes = journalNotesInputEl.value;
    state.journal.archived = false;
    saveState();
    journalArchiveTextEl.textContent = "Draft in Progress";
  });
  reflectionAnswerOneEl.addEventListener("input", () => {
    state.journal.reflectionAnswers[0] = reflectionAnswerOneEl.value;
    state.journal.archived = false;
    saveState();
  });
  reflectionAnswerTwoEl.addEventListener("input", () => {
    state.journal.reflectionAnswers[1] = reflectionAnswerTwoEl.value;
    state.journal.archived = false;
    saveState();
  });
  journalReflectionsBackBtnEl.addEventListener("click", () => {
    setJournalMode("daily");
    saveState();
  });
  reflectionsFilterBtnEl.addEventListener("click", () => {
    const next = {
      all: "focus",
      focus: "archive",
      archive: "all"
    }[state.journal.reflectionsFilter || "all"];
    state.journal.reflectionsFilter = next;
    state.journal.showAllInsights = false;
    saveState();
    renderReflectionsPage();
  });
  reflectionsMoreBtnEl.addEventListener("click", () => {
    state.journal.reflectionVariant = (state.journal.reflectionVariant || 0) + 1;
    saveState();
    renderReflectionsPage();
  });
  reflectionsViewAllBtnEl.addEventListener("click", () => {
    state.journal.showAllInsights = !state.journal.showAllInsights;
    saveState();
    renderReflectionsPage();
  });
  completeReflectionBtnEl.addEventListener("click", () => {
    state.journal.reflectionsCompletedAt = new Date().toISOString();
    state.journal.archived = true;
    state.journal.archivedAt = state.journal.reflectionsCompletedAt;
    saveState();
    renderJournalPage();
  });

  bindMatrixDnD();
  bindCollectionsEvents();
}

function renderApp() {
  renderScrollHeader();
  renderLivingScroll();
  renderJournalPage();
  renderWeeklyRhythm();
  renderWeeklyBoardPage();
  renderDailyRhythm();
  renderZenFocus();
  renderMatrix();
  renderMatrixPage();
  renderGoalsPage();
  renderCollectionsPage();
}

const COLLECTION_FOCUS_STAGES = [
  { plant: "Evergreen Sprout", stage: "Stage 1: The First Breath", tipNext: "Complete two 25-minute sessions today to unlock stage 2." },
  { plant: "Young Pine", stage: "Stage 2: Roots Hold Quiet", tipNext: "Keep one uninterrupted focus block tomorrow to deepen the roots." },
  { plant: "River Birch", stage: "Stage 3: Reach Toward Light", tipNext: "Pair a walk with review—movement helps the canopy open." },
  { plant: "Silver Maple", stage: "Stage 4: Shelter Takes Shape", tipNext: "Clear one distraction from your desk before the next session." },
  { plant: "Coastal Cedar", stage: "Stage 5: Steady in the Wind", tipNext: "Finish a medium task before noon to feed the trunk." },
  { plant: "Ancient Oak", stage: "Stage 6: Rings of Intention", tipNext: "Reflect for five minutes on what mattered this week." },
  { plant: "Komorebi Canopy", stage: "Stage 7: Full Light Through Leaves", tipNext: "You have reached full growth for this cycle—maintain with gentle care." }
];

function renderCollectionsPage() {
  if (!collectionsViewEl) return;

  const filter = state.collections?.filter === "completed" || state.collections?.filter === "locked" || state.collections?.filter === "all"
    ? state.collections.filter
    : "all";

  const treesPlanted = Object.keys(state.interactionDays || {}).length;
  const badgeEl = document.getElementById("collectionsTreesBadge");
  if (badgeEl) {
    badgeEl.textContent = `${treesPlanted} Trees Planted`;
  }

  const stage = getWeeklyTreeStage();
  const focus = COLLECTION_FOCUS_STAGES[Math.min(Math.max(stage, 1), 7) - 1];
  const growthPct = Math.min(100, Math.round((stage / 7) * 100));

  const plantNameEl = document.getElementById("collectionsPlantName");
  const stageLineEl = document.getElementById("collectionsStageLine");
  const growthPctEl = document.getElementById("collectionsGrowthPct");
  const tipEl = document.getElementById("collectionsGrowthTip");
  if (plantNameEl) plantNameEl.textContent = focus.plant;
  if (stageLineEl) stageLineEl.textContent = focus.stage;
  if (growthPctEl) growthPctEl.textContent = `${growthPct}%`;
  if (tipEl) {
    if (stage === 1) {
      tipEl.textContent =
        "Plants grow best with consistent silence. Complete two 25-minute sessions today to unlock stage 2.";
    } else if (stage < 7) {
      tipEl.textContent = `Plants grow best with consistent silence. ${focus.tipNext}`;
    } else {
      tipEl.textContent =
        "Plants grow best with consistent silence. Return next week to begin a new growth cycle.";
    }
  }

  const rankSubEl = document.getElementById("collectionsRankSubtitle");
  const rankSessionsEl = document.getElementById("collectionsRankSessions");
  const rankTitles = ["Novice Caretaker", "Steady Gardener", "Arboretum Guide", "Master Cultivator"];
  const rankIdx = Math.min(rankTitles.length - 1, Math.floor(stage / 2));
  if (rankSubEl) rankSubEl.textContent = rankTitles[rankIdx];
  const sessionsLeft = Math.max(0, 3 - (getWeeklyInteractionDayCount() % 4));
  if (rankSessionsEl) rankSessionsEl.textContent = String(sessionsLeft).padStart(2, "0");

  const weekEl = document.getElementById("collectionsWeekTrack");
  if (weekEl) {
    const parts = [];
    for (let i = 0; i < 7; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const num = i + 1;
      const sub = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
      const isToday = i === 0;
      parts.push(`
        <div class="collections-week-node${isToday ? " is-today" : ""}">
          <div class="collections-week-circle">
            <div>${num}</div>
            <span>${sub}</span>
          </div>
        </div>
      `);
    }
    weekEl.innerHTML = parts.join("");
  }

  document.querySelectorAll("[data-collections-filter]").forEach((btn) => {
    const f = btn.getAttribute("data-collections-filter");
    btn.classList.toggle("is-active", f === filter);
  });

  const gallery = document.getElementById("collectionsGallery");
  document.querySelectorAll(".collections-plant-card[data-collection-status]").forEach((card) => {
    const status = card.getAttribute("data-collection-status");
    let show = false;
    if (filter === "all") show = true;
    else if (filter === "completed") show = status === "completed";
    else if (filter === "locked") show = status === "locked";
    if (show) {
      card.removeAttribute("data-hidden");
    } else {
      card.setAttribute("data-hidden", "");
    }
  });

  if (gallery) {
    const visible = gallery.querySelectorAll(".collections-plant-card[data-collection-status]:not([data-hidden])");
    gallery.classList.toggle("is-empty", visible.length === 0);
    let emptyEl = gallery.querySelector(".collections-empty-msg");
    if (visible.length === 0) {
      if (!emptyEl) {
        emptyEl = document.createElement("p");
        emptyEl.className = "collections-empty-msg";
        emptyEl.textContent = "No plants match this filter.";
        gallery.appendChild(emptyEl);
      }
    } else if (emptyEl) {
      emptyEl.remove();
    }
  }
}

function bindCollectionsEvents() {
  const back = document.getElementById("collectionsBackBtn");
  if (back) {
    back.addEventListener("click", () => {
      setView("dashboard");
      renderApp();
    });
  }
  const btn = document.getElementById("collectionsBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      setView("collections");
      renderCollectionsPage();
    });
  }
  document.querySelectorAll("[data-collections-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.getAttribute("data-collections-filter");
      if (!f) return;
      state.collections = { ...state.collections, filter: f };
      saveState();
      renderCollectionsPage();
    });
  });
}

function init() {
  // Always open dashboard on "today" after a refresh.
  state.timelineDay = 0;

  loadTheme();
  initPomodoro();
  bindEvents();
  updateComposerMode();
  setView("dashboard");
  renderApp();
  setInterval(updateRhythmNowDot, 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") updateRhythmNowDot();
  });

  initWeeklyTreeCard();
}

init();

function initWeeklyTreeCard() {
  const container = document.getElementById("weeklyTreeCard");
  const treeStage = getWeeklyTreeStage();
  if (container) container.dataset.treeStage = String(treeStage);
  // #region agent log: weekly tree init entry (T1)
  fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1ecfd5"
    },
    body: JSON.stringify({
      sessionId: "1ecfd5",
      runId: "tree-pre",
      hypothesisId: "T1",
      location: "app.js:initWeeklyTreeCard",
      message: "initWeeklyTreeCard called",
      data: {
        hasContainer: Boolean(container),
        hasTHREE: typeof window.THREE !== "undefined"
      },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.background = null;

  const width = container.clientWidth || container.offsetWidth || 320;
  const height = container.clientHeight || container.offsetHeight || 220;

  // #region agent log: weekly tree container size (T2)
  fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1ecfd5"
    },
    body: JSON.stringify({
      sessionId: "1ecfd5",
      runId: "tree-pre",
      hypothesisId: "T2",
      location: "app.js:initWeeklyTreeCard",
      message: "weeklyTreeCard size",
      data: { width, height },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 0.5, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // #region agent log: weekly tree renderer created (T3)
  fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1ecfd5"
    },
    body: JSON.stringify({
      sessionId: "1ecfd5",
      runId: "tree-pre",
      hypothesisId: "T3",
      location: "app.js:initWeeklyTreeCard",
      message: "renderer appended to container",
      data: {},
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minDistance = camera.position.z;
  controls.maxDistance = camera.position.z;
  controls.target.set(0, 0, 0);
  controls.update();

  // #region agent log: orbit controls initialized (T6)
  fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "1ecfd5"
    },
    body: JSON.stringify({
      sessionId: "1ecfd5",
      runId: "tree-orbit-pre",
      hypothesisId: "T6",
      location: "app.js:initWeeklyTreeCard",
      message: "orbit controls enabled",
      data: {
        enableZoom: controls.enableZoom,
        enablePan: controls.enablePan,
        dampingFactor: controls.dampingFactor
      },
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion agent log

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(4, 5, 4);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const hemiLight = new THREE.HemisphereLight(0xcfe5ff, 0x6f8450, 0.5);
  scene.add(hemiLight);

  const rimLight = new THREE.DirectionalLight(0xb5d3ff, 0.68);
  rimLight.position.set(-3, 2.2, -3.2);
  scene.add(rimLight);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 48),
    new THREE.MeshStandardMaterial({ color: 0xd4ddc3, roughness: 0.95, metalness: 0 })
  );
  ground.receiveShadow = true;
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.05;
  scene.add(ground);
  const groundMat = ground.material;

  const fireflyCount = 26;
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  for (let i = 0; i < fireflyCount; i += 1) {
    const base = i * 3;
    fireflyPositions[base] = (Math.random() - 0.5) * 2.6;
    fireflyPositions[base + 1] = Math.random() * 1.7 + 0.1;
    fireflyPositions[base + 2] = (Math.random() - 0.5) * 2.3;
  }
  const fireflyGeometry = new THREE.BufferGeometry();
  fireflyGeometry.setAttribute("position", new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflyMaterial = new THREE.PointsMaterial({
    color: 0xb5d3ff,
    size: 0.05,
    transparent: true,
    opacity: 0.88,
    depthWrite: false
  });
  const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
  fireflies.visible = false;
  scene.add(fireflies);

  const group = new THREE.Group();
  scene.add(group);
  const treeMaterials = [];

  const isDarkTheme = () => document.documentElement.getAttribute("data-theme") === "dark";
  let nightMode = isDarkTheme();
  const applyNightMode = () => {
    nightMode = isDarkTheme();
    container.classList.toggle("night", nightMode);
    ambient.intensity = nightMode ? 0.5 : 0.92;
    ambient.color.set(nightMode ? 0x9ab2d0 : 0xffffff);
    dirLight.intensity = nightMode ? 0.82 : 1.28;
    dirLight.color.set(nightMode ? 0x9ec2ff : 0xffffff);
    hemiLight.intensity = nightMode ? 0.42 : 0.55;
    hemiLight.color.set(nightMode ? 0x9ebeff : 0xd9ecff);
    hemiLight.groundColor.set(nightMode ? 0x314224 : 0x7b9157);
    rimLight.intensity = nightMode ? 0.94 : 0.56;
    rimLight.color.set(nightMode ? 0x9ac8ff : 0xbdd8ff);
    groundMat.color.set(nightMode ? 0x2f3841 : 0xd4ddc3);
    fireflies.visible = nightMode;
    fireflyMaterial.opacity = nightMode ? 0.92 : 0;
    renderer.toneMappingExposure = nightMode ? 1.18 : 1.08;
    treeMaterials.forEach((mat) => {
      mat.roughness = nightMode ? 0.8 : 0.72;
      mat.emissive.set(nightMode ? 0x4f6138 : 0x1f2a12);
      mat.emissiveIntensity = nightMode ? 0.16 : 0.045;
    });
  };
  applyNightMode();

  // Simple fallback "tree" so we can see something even if GLB fails
  const fallbackTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 1.1, 16),
    new THREE.MeshStandardMaterial({ color: 0x87654a, roughness: 0.9 })
  );
  fallbackTrunk.position.set(0, -0.45, 0);
  fallbackTrunk.castShadow = true;
  fallbackTrunk.receiveShadow = true;
  group.add(fallbackTrunk);

  const fallbackCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.75, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x90a96b, roughness: 0.85 })
  );
  fallbackCrown.position.set(0, 0.3, 0);
  fallbackCrown.castShadow = true;
  fallbackCrown.receiveShadow = true;
  group.add(fallbackCrown);

  const loader = new THREE.GLTFLoader();
  loader.load(
    "./assets/models/maple-stage7.glb",
    (gltf) => {
      const tree = gltf.scene;
      tree.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          if (obj.material && obj.material.isMeshStandardMaterial) {
            const mat = obj.material.clone();
            mat.roughness = 0.9;
            mat.metalness = 0;
            treeMaterials.push(mat);
            obj.material = mat;
          }
        }
      });

      const rawBox = new THREE.Box3().setFromObject(tree);
      const rawSize = new THREE.Vector3();
      const rawCenter = new THREE.Vector3();
      rawBox.getSize(rawSize);
      rawBox.getCenter(rawCenter);

      // Recenter model so any GLB pivot/origin still appears in the middle of the card.
      tree.position.sub(rawCenter);

      // Fit tree inside view regardless of original model size.
      const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z, 0.001);
      const targetWorldSpan = 2.4;
      const fitScale = targetWorldSpan / maxDim;
      tree.scale.setScalar(fitScale);

      // Keep the tree base slightly above the ground plane.
      const fitBox = new THREE.Box3().setFromObject(tree);
      const fitSize = new THREE.Vector3();
      const fitCenter = new THREE.Vector3();
      fitBox.getSize(fitSize);
      fitBox.getCenter(fitCenter);
      const verticalLiftFactor = 0.2; // lower tree placement to avoid over-lifting
      tree.position.y += -fitCenter.y + fitSize.y * verticalLiftFactor;

      // Auto-expand card height for very tall/wide models.
      const dynamicHeight = Math.round(Math.max(220, Math.min(360, 220 + (maxDim - 2.4) * 120)));
      container.style.height = `${dynamicHeight}px`;
      const resizedW = container.clientWidth || container.offsetWidth || width;
      const resizedH = container.clientHeight || container.offsetHeight || height;
      camera.aspect = resizedW / resizedH;
      camera.updateProjectionMatrix();
      renderer.setSize(resizedW, resizedH);

      group.remove(fallbackTrunk, fallbackCrown);
      group.add(tree);

      const bbox = new THREE.Box3().setFromObject(tree);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      bbox.getSize(size);
      bbox.getCenter(center);

      // #region agent log: weekly tree bbox + camera snapshot (T5)
      fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "1ecfd5"
        },
        body: JSON.stringify({
          sessionId: "1ecfd5",
          runId: "tree-fit-pre",
          hypothesisId: "T5",
          location: "app.js:initWeeklyTreeCard",
          message: "Tree bbox after transform",
          data: {
            rawSize: { x: rawSize.x, y: rawSize.y, z: rawSize.z },
            rawCenter: { x: rawCenter.x, y: rawCenter.y, z: rawCenter.z },
            fitScale,
            verticalLiftFactor,
            dynamicHeight,
            size: { x: size.x, y: size.y, z: size.z },
            center: { x: center.x, y: center.y, z: center.z },
            camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z, fov: camera.fov },
            container: { width: resizedW, height: resizedH }
          },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log

      applyNightMode();

      // #region agent log: weekly tree glb loaded (T4)
      fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "1ecfd5"
        },
        body: JSON.stringify({
          sessionId: "1ecfd5",
          runId: "tree-pre",
          hypothesisId: "T4",
          location: "app.js:initWeeklyTreeCard",
          message: "GLB loaded successfully",
          data: {},
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log
    },
    undefined,
    (error) => {
      // If the GLB fails to load we keep fallback tree; optionally log to console.
      console.error("Failed to load maple-stage7.glb", error);

      // #region agent log: weekly tree glb load error (T4)
      fetch("http://127.0.0.1:7932/ingest/513b8fed-2dae-4264-941a-4717aa8d33cf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "1ecfd5"
        },
        body: JSON.stringify({
          sessionId: "1ecfd5",
          runId: "tree-pre",
          hypothesisId: "T4",
          location: "app.js:initWeeklyTreeCard",
          message: "GLB load failed",
          data: { message: String(error && error.message ? error.message : error) },
          timestamp: Date.now()
        })
      }).catch(() => {});
      // #endregion agent log
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    if (fireflies.visible) {
      const t = performance.now() * 0.001;
      fireflies.rotation.y += 0.0018;
      fireflyMaterial.opacity = 0.7 + Math.sin(t * 1.8) * 0.18;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", () => {
    const w = container.clientWidth || container.offsetWidth || width;
    const h = container.clientHeight || container.offsetHeight || height;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  const themeObserver = new MutationObserver(() => applyNightMode());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
}
