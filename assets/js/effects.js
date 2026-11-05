(() => {
  'use strict';

  // Products have been rendered by main.js before this script runs.
  const cards = [...document.querySelectorAll('.product-card, .category-card')];
  const buttons = [...document.querySelectorAll('.button[href^="tel:"], .products__view-all')];
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const proximity = 20;
  const maxOffset = 20;
  let enabled = false;
  let pointerFrame = 0;
  let preferenceFrame = 0;
  let pointer;

  const resetButtons = () => {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    pointer = null;
    buttons.forEach(button => {
      button.style.removeProperty('--magnetic-x');
      button.style.removeProperty('--magnetic-y');
    });
  };

  const updateButtons = () => {
    pointerFrame = 0;
    if (!enabled || !pointer) return;
    const modal = document.querySelector('dialog[open], .swal2-container');
    // Read geometry before writing styles; subtract the current translation so
    // a moving button never chases its own transformed bounding box.
    const offsets = buttons.map(button => {
      if (!button.getClientRects().length || button.closest('[inert]') ||
          button.matches(':focus-visible') || (modal && !modal.contains(button))) return [0, 0];
      const rect = button.getBoundingClientRect();
      const translation = getComputedStyle(button).translate.split(' ').map(parseFloat);
      const left = rect.left - (translation[0] || 0);
      const top = rect.top - (translation[1] || 0);
      const outsideX = Math.max(left - pointer.x, 0, pointer.x - left - rect.width);
      const outsideY = Math.max(top - pointer.y, 0, pointer.y - top - rect.height);
      if (Math.hypot(outsideX, outsideY) > proximity) return [0, 0];
      const x = (pointer.x - left - rect.width / 2) * 0.18;
      const y = (pointer.y - top - rect.height / 2) * 0.18;
      const scale = Math.min(1, maxOffset / (Math.hypot(x, y) || 1));
      return [x * scale, y * scale];
    });
    buttons.forEach((button, index) => {
      const [x, y] = offsets[index];
      button.style.setProperty('--magnetic-x', `${x.toFixed(2)}px`);
      button.style.setProperty('--magnetic-y', `${y.toFixed(2)}px`);
    });
  };

  const onPointerMove = event => {
    if (event.pointerType !== 'mouse') {
      resetButtons();
      return;
    }
    pointer = { x: event.clientX, y: event.clientY };
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updateButtons);
  };

  const updateEffects = () => {
    preferenceFrame = 0;
    const nextEnabled = finePointer.matches && !reducedMotion.matches;
    if (enabled === nextEnabled) return;
    enabled = nextEnabled;
    resetButtons();

    if (enabled) {
      // A failed optional CDN must not affect shopping, search or navigation.
      if (typeof window.VanillaTilt?.init === 'function') {
        window.VanillaTilt.init(cards, {
          max: 12,
          speed: 400,
          perspective: 1000,
          glare: true,
          'max-glare': 0.25,
          gyroscope: false,
        });
      }
      buttons.forEach(button => button.classList.add('button--magnetic'));
      document.addEventListener('pointermove', onPointerMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', resetButtons);
      document.addEventListener('keydown', resetButtons);
      window.addEventListener('scroll', resetButtons, { passive: true, capture: true });
      window.addEventListener('resize', resetButtons, { passive: true });
      window.addEventListener('blur', resetButtons);
    } else {
      document.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', resetButtons);
      document.removeEventListener('keydown', resetButtons);
      window.removeEventListener('scroll', resetButtons, true);
      window.removeEventListener('resize', resetButtons);
      window.removeEventListener('blur', resetButtons);
      buttons.forEach(button => button.classList.remove('button--magnetic'));
      cards.forEach(card => {
        if (!card.vanillaTilt) return;
        card.vanillaTilt.destroy();
        // VanillaTilt 1.8.1 leaves its generated glare DOM behind on destroy.
        card.querySelectorAll(':scope > .js-tilt-glare').forEach(glare => glare.remove());
      });
    }
  };

  const scheduleEffects = () => {
    cancelAnimationFrame(preferenceFrame);
    // Let a queued VanillaTilt mouseleave reset finish before destroying it.
    preferenceFrame = requestAnimationFrame(updateEffects);
  };
  finePointer.addEventListener('change', scheduleEffects);
  reducedMotion.addEventListener('change', scheduleEffects);
  updateEffects();
})();
