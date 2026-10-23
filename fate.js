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

  // The game opens on a mode menu. Wait until it has finished loading, then press its confirm key
  // (Z) once so it starts straight on "Normal", the menu's default.
  function skipMenu(frame) {
    let tries = 0;
    const timer = setInterval(() => {
      if (++tries > 400) { clearInterval(timer); return reveal(frame); }   // give up after ~60s: show whatever the game shows
      try {
        const win = frame.contentWindow, rt = win.cr_getC2Runtime && win.cr_getC2Runtime();
        if (!rt || !rt.running_layout) return;
        if (rt.running_layout.name !== 'MainMenu') return clearInterval(timer);   // already past it
        let ready = false, loading = false;
        rt.types_by_index.forEach(type => (type.instances || []).forEach(inst => {
          if (typeof inst.text !== 'string') return;
          if (inst.text === 'Normal') ready = true;
          if (/^loading/i.test(inst.text)) loading = true;
        }));
        if (!ready || loading) return;
        clearInterval(timer);
        setTimeout(() => press(win, 'z', 'KeyZ', 90), 250);
      } catch (_) { clearInterval(timer); reveal(frame); }
    }, 150);
  }

  // Sans's intro dialogue gets a voice recording. It starts with every new fight (the first one and
  // each retry); the game's own music then begins right after the dialogue, as it always did.
  function watchBattle(frame) {
    let fight = null, voice = null;
    setInterval(() => {
      try {
        const rt = frame.contentWindow.cr_getC2Runtime();
        if (!rt || !rt.running_layout || rt.running_layout.name !== 'BattleScreen') return;
        let hud = null;
        rt.types_by_index.forEach(type => (type.instances || []).forEach(inst => {
          if (hud === null && typeof inst.text === 'string' && /^CHARA/.test(inst.text)) hud = inst.uid;
        }));
        if (hud === null || hud === fight) return;   // not started yet, or the same fight
        fight = hud;
        reveal(frame);
        if (voice) voice.pause();
        voice = new Audio('game/media/intro_recording.ogg');
        voice.play().catch(() => {});
      } catch (_) {}
    }, 200);
  }

  // The game's loading screen and mode menu stay hidden; the iframe is shown once the fight has started.
  function reveal(frame) { frame.classList.add('ready'); }

  async function clearGameCache() {
    try { if (navigator.serviceWorker) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); } } catch (_) {}
    try { if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.filter(k => /^c2offline/.test(k)).map(k => caches.delete(k))); } } catch (_) {}
  }

  function press(win, key, code, keyCode) {
    const send = type => {
      const e = new win.KeyboardEvent(type, { key, code, bubbles: true, cancelable: true });
      Object.defineProperty(e, 'keyCode', { get: () => keyCode });
      Object.defineProperty(e, 'which', { get: () => keyCode });
      win.document.dispatchEvent(e);
    };
    send('keydown');
    setTimeout(() => send('keyup'), 120);
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
      // Older visits left a service worker + cache that keep serving the game's old files (old music).
      // Clear them before the game loads.
      clearGameCache().finally(() => {
      const frame = document.createElement('iframe');
      frame.title = 'Sans fight';
      frame.allow = 'autoplay; fullscreen; gamepad';
      frame.src = 'game/index.html';
      frame.addEventListener('load', () => { try { frame.contentWindow.focus(); } catch (_) {} frame.focus(); skipMenu(frame); watchBattle(frame); setTimeout(() => reveal(frame), 25000); });
      stage.appendChild(frame);
      stage.addEventListener('pointerdown', () => { try { frame.contentWindow.focus(); } catch (_) {} });
      });
    }
    document.body.insertBefore(stage, overlay || null);
    if (!overlay) return;
    setTimeout(() => { overlay.classList.add('out'); setTimeout(() => overlay.remove(), 1300); }, reduced.matches ? 0 : 400);
  }
})();
