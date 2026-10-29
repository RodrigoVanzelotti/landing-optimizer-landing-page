'use strict';

// The form and all product controls work independently of the optional motion libraries.
function loadMotionLibrary(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error('Motion library unavailable')); }, 4500);
    script.src = src;
    script.async = true;
    script.onload = () => { window.clearTimeout(timeout); resolve(); };
    script.onerror = () => { window.clearTimeout(timeout); script.remove(); reject(new Error('Motion library unavailable')); };
    document.head.append(script);
  });
}

async function setupMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) { document.documentElement.dataset.motion = 'reduced'; return; }
  try {
    await loadMotionLibrary('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js');
    await loadMotionLibrary('https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js');
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      document.documentElement.dataset.motion = 'gsap';
      // Scale/fade belongs to the image plane; the headline and CTA remain stable.
      gsap.fromTo('.hero-photo', { scale: .8, opacity: .36 }, { scale: 1, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.story-hero', start: 'top top', end: 'bottom top', scrub: .8 } });
      gsap.to('.hero-orbit', { y: -32, ease: 'none', scrollTrigger: { trigger: '.story-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to('.hero-approval-plane', { y: 20, rotation: 1, ease: 'none', scrollTrigger: { trigger: '.story-hero', start: 'top top', end: 'bottom top', scrub: .7 } });
      return () => { document.documentElement.dataset.motion = 'reduced'; };
    });
    if (window.ScrollCraft) window.ScrollCraft.mount(document.querySelector('.story-hero'));
  } catch {
    document.documentElement.dataset.motion = 'fallback';
    // Local ScrollCraft keeps depth responsive when the optional CDN is unavailable.
    if (window.ScrollCraft) {
      document.querySelector('.hero-orbit').setAttribute('data-sc-parallax', '-0.045');
      document.querySelector('.word-learn').setAttribute('data-sc-parallax', '0.035');
      window.ScrollCraft.mount(document.body);
    }
  }
}
setupMotion();
