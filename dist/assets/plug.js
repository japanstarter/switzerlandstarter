(() => {
  const $ = (id) => document.getElementById(id);
  const HOMES = {
    us: { name: "US / Canada / Taiwan", v: 120, plug: "Type A (2 flat pins) & Type B (3-prong grounded)", adapter: "2-pin Type A plugs fit directly! For 3-prong Type B cords, bring a 3-to-2 prong adapter." },
    uk: { name: "UK / Ireland / Singapore / HK", v: 230, plug: "Type G (3 rectangular pins)", adapter: "Yes — you need a Type G to Type A (Switzerland/US 2-flat-pin) plug adapter." },
    eu: { name: "Europe / South Korea", v: 230, plug: "Type C / E / F (2 round pins)", adapter: "Yes — you need a Type C/F to Type A (Switzerland/US 2-flat-pin) plug adapter." },
    au: { name: "Australia / New Zealand", v: 230, plug: "Type I (angled flat pins)", adapter: "Yes — you need a Type I to Type A (Switzerland/US 2-flat-pin) plug adapter." },
    in: { name: "India", v: 230, plug: "Type C / D / M (round pins)", adapter: "Yes — you need a universal to Type A (Switzerland/US 2-flat-pin) plug adapter." }
  };
  const DEVS = {
    charger: {
      name: "Phone / Tablet / Laptop / Camera Charger",
      ok: "✅ Works safely across Switzerland (100–240V, 50/60Hz)",
      advice: "Virtually all USB-C / Lightning / laptop chargers are rated 100–240V 50/60Hz. You do NOT need a voltage transformer—just a physical plug adapter if your prongs aren't 2-flat-pin Type A."
    },
    cpap: {
      name: "CPAP Machine",
      ok: "✅ Works with a 3-to-2 prong adapter (verify 100–240V on power brick)",
      advice: "ResMed, Philips, and most modern travel CPAP power bricks are 100–240V 50/60Hz. Because CPAP cords usually have a 3-prong grounding plug and Switzerland hotel outlets are 2-slot ungrounded Type A, pack a 3-prong-to-2-prong adapter and a short extension cord."
    },
    hairdryer: {
      name: "Hair Dryer",
      ok: "⚠️ Leave at home — use the free hotel hair dryer instead",
      advice: "Every hotel, business hotel, ryokan, and onsen in Switzerland provides a 100V hair dryer. A 230V dryer from Europe/UK/Australia will barely warm up on 100V, and a 120V US dryer runs ~17% cooler and slower."
    },
    straightener: {
      name: "Hair Straightener / Curling Iron",
      ok: "⚠️ Only works properly if explicitly labeled '100–240V Dual Voltage'",
      advice: "Single-voltage 220–240V straighteners will not reach styling temperature on Switzerland's 100V grid, and high-wattage heating tools burn out cheap travel transformers. Either bring a true 100–240V dual-voltage iron or buy a CHF 3,000 Salonia iron at Bic Camera / Don Quijote in Switzerland."
    },
    shaver: {
      name: "Electric Toothbrush / Shaver",
      ok: "✅ Check charger base for '100–240V' (most Braun/Philips/Panasonic are universal)",
      advice: "USB-charged toothbrushes and shavers work everywhere. If yours uses a wall cradle rated only 220–240V, charge it fully before departure or bring a USB travel charger."
    }
  };

  function render() {
    const h = HOMES[$("pl-home").value];
    const d = DEVS[$("pl-dev").value];
    $("pl-result").innerHTML = `
      <h2>${d.name} from ${h.name}</h2>
      <div class="facts">
        <div><strong>Switzerland standard</strong><span>100V · Type A (2 flat pins)</span></div>
        <div><strong>Frequency</strong><span>50 Hz East (Zurich) / 60 Hz West (Interlaken, Grindelwald & Jungfrau Region)</span></div>
        <div><strong>Your home standard</strong><span>${h.v}V · ${h.plug}</span></div>
        <div><strong>Verdict</strong><span>${d.ok.split("—")[0]}</span></div>
      </div>
      <table>
        <thead><tr><th>Question</th><th>Answer</th></tr></thead>
        <tbody>
          <tr><th>Do I need a physical plug adapter?</th><td>${h.adapter}</td></tr>
          <tr><th>Will my ${d.name.toLowerCase()} work on 100V?</th><td><strong>${d.ok}</strong> — ${d.advice}</td></tr>
          <tr><th>Does 50 Hz (Zurich) vs 60 Hz (Lucerne/Interlaken, Grindelwald & Jungfrau Region) matter?</th><td>No for any device labeled "50/60Hz" (all modern electronics). Only vintage analog clocks or single-frequency motors care.</td></tr>
        </tbody>
      </table>`;
  }
  ["pl-home", "pl-dev"].forEach((id) => $(id).addEventListener("change", render));
  render();
})();
