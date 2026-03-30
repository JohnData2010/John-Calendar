const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const appStateKey = "flowstate_planner_v2";

const fixedCommitments = [
  { title: "MRes Deep Work", day: "Monday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Tuesday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Wednesday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Thursday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Friday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "Supervisor Meeting (On Campus)", day: "Thursday", start: "11:00", end: "13:00", type: "fixed" },
  { title: "Data Analytics Course", day: "Monday", start: "20:00", end: "23:30", type: "fixed" },
  { title: "Data Analytics Course", day: "Thursday", start: "20:00", end: "23:30", type: "fixed" },
  { title: "Badminton", day: "Friday", start: "18:00", end: "20:00", type: "fixed" },
  { title: "Badminton", day: "Saturday", start: "20:00", end: "22:30", type: "fixed" }
];

let goals = [
  { id: crypto.randomUUID(), name: "SQL Self-Study", sessionsPerWeek: 3, duration: 90, priority: "high" },
  { id: crypto.randomUUID(), name: "Gym", sessionsPerWeek: 4, duration: 75, priority: "medium" }
];

let matrixTasks = [
  {
    id: crypto.randomUUID(),
    name: "Prepare supervisor agenda",
    deadline: "",
    duration: 60,
    important: true,
    urgent: false,
    completed: false
  }
];

let weeklyPlan = [];

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
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function intersects(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function priorityWeight(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] ?? 1;
}

function getDeadlineMs(deadline) {
  return deadline ? new Date(deadline).getTime() : Number.POSITIVE_INFINITY;
}

function isUrgentByDeadline(deadline) {
  if (!deadline) return false;
  const diff = getDeadlineMs(deadline) - Date.now();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000;
}

function getQuadrant(task) {
  const urgent = task.urgent || isUrgentByDeadline(task.deadline);
  if (urgent && task.important) return "q1";
  if (!urgent && task.important) return "q2";
  if (urgent && !task.important) return "q3";
  return "q4";
}

function buildListItem(title, meta) {
  const tpl = document.getElementById("itemTemplate").content.cloneNode(true);
  tpl.querySelector(".title").textContent = title;
  tpl.querySelector(".meta").textContent = meta;
  return tpl;
}

function renderFixed() {
  fixedListEl.innerHTML = "";
  fixedCommitments
    .slice()
    .sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || toMinutes(a.start) - toMinutes(b.start))
    .forEach((event) => fixedListEl.appendChild(buildListItem(event.title, `${event.day} ${event.start}-${event.end}`)));
}

function renderGoals() {
  goalListEl.innerHTML = "";
  goals.forEach((goal) => {
    goalListEl.appendChild(buildListItem(goal.name, `${goal.sessionsPerWeek}x • ${goal.duration}m • ${goal.priority}`));
  });
}

function renderMatrix() {
  document.querySelectorAll(".quad__items").forEach((el) => {
    el.innerHTML = "";
  });

  matrixTasks
    .filter((task) => !task.completed)
    .sort((a, b) => getDeadlineMs(a.deadline) - getDeadlineMs(b.deadline))
    .forEach((task) => {
      const q = getQuadrant(task);
      const container = document.querySelector(`.quad__items[data-quad='${q}']`);
      const pill = document.createElement("div");
      pill.className = "task-pill";
      const deadlineText = task.deadline ? new Date(task.deadline).toLocaleString() : "No deadline";
      pill.innerHTML = `<strong>${task.name}</strong><br/><small>${deadlineText} • ${task.duration} min</small>`;
      container.appendChild(pill);
    });
}

function sortedWorkQueue() {
  const recurring = goals.flatMap((goal) =>
    Array.from({ length: goal.sessionsPerWeek }, (_, idx) => ({
      id: crypto.randomUUID(),
      title: goal.name,
      type: "flex",
      source: "goal",
      duration: goal.duration,
      priority: priorityWeight(goal.priority),
      deadline: "",
      order: idx
    }))
  );

  const matrixItems = matrixTasks
    .filter((task) => !task.completed)
    .map((task) => ({
      id: crypto.randomUUID(),
      title: task.name,
      type: "flex",
      source: "matrix",
      duration: task.duration,
      priority: getQuadrant(task) === "q1" ? 5 : getQuadrant(task) === "q2" ? 4 : getQuadrant(task) === "q3" ? 2 : 1,
      deadline: task.deadline,
      matrixTaskId: task.id
    }));

  return [...matrixItems, ...recurring].sort((a, b) => {
    const deadlineDiff = getDeadlineMs(a.deadline) - getDeadlineMs(b.deadline);
    if (deadlineDiff !== 0) return deadlineDiff;
    return b.priority - a.priority;
  });
}

function generatePlan() {
  const plan = fixedCommitments.map((x) => ({ ...x, completed: false }));
  const queue = sortedWorkQueue();
  const preferredSlots = [
    ["07:00", "08:45"],
    ["17:30", "19:45"],
    ["13:30", "16:30"],
    ["10:00", "12:00"]
  ];

  for (const work of queue) {
    const orderedDays = [...days].sort((a, b) => {
      if (!work.deadline) return 0;
      const today = new Date();
      const aDate = dateForWeekday(a, today);
      const bDate = dateForWeekday(b, today);
      return Math.abs(getDeadlineMs(work.deadline) - aDate.getTime()) - Math.abs(getDeadlineMs(work.deadline) - bDate.getTime());
    });

    let placed = false;
    for (const day of orderedDays) {
      for (const [slotStart, slotEnd] of preferredSlots) {
        const start = toMinutes(slotStart);
        const end = start + work.duration;
        if (end > toMinutes(slotEnd)) continue;

        const dayEvents = plan.filter((e) => e.day === day);
        const hasConflict = dayEvents.some((event) => intersects(start, end, toMinutes(event.start), toMinutes(event.end)));
        if (hasConflict) continue;

        plan.push({
          id: work.id,
          title: work.title,
          day,
          start: minutesToTime(start),
          end: minutesToTime(end),
          source: work.source,
          goalId: work.goalId,
          matrixTaskId: work.matrixTaskId,
          type: "flex",
          completed: false
        });

        placed = true;
        break;
      }
      if (placed) break;
    }
  }

  return plan;
}

function dateForWeekday(weekday, fromDate) {
  const jsDay = fromDate.getDay();
  const mondayIndex = (jsDay + 6) % 7;
  const target = days.indexOf(weekday);
  const diff = target - mondayIndex;
  const d = new Date(fromDate);
  d.setDate(fromDate.getDate() + diff);
  return d;
}

function renderCalendar() {
  calendarEl.innerHTML = "";

  for (const day of days) {
    const col = document.createElement("div");
    col.className = "day";
    col.innerHTML = `<h3>${day}</h3>`;

    const items = weeklyPlan
      .filter((event) => event.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "slot";
      empty.textContent = "No tasks";
      col.appendChild(empty);
    }

    items.forEach((item) => {
      const block = document.createElement("article");
      block.className = `slot ${item.type === "fixed" ? "fixed" : ""}`;
      const checked = item.completed ? "checked" : "";
      block.innerHTML = `
        <strong>${item.title}</strong>
        <span class="time">${item.start} - ${item.end}</span>
        ${item.type === "flex" ? `<label><input type="checkbox" data-id="${item.id}" ${checked}/> done</label>` : ""}
      `;
      col.appendChild(block);
    });

    calendarEl.appendChild(col);
  }

  calendarEl.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const target = weeklyPlan.find((x) => x.id === e.target.dataset.id);
      if (!target) return;
      target.completed = e.target.checked;

      if (target.matrixTaskId && e.target.checked) {
        const matrixTask = matrixTasks.find((t) => t.id === target.matrixTaskId);
        if (matrixTask) matrixTask.completed = true;
      }

      saveState();
      renderMatrix();
      renderProgress();
    });
  });
}

function renderProgress() {
  const flexItems = weeklyPlan.filter((x) => x.type === "flex");
  const done = flexItems.filter((x) => x.completed).length;
  const percent = flexItems.length ? Math.round((done / flexItems.length) * 100) : 0;
  progressSummaryEl.textContent = `Completion this week: ${done}/${flexItems.length} sessions (${percent}%).`;
}

function saveState() {
  localStorage.setItem(appStateKey, JSON.stringify({ goals, matrixTasks, weeklyPlan }));
}

function loadState() {
  const raw = localStorage.getItem(appStateKey);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    goals = parsed.goals ?? goals;
    matrixTasks = parsed.matrixTasks ?? matrixTasks;
    weeklyPlan = parsed.weeklyPlan ?? [];
  } catch {
    // fallback to defaults
  }
}

function scheduleReminder() {
  const now = new Date();
  const today = days[(now.getDay() + 6) % 7];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const next = weeklyPlan
    .filter((x) => x.type === "flex" && x.day === today && !x.completed)
    .map((x) => ({ ...x, mins: toMinutes(x.start) }))
    .filter((x) => x.mins > nowMin)
    .sort((a, b) => a.mins - b.mins)[0];

  if (!next) return;

  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(`Next focus block: ${next.title}`, { body: `${next.start} - ${next.end}` });
    } else {
      alert(`Next: ${next.title} at ${next.start}`);
    }
  }, (next.mins - nowMin) * 60 * 1000);
}

function initEvents() {
  document.getElementById("goalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    goals.push({
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
    matrixTasks.push({
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
    weeklyPlan = generatePlan();
    saveState();
    renderCalendar();
    renderProgress();
    scheduleReminder();
  });

  document.getElementById("resetPlanBtn").addEventListener("click", () => {
    weeklyPlan = [];
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
    alert(permission === "granted" ? "Reminders enabled." : "Notifications are blocked.");
  });
}

function renderAll() {
  renderFixed();
  renderGoals();
  renderMatrix();
  renderCalendar();
  renderProgress();
}

initEvents();
renderAll();
