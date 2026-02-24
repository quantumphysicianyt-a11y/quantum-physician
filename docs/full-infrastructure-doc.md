
## Session 10B Updates
- **Card Library uses own SVG helper** (`clSvg()`) — independent of `auditSvg()` scope, has 7 icons: link, users, calendar, star, zap, grad, key
- **Email renderers** (`buildRichEmail`, `buildAcademyEmail`) — card loop uses `for(cx=2;cx<parts.length;cx++)` pattern, border colors cycle via array
- **Terminal workflow confirmed** — all edits via Python scripts + git push, no file downloads
