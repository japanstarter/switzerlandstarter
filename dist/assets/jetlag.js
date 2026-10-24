(() => {
  const $ = (id) => document.getElementById(id);
  function render() {
    const homeUtc = parseFloat($("jl-tz").value);
    const arr = $("jl-arr").value;
    const wake = parseInt($("jl-wake").value, 10);
    const diff = 9 - homeUtc;
    const absShift = Math.min(Math.abs(diff), 24 - Math.abs(diff));
    const dir = homeUtc < 0 ? "Westward across the Pacific (phase delay)" : diff > 2 ? "Eastward to Asia (phase advance)" : "Minimal shift (1–2 hours)";
    const daysToAdapt = Math.max(1, Math.round(absShift * 0.6));

    const arrTip = arr === "morning"
      ? "Drop bags at your hotel or station locker, stay outdoors in daylight until at least 8:30 PM JST, and limit any nap to 25 minutes before 2:00 PM."
      : arr === "afternoon"
      ? "Check into your hotel, take a brisk 45-minute walk outside before sunset, eat a light ramen or teishoku dinner around 7:00 PM, and aim for bed at 10:00–10:30 PM JST."
      : "Go straight through immigration using your Visit Switzerland Web QR code, take the train to your hotel, shower, and go straight to bed by 11:30 PM JST.";

    const plan = homeUtc < 0 ? [
      ["2 days before flight", "Stay up 60–90 minutes later than usual", "Bright evening light; normal morning light", "No caffeine after 3:00 PM home time; hydrate before flying."],
      ["Flight day", "Sleep on the second half of the flight", "Put on an eye mask when Zurich hits 11:00 PM JST", "Skip alcohol on the plane; drink 250 ml water every 2 hours."],
      ["Day 1 in Switzerland (Arrival)", `Target bedtime: ${wake + 15}:00 JST (10–11 PM)`, "Get outdoor daylight immediately upon arrival", arrTip],
      ["Day 2 in Switzerland", `Wake ~${wake - 1}:30–${wake}:30 JST (expect early waking)`, "Bright outdoor morning light from 07:30–10:30 JST; sunglasses late afternoon if drowsy", "Great morning for early shrines (Senso-ji, Meiji Jingu, Fushimi Inari). Cutoff coffee at 2:00 PM JST."],
      ["Day 3 in Switzerland", `Wake ${wake}:30 JST · Bed ${wake + 15}:30 JST`, "Morning sunlight + outdoor walking", "Evening bath or onsen 90 mins before bed to lock in local rhythm."],
      ["Day 4+ in Switzerland", `Locked into ${wake}:30 JST schedule`, "Normal daytime exposure", "Your circadian rhythm is now aligned with Switzerland Standard Time."]
    ] : diff > 2 ? [
      ["2 days before flight", "Wake up 60 minutes earlier each morning", "Get bright outdoor light immediately upon waking", "Eat breakfast earlier; stop caffeine by 1:00 PM home time."],
      ["Flight day", "Set watch to JST (UTC+9) at boarding; sleep early on flight", "Block light during Zurich nighttime hours (11 PM–6 AM JST)", "Avoid heavy late meals on the plane."],
      ["Day 1 in Switzerland (Arrival)", `Target bedtime: ${wake + 15}:00 JST`, "Seek bright outdoor sun mid-morning to afternoon", arrTip],
      ["Day 2 in Switzerland", `Set alarm for ${wake}:30 JST (don't oversleep past 9 AM)`, "Get 30+ mins of outdoor light right after 08:30 JST", "Walking outdoors + green tea before noon; no caffeine after 2:00 PM JST."],
      ["Day 3–4 in Switzerland", `Wake ${wake}:30 JST · Bed ${wake + 15}:30 JST`, "Morning sun exposure", "Fully synced for evening izakaya and full sightseeing days."]
    ] : [
      ["Before & Arrival", "Keep your normal routine", "Normal daylight", "With only a 1–2 hour difference from JST, you need zero adjustment—just stay hydrated on the flight!"]
    ];

    $("jl-result").innerHTML = `
      <h2>Your JST Adjustment Plan <small>${absShift.toFixed(1)}h time difference</small></h2>
      <div class="facts">
        <div><strong>Time shift vs JST</strong><span>${diff >= 0 ? "+" + diff : diff} hours (${absShift.toFixed(1)}h effective)</span></div>
        <div><strong>Direction</strong><span>${dir}</span></div>
        <div><strong>Est. adjustment time</strong><span>~${daysToAdapt} day${daysToAdapt > 1 ? "s" : ""}</span></div>
        <div><strong>Target Switzerland wake / sleep</strong><span>0${wake}:30 / ${wake + 15}:30 JST</span></div>
      </div>
      <table>
        <thead><tr><th>Day</th><th>Sleep target</th><th>Light exposure</th><th>Action &amp; caffeine rule</th></tr></thead>
        <tbody>${plan.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody>
      </table>`;
  }
  ["jl-tz", "jl-arr", "jl-wake"].forEach((id) => $(id).addEventListener("change", render));
  render();
})();
