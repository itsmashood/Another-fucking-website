(() => {
  'use strict';
  // After the third press on the Roblox Lua button Sans says his last line, the page burns,
  // everything on it disappears and the Sans fight (./game/) takes over the whole window.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const WAIT = 5000, FIRE_LEAD_IN = WAIT - 1200;
  let scheduled = false;

  window.addEventListener('sans:line-press', event => {
    const { count, total } = event.detail;
    if (count < total || scheduled) return;
    scheduled = true;
    // Exactly 5 seconds after the third press the site is gone: the fire builds for the last 1.2s.
    setTimeout(burn, FIRE_LEAD_IN);
  });

  let resumed = false;
  try { resumed = sessionStorage.getItem('radia-fate') === '1'; } catch (_) {}
  if (resumed) {
    // Hide the site straight away, then swap in the game once the page's own scripts have finished starting.
    window.__fateStarted = true; scheduled = true;
    document.documentElement.classList.add('fate', 'fate-resume');
    const go = () => takeOver(null);
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go, { once: true });
  }

  function burn() {
    window.__fateStarted = true;
    const overlay = document.createElement('div');
    overlay.id = 'fate-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    let html = '<div class="fire"></div>';
    for (let i = 0; i < 38; i++) {
      const r = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
      html += `<i class="ember" style="--x:${r(0, 100)}%;--s:${r(3, 7)}px;--d:${r(1.4, 3)}s;--dl:${r(-3, 0)}s;--dx:${r(-60, 60)}px"></i>`;
    }
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    void overlay.offsetWidth;
    overlay.classList.add('in');
    setTimeout(takeOver, WAIT - FIRE_LEAD_IN, overlay);
  }

  function takeOver(overlay) {
    try { sessionStorage.setItem('radia-fate', '1'); } catch (_) {}
    window.dispatchEvent(new Event('fate:start'));
    document.querySelectorAll('audio').forEach(a => { try { a.pause(); } catch (_) {} });
    [...document.body.children].forEach(node => { if (node !== overlay) node.remove(); });
    document.documentElement.classList.add('fate');
    window.scrollTo(0, 0);

    const stage = document.createElement('div');
    stage.id = 'fate-stage';
    if (location.protocol === 'file:') {
      // Browsers block this kind of game when a page is opened straight from disk.
      stage.innerHTML = '<p>* the game needs to run from a web server.<br>upload the site, or run <b>python -m http.server</b> in this folder and open localhost.</p>';
    } else {
      const frame = document.createElement('iframe');
      frame.title = 'Sans fight';
      frame.allow = 'autoplay; fullscreen; gamepad';
      frame.src = 'game/index.html';
      frame.addEventListener('load', () => { try { frame.contentWindow.focus(); } catch (_) {} frame.focus(); });
      stage.appendChild(frame);
      stage.addEventListener('pointerdown', () => { try { frame.contentWindow.focus(); } catch (_) {} });
    }
    document.body.insertBefore(stage, overlay || null);
    if (!overlay) return;
    setTimeout(() => { overlay.classList.add('out'); setTimeout(() => overlay.remove(), 1300); }, reduced.matches ? 0 : 400);
  }
})();
