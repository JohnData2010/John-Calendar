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
  editingFixedId: null
};

let state = structuredClone(defaultState);
let composerMode = "task";
let searchQuery = "";
let goalsAiTimeout = null;
let weeklyWeekOffset = 0;

const scrollDateTextEl = document.getElementById("scrollDateText");
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
  return days[state.timelineDay];
}

function getSelectedDate() {
  const today = new Date();
  const jsDay = today.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(12, 0, 0, 0);
  const selected = new Date(monday);
  selected.setDate(monday.getDate() + state.timelineDay);
  return selected;
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

function getDateLabel() {
  const selected = getSelectedDate();
  const descriptor = weekdayDescriptors[state.timelineDay] || "Balanced focus";
  return `${selected.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  })} - ${descriptor}`;
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
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : structuredClone(defaultState.tasks)
    };
  } catch {
    state = structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(state));
}

function eventConflicts(day, start, end, ignoreId = null) {
  const fixedConflict = state.fixed.some((event) => {
    if (event.id === ignoreId || event.day !== day) return false;
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

function fixedMeta(event) {
  if (event.title.toLowerCase().includes("supervisor")) {
    return {
      badge: "Fixed Appointment",
      people: ["DR", "SV"],
      detail: "Science Block, Room 402"
    };
  }

  return {
    badge: "Fixed Appointment",
    people: ["KC"],
    detail: `${event.day} commitment`
  };
}

function taskDescription(task) {
  if (task.note) return task.note;
  if (task.deadline) return `Deadline ${new Date(task.deadline).toLocaleString()}`;
  return `${zoneLabel(task.zone)} session`;
}

function renderScrollHeader() {
  scrollDateTextEl.textContent = getDateLabel();
}

function getCurrentDayEntries() {
  const day = getSelectedDay();

  const scheduled = [
    ...state.fixed
      .filter((event) => event.day === day)
      .map((event) => ({
        kind: "fixed",
        sortKey: toMinutes(event.start),
        timeLabel: event.start,
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
  const wake = toMinutes(state.profile.wake);
  const sleep = toMinutes(state.profile.sleep);
  const occupied = [
    ...state.fixed
      .filter((event) => event.day === day)
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

function renderLivingScroll() {
  const entries = getCurrentDayEntries();

  if (!entries.length) {
    livingScrollEl.innerHTML = `
      <article class="entry-card fluid-card">
        <div class="entry-meta">
          <span class="entry-badge">Open Space</span>
        </div>
        <h3 class="entry-title">A clear scroll for today</h3>
        <p class="entry-copy">Add a task with the plus button or use Smart Scheduler to start shaping the day.</p>
      </article>
    `;
    return;
  }

  livingScrollEl.innerHTML = entries
    .map((entry, index) => {
      if (entry.kind === "fixed") {
        const meta = fixedMeta(entry.data);
        return `
          <article class="scroll-entry">
            <span class="entry-marker commitment ${index === 0 ? "" : "fixed"}"></span>
            <div class="entry-time">${entry.timeLabel}</div>
            <div class="entry-card fixed-card">
              <div class="entry-meta">
                <span class="entry-badge fixed-badge">${meta.badge}</span>
                <div class="entry-actions">
                  <button class="entry-action" type="button" data-edit-fixed="${entry.data.id}">...</button>
                </div>
              </div>
              <h3 class="entry-title">${entry.data.title}</h3>
              <div class="entry-support">
                <div class="people-row">
                  ${createPersonStack(meta.people)}
                  <span class="person-label">${meta.detail}</span>
                </div>
              </div>
            </div>
          </article>
        `;
      }

      if (entry.kind === "scheduled-task") {
        return `
          <article class="scroll-entry">
            <span class="entry-marker"></span>
            <div class="entry-time">${entry.timeLabel}</div>
            <div class="entry-card ${entry.data.done ? "done-card" : ""}">
              <div class="entry-meta">
                <span class="entry-badge">${zoneBadge(entry.data.zone)}</span>
                <div class="entry-actions">
                  <button class="entry-action ${entry.data.done ? "" : "done"}" type="button" data-toggle-task="${entry.data.id}">
                    ${entry.data.done ? "Undo" : "Done"}
                  </button>
                </div>
              </div>
              <h3 class="entry-title">${entry.data.title}</h3>
              <p class="entry-copy">${taskDescription(entry.data)}</p>
            </div>
          </article>
        `;
      }

      const suggestionLabel = `${toTime(entry.suggestion.start)} - ${toTime(entry.suggestion.end)}`;
      return `
        <article class="scroll-entry">
          <span class="entry-marker flex"></span>
          <div class="entry-type">${entry.typeLabel}</div>
          <div class="entry-card fluid-card">
            <div class="entry-meta">
              <span class="entry-badge study-badge">${zoneBadge(entry.data.zone)}</span>
              <span class="entry-duration">${entry.data.duration} min</span>
            </div>
            <h3 class="entry-title">${entry.data.title}</h3>
            <p class="entry-copy">${entry.data.note || `Suggested slot: ${suggestionLabel}`}</p>
            <div class="entry-actions">
              <button class="entry-action" type="button" data-schedule-task="${entry.data.id}" data-start="${toTime(
                entry.suggestion.start
              )}" data-end="${toTime(entry.suggestion.end)}">Snap</button>
              <button class="entry-action" type="button" data-delete-task="${entry.data.id}">Remove</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  bindScrollActions();
}

function bindScrollActions() {
  document.querySelectorAll("[data-edit-fixed]").forEach((button) => {
    button.addEventListener("click", () => {
      const event = state.fixed.find((item) => item.id === button.dataset.editFixed);
      if (!event) return;
      openComposer("fixed", event);
    });
  });

  document.querySelectorAll("[data-toggle-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const task = state.tasks.find((item) => item.id === button.dataset.toggleTask);
      if (!task) return;
      task.done = !task.done;
      task.doneAt = task.done ? new Date().toISOString() : null;
      inferRhythmFromHistory();
      saveState();
      renderApp();
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
    button.addEventListener("click", () => {
      state.tasks = state.tasks.filter((task) => task.id !== button.dataset.deleteTask);
      saveState();
      renderApp();
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
}

function renderDailyRhythm() {
  wakeMetricEl.textContent = state.profile.wake;
  sleepMetricEl.textContent = state.profile.sleep;
  document.getElementById("rhythmWake").value = state.profile.wake;
  document.getElementById("rhythmSleep").value = state.profile.sleep;
}

function renderZenFocus() {
  const focusItems = state.tasks
    .filter((task) => !task.done && matchesQuery(`${task.title} ${taskDescription(task)}`))
    .slice()
    .sort((left, right) => {
      const leftDeadline = left.deadline ? new Date(left.deadline).getTime() : Infinity;
      const rightDeadline = right.deadline ? new Date(right.deadline).getTime() : Infinity;
      if (zoneWeight(right.zone) !== zoneWeight(left.zone)) return zoneWeight(right.zone) - zoneWeight(left.zone);
      return leftDeadline - rightDeadline;
    })
    .slice(0, 2);

  zenFocusListEl.innerHTML = focusItems
    .map((task, index) => {
      const meta = task.deadline
        ? `Deadline: ${new Date(task.deadline).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric" })}`
        : task.note || `${task.duration} min focus block`;
      return `
        <article class="zen-item">
          <span class="zen-line ${index === 1 ? "green" : ""}"></span>
          <div class="zen-copy">
            <h4 class="zen-title">${task.title}</h4>
            <p class="zen-meta">${meta}</p>
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
  if (task.title.toLowerCase().includes("research")) return "Due soon • Thesis Project";
  if (task.title.toLowerCase().includes("gym")) return "Before evening • Wellness";
  if (task.title.toLowerCase().includes("sql")) return "Personal Growth • 90 mins";
  if (task.title.toLowerCase().includes("journal")) return "Daily habit • 10 min";
  return task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()}` : `${task.duration} mins`;
}

function renderMatrixPage() {
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
        <span class="matrix-task-check"></span>
        <div>
          <h4 class="matrix-task-title">${task.title}</h4>
          <p class="matrix-task-meta">${task.note || matrixMeta(task)}</p>
        </div>
      `;
      card.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", task.id);
      });

      const target = document.querySelector(`[data-page-drop="${task.zone}"]`);
      if (target) target.appendChild(card);
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
  dashboardViewEl.classList.toggle("hidden", journalView || weeklyView || matrixView || goalsView);
  journalViewEl.classList.toggle("hidden", !journalView);
  weeklyViewEl.classList.toggle("hidden", !weeklyView);
  matrixViewEl.classList.toggle("hidden", !matrixView);
  goalsViewEl.classList.toggle("hidden", !goalsView);
  topbarEl.classList.toggle("hidden", journalView || weeklyView || matrixView || goalsView);
  appShellEl.classList.toggle("matrix-mode", journalView || goalsView);
  fabButtonEl.classList.toggle("hidden", journalView || weeklyView || matrixView || goalsView);
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  document.querySelector('[data-nav="dashboard"]').classList.toggle("active", !journalView && !weeklyView && !matrixView && !goalsView);
  document.getElementById("journalBtn").classList.toggle("active", journalView);
  document.getElementById("weeklyBoardBtn").classList.toggle("active", weeklyView);
  document.getElementById("openMatrixBtn").classList.toggle("active", matrixView);
  document.getElementById("goalsBtn").classList.toggle("active", goalsView);
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
  const selectedIndex = Math.max(0, Math.min(6, state.timelineDay));
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
      const fixedEntries = state.fixed.filter((event) => event.day === dayName);
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
              <div class="weekly-item-time">${formatWeeklyEventTime(event.start)}</div>
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
      state.timelineDay = Number(button.dataset.weeklyPick);
      saveState();
      renderWeeklyBoardPage();
    });
  });

  weeklyBoardGridEl.querySelectorAll("[data-weekly-reflect]").forEach((button) => {
    button.addEventListener("click", () => {
      state.timelineDay = Number(button.dataset.weeklyReflect);
      saveState();
      setView("dashboard");
      renderApp();
    });
  });

  weeklyBoardGridEl.querySelectorAll("[data-weekly-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const dayName = button.dataset.weeklyEdit;
      openComposer("fixed");
      document.getElementById("fixedDay").value = dayName;
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
  updateComposerMode();

  if (mode === "fixed" && event) {
    state.editingFixedId = event.id;
    document.getElementById("fixedTitle").value = event.title;
    document.getElementById("fixedDay").value = event.day;
    document.getElementById("fixedStart").value = event.start;
    document.getElementById("fixedEnd").value = event.end;
  } else if (mode === "fixed") {
    resetFixedForm();
  }

  if (mode === "task") {
    document.getElementById("quickTaskForm").reset();
    document.getElementById("quickTaskDuration").value = 60;
    document.getElementById("quickTaskImportant").checked = true;
  }

  composerDialogEl.showModal();
}

function closeComposer() {
  resetFixedForm();
  composerDialogEl.close();
}

function updateComposerMode() {
  const taskModeBtn = document.getElementById("taskModeBtn");
  const fixedModeBtn = document.getElementById("fixedModeBtn");
  const taskForm = document.getElementById("quickTaskForm");
  const fixedForm = document.getElementById("fixedForm");
  const title = document.getElementById("composerTitle");

  const taskActive = composerMode === "task";
  taskModeBtn.classList.toggle("active", taskActive);
  fixedModeBtn.classList.toggle("active", !taskActive);
  taskForm.classList.toggle("hidden", !taskActive);
  fixedForm.classList.toggle("hidden", taskActive);
  title.textContent = taskActive ? "Add to the scroll" : "Shape a fixed appointment";
}

function resetFixedForm() {
  state.editingFixedId = null;
  document.getElementById("fixedForm").reset();
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

function bindEvents() {
  const fixedDaySelect = document.getElementById("fixedDay");
  fixedDaySelect.innerHTML = days.map((day) => `<option value="${day}">${day}</option>`).join("");

  document.getElementById("searchInput").addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderLivingScroll();
    renderZenFocus();
    renderMatrix();
  });

  document.getElementById("prevDay").addEventListener("click", () => {
    state.timelineDay = (state.timelineDay + 6) % 7;
    saveState();
    renderApp();
  });

  document.getElementById("nextDay").addEventListener("click", () => {
    state.timelineDay = (state.timelineDay + 1) % 7;
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
    updateComposerMode();
  });

  document.getElementById("closeComposerBtn").addEventListener("click", closeComposer);

  document.getElementById("quickTaskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const task = {
      id: crypto.randomUUID(),
      title: document.getElementById("quickTaskName").value.trim(),
      duration: Number(document.getElementById("quickTaskDuration").value),
      deadline: document.getElementById("quickTaskDeadline").value,
      important: document.getElementById("quickTaskImportant").checked,
      urgent: document.getElementById("quickTaskUrgent").checked,
      zone: "q2",
      done: false,
      scheduled: null,
      doneAt: null,
      note: ""
    };

    if (!task.title) return;
    task.zone = suggestQuadrant(task);
    state.tasks.push(task);
    saveState();
    closeComposer();
    renderApp();
  });

  document.getElementById("fixedForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = {
      id: state.editingFixedId || crypto.randomUUID(),
      title: document.getElementById("fixedTitle").value.trim(),
      day: document.getElementById("fixedDay").value,
      start: document.getElementById("fixedStart").value,
      end: document.getElementById("fixedEnd").value,
      type: "fixed"
    };

    if (!payload.title) return;
    if (toMinutes(payload.end) <= toMinutes(payload.start)) {
      window.alert("End time must be after start time.");
      return;
    }
    if (eventConflicts(payload.day, toMinutes(payload.start), toMinutes(payload.end), payload.id)) {
      window.alert("This event overlaps with an existing event or scheduled task.");
      return;
    }

    if (state.editingFixedId) {
      state.fixed = state.fixed.map((item) => (item.id === state.editingFixedId ? payload : item));
    } else {
      state.fixed.push(payload);
    }

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
}

function init() {
  bindEvents();
  updateComposerMode();
  setView("dashboard");
  renderApp();
}

init();
