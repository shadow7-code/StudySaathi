const charts = {};

/* ===== HELPERS ===== */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function getLast7Days() {
  return [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });
}

function getDateRange(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  d.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setDate(end.getDate() + 1);

  return { start: d, end };
}

/* ===== DATA ===== */

function getStudyTimeData() {
  const history = JSON.parse(localStorage.getItem("timerHistory")) || [];
  const days = getLast7Days();

  const data = days.map((_, i) => {
    const { start, end } = getDateRange(6 - i);
    let total = 0;

    history.forEach(s => {
      if (s.mode === "study" && s.date) {
        const sessionDate = new Date(s.date);
        if (sessionDate >= start && sessionDate < end) {
          const duration = Number(s.duration) || 0;
          total += duration > 1000 ? duration / 60 : duration;
        }
      }
    });

    return Math.round(total);
  });

  return { days, data };
}

function getTaskData() {
  const tasks = Storage.getTasks() || [];
  const completed = tasks.filter(t => t.completed).length;
  return { labels: ["Completed", "Pending"], data: [completed, tasks.length - completed] };
}

function getTaskDistributionByPriority() {
  const tasks = Storage.getTasks() || [];
  const p = { high: 0, medium: 0, low: 0 };

  tasks.forEach(t => {
    if (p[t.priority] !== undefined) p[t.priority]++;
  });

  return {
    labels: ["High", "Medium", "Low"],
    data: [p.high, p.medium, p.low],
    colors: ["#ef4444", "#fbbf24", "#10b981"]
  };
}

function getXPData() {
  const history = JSON.parse(localStorage.getItem("timerHistory")) || [];
  const days = getLast7Days();

  return {
    days,
    data: days.map((_, i) => {
      const { start, end } = getDateRange(6 - i);
      return history.filter(s =>
        s.mode === "study" &&
        new Date(s.date) >= start &&
        new Date(s.date) < end
      ).length * 25;
    })
  };
}

/* ===== CHARTS ===== */

function createChart(id, type, data) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;

  return new Chart(canvas, {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 200
    }
  });
}

function initCharts() {

  const study = getStudyTimeData();
  charts.study = createChart("study-time-chart", "line", {
    labels: study.days,
    datasets: [{ data: study.data, borderColor: "#3b82f6", fill: true }]
  });

  const tasks = getTaskData();
  charts.task = createChart("task-chart", "doughnut", {
    labels: tasks.labels,
    datasets: [{ data: tasks.data }]
  });

  const priority = getTaskDistributionByPriority();
  charts.priority = createChart("task-priority-chart", "pie", {
    labels: priority.labels,
    datasets: [{ data: priority.data, backgroundColor: priority.colors }]
  });

  const status = getTaskData();
  charts.status = createChart("task-status-chart", "doughnut", {
    labels: status.labels,
    datasets: [{ data: status.data }]
  });

  const xp = getXPData();
  charts.xp = createChart("xp-chart", "bar", {
    labels: xp.days,
    datasets: [{ data: xp.data, backgroundColor: "#8b5cf6" }]
  });
}

/* ===== ACTIVITY ===== */

function updateActivityTimeline() {
  const container = document.getElementById("activity-timeline");
  if (!container) return;

  const items = [];

  Storage.getTasks().forEach(t => {
    if (t.completed) items.push({ icon: "✅", text: t.title, date: t.completedAt });
  });

  (JSON.parse(localStorage.getItem("timerHistory")) || []).forEach(s => {
    if (s.mode === "study") items.push({ icon: "⏱️", text: "Study Session", date: s.date });
  });

  container.innerHTML = items.length
    ? items.map(i => `<div>${i.icon} ${i.text}</div>`).join("")
    : "<p>No activity yet</p>";
}

/* ===== STATS ===== */

function updateStats() {
  const s = Storage.getStats() || {};
  setText("stat-tasks", s.tasksCompleted || 0);
  setText("stat-notes", s.notesCreated || 0);
  setText("stat-sessions", s.sessionsCompleted || 0);

  const h = Math.floor((s.totalStudyTime || 0) / 60);
  setText("stat-time", `${h}h`);
}

/* ===== REFRESH ===== */

function refreshAnalytics() {
  updateStats();

  if (charts.study) {
    const s = getStudyTimeData();
    charts.study.data.datasets[0].data = s.data;
    charts.study.update();
  }

  if (charts.xp) {
    const x = getXPData();
    charts.xp.data.datasets[0].data = x.data;
    charts.xp.update();
  }

  updateActivityTimeline();
}

/* ===== INIT ===== */

document.addEventListener("DOMContentLoaded", () => {
  initCharts();
  updateStats();
  updateActivityTimeline();
  setInterval(refreshAnalytics, 30000);
});
