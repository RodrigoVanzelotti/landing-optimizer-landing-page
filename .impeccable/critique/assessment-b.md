# Assessment B — independent detector and browser evidence

Target: `index.html`, landing-optimizer-landing-page. Assessment B was performed independently; no Assessment A findings were read. No app source or CSP was changed.

## Deterministic scan

Raw artifact: `baseline-b/detector.json`. Condensed artifact: `baseline-b/detector-condensed.json`.

30 results: 21 warnings and 9 advisories. Rules: low-contrast 13; cramped-padding 6; extreme-negative-tracking 1; undersized-ui-text 5; nested-cards 2; marquee 1; radial-halo 1; codex-grid-background 1. All results point to the absolute target `index.html`, line 0; this detector does not provide useful source line numbers in this run. CLI produced usable JSON despite the shell pipeline reporting exit 1; documented detector finding exit is 2.

Contrast candidates include #577d41 on #e5eedb (4.0:1), #7b7567 on #e9e4da (3.6:1), #738268 on #fbfcf8 (4.0:1), #6c7a60 on #eef5e4 (4.1:1), and #697b5c on #edf1e6 (4.0:1). Treat these as candidates, not a confirmed page-wide accessibility failure: the static result does not show the rendered selector, actual text size, or full final cascade.

Confirmed false positives / unconfirmed candidates:

- Hero tracking is reported as -0.13em at 16px, but Chrome measures 89.28px/-3.8px at desktop, 42.12px/-2px at 390px, and 40px/-2px at 320px. The static size attribution is false.
- The five 10px functional labels are not reproduced in the final rendered visible DOM: leaf text scan found no visible content below 14px at sampled widths. Mobile hero-cycle labels are hidden. Do not describe these labels as currently visibly tiny without checking the final cascade.
- Five section-wrapper padding warnings flag full-bleed sections whose actual text is inset by inner `.wrap` containers. Screenshots show usable text gutters. These are wrapper-level false positives. The hypothesis border/padding result needs separate selector-level validation.
- `.method-track` marquee is a stylesheet match; no `.method-track` exists in target markup. Do not describe an actual visible auto-scrolling marquee.
- Nested-card, halo and grid detections describe existing technical structure; whether to change them is Assessment A's judgment, not a browser defect.

## Browser observations

Own headless Chrome profile, fresh CDP tab and local test server using `createApp(async () => {})`; leads were accepted only by no-op test storage, with no cloud writes. Tested 1440x1000, 390x844 and 320x700. Browser JSON: `baseline-b/browser.json`; PNG captures in the same directory. Script retained for reproduction: `.preview/assessment-b.mjs`.

**P2 confirmed: narrow mobile header CTA overflows its available space.** At requested 320px, header is x=18, width=284, right=302; CTA is x=182.30, width=164.92, right=347.22. Chrome expands the layout viewport to 347px and the screenshot clips the CTA at the right edge. Checking only `scrollWidth <= innerWidth` produces a misleading pass. At 390px and 1440px there was no document overflow in sampled sections. Evidence: `narrow-hero.png`. Fix narrow header fit with wrapping, responsive spacing, or hiding the redundant header CTA at this breakpoint; retain main hero CTA.

Keyboard/a11y evidence:

- First Tab reaches Portuguese skip link, visible at x15/y12 with a 3px green outline.
- Form Tab sequence is email -> website -> submit; website and submit both have visible 3px outlines.
- Email/site and calculator input labels exist; form fields use suitable autocomplete and input modes.
- No visible, tab-focusable element inside `aria-hidden=true` without an inert ancestor was found across sampled section states.
- These are DOM/keyboard checks, not an NVDA or VoiceOver audit.

Form feedback:

- Invalid website `bad` produces “Informe um site válido, como suaempresa.com.br.” and focuses website at all widths.
- Valid email/site submission produces polite `role=status` confirmation; it explicitly explains the conversation is not yet scheduled. Busy state clears and submit re-enables.
- Network-error copy and preservation exist in source; error path was not simulated in this browser run.

Demo:

- Desktop approval and mobile next -> next -> approval complete; result becomes visible at all three widths. Current browser result is +30% vs reference, from 2.0% to 2.6%, with +R$150,000/month in illustrative R$500,000 scenario. Evidence: `phone-demo-result.png` and corresponding desktop/narrow images. No frozen hidden result observed.

Dependencies / console:

- No Runtime exceptions captured.
- Restricted environment denied Picsum hero image, Fontshare stylesheet and optional GSAP CDN with ERR_NETWORK_ACCESS_DENIED. Screenshots show fallback typography and hero gradient without remote photo. This is an environment limitation, not proof production requests fail. Forms and demo remained functional.
- Pixel contrast was not measured across final gradients/photo backgrounds; static contrast candidates remain unconfirmed. No screen-reader, slow network, 200% zoom or real-device testing.

## Overlay and cleanup

Mutable preflight succeeded: title changed to `[Human] Assessment B` and empty script element appended. Live-server started on port 8400. Injecting `http://localhost:8400/detect.js` was blocked by existing `script-src 'self' https://cdn.jsdelivr.net` CSP. No live detector ran in page; no reliable user-visible overlay exists. Headless visibility unavailable. Console contains exact CSP rejection; fallback is CLI JSON plus CDP screenshots/DOM evidence. CSP preserved.

`impeccable live-server stop --keep-inject` successfully stopped overlay helper. Chrome and local server stopped in script finally blocks. Attempted removal of temporary `impeccable-b-*` browser profiles was rejected by automatic approval policy (sandbox approval disabled); profiles may remain under system temp. Reports, screenshots and reproduction script retained intentionally. No `ignore.md` existed at target critique path.
