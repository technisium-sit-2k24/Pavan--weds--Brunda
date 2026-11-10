/* SVG ornament library (strings). No people, only traditional motifs. */
(function () {
  "use strict";
  var range = function (n) { return Array.from({ length: n }, function (_, i) { return i; }); };

  var goldDefs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9C7412"/><stop offset="28%" stop-color="#E8CD72"/><stop offset="52%" stop-color="#A67C1B"/><stop offset="76%" stop-color="#E0C068"/><stop offset="100%" stop-color="#7A5A10"/></linearGradient>' +
    '<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#EAD27A"/><stop offset="45%" stop-color="#B8901F"/><stop offset="100%" stop-color="#6E5210"/></linearGradient>' +
    '<radialGradient id="warmGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF1C1" stop-opacity="0.95"/><stop offset="40%" stop-color="#E6CA65" stop-opacity="0.45"/><stop offset="100%" stop-color="#E6CA65" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#5E8A3A"/><stop offset="100%" stop-color="#2D4A27"/></linearGradient>' +
    '<linearGradient id="petalPink" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FFF4EC"/><stop offset="100%" stop-color="#F2B8B0"/></linearGradient>' +
    '</defs></svg>';

  var lotusInner = function (pink) {
    return '<g fill="' + (pink ? "url(#petalPink)" : "none") + '" stroke="url(#gold)" stroke-width="1.6">' +
      '<path d="M60 64 C40 50 38 24 60 4 C82 24 80 50 60 64Z"/><path d="M60 64 C34 60 18 40 22 18 C42 22 56 40 60 64Z"/>' +
      '<path d="M60 64 C86 60 102 40 98 18 C78 22 64 40 60 64Z"/><path d="M60 64 C30 66 8 56 2 40 C24 34 46 46 60 64Z"/>' +
      '<path d="M60 64 C90 66 112 56 118 40 C96 34 74 46 60 64Z"/></g>' +
      '<path d="M30 66 Q60 72 90 66" stroke="url(#gold)" stroke-width="1.6" fill="none"/>';
  };
  var lotus = function (cls, pink) { return '<svg viewBox="0 0 120 70" class="' + (cls || "") + '" aria-hidden="true">' + lotusInner(pink) + '</svg>'; };

  var bellInner = '<line x1="20" y1="0" x2="20" y2="34" stroke="url(#goldV)" stroke-width="1.5"/>' +
    [8, 16, 24].map(function (y) { return '<circle cx="20" cy="' + y + '" r="2.2" fill="#FFFDF5"/>'; }).join("") +
    '<path d="M20 34 C10 34 9 46 8 58 C7 66 3 70 3 74 L37 74 C37 70 33 66 32 58 C31 46 30 34 20 34Z" fill="url(#gold)" stroke="#8A6A1C" stroke-width="0.8"/>' +
    '<rect x="2" y="73" width="36" height="4" rx="2" fill="url(#goldV)"/><circle cx="20" cy="82" r="4" fill="url(#gold)"/>' +
    '<path d="M14 46 Q20 42 26 46" stroke="#8A6A1C" stroke-width="0.8" fill="none"/>';
  var bell = function (cls) { return '<svg viewBox="0 0 40 90" class="' + (cls || "") + ' bell-swing" aria-hidden="true">' + bellInner + '</svg>'; };

  var jasmine = function (cls, length, attrs) {
    length = length || 10;
    var flowers = range(length).map(function (i) {
      var inner = i % 4 === 3 ? '<circle r="3" fill="#C0392B" opacity="0.85"/>' :
        '<g fill="#FFFDF5" stroke="#E9DFC2" stroke-width="0.4"><ellipse rx="3" ry="5"/><ellipse rx="3" ry="5" transform="rotate(60)"/><ellipse rx="3" ry="5" transform="rotate(-60)"/></g>';
      return '<g transform="translate(10 ' + (i * 14 + 6) + ')">' + inner + '</g>';
    }).join("");
    return '<svg viewBox="0 0 20 ' + (length * 14 + 20) + '" class="' + (cls || "") + '" aria-hidden="true" ' + (attrs || "") + '>' +
      '<line x1="10" y1="0" x2="10" y2="' + length * 14 + '" stroke="#C9B57A" stroke-width="0.8"/>' + flowers +
      '<path d="M10 ' + length * 14 + ' l-5 8 h10z" fill="url(#gold)"/></svg>';
  };

  var swag = function (cls) {
    return '<svg viewBox="0 0 400 60" preserveAspectRatio="none" class="' + (cls || "") + '" aria-hidden="true">' +
      [0, 100, 200, 300].map(function (x) {
        return '<g><path d="M' + x + ' 4 Q' + (x + 50) + ' 50 ' + (x + 100) + ' 4" stroke="#FFFDF5" stroke-width="6" stroke-dasharray="2 5" stroke-linecap="round" fill="none"/>' +
          '<path d="M' + x + ' 4 Q' + (x + 50) + ' 42 ' + (x + 100) + ' 4" stroke="#F0A830" stroke-width="4" stroke-dasharray="1 6" stroke-linecap="round" fill="none" opacity="0.9"/>' +
          '<circle cx="' + x + '" cy="5" r="4" fill="url(#gold)"/></g>';
      }).join("") + '</svg>';
  };

  var divider = function (cls) {
    return '<svg viewBox="0 0 300 24" class="' + (cls || "") + '" aria-hidden="true"><path d="M0 12 H120 M180 12 H300" stroke="url(#gold)" stroke-width="1"/>' +
      '<path d="M120 12 Q135 0 150 12 Q165 24 180 12" stroke="url(#gold)" fill="none" stroke-width="1.2"/><path d="M150 3 L156 12 L150 21 L144 12Z" fill="url(#gold)"/>' +
      '<circle cx="112" cy="12" r="2" fill="url(#gold)"/><circle cx="188" cy="12" r="2" fill="url(#gold)"/></svg>';
  };

  var cornerFloral = function (cls) {
    return '<svg viewBox="0 0 100 100" class="' + (cls || "") + '" aria-hidden="true"><g fill="none" stroke="url(#gold)" stroke-width="1.2">' +
      '<path d="M4 96 C4 50 50 4 96 4"/><path d="M14 96 C16 60 60 16 96 14" opacity="0.6"/><path d="M30 70 C20 58 26 44 40 46 C40 58 36 66 30 70Z"/><path d="M70 30 C58 20 44 26 46 40 C58 40 66 36 70 30Z"/></g>' +
      '<g transform="translate(22 78)"><circle r="7" fill="url(#gold)" opacity="0.9"/><circle r="3" fill="#0B2317"/></g><g transform="translate(78 22)"><circle r="5" fill="url(#gold)"/></g></svg>';
  };

  var rangoli = function (cls) {
    return '<svg viewBox="0 0 200 200" class="' + (cls || "") + '" aria-hidden="true"><g fill="none" stroke="url(#gold)" stroke-width="0.8">' +
      range(12).map(function (i) { return '<path d="M100 100 C110 70 110 40 100 10 C90 40 90 70 100 100Z" transform="rotate(' + i * 30 + ' 100 100)"/>'; }).join("") +
      [30, 55, 80, 95].map(function (r) { return '<circle cx="100" cy="100" r="' + r + '"' + (r === 95 ? ' stroke-dasharray="2 6"' : "") + '/>'; }).join("") +
      range(24).map(function (i) { return '<circle cx="100" cy="12" r="2.5" transform="rotate(' + i * 15 + ' 100 100)"/>'; }).join("") +
      '</g></svg>';
  };

  var bananaLeaf = function (cls, flip) {
    return '<svg viewBox="0 0 120 260" class="' + (cls || "") + '"' + (flip ? ' style="transform:scaleX(-1)"' : "") + ' aria-hidden="true">' +
      '<path d="M60 258 C20 200 6 110 40 10 C70 60 96 150 60 258Z" fill="url(#leaf)" opacity="0.85"/><path d="M60 258 C52 180 46 100 40 10" stroke="#9BBF6A" stroke-width="1.5" fill="none"/>' +
      range(10).map(function (i) { return '<path d="M' + (44 + i * 0.8) + ' ' + (40 + i * 22) + ' q16 4 30 20" stroke="#9BBF6A" stroke-width="0.6" fill="none" opacity="0.6"/>'; }).join("") +
      '</svg>';
  };

  var lamp = function (cls) {
    return '<svg viewBox="0 0 40 110" class="' + (cls || "") + ' bell-swing" aria-hidden="true"><line x1="20" y1="0" x2="20" y2="40" stroke="url(#goldV)" stroke-width="1.2"/>' +
      '<ellipse cx="20" cy="62" rx="22" ry="22" fill="url(#warmGlow)"/><path d="M8 44 H32 L28 50 H12Z" fill="url(#gold)"/>' +
      '<path d="M10 50 C6 60 10 76 20 80 C30 76 34 60 30 50Z" fill="url(#gold)" opacity="0.92"/><path d="M14 56 H26 M13 64 H27 M15 72 H25" stroke="#8A6A1C" stroke-width="0.8"/>' +
      '<path d="M20 30 C16 36 18 42 20 44 C22 42 24 36 20 30Z" fill="#FFD36B" class="flame-flicker"/><path d="M20 80 V92" stroke="url(#goldV)" stroke-width="1.2"/>' +
      '<circle cx="20" cy="95" r="3" fill="url(#gold)"/></svg>';
  };

  var kalasha = function (cls) {
    return '<svg viewBox="0 0 80 100" class="' + (cls || "") + '" aria-hidden="true">' +
      [-28, -14, 0, 14, 28].map(function (a) { return '<path d="M40 30 C34 18 36 6 40 0 C44 6 46 18 40 30Z" fill="url(#leaf)" transform="rotate(' + a + ' 40 32)"/>'; }).join("") +
      '<circle cx="40" cy="24" r="10" fill="#C59B27" stroke="#8A6A1C"/><path d="M24 36 H56 L52 42 C66 50 66 78 52 88 H28 C14 78 14 50 28 42Z" fill="url(#gold)" stroke="#8A6A1C" stroke-width="0.8"/>' +
      '<path d="M22 60 H58" stroke="#8B1E1E" stroke-width="2"/><rect x="26" y="88" width="28" height="6" rx="2" fill="url(#goldV)"/></svg>';
  };

  var archCrown = function () {
    var leaves = range(15).map(function (i) {
      var t = (i + 1) / 16, x = 62 + t * 476, y = 204 - 4 * 158 * t * (1 - t);
      return '<path d="M0 0 C-7 12 -5 24 0 30 C5 24 7 12 0 0Z" fill="url(#leaf)" transform="translate(' + x + ' ' + (y + 4) + ')"/>';
    }).join("");
    return '<g><path d="M40 200 Q300 20 560 200" stroke="url(#gold)" stroke-width="14" fill="none"/><path d="M62 204 Q300 46 538 204" stroke="#8A6A1C" stroke-width="2" fill="none"/>' +
      '<path d="M78 210 Q300 66 522 210" stroke="url(#gold)" stroke-width="3" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>' +
      '<g transform="translate(300 52)"><path d="M-70 40 H70 L56 20 H-56Z" fill="url(#gold)"/><path d="M-46 20 H46 L36 0 H-36Z" fill="url(#gold)"/><path d="M-26 0 H26 L18 -18 H-18Z" fill="url(#gold)"/>' +
      '<path d="M-8 -18 Q0 -46 8 -18Z" fill="url(#goldV)"/><circle cx="0" cy="-48" r="5" fill="url(#gold)"/><path d="M-56 30 H56 M-36 10 H36" stroke="#8A6A1C" stroke-width="1.2"/></g>' +
      leaves + '</g>';
  };

  var pillar = function (x) {
    return '<g transform="translate(' + x + ' 0)"><rect x="-24" y="196" width="48" height="16" rx="3" fill="url(#gold)"/><path d="M-18 212 H18 L14 232 H-14Z" fill="url(#goldV)"/>' +
      '<rect x="-14" y="232" width="28" height="318" fill="url(#goldV)" opacity="0.92"/>' +
      [270, 330, 400, 470].map(function (y) { return '<rect x="-18" y="' + y + '" width="36" height="10" rx="2" fill="url(#gold)"/><circle cx="0" cy="' + (y + 30) + '" r="6" fill="none" stroke="#8A6A1C" stroke-width="1.2"/>'; }).join("") +
      '<path d="M-14 520 H14 L22 550 H-22Z" fill="url(#gold)"/><rect x="-28" y="550" width="56" height="12" rx="2" fill="url(#goldV)"/></g>';
  };

  var mandap = function (cls, opts) {
    opts = opts || {};
    var garlands = opts.garlands !== false, bells = opts.bells !== false;
    var g = garlands ? [100, 132, 468, 500].map(function (x, i) {
      var len = i % 2 ? 16 : 20;
      return jasmine("", len, 'x="' + (x - 7) + '" y="212" width="14" height="' + (len * 14 * 0.7 + 14) + '"');
    }).join("") +
      '<path d="M110 214 Q300 330 490 214" stroke="#FFFDF5" stroke-width="7" stroke-dasharray="2 6" stroke-linecap="round" fill="none" opacity="0.9"/>' +
      '<path d="M110 214 Q300 310 490 214" stroke="#F0A830" stroke-width="5" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>' : "";
    var b = bells ? [190, 245, 300, 355, 410].map(function (x, i) {
      return '<svg x="' + (x - 12) + '" y="' + (i === 2 ? 140 : 160) + '" width="24" height="56" viewBox="0 0 40 90" overflow="visible"><g class="bell-swing">' + bellInner + '</g></svg>';
    }).join("") : "";
    return '<svg viewBox="0 0 600 640" class="' + (cls || "") + '" aria-hidden="true">' +
      '<ellipse cx="300" cy="360" rx="250" ry="260" fill="url(#warmGlow)" class="glow-pulse"/>' + archCrown() + pillar(72) + pillar(528) + g + b +
      '<g><rect x="24" y="562" width="552" height="16" rx="3" fill="url(#gold)"/><rect x="8" y="578" width="584" height="20" rx="3" fill="url(#goldV)" opacity="0.85"/>' +
      '<path d="M8 588 H592" stroke="#8A6A1C" stroke-width="1" stroke-dasharray="6 6"/></g>' +
      '<svg x="230" y="500" width="140" height="80" viewBox="0 0 120 70">' + lotusInner(true) + '</svg>' +
      '<svg x="150" y="526" width="80" height="44" viewBox="0 0 120 70">' + lotusInner(false) + '</svg>' +
      '<svg x="370" y="526" width="80" height="44" viewBox="0 0 120 70">' + lotusInner(false) + '</svg></svg>';
  };

  var vines = '<svg viewBox="0 0 400 120" class="h-24 w-full max-w-md" aria-hidden="true">' +
    '<path class="draw-line" d="M40 100 C120 100 140 20 200 60 C260 100 280 20 360 20" stroke="url(#gold)" stroke-width="1.6" fill="none"/>' +
    '<path class="draw-line" d="M40 20 C120 20 140 100 200 60 C260 20 280 100 360 100" stroke="url(#gold)" stroke-width="1.6" fill="none" style="animation-delay:0.4s"/>' +
    [[110, 64], [290, 56], [160, 40], [240, 80]].map(function (p, i) { return '<path d="M0 0 C6 -8 14 -8 18 0 C14 8 6 8 0 0Z" fill="url(#leaf)" transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + i * 50 + ')"/>'; }).join("") +
    '<circle cx="200" cy="60" r="6" fill="url(#gold)"/></svg>';

  var icon = function (body, cls) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + (cls || "h-4 w-4") + '" aria-hidden="true">' + body + '</svg>';
  };
  var ICONS = {
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    calendarPlus: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v6M9 17h6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    externalLink: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    rotateCcw: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  };

  window.Orn = {
    goldDefs: goldDefs, lotus: lotus, bell: bell, jasmine: jasmine, swag: swag, divider: divider, cornerFloral: cornerFloral,
    rangoli: rangoli, bananaLeaf: bananaLeaf, lamp: lamp, kalasha: kalasha, mandap: mandap, vines: vines,
    icon: function (name, cls) { return icon(ICONS[name], cls); },
  };
})();
