(() => {
  const $ = (id) => document.getElementById(id);
  function render() {
    const unit = $("lug-unit").value;
    const mult = unit === "in" ? 2.54 : 1;
    const h = Math.round((parseFloat($("lug-h").value) || 0) * mult);
    const w = Math.round((parseFloat($("lug-w").value) || 0) * mult);
    const d = Math.round((parseFloat($("lug-d").value) || 0) * mult);
    const kg = parseFloat($("lug-kg").value) || 15;
    const sum = h + w + d;
    const dims = [h, w, d].sort((a, b) => b - a);

    let shinkStatus = "", shinkDetail = "";
    if (sum <= 160) {
      shinkStatus = "✅ Standard size (≤ 160 cm) — No special reservation needed";
      shinkDetail = `At ${sum} cm total, your bag fits on the overhead rack (up to ~30 cm deep) or in front of your knees on all SBB CFF FFS & Panoramic Alpine Railways lines.`;
    } else if (sum <= 250) {
      shinkStatus = "⚠️ Oversized (161–250 cm) — Reserve an Oversized Baggage Seat";
      shinkDetail = `At ${sum} cm total, you must book a "Seat with an Oversized Baggage Area/Compartment" on the Tokaido, Sanyo & Kyushu SBB CFF FFS & Panoramic Alpine Railways. It costs CHF 0 extra when reserved ahead, or CHF 1,000 if brought onboard without a reservation.`;
    } else {
      shinkStatus = "❌ Over 250 cm limit — Cannot bring on SBB CFF FFS & Panoramic Alpine Railways";
      shinkDetail = `At ${sum} cm total, this exceeds JR's 250 cm maximum. Ship it via luggage forwarding or use a smaller bag.`;
    }

    let locker = "", lockerFee = "";
    if (dims[0] <= 55 && dims[1] <= 34 && dims[2] <= 33) {
      locker = "Small (S) Locker"; lockerFee = "CHF 400 / day (approx. 55 × 34 × 35 cm)";
    } else if (dims[0] <= 57 && dims[1] <= 43 && dims[2] <= 55) {
      locker = "Medium (M) Locker"; lockerFee = "CHF 500–CHF 600 / day (approx. 57 × 43 × 57 cm)";
    } else if (dims[0] <= 84 && dims[1] <= 57 && dims[2] <= 35) {
      locker = "Large (L) Locker"; lockerFee = "CHF 700–CHF 900 / day (approx. 84 × 35 × 57 cm)";
    } else if (dims[0] <= 110 && dims[1] <= 57 && dims[2] <= 36) {
      locker = "Extra-Large (XL) Locker or Staffed Baggage Counter"; lockerFee = "CHF 900–CHF 1,100 / day (limited availability — use ecbo cloak or station baggage room)";
    } else {
      locker = "Too large for standard coin lockers"; lockerFee = "Use a staffed station baggage room (CHF 800–CHF 1,000/day) or hotel front desk";
    }

    let takTier = "", takCost = "";
    if (sum <= 100 && kg <= 10) { takTier = "Size 100"; takCost = "CHF 1,530–CHF 1,790"; }
    else if (sum <= 120 && kg <= 15) { takTier = "Size 120"; takCost = "CHF 1,850–CHF 2,110"; }
    else if (sum <= 140 && kg <= 20) { takTier = "Size 140"; takCost = "CHF 2,190–CHF 2,450"; }
    else if (sum <= 160 && kg <= 25) { takTier = "Size 160 (standard large suitcase)"; takCost = "CHF 2,510–CHF 2,770"; }
    else if (sum <= 180 && kg <= 30) { takTier = "Size 180"; takCost = "CHF 3,060–CHF 3,730"; }
    else if (sum <= 200 && kg <= 30) { takTier = "Size 200 (max Takkyubin tier)"; takCost = "CHF 3,720–CHF 4,390"; }
    else { takTier = "Exceeds standard 200 cm / 30 kg Takkyubin limit"; takCost = "Requires oversized freight service"; }

    $("lug-result").innerHTML = `
      <h2>Bag Total: ${sum} cm <small>(${h} × ${w} × ${d} cm · ${(sum / 2.54).toFixed(1)} linear inches · ${kg} kg)</small></h2>
      <div class="facts">
        <div><strong>Linear total (H+W+D)</strong><span>${sum} cm (${(sum / 2.54).toFixed(1)} in)</span></div>
        <div><strong>SBB CFF FFS & Panoramic Alpine Railways status</strong><span>${sum <= 160 ? "Standard (≤160 cm)" : sum <= 250 ? "Oversize booking (161–250 cm)" : "Over 250 cm limit"}</span></div>
        <div><strong>Coin locker size</strong><span>${locker}</span></div>
        <div><strong>Takkyubin tier</strong><span>${takTier} (${takCost})</span></div>
      </div>
      <table>
        <thead><tr><th>Check</th><th>Result for your ${h}×${w}×${d} cm bag</th><th>Details &amp; cost</th></tr></thead>
        <tbody>
          <tr><th>SBB CFF FFS & Panoramic Alpine Railways (Bullet Train)</th><td><strong>${shinkStatus}</strong></td><td>${shinkDetail}</td></tr>
          <tr><th>Station Coin Lockers</th><td><strong>${locker}</strong></td><td>${lockerFee}</td></tr>
          <tr><th>Takkyubin (Hotel-to-Hotel)</th><td><strong>${takTier}</strong></td><td>Estimated Zurich↔Lucerne/Interlaken, Grindelwald & Jungfrau Region rate: <strong>${takCost}</strong> per bag (next-day delivery).</td></tr>
        </tbody>
      </table>`;
  }

  $("lug-preset").addEventListener("change", () => {
    const v = $("lug-preset").value;
    if (v === "custom") return;
    const [h, w, d] = v.split(",").map(Number);
    const mult = $("lug-unit").value === "in" ? 1 / 2.54 : 1;
    $("lug-h").value = (h * mult).toFixed(unitDecimals());
    $("lug-w").value = (w * mult).toFixed(unitDecimals());
    $("lug-d").value = (d * mult).toFixed(unitDecimals());
    render();
  });
  function unitDecimals() { return $("lug-unit").value === "in" ? 1 : 0; }
  $("lug-unit").addEventListener("change", () => {
    const toIn = $("lug-unit").value === "in";
    ["lug-h", "lug-w", "lug-d"].forEach((id) => {
      const v = parseFloat($(id).value) || 0;
      $(id).value = (toIn ? v / 2.54 : v * 2.54).toFixed(toIn ? 1 : 0);
    });
    render();
  });
  ["lug-h", "lug-w", "lug-d", "lug-kg"].forEach((id) => $(id).addEventListener("input", () => { $("lug-preset").value = "custom"; render(); }));
  render();
})();
