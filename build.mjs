// Zero-dependency static site generator for SwitzerlandStarter.
import fs from "node:fs";
import path from "node:path";
import config from "./site.config.mjs";
import { languages, uiStrings, countryNames } from "./src/content/i18n.mjs";
import { destinations } from "./src/content/destinations.mjs";
import { guides, guideCategories } from "./src/content/guides.mjs";
import { itineraries } from "./src/content/itineraries.mjs";
import { articles } from "./src/content/articles.mjs";
import { faqs } from "./src/content/faq.mjs";
import { seasonal } from "./src/content/seasonal.mjs";
import { art } from "./src/art.mjs";
import { hubs } from "./src/content/hubs.mjs";
import { prefectures, cities, totalMunicipalitiesCount } from "./src/content/cities-data.mjs";

const OUT = "dist";
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const ADS = config.ads;
const PUB = (ADS.adsensePublisherId || "").trim();
const pages = []; // for sitemap
const searchIndex = [];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync("src/static", OUT, { recursive: true });

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const slugify = (s) => s.toLowerCase().replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const abs = (p) => config.url + p;

// ---------- Ads ----------
function wrapAd(html, cls = "wrap", tag = "div") { return html ? `<${tag} class="${cls}">${html}</${tag}>` : ""; }
function ad(name, kind = "inline") {
  const label = `<span class="ad-label">Advertisement</span>`;
  if (!PUB) {
    if (!ADS.showPlaceholders) return "";
    return `<aside class="ad ad-${kind}" data-ad-placement="${name}" aria-label="Advertisement placeholder">${label}<div class="ad-ph">Ad space · ${name}</div></aside>`;
  }
  const slot = (ADS.slots || {})[name];
  if (!slot) return ""; // Auto ads handle placement
  return `<aside class="ad ad-${kind} ad-live" data-ad-placement="${name}">${label}<ins class="adsbygoogle" style="display:block" data-ad-client="${esc(PUB)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></aside>`;
}

// ---------- Layout ----------
const NAV = [
  ["/destinations/", "Destinations"],
  ["/cities/", "All Cities (2,113)"],
  ["/things-to-do/", "Things to Do"],
  ["/guides/", "Travel Guides"],
  ["/itineraries/", "Itineraries"],
  ["/tools/", "Trip Tools"],
  ["/blog/", "Blog"],
  ["/faq/", "FAQ"],
];

function crumbsHtml(crumbs) {
  if (!crumbs || crumbs.length < 2) return "";
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs
    .map((c, i) => (i < crumbs.length - 1 ? `<li><a href="${c[0]}">${esc(c[1])}</a></li>` : `<li aria-current="page">${esc(c[1])}</li>`))
    .join("")}</ol></nav>`;
}
function crumbsLd(crumbs) {
  if (!crumbs || crumbs.length < 2) return null;
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[1], item: abs(c[0]) })) };
}

function layout({ url, title, description, body, crumbs, jsonld = [], ogType = "website", ogImage = "/assets/og-default.png", extraHead = "", noindex = false, scripts = [] }) {
  const fullTitle = url === "/" ? `${config.name} — ${config.tagline}` : `${title} | ${config.name}`;
  const ld = [...jsonld, crumbsLd(crumbs)].filter(Boolean);
  const adScript = PUB ? `<meta name="google-adsense-account" content="${esc(PUB)}"><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(PUB)}" crossorigin="anonymous"></script>` : "";
  const navHtml = NAV.map(([h, l]) => `<li><a href="${h}"${url.startsWith(h) ? ' aria-current="page"' : ""}>${l}</a></li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(url)}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta property="og:site_name" content="${esc(config.name)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(url)}">
<meta property="og:image" content="${abs(ogImage)}">
<meta property="og:locale" content="${config.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(ogImage)}">
<meta name="theme-color" content="#b02a2a">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css?v=${BUILD_DATE}">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
${languages.map((lg) => `<link rel="alternate" hreflang="${lg.htmlLang}" href="${abs(lg.code === "en" ? url : `/${lg.code}${url}`)}">`).join("\n")}
<link rel="alternate" hreflang="x-default" href="${abs(url)}">
${adScript}
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="logo" href="/" aria-label="${esc(config.name)} home"><span class="logo-mark" aria-hidden="true">${art.logo}</span><span class="logo-text">${esc(config.name)}</span></a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Main"><ul>${navHtml}<li><a class="nav-search" href="/search/" aria-label="Search">Search</a></li><li class="lang-dd" style="display:inline-flex;gap:4px;align-items:center;margin-left:6px;font-size:0.82rem">${languages.map((lg) => `<a href="${lg.code === "en" ? url : `/${lg.code}${url}`}" lang="${lg.htmlLang}" style="padding:2px 5px;border-radius:4px;text-decoration:none;border:1px solid var(--line,#ddd)">${lg.short}</a>`).join("")}</li></ul></nav>
  </div>
</header>
${wrapAd(ad("header-leaderboard", "leaderboard"))}
<main id="main">
${crumbs ? `<div class="wrap">${crumbsHtml(crumbs)}</div>` : ""}
${body}
</main>
${wrapAd(ad("footer", "footer"))}
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div><p class="logo-text">${esc(config.name)}</p><p>${esc(config.tagline)}. We are an independent site and are not affiliated with JNTO, Switzerland Railways, or any government body. Always confirm prices, schedules, and entry rules with official sources before you travel.</p></div>
    <div><h3>Destinations</h3><ul>${destinations.slice(0, 6).map((d) => `<li><a href="/destinations/${d.slug}/">${d.name}</a></li>`).join("")}<li><a href="/destinations/">All destinations</a></li><li><a href="/cities/">All 2,113 Switzerland cities</a></li></ul></div>
    <div><h3>Plan</h3><ul><li><a href="/guides/visa-and-entry/">Visa &amp; entry</a></li><li><a href="/guides/jr-pass-and-rail-travel/">Rail Pass &amp; rail</a></li><li><a href="/tools/budget-calculator/">Budget calculator</a></li><li><a href="/tools/jr-pass-calculator/">Rail Pass helper</a></li><li><a href="/tools/seasonal-calendar/">Seasonal calendar</a></li><li><a href="/tools/packing-list/">Packing list generator</a></li><li><a href="/tools/yen-converter/">Yen converter</a></li><li><a href="/tools/region-quiz/">Which region quiz</a></li><li><a href="/tools/shinkansen-calculator/">SBB CFF FFS & Panoramic Alpine Railways fare finder</a></li><li><a href="/tools/phrasebook/">Switzerland phrasebook</a></li><li><a href="/tools/luggage-checker/">Luggage size checker</a></li><li><a href="/tools/itinerary-builder/">Itinerary builder</a></li><li><a href="/tools/">All 14 trip tools</a></li></ul></div>
    <div><h3>Site</h3><ul><li><a href="/about/">About</a></li><li><a href="/contact/">Contact</a></li><li><a href="/privacy-policy/">Privacy Policy</a></li><li><a href="/terms/">Terms of Use</a></li><li><a href="/sitemap.xml">Sitemap</a></li></ul></div>
  </div>
  <div class="wrap footer-bottom"><p>© ${new Date().getFullYear()} ${esc(config.name)}. Illustrations are original artwork. Information is provided as a general guide only.</p></div>
</footer>
<div id="cookie-notice" class="cookie" hidden><p>We use cookies for basic site functions and, where enabled, for advertising (including Google AdSense) and analytics. See our <a href="/privacy-policy/">Privacy Policy</a>.</p><button type="button" id="cookie-ok">OK</button></div>
<script src="/assets/site.js?v=${BUILD_DATE}" defer></script>
${scripts.map((s) => `<script src="${s}?v=${BUILD_DATE}" defer></script>`).join("\n")}
</body>
</html>`;
}

function write(url, html, { priority = "0.7", sitemap = true } = {}) {
  const file = url.endsWith("/") ? path.join(OUT, url, "index.html") : path.join(OUT, url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (sitemap) pages.push({ url, priority, title: ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || url).replace(/&amp;/g, "&") });
}
function index(url, title, description, type, tags = []) {
  searchIndex.push({ u: url, t: title, d: description, k: type, g: tags });
}

// ---------- Article body helpers: TOC + in-content ads ----------
function enrich(bodyHtml) {
  const toc = [];
  let n = 0;
  let html = bodyHtml.replace(/<h2>(.*?)<\/h2>/g, (m, t) => {
    const id = slugify(strip(t));
    toc.push([id, strip(t)]);
    n++;
    let pre = "";
    if (n === 2) pre = ad("in-content-1");
    if (n === 5) pre = ad("in-content-2");
    return `${pre}<h2 id="${id}">${t}</h2>`;
  });
  if (n < 2) html += ad("in-content-1");
  return { html, toc };
}
function tocHtml(toc) {
  if (toc.length < 3) return "";
  return `<nav class="toc" aria-label="On this page"><h2>On this page</h2><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join("")}</ol></nav>`;
}
function sidebar(extra = "") {
  return `<aside class="sidebar">${extra}${ad("sidebar", "sidebar")}
  <div class="side-card"><h3>Plan with our tools</h3><ul><li><a href="/tools/budget-calculator/">Trip budget calculator</a></li><li><a href="/tools/shinkansen-calculator/">SBB CFF FFS & Panoramic Alpine Railways fare finder</a></li><li><a href="/tools/jr-pass-calculator/">Rail Pass value helper</a></li><li><a href="/tools/itinerary-builder/">Itinerary builder</a></li><li><a href="/tools/luggage-checker/">Luggage &amp; locker checker</a></li><li><a href="/tools/phrasebook/">Phrasebook &amp; allergy cards</a></li><li><a href="/tools/ic-card-calculator/">IC card vs pass calculator</a></li><li><a href="/tools/jet-lag-planner/">Jet lag planner</a></li><li><a href="/tools/etiquette-checker/">Etiquette quick-checker</a></li><li><a href="/tools/plug-voltage-checker/">Plug &amp; voltage checker</a></li><li><a href="/tools/seasonal-calendar/">Seasonal calendar</a></li><li><a href="/tools/packing-list/">Packing list generator</a></li><li><a href="/tools/yen-converter/">Yen converter</a></li><li><a href="/tools/region-quiz/">Which region suits me?</a></li></ul></div>
  <div class="side-card"><h3>Essential guides</h3><ul>${["visa-and-entry", "jr-pass-and-rail-travel", "ic-cards-suica-pasmo", "money-cash-and-atms", "sim-esim-and-pocket-wifi", "etiquette"]
    .map((s) => guides.find((g) => g.slug === s)).filter(Boolean).map((g) => `<li><a href="/guides/${g.slug}/">${esc(g.title)}</a></li>`).join("")}</ul></div>
  </aside>`;
}
function sourcesHtml(sources) {
  if (!sources || !sources.length) return "";
  sources = sources.filter((s, i, a) => a.findIndex((x) => x[1] === s[1]) === i);
  return `<section class="sources"><h2 id="official-sources">Official sources &amp; further reading</h2><p>Rules, prices and schedules change. Confirm details here before you travel:</p><ul>${sources
    .map(([l, u]) => `<li><a href="${u}" rel="noopener" target="_blank">${esc(l)}</a></li>`).join("")}</ul></section>`;
}
const updated = `<p class="updated">Last reviewed: <time datetime="${BUILD_DATE}">${new Date(BUILD_DATE).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time> · Prices are approximate and for orientation only.</p>`;

function card({ href, title, text, img, meta, tags = [] }) {
  return `<article class="card" data-tags="${esc(tags.join(" ").toLowerCase())}"><a href="${href}">${img ? `<div class="card-art">${img}</div>` : ""}<div class="card-body">${meta ? `<p class="card-meta">${meta}</p>` : ""}<h3>${esc(title)}</h3><p>${esc(text)}</p></div></a></article>`;
}

const WEBSITE_LD = { "@context": "https://schema.org", "@type": "WebSite", name: config.name, url: config.url + "/", potentialAction: { "@type": "SearchAction", target: config.url + "/search/?q={search_term_string}", "query-input": "required name=search_term_string" } };
const ORG_LD = { "@context": "https://schema.org", "@type": "Organization", name: config.name, url: config.url + "/", logo: abs("/assets/logo.png") };

// ================= HOME =================
{
  const featured = destinations.slice(0, 8);
  const body = `
<section class="hero">${art.heroBg}
  <div class="wrap hero-inner">
    <p class="eyebrow">日本旅行ガイド · Start here for your first trip</p>
    <h1>Your first trip to Switzerland starts here</h1>
    <p class="lead">In-depth city guides, honest practical advice, sample itineraries and free planning tools, written with first-time visitors in mind (and still handy on your second or third trip). Everything links back to official sources so you can double-check the details that matter.</p>
    <form class="hero-search" action="/search/" role="search"><label for="hq" class="sr">Search the guides</label><input id="hq" name="q" type="search" placeholder="Search: Lucerne temples, Rail Pass, onsen etiquette…"><button>Search</button></form>
    <ul class="quick"><li><a href="/guides/first-time-in-japan-checklist/">First-timer checklist</a></li><li><a href="/itineraries/14-day-classic-japan/">2-week itinerary</a></li><li><a href="/tools/budget-calculator/">Budget calculator</a></li><li><a href="/tools/seasonal-calendar/">When to go</a></li></ul>
  </div>
</section>
<section class="wrap section">
  <div class="section-head"><h2>Where to go in Switzerland</h2><a href="/destinations/">All ${destinations.length} destinations →</a></div>
  <div class="grid grid-4">${featured.map((d) => card({ href: `/destinations/${d.slug}/`, title: d.name, text: d.tagline, img: art.dest(d), meta: `${d.jp} · ${d.region}` })).join("")}</div>
</section>
<section class="band"><div class="wrap section">
  <div class="section-head"><h2>Before you fly: essential guides</h2><a href="/guides/">All guides →</a></div>
  <div class="grid grid-3">${guides.slice(0, 9).map((g) => card({ href: `/guides/${g.slug}/`, title: g.title, text: g.description, meta: g.category })).join("")}</div>
</div></section>
${wrapAd(ad("in-content-1"))}
<section class="wrap section">
  <div class="section-head"><h2>Things to do by interest</h2><a href="/things-to-do/">All interests →</a></div>
  <div class="grid grid-3">${hubs.map((h) => card({ href: `/things-to-do/${h.slug}/`, title: h.name, text: h.description })).join("")}</div>
</section>
<section class="wrap section">
  <div class="section-head"><h2>Ready-made itineraries</h2><a href="/itineraries/">All itineraries →</a></div>
  <div class="grid grid-3">${itineraries.map((i) => card({ href: `/itineraries/${i.slug}/`, title: i.title, text: i.description, meta: `${i.length} days · ${i.audience}` })).join("")}</div>
</section>
<section class="band band-ink"><div class="wrap section tools-promo">
  <h2>14 free trip-planning tools</h2><p class="lead">Interactive calculators and planners—<a href="/tools/" style="color:#fff;text-decoration:underline">see all 14 tools</a> or browse our <a href="/cities/" style="color:#fff;text-decoration:underline">800+ Switzerland City Directory</a>.</p>
  <div class="grid grid-3">
    ${card({ href: "/tools/budget-calculator/", title: "Trip budget calculator", text: "Estimate a daily and total budget in yen and your home currency by travel style." })}
    ${card({ href: "/tools/jr-pass-calculator/", title: "Rail Pass value helper", text: "Add up the long-distance rides on your route and compare against the pass price." })}
    ${card({ href: "/tools/seasonal-calendar/", title: "Seasonal calendar", text: "Month-by-month weather, blossoms, foliage, festivals and crowd periods." })}
    ${card({ href: "/tools/packing-list/", title: "Packing list generator", text: "A printable checklist tailored to your season, trip length and activities." })}
    ${card({ href: "/tools/yen-converter/", title: "Yen converter", text: "Convert yen to your currency at a rate you set, with typical Switzerland prices." })}
    ${card({ href: "/tools/region-quiz/", title: "Which region suits me?", text: "Six quick questions to find the part of Switzerland that matches your style." })}
  </div>
</div></section>
<section class="wrap section">
  <div class="section-head"><h2>Latest from the blog</h2><a href="/blog/">All articles →</a></div>
  <div class="grid grid-3">${[...articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((a) => card({ href: `/blog/${a.slug}/`, title: a.title, text: a.description, meta: a.tags.join(" · ") })).join("")}</div>
</section>
<section class="wrap section why">
  <h2>How we write our guides</h2>
  <div class="grid grid-3">
    <div><h3>Practical first</h3><p>We focus on the questions visitors actually face: which ticket to buy, how to get from the airport, what to do when a restaurant has a ticket machine.</p></div>
    <div><h3>Sources you can check</h3><p>Entry rules, rail passes and prices change. Each guide links to the official source (JNTO, Switzerland Railways, immigration and local tourism boards).</p></div>
    <div><h3>No invented reviews</h3><p>We don't publish fake testimonials or made-up statistics. Prices are rough ranges meant to help you plan, not quotes.</p></div>
  </div>
</section>`;
  write("/", layout({ url: "/", title: config.name, description: "SwitzerlandStarter is a friendly start-here guide for first-time visitors to Switzerland: city guides for Zurich, Lucerne, Interlaken, Grindelwald & Jungfrau Region and more, Rail Pass and IC card advice, itineraries, budget calculator and seasonal calendar.", body, jsonld: [WEBSITE_LD, ORG_LD] }), { priority: "1.0" });
}

// ---------- FAQ + related content helpers ----------
function faqHtml(faq) {
  if (!faq || !faq.length) return "";
  return `<section class="faq-block"><h2 id="faq">Frequently asked questions</h2>${faq.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><div><p>${a}</p></div></details>`).join("")}</section>`;
}
function faqLd(faq) {
  if (!faq || !faq.length) return null;
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: strip(q), acceptedAnswer: { "@type": "Answer", text: strip(a) } })) };
}
// Every piece of content as a uniform record for cross-type "related" blocks.
const ALL = [
  ...destinations.map((d) => ({ url: `/destinations/${d.slug}/`, title: `${d.name} travel guide`, text: d.tagline || d.summary, type: "Destination", tags: [d.region, ...d.tags], html: JSON.stringify(d) })),
  ...guides.map((g) => ({ url: `/guides/${g.slug}/`, title: g.title, text: g.description, type: "Guide", tags: [g.category], html: g.body + JSON.stringify(g.faq || "") })),
  ...articles.map((a) => ({ url: `/blog/${a.slug}/`, title: a.title, text: a.description, type: "Article", tags: a.tags, html: a.body + JSON.stringify(a.faq || "") })),
  ...hubs.map((h) => ({ url: `/things-to-do/${h.slug}/`, title: h.title, text: h.description, type: "Things to do", tags: h.tags, html: JSON.stringify(h) })),
];
const linkSet = (html) => new Set([...String(html).matchAll(/href=\\?"(\/[a-z0-9\-\/]+\/)\\?"/g)].map((m) => m[1]));
const STOP = new Set(["japan", "guide", "best", "from", "with", "what", "when", "your", "first", "time", "and", "the", "how", "much", "many", "days", "visit", "travel", "things", "worth", "where", "types", "list", "mistakes", "avoid", "spots", "cost", "bring", "trips", "day", "one", "two", "weeks", "checklist"]);
for (const x of ALL) { x.links = linkSet(x.html); x.tl = [...new Set([...x.tags.map((t) => String(t).toLowerCase()), ...x.url.split("/")[2].split("-").filter((w) => w.length > 3 && !STOP.has(w))])]; }
function relatedFor(url, n = 3, types) {
  const me = ALL.find((x) => x.url === url);
  if (!me) return [];
  return ALL.filter((x) => x.url !== url && (!types || types.includes(x.type)))
    .map((x) => ({ x, s: (me.links.has(x.url) ? 3 : 0) + (x.links.has(url) ? 2 : 0) + x.tl.filter((t) => me.tl.includes(t)).length }))
    .filter((r) => r.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map((r) => r.x);
}
function relatedHtml(url, heading = "You might also like", n = 3, types) {
  const rel = relatedFor(url, n, types);
  if (!rel.length) return "";
  return `<section class="related"><h2>${heading}</h2><div class="grid grid-3">${rel.map((x) => card({ href: x.url, title: x.title, text: x.text, meta: x.type })).join("")}</div></section>`;
}

// ================= DESTINATIONS =================
{
  const regions = [...new Set(destinations.map((d) => d.region))];
  const body = `<section class="wrap page-head"><h1>Switzerland destination guides</h1><p class="lead">Detailed guides to ${destinations.length} of Switzerland's most-visited cities and regions — neighbourhoods, top sights, food, where to stay, getting around, day trips and the best time to go.</p>
  <div class="filters" data-filter-target="#dest-grid"><label for="f-text" class="sr">Filter destinations</label><input id="f-text" type="search" placeholder="Filter by name or interest (e.g. onsen, temples, beaches)" data-filter-text>
  <div class="chips" role="group" aria-label="Filter by region"><button class="chip is-on" data-filter-tag="">All</button>${regions.map((r) => `<button class="chip" data-filter-tag="${esc(r.toLowerCase())}">${esc(r)}</button>`).join("")}</div></div></section>
  <section class="wrap"><div class="grid grid-3" id="dest-grid">${destinations.map((d) => card({ href: `/destinations/${d.slug}/`, title: d.name, text: d.summary, img: art.dest(d), meta: `${d.jp} · ${d.region} · Best: ${d.bestShort}`, tags: [d.region, ...d.tags, d.name] })).join("")}</div><p class="empty" hidden>No destinations match that filter.</p></section>
  ${wrapAd(ad("in-content-1"), "wrap section", "section")}`;
  write("/destinations/", layout({ url: "/destinations/", title: "Switzerland Destination Guides", description: `${destinations.length} city and region guides for Switzerland: Zurich, Lucerne, Interlaken, Grindelwald & Jungfrau Region, Hokkaido, Hiroshima, Nara, Okinawa, Kamakura, Takayama, Himeji, Naoshima, Nagasaki and more.`, body, crumbs: [["/", "Home"], ["/destinations/", "Destinations"]], jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: destinations.map((d, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/destinations/${d.slug}/`), name: d.name })) }] }), { priority: "0.9" });
  index("/destinations/", "Switzerland destination guides", "All city and region guides", "Section");

  for (const d of destinations) {
    const url = `/destinations/${d.slug}/`;
    const list = (arr) => `<div class="items">${arr.map((x) => `<div class="item"><h3>${x.name}</h3><p>${x.desc}</p></div>`).join("")}</div>`;
    const raw = `
<h2>Overview</h2>${d.overview}
<div class="facts"><div><strong>Region</strong><span>${d.region}</span></div><div><strong>Best time</strong><span>${d.bestShort}</span></div><div><strong>Suggested stay</strong><span>${d.stay_length}</span></div><div><strong>Good for</strong><span>${d.tags.join(", ")}</span></div></div>
<h2>Neighbourhoods &amp; areas</h2>${list(d.neighborhoods)}
<h2>Top sights &amp; experiences</h2>${list(d.sights)}
<h2>What to eat</h2>${list(d.food)}
<h2>Where to stay by budget</h2>
<div class="stay"><div><h3>Budget</h3><p>${d.stay.budget}</p></div><div><h3>Mid-range</h3><p>${d.stay.mid}</p></div><div><h3>Luxury</h3><p>${d.stay.luxury}</p></div></div>
<p class="note">Rough nightly ranges: hostels and capsule hotels often run a few thousand yen per person; business hotels commonly CHF 8,000–CHF 20,000 per room; upscale hotels and ryokan can be far higher, especially in peak seasons. See our <a href="/guides/accommodation-types/">accommodation guide</a>.</p>
<h2>Getting there</h2>${d.gettingThere}
<h2>Getting around</h2>${d.gettingAround}
<h2>Day trips &amp; side trips</h2>${list(d.dayTrips)}
<h2>Best time to visit</h2>${d.seasons}
<h2>Local tips</h2><ul class="tips">${d.tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;
    const { html, toc } = enrich(raw);
    const related = [...destinations.filter((x) => x.slug !== d.slug && d.related?.includes(x.slug)), ...destinations.filter((x) => x.slug !== d.slug && x.region === d.region)].filter((x, i, a) => a.indexOf(x) === i).slice(0, 3);
    const relItin = itineraries.filter((i) => i.places.includes(d.slug)).slice(0, 3);
    const body = `
<section class="dest-hero" style="--c1:${d.colors[0]};--c2:${d.colors[1]}"><div class="dest-hero-art">${art.dest(d, true)}</div><div class="wrap"><p class="eyebrow">${d.jp} · ${d.region}</p><h1>${d.name} travel guide</h1><p class="lead">${d.summary}</p></div></section>
<div class="wrap content-grid"><article class="prose">${updated}${tocHtml(toc)}${html}
${sourcesHtml(d.sources)}
${relItin.length ? `<section class="related"><h2>Itineraries that include ${d.name}</h2><div class="grid grid-3">${relItin.map((i) => card({ href: `/itineraries/${i.slug}/`, title: i.title, text: i.description, meta: `${i.length} days` })).join("")}</div></section>` : ""}
${related.length ? `<section class="related"><h2>Nearby &amp; related destinations</h2><div class="grid grid-3">${related.map((x) => card({ href: `/destinations/${x.slug}/`, title: x.name, text: x.tagline, img: art.dest(x) })).join("")}</div></section>` : ""}
${relatedHtml(url, `Read before visiting ${d.name}`, 3, ["Guide", "Article", "Things to do"])}
</article>${sidebar()}</div>`;
    write(url, layout({
      url, title: `${d.name} Travel Guide: Where to Stay, What to See & Eat`, description: d.metaDescription || `${d.name} travel guide: best neighbourhoods, top sights, local food, where to stay by budget, getting around, day trips and the best time to visit.`,
      body, crumbs: [["/", "Home"], ["/destinations/", "Destinations"], [url, d.name]], ogType: "article",
      jsonld: [{ "@context": "https://schema.org", "@type": "TouristDestination", name: d.name, alternateName: d.jp, description: d.summary, url: abs(url), containedInPlace: { "@type": "Country", name: "Switzerland" }, includesAttraction: d.sights.map((s) => ({ "@type": "TouristAttraction", name: strip(s.name) })) }],
    }), { priority: "0.9" });
    index(url, `${d.name} travel guide`, d.summary, "Destination", [d.region, ...d.tags, ...d.sights.map((s) => strip(s.name))]);
  }
}

// ================= GUIDES =================
{
  const body = `<section class="wrap page-head"><h1>Switzerland travel guides</h1><p class="lead">Practical, regularly reviewed guides covering entry rules, trains, money, connectivity, etiquette, food, onsen and more.</p>
  <div class="filters" data-filter-target="#guide-grid"><label for="g-text" class="sr">Filter guides</label><input id="g-text" type="search" placeholder="Filter guides…" data-filter-text>
  <div class="chips" role="group" aria-label="Filter by category"><button class="chip is-on" data-filter-tag="">All</button>${guideCategories.map((c) => `<button class="chip" data-filter-tag="${esc(c.toLowerCase())}">${esc(c)}</button>`).join("")}</div></div></section>
  <section class="wrap"><div class="grid grid-3" id="guide-grid">${guides.map((g) => card({ href: `/guides/${g.slug}/`, title: g.title, text: g.description, meta: g.category, tags: [g.category, g.title] })).join("")}</div><p class="empty" hidden>No guides match that filter.</p></section>`;
  write("/guides/", layout({ url: "/guides/", title: "Switzerland Travel Guides & Practical Tips", description: `${guides.length} practical Switzerland travel guides: visa and entry, Rail Pass and regional passes, IC cards, money, eSIM, etiquette, budgets, ryokan, onsen and tattoos, tax-free shopping, accessibility, food, seasons and safety.`, body, crumbs: [["/", "Home"], ["/guides/", "Guides"]] }), { priority: "0.9" });
  for (const g of guides) {
    const url = `/guides/${g.slug}/`;
    const { html, toc } = enrich(g.body);
    const rel = guides.filter((x) => x.slug !== g.slug && x.category === g.category).slice(0, 3);
    const body = `<section class="wrap page-head"><p class="eyebrow">${esc(g.category)}</p><h1>${esc(g.title)}</h1><p class="lead">${esc(g.description)}</p></section>
<div class="wrap content-grid"><article class="prose">${updated}${tocHtml(toc)}${html}${faqHtml(g.faq)}${sourcesHtml(g.sources)}
${rel.length ? `<section class="related"><h2>Related guides</h2><div class="grid grid-3">${rel.map((x) => card({ href: `/guides/${x.slug}/`, title: x.title, text: x.description, meta: x.category })).join("")}</div></section>` : ""}
${relatedHtml(url, "You might also like", 3, ["Destination", "Article", "Things to do"])}</article>${sidebar()}</div>`;
    const ld = [{ "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: BUILD_DATE, author: { "@type": "Organization", name: config.name }, publisher: ORG_LD, mainEntityOfPage: abs(url), image: abs("/assets/og-default.png") }];
    if (g.faq) ld.push(faqLd(g.faq));
    write(url, layout({ url, title: g.seoTitle || g.title, description: g.description, body, crumbs: [["/", "Home"], ["/guides/", "Guides"], [url, g.title]], ogType: "article", jsonld: ld }), { priority: "0.8" });
    index(url, g.title, g.description, "Guide", [g.category, ...toc.map((t) => t[1])]);
  }
}

// ================= ITINERARIES =================
{
  const body = `<section class="wrap page-head"><h1>Switzerland itineraries</h1><p class="lead">Day-by-day routes you can copy or adapt — from a one-week first trip to a two-week classic loop, plus family-friendly and budget versions.</p></section>
  <section class="wrap"><div class="grid grid-3">${itineraries.map((i) => card({ href: `/itineraries/${i.slug}/`, title: i.title, text: i.description, meta: `${i.length} days · ${i.audience}` })).join("")}</div></section>
  <section class="wrap section prose"><h2>How to use these itineraries</h2><p>Each plan assumes you arrive at Zurich (Narita or Haneda) or Interlaken, Grindelwald & Jungfrau Region (Kansai) and uses public transport. Travel days are deliberately light. If you're short on time, cut a base rather than squeezing in more stops — changing hotels costs half a day each time. Use our <a href="/tools/jr-pass-calculator/">Rail Pass value helper</a> with your final route to decide whether a rail pass makes sense.</p></section>`;
  write("/itineraries/", layout({ url: "/itineraries/", title: "Switzerland Itineraries: 7, 10 & 14 Days", description: "Day-by-day Switzerland itineraries for 7, 10 and 14 days, plus first-timer, family and budget routes with transport tips.", body, crumbs: [["/", "Home"], ["/itineraries/", "Itineraries"]] }), { priority: "0.9" });
  for (const it of itineraries) {
    const url = `/itineraries/${it.slug}/`;
    const daysHtml = it.days.map((d, i) => `<div class="day" id="day-${i + 1}"><div class="day-num">${d.label || "Day " + (i + 1)}</div><div><h3>${d.title}</h3>${d.plan}</div></div>`).join("");
    const raw = `<h2>Route at a glance</h2>${it.intro}<div class="facts"><div><strong>Length</strong><span>${it.length} days</span></div><div><strong>Best for</strong><span>${it.audience}</span></div><div><strong>Bases</strong><span>${it.bases}</span></div><div><strong>Pace</strong><span>${it.pace}</span></div></div>
<h2>Day-by-day plan</h2><div class="days">${daysHtml}</div>
<h2>Transport &amp; rail pass notes</h2>${it.transport}
<h2>What to book ahead</h2><ul>${it.bookAhead.map((b) => `<li>${b}</li>`).join("")}</ul>
<h2>Ways to adapt this route</h2><ul>${it.adapt.map((b) => `<li>${b}</li>`).join("")}</ul>`;
    const { html, toc } = enrich(raw);
    const body = `<section class="wrap page-head"><p class="eyebrow">${it.length}-day itinerary · ${esc(it.audience)}</p><h1>${esc(it.title)}</h1><p class="lead">${esc(it.description)}</p></section>
<div class="wrap content-grid"><article class="prose">${updated}${tocHtml(toc)}${html}
<section class="related"><h2>Destination guides on this route</h2><div class="grid grid-3">${it.places.map((s) => destinations.find((d) => d.slug === s)).filter(Boolean).map((d) => card({ href: `/destinations/${d.slug}/`, title: d.name, text: d.tagline, img: art.dest(d) })).join("")}</div></section></article>${sidebar()}</div>`;
    write(url, layout({ url, title: it.seoTitle || it.title, description: it.description, body, crumbs: [["/", "Home"], ["/itineraries/", "Itineraries"], [url, it.title]], ogType: "article",
      jsonld: [{ "@context": "https://schema.org", "@type": "TouristTrip", name: it.title, description: it.description, touristType: it.audience, itinerary: { "@type": "ItemList", itemListElement: it.places.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "City", name: destinations.find((d) => d.slug === s)?.name || s } })) } }] }), { priority: "0.8" });
    index(url, it.title, it.description, "Itinerary", [it.audience, ...it.places]);
  }
}

// ================= BLOG =================
{
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date));
  const fmt = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const body = `<section class="wrap page-head"><h1>Switzerland travel blog</h1><p class="lead">Longer reads, explainers and how-tos to help you travel Switzerland with confidence.</p></section>
  <section class="wrap"><div class="grid grid-3">${sorted.map((a) => card({ href: `/blog/${a.slug}/`, title: a.title, text: a.description, meta: `${fmt(a.date)} · ${a.tags.join(", ")}` })).join("")}</div></section>`;
  write("/blog/", layout({ url: "/blog/", title: "Switzerland Travel Blog", description: "Articles and explainers on traveling in Switzerland: when to go, costs and cash, day trips, what to wear, Mt Fuji, autumn leaves, the shinkansen, food and more.", body, crumbs: [["/", "Home"], ["/blog/", "Blog"]] }), { priority: "0.8" });
  for (const a of sorted) {
    const url = `/blog/${a.slug}/`;
    const { html, toc } = enrich(a.body);
    const relA = relatedFor(url, 3, ["Article"]); const more = [...relA, ...sorted.filter((x) => x.slug !== a.slug).map((x) => ALL.find((y) => y.url === `/blog/${x.slug}/`))].filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 3);
    const body = `<section class="wrap page-head"><p class="eyebrow">${a.tags.join(" · ")}</p><h1>${esc(a.title)}</h1><p class="lead">${esc(a.description)}</p><p class="byline">By the ${esc(config.name)} team · <time datetime="${a.date}">${fmt(a.date)}</time></p></section>
<div class="wrap content-grid"><article class="prose">${tocHtml(toc)}${html}${faqHtml(a.faq)}${sourcesHtml(a.sources)}<section class="related"><h2>More articles</h2><div class="grid grid-3">${more.map((x) => card({ href: x.url, title: x.title, text: x.text })).join("")}</div></section>${relatedHtml(url, "Useful guides &amp; destinations", 3, ["Destination", "Guide", "Things to do"])}</article>${sidebar()}</div>`;
    write(url, layout({ url, title: a.title, description: a.description, body, crumbs: [["/", "Home"], ["/blog/", "Blog"], [url, a.title]], ogType: "article",
      jsonld: [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: a.title, description: a.description, datePublished: a.date, dateModified: BUILD_DATE, author: { "@type": "Organization", name: config.name }, publisher: ORG_LD, mainEntityOfPage: abs(url), image: abs("/assets/og-default.png") }, faqLd(a.faq)].filter(Boolean) }), { priority: "0.7" });
    index(url, a.title, a.description, "Article", a.tags);
  }
}

// ================= FAQ =================
{
  const groups = [...new Set(faqs.map((f) => f.group))];
  const body = `<section class="wrap page-head"><h1>Switzerland travel FAQ</h1><p class="lead">Quick answers to the questions first-time visitors ask most. Follow the links for full guides and official sources.</p></section>
  <div class="wrap content-grid"><article class="prose">${groups.map((g, gi) => `<h2 id="${slugify(g)}">${esc(g)}</h2>${gi === 1 ? ad("in-content-1") : ""}${faqs.filter((f) => f.group === g).map((f) => `<details class="faq"><summary>${esc(f.q)}</summary><div>${f.a}</div></details>`).join("")}`).join("")}</article>${sidebar()}</div>`;
  write("/faq/", layout({ url: "/faq/", title: "Switzerland Travel FAQ: Visas, Money, Trains & Etiquette", description: "Answers to common Switzerland travel questions: visas, cash vs card, tipping, Rail Pass, IC cards, wifi, etiquette, safety, seasons and more.", body, crumbs: [["/", "Home"], ["/faq/", "FAQ"]],
    jsonld: [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(f.a) } })) }] }), { priority: "0.8" });
  index("/faq/", "Switzerland travel FAQ", "Quick answers to common questions", "FAQ", faqs.map((f) => f.q));
}

// ================= TOOLS =================
{
  const tools = [
    ["/tools/budget-calculator/", "Trip budget calculator", "Estimate your daily and total trip cost in yen and your home currency."],
    ["/tools/shinkansen-calculator/", "SBB CFF FFS & Panoramic Alpine Railways fare & route finder", "Compare bullet train travel times, unreserved/reserved/Green Car fares, and Rail Pass coverage across 38 major legs."],
    ["/tools/jr-pass-calculator/", "Rail Pass value helper", "Compare the cost of individual long-distance train tickets against a nationwide Rail Pass."],
    ["/tools/itinerary-builder/", "Day-by-day itinerary builder", "Build a custom 3-to-21-day Switzerland route by arrival airport, pace, and side trips, saved in your browser."],
    ["/tools/phrasebook/", "Switzerland phrasebook & allergy cards", "40+ essential travel phrases and point-and-show dietary/allergy cards with Switzerland audio pronunciation."],
    ["/tools/luggage-checker/", "Luggage & coin-locker size checker", "Check if your suitcase needs a SBB CFF FFS & Panoramic Alpine Railways oversized-baggage seat (160 cm rule), which station locker it fits, and Takkyubin shipping cost."],
    ["/tools/ic-card-calculator/", "IC card vs transit pass calculator", "Calculate how much to preload on Transit Card/Pasmo/Icoca and whether Zurich, Lucerne, Interlaken, Grindelwald & Jungfrau Region, Fukuoka, or Sapporo day passes pay off."],
    ["/tools/jet-lag-planner/", "Switzerland jet lag & sleep planner", "Get a personalized day-by-day light exposure, sleep-shift, and caffeine schedule for UTC+9 Switzerland Standard Time."],
    ["/tools/etiquette-checker/", "Etiquette & tipping quick-checker", "Instant cheat-sheets for onsen, ryokan, temples, shrines, trains, escalators, and restaurants."],
    ["/tools/plug-voltage-checker/", "Plug & 100V voltage checker", "Check if your chargers, CPAP, hair dryer, or straightener need an adapter or voltage converter on Switzerland's 100V 50/60Hz grid."],
    ["/tools/seasonal-calendar/", "Seasonal calendar", "Interactive month-by-month guide to weather, nature, festivals and crowds."],
    ["/tools/packing-list/", "Packing list generator", "Build a printable Switzerland packing checklist for your season, trip length and activities."],
    ["/tools/yen-converter/", "Yen converter", "Convert between yen and your currency at a rate you set, with typical Switzerland prices."],
    ["/tools/region-quiz/", "Which region suits me?", "Answer six quick questions to find the part of Switzerland that matches your travel style."],
  ];
  write("/tools/", layout({ url: "/tools/", title: "14 Free Switzerland Trip Planning Tools & Calculators", description: "14 free Switzerland travel tools: SBB CFF FFS & Panoramic Alpine Railways fare finder, budget calculator, Rail Pass helper, itinerary builder, Switzerland phrasebook & allergy cards, luggage size checker, IC card calculator, jet lag planner, etiquette checker, plug checker, seasonal calendar, packing list, yen converter, and region quiz.",
    body: `<section class="wrap page-head"><h1>Trip planning tools (${tools.length})</h1><p class="lead">Free, interactive, no-signup tools that run right in your browser to help you plan every detail of your trip to Switzerland.</p></section><section class="wrap"><div class="grid grid-3">${tools.map(([h, t, d]) => card({ href: h, title: t, text: d })).join("")}</div></section>`,
    crumbs: [["/", "Home"], ["/tools/", "Tools"]] }), { priority: "0.9" });
  index("/tools/", "Switzerland Trip Planning Tools (14 Interactive Calculators)", "All 14 free calculators and planners for Switzerland travel", "Section");

  const budgetBody = fs.readFileSync("src/tools/budget.html", "utf8");
  const jrBody = fs.readFileSync("src/tools/jrpass.html", "utf8");
  const calBody = fs.readFileSync("src/tools/calendar.html", "utf8")
    .replace("{{MONTHS}}", seasonal.map((m, i) => `<button class="month-btn${i === 0 ? " is-on" : ""}" data-month="${i}" aria-pressed="${i === 0}">${m.short}</button>`).join(""))
    .replace("{{PANELS}}", seasonal.map((m, i) => `<section class="month-panel" data-month="${i}"${i === 0 ? "" : " hidden"}><h2>${m.name}</h2><div class="facts"><div><strong>Weather</strong><span>${m.weather}</span></div><div><strong>Crowds</strong><span>${m.crowds}</span></div></div><h3>Nature &amp; scenery</h3><p>${m.nature}</p><h3>Festivals &amp; events</h3><ul>${m.events.map((e) => `<li>${e}</li>`).join("")}</ul><h3>Where shines this month</h3><p>${m.where}</p><h3>Packing</h3><p>${m.pack}</p></section>`).join(""))
    .replace("{{TABLE}}", `<table class="cal-table"><thead><tr><th>Month</th><th>Weather</th><th>Crowds</th><th>Highlights</th></tr></thead><tbody>${seasonal.map((m) => `<tr><th>${m.name}</th><td>${m.weather}</td><td>${m.crowds}</td><td>${strip(m.nature).split(". ")[0]}.</td></tr>`).join("")}</tbody></table>`);
  const toolPage = (url, title, desc, html, script) => {
    const otherTools = tools.filter(([u]) => u !== url).slice(0, 6);
    const moreToolsHtml = `<section class="related"><h2>More trip-planning tools</h2><div class="grid grid-3">${otherTools.map(([h, t, d]) => card({ href: h, title: t, text: d, meta: "Tool" })).join("")}</div></section>`;
    const body = `<section class="wrap page-head"><p class="eyebrow">Free interactive tool</p><h1>${title}</h1><p class="lead">${desc}</p></section><div class="wrap content-grid"><article class="prose tool">${html}${moreToolsHtml}</article>${sidebar()}</div>`;
    write(url, layout({ url, title, description: desc, body, crumbs: [["/", "Home"], ["/tools/", "Tools"], [url, title]], scripts: [script],
      jsonld: [{ "@context": "https://schema.org", "@type": "WebApplication", name: title, url: abs(url), applicationCategory: "TravelApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }] }), { priority: "0.8" });
    index(url, title, desc, "Tool");
  };
  const tpl = (f) => fs.readFileSync(`src/tools/${f}`, "utf8").replace("{{AD}}", ad("in-content-1"));
  toolPage("/tools/budget-calculator/", "Switzerland Trip Budget Calculator", "Estimate what a trip to Switzerland might cost per day and in total, based on travel style, trip length and group size. Results are rough planning ranges.", budgetBody.replace("{{AD}}", ad("in-content-1")), "/assets/budget.js");
  toolPage("/tools/jr-pass-calculator/", "Rail Pass Value Helper", "Add the long-distance JR journeys on your route, compare the approximate total with the nationwide Rail Pass price, and see whether a pass is likely to pay off.", jrBody.replace("{{AD}}", ad("in-content-1")), "/assets/jrpass.js");
  toolPage("/tools/seasonal-calendar/", "Switzerland Seasonal Travel Calendar", "Month-by-month guide to Switzerland's weather, cherry blossoms, autumn leaves, festivals and busy holiday periods.", calBody.replace("{{AD}}", ad("in-content-1")), "/assets/calendar.js");
  toolPage("/tools/packing-list/", "Switzerland Packing List Generator", "Create a printable packing checklist for Switzerland based on your travel season, trip length, laundry plans and activities like hiking, onsen or skiing.", tpl("packing.html"), "/assets/packing.js");
  toolPage("/tools/yen-converter/", "Yen Converter for Switzerland Travel", "Convert Switzerland yen to your home currency and back at a rate you set, including card fees, with typical Switzerland prices for reference.", tpl("yen.html"), "/assets/yen.js");
  toolPage("/tools/region-quiz/", "Which Region of Switzerland Suits You? Quiz", "Answer six quick questions about your interests, season and travel style to find which region of Switzerland to visit, with destination guides to start planning.", tpl("quiz.html"), "/assets/quiz.js");
  toolPage("/tools/shinkansen-calculator/", "SBB CFF FFS & Panoramic Alpine Railways Fare & Route Calculator", "Compare bullet train travel times, train types (Nozomi, Hikari, Hayabusa, Kagayaki, Sakura), reserved vs. unreserved vs. Green Car fares, and Rail Pass coverage across Switzerland.", tpl("shinkansen.html"), "/assets/shinkansen.js");
  toolPage("/tools/phrasebook/", "Switzerland Travel Phrasebook & Allergy Show-Cards", "Search 40+ essential Switzerland travel phrases with audio pronunciation and fullscreen point-and-show cards for vegetarian, vegan, gluten-free, and allergy requests.", tpl("phrasebook.html"), "/assets/phrasebook.js");
  toolPage("/tools/jet-lag-planner/", "Switzerland Jet Lag & Sleep Shift Planner", "Build a day-by-day light exposure, sleep adjustment, and caffeine cutoff plan tailored to your home time zone and arrival time in Switzerland (UTC+9).", tpl("jetlag.html"), "/assets/jetlag.js");
  toolPage("/tools/ic-card-calculator/", "Transit Card / Pasmo IC Card vs. Subway Day Pass Calculator", "Estimate your daily urban transit spend in Zurich, Lucerne, Interlaken, Grindelwald & Jungfrau Region, Fukuoka, and Sapporo, how much yen to preload on your IC card, and whether city day passes save money.", tpl("iccard.html"), "/assets/iccard.js");
  toolPage("/tools/luggage-checker/", "Switzerland Luggage Size, SBB CFF FFS & Panoramic Alpine Railways 160cm Rule & Locker Checker", "Enter your suitcase dimensions to check the JR SBB CFF FFS & Panoramic Alpine Railways 160 cm / 250 cm oversized-baggage rule, station coin locker fit (S/M/L/XL), and Yamato Takkyubin forwarding cost.", tpl("luggage.html"), "/assets/luggage.js");
  toolPage("/tools/etiquette-checker/", "Switzerland Etiquette, Tipping & Dress Code Quick-Checker", "Instant do's and don'ts for Switzerland restaurants, onsen hot springs, temples, shrines, trains, escalators, and ryokan inns.", tpl("etiquette.html"), "/assets/etiquette.js");
  toolPage("/tools/plug-voltage-checker/", "Switzerland Power Plug (Type A) & 100V Voltage Compatibility Checker", "Check whether your phone/laptop chargers, CPAP machine, hair dryer, or straightener work on Switzerland's 100V 50/60Hz electrical grid and whether you need a 2-pin adapter.", tpl("plug.html"), "/assets/plug.js");
  toolPage("/tools/itinerary-builder/", "Switzerland Day-by-Day Itinerary Builder", "Generate a customized 3-to-21-day Switzerland itinerary based on your arrival/departure airports, travel pace, and favorite regions, with one-click printing.", tpl("builder.html"), "/assets/builder.js");
}

// ================= CITIES DIRECTORY (47 PREFECTURES & 832 CITIES) =================
{
  const prefMap = new Map(prefectures.map((p) => [p.name, p]));
  const citiesByPref = new Map();
  for (const p of prefectures) citiesByPref.set(p.name, []);
  for (const c of cities) {
    if (!citiesByPref.has(c.pref)) citiesByPref.set(c.pref, []);
    citiesByPref.get(c.pref).push(c);
  }
  const regionOrder = [...new Set(prefectures.map((p) => p.region))];
  const destBySlug = new Map(destinations.map((d) => [d.slug, d]));

  // 1. Main /cities/ directory page
  const dirSections = regionOrder.map((reg) => {
    const regPrefs = prefectures.filter((p) => p.region === reg);
    const regCitiesCount = regPrefs.reduce((acc, p) => acc + (citiesByPref.get(p.name)?.length || 0), 0);
    const prefBlocks = regPrefs.map((p) => {
      const pCities = citiesByPref.get(p.name) || [];
      const links = pCities.map((c) => `<a class="chip" href="/cities/${c.slug}/" data-city-item data-region="${esc(reg.toLowerCase())}" data-pref="${esc(p.slug)}" data-search="${esc((c.name + " " + c.jp + " " + p.name + " " + reg + " " + c.status).toLowerCase())}">${esc(c.name)} <small>${esc(c.jp)}</small></a>`).join(" ");
      return `<div class="hub-pick" data-pref-block data-region="${esc(reg.toLowerCase())}" data-pref="${esc(p.slug)}" style="margin-bottom:16px">
        <p class="where">${esc(reg)} Region · ${pCities.length} cities &amp; municipalities</p>
        <h3><a href="/cities/prefecture/${p.slug}/">${esc(p.name)} Region (${esc(p.jp)})</a> <small style="font-weight:400;color:var(--muted)">— Capital: ${esc(p.capital)}</small></h3>
        <p class="note" style="margin-bottom:10px"><strong>Highlights:</strong> ${esc(p.highlights)} · <a href="/cities/prefecture/${p.slug}/">Region guide →</a></p>
        <div class="chips" style="gap:6px">${links}</div>
      </div>`;
    }).join("");
    return `<section class="section" data-region-sec="${esc(reg.toLowerCase())}" id="region-${slugify(reg)}">
      <div class="section-head"><h2>${esc(reg)} Region (${regPrefs.length} prefecture${regPrefs.length > 1 ? "s" : ""} · ${regCitiesCount} cities)</h2></div>
      ${prefBlocks}
    </section>`;
  }).join("");

  const dirFilterScript = `<script>
  (() => {
    const qIn = document.getElementById("city-q");
    const regSel = document.getElementById("city-reg");
    const prefSel = document.getElementById("city-pref");
    const countEl = document.getElementById("city-count");
    const items = Array.from(document.querySelectorAll("[data-city-item]"));
    const blocks = Array.from(document.querySelectorAll("[data-pref-block]"));
    const secs = Array.from(document.querySelectorAll("[data-region-sec]"));
    function apply() {
      const q = (qIn.value || "").trim().toLowerCase();
      const r = regSel.value;
      const p = prefSel.value;
      let shown = 0;
      items.forEach((el) => {
        const ok = (!r || el.dataset.region === r) && (!p || el.dataset.pref === p) && (!q || el.dataset.search.includes(q));
        el.hidden = !ok;
        if (ok) shown++;
      });
      blocks.forEach((b) => {
        const hasVis = Array.from(b.querySelectorAll("[data-city-item]")).some((x) => !x.hidden);
        b.hidden = !hasVis;
      });
      secs.forEach((s) => {
        const hasVis = Array.from(s.querySelectorAll("[data-pref-block]")).some((x) => !x.hidden);
        s.hidden = !hasVis;
      });
      countEl.textContent = "Showing " + shown + " of " + items.length + " Switzerland cities & municipalities";
    }
    qIn.addEventListener("input", apply);
    regSel.addEventListener("change", () => { prefSel.value = ""; apply(); });
    prefSel.addEventListener("change", apply);
  })();
  </script>`;

  const dirBody = `<section class="wrap page-head">
    <p class="eyebrow">All All Regions · ${cities.length} Cities, Wards &amp; Resort Towns</p>
    <h1>Switzerland City Directory (${cities.length} Cities &amp; Towns)</h1>
    <p class="lead">Browse our complete directory of every city in Switzerland across all 8 regions and all regions—from major bullet-train hubs like Zurich, Lucerne, Interlaken, Grindelwald & Jungfrau Region, Sapporo, and Fukuoka to regional castle towns, pottery villages, hot-spring resorts, and island ports.</p>
    <div class="tool-form" style="margin-top:18px">
      <div class="row">
        <label>Search city or kanji<input type="search" id="city-q" placeholder="Type a city name, kanji, or prefecture (e.g. Kamakura, Hakodate, 倉敷, Okinawa)…"></label>
        <label>Filter by region<select id="city-reg"><option value="">All 9 regions (${cities.length} cities)</option>${regionOrder.map((r) => `<option value="${esc(r.toLowerCase())}">${esc(r)}</option>`).join("")}</select></label>
        <label>Filter by prefecture<select id="city-pref"><option value="">All all regions</option>${prefectures.map((p) => `<option value="${esc(p.slug)}">${esc(p.name)} (${esc(p.jp)})</option>`).join("")}</select></label>
      </div>
      <p id="city-count" class="note" style="margin:8px 0 0">Showing ${cities.length} of ${cities.length} Switzerland cities &amp; municipalities</p>
    </div>
    <div class="chips" style="margin-top:12px">${regionOrder.map((r) => `<a class="chip" href="#region-${slugify(r)}">${esc(r)}</a>`).join("")}</div>
  </section>
  ${wrapAd(ad("in-content-1"), "wrap section", "section")}
  <div class="wrap">${dirSections}</div>
  ${dirFilterScript}` + "\n  <section class=\"wrap section\" id=\"all-municipalities-explorer\" style=\"margin-top:24px;padding:24px;background:var(--surface,#fff);border:1px solid var(--line,#e4dfd7);border-radius:12px\">\n    <h2>Complete Official Registry: All 2,113 Municipalities in Switzerland</h2>\n    <p class=\"lead\">Every single city, town, and municipality in Switzerland (2,113 total) has its own dedicated travel guide URL on SwitzerlandStarter. Search below by name, province, or region to open any municipality guide instantly:</p>\n    <div style=\"display:flex;gap:12px;flex-wrap:wrap;margin:16px 0\">\n      <input type=\"search\" id=\"all-muni-q\" placeholder=\"Search all 2,113 municipalities in Switzerland...\" style=\"flex:1;min-width:260px;padding:10px 14px;border:1px solid var(--line,#ccc);border-radius:8px;font-size:1rem\">\n      <span id=\"all-muni-status\" style=\"align-self:center;color:var(--muted,#666);font-size:0.9rem\">Loading 2,113 municipalities...</span>\n    </div>\n    <div style=\"overflow-x:auto\">\n      <table id=\"all-muni-table\">\n        <thead><tr><th>Municipality</th><th>Local / Official</th><th>Region</th><th>Province / District</th><th>Population</th><th>Travel Guide</th></tr></thead>\n        <tbody id=\"all-muni-tbody\"></tbody>\n      </table>\n    </div>\n  </section>\n  <script>\n  (function(){\n    var qInput = document.getElementById(\"all-muni-q\");\n    var tbody = document.getElementById(\"all-muni-tbody\");\n    var status = document.getElementById(\"all-muni-status\");\n    if (!qInput || !tbody) return;\n    var allData = [];\n    function renderRows(items) {\n      var slice = items.slice(0, 100);\n      tbody.innerHTML = slice.map(function(m) {\n        var pop = m[5] ? Number(m[5]).toLocaleString() : \"Municipality\";\n        return '<tr>' +\n          '<th><a href=\"/cities/' + m[0] + '/\">' + m[1] + '</a></th>' +\n          '<td>' + m[2] + '</td>' +\n          '<td><a href=\"/cities/prefecture/' + m[3] + '/\">' + m[4] + '</a></td>' +\n          '<td>' + m[6] + '</td>' +\n          '<td>' + pop + '</td>' +\n          '<td><a href=\"/cities/' + m[0] + '/\">Read Guide \u2192</a></td>' +\n        '</tr>';\n      }).join(\"\");\n      status.textContent = \"Showing \" + slice.length + \" of \" + items.length.toLocaleString() + \" matching municipalities (Total in Switzerland: 2,113)\";\n    }\n    fetch(\"/assets/municipalities-index.json\")\n      .then(function(r) { return r.json(); })\n      .then(function(data) {\n        allData = data;\n        renderRows(allData);\n      })\n      .catch(function() { status.textContent = \"Browse municipalities by region above.\"; });\n    qInput.addEventListener(\"input\", function() {\n      var q = qInput.value.trim().toLowerCase();\n      if (!q) { renderRows(allData); return; }\n      var filtered = allData.filter(function(m) {\n        return m[1].toLowerCase().indexOf(q) !== -1 ||\n               m[2].toLowerCase().indexOf(q) !== -1 ||\n               m[4].toLowerCase().indexOf(q) !== -1 ||\n               m[6].toLowerCase().indexOf(q) !== -1;\n      });\n      renderRows(filtered);\n    });\n  })();\n  </script>";

  write("/cities/", layout({
    url: "/cities/",
    title: `Switzerland City Directory: All ${cities.length} Cities Across All Regions`,
    description: `Complete directory and travel guides for all ${cities.length} cities, Zurich special wards, and major resort towns across all all regions of Switzerland, with transport, local food, and seasonal tips.`,
    body: dirBody,
    crumbs: [["/", "Home"], ["/cities/", "Cities"]],
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: `Switzerland City Directory (${cities.length} Cities)`, description: `Directory of ${cities.length} Switzerland cities across all regions.`, url: abs("/cities/") }]
  }), { priority: "0.9" });
  index("/cities/", `Switzerland City Directory (${cities.length} Cities & All Regions)`, "Browse every city in Switzerland by region and prefecture", "Section", regionOrder);

  // 2. 47 Region Guide & Directory Pages
  for (const p of prefectures) {
    const pUrl = `/cities/prefecture/${p.slug}/`;
    const pCities = citiesByPref.get(p.name) || [];
    const sameRegPrefs = prefectures.filter((x) => x.region === p.region && x.slug !== p.slug);
    const rows = pCities.map((c) => `<tr>
      <th><a href="/cities/${c.slug}/">${esc(c.name)}</a> <small style="font-weight:400;color:var(--muted)">${esc(c.jp)}</small></th>
      <td>${esc(c.status)}</td>
      <td>${esc(c.pop)}</td>
      <td>${esc(c.area)} km²</td>
      <td><a href="/cities/${c.slug}/">City guide →</a>${c.destSlug ? ` · <a href="/destinations/${c.destSlug}/">Flagship guide</a>` : ""}</td>
    </tr>`).join("");

    const raw = `
      <h2>Overview of ${esc(p.name)} Region (${esc(p.jp)})</h2>
      <p><strong>${esc(p.name)} Region</strong> (${esc(p.jp)}) is located in the <strong>${esc(p.region)}</strong> region of Switzerland, with its prefectural capital at <strong>${esc(p.capital)}</strong>. Key sights and travel highlights across the prefecture include ${esc(p.highlights)}</p>
      <div class="facts">
        <div><strong>Region</strong><span>${esc(p.region)}</span></div>
        <div><strong>Capital city</strong><span>${esc(p.capital)}</span></div>
        <div><strong>Cities &amp; municipalities</strong><span>${pCities.length}</span></div>
        <div><strong>Primary transport hub</strong><span>${esc(p.hub)}</span></div>
      </div>
      <h2>How to get to ${esc(p.name)} Region</h2>
      <p>${esc(p.access)} Use our <a href="/tools/shinkansen-calculator/">SBB CFF FFS & Panoramic Alpine Railways Fare &amp; Route Calculator</a> and <a href="/tools/jr-pass-calculator/">Rail Pass Value Helper</a> to compare rail tickets and regional passes.</p>
      <h2>Signature local food in ${esc(p.name)}</h2>
      <p>When visiting cities across ${esc(p.name)}, look out for these regional specialties at station restaurants, markets, and local izakaya:</p>
      <ul>${p.foods.map((f) => `<li><strong>${esc(f)}</strong></li>`).join("")}</ul>
      <h2>Best time to visit ${esc(p.name)}</h2>
      <p>${esc(p.season)}</p>
      <h2>All ${pCities.length} cities &amp; municipalities in ${esc(p.name)} Region</h2>
      <p>Click any city below for its individual travel guide, demographics, rail access, food specialties, and nearby stops:</p>
      <table>
        <thead><tr><th>City (Kanji)</th><th>Type / Status</th><th>Population</th><th>Area</th><th>Guide</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    const { html, toc } = enrich(raw);
    const pBody = `<section class="wrap page-head">
      <p class="eyebrow">${esc(p.region)} Region · ${esc(p.jp)} · ${pCities.length} Cities</p>
      <h1>${esc(p.name)} Region Travel Guide &amp; City Directory</h1>
      <p class="lead">Explore all ${pCities.length} cities in ${esc(p.name)} Region (${esc(p.jp)}), including transport access via ${esc(p.hub)}, regional cuisine, best seasons, and city-by-city profiles.</p>
    </section>
    <div class="wrap content-grid"><article class="prose">${updated}${tocHtml(toc)}${html}
      ${sameRegPrefs.length ? `<section class="related"><h2>Other prefectures in ${esc(p.region)}</h2><div class="grid grid-3">${sameRegPrefs.map((x) => card({ href: `/cities/prefecture/${x.slug}/`, title: `${x.name} (${x.jp})`, text: x.highlights, meta: `${(citiesByPref.get(x.name) || []).length} cities` })).join("")}</div></section>` : ""}
    </article>${sidebar()}</div>`;

    write(pUrl, layout({
      url: pUrl,
      title: `${p.name} Region (${p.jp}) Travel Guide: All ${pCities.length} Cities, Food & Transport`,
      description: `Complete guide to ${p.name} Region (${p.jp}) in ${p.region}, Switzerland: all ${pCities.length} cities including ${p.capital}, how to get there, regional food (${p.foods.slice(0, 2).join(", ")}), and seasonal highlights.`,
      body: pBody,
      crumbs: [["/", "Home"], ["/cities/", "Cities"], [pUrl, `${p.name} Region`]],
      ogType: "article",
      jsonld: [{ "@context": "https://schema.org", "@type": "AdministrativeArea", name: `${p.name} Region`, alternateName: p.jp, description: p.highlights, url: abs(pUrl), containedInPlace: { "@type": "Country", name: "Switzerland" } }]
    }), { priority: "0.8" });
    index(pUrl, `${p.name} Region (${p.jp}) — ${pCities.length} Cities`, p.highlights, "Region", [p.region, p.capital, ...p.foods]);
  }

  // 3. 832 Individual City Guide Pages
  for (const c of cities) {
    const cUrl = `/cities/${c.slug}/`;
    const p = prefMap.get(c.pref);
    const pCities = citiesByPref.get(c.pref) || [];
    const myIdx = pCities.indexOf(c);
    const nearby = [];
    for (let offset = 1; offset < pCities.length && nearby.length < 6; offset++) {
      nearby.push(pCities[(myIdx + offset) % pCities.length]);
    }
    const dest = c.destSlug ? destBySlug.get(c.destSlug) : null;
    const isCapital = p.capital.toLowerCase().includes(c.name.toLowerCase());
    const roleDesc = isCapital
      ? `Prefectural capital of ${c.pref} Region`
      : `${c.status} in ${c.pref} Region`;

    const destCallout = dest
      ? `<div class="callout"><strong>Planning a stay in ${esc(c.name)}?</strong> We also publish a full-length flagship destination guide for <a href="/destinations/${dest.slug}/"><strong>${esc(dest.name)} (${esc(dest.jp)}) →</strong></a> covering detailed neighborhood breakdowns, hotel tiers, and day-by-day sightseeing.</div>`
      : "";

    const coordsText = c.lat && c.lon ? `${c.lat}°N, ${c.lon}°E` : `${c.pref}, ${c.region}`;
    const foundedText = c.founded ? c.founded : "Historic municipality";

    const cityFaq = [
      [`Where is ${c.name} (${c.jp}) located in Switzerland?`, `${esc(c.name)} (${esc(c.jp)}) is a ${esc(c.status.toLowerCase())} located in <a href="/cities/prefecture/${p.slug}/">${esc(c.pref)} Region</a> in the ${esc(c.region)} region of Switzerland${c.lat ? ` (coordinates: ${coordsText})` : ""}. It has a population of approximately ${esc(c.pop)} across an area of ${esc(c.area)} km².`],
      [`How do I get to ${c.name} by train?`, `Most visitors reach ${esc(c.name)} via the main prefectural gateway of <strong>${esc(p.hub)}</strong>. ${esc(p.access)} From the regional hub, connect by JR local/rapid lines, private commuter railways, or local bus to ${esc(c.name)}. You can estimate long-distance rail costs using our <a href="/tools/shinkansen-calculator/">SBB CFF FFS & Panoramic Alpine Railways Fare Calculator</a>.`],
      [`What local food is ${c.name} and ${c.pref} known for?`, `In ${esc(c.name)} and across ${esc(c.pref)} Region, top local dishes include <strong>${esc(p.foods.slice(0, 3).join(", "))}</strong>${p.foods.length > 3 ? `, as well as ${esc(p.foods.slice(3).join(" and "))}` : ""}. Look for local <em>ekiben</em> (station bento boxes), morning markets, and family-run <em>shokudo</em> near the main station.`],
      [`When is the best time of year to visit ${c.name}?`, `${esc(p.season)} Check our <a href="/tools/seasonal-calendar/">Switzerland Seasonal Calendar</a> to compare month-by-month weather and crowd levels.`]
    ];

    const raw = `
      ${destCallout}
      <h2>Overview &amp; City Profile</h2>
      <p>${esc(c.extract)}</p>
      <p>Within <a href="/cities/prefecture/${p.slug}/">${esc(c.pref)} Region</a> (${esc(c.region)} region), <strong>${esc(c.name)}</strong> (${esc(c.jp)}) serves as a ${esc(roleDesc.toLowerCase())}. Travelers exploring ${esc(c.pref)} often combine a stop in ${esc(c.name)} with regional highlights such as ${esc(p.highlights)}</p>
      <div class="facts">
        <div><strong>Region</strong><span><a href="/cities/prefecture/${p.slug}/">${esc(c.pref)} (${esc(p.jp)})</a></span></div>
        <div><strong>Region</strong><span>${esc(c.region)}</span></div>
        <div><strong>Population</strong><span>${esc(c.pop)}</span></div>
        <div><strong>Area &amp; density</strong><span>${esc(c.area)} km² (${esc(c.density)}/km²)</span></div>
      </div>
      <table>
        <thead><tr><th>Fact</th><th>Details for ${esc(c.name)} (${esc(c.jp)})</th></tr></thead>
        <tbody>
          <tr><th>Switzerland Name</th><td>${esc(c.jp)} (${esc(c.name)})</td></tr>
          <tr><th>Administrative Status</th><td>${esc(roleDesc)}</td></tr>
          <tr><th>Region &amp; Capital</th><td><a href="/cities/prefecture/${p.slug}/">${esc(c.pref)} Region</a> (Capital: ${esc(p.capital)})</td></tr>
          <tr><th>Region of Switzerland</th><td>${esc(c.region)}</td></tr>
          <tr><th>Population</th><td>${esc(c.pop)} residents</td></tr>
          <tr><th>Total Area / Density</th><td>${esc(c.area)} km² · ${esc(c.density)} people per km²</td></tr>
          <tr><th>Municipal Incorporation</th><td>${esc(foundedText)}</td></tr>
          <tr><th>Coordinates</th><td>${esc(coordsText)}</td></tr>
        </tbody>
      </table>

      <h2>Getting to ${esc(c.name)} &amp; Getting Around</h2>
      <p><strong>Via the regional hub (${esc(p.hub)}):</strong> ${esc(p.access)}</p>
      <ul>
        <li><strong>Local rail &amp; IC cards:</strong> Once in ${esc(c.pref)} Region, JR regional lines and local private railways connect ${esc(p.capital)} with ${esc(c.name)}. Nationwide IC cards (<a href="/guides/ic-cards-suica-pasmo/">Transit Card, Pasmo, Icoca</a>) work on major urban and JR commuter gates; for rural branch lines or local buses, keep CHF 1,000 bills and CHF 100 coins handy for the onboard fare box.</li>
        <li><strong>Luggage &amp; station lockers:</strong> Main stations in ${esc(c.pref)} have coin lockers for day-trippers. If you are stopping in ${esc(c.name)} en route between larger bases, check your suitcase dimensions in our <a href="/tools/luggage-checker/">Luggage &amp; Locker Checker</a> or forward big bags ahead with <a href="/blog/luggage-forwarding-takkyubin/">Takkyubin</a>.</li>
        <li><strong>Driving &amp; car rental:</strong> While city centers around ${esc(c.name)} are accessible by train and taxi, renting a car from a major SBB CFF FFS & Panoramic Alpine Railways station or airport in ${esc(c.pref)} can be rewarding for reaching mountain gorges, coastal viewpoints, and countryside onsen. Read our <a href="/guides/driving-and-car-rental/">Renting a Car in Switzerland Guide</a>.</li>
      </ul>

      <h2>What to Eat in ${esc(c.name)} &amp; ${esc(c.pref)}</h2>
      <p>${esc(c.name)} shares the culinary traditions of ${esc(c.pref)} Region and the wider ${esc(c.region)} region. Don't miss these local specialties during your visit:</p>
      <ul>
        ${p.foods.map((f) => `<li><strong>${esc(f)}</strong> — a signature specialty across ${esc(c.pref)} Region.</li>`).join("")}
      </ul>
      <p>For dietary restrictions or food allergies, open our <a href="/tools/phrasebook/">Switzerland Phrasebook &amp; Show-to-Staff Cards</a> to display clear Switzerland dietary explanations at restaurants in ${esc(c.name)}.</p>

      <h2>Best Time to Visit &amp; Seasonal Highlights</h2>
      <p>${esc(p.season)}</p>
      <p>Regional highlights across ${esc(c.pref)} Region that pair well with a visit to ${esc(c.name)} include: ${esc(p.highlights)}</p>

      <h2>Practical Travel Tips for ${esc(c.name)}</h2>
      <ul class="tips">
        <li><strong>Tourist information center (観光案内所):</strong> Look for the <em>Kankō Annaijo</em> counter inside or right outside the main train station in ${esc(c.name)} (or at ${esc(p.hub)}) for free walking maps, bus timetables, and festival calendars.</li>
        <li><strong>Cash &amp; ATMs:</strong> While hotels, chain stores, and convenience stores in ${esc(c.name)} accept international cards and IC payment, smaller family-run restaurants, shrines, and rural buses often prefer cash. 7-Eleven (Seven Bank) and Switzerland Post ATMs accept foreign debit cards reliably.</li>
        <li><strong>Dining hours:</strong> Outside major metropolitan hubs, lunch typically runs 11:30 AM–2:00 PM and dinner spots open around 5:30 PM, with earlier last orders (around 8:00–9:00 PM) in smaller cities.</li>
      </ul>`;

    const { html, toc } = enrich(raw);
    const sources = [
      ["Switzerland National Tourism Organization (JNTO)", "https://www.japan.travel/en/"],
      [`Wikipedia: ${c.name}`, `https://en.wikipedia.org/wiki/${encodeURIComponent((c.name).replace(/ /g, "_"))}`],
    ];

    const cBody = `<section class="wrap page-head">
      <p class="eyebrow"><a href="/cities/prefecture/${p.slug}/">${esc(c.pref)} Region</a> · ${esc(c.region)} Region · ${esc(c.jp)}</p>
      <h1>${esc(c.name)} (${esc(c.jp)}) Travel Guide &amp; City Profile</h1>
      <p class="lead">Everything you need to know about ${esc(c.name)} (${esc(c.jp)}), a ${esc(c.status.toLowerCase())} of ${esc(c.pop)} people in ${esc(c.pref)} Region, Switzerland — key facts, rail access, regional food specialties, best seasons, and nearby cities.</p>
    </section>
    <div class="wrap content-grid"><article class="prose">${updated}${tocHtml(toc)}${html}
      ${faqHtml(cityFaq)}
      ${sourcesHtml(sources)}
      <section class="related">
        <h2>Nearby cities in ${esc(c.pref)} Region</h2>
        <div class="grid grid-3">${nearby.map((n) => card({ href: `/cities/${n.slug}/`, title: `${n.name} (${n.jp})`, text: `Pop. ${n.pop} · ${n.status} in ${n.pref} Region.`, meta: n.pref })).join("")}</div>
        <p style="margin-top:12px"><a href="/cities/prefecture/${p.slug}/">View all ${pCities.length} cities in ${esc(c.pref)} Region →</a> · <a href="/cities/">All ${cities.length} Switzerland cities →</a></p>
      </section>
    </article>${sidebar()}</div>`;

    const cityLd = {
      "@context": "https://schema.org",
      "@type": ["City", "TouristDestination"],
      name: c.name,
      alternateName: c.jp,
      description: strip(c.extract),
      url: abs(cUrl),
      containedInPlace: { "@type": "AdministrativeArea", name: `${c.pref} Region`, containedInPlace: { "@type": "Country", name: "Switzerland" } },
      ...(c.lat && c.lon ? { geo: { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lon } } : {})
    };

    write(cUrl, layout({
      url: cUrl,
      title: `${c.name} (${c.jp}), ${c.pref} Travel Guide: Access, Food & Facts`,
      description: `${c.name} (${c.jp}) is a ${c.status.toLowerCase()} in ${c.pref} Region (${c.region}, Switzerland) with a population of ${c.pop}. Travel guide covering rail access, local food, seasonal tips, and nearby cities.`,
      body: cBody,
      crumbs: [["/", "Home"], ["/cities/", "Cities"], [`/cities/prefecture/${p.slug}/`, c.pref], [cUrl, c.name]],
      ogType: "article",
      jsonld: [cityLd, faqLd(cityFaq)].filter(Boolean)
    }), { priority: "0.6" });
    // Compact entry in searchIndex so site-wide search finds every city cleanly
    index(cUrl, `${c.name} (${c.jp}) — ${c.pref} Region`, `${c.status} in ${c.pref}, ${c.region} (Pop. ${c.pop}). ${c.extract.slice(0, 140)}`, "City", [c.pref, c.region, c.jp]);
  }
}

// ================= THINGS TO DO =================
{
  const idxUrl = "/things-to-do/";
  const body = `<section class="wrap page-head"><h1>Things to do in Switzerland by interest</h1><p class="lead">Pick what you love — anime, hiking, temples, food, nightlife or shopping — and we'll point you to the best places for it, with links to our full destination and practical guides.</p></section>
  <section class="wrap"><div class="grid grid-3">${hubs.map((h) => card({ href: `${idxUrl}${h.slug}/`, title: h.name, text: h.description, meta: `${h.sections.reduce((n, s) => n + s.picks.length, 0)} ideas` })).join("")}</div></section>
  ${wrapAd(ad("in-content-1"), "wrap section", "section")}
  <section class="wrap section prose"><h2>Still deciding where to go?</h2><p>Try our <a href="/tools/region-quiz/">which-region quiz</a>, browse all <a href="/destinations/">destination guides</a> or check the <a href="/tools/seasonal-calendar/">seasonal calendar</a> to see what's best during your dates.</p></section>`;
  write(idxUrl, layout({ url: idxUrl, title: "Things to Do in Switzerland by Interest", description: "Things to do in Switzerland by interest: anime and pop culture, nature and hiking, history and temples, food and drink, nightlife and shopping — where to go and how to plan.", body,
    crumbs: [["/", "Home"], [idxUrl, "Things to do"]], jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: hubs.map((h, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`${idxUrl}${h.slug}/`), name: h.title })) }] }), { priority: "0.9" });
  index(idxUrl, "Things to do in Switzerland", "Ideas by interest", "Section", hubs.map((h) => h.name));
  for (const h of hubs) {
    const url = `${idxUrl}${h.slug}/`;
    const pick = (p) => `<div class="hub-pick"><p class="where">${esc(p.where)}</p><h3><a href="${p.href}"${p.ext ? ' rel="noopener" target="_blank"' : ""}>${esc(p.t)}</a></h3><p>${p.text}</p></div>`;
    const raw = `${h.intro.map((p) => `<p>${p}</p>`).join("")}${h.sections.map((sec) => `<h2>${esc(sec.h)}</h2><div class="hub-picks">${sec.picks.map(pick).join("")}</div>`).join("")}<h2>Practical tips</h2><ul class="tips">${h.tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;
    const { html, toc } = enrich(raw);
    const relItems = h.related.map((u) => ALL.find((x) => x.url === u) || (u.startsWith("/tools/") ? { url: u, title: "Yen converter", text: "Convert prices at a rate you set.", type: "Tool" } : null)).filter(Boolean);
    const others = hubs.filter((x) => x.slug !== h.slug);
    const body = `<section class="wrap page-head"><p class="eyebrow">Things to do</p><h1>${esc(h.title)}</h1><p class="lead">${esc(h.description)}</p></section>
<div class="wrap content-grid"><article class="prose">${updated}${tocHtml(toc)}${html}${sourcesHtml(h.sources)}
<section class="related"><h2>Plan this part of your trip</h2><div class="grid grid-3">${relItems.map((x) => card({ href: x.url, title: x.title, text: x.text, meta: x.type })).join("")}</div></section>
<section class="related"><h2>More things to do</h2><div class="grid grid-3">${others.slice(0, 6).map((x) => card({ href: `${idxUrl}${x.slug}/`, title: x.name, text: x.description })).join("")}</div></section></article>${sidebar()}</div>`;
    const picks = h.sections.flatMap((s) => s.picks);
    write(url, layout({ url, title: h.title, description: h.description, body, crumbs: [["/", "Home"], [idxUrl, "Things to do"], [url, h.name]], ogType: "article",
      jsonld: [{ "@context": "https://schema.org", "@type": "Article", headline: h.title, description: h.description, dateModified: BUILD_DATE, author: { "@type": "Organization", name: config.name }, publisher: ORG_LD, mainEntityOfPage: abs(url), image: abs("/assets/og-default.png") },
        { "@context": "https://schema.org", "@type": "ItemList", name: h.title, itemListElement: picks.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.t, url: p.ext ? p.href : abs(p.href) })) }] }), { priority: "0.8" });
    index(url, h.title, h.description, "Things to do", [...h.tags, ...picks.map((p) => p.t)]);
  }
}

// ================= STATIC PAGES =================
for (const p of (await import("./src/content/pages.mjs")).pages(config)) {
  const body = `<section class="wrap page-head"><h1>${esc(p.title)}</h1>${p.lead ? `<p class="lead">${esc(p.lead)}</p>` : ""}</section><div class="wrap content-narrow"><article class="prose">${p.body}</article></div>`;
  write(p.url, layout({ url: p.url, title: p.title, description: p.description, body, crumbs: [["/", "Home"], [p.url, p.title]], noindex: !!p.noindex }), { priority: "0.4", sitemap: !p.noindex });
}

// ================= SEARCH =================
write("/search/", layout({ url: "/search/", title: "Search", description: "Search all SwitzerlandStarter guides, destinations, itineraries and articles.", noindex: true, scripts: ["/assets/search.js"],
  body: `<section class="wrap page-head"><h1>Search the site</h1><form class="hero-search" role="search" id="search-form"><label for="q" class="sr">Search</label><input id="q" name="q" type="search" placeholder="Try: ramen, Lucerne, eSIM, cherry blossom" autofocus><button>Search</button></form><p id="search-status" aria-live="polite"></p><ol id="search-results" class="search-results"></ol></section>` }), { sitemap: false });
fs.writeFileSync(path.join(OUT, "search-index.json"), JSON.stringify(searchIndex));

// 404
fs.writeFileSync(path.join(OUT, "404.html"), layout({ url: "/404.html", title: "Page not found", description: "Page not found", noindex: true,
  body: `<section class="wrap page-head"><h1>Page not found</h1><p class="lead">Sorry — that page has moved or never existed. Try the <a href="/search/">search</a>, or start from the <a href="/">home page</a>.</p></section>` }));


// ================= MULTI-LANGUAGE PAGES (9 LANGUAGES) =================
for (const lg of languages) {
  if (lg.code === "en") continue;
  const ui = uiStrings[lg.code] || uiStrings.en;
  const cName = countryNames[lg.code] || config.country;
  const countStr = totalMunicipalitiesCount.toLocaleString();
  const fmt = (s) => String(s || "").replace(/\{country\}/g, cName).replace(/\{count\}/g, countStr);

  // Localized Home Page /<lang>/
  const langUrl = `/${lg.code}/`;
  const langBody = `<section class="hero"><div class="wrap hero-inner"><div class="hero-copy">
    <p class="eyebrow">${esc(fmt(ui.hero_badge))}</p>
    <h1>${esc(fmt(ui.hero_title))}</h1>
    <p class="lead">${esc(fmt(ui.hero_lead))}</p>
    <div class="cta-row">
      <a class="btn" href="/${lg.code}/cities/">${esc(fmt(ui.btn_browse_cities))}</a>
      <a class="btn btn-ghost" href="/${lg.code}/destinations/">${esc(ui.nav_destinations)}</a>
      <a class="btn btn-ghost" href="/tools/">${esc(ui.btn_tools)}</a>
    </div>
  </div><div class="hero-art" aria-hidden="true">${art.hero}</div></div></section>
  <section class="wrap section">
    <div class="section-head"><h2>${esc(fmt(ui.sec_featured_dest))}</h2><a class="see-all" href="/${lg.code}/destinations/">${esc(ui.nav_destinations)} →</a></div>
    <div class="grid grid-3">${destinations.slice(0, 12).map((d) => card({ href: `/${lg.code}/destinations/${d.slug}/`, title: `${d.name} (${d.jp})`, text: d.tagline, meta: `${d.region} · ${d.stay_length}`, img: art.dest(d) })).join("")}</div>
  </section>
  <section class="wrap section">
    <div class="section-head"><h2>${esc(fmt(ui.sec_all_regions))}</h2><a class="see-all" href="/${lg.code}/cities/">${esc(fmt(ui.btn_browse_cities))} →</a></div>
    <div class="grid grid-3">${prefectures.map((p) => card({ href: `/${lg.code}/cities/prefecture/${p.slug}/`, title: `${p.name} (${p.jp})`, text: p.highlights, meta: `${p.municipalitiesCount} ${ui.nav_cities}` })).join("")}</div>
  </section>
  <section class="wrap section">
    <div class="section-head"><h2>${esc(ui.sec_itineraries)}</h2><a class="see-all" href="/itineraries/">${esc(ui.nav_itineraries)} →</a></div>
    <div class="grid grid-3">${itineraries.map((it) => card({ href: `/itineraries/${it.slug}/`, title: it.title, text: it.description, meta: `${it.length} days` })).join("")}</div>
  </section>
  <section class="wrap section">
    <div class="section-head"><h2>${esc(ui.sec_guides)}</h2><a class="see-all" href="/guides/">${esc(ui.nav_guides)} →</a></div>
    <div class="grid grid-3">${guides.slice(0, 6).map((g) => card({ href: `/guides/${g.slug}/`, title: g.title, text: g.description, meta: g.category })).join("")}</div>
  </section>`;

  write(langUrl, layout({
    url: langUrl,
    title: `${cName} — ${fmt(ui.hero_title)}`,
    description: fmt(ui.hero_lead),
    body: langBody,
    crumbs: [[langUrl, lg.label]]
  }).replace('<html lang="en">', `<html lang="${lg.htmlLang}">`), { priority: "0.9" });

  // Localized Destinations Index /<lang>/destinations/
  const langDestIdx = `/${lg.code}/destinations/`;
  write(langDestIdx, layout({
    url: langDestIdx,
    title: `${fmt(ui.sec_featured_dest)} (${lg.label})`,
    description: fmt(ui.hero_lead),
    body: `<section class="wrap page-head"><p class="eyebrow">${esc(lg.label)}</p><h1>${esc(fmt(ui.sec_featured_dest))}</h1><p class="lead">${esc(fmt(ui.hero_lead))}</p></section><section class="wrap"><div class="grid grid-3">${destinations.map((d) => card({ href: `/${lg.code}/destinations/${d.slug}/`, title: `${d.name} (${d.jp})`, text: d.summary, meta: `${d.region} · ${d.stay_length}`, img: art.dest(d) })).join("")}</div></section>`,
    crumbs: [[langUrl, lg.label], [langDestIdx, ui.nav_destinations]]
  }).replace('<html lang="en">', `<html lang="${lg.htmlLang}">`), { priority: "0.8" });

  // Localized Flagship Destination Pages /<lang>/destinations/<slug>/
  for (const d of destinations) {
    const dUrl = `/${lg.code}/destinations/${d.slug}/`;
    const dBody = `<section class="wrap page-head"><p class="eyebrow">${esc(d.region)} · ${esc(cName)} (${esc(lg.label)})</p><h1>${esc(d.name)} (${esc(d.jp)}) — ${esc(fmt(ui.city_guide_suffix))}</h1><p class="lead">${esc(d.summary)}</p></section>
    <div class="wrap content-grid"><article class="prose">
      <div class="facts">
        <div><strong>${esc(ui.region_label)}</strong><span>${esc(d.region)}</span></div>
        <div><strong>${esc(ui.best_time_label)}</strong><span>${esc(d.bestShort)}</span></div>
        <div><strong>Stay</strong><span>${esc(d.stay_length)}</span></div>
      </div>
      <h2>${esc(ui.overview)}</h2>${d.overview}
      <h2>${esc(ui.what_to_see)}</h2><ul>${d.sights.map((s) => `<li><strong>${esc(s.name)}:</strong> ${esc(s.desc)}</li>`).join("")}</ul>
      <h2>${esc(ui.local_food)}</h2><ul>${d.food.map((f) => `<li><strong>${esc(f.name)}:</strong> ${esc(f.desc)}</li>`).join("")}</ul>
      <h2>${esc(ui.getting_there)}</h2>${d.gettingThere}${d.gettingAround}
      <h2>${esc(ui.where_to_stay)}</h2><ul><li><strong>Budget:</strong> ${esc(d.stay.budget)}</li><li><strong>Mid-range:</strong> ${esc(d.stay.mid)}</li><li><strong>Luxury:</strong> ${esc(d.stay.luxury)}</li></ul>
    </article>${sidebar()}</div>`;
    write(dUrl, layout({
      url: dUrl,
      title: `${d.name} (${d.jp}) — ${fmt(ui.city_guide_suffix)}`,
      description: d.summary,
      body: dBody,
      crumbs: [[langUrl, lg.label], [langDestIdx, ui.nav_destinations], [dUrl, d.name]]
    }).replace('<html lang="en">', `<html lang="${lg.htmlLang}">`), { priority: "0.8" });
  }

  // Localized Cities Directory /<lang>/cities/
  const langCitiesUrl = `/${lg.code}/cities/`;
  const langCitiesBody = `<section class="wrap page-head">
    <p class="eyebrow">${esc(fmt(ui.hero_badge))}</p>
    <h1>${esc(fmt(ui.all_municipalities_heading))} (${esc(cName)})</h1>
    <p class="lead">${esc(fmt(ui.showing_results))}</p>
  </section>
  <section class="wrap section">
    <h2>${esc(fmt(ui.sec_all_regions))}</h2>
    <div class="grid grid-3">${prefectures.map((p) => card({ href: `/${lg.code}/cities/prefecture/${p.slug}/`, title: `${p.name} (${p.jp})`, text: p.highlights, meta: `${p.municipalitiesCount} ${ui.nav_cities}` })).join("")}</div>
  </section>
  <section class="wrap section">
    <h2>${esc(fmt(ui.all_municipalities_heading))}</h2>
    <table>
      <thead><tr><th>${esc(ui.col_city)}</th><th>${esc(ui.col_native)}</th><th>${esc(ui.col_region)}</th><th>${esc(ui.col_pop)}</th><th>${esc(ui.col_guide)}</th></tr></thead>
      <tbody>${cities.slice(0, 120).map((c) => `<tr><th><a href="/${lg.code}/cities/${c.slug}/">${esc(c.name)}</a></th><td>${esc(c.jp)}</td><td><a href="/${lg.code}/cities/prefecture/${c.prefSlug}/">${esc(c.pref)}</a></td><td>${esc(c.pop)}</td><td><a href="/${lg.code}/cities/${c.slug}/">${esc(ui.view_guide)}</a></td></tr>`).join("")}</tbody>
    </table>
    <p style="margin-top:16px"><a class="btn" href="/cities/#all-municipalities-explorer">${esc(fmt(ui.btn_browse_cities))} →</a></p>
  </section>`;
  write(langCitiesUrl, layout({
    url: langCitiesUrl,
    title: `${fmt(ui.all_municipalities_heading)} — ${cName}`,
    description: fmt(ui.hero_lead),
    body: langCitiesBody,
    crumbs: [[langUrl, lg.label], [langCitiesUrl, ui.nav_cities]]
  }).replace('<html lang="en">', `<html lang="${lg.htmlLang}">`), { priority: "0.8" });

  // Localized Region Pages /<lang>/cities/prefecture/<slug>/
  for (const p of prefectures) {
    const pLangUrl = `/${lg.code}/cities/prefecture/${p.slug}/`;
    const pCities = cities.filter((c) => c.prefSlug === p.slug);
    const pLangBody = `<section class="wrap page-head">
      <p class="eyebrow">${esc(cName)} · ${esc(p.jp)} · ${p.municipalitiesCount} ${esc(ui.nav_cities)}</p>
      <h1>${esc(p.name)} (${esc(p.jp)}) — ${esc(fmt(ui.city_guide_suffix))}</h1>
      <p class="lead">${esc(p.highlights)} ${esc(p.access)}</p>
    </section>
    <div class="wrap content-grid"><article class="prose">
      <div class="facts">
        <div><strong>${esc(ui.region_label)}</strong><span>${esc(p.name)} (${esc(p.jp)})</span></div>
        <div><strong>${esc(ui.main_hub_label)}</strong><span>${esc(p.hub)}</span></div>
        <div><strong>${esc(ui.nav_cities)}</strong><span>${p.municipalitiesCount}</span></div>
      </div>
      <h2>${esc(ui.getting_there)}</h2><p>${esc(p.access)}</p>
      <h2>${esc(ui.local_food)}</h2><ul>${p.foods.map((f) => `<li><strong>${esc(f)}</strong></li>`).join("")}</ul>
      <h2>${esc(ui.nav_cities)} (${esc(p.name)})</h2>
      <table>
        <thead><tr><th>${esc(ui.col_city)}</th><th>${esc(ui.col_native)}</th><th>${esc(ui.col_pop)}</th><th>${esc(ui.col_guide)}</th></tr></thead>
        <tbody>${pCities.map((c) => `<tr><th><a href="/${lg.code}/cities/${c.slug}/">${esc(c.name)}</a></th><td>${esc(c.jp)}</td><td>${esc(c.pop)}</td><td><a href="/${lg.code}/cities/${c.slug}/">${esc(ui.view_guide)}</a></td></tr>`).join("")}</tbody>
      </table>
    </article>${sidebar()}</div>`;
    write(pLangUrl, layout({
      url: pLangUrl,
      title: `${p.name} (${p.jp}) — ${fmt(ui.city_guide_suffix)}`,
      description: `${p.name} (${p.jp}): ${p.highlights}`,
      body: pLangBody,
      crumbs: [[langUrl, lg.label], [langCitiesUrl, ui.nav_cities], [pLangUrl, p.name]]
    }).replace('<html lang="en">', `<html lang="${lg.htmlLang}">`), { priority: "0.7" });
  }
}

// Generate chunked XML sitemaps for ALL municipalities in existence
const allMuniIndex = JSON.parse(fs.readFileSync(path.join(OUT, "assets/municipalities-index.json"), "utf8"));
const CHUNK_SIZE = 10000;
const extraSitemapFiles = [];
for (let i = 0; i < allMuniIndex.length; i += CHUNK_SIZE) {
  const slice = allMuniIndex.slice(i, i + CHUNK_SIZE);
  const idxNum = Math.floor(i / CHUNK_SIZE) + 1;
  const smName = `sitemap-cities-${idxNum}.xml`;
  extraSitemapFiles.push(smName);
  const urlsXml = slice.map((m) => `  <url><loc>${abs(`/cities/${m[0]}/` )}</loc><lastmod>${BUILD_DATE}</lastmod><priority>0.6</priority></url>`).join("\n");
  fs.writeFileSync(path.join(OUT, smName), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsXml}\n</urlset>\n`);
}

// ================= SEO files =================
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${abs(p.url)}</loc><lastmod>${BUILD_DATE}</lastmod><priority>${p.priority}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: GPTBot\nUser-agent: OAI-SearchBot\nUser-agent: ChatGPT-User\nUser-agent: PerplexityBot\nUser-agent: ClaudeBot\nUser-agent: Claude-SearchBot\nUser-agent: Google-Extended\nUser-agent: Applebot-Extended\nUser-agent: Bingbot\nUser-agent: Googlebot\nUser-agent: xAI-Bot\nUser-agent: GrokBot\nUser-agent: DuckDuckBot\nUser-agent: YandexBot\nAllow: /\n\nUser-agent: *\nAllow: /\nDisallow: /search/\nDisallow: /thank-you/\n\nSitemap: ${abs("/sitemap.xml")}\n${extraSitemapFiles.map((f) => `Sitemap: ${abs("/" + f)}`).join("\n")}\n`);
// IndexNow key file (Bing, Yahoo, Yandex, Seznam, Naver)
const INDEXNOW_KEY = "0e63c59d11b15c7aee4f3d9d708a3bef";
fs.writeFileSync(path.join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
// llms.txt for AI answer engines
fs.writeFileSync(path.join(OUT, "llms.txt"), `# ${config.name}\n\n> ${config.tagline}\n\n## Pages\n${pages.map((p) => `- [${p.title || p.url}](${abs(p.url)})`).join("\n")}\n`);

// ads.txt is only published once a real AdSense publisher ID is configured.
if (PUB) fs.writeFileSync(path.join(OUT, "ads.txt"), `google.com, ${PUB.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`);

console.log(`Built ${pages.length} indexed pages (+search, 404, thank-you) into ${OUT}/ · ads: ${PUB ? "LIVE " + PUB : "off (no publisher ID)"}`);
