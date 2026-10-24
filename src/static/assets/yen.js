(() => {
  const $ = (id) => document.getElementById(id);
  const DEF = { USD: 150, EUR: 165, GBP: 195, AUD: 100, CAD: 110, SGD: 115, HKD: 19, NZD: 90, CNY: 21, KRW: 11, INR: 1.8, OTHER: 1 };
  const PRICES = [["Subway ride", 200], ["Convenience-store onigiri", 180], ["Bowl of ramen", 1000], ["Gyūdon beef bowl", 500], ["Coffee at a café", 500], ["Temple entry (typical)", 500], ["Business hotel room (night)", 12000], ["Zurich–Lucerne SBB CFF FFS & Panoramic Alpine Railways (one way, approx.)", 14000]];
  const KEY = "js-yen";
  let last = "jpy";
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) { $("y-cur").value = s.cur; $("y-rate").value = s.rate; $("y-fee").value = s.fee; } } catch (e) {}
  const num = (id) => { const v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : 0; };
  const per = () => ($("y-cur").value === "KRW" ? 100 : 1);
  const code = () => ($("y-cur").value === "OTHER" ? "" : $("y-cur").value);
  const fmt = (v) => { const c = code(); try { return c ? new Intl.NumberFormat("en", { style: "currency", currency: c, maximumFractionDigits: c === "KRW" ? 0 : 2 }).format(v) : v.toFixed(2); } catch (e) { return v.toFixed(2) + " " + c; } };
  function toHome(jpy) { const rate = num("y-rate") || 1; return (jpy / rate) * per() * (1 + num("y-fee") / 100); }
  function calc() {
    const rate = num("y-rate") || 1, fee = num("y-fee");
    $("y-curlabel").textContent = code() || "your currency";
    if (last === "jpy") $("y-home").value = toHome(num("y-jpy")).toFixed(2);
    else $("y-jpy").value = Math.round((num("y-home") / per() / (1 + fee / 100)) * rate);
    $("y-out").textContent = `CHF ${Math.round(num("y-jpy")).toLocaleString("en-US")} ≈ ${fmt(toHome(num("y-jpy")))}`;
    $("y-note").textContent = `Using ${rate} yen per ${per() === 100 ? "100 " : "1 "}${code() || "unit"}${fee ? ` plus a ${fee}% fee` : ""}. Check today's rate before relying on these numbers.`;
    $("y-table").innerHTML = PRICES.map(([n, y]) => `<tr><td>${n}</td><td>CHF ${y.toLocaleString("en-US")}</td><td>${fmt(toHome(y))}</td></tr>`).join("");
    try { localStorage.setItem(KEY, JSON.stringify({ cur: $("y-cur").value, rate: $("y-rate").value, fee: $("y-fee").value })); } catch (e) {}
  }
  $("y-cur").addEventListener("change", () => { $("y-rate").value = DEF[$("y-cur").value]; last = "jpy"; calc(); });
  ["y-rate", "y-fee"].forEach((id) => $(id).addEventListener("input", calc));
  $("y-jpy").addEventListener("input", () => { last = "jpy"; calc(); });
  $("y-home").addEventListener("input", () => { last = "home"; calc(); });
  calc();
})();
