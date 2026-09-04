const DATA_URL = "./data/portfolio.json";

const toneByStatus = { 已验证: "verified", 持续迭代: "verified", 原型: "prototype", 实验中: "prototype", 待回归: "review" };

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function safeUrl(value = "") {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch { return "#"; }
}

function renderLinks(links = []) {
  return links.map(({ label, url }) => `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noreferrer">${escapeHtml(label)} ↗</a>`).join("");
}

function renderProjects(projects) {
  document.querySelector("#project-list").innerHTML = projects.map((project, index) => `
    <article class="project-item">
      <div class="project-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="project-main"><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p></div>
      <div class="project-meta">
        <span class="status-chip" data-tone="${toneByStatus[project.status] || "review"}">${escapeHtml(project.status)} · ${escapeHtml(project.period)}</span>
        <div class="tag-list">${(project.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="project-links">${renderLinks(project.links)}</div>
      </div>
    </article>`).join("");
}

function renderTimeline(milestones) {
  document.querySelector("#timeline-list").innerHTML = milestones.map((item) => `
    <li class="timeline-item">
      <time class="timeline-date" datetime="${escapeHtml(item.date)}">${escapeHtml(item.date.replaceAll("-", "."))}</time>
      <span class="timeline-rail" aria-hidden="true"></span>
      <div class="timeline-body"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>${item.evidence ? `<a href="${escapeHtml(safeUrl(item.evidence))}" target="_blank" rel="noreferrer">查看证据 ↗</a>` : ""}</div>
    </li>`).join("");
}

function renderNotes(notes) {
  document.querySelector("#notes-list").innerHTML = notes.map((note, index) => `
    <article class="note-card"><div class="note-label">FIELD NOTE / ${String(index + 1).padStart(2, "0")}</div><div><h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.summary)}</p></div></article>`).join("");
}

function renderStats(data) {
  const values = [[data.projects.length, "公开项目"], [data.milestones.length, "阶段节点"], [data.archiveSince, "档案起点"], [1, "唯一事实源"]];
  document.querySelector("#stats-list").innerHTML = values.map(([value, label]) => `<div><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join("");
}

async function loadPortfolio() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    document.querySelector("#profile-intro").textContent = data.profile.intro;
    document.querySelector("#archive-status").textContent = data.profile.status;
    document.querySelector("#last-updated").textContent = `数据更新时间：${data.updated}`;
    renderStats(data); renderProjects(data.projects); renderTimeline(data.milestones); renderNotes(data.notes);
  } catch (error) {
    document.querySelector("#project-list").innerHTML = `<p class="error-state">公开档案暂时无法读取。你仍可通过页尾链接查看 Agent Kit 原始记录。</p>`;
    console.error("Failed to load portfolio data", error);
  }
}

loadPortfolio();
