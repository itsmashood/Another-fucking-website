(() => {
  'use strict';
  // The button does nothing on purpose: each press just cracks it a little more.
  const button = document.querySelector('.crack-button');
  if (!button) return;
  const layer = button.querySelector('.crack-layer'), NS = 'http://www.w3.org/2000/svg', MAX_CRACKS = 14;
  const rand = (a, b) => a + Math.random() * (b - a);
  function branch(x, y, angle, length, depth, width, height, out) {
    const steps = Math.max(3, Math.round(length / 8));
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`, cx = x, cy = y, a = angle;
    for (let i = 0; i < steps; i++) {
      a += rand(-.55, .55);
      const step = length / steps * rand(.7, 1.3);
      cx += Math.cos(a) * step; cy += Math.sin(a) * step;
      d += `L${cx.toFixed(1)} ${cy.toFixed(1)}`;
      if (depth < 2 && Math.random() < .3) branch(cx, cy, a + rand(-1.2, 1.2), length * .45, depth + 1, width, height, out);
      if (cx < -6 || cx > width + 6 || cy < -6 || cy > height + 6) break;
    }
    out.push({ d, depth });
  }
  function addCrack(x, y) {
    const box = button.getBoundingClientRect(), group = document.createElementNS(NS, 'g'), paths = [];
    layer.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const count = Math.round(rand(6, 9)), spin = rand(0, Math.PI * 2);
    for (let i = 0; i < count; i++) branch(x, y, spin + i / count * Math.PI * 2 + rand(-.3, .3), rand(28, 85), 0, box.width, box.height, paths);
    paths.forEach(({ d, depth }) => {
      [['crack-light', .9], ['crack-dark', 0]].forEach(([cls, offset]) => {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d); p.setAttribute('pathLength', '1'); p.setAttribute('class', cls + (depth ? ' thin' : ''));
        if (offset) p.setAttribute('transform', `translate(${offset} ${offset})`);
        group.appendChild(p);
      });
    });
    layer.appendChild(group);
    while (layer.childNodes.length > MAX_CRACKS) layer.removeChild(layer.firstChild);
  }
  button.addEventListener('click', event => {
    const box = button.getBoundingClientRect(), fromKeyboard = !event.clientX && !event.clientY;
    const x = fromKeyboard ? box.width * rand(.3, .7) : event.clientX - box.left;
    const y = fromKeyboard ? box.height * rand(.3, .7) : event.clientY - box.top;
    addCrack(x, y);
    button.classList.remove('hit'); void button.offsetWidth; button.classList.add('hit');
  });
})();
