# HD-2D layered environment integration

Baseline: `2b43e2a7b09250dabbca433e33069b2a85efe1fd`. Scope is exclusively SKPKT/smartlibverse. This branch provides a reviewable, deployable static build; publishing is separate from preparing the build.

## Art and provenance

- `assets/hd2d/library/`: the four supplied WebP production assets and four exact PNG fallbacks. All ZIP manifest checksums were verified before copying. The blue/cyan/gold hall is scenery only; the preview composite and high-resolution source are not runtime assets.
- `assets/hd2d/zones/`: six optimized WebP backgrounds created with the built-in image_gen tool. Plaza is an edit of the existing approved foyer, preserving arch positions while removing the baked NPC, desk, map and active portal energy. Gallery, quiz, awards, garden and secret are distinct new static environments. Original generated PNGs remain outside this repository; the game consumes project-local WebPs.
- `docs/hd2d-image-prompts.json`: exact prompt set and tool provenance. `assets/hd2d/manifest.json`: runtime asset sizes, dimensions and SHA256 checksums. The build verifies every delivered asset.
- Existing approved walking sheets are unchanged, including the hijab, four direction rows, alpha and 405/420 foot anchor. Portrait sprites use proportional contain sizing.

## Rendering passes

The inner worlds use one existing requestAnimationFrame loop and one visible world canvas. Each background is copied to a bounded offscreen canvas only after its image loads, then reused; no player, interactive sprite, ring, particle or label is drawn into that cache.

1. Static environment image, proportionally fitted/cropped.
2. Static architecture contained in the scenery; independently rendered reception counter/map in the foyer.
3. Independent interactive sprites/props.
4. Ground shadows, proximity glow and energy rings.
5. Capped analytical particles, with no persistent particle allocation.
6. Independent four-phase player sprite.
7. Objects, avatar and portal foreground sorted by ground depth.
8. Separate interaction captions/highlights.
9. Separate Canvas minimap plus semantic DOM HUD/controls. The DOM provides accessible counters and buttons; it is not baked into the artwork. Mission/minimap cards sit outside the inner-world canvas to avoid obscuring content.

The foyer also uses clean static scenery, independent NPC/counter/map props, separate portal energy and sorted player overlap. Its existing collision geometry and recent above-head portal captions remain intact.

## Library and compatibility

Left `cerita` = Cerita Bergambar, (250,270), target (250,338). Center `alam` = Sains & Alam, (500,246), target (500,314). Right `umum` = Pengetahuan, (750,270), target (750,338). Center bounds are 210×208, side bounds 178×176; images retain their 480:620 aspect ratio.

Float periods/phases are independent. The storybook has edge glimmer/page motes, science has an eight-second ring/globe highlight and five motes, knowledge has a 2.6-second bulb pulse and glyph sparks. There are at most eleven library particles and nine foyer portal motes. Reduced motion freezes bob/orbits/pulse and removes moving particles. The whole sprite/background is never rotated to simulate an animated book or globe.

Collision remains based on the existing small ground rectangles, not hologram height. Existing saved positions are validated by the unchanged state engine against the new anchors. Invalid positions are relocated safely without losing readings, rewards, nickname or profile. Permanent IDs, original story/quiz content, thresholds, rewards, storage version/key, aliases and secret rules are unchanged. Extension fields continue to survive writeback. No database migration or reset is involved.

Images are cached by URL and loaded per active zone. WebP library failures try the provided PNG once; a code-drawn fallback preserves interaction if all art fails. All caches are bounded by the finite zone/asset set. No new runtime dependency or 3D engine is introduced.

## Validation and release

`npm test` covers actual renderer draw calls/cache separation, proportional fitting, independent/reduced animations, safe approach routes, identity-to-book mapping, fallback loading, asset integrity and all prior gameplay tests. `npm run build` checks module syntax, public secret patterns and the fourteen production asset hashes.

`npm run test:browser` exercises the real UI at 1366×768, 820×980 and 390×844, including all zones, assisted walking to each library station, Interaksi → correct book, reduced motion, run toggle, original stories, quizzes, repeated reward protection, certificate, Secret lock/unlock and progress retention. Consult the actual Actions result for the tested revision; screenshots and the deployable build are attached to the PR run.

Physical Android/iPad hardware, assistive hardware and real BIM videos are not part of automated viewport testing. No authorized BIM media was supplied; the explicit text fallback remains. Demo achievements are not official NILAM records. SMARTLIB login, dashboard, authentication, backend, Apps Script and Sheets were not modified.
