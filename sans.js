(() => {
  'use strict';
  const root = document.getElementById('sans-companion');
  if (!root) return;
  const lines = window.SANS_LINES || {};
  const bubble = document.getElementById('sans-bubble');
  const visual = document.getElementById('sans-text');
  const spoken = document.getElementById('sans-spoken');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = 0, closeTimer = 0, lockUntil = 0, lastScroll = window.scrollY;
  let lastReaction = -Infinity;
  const indexes = {};
  function say(text, manual = false) {
    if (!text) return;
    clearTimeout(timer); clearTimeout(closeTimer);
    bubble.hidden = false;
    spoken.textContent = text;
    visual.textContent = '';
    root.classList.add('speaking');
    if (manual) lockUntil = Date.now() + 10000;
    let i = 0;
    function type() {
      visual.textContent = text.slice(0, ++i);
      if (i < text.length) timer = setTimeout(type, 26);
      else root.classList.remove('speaking');
    }
    if (reduced.matches) { visual.textContent = text; root.classList.remove('speaking'); }
    else type();
    closeTimer = setTimeout(close, 12000);
  }
  function close() {
    clearTimeout(timer); clearTimeout(closeTimer);
    bubble.hidden = true;
    root.classList.remove('speaking');
  }
  function choose(kind) {
    const options = lines[kind];
    if (!Array.isArray(options) || !options.length) return;
    const index = indexes[kind] || 0;
    indexes[kind] = (index + 1) % options.length;
    root.classList.toggle('napping', kind === 'nap');
    say(options[index], true);
  }
  root.querySelectorAll('[data-sans]').forEach(button => {
    button.addEventListener('click', () => choose(button.dataset.sans));
  });
  document.getElementById('sans-character').addEventListener('click', () => choose('talk'));
  document.getElementById('sans-close').addEventListener('click', () => { close(); lockUntil = Date.now() + 10000; });
  root.addEventListener('keydown', event => { if (event.key === 'Escape') { close(); document.getElementById('sans-character').focus(); } });
  window.addEventListener('scroll', () => {
    const y = window.scrollY, down = y > lastScroll + 2;
    lastScroll = y;
    const now = Date.now();
    if (!down || y < 60 || now < lockUntil || now - lastReaction < 20000) return;
    lastReaction = now;
    root.classList.remove('napping');
    say(lines.scroll);
  }, {passive:true});
  say(lines.hello);
})();
