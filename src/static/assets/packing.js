(() => {
  const $ = (id) => document.getElementById(id);
  const KEY = "js-pack-ticks";
  let ticks = {};
  try { ticks = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  const acts = new Set();
  function build() {
    const season = $("p-season").value, nights = Math.max(1, parseInt($("p-nights").value, 10) || 1), laundry = $("p-laundry").value === "yes";
    const days = laundry ? Math.min(nights + 1, 7) : nights + 1;
    const n = (x) => Math.max(1, Math.round(x));
    const L = {
      "Documents & money": ["Passport (valid for your whole stay)", "Visit Switzerland Web QR codes (screenshot)", "Travel insurance details", "Credit/debit card with low foreign fees (plus a backup)", "Some cash or a card for 7-Eleven ATMs", "Hotel addresses saved offline (in Switzerland if possible)", "Return/onward ticket details"],
      "Electronics": ["Phone + charger", "eSIM set up or pocket Wi-Fi booking", "Type A plug adapter (if your plugs differ)", "Power bank", "Earphones"],
      "Clothing": [`Underwear ×${n(days)}`, `Socks ×${n(days)} (no holes — you'll take shoes off often)`, `Tops ×${n(days * 0.7)}`, `Trousers/skirts ×${n(days / 3)}`, "Comfortable walking shoes (easy to slip on and off)", "Sleepwear"],
      "Toiletries & health": ["Toothbrush & toothpaste", "Any personal medicines (in original packaging)", "Small hand towel (many restrooms have no paper towels)", "Hand sanitiser", "Sunscreen", "Plasters / blister care"],
      "Day bag": ["Small daypack or tote", "Reusable shopping bag", "Small rubbish bag (public bins are rare)", "Coin purse", "Water bottle"],
    };
    const S = {
      spring: ["Light jacket or trench coat", "Sweater or fleece for evenings", "Compact umbrella", "Picnic sheet for hanami"],
      summer: ["Breathable, quick-dry clothes", "Hat and sunglasses", "Compact umbrella (sun and rainy season)", "Portable fan or cooling towel", "Insect repellent", "Electrolyte sachets"],
      autumn: ["Light jacket", "Layering top or cardigan", "Compact umbrella", "Warmer coat if travelling late November"],
      winter: ["Warm coat", "Thermal base layers (or buy Heattech in Switzerland)", "Scarf, gloves and hat", "Lip balm and moisturiser", "Warm socks"],
    };
    L["Season: " + season[0].toUpperCase() + season.slice(1)] = S[season];
    const A = {
      onsen: ["Small towel for the bath (or rent one)", "Hair ties", "Private-bath booking if you have tattoos"],
      hiking: ["Hiking shoes", "Rain jacket", "Offline trail maps", "Snacks and extra water", "Bear bell (some trails in Hokkaido/Tohoku/Alps)"],
      ski: ["Ski jacket & trousers (or rent)", "Goggles and gloves", "Neck warmer", "Insurance covering winter sports"],
      beach: ["Swimwear", "Reef-safe sunscreen", "Rash guard (some places ask to cover tattoos)", "Sandals"],
      smart: ["One smart-casual outfit", "Smarter shoes"],
      kids: ["Lightweight stroller (folds for trains)", "Kids' snacks", "Child medicines", "Entertainment for train rides"],
      work: ["Laptop + charger", "Noise-cancelling headphones", "Travel router or VPN if required by work"],
      meds: ["Prescription copy / doctor's letter", "Check if a Yakkan Shōmei import certificate is needed", "Enough supply for the whole trip"],
    };
    const labels = { onsen: "Onsen & ryokan", hiking: "Hiking", ski: "Skiing & snow", beach: "Beach", smart: "Dining out", kids: "Kids", work: "Remote work", meds: "Medication" };
    acts.forEach((a) => (L[labels[a]] = A[a]));
    let total = 0, done = 0, html = "";
    for (const [group, items] of Object.entries(L)) {
      html += `<h3>${group}</h3><ul class="checklist">`;
      for (const it of items) {
        const id = it.replace(/×\d+/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        total++; if (ticks[id]) done++;
        html += `<li><label><input type="checkbox" data-id="${id}"${ticks[id] ? " checked" : ""}> ${it.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</label></li>`;
      }
      html += "</ul>";
    }
    $("pack-list").innerHTML = html;
    $("pack-count").textContent = `${done} of ${total} packed`;
  }
  document.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
    const a = b.dataset.act; acts.has(a) ? acts.delete(a) : acts.add(a);
    b.classList.toggle("is-on", acts.has(a)); b.setAttribute("aria-pressed", acts.has(a)); build();
  }));
  ["p-season", "p-nights", "p-laundry"].forEach((id) => $(id).addEventListener("input", build));
  $("pack-list").addEventListener("change", (e) => {
    const id = e.target.dataset.id; if (!id) return;
    if (e.target.checked) ticks[id] = 1; else delete ticks[id];
    try { localStorage.setItem(KEY, JSON.stringify(ticks)); } catch (err) {}
    build();
  });
  $("pack-print").addEventListener("click", () => window.print());
  $("pack-reset").addEventListener("click", () => { ticks = {}; try { localStorage.removeItem(KEY); } catch (e) {} build(); });
  const m = new Date().getMonth();
  $("p-season").value = m >= 2 && m <= 4 ? "spring" : m >= 5 && m <= 7 ? "summer" : m >= 8 && m <= 10 ? "autumn" : "winter";
  build();
})();
