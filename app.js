const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const key = "kanso_planner_v3";

const defaults = {
  profile: { wakeTime: "07:00", sleepTime: "23:30", ready: false },
  fixedCommitments: [
    { id: crypto.randomUUID(), title: "MRes Deep Work", day: "Monday", start: "09:00", end: "17:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "MRes Deep Work", day: "Tuesday", start: "09:00", end: "17:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "MRes Deep Work", day: "Wednesday", start: "09:00", end: "17:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "MRes Deep Work", day: "Thursday", start: "09:00", end: "17:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "MRes Deep Work", day: "Friday", start: "09:00", end: "17:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "Supervisor Meeting", day: "Thursday", start: "11:00", end: "13:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "Data Analytics Course", day: "Monday", start: "20:00", end: "23:30", type: "fixed" },
    { id: crypto.randomUUID(), title: "Data Analytics Course", day: "Thursday", start: "20:00", end: "23:30", type: "fixed" },
    { id: crypto.randomUUID(), title: "Badminton", day: "Friday", start: "18:00", end: "20:00", type: "fixed" },
    { id: crypto.randomUUID(), title: "Badminton", day: "Saturday", start: "20:00", end: "22:30", type: "fixed" }
  ],
  goals: [
    { id: crypto.randomUUID(), name: "SQL Self-Study", sessionsPerWeek: 3, duration: 90, priority: "high" },
    { id: crypto.randomUUID(), name: "Gym", sessionsPerWeek: 4, duration: 75, priority: "medium" }
  ],
  matrixTasks: [],
  weeklyPlan: []
};

let state = structuredClone(defaults);
let editingFixedId = null;
loadState();

const fixedListEl = document.getElementById("fixedList");
const goalListEl = document.getElementById("goalList");
const calendarEl = document.getElementById("calendar");
const progressSummaryEl = document.getElementById("progressSummary");

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(total) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function intersects(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function priorityWeight(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] ?? 1;
}

function urgentByDeadline(deadline) {
  if (!deadline) return false;
  return new Date(deadline).getTime() - Date.now() <= 48 * 60 * 60 * 1000;
}

function quadrant(task) {
  const urgent = task.urgent || urgentByDeadline(task.deadline);
  if (task.important && urgent) return "q1";
  if (task.important) return "q2";
  if (urgent) return "q3";
  return "q4";
}

function renderRhythmBadge() {
  const badge = document.getElementById("rhythmBadge");
  badge.textContent = `⏰ Rhythm: wake ${state.profile.wakeTime} • sleep ${state.profile.sleepTime}`;
}

function renderFixed() {
  fixedListEl.innerHTML = "";
  state.fixedCommitments
    .slice()
    .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || toMinutes(a.start) - toMinutes(b.start))
    .forEach((event) => {
      const tpl = document.getElementById("itemTemplate").content.cloneNode(true);
      tpl.querySelector(".title").textContent = event.title;
      tpl.querySelector(".meta").textContent = `${event.day} ${event.start}-${event.end}`;
      const actions = tpl.querySelector(".item-actions");
      const editBtn = document.createElement("button");
      editBtn.className = "ghost";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => fillFixedForm(event));

      const delBtn = document.createElement("button");
      delBtn.className = "ghost";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => {
        state.fixedCommitments = state.fixedCommitments.filter((x) => x.id !== event.id);
        saveState();
        renderFixed();
      });

      actions.append(editBtn, delBtn);
      fixedListEl.appendChild(tpl);
    });
}

function fillFixedForm(event) {
  editingFixedId = event.id;
  document.getElementById("fixedTitle").value = event.title;
  document.getElementById("fixedDay").value = event.day;
  document.getElementById("fixedStart").value = event.start;
  document.getElementById("fixedEnd").value = event.end;
}

function renderGoals() {
  goalListEl.innerHTML = "";
  state.goals.forEach((goal) => {
    const tpl = document.getElementById("itemTemplate").content.cloneNode(true);
    tpl.querySelector(".title").textContent = goal.name;
    tpl.querySelector(".meta").textContent = `${goal.sessionsPerWeek}x • ${goal.duration}m • ${goal.priority}`;
    goalListEl.appendChild(tpl);
  });
}

function renderMatrix() {
  document.querySelectorAll(".quad-items").forEach((el) => (el.innerHTML = ""));
  state.matrixTasks
    .filter((x) => !x.completed)
    .sort((a, b) => (a.deadline ? new Date(a.deadline).getTime() : Infinity) - (b.deadline ? new Date(b.deadline).getTime() : Infinity))
    .forEach((task) => {
      const pill = document.createElement("div");
      pill.className = "pill";
      const due = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline";
      pill.innerHTML = `<strong>${task.name}</strong><br/><small>${due} • ${task.duration}m</small>`;
      document.querySelector(`[data-q='${quadrant(task)}']`).appendChild(pill);
    });
}

function sortedQueue() {
  const recurring = state.goals.flatMap((g) =>
    Array.from({ length: g.sessionsPerWeek }, () => ({
      id: crypto.randomUUID(),
      title: g.name,
      duration: g.duration,
      priority: priorityWeight(g.priority),
      deadline: "",
      source: "goal"
    }))
  );

  const matrix = state.matrixTasks
    .filter((x) => !x.completed)
    .map((task) => ({
      id: crypto.randomUUID(),
      title: task.name,
      duration: task.duration,
      deadline: task.deadline,
      source: "matrix",
      matrixTaskId: task.id,
      priority: quadrant(task) === "q1" ? 5 : quadrant(task) === "q2" ? 4 : quadrant(task) === "q3" ? 2 : 1
    }));

  return [...matrix, ...recurring].sort((a, b) => {
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    if (aDeadline !== bDeadline) return aDeadline - bDeadline;
    return b.priority - a.priority;
  });
}

function preferredSlots() {
  const wake = toMinutes(state.profile.wakeTime);
  let sleep = toMinutes(state.profile.sleepTime);
  if (sleep <= wake) sleep += 24 * 60;

  const morningEnd = Math.min(wake + 120, sleep);
  const afternoonStart = Math.min(wake + 6 * 60, sleep);
  const afternoonEnd = Math.min(afternoonStart + 180, sleep);
  const eveningStart = Math.min(sleep - 210, sleep);
  const eveningEnd = Math.max(eveningStart + 60, sleep - 30);

  return [
    [wake, morningEnd],
    [afternoonStart, afternoonEnd],
    [eveningStart, eveningEnd]
  ].filter(([s, e]) => e - s >= 45);
}

function generatePlan() {
  const plan = state.fixedCommitments.map((x) => ({ ...x, completed: false }));
  const queue = sortedQueue();
  const slots = preferredSlots();

  queue.forEach((work) => {
    let placed = false;
    for (const day of days) {
      for (const [start, endBoundary] of slots) {
        const end = start + work.duration;
        if (end > endBoundary) continue;
        const conflicts = plan
          .filter((e) => e.day === day)
          .some((e) => intersects(start, end, toMinutes(e.start), toMinutes(e.end)));
        if (conflicts) continue;

        plan.push({
          id: work.id,
          title: work.title,
          day,
          start: minutesToTime(start % (24 * 60)),
          end: minutesToTime(end % (24 * 60)),
          type: "flex",
          completed: false,
          matrixTaskId: work.matrixTaskId
        });
        placed = true;
        break;
      }
      if (placed) break;
    }
  });

  state.weeklyPlan = plan;
}

function renderCalendar() {
  calendarEl.innerHTML = "";
  days.forEach((day) => {
    const col = document.createElement("div");
    col.className = "day";
    col.innerHTML = `<h3>${day}</h3>`;
    const events = state.weeklyPlan.filter((x) => x.day === day).sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    if (!events.length) {
      col.innerHTML += `<div class='slot'>No tasks</div>`;
    }

    events.forEach((event) => {
      const block = document.createElement("article");
      block.className = `slot ${event.type === "fixed" ? "fixed" : ""}`;
      block.innerHTML = `<strong>${event.title}</strong><span class='time'>${event.start}-${event.end}</span>${
        event.type === "flex" ? `<label><input type='checkbox' data-id='${event.id}' ${event.completed ? "checked" : ""}/> done</label>` : ""
      }`;
      col.appendChild(block);
    });

    calendarEl.appendChild(col);
  });

  calendarEl.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const task = state.weeklyPlan.find((x) => x.id === e.target.dataset.id);
      if (!task) return;
      task.completed = e.target.checked;
      if (task.matrixTaskId && e.target.checked) {
        const matrixTask = state.matrixTasks.find((m) => m.id === task.matrixTaskId);
        if (matrixTask) matrixTask.completed = true;
      }
      saveState();
      renderMatrix();
      renderProgress();
    });
  });
}

function renderProgress() {
  const flex = state.weeklyPlan.filter((x) => x.type === "flex");
  const done = flex.filter((x) => x.completed).length;
  const pct = flex.length ? Math.round((done / flex.length) * 100) : 0;
  progressSummaryEl.textContent = `🍵 Weekly progress: ${done}/${flex.length} (${pct}%)`;
}

function saveState() {
  localStorage.setItem(key, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state = {
      ...state,
      ...parsed,
      fixedCommitments: parsed.fixedCommitments ?? state.fixedCommitments,
      goals: parsed.goals ?? state.goals,
      matrixTasks: parsed.matrixTasks ?? state.matrixTasks,
      weeklyPlan: parsed.weeklyPlan ?? state.weeklyPlan,
      profile: parsed.profile ?? state.profile
    };
  } catch {
    // keep defaults
  }
}

function populateDaySelect() {
  const select = document.getElementById("fixedDay");
  select.innerHTML = days.map((d) => `<option value='${d}'>${d}</option>`).join("");
}

function scheduleReminder() {
  const now = new Date();
  const day = days[(now.getDay() + 6) % 7];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = state.weeklyPlan
    .filter((x) => x.type === "flex" && !x.completed && x.day === day)
    .map((x) => ({ ...x, mins: toMinutes(x.start) }))
    .filter((x) => x.mins > nowMin)
    .sort((a, b) => a.mins - b.mins)[0];

  if (!next) return;
  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(`Upcoming: ${next.title}`, { body: `${next.start}-${next.end}` });
    }
  }, (next.mins - nowMin) * 60 * 1000);
}

function bindEvents() {
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.profile.wakeTime = document.getElementById("wakeTime").value;
    state.profile.sleepTime = document.getElementById("sleepTime").value;
    state.profile.ready = true;
    document.getElementById("onboarding").classList.add("hidden");
    saveState();
    renderRhythmBadge();
  });

  document.getElementById("fixedForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      id: editingFixedId ?? crypto.randomUUID(),
      title: document.getElementById("fixedTitle").value.trim(),
      day: document.getElementById("fixedDay").value,
      start: document.getElementById("fixedStart").value,
      end: document.getElementById("fixedEnd").value,
      type: "fixed"
    };

    if (toMinutes(payload.end) <= toMinutes(payload.start)) {
      alert("End time must be after start time.");
      return;
    }

    if (editingFixedId) {
      state.fixedCommitments = state.fixedCommitments.map((x) => (x.id === editingFixedId ? payload : x));
    } else {
      state.fixedCommitments.push(payload);
    }
    editingFixedId = null;
    e.target.reset();
    saveState();
    renderFixed();
  });

  document.getElementById("goalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.goals.push({
      id: crypto.randomUUID(),
      name: document.getElementById("goalName").value.trim(),
      sessionsPerWeek: Number(document.getElementById("goalSessions").value),
      duration: Number(document.getElementById("goalDuration").value),
      priority: document.getElementById("goalPriority").value
    });
    e.target.reset();
    saveState();
    renderGoals();
  });

  document.getElementById("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.matrixTasks.push({
      id: crypto.randomUUID(),
      name: document.getElementById("taskName").value.trim(),
      deadline: document.getElementById("taskDeadline").value,
      duration: Number(document.getElementById("taskDuration").value),
      important: document.getElementById("taskImportant").checked,
      urgent: document.getElementById("taskUrgent").checked,
      completed: false
    });
    e.target.reset();
    document.getElementById("taskImportant").checked = true;
    saveState();
    renderMatrix();
  });

  document.getElementById("generateBtn").addEventListener("click", () => {
    if (!state.profile.ready) {
      alert("Please set wake/sleep rhythm first.");
      return;
    }
    generatePlan();
    saveState();
    renderCalendar();
    renderProgress();
    scheduleReminder();
  });

  document.getElementById("resetPlanBtn").addEventListener("click", () => {
    state.weeklyPlan = [];
    saveState();
    renderCalendar();
    renderProgress();
  });

  document.getElementById("notifyBtn").addEventListener("click", async () => {
    if (!("Notification" in window)) {
      alert("Browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    alert(permission === "granted" ? "Reminders enabled." : "Notifications blocked.");
  });
}

function init() {
  populateDaySelect();
  if (state.profile.ready) {
    document.getElementById("onboarding").classList.add("hidden");
    document.getElementById("wakeTime").value = state.profile.wakeTime;
    document.getElementById("sleepTime").value = state.profile.sleepTime;
  }
  renderRhythmBadge();
  renderFixed();
  renderGoals();
  renderMatrix();
  renderCalendar();
  renderProgress();
  bindEvents();
}

init();
