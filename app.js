const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const planKey = "john_calendar_plan_v1";

const fixedCommitments = [
  { title: "Data Analytics Course", day: "Monday", start: "20:00", end: "23:30", type: "fixed" },
  { title: "Data Analytics Course", day: "Thursday", start: "20:00", end: "23:30", type: "fixed" },
  { title: "Supervisor Meeting (Campus)", day: "Thursday", start: "11:00", end: "13:00", type: "fixed" },
  { title: "Badminton", day: "Friday", start: "18:00", end: "20:00", type: "fixed" },
  { title: "Badminton", day: "Saturday", start: "20:00", end: "22:30", type: "fixed" },
  { title: "MRes Deep Work", day: "Monday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Tuesday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Wednesday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Thursday", start: "09:00", end: "17:00", type: "fixed" },
  { title: "MRes Deep Work", day: "Friday", start: "09:00", end: "17:00", type: "fixed" }
];

let goals = [
  { id: crypto.randomUUID(), name: "SQL Self-Study", sessionsPerWeek: 3, duration: 90, priority: "high" },
  { id: crypto.randomUUID(), name: "Gym", sessionsPerWeek: 4, duration: 75, priority: "medium" }
];

let weeklyPlan = loadState();

const fixedListEl = document.getElementById("fixedList");
const goalListEl = document.getElementById("goalList");
const calendarEl = document.getElementById("calendar");
const progressSummaryEl = document.getElementById("progressSummary");

document.getElementById("goalForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("goalName").value.trim();
  const sessionsPerWeek = Number(document.getElementById("goalSessions").value);
  const duration = Number(document.getElementById("goalDuration").value);
  const priority = document.getElementById("goalPriority").value;

  goals.push({ id: crypto.randomUUID(), name, sessionsPerWeek, duration, priority });
  e.target.reset();
  renderGoals();
});

document.getElementById("generateBtn").addEventListener("click", () => {
  weeklyPlan = generatePlan();
  saveState();
  renderCalendar();
  renderProgress();
  scheduleInAppReminder();
});

document.getElementById("resetPlanBtn").addEventListener("click", () => {
  weeklyPlan = [];
  saveState();
  renderCalendar();
  renderProgress();
});

document.getElementById("notifyBtn").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    alert("This browser does not support notifications.");
    return;
  }
  const permission = await Notification.requestPermission();
  alert(permission === "granted" ? "Notifications enabled." : "Notifications blocked.");
});

function renderFixed() {
  fixedListEl.innerHTML = "";
  fixedCommitments.forEach((event) => fixedListEl.appendChild(buildListItem(event.title, `${event.day} ${event.start}-${event.end}`)));
}

function renderGoals() {
  goalListEl.innerHTML = "";
  goals.forEach((goal) => {
    const item = buildListItem(goal.name, `${goal.sessionsPerWeek} sessions • ${goal.duration} min • ${goal.priority}`);
    item.dataset.id = goal.id;
    goalListEl.appendChild(item);
  });
}

function buildListItem(title, meta) {
  const tpl = document.getElementById("eventTemplate").content.cloneNode(true);
  tpl.querySelector(".title").textContent = title;
  tpl.querySelector(".meta").textContent = meta;
  return tpl;
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function intersects(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function priorityWeight(priority) {
  return { high: 3, medium: 2, low: 1 }[priority] ?? 1;
}

function generatePlan() {
  const plan = [...fixedCommitments.map((x) => ({ ...x, completed: false }))];
  const sortGoals = [...goals].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));

  const preferredSlots = [
    ["07:00", "08:30"],
    ["17:30", "19:30"],
    ["13:30", "16:00"],
    ["10:00", "12:00"]
  ];

  for (const goal of sortGoals) {
    let scheduled = 0;
    const usedDays = new Set();

    for (let attempt = 0; attempt < goal.sessionsPerWeek * 4 && scheduled < goal.sessionsPerWeek; attempt += 1) {
      const day = days[attempt % 7];
      if (usedDays.has(day) && days.length - usedDays.size > 2) continue;

      const duration = goal.duration;
      for (const [slotStart, slotEnd] of preferredSlots) {
        const startCandidate = toMinutes(slotStart);
        const endLimit = toMinutes(slotEnd);
        const endCandidate = startCandidate + duration;
        if (endCandidate > endLimit) continue;

        const dayEvents = plan.filter((e) => e.day === day);
        const conflict = dayEvents.some((event) =>
          intersects(startCandidate, endCandidate, toMinutes(event.start), toMinutes(event.end))
        );

        if (!conflict) {
          plan.push({
            id: crypto.randomUUID(),
            title: goal.name,
            day,
            start: minutesToTime(startCandidate),
            end: minutesToTime(endCandidate),
            type: "flex",
            goalId: goal.id,
            completed: false
          });
          scheduled += 1;
          usedDays.add(day);
          break;
        }
      }
    }
  }

  return plan;
}

function minutesToTime(total) {
  const h = String(Math.floor(total / 60)).padStart(2, "0");
  const m = String(total % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function renderCalendar() {
  calendarEl.innerHTML = "";

  for (const day of days) {
    const col = document.createElement("div");
    col.className = "day";
    col.innerHTML = `<h3>${day}</h3>`;

    const items = weeklyPlan
      .filter((e) => e.day === day)
      .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "slot";
      empty.textContent = "No items";
      col.appendChild(empty);
    }

    items.forEach((item) => {
      const block = document.createElement("article");
      block.className = `slot ${item.type === "fixed" ? "fixed" : ""}`;
      const checked = item.completed ? "checked" : "";
      block.innerHTML = `
        <strong>${item.title}</strong>
        <span class="time">${item.start} - ${item.end}</span>
        ${
          item.type === "flex"
            ? `<label><input type="checkbox" data-id="${item.id}" ${checked}/> done</label>`
            : ""
        }
      `;
      col.appendChild(block);
    });

    calendarEl.appendChild(col);
  }

  calendarEl.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      const target = weeklyPlan.find((item) => item.id === e.target.dataset.id);
      if (target) {
        target.completed = e.target.checked;
        saveState();
        renderProgress();
      }
    });
  });
}

function renderProgress() {
  const flexItems = weeklyPlan.filter((x) => x.type === "flex");
  const completed = flexItems.filter((x) => x.completed).length;
  const percent = flexItems.length ? Math.round((completed / flexItems.length) * 100) : 0;
  progressSummaryEl.textContent = `Completed ${completed}/${flexItems.length} flexible sessions (${percent}%).`;
}

function saveState() {
  localStorage.setItem(planKey, JSON.stringify({ goals, weeklyPlan }));
}

function loadState() {
  const raw = localStorage.getItem(planKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    goals = parsed.goals ?? goals;
    return parsed.weeklyPlan ?? [];
  } catch {
    return [];
  }
}

function scheduleInAppReminder() {
  const now = new Date();
  const todayName = days[(now.getDay() + 6) % 7];
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const nextFlex = weeklyPlan
    .filter((e) => e.type === "flex" && e.day === todayName && !e.completed)
    .map((e) => ({ ...e, mins: toMinutes(e.start) }))
    .filter((e) => e.mins > currentMins)
    .sort((a, b) => a.mins - b.mins)[0];

  if (!nextFlex) return;

  const msUntil = (nextFlex.mins - currentMins) * 60 * 1000;
  setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification(`Upcoming: ${nextFlex.title}`, {
        body: `Starts at ${nextFlex.start}. Time to focus!`
      });
    } else {
      alert(`Upcoming: ${nextFlex.title} at ${nextFlex.start}`);
    }
  }, msUntil);
}

renderFixed();
renderGoals();
renderCalendar();
renderProgress();
