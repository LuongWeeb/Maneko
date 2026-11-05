# Maneko fonts

Plus Jakarta Sans is served locally as unmodified Google Fonts WOFF2 subsets.
Each file is a variable font covering weights 400–800, including critical heading
weights 700 and 800. Latin and Vietnamese are preloaded; Latin Extended loads only
when needed. All three faces use `font-display: swap`.

Source CSS (retrieved 2026-11-05):
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400..800&display=swap

| File | Google Fonts source |
| --- | --- |
| `plus-jakarta-sans-latin-variable.woff2` | https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2 |
| `plus-jakarta-sans-vietnamese-variable.woff2` | https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko50yyygA.woff2 |
| `plus-jakarta-sans-latin-ext-variable.woff2` | https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko40yyygA.woff2 |

License: `OFL-Plus-Jakarta-Sans.txt` (SIL Open Font License 1.1), from
https://github.com/google/fonts/tree/main/ofl/plusjakartasans.

The adjusted fallback in `../scss/base/_fonts.scss` uses locally installed Arial
for weights 400–500 and Arial Bold for 600–800. Size adjustment was calculated
from the summed glyph advances of the text in `index.html`, using primary font
instances at 400/700 and the corresponding Arial fonts. Vertical overrides use
the source font's 1000 units/em, ascent 1038, descent 222 and line gap 0, divided
by the size adjustment. Source font version: 2.071. Measurements are recorded in
`../../artifacts/font-performance/fallback-metrics.json`.

These adjustments reduce metric differences; they cannot guarantee identical
wrapping for every string or platform. Systems without Arial use their generic
sans-serif fallback. Recalculate when changing the primary font or fallback.

Dancing Script remains on Google Fonts at weight 600 with `display=swap`.
Its adjusted Arial Italic fallback uses the three handwritten subtitle strings
as the width sample. The source Dancing Script 2.001 metrics are 1000 units/em,
ascent 920, descent 280 and zero line gap. Measurements are recorded in
`../../artifacts/font-performance/script-fallback-metrics.json`. This avoids the
extra subtitle line observed with the platform's generic cursive fallback.

Run `node artifacts/font-performance/verify.cjs` from the project root to check
delayed web-font rendering, preload reuse, MIME types, Google Fonts failure and
layout shifts during font swapping. This is a controlled browser check, not a
Lighthouse score or field Core Web Vitals measurement.
