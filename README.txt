Brunda S & Pavan E – Wedding Invitation (plain HTML / CSS / JavaScript)
=======================================================================

No build step and nothing to install.

HOW TO OPEN
  Double-click index.html, or upload the whole folder to any static host
  (Netlify Drop, GitHub Pages, Vercel, cPanel, an S3 bucket, ...).
  Google Fonts and the Google Maps embed load from the internet.
  For the WhatsApp/social preview to work, the site has to be on a public URL.

FOLDER CONTENTS
  index.html             page shell + share/SEO metadata
  css/style.css          compiled Tailwind utilities + theme (colours, curtains, embroidery, cards)
  css/extra.css          animations used by the plain-JS version (reveal, curtains, accordion, toast)
  js/config.js           ALL wedding details + English/Kannada text  <-- edit this file
  js/ornaments.js        SVG illustrations (mandap, lotus, bells, jasmine, lamps, kalasha, rangoli)
  js/app.js              page logic: opening curtains, music, language switch, countdown,
                         scratch card, events accordion, .ics calendar files, QR code, petals
  js/qrcode-generator.js QR library (MIT, Kazuhiko Arase)
  audio/veena-kiravani.mp3  background music: veena alapana in Raga Kiravani
                         by L. Ramakrishnan (Public Domain, Internet Archive)
  img/og-image.jpg       illustrated mandap preview image (no people)

EDITING
  - Names, parents, dates/times, venue, directions link, story text: js/config.js (WEDDING)
  - Kannada text: js/config.js (STRINGS.kn and WEDDING_KN)
  - Music: replace audio/veena-kiravani.mp3, or change music_url in js/config.js
  - The QR code is generated from directions_url, so it always matches the link.
  - Calendar (.ics) files use the Asia/Kolkata time zone. The Reception end time (10:30 PM) is an estimate.
