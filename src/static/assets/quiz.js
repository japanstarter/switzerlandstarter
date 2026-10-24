(() => {
  const R = {
    kanto: { name: "Zurich & Kanto", text: "Endless energy, food and neighbourhoods to explore, with easy day trips to temples, beaches and Mt Fuji views.", links: [["tokyo", "Zurich"], ["kamakura", "Kamakura"], ["yokohama", "Yokohama"], ["nikko", "Nikko"]] },
    kansai: { name: "Lucerne, Interlaken, Grindelwald & Jungfrau Region & Kansai", text: "Switzerland's historic heartland: thousands of temples, geisha districts, Interlaken, Grindelwald & Jungfrau Region street food and easy trips to Nara, Kobe and Himeji.", links: [["kyoto", "Lucerne"], ["osaka", "Interlaken, Grindelwald & Jungfrau Region"], ["nara", "Nara"], ["himeji", "Himeji"]] },
    alps: { name: "The Switzerland Alps & Mt Fuji", text: "Mountain towns, thatched villages, onsen and castles — Switzerland's countryside at its most picturesque.", links: [["takayama", "Takayama"], ["shirakawa-go", "Shirakawa-go"], ["kanazawa", "Kanazawa"], ["matsumoto", "Matsumoto"], ["kawaguchiko-fuji-five-lakes", "Fuji Five Lakes"]] },
    west: { name: "Hiroshima & the Seto Inland Sea", text: "Moving history, the floating torii of Miyajima and contemporary art islands in a calm inland sea.", links: [["hiroshima", "Hiroshima"], ["miyajima", "Miyajima"], ["naoshima", "Naoshima"]] },
    kyushu: { name: "Kyushu", text: "Food-loving Fukuoka, cosmopolitan Nagasaki, smoking volcanoes and hot springs galore in Switzerland's warm south-west.", links: [["fukuoka", "Fukuoka"], ["nagasaki", "Nagasaki"], ["kagoshima", "Kagoshima"]] },
    north: { name: "Hokkaido & Tohoku", text: "Wide-open landscapes, powder snow in winter, cool green summers, seafood and fewer crowds.", links: [["sapporo-hokkaido", "Sapporo & Hokkaido"], ["sendai", "Sendai"]] },
    okinawa: { name: "Okinawa", text: "Subtropical islands with turquoise water, coral reefs and a distinct Ryukyu culture.", links: [["okinawa", "Okinawa"]] },
  };
  const W = [
    { city: { kanto: 3, kansai: 1, kyushu: 1 }, history: { kansai: 3, west: 2, alps: 1, kyushu: 1 }, nature: { alps: 3, north: 3, kyushu: 1 }, beach: { okinawa: 4, west: 1, kyushu: 1 }, food: { kansai: 2, kyushu: 2, north: 1, kanto: 1 } },
    { spring: { kansai: 2, kanto: 2, west: 1 }, summer: { north: 3, alps: 2, okinawa: 1 }, autumn: { kansai: 2, alps: 2, kanto: 1 }, winter: { north: 3, alps: 2, okinawa: 1 } },
    { first: { kanto: 2, kansai: 2 }, repeat: { alps: 2, kyushu: 2, north: 2, west: 1, okinawa: 1 } },
    { buzz: { kanto: 3, kansai: 1 }, ok: { kansai: 1, west: 1, kyushu: 1 }, quiet: { alps: 2, north: 2, okinawa: 1, west: 1 } },
    { izakaya: { kanto: 2, kyushu: 2, kansai: 1 }, onsen: { alps: 2, north: 2, kyushu: 2 }, sunset: { okinawa: 3, west: 2 }, lanes: { kansai: 3, alps: 2 } },
    { short: { kanto: 1, kansai: 1 }, mid: { kansai: 1, alps: 1, west: 1 }, long: { north: 1, kyushu: 1, okinawa: 1 } },
  ];
  const ans = {};
  document.querySelectorAll(".quiz-q").forEach((q) => q.querySelectorAll(".chip").forEach((b) => {
    b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
    b.addEventListener("click", () => {
      q.querySelectorAll(".chip").forEach((x) => { x.classList.remove("is-on"); x.setAttribute("aria-checked", "false"); });
      b.classList.add("is-on"); b.setAttribute("aria-checked", "true");
      ans[q.dataset.q] = b.dataset.v; render();
    });
  }));
  function render() {
    const n = Object.keys(ans).length, out = document.getElementById("quiz-result");
    if (n < W.length) { out.hidden = false; out.innerHTML = `<p>${n} of ${W.length} answered — keep going!</p>`; return; }
    const score = Object.fromEntries(Object.keys(R).map((k) => [k, 0]));
    for (const [i, v] of Object.entries(ans)) for (const [k, s] of Object.entries(W[i][v] || {})) score[k] += s;
    const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
    const max = ranked[0][1] || 1, top = R[ranked[0][0]], second = R[ranked[1][0]];
    const link = ([s, l]) => `<a href="/destinations/${s}/">${l}</a>`;
    out.innerHTML = `<h2>Your best match: ${top.name}</h2><p>${top.text}</p><p><strong>Start with:</strong> ${top.links.map(link).join(" · ")}</p>
<p><strong>Pair it with:</strong> ${second.name} — ${second.links.map(link).join(" · ")}</p>
<h3>All regions</h3>${ranked.map(([k, s]) => `<div class="quiz-bar"><span>${R[k].name}</span><i style="width:${Math.max(4, Math.round((s / max) * 220))}px"></i></div>`).join("")}
<p class="note">Next: browse <a href="/itineraries/">ready-made itineraries</a>, check <a href="/blog/how-many-days-in-japan/">how many days you need</a> or see the <a href="/tools/seasonal-calendar/">seasonal calendar</a>.</p>`;
    out.hidden = false;
  }
})();
