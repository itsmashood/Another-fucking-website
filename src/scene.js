import * as THREE from 'three';

/*
  Siri-style orb.
  A single full-detail fragment shader draws a glass sphere containing:
   - a dark, angular-gradient sphere body (teal / navy / indigo / crimson)
   - 9 translucent morphing "petals" with soft fills, glowing edges and fine
     topographic contour lines inside
   - 4 thin crescent "fins" with bright filament edges
   - a white-hot core with chromatic bloom, halo rings and needle streaks
   - drifting cloud texture, glass fresnel rim, specular sheen, film grain
*/

const PAD = 1.35; // plane is PAD x the orb radius so the outer glow has room

const vertexShader = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const fragmentShader = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uActive;
uniform float uPx;      // size of one screen pixel in orb units

#define PI 3.14159265359

float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1,0)), f.x),
             mix(hash21(i+vec2(0,1)), hash21(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for(int i=0;i<5;i++){ s += a*vnoise(p); p = m*p; a *= 0.5; }
  return s;
}

// Morphing closed blob. Returns normalised signed distance (negative inside).
float shape(vec2 p, vec2 c0, vec2 orbit, float R, float seed, float spd, float t, float act, out vec2 q){
  vec2 c = c0 + orbit*vec2(sin(t*spd*0.7 + seed*5.0), cos(t*spd*0.9 + seed*3.0));
  q = p - c;
  float r = length(q);
  float th = atan(q.y, q.x);
  float w = 0.30*sin(2.0*th + t*spd*1.1 + seed*6.1)
          + 0.19*sin(3.0*th - t*spd*1.5 + seed*3.7)
          + 0.06*sin(4.0*th + t*spd*0.8 + seed*8.3)
          + 0.025*sin(6.0*th - t*spd*2.1 + seed*1.9);
  w *= 1.0 + act*0.55;
  float Rr = R*(1.0 + w)*(1.0 + act*0.07*sin(t*2.6 + seed*7.0));
  return (r - Rr)/R;
}

// A translucent petal: soft fill, glowing edge, inner contour lines.
vec3 petal(vec2 p, vec2 c0, vec2 orbit, float R, float seed, float spd,
           vec3 col, float t, float act, vec2 core, float cloud){
  vec2 q;
  float d = shape(p, c0, orbit, R, seed, spd, t, act, q);
  float aa = uPx/R*1.5;
  float body  = 1.0 - smoothstep(-aa, aa, d);
  float depth = clamp(-d, 0.0, 1.0);

  // brightness rises toward the shared core
  float toCore = exp(-dot(p-core, p-core)*3.2);

  vec3 e = vec3(0.0);
  e += col*body*(0.14 + 0.40*pow(depth, 0.7))*(0.55 + 0.9*cloud);
  e += col*body*toCore*0.34;
  // luminous edge: tight bright line + wider soft glow, both sides
  e += col*exp(-abs(d)*44.0)*0.62;
  e += col*exp(-max( d,0.0)*9.0)*0.10;
  e += col*exp(-max(-d,0.0)*8.0)*0.17*body;
  // fine topographic contours inside the petal
  float rings = pow(0.5 + 0.5*sin(d*62.0 - t*0.9 + seed*10.0), 7.0);
  e += col*body*rings*0.15*smoothstep(0.0, 0.25, depth);
  float rings2 = pow(0.5 + 0.5*sin(d*23.0 + t*0.5 + seed*4.0), 10.0);
  e += mix(col, vec3(1.0), 0.5)*body*rings2*0.10*smoothstep(0.1, 0.5, depth);
  return e;
}

// Thin translucent crescent (inside A, outside shifted B) with filament edges.
vec3 fin(vec2 p, vec2 c0, vec2 orbit, float R, float seed, float spd,
         vec2 shift, float shrink, vec3 col, float t, float act){
  vec2 qa, qb;
  float da = shape(p, c0, orbit, R, seed, spd, t, act, qa);
  float db = shape(p, c0 + shift, orbit, R*shrink, seed + 0.17, spd, t, act, qb);
  float aa = uPx/R*1.5;
  float inA  = 1.0 - smoothstep(-aa, aa, da);
  float outB = smoothstep(-aa, aa, db);
  float cres = inA*outB;
  vec3 e = col*cres*0.55;
  e += col*exp(-abs(da)*70.0)*0.45*outB;
  e += mix(col, vec3(1.0), 0.45)*exp(-abs(db)*80.0)*0.40*inA;
  e += col*exp(-abs(da)*10.0)*0.06;
  return e;
}

vec3 sphereBase(vec2 p, float r, float t){
  float th = atan(p.y, p.x);
  float a0 = t*0.035;
  vec3 teal   = vec3(0.00, 0.52, 0.55);
  vec3 navy   = vec3(0.012, 0.016, 0.075);
  vec3 violet = vec3(0.20, 0.07, 0.40);
  vec3 indigo = vec3(0.14, 0.17, 0.52);
  vec3 crim   = vec3(0.70, 0.02, 0.20);
  vec3 plum   = vec3(0.36, 0.03, 0.30);
  float wTeal = pow(0.5+0.5*cos(th-(2.55+a0)), 3.0);
  float wNavy = pow(0.5+0.5*cos(th-(1.45+a0)), 3.0);
  float wVio  = pow(0.5+0.5*cos(th-(0.70+a0)), 3.0);
  float wInd  = pow(0.5+0.5*cos(th-(-0.15+a0)), 3.0);
  float wCrim = pow(0.5+0.5*cos(th-(-1.55+a0)), 3.0);
  float wPlum = pow(0.5+0.5*cos(th-(-2.55+a0)), 3.0);
  float ws = wTeal+wNavy+wVio+wInd+wCrim+wPlum+1e-3;
  vec3 c = (teal*wTeal + navy*wNavy + violet*wVio + indigo*wInd + crim*wCrim + plum*wPlum)/ws;
  float lum = 0.12 + 0.85*pow(r, 2.0);
  return c*lum;
}

void main(){
  vec2 p = (vUv - 0.5)*2.0*${PAD.toFixed(3)};
  float r = length(p);
  float t = uTime;
  float act = uActive;

  // gentle organic domain warp (keeps silhouettes alive, not wobbly)
  vec2 wp = p + 0.022*vec2(fbm(p*2.6 + t*0.10) - 0.5, fbm(p*2.6 + 7.3 - t*0.09) - 0.5);
  float cloud = fbm(wp*2.4 + vec2(t*0.06, -t*0.045));

  vec2 core = vec2(0.015*sin(t*0.55), -0.02 + 0.03*cos(t*0.43));
  core *= 1.0 + act*2.0;

  vec3 em = vec3(0.0);

  // --- petals: colour, position, size, seed, speed -------------------------
  vec3 cyan   = vec3(0.00, 0.95, 1.00);
  vec3 mint   = vec3(0.10, 0.88, 0.62);
  vec3 azure  = vec3(0.10, 0.52, 1.00);
  vec3 sky    = vec3(0.35, 0.78, 1.00);
  vec3 violet = vec3(0.64, 0.38, 1.00);
  vec3 purple = vec3(0.48, 0.18, 0.95);
  vec3 pink   = vec3(1.00, 0.22, 0.60);
  vec3 rose   = vec3(1.00, 0.36, 0.52);
  vec3 red    = vec3(0.95, 0.08, 0.30);

  em += petal(wp, vec2(-0.22, 0.20), vec2(0.07, 0.06), 0.30, 0.11, 0.42, cyan,   t, act, core, cloud);
  em += petal(wp, vec2( 0.22, 0.22), vec2(0.06, 0.07), 0.31, 0.37, 0.36, violet, t, act, core, cloud);
  em += petal(wp, vec2( 0.34, 0.00), vec2(0.06, 0.08), 0.25, 0.53, 0.48, azure,  t, act, core, cloud);
  em += petal(wp, vec2(-0.14,-0.24), vec2(0.08, 0.06), 0.32, 0.71, 0.33, pink,   t, act, core, cloud);
  em += petal(wp, vec2( 0.10,-0.34), vec2(0.07, 0.05), 0.25, 0.89, 0.45, red,    t, act, core, cloud);
  em += petal(wp, vec2(-0.36,-0.02), vec2(0.06, 0.07), 0.21, 0.23, 0.52, mint,   t, act, core, cloud);
  em += petal(wp, vec2( 0.02, 0.36), vec2(0.07, 0.04), 0.20, 0.63, 0.40, purple, t, act, core, cloud);
  em += petal(wp, vec2( 0.26,-0.20), vec2(0.06, 0.06), 0.21, 0.47, 0.38, sky,    t, act, core, cloud);
  em += petal(wp, vec2(-0.04, 0.00), vec2(0.09, 0.09), 0.26, 0.97, 0.30, rose,   t, act, core, cloud)*0.40;

  // --- thin crescent fins -----------------------------------------------------
  em += fin(wp, vec2(-0.30,-0.06), vec2(0.07, 0.05), 0.46, 0.19, 0.30, vec2( 0.09,-0.07), 0.82, mint,   t, act);
  em += fin(wp, vec2( 0.10, 0.26), vec2(0.06, 0.06), 0.48, 0.43, 0.27, vec2(-0.08,-0.08), 0.82, cyan,   t, act);
  em += fin(wp, vec2( 0.22,-0.10), vec2(0.05, 0.07), 0.44, 0.67, 0.33, vec2(-0.09, 0.07), 0.83, azure,  t, act);

  // keep emission inside the sphere body and fade it toward the rim
  em *= smoothstep(0.98, 0.70, r);

  // --- white-hot core ---------------------------------------------------------
  vec2 cp = p - core;
  float cr = length(cp);
  float ang = atan(cp.y, cp.x);
  float coreI = exp(-cr*cr*12.0)*1.15 + exp(-cr*cr*60.0)*1.5 + exp(-cr*2.8)*0.12;
  coreI *= 1.0 + act*0.5*(0.5 + 0.5*sin(t*3.1));
  vec3 coreCol = vec3(1.0, 0.97, 1.0)*coreI;
  // chromatic bloom: cool outer, warm outer-outer
  coreCol += vec3(0.25, 0.75, 1.0)*exp(-pow(cr-0.20, 2.0)*55.0)*0.22;
  coreCol += vec3(1.00, 0.30, 0.75)*exp(-pow(cr-0.34, 2.0)*45.0)*0.14;
  coreCol += vec3(0.55, 0.30, 1.00)*exp(-pow(cr-0.50, 2.0)*40.0)*0.08;
  // soft star streaks
  float st = pow(abs(sin(ang*3.0 + t*0.22)), 30.0)*exp(-cr*3.6)*0.30
           + pow(abs(sin(ang*5.0 - t*0.17 + 1.3)), 40.0)*exp(-cr*4.6)*0.20;
  coreCol += vec3(0.85, 0.9, 1.0)*st;
  // two thin needle filaments
  float n1 = exp(-abs(sin(ang - 1.25 - t*0.05))*95.0)*smoothstep(0.62, 0.05, cr)*0.55;
  float n2 = exp(-abs(sin(ang + 2.35 + t*0.04))*110.0)*smoothstep(0.50, 0.05, cr)*0.35;
  coreCol += vec3(1.0, 0.55, 0.75)*n1 + vec3(0.55, 0.9, 1.0)*n2;
  em += coreCol;

  // --- compose inside sphere --------------------------------------------------
  vec3 base = sphereBase(p, r, t);
  // faint volumetric haze that picks up the base hues
  base += base*0.9*fbm(wp*3.0 - t*0.05)*smoothstep(0.1, 0.9, r)*0.5;
  vec3 col = 1.0 - (1.0 - base)*exp(-em*1.05);   // screen-like, desaturates to white at high energy

  // glass: inner rim, fresnel, specular sheen
  float rimLine = smoothstep(0.90, 0.995, r)*(1.0 - smoothstep(0.995, 1.002, r));
  col += sphereBase(p, 1.0, t)*rimLine*0.32;
  col += vec3(0.55, 0.60, 0.95)*pow(smoothstep(0.55, 1.0, r), 3.0)*0.04;
  vec2 hp = (p - vec2(-0.34, 0.50))*vec2(1.0, 1.9);
  col += vec3(0.8, 0.9, 1.0)*exp(-dot(hp, hp)*7.0)*0.10*smoothstep(1.0, 0.8, r);
  vec2 hp2 = (p - vec2(0.38, -0.55))*vec2(1.6, 1.0);
  col += vec3(1.0, 0.5, 0.7)*exp(-dot(hp2, hp2)*10.0)*0.06*smoothstep(1.0, 0.8, r);

  // --- mask + outer aura ------------------------------------------------------
  float aa = max(uPx*1.2, 0.0015);
  float m = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
  float edgeFade = smoothstep(${PAD.toFixed(3)}, 1.0, r);
  vec3 aura = sphereBase(p, 1.0, t)*1.0*exp(-max(r - 1.0, 0.0)*8.0)*0.26*(1.0 + act*0.7);
  aura += vec3(0.5, 0.4, 0.95)*exp(-max(r - 1.0, 0.0)*3.5)*0.035;
  aura *= edgeFade*edgeFade;
  vec3 outc = col*m + aura*(1.0 - m);

  // dither against banding on dark gradients
  outc += (hash21(gl_FragCoord.xy + fract(t)*61.0) - 0.5)/200.0*m;

  gl_FragColor = vec4(max(outc, 0.0), m);
}
`;

export function startScene(){
  const canvas = document.querySelector('#universe');
  let renderer;
  try{ renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true }); }catch{ return ()=>{}; }
  const dpr = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 12;
  const viewH = 2*12*Math.tan(20*Math.PI/180); // world height visible at z=0

  // --- the orb ---------------------------------------------------------------
  const uniforms = { uTime:{ value:0 }, uActive:{ value:0 }, uPx:{ value:0.004 } };
  const orbMaterial = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    transparent:true, depthWrite:false, depthTest:false, premultipliedAlpha:true
  });
  const orb = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), orbMaterial);
  orb.renderOrder = 10;
  scene.add(orb);

  // --- ambient field: faint particles + tracers that converge on the orb ------
  const points = [], paths = [];
  for(let i=0;i<180;i++){
    const x=(Math.random()-.5)*20, y=(Math.random()-.5)*14, z=-3-Math.random()*5;
    points.push(x,y,z); if(i%9===0) paths.push(x,y,z,0,0,0);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(points,3));
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ color:0xb9a9ee, size:.025, transparent:true, opacity:.55 })));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(paths,3));
  const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color:0x8a7fd0, transparent:true, opacity:.10 }));
  scene.add(lines);
  const tracerGeometry = new THREE.BufferGeometry();
  const tracerPositions = new Float32Array(paths.length/2);
  tracerGeometry.setAttribute('position', new THREE.BufferAttribute(tracerPositions,3));
  scene.add(new THREE.Points(tracerGeometry, new THREE.PointsMaterial({ color:0xdfe6ff, size:.05 })));

  let orbY = 0;
  function resize(){
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    const rect = document.querySelector('.sculpture-space').getBoundingClientRect();
    orbY = (.5 - (rect.top + rect.height/2)/innerHeight)*viewH;
    // orb diameter = the reserved box height (capped so it never overlaps the headline)
    const diameterPx = Math.min(rect.height, innerWidth*0.9);
    const diameterWorld = diameterPx/innerHeight*viewH;
    const planeWorld = diameterWorld*PAD;
    orb.scale.set(planeWorld, planeWorld, 1);
    orb.position.set(0, orbY, 0);
    lines.position.y = orbY;
    uniforms.uPx.value = 2*PAD/(planeWorld/viewH*innerHeight); // one CSS pixel in orb units
  }
  addEventListener('resize', resize); addEventListener('scroll', resize, { passive:true }); resize();

  let active = false, activeSmooth = 0, phase = 0, last = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setAnimationLoop(ms=>{
    if(document.hidden){ last = ms; return; }
    const dt = Math.min((ms - last)*0.001, 0.05); last = ms;
    activeSmooth += ((active ? 1 : 0) - activeSmooth)*Math.min(dt*4, 1);
    if(!reduced){
      phase += dt*(1 + activeSmooth*2.4);
      const time = ms*0.001;
      for(let i=0;i<paths.length/6;i++){
        const f = (time*.16 + i*.137)%1;
        tracerPositions[i*3]   = paths[i*6]*(1-f);
        tracerPositions[i*3+1] = paths[i*6+1]*(1-f) + orbY;
        tracerPositions[i*3+2] = paths[i*6+2]*(1-f);
      }
      tracerGeometry.attributes.position.needsUpdate = true;
    }
    uniforms.uTime.value = reduced ? 4.0 : phase + 4.0;
    uniforms.uActive.value = reduced ? 0 : activeSmooth;
    renderer.render(scene, camera);
  });
  return value=>{ active = value; };
}
