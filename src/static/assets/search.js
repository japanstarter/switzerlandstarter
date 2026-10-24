(() => {
  const input = document.getElementById("q"), list = document.getElementById("search-results"), status = document.getElementById("search-status");
  let data = [];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function run() {
    const q = input.value.trim().toLowerCase();
    if (!q) { list.innerHTML = ""; status.textContent = ""; return; }
    const terms = q.split(/\s+/);
    const res = data.map((d) => {
      const t = d.t.toLowerCase(), hay = (d.t + " " + d.d + " " + (d.g || []).join(" ") + " " + d.k).toLowerCase();
      if (!terms.every((w) => hay.includes(w))) return null;
      return [terms.reduce((s, w) => s + (t.includes(w) ? 3 : 1), 0), d];
    }).filter(Boolean).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
    status.textContent = res.length ? `${res.length} result${res.length > 1 ? "s" : ""} for “${input.value}”` : `No results for “${input.value}”. Try a broader term.`;
    list.innerHTML = res.slice(0, 50).map((d) => `<li><a href="${d.u}"><span class="card-meta">${esc(d.k)}</span><strong>${esc(d.t)}</strong><span>${esc(d.d)}</span></a></li>`).join("");
  }
  fetch("/search-index.json").then((r) => r.json()).then((j) => {
    data = j;
    const q = new URLSearchParams(location.search).get("q");
    if (q) input.value = q;
    run();
  });
  input.addEventListener("input", run);
  document.getElementById("search-form").addEventListener("submit", (e) => { e.preventDefault(); history.replaceState(null, "", "?q=" + encodeURIComponent(input.value)); run(); });
})();
