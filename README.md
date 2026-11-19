# SMARTLIBverse — Jelajah Dunia Ilmu

Independent educational RPG demo for SK Pendidikan Khas Taiping. Public entry: https://skpkt.github.io/smartlibverse/. Return link: https://skpkt.github.io/smartlib/.

## Play and development

Production needs only a browser. No school login, backend, Gemini key or student dataset is used. Run `npm test` and `npm run build` with Node 22+ for development. Serve `dist` using any static HTTP server. Never open JavaScript modules through file://.

Seven playable zones: Plaza Mula, Perpustakaan Maya, Galeri Cerita, Arena Kuiz, Dewan Anugerah, Taman Ilmu and gated Zon Rahsia. Six missions; unique rewards; three original four-page stories with deterministic five-question quizzes. Collection, inventory, profile, missions, certificate preview and A4 browser print/PDF are functional.

Move using WASD/arrows or the Pointer Events joystick. E/Interaksi activates a nearby object/portal; Shift/Lari runs. Escape closes a dialog. Mod Mudah slows movement; accessible destination buttons provide assisted travel. Map travel obeys the secret gate. Profile changes preserve location and rewards. Reset requires explicit confirmation. Browser printing needs the browser's Save as PDF option.

## Demo storage and privacy

`smartlibverse_demo_v1` stores nickname, avatar, location and game progress on the current origin. Use a nickname only. No school account/session is read. Demo rewards and certificates are not official NILAM evidence. Storage can be cleared or edited by the device owner; it is not authoritative. Moving from /smartlib/ to /smartlibverse/ on the same GitHub Pages origin preserves the storage key. Storage denial/corruption falls back to a playable fresh session and shows a warning.

## Rendering decision and limits

The approved reference uses illustrated 2.5D artwork. This release uses Canvas2D with independent background, interactive geometry, collision, depth-sorted avatar sprites, camera, minimap and DOM HUD. Babylon.js supports real 3D/WebGL/WebGPU, but no rigged GLB characters, 3D library model, PBR asset set or physical-device performance results were supplied. Retaining the illustrated renderer avoids claiming hyperrealistic 3D from raster artwork. A Babylon renderer is a separate future upgrade after those assets and performance requirements are validated. Reference: https://www.babylonjs.com/specifications/.

Sprites provide front, angled and back views for both characters, with walking bob. This is not a fully rigged skeletal animation system. Background artwork and avatar atlas are AI-derived from the user-supplied visual reference. Existing LIBRA artwork is preserved. Art is loaded only on the independent game page. Canvas2D does not require WebGL. If Canvas is unavailable, all learning activities remain accessible through DOM collection, map and assistance controls.

## Licensed BIM videos

No BIM video was supplied. The UI honestly displays “Video Bahasa Isyarat belum dimuat naik”. Add school-authorized MP4/WebM and WebVTT files to `videos/` and configure `data/videos.mjs` with `src`, `captions` and `transcript`. The real video player loads on request, not at startup. Do not publish pupil video without authorization. Do not label text-only comprehension quizzes as BIM-sign comprehension tests. Stories and quizzes work without video.

## Deployment

Create public repository SKPKT/smartlibverse, push main, then Settings → Pages → Source → GitHub Actions. `.github/workflows/pages.yml` runs unit/regression tests, creates an allowlisted static build, scans for common secret formats, uploads dist and deploys Pages. All game paths are relative to /smartlibverse/. No database migration is needed. Do not copy SMARTLIB Apps Script or private data here.

## Artwork prompts and sources

Built-in imagegen produced `assets/avatar-atlas.webp`: transparent 4×2 atlas, boy/girl front, angled walking and back, consistent scale; white school uniform/navy clothing/emerald backpacks matching supplied avatars; no scenery or text. `assets/library-room.webp`: warm 2.5D fantasy library, arched turquoise windows, emerald/gold banners, clear cream tiled floor, no characters/HUD/text. Originals remain outside this repository; optimized WebP derivatives are project-local. No hero or main SMARTLIB logo was regenerated.

© 2026 SMARTLIB |Syahida Suffian
