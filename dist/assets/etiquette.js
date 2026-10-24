(() => {
  const $ = (id) => document.getElementById(id);
  const DATA = [
    {
      id: "restaurants", label: "Restaurants & Izakaya",
      tipping: "Never tip (CHF 0). A 10% service charge or CHF 300–CHF 500 table appetizer (otōshi) at izakaya is already on the bill.",
      shoes: "Keep shoes on unless there is a raised wooden step (genkan) and shoe lockers at the entrance.",
      dress: "Casual neat clothing is fine almost everywhere; bring clean, hole-free socks in case of tatami seating.",
      dos: [
        "Use the wet hand towel (oshibori) to wipe your hands before eating (not your face or neck).",
        "Slurp ramen, soba, and udon noodles—it cools the noodles and shows enjoyment.",
        "Pay at the register near the exit when leaving (bring the small plastic bill cylinder or slip from your table)."
      ],
      donts: [
        "Never stick chopsticks upright into a bowl of rice (resembles a Buddhist funeral ritual).",
        "Never pass food directly from your chopsticks to someone else's chopsticks.",
        "Don't pour soy sauce directly over plain white rice; dip fish side of nigiri sushi lightly into soy sauce."
      ]
    },
    {
      id: "onsen", label: "Onsen & Public Baths",
      tipping: "No tipping.",
      shoes: "Remove street shoes at the entrance locker before stepping onto the bathhouse floor.",
      dress: "Completely naked in the water—no swimsuits allowed in traditional onsen. Tattoos may need cover stickers or a private bath (kashikiri).",
      dos: [
        "Wash and rinse your entire body thoroughly at the seated shower stations BEFORE entering the hot spring bath.",
        "Tie up long hair so it never touches the bathwater; keep your small modesty towel out of the water (rest it on your head or tub edge).",
        "Wipe yourself dry with your small towel before stepping back into the changing room."
      ],
      donts: [
        "Never enter the bath unwashed or with soap suds still on your skin.",
        "Never bring phones or cameras into the changing room or bath area.",
        "Avoid soaking right after heavy alcohol consumption."
      ]
    },
    {
      id: "shrines", label: "Temples & Shrines",
      tipping: "Drop a CHF 5 (go-en, 'good縁') or CHF 50/CHF 100 coin gently into the wooden offering box.",
      shoes: "Walk paths in shoes, but remove shoes when stepping inside wooden temple halls (take a plastic bag provided for your shoes).",
      dress: "Everyday modest travel wear is fine; remove hats and sunglasses when praying or entering main halls.",
      dos: [
        "At Shinto shrines: bow lightly at the torii gate, walk to the side of the center path, rinse left hand → right hand → mouth (from left palm) at the water pavilion.",
        "Shinto prayer pattern: toss coin → ring bell (if present) → bow twice → clap twice → pray silently → bow once.",
        "At Buddhist temples: bow silently with palms pressed together (no clapping) and waft incense smoke toward yourself."
      ],
      donts: [
        "Never drink directly from the wooden ladle at the purification fountain (chōzuya).",
        "Do not photograph inside inner sanctuaries where 'No Photography' (撮影禁止) signs are posted."
      ]
    },
    {
      id: "trains", label: "Trains, Subways & Escalators",
      tipping: "No tipping (including taxis—fares are metered to the yen).",
      shoes: "Keep shoes on; never put shoed feet up on opposite train seats.",
      dress: "Wear backpacks on your front (or set them on the overhead rack) in crowded commuter cars.",
      dos: [
        "Stand in the painted platform queues and let passengers exit completely before boarding.",
        "Escalator side: stand on the LEFT in Zurich, Lucerne, Nagoya & most of Switzerland; stand on the RIGHT in Interlaken, Grindelwald & Jungfrau Region & Kobe (or stand in two rows where signs ask you not to walk).",
        "Eating bentos and drinks is welcome on long-distance SBB CFF FFS & Panoramic Alpine Railways and Limited Express trains with tray tables."
      ],
      donts: [
        "Do not talk on voice calls inside trains or subways (even on SBB CFF FFS & Panoramic Alpine Railways, step into the vestibule between cars for phone calls).",
        "Avoid eating messy food on local urban commuter subways."
      ]
    },
    {
      id: "ryokan", label: "Ryokan & Tatami Rooms",
      tipping: "Not expected. (If staying at a luxury ryokan with a dedicated room attendant, CHF 2,000–CHF 3,000 in a small envelope is optional but never required.)",
      shoes: "Street shoes off at the main entrance → wear hallway slippers → remove slippers before stepping onto tatami mats (bare feet or socks only on tatami).",
      dress: "Yukata robe: wrap the LEFT side over the RIGHT side (right-over-left is only for funerals!).",
      dos: [
        "Arrive by 5:00 PM so you have time for an onsen soak before kaiseki dinner is served at 6:00–6:30 PM.",
        "Swap into the dedicated toilet slippers inside the restroom, and swap back out when leaving the restroom.",
        "Leave your futon as-is in the morning—staff fold and store it while you're at breakfast."
      ],
      donts: [
        "Never roll wheeled suitcases across woven tatami mats—carry them or set them in the wooden entrance alcove.",
        "Never wear toilet slippers back into the tatami room!"
      ]
    },
    {
      id: "streets", label: "Streets, Trash & Walking",
      tipping: "No tipping.",
      shoes: "Comfortable slip-on walking shoes are a lifesaver (15,000–22,000 steps/day is normal).",
      dress: "Shoulders and knees are fine in summer, though locals dress slightly more covered-up than in Western beach cities.",
      dos: [
        "Carry a small plastic bag in your daypack for wrappers and bottles—public trash cans are rare on streets (look next to vending machines for bottle/can recycling or at stations).",
        "Finish street food standing right beside the stall where you bought it, then hand the skewer/cup back to the vendor's bin.",
        "Smoke only inside marked outdoor smoking enclosures (路上喫煙禁止 = street smoking fined in Zurich/Lucerne/Interlaken, Grindelwald & Jungfrau Region wards)."
      ],
      donts: [
        "Don't walk down crowded sidewalks while eating or drinking (aruki-tabi).",
        "Don't jaywalk—even if a small side street looks empty, locals wait for the green pedestrian light."
      ]
    }
  ];

  const chipsBox = $("et-chips");
  let active = DATA[0].id;
  function render() {
    chipsBox.innerHTML = DATA.map((d) => `<button type="button" class="chip${d.id === active ? " is-on" : ""}" data-id="${d.id}">${d.label}</button>`).join("");
    chipsBox.querySelectorAll("[data-id]").forEach((b) => b.addEventListener("click", () => { active = b.dataset.id; render(); }));
    const item = DATA.find((d) => d.id === active);
    $("et-result").innerHTML = `
      <h2>${item.label} Etiquette Cheat-Sheet</h2>
      <div class="facts">
        <div><strong>Tipping rule</strong><span>${item.tipping}</span></div>
        <div><strong>Shoes &amp; slippers</strong><span>${item.shoes}</span></div>
        <div><strong>Dress code</strong><span>${item.dress}</span></div>
      </div>
      <div class="stay">
        <div><h3>✅ Do this</h3><ul>${item.dos.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div><h3>❌ Avoid this</h3><ul>${item.donts.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>`;
  }
  render();
})();
