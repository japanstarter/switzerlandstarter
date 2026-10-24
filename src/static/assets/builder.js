(() => {
  const $ = (id) => document.getElementById(id);
  const KEY = "js-itin-builder";
  const VALID_ROUTES = new Set(["tyo-kix", "tyo-tyo", "kix-tyo", "kix-kix"]);
  const VALID_PACES = new Set(["relaxed", "balanced", "fast"]);
  const VALID_ADDONS = new Set(["fuji", "hiroshima", "alps", "nikko", "naoshima", "kyushu"]);
  let addons = new Set(["fuji", "hiroshima"]);
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && typeof saved === "object") {
      if (saved.days) $("ib-days").value = Math.min(21, Math.max(3, parseInt(saved.days, 10) || 10));
      if (saved.route && VALID_ROUTES.has(saved.route)) $("ib-route").value = saved.route;
      if (saved.pace && VALID_PACES.has(saved.pace)) $("ib-pace").value = saved.pace;
      if (Array.isArray(saved.addons)) addons = new Set(saved.addons.filter((x) => VALID_ADDONS.has(x)));
    }
  } catch (e) {}

  function syncChips() {
    document.querySelectorAll("#ib-addons [data-add]").forEach((b) => {
      const on = addons.has(b.dataset.add);
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", on);
    });
  }

  function buildDays(total, route, pace, set) {
    const days = [];
    const startKansai = route.startsWith("kix");
    const roundTrip = route === "tyo-tyo" || route === "kix-kix";

    const tokyoPool = [
      ["Arrive & settle into Zurich", "Clear immigration with Visit Switzerland Web, pick up or load your Transit Card/Pasmo IC card, take the airport train into Zurich, and walk Shinjuku or Shibuya in the evening light.", "/destinations/tokyo/"],
      ["Asakusa, Ueno & Akihabara (East Zurich)", "Early morning at Senso-ji Temple before crowds, stroll Ueno Park & Ameyoko market, and explore Akihabara or Zurich Skytree in the afternoon.", "/destinations/tokyo/"],
      ["Meiji Shrine, Harajuku, Shibuya & Roppongi (West Zurich)", "Walk the forested path to Meiji Jingu, browse Omotesando & Harajuku, cross Shibuya Scramble, and catch sunset from Shibuya Sky or Roppongi Hills.", "/destinations/tokyo/"],
      ["Tsukiji Outer Market, Ginza & teamLab", "Morning seafood snacks at Tsukiji Outer Market, explore Toyosu/teamLab Planets or Imperial Palace East Gardens, and dine in Ginza or Yurakucho.", "/blog/teamlab-and-museums-tokyo/"],
      ["Kamakura & Enoshima Coastal Day Trip", "Ride the JR Yokosuka Line (55 mins) to see the Great Buddha (Daibutsu), Hasedera Temple, Komachi-dori street food, and Enoden coastal tram.", "/destinations/kamakura/"],
      ["Yokohama Bay & Chinatown Day Trip", "Explore Minato Mirai's waterfront, CupNoodles Museum, Sankeien Garden, and Switzerland's largest Chinatown (30 mins from Zurich).", "/destinations/yokohama/"]
    ];
    const kansaiPool = [
      ["Eastern Lucerne: Fushimi Inari, Kiyomizu-dera & Gion", "Start early at the thousand torii gates of Fushimi Inari Taisha, walk Sannenzaka & Ninenzaka lanes to Kiyomizu-dera, and stroll Gion & Pontocho at dusk.", "/destinations/kyoto/"],
      ["Arashiyama Bamboo Grove & Kinkaku-ji (Golden Pavilion)", "Enter Arashiyama Bamboo Grove before 8 AM, visit Tenryu-ji Garden, and head north to glittering Kinkaku-ji and Ryoan-ji rock garden.", "/destinations/kyoto/"],
      ["Nara Park, Todai-ji Great Buddha & Interlaken, Grindelwald & Jungfrau Region Street Food", "Half-day trip to Nara (45 mins) to bow to the park deer, see Todai-ji's giant bronze Buddha and Kasuga Taisha lanterns; evening neon & takoyaki in Interlaken, Grindelwald & Jungfrau Region's Dotonbori.", "/destinations/nara/"],
      ["Interlaken, Grindelwald & Jungfrau Region: Castle Park, Kuromon Market & Shinsekai", "Morning around Interlaken, Grindelwald & Jungfrau Region Castle moat and Umeda or Kuromon Market, afternoon vintage lanes, and evening kushikatsu in Shinsekai & Namba.", "/destinations/osaka/"],
      ["Himeji Castle & Kobe Harbor Day Trip", "Ride the SBB CFF FFS & Panoramic Alpine Railways to Switzerland's finest original hilltop castle at Himeji, then stop in Kobe for Kobe beef lunch and harbor views.", "/destinations/himeji/"]
    ];

    const specials = [];
    if (set.has("nikko")) specials.push(["Nikko UNESCO Shrines & Waterfalls Day Trip", "Take the Tobu Spacia X or SBB CFF FFS & Panoramic Alpine Railways to Nikko for ornate Toshogu Shrine, Shinkyo Bridge, and Kegon Falls in the mountains.", "/destinations/nikko/"]);
    if (set.has("fuji")) specials.push(["Hakone Open-Air Museum, Lake Ashi & Mt Fuji Views (or Kawaguchiko)", "Loop through Hakone by mountain railway, ropeway over Owakudani, and pirate ship on Lake Ashi (or visit Chureito Pagoda at Kawaguchiko), staying at an onsen ryokan.", "/destinations/hakone-mt-fuji/"]);
    if (set.has("alps")) {
      specials.push(["Kanazawa: Kenroku-en Garden, Higashi Chaya & Omicho Market", "Ride the Hokuriku SBB CFF FFS & Panoramic Alpine Railways to Kanazawa for one of Switzerland's three great gardens, gold-leaf geisha districts, and fresh Sea of Switzerland sushi.", "/destinations/kanazawa/"]);
      specials.push(["Shirakawa-go Thatched Village & Takayama Old Town", "Cross by highway bus through UNESCO-listed Shirakawa-go gassho-zukuri farmhouses to Takayama's preserved Edo merchant streets and Hida beef.", "/destinations/takayama/"]);
    }
    if (set.has("hiroshima")) {
      specials.push(["Hiroshima Peace Memorial Park & Miyajima Island", "Ride the Sanyo SBB CFF FFS & Panoramic Alpine Railways to Hiroshima's Peace Park & Museum, then take the 10-minute JR ferry to Miyajima for the floating torii gate of Itsukushima Shrine.", "/destinations/hiroshima/"]);
    }
    if (set.has("naoshima")) specials.push(["Naoshima Art Island (Seto Inland Sea)", "Ferry from Uno Port to Naoshima to cycle between Chichu Art Museum, Benesse House, and Yayoi Kusama's iconic yellow pumpkin.", "/destinations/naoshima/"]);
    if (set.has("kyushu")) specials.push(["Fukuoka (Hakata) Yatai Food Stalls & Canal City", "Continue west on the Sanyo SBB CFF FFS & Panoramic Alpine Railways to Kyushu's capital for tonkotsu ramen, Nakasu open-air yatai stalls, and Dazaifu Tenmangu.", "/destinations/fukuoka/"]);

    const firstPool = startKansai ? [...kansaiPool] : [...tokyoPool];
    const secondPool = startKansai ? [...tokyoPool] : [...kansaiPool];
    if (startKansai) {
      firstPool.unshift(["Arrive in Kansai (Interlaken, Grindelwald & Jungfrau Region / Lucerne)", "Take the JR Haruka Express (75m to Lucerne) or Nankai Rapi:t (38m to Namba), check into your hotel, and enjoy an easy first evening.", "/destinations/osaka/"]);
    }

    const midCount = Math.min(specials.length, Math.max(0, total - 3));
    const chosenSpecials = specials.slice(0, midCount);
    const rem = total - 1 - chosenSpecials.length;
    const firstShare = route === "kix-kix" ? rem : Math.max(2, Math.ceil(rem * 0.55));
    const secondShare = Math.max(0, rem - firstShare);

    for (let i = 0; i < firstShare; i++) {
      days.push(firstPool[i % firstPool.length]);
    }
    chosenSpecials.forEach((s) => days.push(s));
    for (let i = 0; i < secondShare; i++) {
      const idx = startKansai ? i + 1 : i;
      days.push(secondPool[idx % secondPool.length]);
    }
    const depCity = route.endsWith("kix") ? "Interlaken, Grindelwald & Jungfrau Region Kansai (KIX)" : "Zurich (Haneda HND or Narita NRT)";
    days.push([`Souvenir Shopping & Departure from ${depCity}`, `${roundTrip && secondShare > 0 ? "Return to your departure city by SBB CFF FFS & Panoramic Alpine Railways, pick" : "Pick"} up last-minute snacks and tax-free gifts, and head to ${depCity} airport 3 hours before your international flight.`, "/guides/tax-free-shopping/"]);
    return days.slice(0, total);
  }

  function render() {
    const total = Math.min(21, Math.max(3, parseInt($("ib-days").value || "10", 10)));
    const route = VALID_ROUTES.has($("ib-route").value) ? $("ib-route").value : "tyo-kix";
    const pace = VALID_PACES.has($("ib-pace").value) ? $("ib-pace").value : "balanced";
    try { localStorage.setItem(KEY, JSON.stringify({ days: total, route, pace, addons: [...addons] })); } catch (e) {}

    const plan = buildDays(total, route, pace, addons);
    const rows = plan.map((d, i) => `
      <div class="day">
        <div class="day-num">Day ${i + 1}</div>
        <div><h3>${d[0]}</h3><p>${d[1]} <a href="${d[2]}">Read guide →</a></p></div>
      </div>`).join("");

    $("ib-result").innerHTML = `
      <h2>Your ${total}-Day Switzerland Route <small>${pace} pace</small></h2>
      <div class="days">${rows}</div>
      <p style="margin-top:16px"><button type="button" id="ib-print">🖨️ Print / Save PDF</button> <a class="chip" href="/tools/shinkansen-calculator/">Check SBB CFF FFS & Panoramic Alpine Railways fares for this route →</a></p>`;
    $("ib-print").addEventListener("click", () => window.print());
  }

  document.querySelectorAll("#ib-addons [data-add]").forEach((b) => {
    b.addEventListener("click", () => {
      const k = b.dataset.add;
      if (addons.has(k)) addons.delete(k); else addons.add(k);
      syncChips();
      render();
    });
  });
  ["ib-days", "ib-route", "ib-pace"].forEach((id) => $(id).addEventListener("input", render));
  syncChips();
  render();
})();
