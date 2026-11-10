/* Brunda S & Pavan E – wedding invitation (plain JavaScript, no build step). */
(function () {
  "use strict";
  var W = window.WEDDING, S = window.STRINGS, KN = window.WEDDING_KN, O = window.Orn;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = function () { return window.matchMedia("(max-width: 768px)").matches; };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]; }); };

  var lang = "en";
  try { lang = localStorage.getItem("bp_lang") || "en"; } catch (e) { /* storage blocked */ }
  var opened = !W.opening.enabled;

  /* ---------- language ---------- */
  function localize(l) {
    if (l !== "kn") return Object.assign({}, W, { locale: "en-GB", and: "&", relation_after: false });
    var rest = Object.assign({}, KN); delete rest.events;
    return Object.assign({}, W, rest, { events: W.events.map(function (e) { return Object.assign({}, e, KN.events[e.key]); }) });
  }
  var c = localize(lang);
  var t = function (k) { return (S[lang] && S[lang][k]) || S.en[k]; };

  /* ---------- dates ---------- */
  function tzOffset(tz, at) {
    var part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" }).formatToParts(at || new Date())
      .find(function (p) { return p.type === "timeZoneName"; });
    var m = (part ? part.value : "GMT+00:00").match(/([+-])(\d{2}):?(\d{2})?/);
    return m ? m[1] + m[2] + ":" + (m[3] || "00") : "+00:00";
  }
  function toDate(local, tz) { return new Date(local + ":00" + tzOffset(tz, new Date(local + ":00Z"))); }
  function fmt(local, opts) { return new Intl.DateTimeFormat(c.locale, Object.assign({ timeZone: c.timezone }, opts)).format(toDate(local, c.timezone)); }
  var longDate = function (l) { return fmt(l, { weekday: "long", day: "numeric", month: "long", year: "numeric" }); };
  var shortDate = function (l) { return fmt(l, { day: "numeric", month: "long", year: "numeric" }); };
  function dateRange() {
    var parts = c.events.map(function (e) { return { d: fmt(e.start, { day: "numeric" }), my: fmt(e.start, { month: "long", year: "numeric" }) }; });
    var same = parts.every(function (p) { return p.my === parts[0].my; });
    if (same) return parts.map(function (p) { return p.d; }).join(" " + c.and + " ") + " " + parts[0].my;
    return c.events.map(function (e) { return shortDate(e.start); }).join(" " + c.and + " ");
  }

  /* ---------- calendar (.ics) – always English ---------- */
  var icsEscape = function (s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); };
  var icsLocal = function (l) { return l.replace(/[-:]/g, "") + "00"; };
  function foldLine(line) {
    var enc = new TextEncoder(), out = [], cur = "";
    Array.from(line).forEach(function (ch) {
      var limit = out.length ? 74 : 75;
      if (enc.encode(cur + ch).length > limit) { out.push(cur); cur = ch; } else cur += ch;
    });
    out.push(cur);
    return out.join("\r\n ");
  }
  function buildICS(ev) {
    var tz = W.timezone, off = tzOffset(tz, toDate(ev.start, tz)).replace(":", "");
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    var couple = W.bride_name + " & " + W.groom_name;
    var dEn = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(toDate(ev.start, tz));
    var desc = [ev.title + " – Wedding celebration of " + couple, dEn + ", " + ev.time_text, ev.end_estimated ? "(End time is an estimate)" : "",
      "Venue: " + W.venue_name, "Address: " + W.venue_address, "Directions: " + W.directions_url].filter(Boolean).join("\n");
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Brunda and Pavan//Wedding Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE", "TZID:" + tz, "BEGIN:STANDARD", "DTSTART:19700101T000000", "TZOFFSETFROM:" + off, "TZOFFSETTO:" + off, "TZNAME:IST", "END:STANDARD", "END:VTIMEZONE",
      "BEGIN:VEVENT", "UID:" + ev.key + "-" + icsLocal(ev.start) + "@brunda-pavan-wedding", "DTSTAMP:" + stamp,
      "DTSTART;TZID=" + tz + ":" + icsLocal(ev.start), "DTEND;TZID=" + tz + ":" + icsLocal(ev.end),
      "SUMMARY:" + icsEscape(ev.title + " – " + couple), "LOCATION:" + icsEscape(W.venue_address), "DESCRIPTION:" + icsEscape(desc), "URL:" + W.directions_url,
      "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:" + icsEscape(ev.title), "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
    return lines.map(foldLine).join("\r\n") + "\r\n";
  }
  var slug = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  function downloadBlob(content, filename, type) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: type });
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(title, sub) {
    var el = $("#toast");
    el.innerHTML = "<strong>" + esc(title) + "</strong>" + (sub ? "<span>" + esc(sub) + "</span>" : "");
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-show"); }, 3200);
  }

  /* ---------- QR code ---------- */
  function qrMatrix(text) {
    var qr = window.qrcode(0, W.qr.ecc);
    qr.addData(text, "Byte");
    qr.make();
    return qr;
  }
  function qrSvg(text, size) {
    var qr = qrMatrix(text), n = qr.getModuleCount(), m = W.qr.margin, total = n + m * 2, d = "";
    for (var r = 0; r < n; r++) for (var col = 0; col < n; col++) if (qr.isDark(r, col)) d += "M" + (col + m) + " " + (r + m) + "h1v1h-1z";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '"' + (size ? ' width="' + size + '" height="' + size + '"' : "") +
      ' shape-rendering="crispEdges"><rect width="' + total + '" height="' + total + '" fill="' + W.qr.light + '"/><path d="' + d + '" fill="' + W.qr.dark + '"/></svg>';
  }
  function qrPng(text) {
    var qr = qrMatrix(text), n = qr.getModuleCount(), m = W.qr.margin, total = n + m * 2;
    var size = W.qr.download_size, edge = function (i) { return Math.round((i * size) / total); };
    var cv = document.createElement("canvas"); cv.width = cv.height = size;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = W.qr.light; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = W.qr.dark;
    for (var r = 0; r < n; r++) for (var col = 0; col < n; col++) {
      if (!qr.isDark(r, col)) continue;
      var x0 = edge(col + m), y0 = edge(r + m);
      ctx.fillRect(x0, y0, edge(col + m + 1) - x0, edge(r + m + 1) - y0);
    }
    return cv.toDataURL("image/png");
  }

  /* ---------- section templates ---------- */
  var reveal = function (html, delay) { return '<div class="reveal"' + (delay ? ' style="transition-delay:' + delay + 's"' : "") + ">" + html + "</div>"; };
  function sectionTitle(eyebrow, title, sub, testid) {
    return reveal('<div class="mb-12 text-center sm:mb-16">' + O.lotus("mx-auto mb-3 h-8 w-14") +
      (eyebrow ? '<p class="font-body mb-3 text-xs uppercase tracking-[0.3em] text-[var(--gold)]">' + esc(eyebrow) + "</p>" : "") +
      '<h2 class="font-serif gold-text text-3xl font-bold sm:text-4xl lg:text-5xl" data-testid="' + testid + '">' + esc(title) + "</h2>" +
      (sub ? '<p class="font-script mt-3 text-2xl text-[var(--accent)] sm:text-3xl">' + esc(sub) + "</p>" : "") +
      O.divider("mx-auto mt-5 h-5 w-56") + "</div>");
  }

  function openingText() {
    return '<div class="title-backdrop" aria-hidden="true"></div>' +
      '<p class="font-script fx-up relative text-3xl text-[var(--champagne)] sm:text-4xl" style="animation-delay:.3s" data-testid="opening-title">' + esc(t("openingTitle")) + "</p>" +
      '<h1 class="font-names gold-text fx-up relative mt-3 text-6xl leading-tight sm:text-7xl md:text-8xl" style="animation-delay:.6s" data-testid="opening-names" aria-label="' + esc(c.bride_name + " " + c.and + " " + c.groom_name) + '">' +
      esc(c.bride_name) + '<span class="font-serif my-1 block text-2xl font-normal italic text-[var(--champagne)] sm:text-3xl">' + esc(c.and) + "</span>" + esc(c.groom_name) + "</h1>" +
      '<p class="font-body fx-up relative mt-5 text-sm uppercase tracking-[0.35em] text-[var(--champagne)] sm:text-base" style="animation-delay:1s" data-testid="opening-dates">' + esc(dateRange()) + "</p>" +
      '<button type="button" class="tap-btn fx-pop pointer-events-auto relative mt-10" style="animation-delay:1.3s" data-testid="curtain-open-button" aria-label="' + esc(t("tapOpenAria")) + '">' +
      '<span class="font-serif px-3 text-lg font-semibold leading-tight">' + esc(t("tapOpen")) + "</span></button>";
  }

  function openingHTML() {
    var curtain = function (side) {
      return '<div class="curtain curtain-' + side + '"><div class="curtain-embroidery"></div><div class="curtain-hem"></div><div class="curtain-fringe"></div><div class="curtain-tassel"></div></div>';
    };
    var hangers = [0, 1, 2, 3, 4].map(function (i) {
      return '<div class="flex flex-col items-center ' + (i % 2 ? "mt-6 " : "") + (i > 0 && i < 4 ? "hidden sm:flex" : "") + '">' + O.jasmine("h-24 w-4", 6) +
        (W.opening.bells_enabled ? O.bell("h-12 w-6") : "") + "</div>";
    }).join("");
    return '<div class="absolute inset-0 flex items-center justify-center"><div class="opening-glow absolute h-[140vmax] w-[140vmax] rounded-full"></div>' +
      O.mandap("relative h-[78vh] max-h-[680px] w-auto max-w-[96vw]", { bells: W.opening.bells_enabled }) + "</div>" +
      curtain("left") + curtain("right") + embroideryHTML("opening-embroidery") +
      '<div class="pointer-events-none absolute inset-x-0 top-0 z-20"><div class="valance"></div>' + O.swag("-mt-1 h-10 w-full sm:h-14") +
      '<div class="absolute left-0 right-0 top-6 flex justify-between px-[6%]">' + hangers + "</div></div>" +
      '<div id="opening-text" class="opening-text absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">' + openingText() + "</div>";
  }

  function embroideryHTML(extra) {
    return '<div class="embroidery-frame ' + (extra || "") + '" aria-hidden="true" data-testid="embroidery-frame"><span class="emb emb-top"></span><span class="emb emb-bottom"></span>' +
      '<span class="emb emb-left"></span><span class="emb emb-right"></span>' + ["tl", "tr", "bl", "br"].map(function (k) { return '<span class="emb-corner emb-' + k + '"></span>'; }).join("") + "</div>";
  }

  function heroHTML() {
    var d = c.decor;
    var art = d.hero_illustration_url ? '<img src="' + esc(d.hero_illustration_url) + '" alt="" class="h-[92%] w-auto max-w-full object-contain opacity-60">' :
      O.mandap("h-[92%] w-auto max-w-[110vw] opacity-55", { garlands: d.garlands, bells: d.bells });
    return '<section id="home" class="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-24 pt-16" data-testid="hero-section">' +
      (d.rangoli ? O.rangoli("spin-slow absolute -left-32 -top-32 h-96 w-96 opacity-20") + O.rangoli("spin-slow absolute -bottom-40 -right-32 h-[28rem] w-[28rem] opacity-15") : "") +
      (d.banana_leaves ? O.bananaLeaf("absolute -left-8 bottom-0 h-64 w-28 opacity-70 sm:h-96 sm:w-40") + O.bananaLeaf("absolute -right-8 bottom-0 h-64 w-28 opacity-70 sm:h-96 sm:w-40", true) : "") +
      '<div id="hero-art" class="absolute inset-0 flex items-center justify-center">' + art + "</div>" +
      '<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg)_80%)]"></div>' +
      '<div class="relative z-10 max-w-3xl text-center">' +
      '<div class="fx-up">' + O.lotus("mx-auto h-12 w-20 lotus-bloom") + "</div>" +
      '<h1 class="font-names gold-text hero-names fx-up mt-4 flex flex-col items-center text-5xl leading-[1.15] sm:text-7xl lg:flex-row lg:justify-center lg:text-8xl" style="animation-delay:.2s" data-testid="hero-names">' +
      '<span class="whitespace-nowrap">' + esc(c.bride_name) + '</span><span class="font-serif mx-3 inline-block text-3xl font-normal italic text-[var(--accent)] sm:text-4xl">' + esc(c.and) +
      '</span><span class="whitespace-nowrap">' + esc(c.groom_name) + "</span></h1>" +
      '<p class="font-script fx-up mt-5 text-3xl text-[var(--accent)] sm:text-4xl" style="animation-delay:.6s" data-testid="hero-tagline">' + esc(c.hero_tagline) + "</p>" +
      '<p class="font-serif fx-up mx-auto mt-5 max-w-xl text-lg italic leading-relaxed text-[var(--ink)] sm:text-xl" style="animation-delay:.9s">' + esc(c.hero_invite) + "</p>" +
      '<ul class="fx-up mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6" style="animation-delay:1.2s" data-testid="hero-dates">' +
      c.events.map(function (e) {
        return '<li class="date-pill font-body text-sm tracking-wide sm:text-base"><span class="font-semibold text-[var(--accent)]">' + esc(shortDate(e.start)) +
          '</span><span class="mx-2 text-[var(--gold)]">–</span>' + esc(e.title) + "</li>";
      }).join("") + "</ul></div>" +
      '<a href="#family" class="scroll-cue absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-[var(--accent)]" data-testid="hero-scroll-indicator" aria-label="' + esc(t("scroll")) + '">' +
      '<span class="font-body text-[10px] uppercase tracking-[0.3em]">' + esc(t("scroll")) + "</span>" + O.icon("chevronDown", "mt-1 h-5 w-5") + "</a></section>";
  }

  function archCard(testid, art, name, relation, mother, father, delay) {
    var rel = c.relation_after ? '<p class="font-body mt-3 text-sm font-semibold text-[var(--accent)]" data-testid="' + testid + '-relation">' + esc(relation) + "</p>" :
      '<p class="font-body text-xs uppercase tracking-[0.3em] text-[var(--accent)]" data-testid="' + testid + '-relation">' + esc(relation) + "</p>";
    return reveal('<article class="arch-frame h-full" data-testid="' + testid + '"><div class="arch-inner shimmer relative flex h-full flex-col items-center px-6 pb-12 pt-14 text-center sm:px-10">' +
      O.cornerFloral("absolute bottom-2 left-2 h-14 w-14") + O.cornerFloral("absolute bottom-2 right-2 h-14 w-14 -scale-x-100") + art +
      '<h3 class="font-names gold-text mt-6 text-5xl leading-tight sm:text-6xl" data-testid="' + testid + '-name">' + esc(name) + "</h3>" + O.divider("my-4 h-4 w-40") +
      (c.relation_after ? "" : rel) +
      '<p class="font-serif mt-3 text-xl text-[var(--ink)] sm:text-2xl" data-testid="' + testid + '-mother">' + esc(mother) + "</p>" +
      '<p class="font-serif my-1 text-lg italic text-[var(--gold)]">' + esc(c.and) + "</p>" +
      '<p class="font-serif text-xl text-[var(--ink)] sm:text-2xl" data-testid="' + testid + '-father">' + esc(father) + "</p>" +
      (c.relation_after ? rel : "") + "</div></article>", delay);
  }

  function familyHTML() {
    var brideArt = '<div class="flex items-end justify-center gap-3">' + O.jasmine("h-20 w-4", 5) + O.lotus("h-16 w-28 lotus-bloom", true) + O.jasmine("h-20 w-4", 5) + "</div>";
    var groomArt = '<div class="flex items-end justify-center gap-4">' + O.bell("h-16 w-7") + O.kalasha("h-20 w-16") + O.bell("h-16 w-7") + "</div>";
    return '<section id="family" class="section-pad relative" data-testid="family-cards-section"><div class="mx-auto max-w-5xl px-5">' +
      sectionTitle("", t("familyTitle"), t("familySub"), "family-heading") +
      '<div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">' +
      archCard("bride-card", brideArt, c.bride_name, c.bride_relation, c.bride_mother, c.bride_father, 0) +
      archCard("groom-card", groomArt, c.groom_name, c.groom_relation, c.groom_mother, c.groom_father, 0.15) + "</div></div></section>";
  }

  function countdownEvent() { return c.events.find(function (e) { return e.key === c.countdown_event_key; }) || c.events[c.events.length - 1]; }
  function countdownHTML() {
    var ev = countdownEvent();
    var units = ["Days", "Hours", "Minutes", "Seconds"].map(function (k) {
      return '<div class="count-card relative flex flex-col items-center justify-center py-6 sm:py-8" data-testid="countdown-' + k.toLowerCase() + '">' +
        O.cornerFloral("absolute left-1 top-1 h-6 w-6 rotate-90 opacity-70") + O.cornerFloral("absolute bottom-1 right-1 h-6 w-6 -rotate-90 opacity-70") +
        '<div class="relative h-12 overflow-hidden sm:h-16"><span class="font-serif gold-text block text-4xl font-bold tabular-nums sm:text-6xl" data-unit="' + k + '">00</span></div>' +
        '<span class="font-body mt-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">' + esc(t(k)) + "</span></div>";
    }).join("");
    return '<section id="countdown" class="section-pad relative overflow-hidden bg-[var(--bg2)]" data-testid="wedding-countdown">' +
      O.rangoli("spin-slow absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-10") +
      '<div class="relative mx-auto max-w-4xl px-5">' + sectionTitle(ev.title + " · " + longDate(ev.start), t("countTitle"), t("countSub"), "countdown-heading") +
      '<div id="count-grid" class="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">' + units + "</div>" +
      '<p id="count-done" class="font-script gold-text hidden text-center text-4xl sm:text-5xl" data-testid="countdown-complete">' + esc(t("countDone")) + "</p></div></section>";
  }

  function scratchHTML() {
    return '<section id="save-the-date" class="section-pad relative" data-testid="save-the-date-scratch-card"><div class="mx-auto max-w-xl px-5">' +
      sectionTitle("", t("saveDate"), t("scratchSub"), "scratch-heading") +
      '<div class="gold-border-box mx-auto p-[3px]"><div id="scratch-wrap" class="relative aspect-[4/3] w-full select-none overflow-hidden rounded-[18px] bg-[#FFFDF5]">' +
      '<div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-[var(--ink)]" data-testid="scratch-revealed-content" aria-live="polite">' +
      O.lotus("h-8 w-14") + '<p class="font-names gold-text mt-1 text-4xl leading-tight sm:text-5xl" data-testid="scratch-names">' + esc(c.bride_name) +
      ' <span class="font-serif text-2xl italic">' + esc(c.and) + "</span> " + esc(c.groom_name) + "</p>" + O.divider("my-2 h-4 w-40") +
      c.events.map(function (e) { return '<p class="font-body text-sm font-medium sm:text-base">' + esc(shortDate(e.start)) + " – " + esc(e.title) + "</p>"; }).join("") +
      '<p class="font-serif mt-3 text-base font-semibold text-[var(--accent)] sm:text-lg">' + esc(c.venue_name) + "</p>" +
      '<p class="font-body text-xs sm:text-sm">' + esc(c.venue_location.replace(/,\s*(Karnataka|ಕರ್ನಾಟಕ)$/i, "")) + "</p></div>" +
      '<canvas id="scratch-canvas" class="absolute inset-0 h-full w-full cursor-grab touch-none transition-opacity duration-700 opacity-100" role="img" ' +
      'aria-label="Scratch card. Drag over the gold foil to reveal the wedding dates." data-testid="scratch-canvas"></canvas></div></div>' +
      '<div class="mt-5 flex justify-center gap-3"><button type="button" id="scratch-reveal" class="ghost-btn" data-testid="scratch-reveal-btn">' + esc(t("revealNow")) + "</button>" +
      '<button type="button" id="scratch-reset" class="ghost-btn hidden" data-testid="scratch-reset-btn">' + O.icon("rotateCcw") + " " + esc(t("scratchAgain")) + "</button></div></div></section>";
  }

  function storyHTML() {
    return '<section id="story" class="section-pad relative overflow-hidden bg-[var(--bg2)]" data-testid="our-story-section">' +
      O.mandap("pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.12]", { bells: false }) +
      '<div class="relative mx-auto max-w-3xl px-5 text-center">' +
      reveal('<p class="font-body text-xs uppercase tracking-[0.3em] text-[var(--gold)]">' + esc(t("ourStory")) + "</p>" +
        '<h2 class="font-serif gold-text mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl" data-testid="story-heading">' + esc(c.story_heading) + "</h2>") +
      reveal('<div class="mt-8 flex items-center justify-center">' + O.lotus("lotus-bloom h-14 w-24", true) + O.vines + O.lotus("lotus-bloom h-14 w-24", true) + "</div>", 0.15) +
      reveal('<p class="font-serif mx-auto mt-6 max-w-2xl text-xl italic leading-relaxed text-[var(--ink)] sm:text-2xl" data-testid="story-text">' + esc(c.story_text) + "</p>" +
        O.divider("mx-auto mt-8 h-5 w-56"), 0.3) + "</div></section>";
  }

  function eventArt(kind) {
    if (kind === "evening") {
      return '<div class="art-panel evening relative flex h-44 items-start justify-around overflow-hidden px-4 pt-0">' + O.swag("absolute inset-x-0 top-0 h-8 w-full") +
        [0, 1, 2, 3, 4].map(function (i) { return O.lamp("w-8 " + (i % 2 ? "mt-6 h-28" : "h-32")); }).join("") + "</div>";
    }
    return '<div class="art-panel morning relative flex h-44 items-end justify-center gap-4 overflow-hidden pb-3"><div class="sun-rays absolute left-1/2 top-[-60px] h-56 w-56 -translate-x-1/2 rounded-full"></div>' +
      O.bell("mb-14 h-16 w-7") + '<div class="flex flex-col items-center">' + O.kalasha("h-20 w-16") + O.lotus("-mt-1 h-10 w-20", true) + "</div>" + O.bell("mb-14 h-16 w-7") + "</div>";
  }

  function eventCard(ev, i) {
    return reveal('<div class="event-card' + (i === 0 ? " is-open" : "") + '" data-key="' + ev.key + '" data-testid="event-card-' + ev.key + '">' +
      '<button type="button" class="event-toggle flex w-full items-center gap-4 p-5 text-left sm:p-7" aria-expanded="' + (i === 0) + '" aria-controls="event-panel-' + ev.key + '" data-testid="event-toggle-' + ev.key + '">' +
      '<span class="font-body hidden rounded-full border border-[var(--gold)] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] sm:inline">' + esc(ev.label) + "</span>" +
      '<span class="flex-1"><span class="font-serif gold-text block text-2xl font-bold sm:text-3xl">' + esc(ev.title) + "</span>" +
      '<span class="font-body mt-1 block text-sm text-[var(--accent)]">' + esc(longDate(ev.start)) + " · " + esc(ev.time_text) + "</span></span>" +
      '<span class="chev flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)]">' + O.icon("chevronDown", "h-5 w-5") + "</span></button>" +
      '<div class="acc" id="event-panel-' + ev.key + '" data-testid="event-panel-' + ev.key + '"><div><div class="px-5 pb-7 sm:px-7">' + eventArt(ev.illustration) +
      '<p class="font-serif mt-5 text-lg italic leading-relaxed text-[var(--ink)] sm:text-xl">' + esc(ev.description) + "</p>" +
      '<dl class="font-body mt-5 space-y-3 text-sm text-[var(--ink)] sm:text-base">' +
      '<div class="flex gap-3">' + O.icon("clock", "mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]") + "<dd>" + esc(longDate(ev.start)) + ", " + esc(ev.time_text) + ' <span class="opacity-70">' + esc(t("ist")) + "</span></dd></div>" +
      '<div class="flex gap-3">' + O.icon("mapPin", "mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]") + '<dd><strong class="font-semibold text-[var(--accent)]">' + esc(c.venue_name) + "</strong><br><span>" +
      esc(c.venue_location) + '</span><br><span class="text-xs opacity-70">' + esc(c.venue_address) + "</span></dd></div></dl>" +
      '<div class="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" class="gold-btn add-ics" data-key="' + ev.key + '" data-testid="add-ics-' + ev.key + '">' + O.icon("calendarPlus") + " " + esc(t("addCal")) + "</button>" +
      '<a class="ghost-btn" href="' + esc(c.directions_url) + '" target="_blank" rel="noopener noreferrer" data-testid="directions-' + ev.key + '">' + O.icon("navigation") + " " + esc(t("directions")) + "</a></div>" +
      (ev.end_estimated ? '<p class="font-body mt-3 text-xs text-[var(--ink)] opacity-70">' + esc(t("estimate")) + "</p>" : "") +
      "</div></div></div></div>", i * 0.1);
  }

  function eventsHTML() {
    return '<section id="events" class="section-pad relative" data-testid="events-accordion"><div class="mx-auto max-w-3xl px-5">' +
      sectionTitle(t("joinUs"), t("eventsTitle"), t("eventsSub"), "events-heading") +
      '<div class="flex flex-col gap-6">' + c.events.map(eventCard).join("") + "</div></div></section>";
  }

  function venueHTML() {
    var map = "https://maps.google.com/maps?q=" + encodeURIComponent(c.venue_address) + "&z=15&output=embed";
    return '<section id="venue" class="section-pad relative bg-[var(--bg2)]" data-testid="venue-qr-section"><div class="mx-auto max-w-5xl px-5">' +
      sectionTitle(t("venueEyebrow"), c.venue_name, c.venue_location, "venue-name") +
      '<div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">' +
      reveal('<div class="gold-border-box p-[3px]"><div class="overflow-hidden rounded-[18px] bg-[#FFFDF5]">' +
        '<iframe title="Map to wedding venue" src="' + esc(map) + '" class="h-72 w-full border-0 sm:h-96" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-testid="venue-map"></iframe>' +
        '<div class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">' + O.icon("mapPin", "h-6 w-6 shrink-0 text-[var(--gold)]") +
        '<p class="font-body flex-1 text-sm text-[var(--ink)]" data-testid="venue-address">' + esc(c.venue_address) + "</p>" +
        '<a href="' + esc(c.directions_url) + '" target="_blank" rel="noopener noreferrer" class="gold-btn" data-testid="open-directions-btn">' + O.icon("navigation") + " " + esc(t("openDirections")) + "</a></div></div></div>") +
      reveal('<div class="qr-frame relative mx-auto max-w-sm" data-testid="qr-card"><div class="qr-ivory relative flex flex-col items-center px-6 pb-7 pt-6 text-center">' +
        O.cornerFloral("absolute left-2 top-2 h-10 w-10 rotate-90") + O.cornerFloral("absolute right-2 top-2 h-10 w-10 rotate-180") + O.lotus("h-8 w-14") +
        '<h3 class="font-serif mt-1 text-3xl font-bold text-[#7B1E1E]" data-testid="qr-title">' + esc(t("scanTitle")) + "</h3>" +
        '<div class="mt-4 w-full max-w-[260px] rounded-lg bg-white p-2 shadow-inner ring-1 ring-black/5"><div class="qr-box aspect-square w-full" role="img" aria-label="QR code with directions to the wedding venue" data-testid="venue-qr-code">' +
        qrSvg(c.directions_url) + "</div></div>" +
        '<p class="font-body mt-4 text-sm leading-relaxed text-[#2b2b2b]">' + esc(t("scanText")) + "</p></div></div>" +
        '<div class="mx-auto mt-6 flex max-w-sm flex-col gap-3"><div class="grid grid-cols-2 gap-3">' +
        '<button type="button" id="qr-png" class="gold-btn" data-testid="download-qr-btn">' + O.icon("download") + " QR (PNG)</button>" +
        '<button type="button" id="qr-svg" class="ghost-btn" data-testid="download-qr-svg-btn">' + O.icon("download") + " QR (SVG)</button></div>" +
        '<a href="' + esc(c.directions_url) + '" target="_blank" rel="noopener noreferrer" class="ghost-btn" data-testid="open-maps-btn">' + O.icon("externalLink") + " " + esc(t("openMaps")) + "</a>" +
        '<button type="button" id="copy-address" class="ghost-btn" data-testid="copy-address-btn">' + O.icon("copy") + " " + esc(t("copyAddress")) + "</button></div>", 0.15) +
      "</div></div></section>";
  }

  function footerHTML() {
    var strands = Array.from({ length: 9 }, function (_, i) { return O.jasmine("w-4 " + (i % 2 ? "h-20" : "h-32") + (i > 4 ? " hidden sm:block" : ""), i % 2 ? 5 : 8); }).join("");
    var sparks = Array.from({ length: 14 }, function (_, i) { return '<span style="left:' + (i * 37) % 100 + "%;animation-delay:" + (i % 7) * 0.8 + 's"></span>'; }).join("");
    return '<footer class="relative overflow-hidden pb-28 pt-24" data-testid="invitation-footer"><div class="absolute inset-x-0 top-0 flex justify-around px-4">' + strands + "</div>" +
      O.mandap("pointer-events-none absolute bottom-0 left-1/2 h-[90%] w-auto -translate-x-1/2 opacity-20", { bells: false }) +
      (c.decor.banana_leaves ? O.bananaLeaf("absolute -left-6 bottom-0 h-56 w-24 opacity-50") + O.bananaLeaf("absolute -right-6 bottom-0 h-56 w-24 opacity-50", true) : "") +
      '<div class="glow-particles" aria-hidden="true">' + sparks + "</div>" +
      reveal('<div class="relative z-10 px-5 text-center">' + O.lotus("lotus-bloom mx-auto h-12 w-20", true) +
        '<p class="font-script mt-4 text-4xl text-[var(--accent)] sm:text-5xl" data-testid="footer-with-love">' + esc(t("withLove")) + "</p>" +
        '<h2 class="font-names gold-text mt-3 text-5xl leading-tight sm:text-7xl" data-testid="footer-names">' + esc(c.bride_name) + ' <span class="font-serif text-3xl italic">' + esc(c.and) + "</span> " + esc(c.groom_name) + "</h2>" +
        O.divider("mx-auto my-5 h-5 w-56") +
        '<p class="font-serif text-xl italic text-[var(--ink)] sm:text-2xl">' + esc(c.footer_message) + "</p>" +
        '<p class="font-body mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]" data-testid="footer-dates">' + esc(dateRange()) + "</p>" +
        '<p class="font-body mt-2 text-sm text-[var(--ink)]">' + esc(c.footer_location) + "</p>" +
        (c.music_credit ? '<p class="font-body mt-12 text-[10px] text-[var(--ink)] opacity-60">' + esc(t("music")) + ": " + esc(c.music_credit) + "</p>" : "") + "</div>") +
      '<div class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#7B1E1E]/25 to-transparent"></div></footer>';
  }

  /* ---------- behaviours ---------- */
  var revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); revealObserver.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -60px 0px" }) : null;
  function bindReveals() {
    $$(".reveal").forEach(function (el) { if (reduced || !revealObserver) el.classList.add("is-in"); else revealObserver.observe(el); });
  }

  var countTimer;
  function startCountdown() {
    clearInterval(countTimer);
    var target = toDate(countdownEvent().start, c.timezone).getTime();
    var tick = function () {
      var ms = Math.max(0, target - Date.now()), s = Math.floor(ms / 1000);
      if (ms <= 0) { $("#count-grid").classList.add("hidden"); $("#count-done").classList.remove("hidden"); clearInterval(countTimer); return; }
      var vals = { Days: Math.floor(s / 86400), Hours: Math.floor((s % 86400) / 3600), Minutes: Math.floor((s % 3600) / 60), Seconds: s % 60 };
      Object.keys(vals).forEach(function (k) {
        var el = $('[data-unit="' + k + '"]'), v = String(vals[k]).padStart(2, "0");
        if (el && el.textContent !== v) { el.textContent = v; el.classList.remove("flip-in"); void el.offsetWidth; el.classList.add("flip-in"); }
      });
    };
    tick();
    countTimer = setInterval(tick, 1000);
  }

  function initAccordion() {
    $$(".event-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".event-card"), willOpen = !card.classList.contains("is-open");
        $$(".event-card").forEach(function (other) { other.classList.remove("is-open"); $(".event-toggle", other).setAttribute("aria-expanded", "false"); });
        if (willOpen) { card.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); }
      });
    });
    $$(".add-ics").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var ev = W.events.find(function (e) { return e.key === btn.dataset.key; });
        downloadBlob(buildICS(ev), slug(W.bride_name) + "-" + slug(W.groom_name) + "-" + ev.key + ".ics", "text/calendar;charset=utf-8");
      });
    });
  }

  function initVenue() {
    $("#qr-png").addEventListener("click", function () {
      var a = document.createElement("a"); a.href = qrPng(W.directions_url); a.download = "wedding-venue-qr.png"; document.body.appendChild(a); a.click(); a.remove();
    });
    $("#qr-svg").addEventListener("click", function () { downloadBlob(qrSvg(W.directions_url, W.qr.download_size), "wedding-venue-qr.svg", "image/svg+xml"); });
    $("#copy-address").addEventListener("click", function () {
      var done = function () { toast(t("copied")); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(W.venue_address).then(done, fallback); else fallback();
      function fallback() {
        var ta = document.createElement("textarea"); ta.value = W.venue_address; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) { /* ignore */ }
        ta.remove(); done();
      }
    });
  }

  function initScratch() {
    var wrap = $("#scratch-wrap"), cv = $("#scratch-canvas"), ctx = cv.getContext("2d");
    var revealBtn = $("#scratch-reveal"), resetBtn = $("#scratch-reset");
    var drawing = false, last = null, moves = 0, revealed = false;
    function paint() {
      var r = wrap.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      var w = cv.width, h = cv.height;
      ctx.globalCompositeOperation = "source-over";
      var g = ctx.createLinearGradient(0, 0, w, h);
      ["#AA771C", "#FCF6BA", "#B38728", "#FBF5B7", "#BF953F", "#E6CA65"].forEach(function (col, i, a) { g.addColorStop(i / (a.length - 1), col); });
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < (w * h) / 90; i++) {
        ctx.fillStyle = "rgba(" + (Math.random() > 0.5 ? "255,250,220" : "120,85,20") + "," + Math.random() * 0.18 + ")";
        ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
      }
      var s = w / 400;
      ctx.strokeStyle = "rgba(120,85,20,0.55)"; ctx.lineWidth = 2 * s; ctx.strokeRect(14 * s, 14 * s, w - 28 * s, h - 28 * s);
      ctx.fillStyle = "rgba(80,55,10,0.85)"; ctx.textAlign = "center";
      ctx.font = "600 " + 24 * s + "px 'Cormorant Garamond', 'Noto Serif Kannada', serif"; ctx.fillText(t("scratchHere"), w / 2, h / 2 - 4 * s);
      ctx.font = 12 * s + "px 'Plus Jakarta Sans', 'Noto Sans Kannada', sans-serif"; ctx.fillText("✦  " + t("scratchHint") + "  ✦", w / 2, h / 2 + 22 * s);
    }
    function setRevealed(v) {
      revealed = v;
      cv.classList.toggle("opacity-0", v); cv.classList.toggle("pointer-events-none", v); cv.classList.toggle("opacity-100", !v);
      revealBtn.classList.toggle("hidden", v); resetBtn.classList.toggle("hidden", !v);
    }
    function point(e) {
      var r = cv.getBoundingClientRect(), k = cv.width / r.width;
      return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, cx: e.clientX - r.left, cy: e.clientY - r.top };
    }
    function checkCleared() {
      var data = ctx.getImageData(0, 0, cv.width, cv.height).data, clear = 0, total = 0;
      for (var i = 3; i < data.length; i += 64) { total++; if (data[i] < 128) clear++; }
      if (total && clear / total > 0.45) setRevealed(true);
    }
    function spark(x, y) {
      var el = document.createElement("span"); el.className = "spark"; el.style.left = x + "px"; el.style.top = y + "px";
      wrap.appendChild(el); setTimeout(function () { el.remove(); }, 700);
    }
    function scratch(e) {
      if (!drawing || revealed) return;
      var p = point(e), rad = 26 * (cv.width / wrap.clientWidth);
      ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = rad * 2; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
      if (++moves % 8 === 0) { checkCleared(); spark(p.cx, p.cy); }
    }
    function end() { if (!drawing) return; drawing = false; last = null; checkCleared(); }
    cv.addEventListener("pointerdown", function (e) {
      drawing = true; last = null;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* pointer not active */ }
      scratch(e);
    });
    cv.addEventListener("pointermove", scratch);
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (n) { cv.addEventListener(n, end); });
    revealBtn.addEventListener("click", function () { setRevealed(true); });
    resetBtn.addEventListener("click", function () { moves = 0; setRevealed(false); paint(); });
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!revealed) paint(); });
  }

  /* ---------- petals ---------- */
  var PALETTES = {
    jasmine: ["#FFFDF5", "#F7EFD8", "#F3E5AB", "#E6CA65"],
    marigold: ["#F0A830", "#E88A1A", "#F6C453", "#FFFDF5"],
    rose: ["#F2B8B0", "#E58F8F", "#FFF4EC", "#D4AF37"],
    traditional: ["#FFFDF5", "#F0A830", "#B3262C", "#F2B8B0", "#FFFDF5"],
  };
  var petals = [], petalTarget = 0, colors = PALETTES[W.decor.petal_palette] || PALETTES.jasmine;
  function spawnPetal(top, fast) {
    return {
      x: Math.random() * window.innerWidth, y: top ? -20 - Math.random() * (fast ? 300 : window.innerHeight * 0.6) : Math.random() * window.innerHeight,
      r: 4 + Math.random() * 6, vy: fast ? 1.2 + Math.random() * 1.5 : 0.4 + Math.random() * 0.9, vx: -0.3 + Math.random() * 0.6,
      rot: Math.random() * Math.PI, vr: -0.02 + Math.random() * 0.04, sway: Math.random() * 100, c: colors[Math.floor(Math.random() * colors.length)],
    };
  }
  function startPetals() {
    if (reduced || !W.opening.petals_enabled) return;
    var canvas = $("#petals"), ctx = canvas.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var resize = function () { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);
    petalTarget = Math.round(W.opening.petal_count * (isMobile() ? 0.45 : 1) / (opened ? 2 : 1));
    for (var i = 0; i < petalTarget; i++) petals.push(spawnPetal(false));
    (function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      petals.forEach(function (p) {
        p.sway += 0.02; p.y += p.vy; p.x += p.vx + Math.sin(p.sway) * 0.4; p.rot += p.vr;
        if (p.y > window.innerHeight + 20) Object.assign(p, spawnPetal(true), { y: -20 });
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      if (petals.length > petalTarget) petals = petals.filter(function (p, i) { return i < petalTarget || p.y < window.innerHeight; });
      requestAnimationFrame(tick);
    })();
  }
  function petalBurst() {
    if (reduced || !W.opening.petals_enabled) return;
    var extra = isMobile() ? 30 : 70;
    for (var i = 0; i < extra; i++) petals.push(spawnPetal(true, true));
    petalTarget = Math.round(petalTarget / 2);
  }

  /* ---------- music ---------- */
  var audio = new Audio();
  audio.src = W.music_url; audio.loop = true; audio.preload = "none"; audio.volume = W.music_volume;
  function renderMusicBtn() {
    var btn = $("#music-btn"), playing = !audio.paused;
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    btn.innerHTML = (playing ? '<span class="flex items-end gap-[3px]" aria-hidden="true">' + [0, 1, 2, 3].map(function (i) { return '<span class="eq-bar" style="animation-delay:' + i * 0.15 + 's"></span>'; }).join("") + "</span>" : O.icon("music", "h-5 w-5")) +
      '<span class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FFFDF5] text-[#7B1113]">' + O.icon(playing ? "pause" : "play", "h-3 w-3") + "</span>";
  }
  function playMusic() {
    var p = audio.play();
    if (p && p.catch) p.catch(function () { toast(t("musicBlocked"), t("musicBlockedSub")); });
  }
  audio.addEventListener("play", renderMusicBtn);
  audio.addEventListener("pause", renderMusicBtn);

  /* ---------- scroll effects ---------- */
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    $("#scroll-progress").style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    var hero = $("#home"), art = $("#hero-art");
    if (hero && art && !reduced) {
      var p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
      art.style.transform = "translateY(" + p * 18 + "%)";
      art.style.opacity = String(1 - Math.min(p / 0.8, 1) * 0.8);
    }
  }

  /* ---------- render ---------- */
  function renderMain() {
    $("#main").innerHTML = heroHTML() + familyHTML() + countdownHTML() + scratchHTML() + storyHTML() + eventsHTML() + venueHTML();
    $("#footer").innerHTML = footerHTML();
    bindReveals(); startCountdown(); initAccordion(); initVenue(); initScratch(); onScroll();
  }

  function setLang(l) {
    lang = l; c = localize(l);
    try { localStorage.setItem("bp_lang", l); } catch (e) { /* storage blocked */ }
    document.documentElement.lang = l === "kn" ? "kn" : "en";
    $$(".lang-opt").forEach(function (b) { var on = b.dataset.lang === l; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
    var ot = $("#opening-text");
    if (ot) { ot.innerHTML = openingText(); bindOpenButton(); }
    renderMain();
  }

  function finishOpening() {
    opened = true;
    var ov = $("#opening");
    if (ov) { ov.classList.add("is-gone"); setTimeout(function () { ov.remove(); }, 900); }
    $("#main").removeAttribute("aria-hidden");
    $("#site-embroidery").classList.remove("hidden");
    $("#music-btn").classList.remove("hidden");
  }

  function bindOpenButton() {
    var btn = $("#opening [data-testid='curtain-open-button']");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var ov = $("#opening");
      if (ov.classList.contains("is-open")) return;
      var dur = reduced ? 0.4 : W.opening.curtain_duration;
      ov.style.setProperty("--dur", dur + "s");
      ov.classList.add("is-open");
      petalBurst();
      playMusic();
      setTimeout(finishOpening, dur * 1000 + 1100);
    });
  }

  function init() {
    $("#gold-defs").innerHTML = O.goldDefs;
    $("#site-embroidery").innerHTML = embroideryHTML();
    $$(".lang-opt").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang); }); });
    $("#music-btn").addEventListener("click", function () { if (audio.paused) playMusic(); else audio.pause(); });
    renderMusicBtn();
    if (opened) {
      $("#opening").remove();
      finishOpening();
    } else {
      $("#opening").innerHTML = openingHTML();
      $("#main").setAttribute("aria-hidden", "true");
    }
    setLang(lang);
    setTimeout(function () { $(".invite-root").classList.add("no-fx"); }, 2500);
    startPetals();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
