# Start Plaza v4 integration record

Baseline: 64a045094f095e21ef12ca696f69fdb279e2414d (main). Existing schema: version 1, smartlibverse_demo_v1. The separate foyer UI key is smartlibverse_foyer_playable_demo_v1. Unmerged location-art PR #2 is left intact; this integration follows the package's matched main baseline.

The ZIP was extracted outside this repository. All expected Git blob guards passed in a clean LF worktree. Windows' default cp1252 decoding caused an initial read-only failure; running the unchanged script with Python -X utf8 applied the integration without weakening guards. The original homepage remains in git history and the learning route is preserved at world/index.html with its project-relative base.

All six approved PNGs remain byte-identical to 01_INTEGRATION_READY; the package verifier passed and tests check the committed asset manifest. No ZIP, offline bundle, preview GIF or private school data is published.

Integration corrections: original reward/secret engine reused; raw v1 fields preserved during avatar/tutorial updates; corrupt/unsupported saves fail closed; world Home and Plaza URLs resolve against the current document URL (not the base tag); world sprite feet anchored at 405/420; asset versions refreshed. Added a touch joystick toggle within the existing movement slot, focus containment and accessible physical-hotspot path buttons. No scene/sprite art was substituted.

Validation completed locally:

- npm test: 16 passed, zero failures/skips. Includes original stories/quiz grading/rewards, storage preservation (including extension fields in reused worlds), blocked storage, all movement directions, normalized diagonals, stop, collision, safe paths, pointer cancellation/blur, four animation slots, reduced motion, exact PNG hashes and activation of LIBRA, all three arches and physical map through the actual simulation.
- npm run build: passed, including module syntax checks and public secret scan. Static allowlist includes world and the original modules/assets.
- Browser desktop 1366×768: no horizontal overflow/uncaught errors; female avatar persisted over reload; all five unlocked learning routes opened and returned to foyer. Locked Secret rejected; eligible Secret opened. Three stories required all four pages before completion. Quiz score 4/5 passed, repeat retained 120 XP, certificate preview showed demo-only status. Missing BIM video honestly reported.
- Browser click-to-walk activated a safe route. Subsequent physical-hotspot browser loop was interrupted by the browser-control service timing out; its outcome is not claimed. Automated simulation activation tests passed separately.

Automated Chromium acceptance passed at 1366×768, 820×980 and 390×844 in Actions run 44861368463. It exercised all physical-hotspot dialogs, keyboard and joystick release, six learning destinations, return routes, three stories, quiz reward idempotency, certificate and locked/unlocked Secret with zero uncaught errors, missing resources or horizontal overflow. Screenshots were inspected at all three sizes. An initial CI run caught extension-field loss on legacy saves; the writeback now preserves those fields and corrupt saves fail closed.

Release verification is recorded by the Pages workflow and PR #3. The workflow runs the same browser acceptance against the deployed public URL; consult its actual result before claiming production success. Physical Android/iPad, multi-touch hardware and physical printing have not been tested.

Limits: the six inner learning zones retain their previous artwork. No authorized BIM videos/captions were supplied. Demo data/rewards/certificates are not official NILAM records. SKPKT/smartlib login, backend, APIs, deployment/settings and all school/member databases are outside this change and were not modified.
