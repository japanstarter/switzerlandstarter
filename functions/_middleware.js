// Cloudflare Pages Functions middleware for switzerlandstarter.com
// Provides:
// 1. Dynamic SSR for all 2,113 municipalities (/cities/<slug>/ and /<lang>/cities/<slug>/)
//    and localized routes across 9 languages (en, de, fr, es, it, nl, ja, ko, zh-tw)
// 2. POST /api/track (visitor & page-click tracking)
// 3. GET /api/stats (password-secured analytics API)
// 4. Automatic lightweight page & link-click tracker injection via HTMLRewriter

const SITE_NAME = "SwitzerlandStarter";
const DOMAIN = "switzerlandstarter.com";
const COUNTRY = "Switzerland";
const TOTAL_MUNI = 2113;
const LANGUAGES = [{"code": "en", "label": "English", "short": "EN", "htmlLang": "en"}, {"code": "de", "label": "Deutsch", "short": "DE", "htmlLang": "de"}, {"code": "fr", "label": "Fran\u00e7ais", "short": "FR", "htmlLang": "fr"}, {"code": "es", "label": "Espa\u00f1ol", "short": "ES", "htmlLang": "es"}, {"code": "it", "label": "Italiano", "short": "IT", "htmlLang": "it"}, {"code": "nl", "label": "Nederlands", "short": "NL", "htmlLang": "nl"}, {"code": "ja", "label": "\u65e5\u672c\u8a9e", "short": "JA", "htmlLang": "ja"}, {"code": "ko", "label": "\ud55c\uad6d\uc5b4", "short": "KO", "htmlLang": "ko"}, {"code": "zh-tw", "label": "\u7e41\u9ad4\u4e2d\u6587", "short": "\u7e41\u4e2d", "htmlLang": "zh-Hant"}];
const UI_STRINGS = {"en": {"nav_start": "Start Here", "nav_destinations": "Destinations", "nav_cities": "All Cities", "nav_itineraries": "Itineraries", "nav_guides": "Practical Guides", "nav_seasonal": "When to Go", "nav_tools": "Planning Tools", "nav_blog": "Articles", "nav_faq": "FAQ", "hero_badge": "Independent Travel Planning Guide \u00b7 {count} Cities & Municipalities", "hero_title": "Plan a calm, well-paced trip to {country}.", "hero_lead": "Clear rail guides, realistic day-by-day itineraries, honest neighborhood notes, and complete travel directories covering every single city, town, and municipality in {country}.", "btn_first_trip": "First-Trip Checklist", "btn_browse_cities": "Browse All {count} Cities", "btn_tools": "Interactive Tools", "sec_featured_dest": "Flagship Destinations in {country}", "sec_all_regions": "Browse All Regions & {count} Municipalities", "sec_tools": "14 Interactive Travel Planning Tools", "sec_itineraries": "Sample Day-by-Day Itineraries", "sec_guides": "Practical Travel Guides", "city_guide_suffix": "{country} Travel Guide: Things to Do, Access & Local Food", "overview": "Overview", "getting_there": "Getting There & Local Transit", "what_to_see": "What to See & Do", "local_food": "Local Food & Regional Specialties", "where_to_stay": "Where to Stay", "quick_facts": "Quick Facts", "native_name": "Official / Local Name", "region_label": "Region / Province", "population_label": "Population", "coordinates_label": "Coordinates", "best_time_label": "Best Time to Visit", "main_hub_label": "Primary Transit Hub", "search_placeholder": "Search any of the {count} cities, towns & municipalities...", "all_municipalities_heading": "Complete Directory of All {count} Municipalities", "showing_results": "Showing municipalities \u2014 type above to filter all {count} entries instantly.", "col_city": "City / Municipality", "col_native": "Local Name / Code", "col_region": "Region", "col_province": "Province / District", "col_pop": "Population", "col_guide": "Travel Guide", "view_guide": "Read Guide \u2192"}, "de": {"nav_start": "Startseite", "nav_destinations": "Reiseziele", "nav_cities": "Alle St\u00e4dte", "nav_itineraries": "Reiserouten", "nav_guides": "Reisetipps", "nav_seasonal": "Beste Reisezeit", "nav_tools": "Planungstools", "nav_blog": "Artikel", "nav_faq": "FAQ", "hero_badge": "Unabh\u00e4ngiger Reisef\u00fchrer \u00b7 Alle {count} St\u00e4dte & Gemeinden", "hero_title": "Planen Sie eine entspannte, perfekt abgestimmte Reise nach {country}.", "hero_lead": "Klare Bahn-Guides, realistische Tagesrouten, ehrliche Viertel-Tipps und das vollst\u00e4ndige Verzeichnis aller {count} St\u00e4dte und Gemeinden in {country}.", "btn_first_trip": "Checkliste f\u00fcr Erstbesucher", "btn_browse_cities": "Alle {count} St\u00e4dte entdecken", "btn_tools": "Interaktive Tools", "sec_featured_dest": "Top-Reiseziele in {country}", "sec_all_regions": "Alle Regionen & {count} Gemeinden", "sec_tools": "14 Interaktive Reise-Tools", "sec_itineraries": "Empfohlene Reiserouten", "sec_guides": "Praktische Reisef\u00fchrer", "city_guide_suffix": "{country} Reisef\u00fchrer: Sehensw\u00fcrdigkeiten, Anreise & Spezialit\u00e4ten", "overview": "\u00dcberblick", "getting_there": "Anreise & Nahverkehr", "what_to_see": "Sehensw\u00fcrdigkeiten & Aktivit\u00e4ten", "local_food": "Lokale K\u00fcche & Spezialit\u00e4ten", "where_to_stay": "Unterk\u00fcnfte & Viertel", "quick_facts": "Kurzinfos", "native_name": "Offizieller Name", "region_label": "Region / Kanton", "population_label": "Einwohnerzahl", "coordinates_label": "Koordinaten", "best_time_label": "Beste Reisezeit", "main_hub_label": "Verkehrsknotenpunkt", "search_placeholder": "Alle {count} St\u00e4dte, Orte & Gemeinden durchsuchen...", "all_municipalities_heading": "Vollst\u00e4ndiges Verzeichnis aller {count} Gemeinden", "showing_results": "Gemeinden im \u00dcberblick \u2014 oben tippen, um alle {count} Orte sofort zu filtern.", "col_city": "Stadt / Gemeinde", "col_native": "Ortsname / Code", "col_region": "Region", "col_province": "Provinz / Bezirk", "col_pop": "Einwohner", "col_guide": "Reisef\u00fchrer", "view_guide": "Zum Guide \u2192"}, "fr": {"nav_start": "D\u00e9buter", "nav_destinations": "Destinations", "nav_cities": "Toutes les Villes", "nav_itineraries": "Itin\u00e9raires", "nav_guides": "Guides Pratiques", "nav_seasonal": "Quand Partir", "nav_tools": "Outils", "nav_blog": "Articles", "nav_faq": "FAQ", "hero_badge": "Guide de Voyage Ind\u00e9pendant \u00b7 {count} Villes & Communes", "hero_title": "Pr\u00e9parez un voyage serein et bien rythm\u00e9 : {country}.", "hero_lead": "Guides ferroviaires clairs, itin\u00e9raires jour par jour r\u00e9alistes, conseils de quartiers et r\u00e9pertoire complet des {count} villes et communes ({country}).", "btn_first_trip": "Checklist Premier Voyage", "btn_browse_cities": "Explorer les {count} Villes", "btn_tools": "Outils Interactifs", "sec_featured_dest": "Destinations Phares ({country})", "sec_all_regions": "Toutes les R\u00e9gions & {count} Communes", "sec_tools": "14 Outils de Planification", "sec_itineraries": "Itin\u00e9raires Jour par Jour", "sec_guides": "Guides Pratiques", "city_guide_suffix": "Guide de Voyage {country} : Que Voir, Acc\u00e8s & Gastronomie", "overview": "Aper\u00e7u G\u00e9n\u00e9ral", "getting_there": "Acc\u00e8s & Transports", "what_to_see": "Que Voir & Que Faire", "local_food": "Gastronomie & Sp\u00e9cialit\u00e9s Locales", "where_to_stay": "O\u00f9 Dormir", "quick_facts": "Infos Pratiques", "native_name": "Nom Officiel", "region_label": "R\u00e9gion", "population_label": "Population", "coordinates_label": "Coordonn\u00e9es", "best_time_label": "Meilleure Saison", "main_hub_label": "Gare / Hub Principal", "search_placeholder": "Rechercher parmi les {count} villes, villages et communes...", "all_municipalities_heading": "R\u00e9pertoire Complet des {count} Communes", "showing_results": "Recherchez ci-dessus pour filtrer instantan\u00e9ment les {count} communes.", "col_city": "Ville / Commune", "col_native": "Nom Local / Code", "col_region": "R\u00e9gion", "col_province": "D\u00e9partement / Province", "col_pop": "Population", "col_guide": "Guide", "view_guide": "Voir le Guide \u2192"}, "es": {"nav_start": "Empezar", "nav_destinations": "Destinos", "nav_cities": "Todas las Ciudades", "nav_itineraries": "Itinerarios", "nav_guides": "Gu\u00edas Pr\u00e1cticas", "nav_seasonal": "Cu\u00e1ndo Ir", "nav_tools": "Herramientas", "nav_blog": "Art\u00edculos", "nav_faq": "Preguntas", "hero_badge": "Gu\u00eda de Viaje Independiente \u00b7 {count} Ciudades y Municipios", "hero_title": "Planifica un viaje tranquilo y bien organizado a {country}.", "hero_lead": "Gu\u00edas de trenes claras, itinerarios d\u00eda por d\u00eda, consejos de barrios y el directorio completo con los {count} municipios y ciudades de {country}.", "btn_first_trip": "Checklist Primer Viaje", "btn_browse_cities": "Ver las {count} Ciudades", "btn_tools": "Herramientas Interactivas", "sec_featured_dest": "Destinos Principales en {country}", "sec_all_regions": "Todas las Regiones y {count} Municipios", "sec_tools": "14 Herramientas de Planificaci\u00f3n", "sec_itineraries": "Itinerarios Recomendados", "sec_guides": "Gu\u00edas Pr\u00e1cticas de Viaje", "city_guide_suffix": "Gu\u00eda de Viaje ({country}): Qu\u00e9 Ver, C\u00f3mo Llegar y Gastronom\u00eda", "overview": "Descripci\u00f3n General", "getting_there": "C\u00f3mo Llegar y Transporte", "what_to_see": "Qu\u00e9 Ver y Hacer", "local_food": "Gastronom\u00eda y Platos T\u00edpicos", "where_to_stay": "D\u00f3nde Alojarse", "quick_facts": "Datos R\u00e1pidos", "native_name": "Nombre Oficial", "region_label": "Regi\u00f3n / Comunidad", "population_label": "Poblaci\u00f3n", "coordinates_label": "Coordenadas", "best_time_label": "Mejor \u00c9poca", "main_hub_label": "Estaci\u00f3n / Centro Principal", "search_placeholder": "Buscar entre los {count} municipios, pueblos y ciudades...", "all_municipalities_heading": "Directorio Completo de los {count} Municipios", "showing_results": "Escribe arriba para filtrar al instante los {count} municipios.", "col_city": "Ciudad / Municipio", "col_native": "Nombre Local / C\u00f3digo", "col_region": "Regi\u00f3n", "col_province": "Provincia / Distrito", "col_pop": "Poblaci\u00f3n", "col_guide": "Gu\u00eda", "view_guide": "Ver Gu\u00eda \u2192"}, "it": {"nav_start": "Inizia Qui", "nav_destinations": "Destinazioni", "nav_cities": "Tutte le Citt\u00e0", "nav_itineraries": "Itinerari", "nav_guides": "Guide Pratiche", "nav_seasonal": "Quando Andare", "nav_tools": "Strumenti", "nav_blog": "Articoli", "nav_faq": "FAQ", "hero_badge": "Guida di Viaggio Indipendente \u00b7 {count} Citt\u00e0 e Comuni", "hero_title": "Organizza un viaggio perfetto e senza stress in {country}.", "hero_lead": "Guide ai treni, itinerari giorno per giorno, consigli sui quartieri e l'elenco completo di tutti i {count} comuni e citt\u00e0 ({country}).", "btn_first_trip": "Checklist Primo Viaggio", "btn_browse_cities": "Esplora {count} Citt\u00e0 e Comuni", "btn_tools": "Strumenti Interattivi", "sec_featured_dest": "Destinazioni Principali in {country}", "sec_all_regions": "Tutte le Regioni e i {count} Comuni", "sec_tools": "14 Strumenti di Pianificazione", "sec_itineraries": "Itinerari Consigliati", "sec_guides": "Guide Pratiche di Viaggio", "city_guide_suffix": "Guida di Viaggio {country}: Cosa Vedere, Trasporti e Cucina", "overview": "Panoramica", "getting_there": "Come Arrivare e Muoversi", "what_to_see": "Cosa Vedere e Fare", "local_food": "Cucina Locale e Specialit\u00e0", "where_to_stay": "Dove Dormire", "quick_facts": "Informazioni Rapide", "native_name": "Nome Ufficiale", "region_label": "Regione", "population_label": "Popolazione", "coordinates_label": "Coordinate", "best_time_label": "Periodo Migliore", "main_hub_label": "Hub Principale", "search_placeholder": "Cerca tra tutti i {count} comuni e citt\u00e0...", "all_municipalities_heading": "Elenco Completo di Tutti i {count} Comuni", "showing_results": "Digita sopra per filtrare istantaneamente tutti i {count} comuni.", "col_city": "Citt\u00e0 / Comune", "col_native": "Nome Locale / Codice", "col_region": "Regione", "col_province": "Provincia", "col_pop": "Popolazione", "col_guide": "Guida", "view_guide": "Leggi Guida \u2192"}, "nl": {"nav_start": "Start Hier", "nav_destinations": "Bestemmingen", "nav_cities": "Alle Steden", "nav_itineraries": "Reisroutes", "nav_guides": "Praktische Gidsen", "nav_seasonal": "Beste Reistijd", "nav_tools": "Planningstools", "nav_blog": "Artikelen", "nav_faq": "FAQ", "hero_badge": "Onafhankelijke Reisgids \u00b7 Alle {count} Steden & Gemeenten", "hero_title": "Plan een ontspannen, goed opgebouwde reis naar {country}.", "hero_lead": "Duidelijke treingidsen, haalbare dagroutes, eerlijke wijktips en een volledig overzicht van alle {count} steden en gemeenten in {country}.", "btn_first_trip": "Checklist Eerste Reis", "btn_browse_cities": "Bekijk Alle {count} Steden", "btn_tools": "Interactieve Tools", "sec_featured_dest": "Topbestemmingen in {country}", "sec_all_regions": "Alle Regio's & {count} Gemeenten", "sec_tools": "14 Interactieve Reis-Tools", "sec_itineraries": "Voorbeeldroutes van Dag tot Dag", "sec_guides": "Praktische Reisgidsen", "city_guide_suffix": "{country} Reisgids: Bezienswaardigheden, Bereikbaarheid & Eten", "overview": "Overzicht", "getting_there": "Bereikbaarheid & Openbaar Vervoer", "what_to_see": "Wat te Zien & Doen", "local_food": "Lokale Keuken & Specialiteiten", "where_to_stay": "Waar te Verblijven", "quick_facts": "Snelle Feiten", "native_name": "Offici\u00eble Naam", "region_label": "Regio / Provincie", "population_label": "Inwoners", "coordinates_label": "Co\u00f6rdinaten", "best_time_label": "Beste Reistijd", "main_hub_label": "Belangrijkste Knooppunt", "search_placeholder": "Zoek in alle {count} steden, dorpen en gemeenten...", "all_municipalities_heading": "Volledig Overzicht van Alle {count} Gemeenten", "showing_results": "Typ hierboven om direct alle {count} gemeenten te filteren.", "col_city": "Stad / Gemeente", "col_native": "Lokale Naam / Code", "col_region": "Regio", "col_province": "Provincie / District", "col_pop": "Inwoners", "col_guide": "Reisgids", "view_guide": "Bekijk Gids \u2192"}, "ja": {"nav_start": "\u306f\u3058\u3081\u3066\u306e\u65b9\u3078", "nav_destinations": "\u4eba\u6c17\u90fd\u5e02\u30fb\u89b3\u5149\u5730", "nav_cities": "\u5168\u90fd\u5e02\u30fb\u81ea\u6cbb\u4f53\u4e00\u89a7", "nav_itineraries": "\u30e2\u30c7\u30eb\u30b3\u30fc\u30b9", "nav_guides": "\u5b9f\u7528\u30ac\u30a4\u30c9", "nav_seasonal": "\u30d9\u30b9\u30c8\u30b7\u30fc\u30ba\u30f3", "nav_tools": "\u65c5\u884c\u8a08\u753b\u30c4\u30fc\u30eb", "nav_blog": "\u30b3\u30e9\u30e0", "nav_faq": "\u3088\u304f\u3042\u308b\u8cea\u554f", "hero_badge": "\u72ec\u7acb\u7cfb\u30c8\u30e9\u30d9\u30eb\u30ac\u30a4\u30c9 \u00b7 \u5168{count}\u90fd\u5e02\u30fb\u81ea\u6cbb\u4f53\u3092\u5b8c\u5168\u7db2\u7f85", "hero_title": "{country}\u3078\u306e\u65c5\u3092\u3001\u7121\u7406\u306a\u304f\u30b9\u30de\u30fc\u30c8\u306b\u8a08\u753b\u3057\u3088\u3046\u3002", "hero_lead": "\u9244\u9053\u30fb\u4ea4\u901a\u30ac\u30a4\u30c9\u3001\u65e5\u7a0b\u5225\u30e2\u30c7\u30eb\u30b3\u30fc\u30b9\u3001\u30a8\u30ea\u30a2\u5225\u306e\u6ede\u5728\u30a2\u30c9\u30d0\u30a4\u30b9\u3001\u305d\u3057\u3066{country}\u306e\u5168{count}\u90fd\u5e02\u30fb\u753a\u6751\u3092\u7db2\u7f85\u3057\u305f\u5b8c\u5168\u30c7\u30fc\u30bf\u30d9\u30fc\u30b9\u3002", "btn_first_trip": "\u521d\u3081\u3066\u306e\u65c5\u884c\u30c1\u30a7\u30c3\u30af\u30ea\u30b9\u30c8", "btn_browse_cities": "\u5168{count}\u90fd\u5e02\u30fb\u81ea\u6cbb\u4f53\u3092\u691c\u7d22", "btn_tools": "14\u306e\u65c5\u884c\u8a08\u753b\u30c4\u30fc\u30eb", "sec_featured_dest": "{country}\u306e\u4e3b\u8981\u30c7\u30b9\u30c6\u30a3\u30cd\u30fc\u30b7\u30e7\u30f3", "sec_all_regions": "\u5168\u5730\u57df\u30fb\u5168{count}\u81ea\u6cbb\u4f53\u30c7\u30a3\u30ec\u30af\u30c8\u30ea", "sec_tools": "14\u306e\u30a4\u30f3\u30bf\u30e9\u30af\u30c6\u30a3\u30d6\u65c5\u884c\u30c4\u30fc\u30eb", "sec_itineraries": "\u65e5\u6570\u5225\u30e2\u30c7\u30eb\u30b3\u30fc\u30b9", "sec_guides": "\u5b9f\u7528\u30c8\u30e9\u30d9\u30eb\u30ac\u30a4\u30c9", "city_guide_suffix": "{country}\u65c5\u884c\u30ac\u30a4\u30c9\uff1a\u898b\u3069\u3053\u308d\u30fb\u30a2\u30af\u30bb\u30b9\u30fb\u540d\u7269\u30b0\u30eb\u30e1", "overview": "\u6982\u8981\u30fb\u7279\u5fb4", "getting_there": "\u30a2\u30af\u30bb\u30b9\u30fb\u4ea4\u901a\u6a5f\u95a2", "what_to_see": "\u4e3b\u306a\u898b\u3069\u3053\u308d\u30fb\u30a2\u30af\u30c6\u30a3\u30d3\u30c6\u30a3", "local_food": "\u540d\u7269\u30b0\u30eb\u30e1\u30fb\u90f7\u571f\u6599\u7406", "where_to_stay": "\u6ede\u5728\u30a8\u30ea\u30a2\u30fb\u5bbf\u6cca\u306e\u30d2\u30f3\u30c8", "quick_facts": "\u57fa\u672c\u30c7\u30fc\u30bf", "native_name": "\u73fe\u5730\u8868\u8a18 / \u30b3\u30fc\u30c9", "region_label": "\u5730\u57df\u30fb\u5dde", "population_label": "\u4eba\u53e3", "coordinates_label": "\u7def\u5ea6\u30fb\u7d4c\u5ea6", "best_time_label": "\u30d9\u30b9\u30c8\u30b7\u30fc\u30ba\u30f3", "main_hub_label": "\u4e3b\u8981\u62e0\u70b9\u30fb\u30bf\u30fc\u30df\u30ca\u30eb\u99c5", "search_placeholder": "\u5168{count}\u90fd\u5e02\u30fb\u753a\u6751\u30fb\u81ea\u6cbb\u4f53\u3092\u30ad\u30fc\u30ef\u30fc\u30c9\u691c\u7d22...", "all_municipalities_heading": "\u5168{count}\u81ea\u6cbb\u4f53\u30fb\u90fd\u5e02 \u5b8c\u5168\u4e00\u89a7", "showing_results": "\u4e0a\u306e\u691c\u7d22\u30dc\u30c3\u30af\u30b9\u306b\u5165\u529b\u3059\u308b\u3068\u3001\u5168{count}\u81ea\u6cbb\u4f53\u3092\u77ac\u6642\u306b\u7d5e\u308a\u8fbc\u3081\u307e\u3059\u3002", "col_city": "\u90fd\u5e02\u30fb\u81ea\u6cbb\u4f53\u540d", "col_native": "\u73fe\u5730\u540d / \u30b3\u30fc\u30c9", "col_region": "\u5730\u57df\u30fb\u5dde", "col_province": "\u770c\u30fb\u90e1\u30fb\u533a", "col_pop": "\u4eba\u53e3", "col_guide": "\u30ac\u30a4\u30c9", "view_guide": "\u8a73\u7d30\u3092\u898b\u308b \u2192"}, "ko": {"nav_start": "\uc2dc\uc791\ud558\uae30", "nav_destinations": "\uc8fc\uc694 \uc5ec\ud589\uc9c0", "nav_cities": "\uc804\uccb4 \ub3c4\uc2dc\u00b7\uc2dc\uad70\uad6c", "nav_itineraries": "\ucd94\ucc9c \uc77c\uc815", "nav_guides": "\uc2e4\uc6a9 \uac00\uc774\ub4dc", "nav_seasonal": "\ubc29\ubb38 \uc2dc\uae30", "nav_tools": "\uc5ec\ud589 \uacc4\ud68d \ub3c4\uad6c", "nav_blog": "\uc544\ud2f0\ud074", "nav_faq": "FAQ", "hero_badge": "\ub3c5\ub9bd \uc5ec\ud589 \ud50c\ub798\ub2dd \uac00\uc774\ub4dc \u00b7 \uc804\uccb4 {count}\uac1c \ub3c4\uc2dc \ubc0f \ud589\uc815\uad6c\uc5ed \uc218\ub85d", "hero_title": "{country} \uc5ec\ud589\uc744 \uc5ec\uc720\ub86d\uace0 \uccb4\uacc4\uc801\uc73c\ub85c \uc900\ube44\ud558\uc138\uc694.", "hero_lead": "\uae30\ucc28\u00b7\ub300\uc911\uad50\ud1b5 \uc548\ub0b4, \ud604\uc2e4\uc801\uc778 \uc77c\uc790\ubcc4 \ucd94\ucc9c \ucf54\uc2a4, \uc219\uc18c \uc9c0\uc5ed \ube44\uad50, \uadf8\ub9ac\uace0 {country}\uc758 \ubaa8\ub4e0 {count}\uac1c \ub3c4\uc2dc\u00b7\uc2dc\uad70\uad6c\u00b7\uc74d\uba74\ub3d9 \uc644\ubcbd \uac00\uc774\ub4dc.", "btn_first_trip": "\uccab \uc5ec\ud589 \uccb4\ud06c\ub9ac\uc2a4\ud2b8", "btn_browse_cities": "\uc804\uccb4 {count}\uac1c \ub3c4\uc2dc \ubcf4\uae30", "btn_tools": "\uc778\ud130\ub799\ud2f0\ube0c \ub3c4\uad6c", "sec_featured_dest": "{country} \ub300\ud45c \uc5ec\ud589\uc9c0", "sec_all_regions": "\uc804\uccb4 \uc9c0\uc5ed \ubc0f {count}\uac1c \ub3c4\uc2dc\u00b7\ud589\uc815\uad6c\uc5ed", "sec_tools": "14\uac00\uc9c0 \uc778\ud130\ub799\ud2f0\ube0c \uc5ec\ud589 \ub3c4\uad6c", "sec_itineraries": "\uc77c\uc790\ubcc4 \ucd94\ucc9c \uc5ec\ud589 \ucf54\uc2a4", "sec_guides": "\uc2e4\uc6a9 \uc5ec\ud589 \uac00\uc774\ub4dc", "city_guide_suffix": "{country} \uc5ec\ud589 \uac00\uc774\ub4dc: \uba85\uc18c, \uad50\ud1b5\ud3b8 & \uc9c0\uc5ed \ub9db\uc9d1", "overview": "\ub3c4\uc2dc \uac1c\uc694", "getting_there": "\uac00\ub294 \ubc95 \ubc0f \ub300\uc911\uad50\ud1b5", "what_to_see": "\uc8fc\uc694 \ubcfc\uac70\ub9ac \ubc0f \uc990\uae38\uac70\ub9ac", "local_food": "\uc9c0\uc5ed \ub300\ud45c \uc74c\uc2dd & \ud2b9\uc0b0\ubb3c", "where_to_stay": "\ucd94\ucc9c \uc219\ubc15 \uc9c0\uc5ed", "quick_facts": "\ud575\uc2ec \uc815\ubcf4", "native_name": "\ud604\uc9c0 \uba85\uce6d / \ucf54\ub4dc", "region_label": "\uc9c0\uc5ed / \uad11\uc5ed\uc2dc\u00b7\ub3c4", "population_label": "\uc778\uad6c", "coordinates_label": "\uc88c\ud45c", "best_time_label": "\ucd94\ucc9c \ubc29\ubb38 \uc2dc\uae30", "main_hub_label": "\uc8fc\uc694 \uad50\ud1b5 \ud5c8\ube0c", "search_placeholder": "{count}\uac1c \uc804\uccb4 \ub3c4\uc2dc, \uc2dc\u00b7\uad70\u00b7\uad6c, \uc74d\u00b7\uba74\u00b7\ub3d9 \uac80\uc0c9...", "all_municipalities_heading": "\uc804\uccb4 {count}\uac1c \ub3c4\uc2dc \ubc0f \ud589\uc815\uad6c\uc5ed \ub514\ub809\ud1a0\ub9ac", "showing_results": "\uc704 \uac80\uc0c9\ucc3d\uc5d0 \uc785\ub825\ud558\uc5ec {count}\uac1c \uc804\uccb4 \uc9c0\uc5ed\uc744 \uc989\uc2dc \uac80\uc0c9\ud558\uc138\uc694.", "col_city": "\ub3c4\uc2dc / \ud589\uc815\uad6c\uc5ed", "col_native": "\ud604\uc9c0 \ud45c\uae30 / \ucf54\ub4dc", "col_region": "\uc9c0\uc5ed / \uad11\uc5ed\uc2dc\u00b7\ub3c4", "col_province": "\uc2dc\u00b7\uad70\u00b7\uad6c / \uc8fc", "col_pop": "\uc778\uad6c", "col_guide": "\uac00\uc774\ub4dc", "view_guide": "\uac00\uc774\ub4dc \ubcf4\uae30 \u2192"}, "zh-tw": {"nav_start": "\u65b0\u624b\u8d77\u9ede", "nav_destinations": "\u71b1\u9580\u76ee\u7684\u5730", "nav_cities": "\u6240\u6709\u57ce\u5e02\u8207\u5e02\u93ae", "nav_itineraries": "\u63a8\u85a6\u884c\u7a0b", "nav_guides": "\u5be6\u7528\u6307\u5357", "nav_seasonal": "\u6700\u4f73\u5b63\u7bc0", "nav_tools": "\u898f\u5283\u5de5\u5177", "nav_blog": "\u5c08\u6b04\u6587\u7ae0", "nav_faq": "\u5e38\u898b\u554f\u984c", "hero_badge": "\u7368\u7acb\u65c5\u904a\u898f\u5283\u6307\u5357 \u00b7 \u5b8c\u6574\u6536\u9304\u5168\u5883 {count} \u500b\u57ce\u5e02\u8207\u5e02\u93ae", "hero_title": "\u8f15\u9b06\u898f\u5283\u4e00\u8d9f\u7bc0\u594f\u8212\u9069\u7684{country}\u4e4b\u65c5\u3002", "hero_lead": "\u6e05\u6670\u7684\u9435\u8def\u4ea4\u901a\u6307\u5357\u3001\u5be6\u7528\u7684\u6bcf\u65e5\u884c\u7a0b\u5efa\u8b70\u3001\u4f4f\u5bbf\u5340\u57df\u5206\u6790\uff0c\u4ee5\u53ca\u6db5\u84cb{country}\u5168\u5883 {count} \u500b\u57ce\u5e02\u8207\u884c\u653f\u5340\u7684\u5b8c\u6574\u8cc7\u6599\u5eab\u3002", "btn_first_trip": "\u521d\u6b21\u81ea\u7531\u884c\u6aa2\u67e5\u8868", "btn_browse_cities": "\u700f\u89bd\u5168\u90e8 {count} \u500b\u57ce\u5e02", "btn_tools": "14 \u6b3e\u4e92\u52d5\u898f\u5283\u5de5\u5177", "sec_featured_dest": "{country}\u7cbe\u9078\u65c5\u904a\u76ee\u7684\u5730", "sec_all_regions": "\u6240\u6709\u5730\u5340\u8207 {count} \u500b\u5e02\u93ae\u540d\u9304", "sec_tools": "14 \u6b3e\u4e92\u52d5\u65c5\u904a\u898f\u5283\u5de5\u5177", "sec_itineraries": "\u6bcf\u65e5\u884c\u7a0b\u7bc4\u672c", "sec_guides": "\u5be6\u7528\u65c5\u904a\u6307\u5357", "city_guide_suffix": "{country}\u65c5\u904a\u6307\u5357\uff1a\u5fc5\u53bb\u666f\u9ede\u3001\u4ea4\u901a\u65b9\u5f0f\u8207\u5728\u5730\u7f8e\u98df", "overview": "\u57ce\u5e02\u6982\u89bd", "getting_there": "\u4ea4\u901a\u65b9\u5f0f\u8207\u7576\u5730\u79fb\u52d5", "what_to_see": "\u5fc5\u8a2a\u666f\u9ede\u8207\u9ad4\u9a57", "local_food": "\u5728\u5730\u7f8e\u98df\u8207\u7279\u7522", "where_to_stay": "\u4f4f\u5bbf\u5340\u57df\u5efa\u8b70", "quick_facts": "\u57fa\u672c\u8cc7\u8a0a", "native_name": "\u7576\u5730\u540d\u7a31 / \u4ee3\u78bc", "region_label": "\u6240\u5c6c\u5730\u5340 / \u5dde\u4efd", "population_label": "\u4eba\u53e3", "coordinates_label": "\u5730\u7406\u5ea7\u6a19", "best_time_label": "\u6700\u4f73\u9020\u8a2a\u5b63\u7bc0", "main_hub_label": "\u4e3b\u8981\u4ea4\u901a\u6a1e\u7d10", "search_placeholder": "\u641c\u5c0b\u5168\u5883 {count} \u500b\u57ce\u5e02\u3001\u57ce\u93ae\u8207\u884c\u653f\u5340...", "all_municipalities_heading": "\u5168\u5883 {count} \u500b\u57ce\u5e02\u8207\u5e02\u93ae\u5b8c\u6574\u540d\u9304", "showing_results": "\u5728\u4e0a\u65b9\u8f38\u5165\u95dc\u9375\u5b57\uff0c\u5373\u53ef\u5373\u6642\u7be9\u9078\u5168\u90e8 {count} \u500b\u5e02\u93ae\u3002", "col_city": "\u57ce\u5e02 / \u5e02\u93ae\u540d\u7a31", "col_native": "\u7576\u5730\u540d\u7a31 / \u4ee3\u78bc", "col_region": "\u5730\u5340 / \u5dde\u4efd", "col_province": "\u7701\u4efd / \u90e1\u5340", "col_pop": "\u4eba\u53e3", "col_guide": "\u65c5\u904a\u6307\u5357", "view_guide": "\u67e5\u770b\u6307\u5357 \u2192"}};
const COUNTRY_NAMES = {"en": "Switzerland", "de": "Schweiz", "fr": "Suisse", "es": "Suiza", "it": "Svizzera", "nl": "Zwitserland", "ja": "\u30b9\u30a4\u30b9", "ko": "\uc2a4\uc704\uc2a4", "zh-tw": "\u745e\u58eb"};
const REGIONS_META = {"canton-of-zurich": {"name": "Canton of Zurich", "native": "Z\u00fcrich", "capital": "Zurich", "access": "Zurich Airport (ZRH) has a mainline SBB railway station underneath the terminal (10 min to Z\u00fcrich HB).", "foods": ["Z\u00fcrcher Geschnetzeltes with R\u00f6sti", "Luxemburgerli macarons", "Fondue in historic guild houses", "Craft chocolate"], "best": "May\u2013Sep, Dec (Christmas markets)", "highlights": ["Z\u00fcrich Altstadt & Limmatquai", "Lake Zurich cruises & Uetliberg", "Kunsthaus Z\u00fcrich & Landesmuseum", "Winterthur museums & Rhine Falls gateway"]}, "canton-of-bern": {"name": "Canton of Bern", "native": "Bern / Berne", "capital": "Bern", "access": "Bern HB rail hub; Bernese Oberland Railway (BOB) to Interlaken, Grindelwald, Lauterbrunnen and Jungfraujoch.", "foods": ["Berner Platte", "R\u00f6sti with alpine cheese", "Meringues from Meiringen", "Toblerone & Kambly biscuits"], "best": "Jun\u2013Sep, Dec\u2013Mar", "highlights": ["Bern UNESCO Old Town & Zytglogge", "Jungfraujoch, Eiger & Grindelwald", "Lauterbrunnen Valley & M\u00fcrren", "Interlaken, Lake Thun & Lake Brienz"]}, "canton-of-vaud": {"name": "Canton of Vaud", "native": "Vaud", "capital": "Lausanne", "access": "40 minutes from Geneva Airport along the Lake Geneva SBB mainline via Lausanne, Vevey and Montreux.", "foods": ["Papet Vaudois", "Filets de perche du L\u00e9man", "Malakoff fried cheese", "Lavaux Chasselas wines", "Gruy\u00e8re & Etivaz alpine cheeses"], "best": "May\u2013Oct", "highlights": ["Ch\u00e2teau de Chillon & Montreux Riviera", "Lavaux UNESCO Vineyard Terraces", "Lausanne Olympic Museum & Cathedral", "Glacier 3000 & Villars-sur-Ollon"]}, "aargau": {"name": "Aargau", "native": "Aargau", "capital": "Baden", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "saint-gallen": {"name": "Saint Gallen", "native": "Saint Gallen", "capital": "St. Gallen", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "canton-of-geneva": {"name": "Canton of Geneva", "native": "Gen\u00e8ve", "capital": "Geneva", "access": "Geneva Airport (GVA) is 7 minutes by free train from Gen\u00e8ve-Cornavin station; TGV Lyria to Paris.", "foods": ["Filets de perche", "Longeole sausage", "Cardons \u00e9pineux genevois", "Artisanal Swiss watchmakers' caf\u00e9s & chocolatiers"], "best": "May\u2013Oct", "highlights": ["Jet d'Eau & Lake Geneva harbor", "Vieille Ville & St. Pierre Cathedral", "Palais des Nations & CERN Science Gateway", "Carouge bohemian quarter"]}, "canton-of-lucerne": {"name": "Canton of Lucerne", "native": "Luzern", "capital": "Lucerne", "access": "1 hour by direct SBB InterRegio train from Zurich; GoldenPass Express terminus and Lake Lucerne steamships.", "foods": ["Luzerner Ch\u00fcgelipastete", "Alpine cheese fondue", "Birnenweggen pear pastry", "Local cider & lake fish"], "best": "May\u2013Oct", "highlights": ["Chapel Bridge (Kapellbr\u00fccke) & Old Town", "Lake Lucerne paddle steamers", "Mount Pilatus & Mount Rigi excursions", "Swiss Museum of Transport (Verkehrshaus)"]}, "canton-of-valais": {"name": "Canton of Valais", "native": "Valais / Wallis", "capital": "Sion", "access": "Simplon rail line via Brig and Visp; Matterhorn Gotthard Bahn to Zermatt and Glacier Express route.", "foods": ["Valais Raclette AOP", "Cholera savory pastry", "Valais dried beef (Trockenfleisch)", "Petite Arvine & Fendant wines"], "best": "Jun\u2013Sep (hiking), Dec\u2013Apr (skiing)", "highlights": ["Zermatt, Matterhorn & Gornergrat", "Aletsch Arena & Great Aletsch Glacier", "Saas-Fee & Verbier alpine resorts", "Sion castles & Lavaux/Valais vineyards"]}, "canton-of-ticino": {"name": "Canton of Ticino", "native": "Ticino", "capital": "Bellinzona", "access": "Gotthard Base Tunnel connects Zurich to Bellinzona, Locarno and Lugano in under 2 hours.", "foods": ["Polenta braised over wood fire", "Risotto al Merlot del Ticino", "Luganighe sausage", "Grotto chestnut specialties"], "best": "Apr\u2013Oct", "highlights": ["Lugano Lakefront, Monte Br\u00e8 & Morcote", "Locarno Piazza Grande & Valle Verzasca", "Bellinzona Three Castles (UNESCO)", "Ascona lakeside promenade"]}, "fribourg": {"name": "Fribourg", "native": "Fribourg", "capital": "Fribourg", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "basel-landschaft": {"name": "Basel-Landschaft", "native": "Basel-Landschaft", "capital": "Allschwil", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "thurgau": {"name": "Thurgau", "native": "Thurgau", "capital": "Frauenfeld", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "solothurn": {"name": "Solothurn", "native": "Solothurn", "capital": "Olten", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "canton-of-graubunden": {"name": "Canton of Graub\u00fcnden", "native": "Graub\u00fcnden / Grigioni / Grischun", "capital": "Chur", "access": "Rhaetian Railway (RhB) UNESCO network from Chur to St. Moritz, Davos, Arosa and Tirano (Bernina Express).", "foods": ["Capuns", "Pizzoccheri", "B\u00fcndner Nusstorte (walnut tart)", "B\u00fcndnerfleisch air-dried beef", "Malans Pinot Noir"], "best": "Jun\u2013Oct, Dec\u2013Mar", "highlights": ["St. Moritz & Engadin Valley", "Bernina Express & Landwasser Viaduct", "Davos Klosters & Arosa", "Swiss National Park (Zernez)"]}, "basel-city": {"name": "Basel-City", "native": "Basel-City", "capital": "Basel", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "neuchatel": {"name": "Neuchatel", "native": "Neuch\u00e2tel", "capital": "Neuch\u00e2tel", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "schwyz": {"name": "Schwyz", "native": "Schwyz", "capital": "Freienbach", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "zug": {"name": "Zug", "native": "Zug", "capital": "Zug", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "schaffhausen": {"name": "Schaffhausen", "native": "Schaffhausen", "capital": "Schaffhausen", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "jura": {"name": "Jura", "native": "Jura", "capital": "Del\u00e9mont", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "appenzell-ausserrhoden": {"name": "Appenzell Ausserrhoden", "native": "Appenzell Ausserrhoden", "capital": "Herisau", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "nidwalden": {"name": "Nidwalden", "native": "Nidwalden", "capital": "Stans", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "glarus": {"name": "Glarus", "native": "Glarus", "capital": "Glarus Nord", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "obwalden": {"name": "Obwalden", "native": "Obwalden", "capital": "Sarnen", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "uri": {"name": "Uri", "native": "Uri", "capital": "Altdorf (UR)", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}, "appenzell-innerrhoden": {"name": "Appenzell Innerrhoden", "native": "Appenzell Innerrhoden", "capital": "Appenzell", "access": "Connected via hourly SBB CFF FFS rail and PostBus services; fully covered by the Swiss Travel Pass.", "foods": ["Cheese fondue", "Raclette", "R\u00f6sti", "Bircher muesli", "Swiss artisanal chocolate"], "best": "Jun\u2013Sep (summer trails), Dec\u2013Mar (winter sports)", "highlights": ["Historic Altstadt / Old Town", "Panoramic mountain & lake views", "Marked SwitzerlandMobility hiking trails", "Local heritage museum"]}};

const ALLOWED_ORIGINS = new Set([
  "https://switzerlandstarter.com",
  "https://www.switzerlandstarter.com",
]);

const SEC_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

let cachedMuniMap = null;
async function getMuniMap(requestUrl, env) {
  if (cachedMuniMap) return cachedMuniMap;
  try {
    const idxUrl = new URL("/assets/municipalities-index.json", requestUrl);
    const res = env && env.ASSETS ? await env.ASSETS.fetch(idxUrl.toString()) : await fetch(idxUrl.toString());
    if (res && res.ok) {
      const arr = await res.json();
      const map = new Map();
      for (const row of arr) {
        map.set(row[0], row);
      }
      cachedMuniMap = map;
      return map;
    }
  } catch (_) {}
  return null;
}

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderMunicipalityHtml(row, langCode, urlPath) {
  // row = [slug, name, native, prefSlug, regionName, pop, provinceName, lat, lon]
  const [slug, name, native, prefSlug, regionName, popNum, provinceName, lat, lon] = row;
  const lg = LANGUAGES.find((x) => x.code === langCode) || LANGUAGES[0];
  const ui = UI_STRINGS[lg.code] || UI_STRINGS.en;
  const cName = COUNTRY_NAMES[lg.code] || COUNTRY;
  const reg = REGIONS_META[prefSlug] || Object.values(REGIONS_META)[0] || {
    name: regionName, native: regionName, capital: regionName,
    access: "Connected via national and regional rail and bus networks.",
    foods: ["Local seasonal cuisine", "Regional market specialties", "Artisanal bakery goods"],
    best: "Apr–Jun, Sep–Oct",
    highlights: ["Historic Town Center", "Main Square & Market", "Scenic Regional Trails"]
  };
  const popStr = popNum > 0 ? Number(popNum).toLocaleString() : "Official Municipality";
  const prefix = lg.code === "en" ? "" : `/${lg.code}`;
  const titleSuffix = ui.city_guide_suffix.replace(/\{country\}/g, cName);
  const fullTitle = `${name} (${native}), ${regionName} — ${titleSuffix} | ${SITE_NAME}`;
  const desc = `${name} (${native}) in ${provinceName}, ${regionName}, ${cName} (Pop. ${popStr}, ${lat}°N, ${lon}°E): travel guide, train access, local food & highlights.`;
  const hreflangs = LANGUAGES.map((l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="https://${DOMAIN}${l.code === "en" ? "" : "/" + l.code}/cities/${slug}/">`).join("\n");

  return `<!doctype html>
<html lang="${lg.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://${DOMAIN}${urlPath}">
<meta name="robots" content="index,follow,max-image-preview:large">
${hreflangs}
<link rel="alternate" hreflang="x-default" href="https://${DOMAIN}/cities/${slug}/">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="logo" href="${prefix || "/"}"><span class="logo-text">${esc(SITE_NAME)}</span></a>
    <nav id="site-nav" class="site-nav"><ul>
      <li><a href="${prefix}/destinations/">${esc(ui.nav_destinations)}</a></li>
      <li><a href="${prefix}/cities/" aria-current="page">${esc(ui.nav_cities)} (${TOTAL_MUNI.toLocaleString()})</a></li>
      <li><a href="/itineraries/">${esc(ui.nav_itineraries)}</a></li>
      <li><a href="/guides/">${esc(ui.nav_guides)}</a></li>
      <li><a href="/tools/">${esc(ui.nav_tools)}</a></li>
      <li style="display:inline-flex;gap:4px">${LANGUAGES.map((l) => `<a href="${l.code === "en" ? "" : "/" + l.code}/cities/${slug}/" style="padding:2px 5px;border:1px solid #ddd;border-radius:4px;font-size:0.8rem">${l.short}</a>`).join("")}</li>
    </ul></nav>
  </div>
</header>
<main id="main">
  <div class="wrap"><nav class="crumbs"><ol>
    <li><a href="${prefix || "/"}">Home</a></li>
    <li><a href="${prefix}/cities/">${esc(ui.nav_cities)}</a></li>
    <li><a href="${prefix}/cities/prefecture/${prefSlug}/">${esc(regionName)}</a></li>
    <li aria-current="page">${esc(name)}</li>
  </ol></nav></div>
  <section class="wrap page-head">
    <p class="eyebrow"><a href="${prefix}/cities/prefecture/${prefSlug}/">${esc(regionName)}</a> · ${esc(provinceName)} · ${esc(cName)}</p>
    <h1>${esc(name)} (${esc(native)}) — ${esc(titleSuffix)}</h1>
    <p class="lead">${esc(desc)}</p>
  </section>
  <div class="wrap content-grid">
    <article class="prose">
      <div class="facts">
        <div><strong>${esc(ui.native_name)}</strong><span>${esc(native)}</span></div>
        <div><strong>${esc(ui.region_label)}</strong><span><a href="${prefix}/cities/prefecture/${prefSlug}/">${esc(regionName)}</a> (${esc(provinceName)})</span></div>
        <div><strong>${esc(ui.population_label)}</strong><span>${esc(popStr)}</span></div>
        <div><strong>${esc(ui.coordinates_label)}</strong><span>${lat}°N, ${lon}°E</span></div>
      </div>
      <h2>${esc(ui.overview)}</h2>
      <p><strong>${esc(name)}</strong> (${esc(native)}) is an official municipality in <strong>${esc(provinceName)}</strong> within the <strong><a href="${prefix}/cities/prefecture/${prefSlug}/">${esc(regionName)}</a></strong> region of ${esc(cName)}. Travellers visiting ${esc(name)} enjoy authentic local architecture, traditional town squares, and easy access to the wider cultural and natural attractions of ${esc(regionName)} (regional capital: ${esc(reg.capital)}).</p>
      <h2>${esc(ui.getting_there)}</h2>
      <p>${esc(reg.access)} From the regional hub of <strong>${esc(reg.capital)}</strong>, regional trains and local bus connections link directly to ${esc(name)} and neighbouring municipalities across ${esc(provinceName)}.</p>
      <h2>${esc(ui.what_to_see)}</h2>
      <ul>
        <li><strong>Historic Center of ${esc(name)}:</strong> Walk the main square, civic landmarks, and historic streets of ${esc(name)}.</li>
        ${(reg.highlights || []).map((h) => `<li><strong>${esc(h)}</strong> (${esc(regionName)} regional highlight)</li>`).join("")}
      </ul>
      <h2>${esc(ui.local_food)}</h2>
      <ul>
        ${(reg.foods || []).map((f) => `<li><strong>${esc(f)}</strong> — signature culinary specialty of ${esc(regionName)}.</li>`).join("")}
      </ul>
      <h2>${esc(ui.best_time_label)}</h2>
      <p>${esc(reg.best)}. Explore more municipalities in <a href="${prefix}/cities/prefecture/${prefSlug}/">${esc(regionName)}</a> or search all <a href="/cities/#all-municipalities-explorer">${TOTAL_MUNI.toLocaleString()} municipalities in ${esc(cName)}</a>.</p>
    </article>
  </div>
</main>
<footer class="site-footer"><div class="wrap footer-bottom"><p>© ${new Date().getFullYear()} ${esc(SITE_NAME)} · ${esc(cName)}</p></div></footer>
${TRACKER_SNIPPET}
</body>
</html>`;
}

const TRACKER_SNIPPET = `<script>(function(){if(location.pathname.startsWith("/stats")||location.pathname.startsWith("/admin"))return;var s=function(e,p){try{var d=JSON.stringify({e:e,p:p||location.pathname,r:document.referrer||""});if(navigator.sendBeacon){navigator.sendBeacon("/api/track",d)}else{fetch("/api/track",{method:"POST",body:d,keepalive:true})}}catch(_){}};s("pv",location.pathname);document.addEventListener("click",function(ev){var a=ev.target&&ev.target.closest?ev.target.closest("a[href]"):null;if(!a)return;try{var u=new URL(a.href,location.origin);if(u.origin===location.origin&&u.pathname!==location.pathname){s("click",u.pathname)}}catch(_){}},{passive:true});})();</script>`;

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const gscMatch = url.pathname.match(/^\/(google[a-z0-9]+\.html)$/i);
  if (gscMatch) {
    return new Response(`google-site-verification: ${gscMatch[1]}`, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  if (url.pathname === '/a8f4e2c9d1b6473890e5f1a2b3c4d5e6.txt') {
    return new Response('a8f4e2c9d1b6473890e5f1a2b3c4d5e6', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'X-Robots-Tag': 'all',
      },
    });
  }
  const p = url.pathname;
  const cleanPath = p.toLowerCase().replace(/\/+$/, "");
  // ads.txt disabled until AdSense is enabled
  const kv = env.JAPANSTARTER_KV || null;
  const getEnv = async (k) => env[k] || (kv ? await kv.get(`__env:${k}`).catch(() => "") : "") || "";
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

  if (p === "/api/track") {
    if (request.method !== "POST" || !isSameOrigin(request)) {
      return new Response(null, { status: 204, headers: SEC_HEADERS });
    }
    if (kv) {
      try {
        const body = JSON.parse((await request.text()).slice(0, 2000));
        const dayKey = `stats:day/${today}`;
        const cur = (await kv.get(dayKey, "json").catch(() => null)) || {
          pv: 0, uv: 0, visits: 0, vhashes: [], paths: {}, refs: {}, countries: {}, devices: {}, events: {}
        };
        cur.pv = (cur.pv || 0) + 1;
        const ev = String(body.e || "pv").slice(0, 32);
        cur.events = cur.events || {};
        cur.events[ev] = (cur.events[ev] || 0) + 1;

        const pg = String(body.p || "/").split("?")[0].slice(0, 140) || "/";
        if (!pg.startsWith("/stats") && !pg.startsWith("/admin")) {
          cur.paths = cur.paths || {};
          if (Object.keys(cur.paths).length < 400 || cur.paths[pg] !== undefined) {
            cur.paths[pg] = (Number(cur.paths[pg]) || 0) + 1;
          }
        }

        const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
        const ua = request.headers.get("user-agent") || "";
        const vhash = (await sha256Hex(`${today}:${ip}:${ua}:js-salt`)).slice(0, 16);
        cur.vhashes = Array.isArray(cur.vhashes) ? cur.vhashes : [];
        if (!cur.vhashes.includes(vhash)) {
          if (cur.vhashes.length < 5000) cur.vhashes.push(vhash);
          cur.uv = (cur.uv || 0) + 1;
        }

        const refHost = cleanRef(body.r || request.headers.get("referer") || "", "switzerlandstarter.com");
        if (refHost !== "(internal)") {
          cur.visits = (cur.visits || 0) + 1;
          cur.refs = cur.refs || {};
          cur.refs[refHost] = (cur.refs[refHost] || 0) + 1;
        }

        const country = (request.headers.get("cf-ipcountry") || "XX").toUpperCase();
        cur.countries = cur.countries || {};
        cur.countries[country] = (cur.countries[country] || 0) + 1;

        const dev = detectDevice(ua);
        cur.devices = cur.devices || {};
        cur.devices[dev] = (cur.devices[dev] || 0) + 1;

        await kv.put(dayKey, JSON.stringify(cur));
      } catch {}
    }
    return new Response(null, { status: 204, headers: SEC_HEADERS });
  }

  if (p === "/api/stats/recover") {
    if (request.method !== "POST" || !isSameOrigin(request)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: SEC_HEADERS });
    }
    if (kv) {
      const lock = await kv.get("stats:recover_lock").catch(() => null);
      if (lock) {
        return new Response(JSON.stringify({ ok: true, cooldown: true, sent_to: "g279***@gmail.com" }), { status: 200, headers: SEC_HEADERS });
      }
      await kv.put("stats:recover_lock", String(Date.now()), { expirationTtl: 60 }).catch(() => {});
    }
    const statsKey = await getEnv("STATS_KEY");
    if (!statsKey || !env.MAILER || typeof env.MAILER.fetch !== "function") {
      return new Response(JSON.stringify({ error: "Mailer unavailable" }), { status: 503, headers: SEC_HEADERS });
    }
    const text = [
      "Hello Giovanni,",
      "",
      "Here is your master analytics password for all 4 /stats/ dashboards:",
      "",
      `Password: ${statsKey.replace(/^Stats-/i, '')}`,
      "",
      "Analytics Dashboard Links:",
      "- https://industrial-supplier.org/stats/",
      "- https://dailydigitaldeals.shop/stats/",
      "- https://pullmeter.com/stats/",
      "- https://switzerlandstarter.com/stats/",
      "",
      `Requested from: https://switzerlandstarter.com/stats/ at ${new Date().toISOString()}`,
    ].join("\n");
    const mailRes = await env.MAILER.fetch("https://is-mailer/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "owner_only",
        subject: `[switzerlandstarter.com] Your /stats/ Analytics Dashboard Password`,
        text,
      }),
    });
    const mailData = await mailRes.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: true, sent_to: "g279***@gmail.com", delivery: mailData.results || {} }), { status: 200, headers: SEC_HEADERS });
  }

  if (p === "/api/stats") {
    const statsKey = await getEnv("STATS_KEY");
    let vaultSha256 = await getEnv("VAULT_STATS_SHA256");
    const hdr = extractHeaderKey(request);
    if (!vaultSha256 && kv && /^[A-Za-z0-9]{16}$/.test(hdr)) {
      const h = await sha256Hex(hdr);
      await kv.put("__env:VAULT_STATS_SHA256", h);
      vaultSha256 = h;
    }
    if (!(await verifyKey(request, statsKey, vaultSha256))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: SEC_HEADERS });
    }
    const days = [];
    if (kv) {
      const list = await kv.list({ prefix: "stats:day/" }).catch(() => ({ keys: [] }));
      for (const k of list.keys || []) {
        const d = await kv.get(k.name, "json").catch(() => null);
        if (d) {
          const { vhashes, ...cleanDay } = d;
          days.push({ date: k.name.replace("stats:day/", ""), ...cleanDay });
        }
      }
      days.sort((a, b) => a.date.localeCompare(b.date));
    }
    return new Response(JSON.stringify({
      site: "switzerlandstarter.com",
      generated: new Date().toISOString(),
      days,
    }), { status: 200, headers: SEC_HEADERS });
  }


  // Dynamic SSR for any municipality URL /cities/<slug>/ or /<lang>/cities/<slug>/
  const cityMatch = p.match(/^(?:\/(de|fr|es|it|nl|ja|ko|zh-tw))?\/cities\/([a-z0-9-]+)\/?$/i);
  if (request.method === "GET" && cityMatch && cityMatch[2] !== "prefecture") {
    const langCode = (cityMatch[1] || "en").toLowerCase();
    const citySlug = cityMatch[2].toLowerCase();
    const resTry = await next();
    if (resTry && resTry.status !== 404) {
      return new HTMLRewriter().on("body", { element(el) { el.append(TRACKER_SNIPPET, { html: true }); } }).transform(resTry);
    }
    const muniMap = await getMuniMap(request.url, env);
    if (muniMap && muniMap.has(citySlug)) {
      const html = renderMunicipalityHtml(muniMap.get(citySlug), langCode, p);
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  const res = await next();
  const ct = res.headers.get("content-type") || "";
  if (request.method === "GET" && ct.includes("text/html") && !p.startsWith("/stats") && !p.startsWith("/admin") && !cleanPath.endsWith(".txt") && !cleanPath.endsWith(".xml")) {
    return new HTMLRewriter()
      .on("body", {
        element(el) {
          el.append(TRACKER_SNIPPET, { html: true });
        },
      })
      .transform(res);
  }
  return res;
}
