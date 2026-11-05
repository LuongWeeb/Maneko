(() => {
  'use strict';

  const scenes = [...document.querySelectorAll('[data-parallax-scene]')].map(element => ({
    element,
    layers: [...element.querySelectorAll('[data-parallax-speed]')].map(layer => ({
      element: layer,
      speed: Number(layer.dataset.parallaxSpeed) || 0,
    })),
    top: 0,
    height: 0,
    visible: false,
  }));
  if (!scenes.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = false;
  let frame = 0;
  let needsMeasure = true;

  const update = () => {
    frame = 0;
    if (!enabled) return;
    const scroll = window.scrollY;
    const viewport = window.innerHeight;
    if (needsMeasure) {
      // Read layout only after a size/content change, never on every scroll.
      scenes.forEach(scene => {
        const bounds = scene.element.getBoundingClientRect();
        scene.top = scene.element.id === 'hero' ? 0 : bounds.top + scroll;
        scene.height = bounds.height;
      });
      needsMeasure = false;
    }
    scenes.forEach(scene => {
      if (!scene.visible) return;
      // Use a section-relative origin so lower sections never drift away just
      // because the user scrolled through all the content above them.
      const distance = Math.max(-viewport, Math.min(scene.height, scroll - scene.top));
      scene.layers.forEach(layer => {
        layer.element.style.setProperty('--parallax-y', `${(distance * layer.speed).toFixed(2)}px`);
      });
    });
  };

  const schedule = () => {
    if (enabled && !frame) frame = requestAnimationFrame(update);
  };
  const refresh = () => {
    needsMeasure = true;
    schedule();
  };
  const syncPlayback = () => scenes.forEach(scene => {
    scene.element.classList.toggle('is-parallax-active', enabled && scene.visible);
  });

  const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      scenes.find(scene => scene.element === entry.target).visible = entry.isIntersecting;
    });
    syncPlayback();
    schedule();
  }, { rootMargin: '100px 0px' }) : null;
  scenes.forEach(scene => {
    if (observer) observer.observe(scene.element);
    else scene.visible = true;
  });

  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(refresh) : null;
  const syncMotion = () => {
    const nextEnabled = !reducedMotion.matches && !document.hidden;
    if (enabled === nextEnabled) return;
    enabled = nextEnabled;
    syncPlayback();
    if (enabled) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', refresh, { passive: true });
      scenes.forEach(scene => resizeObserver?.observe(scene.element));
      resizeObserver?.observe(document.body);
      refresh();
    } else {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', refresh);
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
      if (reducedMotion.matches) {
        scenes.forEach(scene => scene.layers.forEach(layer => layer.element.style.removeProperty('--parallax-y')));
      }
    }
  };

  reducedMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  window.addEventListener('pageshow', refresh);
  window.addEventListener('load', refresh, { once: true });
  document.fonts?.ready.then(refresh);
  syncMotion();
})();
