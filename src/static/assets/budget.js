(() => {
  const $ = (id) => document.getElementById(id);
  const STYLES = {
    budget: { hotel: 7000, food: 3000, local: 800, sights: 1000, extra: 1000 },
    mid: { hotel: 18000, food: 6000, local: 1200, sights: 2500, extra: 3000 },
    luxury: { hotel: 60000, food: 18000, local: 4000, sights: 8000, extra: 10000 },
  };
  const KEYS = ["nights", "people", "room", "hotel", "food", "local", "sights", "extra", "rail", "sim", "airport", "cur", "rate"];
  const yen = (n) => "CHF " + Math.round(n).toLocaleString("en-US");
  let style = "mid";
  function applyStyle(s) {
    style = s;
    document.querySelectorAll("[data-style]").forEach((b) => { const on = b.dataset.style === s; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); });
    for (const [k, v] of Object.entries(STYLES[s])) $("b-" + k).value = v;
    calc();
  }
  function num(id) { const v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : 0; }
  function calc() {
    const nights = Math.max(1, num("b-nights")), people = Math.max(1, num("b-people")), perRoom = Math.max(1, num("b-room"));
    const days = nights + 1, rooms = Math.ceil(people / perRoom);
    const lodging = num("b-hotel") * rooms * nights;
    const daily = (num("b-food") + num("b-local") + num("b-sights") + num("b-extra")) * people * days;
    const oneoff = (num("b-rail") + num("b-sim") + num("b-airport")) * people;
    const total = lodging + daily + oneoff;
    const rate = num("b-rate") || 1, cur = ($("b-cur").value || "").toUpperCase().replace(/[^A-Z]/g, "") || "—";
    const fx = (n) => (n / rate).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " " + cur;
    $("budget-result").innerHTML = `<h2>Estimated total: ${yen(total)} <small>(≈ ${fx(total)})</small></h2>
      <div class="facts"><div><strong>Per person</strong><span>${yen(total / people)} (≈ ${fx(total / people)})</span></div><div><strong>Per person per day</strong><span>${yen(total / people / days)}</span></div><div><strong>Rooms</strong><span>${rooms} × ${nights} nights</span></div></div>
      <table><tbody><tr><th>Accommodation</th><td>${yen(lodging)}</td></tr><tr><th>Food, local transport, sights, extras (${days} days)</th><td>${yen(daily)}</td></tr><tr><th>Rail, SIM, airport transfers</th><td>${yen(oneoff)}</td></tr></tbody></table>
      <p class="note">Excludes international flights and travel insurance. Rough estimate only.</p>`;
    try { const s = { style }; KEYS.forEach((k) => (s[k] = $("b-" + k).value)); localStorage.setItem("jtc-budget", JSON.stringify(s)); } catch (e) {}
  }
  document.querySelectorAll("[data-style]").forEach((b) => b.addEventListener("click", () => applyStyle(b.dataset.style)));
  document.getElementById("budget-form").addEventListener("input", calc);
  let saved = null; try { saved = JSON.parse(localStorage.getItem("jtc-budget")); } catch (e) {}
  if (saved && STYLES[saved.style]) { applyStyle(saved.style); KEYS.forEach((k) => saved[k] != null && ($("b-" + k).value = saved[k])); calc(); } else applyStyle("mid");
})();
