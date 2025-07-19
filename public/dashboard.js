const ws = new WebSocket(`ws://${window.location.host}`);

const statusEl = document.getElementById("ws-status");
const activeEl = document.getElementById("active-visitors");
const totalEl = document.getElementById("total-today");
const pageCountsEl = document.getElementById("page-counts");
const feedEl = document.getElementById("visitor-feed");
const sessionsEl = document.getElementById("sessions");
const dashboardCountEl = document.getElementById("dashboard-count");



let filters = {};


ws.onopen = () => {
  statusEl.textContent = "Connected";
  statusEl.style.color = "green";
};

ws.onclose = () => {
  statusEl.textContent = "Disconnected - Reconnecting...";
  statusEl.style.color = "red";
  setTimeout(() => location.reload(), 3000); // reconnect
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.type) {
    case "user_connected":
    if (dashboardCountEl) {
      dashboardCountEl.textContent = `Connected Dashboards: ${msg.totalDashboards}`;
    }
    break;

  case "user_disconnected":
    if (dashboardCountEl) {
      dashboardCountEl.textContent = `Connected Dashboards: ${msg.data.totalDashboards}`;
    }
    break;

    case "visitor_update":
      updateStats(msg.data.stats);
      if (msg.data.event) addVisitorEvent(msg.data.event);
    break;

    case "session_activity":
      updateSession(msg.data);
      break;

    case "alert":
      alert(`${msg.data.level.toUpperCase()}: ${msg.data.message}`);
      break;

    default:
      console.log("Unhandled event:", msg);
  }
};

function updateStats(stats) {
  activeEl.textContent = stats.totalActive;
  totalEl.textContent = stats.totalToday;
  pageCountsEl.innerHTML = "";

  for (const [page, count] of Object.entries(stats.pagesVisited)) {
    const li = document.createElement("li");
    li.textContent = `${page} — ${count}`;
    pageCountsEl.appendChild(li);
  }
}

function addVisitorEvent(event) {
  const div = document.createElement("div");
  div.className = "visitor";
  div.innerHTML = `
    <strong>${event.type}</strong> — ${event.page} <br/>
    Session: ${event.sessionId} | ${event.country} | ${event.timestamp}
  `;
  feedEl.prepend(div);

  const ding = new Audio("/ding.mp3"); 
  ding.play();

  div.style.backgroundColor = "#d1ffd1";
  setTimeout(() => {
    div.style.backgroundColor = "white";
  }, 500);
}

const sessionMap = {}; 

function updateSession(data) {
  sessionMap[data.sessionId] = data;

  renderSessions();
}

function renderSessions() {
  sessionsEl.innerHTML = "";
  Object.entries(sessionMap).forEach(([id, session]) => {
    const div = document.createElement("div");
    div.className = "session";
    div.innerHTML = `
      <strong>Session:</strong> ${id}<br/>
      Page: ${session.currentPage} <br/>
      Journey: ${session.journey.join(" → ")} <br/>
      Duration: ${session.duration}s
    `;
    sessionsEl.appendChild(div);
  });
}

// Filters
function applyFilters() {
  const country = document.getElementById("country").value;
  const page = document.getElementById("page").value;

  filters = { country, page };
  const msg = {
    type: "request_detailed_stats",
    filter: {}
  };

  if (country) msg.filter.country = country;
  if (page) msg.filter.page = page;

  ws.send(JSON.stringify(msg));

  // track action
  ws.send(
    JSON.stringify({
      type: "track_dashboard_action",
      action: "filter_applied",
      details: {
        filterType: country ? "country" : "page",
        value: country || page
      }
    })
  );
}

function clearStats() {
  feedEl.innerHTML = "";
  sessionsEl.innerHTML = "";
  pageCountsEl.innerHTML = "";
  activeEl.textContent = 0;
  totalEl.textContent = 0;
  Object.keys(sessionMap).forEach(key => delete sessionMap[key]);
}