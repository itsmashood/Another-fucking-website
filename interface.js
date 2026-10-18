(() => {
  'use strict';
  // Lighting stays inside each panel; it never covers links or controls.
  document.querySelectorAll('[data-spotlight]').forEach(panel => {
    let frame = 0, x = 0, y = 0;
    panel.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const rect = panel.getBoundingClientRect(); x = event.clientX - rect.left; y = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(() => { panel.style.setProperty('--mx', `${x}px`); panel.style.setProperty('--my', `${y}px`); frame = 0; });
    }, {passive:true});
  });
  const links = Array.from(document.querySelectorAll('nav a'));
  if (!('IntersectionObserver' in window)) return;
  const positions = new Map();
  const update = () => {
    const visible = Array.from(positions).filter(([,state]) => state.visible).sort((a,b) => Math.abs(a[1].top - 120) - Math.abs(b[1].top - 120));
    if (!visible.length) return;
    links.forEach(link => {
      const active = link.hash === `#${visible[0][0]}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => positions.set(entry.target.id, {visible:entry.isIntersecting, top:entry.boundingClientRect.top})); update();
  }, {rootMargin:'-80px 0px -35% 0px', threshold:[0,.25,.5,.75,1]});
  links.forEach(link => { const target = document.querySelector(link.hash); if (target) observer.observe(target); });
})();
