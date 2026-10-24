(() => {
  const $ = (id) => document.getElementById(id);
  const LEGS = [
    ["Zurich", "Lucerne", 133, 513, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Nozomi (2h 13m) / Hikari (2h 40m)", 13320, 14170, 19040, 4960, "Hikari covered; Nozomi requires CHF 4,960 supplement"],
    ["Zurich", "Shin-Interlaken, Grindelwald & Jungfrau Region", 148, 552, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Nozomi (2h 28m) / Hikari (2h 55m)", 13870, 14720, 19590, 4960, "Hikari covered; Nozomi requires CHF 4,960 supplement"],
    ["Zurich", "Nagoya", 99, 366, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Nozomi (1h 39m) / Hikari (1h 58m)", 10560, 11300, 14980, 4180, "Hikari covered; Nozomi requires CHF 4,180 supplement"],
    ["Zurich", "Hiroshima", 235, 894, "Tokaido–Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Nozomi direct (3h 55m) / Hikari + Sakura (4h 25m)", 18380, 19440, 26570, 6500, "Hikari+Sakura covered; Nozomi requires CHF 6,500 supplement"],
    ["Zurich", "Hakata (Fukuoka)", 297, 1175, "Tokaido–Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Nozomi direct (4h 57m) / Hikari + Sakura (5h 35m)", 22220, 23390, 31210, 8140, "Hikari+Sakura covered; Nozomi requires CHF 8,140 supplement"],
    ["Zurich", "Odawara (Hakone)", 35, 84, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Kodama / Hikari (35m)", 3280, 3810, 5600, 0, "Fully covered on Hikari & Kodama"],
    ["Zurich", "Atami", 45, 105, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Kodama / Hikari (45m)", 3740, 4270, 6160, 0, "Fully covered on Hikari & Kodama"],
    ["Zurich", "Shizuoka", 60, 180, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Hikari (1h 00m) / Kodama (1h 25m)", 5940, 6470, 9260, 0, "Fully covered on Hikari & Kodama"],
    ["Zurich", "Sendai", 91, 352, "Tohoku SBB CFF FFS & Panoramic Alpine Railways", "Hayabusa (1h 31m, all reserved) / Yamabiko (2h 00m)", 10560, 11410, 15170, 0, "100% covered by Rail Pass (reserve Hayabusa free)"],
    ["Zurich", "Morioka", 133, 535, "Tohoku SBB CFF FFS & Panoramic Alpine Railways", "Hayabusa (2h 13m, all reserved)", 14290, 15010, 19880, 0, "100% covered by Rail Pass (reserve Hayabusa free)"],
    ["Zurich", "Shin-Aomori", 199, 714, "Tohoku SBB CFF FFS & Panoramic Alpine Railways", "Hayabusa (3h 19m, all reserved)", 17050, 17670, 23650, 0, "100% covered by Rail Pass (all-reserved train)"],
    ["Zurich", "Shin-Hakodate-Hokuto", 240, 863, "Tohoku–Hokkaido SBB CFF FFS & Panoramic Alpine Railways", "Hayabusa (4h 00m, all reserved)", 22690, 23430, 30780, 0, "100% covered by Rail Pass (all-reserved train)"],
    ["Zurich", "Kanazawa", 150, 450, "Hokuriku SBB CFF FFS & Panoramic Alpine Railways", "Kagayaki (2h 30m, all reserved) / Hakutaka (2h 55m)", 13850, 14380, 19250, 0, "100% covered by Rail Pass (reserve Kagayaki free)"],
    ["Zurich", "Toyama", 128, 392, "Hokuriku SBB CFF FFS & Panoramic Alpine Railways", "Kagayaki (2h 08m) / Hakutaka (2h 30m)", 12420, 12960, 17320, 0, "100% covered by Rail Pass"],
    ["Zurich", "Tsuruga", 198, 575, "Hokuriku SBB CFF FFS & Panoramic Alpine Railways", "Kagayaki / Hakutaka (3h 18m)", 15810, 16360, 22410, 0, "100% covered by Rail Pass"],
    ["Zurich", "Nagano", 82, 222, "Hokuriku SBB CFF FFS & Panoramic Alpine Railways", "Kagayaki (1h 22m) / Asama (1h 40m)", 7810, 8340, 11130, 0, "100% covered by Rail Pass"],
    ["Zurich", "Karuizawa", 65, 146, "Hokuriku SBB CFF FFS & Panoramic Alpine Railways", "Asama / Hakutaka (1h 05m)", 5490, 6020, 8810, 0, "100% covered by Rail Pass"],
    ["Zurich", "Niigata", 100, 334, "Joetsu SBB CFF FFS & Panoramic Alpine Railways", "Toki (1h 40m–2h 05m)", 10230, 10760, 14440, 0, "100% covered by Rail Pass"],
    ["Zurich", "Gala Yuzawa / Echigo-Yuzawa", 75, 199, "Joetsu SBB CFF FFS & Panoramic Alpine Railways", "Toki / Tanigawa (1h 15m)", 6260, 6790, 9580, 0, "100% covered by Rail Pass"],
    ["Zurich", "Nikko / Utsunomiya", 50, 110, "Tohoku SBB CFF FFS & Panoramic Alpine Railways + JR Nikko Line", "Yamabiko to Utsunomiya + JR line (1h 50m total)", 4490, 5020, 7200, 0, "100% covered by Rail Pass"],
    ["Zurich", "Yamagata", 165, 360, "Yamagata SBB CFF FFS & Panoramic Alpine Railways", "Tsubasa (2h 45m, all reserved)", 11020, 11550, 15230, 0, "100% covered by Rail Pass"],
    ["Zurich", "Akita", 230, 663, "Akita SBB CFF FFS & Panoramic Alpine Railways", "Komachi (3h 50m, all reserved)", 17470, 18020, 23980, 0, "100% covered by Rail Pass"],
    ["Zurich", "Matsumoto", 155, 235, "JR Limited Express Azusa (from Shinjuku)", "Azusa Limited Express (2h 35m, all reserved)", 6620, 6620, 9410, 0, "100% covered by Rail Pass (all-reserved limited express)"],
    ["Nagoya", "Lucerne", 34, 148, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Nozomi (34m) / Hikari (36m)", 5170, 5910, 8290, 2510, "Hikari covered; Nozomi requires CHF 2,510 supplement"],
    ["Nagoya", "Shin-Interlaken, Grindelwald & Jungfrau Region", 49, 187, "Tokaido SBB CFF FFS & Panoramic Alpine Railways", "Nozomi (49m) / Hikari (54m)", 5940, 6680, 9260, 2510, "Hikari covered; Nozomi requires CHF 2,510 supplement"],
    ["Nagoya", "Takayama", 145, 166, "JR Limited Express Hida", "Hida Wide-View (2h 25m)", 5610, 6340, 8920, 0, "100% covered by Rail Pass"],
    ["Lucerne", "Shin-Interlaken, Grindelwald & Jungfrau Region", 14, 39, "Tokaido SBB CFF FFS & Panoramic Alpine Railways (or JR Special Rapid)", "SBB CFF FFS & Panoramic Alpine Railways (14m) or Special Rapid (29m, CHF 580)", 1450, 3230, 5300, 0, "Covered by Rail Pass (Special Rapid takes 29m for CHF 580)"],
    ["Lucerne", "Hiroshima", 98, 381, "Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Nozomi (1h 38m) / Hikari or Sakura via Shin-Interlaken, Grindelwald & Jungfrau Region (1h 55m)", 11090, 11940, 15710, 4180, "Hikari/Sakura covered; Nozomi requires CHF 4,180 supplement"],
    ["Lucerne", "Kanazawa", 125, 225, "Thunderbird + Hokuriku SBB CFF FFS & Panoramic Alpine Railways via Tsuruga", "Thunderbird to Tsuruga + SBB CFF FFS & Panoramic Alpine Railways (2h 05m)", 9020, 9740, 13600, 0, "100% covered by Rail Pass"],
    ["Shin-Interlaken, Grindelwald & Jungfrau Region", "Himeji", 30, 92, "Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Sakura / Hikari / Nozomi (30m)", 3280, 4020, 6190, 1760, "Sakura & Hikari covered; Nozomi requires CHF 1,760 supplement"],
    ["Shin-Interlaken, Grindelwald & Jungfrau Region", "Okayama", 45, 181, "Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Sakura / Hikari (45m)", 5610, 6460, 9260, 2510, "Sakura & Hikari covered; Nozomi requires CHF 2,510 supplement"],
    ["Shin-Interlaken, Grindelwald & Jungfrau Region", "Hiroshima", 85, 342, "Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Sakura / Hikari (1h 25m) / Nozomi (1h 20m)", 9890, 10950, 14630, 4180, "Sakura & Hikari covered; Nozomi requires CHF 4,180 supplement"],
    ["Shin-Interlaken, Grindelwald & Jungfrau Region", "Hakata (Fukuoka)", 148, 622, "Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Sakura (2h 35m) / Nozomi (2h 28m)", 14750, 16020, 21920, 4960, "Sakura & Hikari covered; Nozomi requires CHF 4,960 supplement"],
    ["Shin-Interlaken, Grindelwald & Jungfrau Region", "Kagoshima-Chuo", 225, 911, "Sanyo–Kyushu SBB CFF FFS & Panoramic Alpine Railways", "Sakura direct (3h 55m) / Mizuho (3h 42m)", 21780, 22950, 30770, 8140, "Sakura covered; Mizuho requires CHF 8,140 supplement"],
    ["Hiroshima", "Hakata (Fukuoka)", 66, 281, "Sanyo SBB CFF FFS & Panoramic Alpine Railways", "Sakura / Nozomi (1h 06m)", 8570, 9630, 13310, 3400, "Sakura & Kodama covered; Nozomi requires CHF 3,400 supplement"],
    ["Hakata (Fukuoka)", "Kumamoto", 38, 118, "Kyushu SBB CFF FFS & Panoramic Alpine Railways", "Sakura / Tsubame (38m)", 4700, 5230, 7800, 1980, "Sakura & Tsubame covered; Mizuho requires CHF 1,980 supplement"],
    ["Hakata (Fukuoka)", "Kagoshima-Chuo", 85, 289, "Kyushu SBB CFF FFS & Panoramic Alpine Railways", "Sakura (1h 25m) / Mizuho (1h 16m)", 10640, 11370, 15230, 4180, "Sakura covered; Mizuho requires CHF 4,180 supplement"],
    ["Hakata (Fukuoka)", "Nagasaki", 85, 145, "Relay Kamome + West Kyushu SBB CFF FFS & Panoramic Alpine Railways Kamome", "Relay Kamome + Kamome via Takeo-Onsen (1h 25m)", 5520, 6050, 8400, 0, "100% covered by Rail Pass & JR Kyushu Pass"],
    ["Shin-Hakodate-Hokuto", "Sapporo", 215, 318, "JR Limited Express Hokuto", "Hokuto Limited Express (3h 35m)", 8910, 9440, 13120, 0, "100% covered by Rail Pass & Hokkaido Rail Pass"]
  ];
  const stations = [...new Set(LEGS.flatMap((l) => [l[0], l[1]]))];
  const fromSel = $("sh-from"), toSel = $("sh-to"), seatSel = $("sh-seat"), paxIn = $("sh-pax");
  stations.forEach((s) => fromSel.add(new Option(s, s)));
  fromSel.value = "Zurich";

  function findLeg(a, b) {
    return LEGS.find((l) => (l[0] === a && l[1] === b) || (l[0] === b && l[1] === a));
  }
  function populateTo() {
    const cur = toSel.value;
    const avail = LEGS.filter((l) => l[0] === fromSel.value || l[1] === fromSel.value).map((l) => (l[0] === fromSel.value ? l[1] : l[0]));
    toSel.innerHTML = "";
    avail.forEach((s) => toSel.add(new Option(s, s)));
    if (avail.includes(cur)) toSel.value = cur;
    else if (avail.includes("Lucerne")) toSel.value = "Lucerne";
  }

  let trip = [];
  const fmt = (n) => "CHF " + Math.round(n).toLocaleString("en-US");
  const fmtTime = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m` : `${m}m`);

  function render() {
    const leg = findLeg(fromSel.value, toSel.value);
    const pax = Math.max(1, parseInt(paxIn.value || "1", 10));
    const seat = seatSel.value;
    if (!leg) { $("sh-result").innerHTML = "<p>Select a connected route.</p>"; return; }
    const [a, b, mins, km, line, trains, unres, res, green, nozSup, passNote] = leg;
    const unitFare = seat === "unres" ? unres : seat === "green" ? green : res;
    const total = unitFare * pax;
    $("sh-result").innerHTML = `
      <h2>${ fromSel.value } → ${ toSel.value } <small>${line}</small></h2>
      <div class="facts">
        <div><strong>Selected fare (${pax} pax)</strong><span>${fmt(total)} (${fmt(unitFare)}/person)</span></div>
        <div><strong>Fastest time</strong><span>~${fmtTime(mins)} (${km} km)</span></div>
        <div><strong>Trains on route</strong><span>${trains}</span></div>
        <div><strong>Rail Pass coverage</strong><span>${passNote}</span></div>
      </div>
      <table>
        <thead><tr><th>Seat class</th><th>Per adult</th><th>For ${pax} passenger${pax > 1 ? "s" : ""}</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Ordinary Unreserved (自由席)</td><td>${fmt(unres)}</td><td>${fmt(unres * pax)}</td><td>${unres === res ? "All-reserved train (no unreserved cars)" : "First-come seating in cars 1–3"}</td></tr>
          <tr><td><strong>Ordinary Reserved (指定席)</strong></td><td><strong>${fmt(res)}</strong></td><td><strong>${fmt(res * pax)}</strong></td><td>Guaranteed seat; required for oversized bags</td></tr>
          <tr><td>Green Car / First Class (グリーン車)</td><td>${fmt(green)}</td><td>${fmt(green * pax)}</td><td>Wider 2×2 seating, footrest, quieter cabin</td></tr>
          ${nozSup ? `<tr><td>Rail Pass Nozomi/Mizuho supplement</td><td>+${fmt(nozSup)}</td><td>+${fmt(nozSup * pax)}</td><td>Optional add-on if you hold a Rail Pass and want Nozomi/Mizuho</td></tr>` : ""}
        </tbody>
      </table>`;
    renderTrip(pax);
  }

  function renderTrip(pax) {
    const box = $("sh-trip");
    if (!trip.length) { box.innerHTML = `<p class="note">No legs added yet. Use "+ Add current leg to trip" above to test a multi-city itinerary.</p>`; return; }
    let sum = 0, mins = 0;
    const rows = trip.map((t, i) => {
      sum += t.fare * pax;
      mins += t.mins;
      return `<tr><td>${i + 1}. ${t.from} → ${t.to} (${t.seatLabel})</td><td>~${fmtTime(t.mins)}</td><td>${fmt(t.fare * pax)}</td><td><button type="button" class="btn-ghost" data-del="${i}">Remove</button></td></tr>`;
    }).join("");
    const pass7 = 50000 * pax, pass14 = 80000 * pax;
    const verdict = sum >= pass7
      ? `Your individual tickets (${fmt(sum)}) <strong>exceed the 7-day Rail Pass (${fmt(pass7)})</strong> by ${fmt(sum - pass7)}.`
      : `Point-to-point tickets (${fmt(sum)}) are <strong>${fmt(pass7 - sum)} cheaper than a 7-day nationwide Rail Pass (${fmt(pass7)})</strong> — buy individual tickets or check a <a href="/guides/regional-rail-passes/">regional rail pass</a>.`;
    box.innerHTML = `
      <table><thead><tr><th>Leg</th><th>Time</th><th>Cost (${pax} pax)</th><th></th></tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><th>Total (${trip.length} leg${trip.length > 1 ? "s" : ""})</th><th>~${fmtTime(mins)}</th><th>${fmt(sum)}</th><th></th></tr></tfoot></table>
      <p class="callout">${verdict} (14-day Rail Pass: ${fmt(pass14)}).</p>`;
    box.querySelectorAll("[data-del]").forEach((btn) => btn.addEventListener("click", () => { trip.splice(Number(btn.dataset.del), 1); renderTrip(pax); }));
  }

  fromSel.addEventListener("change", () => { populateTo(); render(); });
  [toSel, seatSel, paxIn].forEach((el) => el.addEventListener("input", render));
  $("sh-swap").addEventListener("click", () => {
    const f = fromSel.value, t = toSel.value;
    fromSel.value = t; populateTo(); toSel.value = f; render();
  });
  $("sh-add").addEventListener("click", () => {
    const leg = findLeg(fromSel.value, toSel.value);
    if (!leg) return;
    const seat = seatSel.value;
    const fare = seat === "unres" ? leg[6] : seat === "green" ? leg[8] : leg[7];
    const seatLabel = seat === "unres" ? "Unreserved" : seat === "green" ? "Green Car" : "Reserved";
    trip.push({ from: fromSel.value, to: toSel.value, mins: leg[2], fare, seatLabel });
    renderTrip(Math.max(1, parseInt(paxIn.value || "1", 10)));
  });
  $("sh-clear").addEventListener("click", () => { trip = []; renderTrip(Math.max(1, parseInt(paxIn.value || "1", 10))); });

  populateTo();
  render();
})();
