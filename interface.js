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
  const sections = links.map(link => ({link, section:document.querySelector(link.hash)})).filter(item => item.section);
  let preferred = window.location.hash, frame = 0;
  const header = document.querySelector('.header');
  const update = () => {
    frame = 0;
    if (!sections.length) return;
    const marker = header.getBoundingClientRect().bottom + 36;
    const positions = sections.map(item => ({...item, top:item.section.getBoundingClientRect().top}));
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    const passed = positions.filter(item => item.top <= marker || atBottom);
    const latestTop = passed.length ? Math.max(...passed.map(item => item.top)) : positions[0].top;
    const row = positions.filter(item => Math.abs(item.top - latestTop) < 2);
    const selected = row.find(item => item.link.hash === preferred) || row[0];
    links.forEach(link => {
      const active = link === selected.link;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  links.forEach(link => link.addEventListener('click', () => { preferred = link.hash; schedule(); }));
  window.addEventListener('hashchange', () => { preferred = window.location.hash; schedule(); });
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('pageshow', schedule);
  schedule();
})();
