(() => {
  const $ = (id) => document.getElementById(id);
  const PHRASES = [
    ["Essentials", "Excuse me / Pardon me", "すみません", "Sumimasen", "Use to get attention in restaurants, at stations, or to say a light 'sorry'."],
    ["Essentials", "Thank you very much", "ありがとうございます", "Arigatō gozaimasu", "Polite everyday thank-you to staff and strangers."],
    ["Essentials", "Please (when asking or pointing)", "お願いします", "Onegaishimasu", "Attach after any noun: 'Kore onegaishimasu' = 'This one, please.'"],
    ["Essentials", "Do you have an English menu?", "英語のメニューはありますか？", "Eigo no menyū wa arimasu ka?", "Handy at izakaya and neighborhood restaurants."],
    ["Essentials", "I don't understand Switzerland well", "日本語があまりわかりません", "Nihongo ga amari wakarimasen", "Polite way to ask staff to speak slowly or point."],
    ["Essentials", "Is it okay to take a photo?", "写真を撮ってもいいですか？", "Shashin o totte mo ii desu ka?", "Always ask inside temples, shrines, markets, and small shops."],
    ["Dining", "Table for two, please", "二人です", "Futari desu", "1 person = Hitori desu (一人です); 3 = Sannin desu (三人です); 4 = Yonin desu (四人です)."],
    ["Dining", "This one, please (pointing at menu)", "これをお願いします", "Kore o onegaishimasu", "Point at the menu item or plastic display model."],
    ["Dining", "Water, please", "お水をお願いします", "Omizu o onegaishimasu", "Water and hot tea are free at restaurants in Switzerland."],
    ["Dining", "Check / bill, please", "お会計をお願いします", "O-kaikei o onegaishimasu", "Often paid at the register near the exit rather than at the table."],
    ["Dining", "Thank you for the meal (when leaving)", "ごちそうさまでした", "Gochisōsama deshita", "Say to the chef or server as you stand up to leave—always appreciated."],
    ["Dining", "No raw fish, please", "生の魚は食べられません", "Nama no sakana wa taberaremasen", "Useful at set-menu lunches or ryokan dinners."],
    ["Dining", "Is smoking allowed here? (Non-smoking seat please)", "禁煙席をお願いします", "Kin'en-seki o onegaishimasu", "Requests a non-smoking section."],
    ["Dietary", "I am vegetarian (no meat, poultry, or fish/dashi)", "私はベジタリアンです。肉・鶏肉・魚（だし・かつお節を含む）が食べられません。", "Watashi wa bejitarian desu. Niku, toriniku, sakana (dashi, katsuobushi o fukumu) ga taberaremasen.", "Show to staff—explicitly mentions fish broth (dashi) and bonito flakes."],
    ["Dietary", "I am vegan (no meat, fish, dairy, eggs, or honey)", "私はヴィーガンです。肉・魚・だし・卵・乳製品・はちみつは食べられません。", "Watashi wa vīgan desu. Niku, sakana, dashi, tamago, nyūseihin, hachimitsu wa taberaremasen.", "Comprehensive vegan point-and-show card."],
    ["Dietary", "Severe peanut & tree nut allergy", "重度のピーナッツ・ナッツ類アレルギーがあります。少量でも危険です。", "Jūdo no pīnattsu / nattsu-rui arerugī ga arimasu. Shōryō demo kiken desu.", "States severe peanut and tree nut allergy where trace amounts are dangerous."],
    ["Dietary", "Wheat / gluten allergy (celiac)", "小麦・グルテンアレルギーがあります。普通の醤油や小麦粉も食べられません。", "Komugi / guruten arerugī ga arimasu. Futsū no shōyu ya komugiko mo taberaremasen.", "Notes that regular soy sauce and wheat flour cannot be consumed."],
    ["Dietary", "Shellfish / crustacean allergy (shrimp, crab)", "エビ・カニ（甲殻類）のアレルギーがあります。", "Ebi / kani (kōkakurui) no arerugī ga arimasu.", "Show when ordering tempura, ramen, or soup broths."],
    ["Dietary", "I do not eat pork or alcohol (Halal-friendly request)", "豚肉（ポークエキス・ラードを含む）とアルコールは飲食できません。", "Butaniku (pōku ekisu, rādo o fukumu) to arukōru wa inshoku dekimasen.", "Explicitly excludes pork extract, lard, and cooking alcohol."],
    ["Dietary", "Dairy / milk allergy", "乳製品（牛乳・バター・チーズ・生クリーム）のアレルギーがあります。", "Nyūseihin (gyūnyū, batā, chīzu, nama-kurīmu) no arerugī ga arimasu.", "Covers milk, butter, cheese, and cream."],
    ["Transit", "Where is the ticket gate / SBB CFF FFS & Panoramic Alpine Railways platform?", "新幹線の改札口はどこですか？", "SBB CFF FFS & Panoramic Alpine Railways no kaisatsu-guchi wa doko desu ka?", "Ask station staff when navigating large hubs like Zurich or Lucerne Station."],
    ["Transit", "Does this train go to [Lucerne]?", "この電車は京都に行きますか？", "Kono densha wa Kyōto ni ikimasu ka?", "Replace 'Kyōto' with your destination station."],
    ["Transit", "Please take me to this address (Taxi)", "この住所までお願いします", "Kono jūsho made onegaishimasu", "Show along with Google Maps or your hotel's Switzerland address."],
    ["Transit", "I'd like to charge my IC card (Transit Card/Pasmo)", "ICカードにチャージしたいです", "IC kādo ni chāji shitai desu", "Use at a station fare adjustment machine or convenience store register."],
    ["Transit", "Where are the coin lockers?", "コインロッカーはどこですか？", "Koin rokkā wa doko desu ka?", "Most major stations have S/M/L lockers near the main exits."],
    ["Hotel", "Checking in, please", "チェックインをお願いします", "Chekku-in o onegaishimasu", "Have your passport ready for every guest (required by Switzerland law)."],
    ["Hotel", "Can you hold my luggage before check-in / after check-out?", "荷物を預かってもらえますか？", "Nimotsu o azukatte moraemasu ka?", "Virtually all Switzerland hotels hold bags free of charge on the day of arrival/departure."],
    ["Hotel", "I would like to ship my luggage to the next hotel (Takkyubin)", "次のホテルへ荷物を送りたいです（宅急便）", "Tsugi no hoteru e nimotsu o okuritai desu (Takkyūbin)", "Ask at the hotel front desk the morning before you need your bag at the next stop."],
    ["Shopping", "Can I pay by credit card / IC card?", "クレジットカード（またはICカード）は使えますか？", "Kurejitto kādo (mata wa IC kādo) wa tsukaemasu ka?", "Transit Card/Pasmo/Icoca work at almost all convenience stores and vending machines."],
    ["Shopping", "Tax-free shopping, please", "免税（タックスフリー）をお願いします", "Menzei (takkusu furī) o onegaishimasu", "Requires your physical passport with entry stamp or QR code."],
    ["Shopping", "Would you like it heated up? → Yes, please (Konbini)", "温めてください", "Atatamete kudasai", "When convenience store staff ask 'Atatamemasu ka?' about your bento or onigiri."],
    ["Shopping", "I need a plastic bag, please", "袋をお願いします", "Fukuro o onegaishimasu", "Bags cost CHF 3–CHF 5 at convenience stores and supermarkets."],
    ["Emergency", "Where is the nearest restroom?", "お手洗いはどこですか？", "Otearai wa doko desu ka?", "'Toire' (トイレ) is also universally understood."],
    ["Emergency", "I lost my item (phone / wallet / rail pass)", "落とし物をしました（交番・忘れ物センターはどこですか？）", "Otoshimono o shimashita (Kōban / wasuremono sentā wa doko desu ka?)", "Station lost-and-found centers and police boxes (Kōban) have remarkably high recovery rates."],
    ["Emergency", "I don't feel well — I need a doctor / pharmacy", "体調が悪いです。英語が通じる病院か薬局を教えてください。", "Taichō ga warui desu. Eigo ga tsūjiru byōin ka yakkyoku o oshiete kudasai.", "For medical emergencies dial 119 (ambulance/fire) or 110 (police)."]
  ];

  function speak(text) {
    if (!("speechSynthesis" in window)) { alert("Speech synthesis is not supported in this browser."); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  }

  function showModal(p) {
    const m = $("pb-modal");
    $("pb-m-cat").textContent = p[0];
    $("pb-m-jp").textContent = p[2];
    $("pb-m-ro").textContent = p[3];
    $("pb-m-en").textContent = p[1] + " — " + p[4];
    $("pb-m-speak").onclick = () => speak(p[2]);
    m.hidden = false;
    m.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  $("pb-m-close").addEventListener("click", () => { $("pb-modal").hidden = true; });

  function render() {
    const q = $("pb-q").value.trim().toLowerCase();
    const cat = $("pb-cat").value;
    const filtered = PHRASES.filter((p) => (!cat || p[0] === cat) && (!q || p.join(" ").toLowerCase().includes(q)));
    $("pb-list").innerHTML = filtered.map((p, idx) => `
      <div class="hub-pick">
        <p class="where">${p[0]}</p>
        <h3>${p[1]}</h3>
        <p style="font-size:1.25rem;font-weight:700;margin:6px 0">${p[2]}</p>
        <p style="color:var(--red-d);font-weight:600;margin:0 0 6px">${p[3]}</p>
        <p class="note">${p[4]}</p>
        <p style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button type="button" class="chip" data-speak="${idx}">🔊 Speak (日本語)</button>
          <button type="button" class="chip" data-show="${idx}">📱 Show to Staff</button>
        </p>
      </div>`).join("") || `<p class="empty">No phrases match that search.</p>`;
    $("pb-list").querySelectorAll("[data-speak]").forEach((b) => b.addEventListener("click", () => speak(filtered[Number(b.dataset.speak)][2])));
    $("pb-list").querySelectorAll("[data-show]").forEach((b) => b.addEventListener("click", () => showModal(filtered[Number(b.dataset.show)])));
  }

  $("pb-q").addEventListener("input", render);
  $("pb-cat").addEventListener("change", render);
  render();
})();
