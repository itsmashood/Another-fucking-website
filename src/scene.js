import * as THREE from 'three';

/*
  Purple plasma orb — a real volumetric 3D form.
  A fragment shader ray-marches a density field made of thin, folded membranes
  (iso-bands of 3D noise, domain-warped), lit from the upper left, depth-tinted
  (front = lavender/orchid, back = indigo/blue) and fading smoothly to nothing,
  so there is no hard outline. The orb tilts toward the cursor, is pulled and
  lit by it, swells on hover, and ripples on click.
*/

const PAD = 1.35;   // plane is PAD x orb radius; the form itself fades out by r = 1.2

const vertexShader = /* glsl */`
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const fragmentShader = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uActive;   // speaking / listening 0..1
uniform float uProx;     // cursor proximity 0..1
uniform float uHover;    // cursor over the orb 0..1
uniform float uPulse;    // click ripple 1..0
uniform vec2  uMouse;    // cursor in orb units (+x right, +y up)

float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float hash31(vec3 p){ p = fract(p*0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y)*p.z); }
float noise3(vec3 x){
  vec3 i = floor(x), f = fract(x);
  f = f*f*(3.0 - 2.0*f);
  return mix(mix(mix(hash31(i),                 hash31(i + vec3(1,0,0)), f.x),
                 mix(hash31(i + vec3(0,1,0)),   hash31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash31(i + vec3(0,0,1)),   hash31(i + vec3(1,0,1)), f.x),
                 mix(hash31(i + vec3(0,1,1)),   hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }

vec3 pal(float x){
  vec3 a = vec3(0.09, 0.03, 0.36);   // deep indigo
  vec3 b = vec3(0.40, 0.15, 0.94);   // violet
  vec3 c = vec3(0.76, 0.40, 1.00);   // orchid
  vec3 d = vec3(0.98, 0.90, 1.00);   // lavender white
  x = clamp(x, 0.0, 1.0);
  return x < 0.34 ? mix(a, b, x/0.34) : x < 0.67 ? mix(b, c, (x-0.34)/0.33) : mix(c, d, (x-0.67)/0.33);
}

// Density of the form at object-space point p.
float field(vec3 p, float t, float en, bool fine){
  float r = length(p);
  // flowing sine-warp: cheap and smooth
  vec3 q = p + (0.30 + 0.12*en)*sin(p.yzx*1.9 + t*vec3(0.31, 0.24, 0.19) + vec3(0.0, 1.7, 3.1))
             + 0.13*sin(p.zxy*3.7 - t*vec3(0.22, 0.28, 0.17) + vec3(2.0, 0.4, 5.0));
  float n1 = noise3(q*1.85 + vec3(0.0, t*0.07, 0.0));
  float sheet1 = pow(1.0 - abs(2.0*n1 - 1.0), 8.0);          // broad membranes
  float n2 = noise3(q*3.9 - vec3(t*0.05, 0.0, 11.0));
  float sheet2 = pow(1.0 - abs(2.0*n2 - 1.0), 13.0);          // finer veils
  float d = sheet1*1.25 + sheet2*0.80;
  if(fine){
    float n3 = noise3(q*8.3 + vec3(3.0, t*0.04, 0.0));
    d += pow(1.0 - abs(2.0*n3 - 1.0), 18.0)*0.45;            // filaments
  }
  float env = smoothstep(1.12, 0.42, r);                      // soft falloff, no outline
  float body = exp(-r*r*4.0)*0.22;                            // luminous volume
  // click ripple: a travelling shell of extra density
  float ring = exp(-pow(r - (1.05 - uPulse*0.95), 2.0)*55.0)*uPulse*1.1;
  return env*(d + body) + ring*env;
}

void main(){
  vec2 xy = (vUv - 0.5)*2.0*${PAD.toFixed(3)};
  float rho = length(xy);
  float t = uTime;
  float en = max(uActive, uHover*0.75 + uProx*0.2);

  vec3 L = normalize(vec3(-0.45, 0.55, -0.70));     // viewer is at -z
  vec3 ml = vec3(uMouse, -0.55);                    // cursor light, in view space

  // soft atmospheric halo that carries the form out into the background
  float haloMask = smoothstep(${PAD.toFixed(3)}, 0.9, rho);
  vec3 halo = vec3(0.34, 0.14, 0.78)*exp(-rho*rho*3.2)*0.10*(1.0 + en*1.2 + uProx*0.8);
  halo += vec3(0.60, 0.40, 1.0)*exp(-rho*rho*14.0)*0.05*(1.0 + uProx);
  halo *= haloMask*haloMask;

  vec3 col = vec3(0.0);
  float T = 1.0;

  if(rho < 1.25){
    // orientation: slow spin + tilt toward the cursor
    vec2 look = clamp(uMouse/2.6, -0.5, 0.5);
    mat3 R = rotX(-look.y*0.9 + 0.22*sin(t*0.17)) * rotY(t*0.13 + look.x*0.9);
    vec3 Lo = R*L;
    float swell = 1.0 - 0.09*uHover - 0.04*uProx - 0.05*uActive*sin(t*3.0);   // <1 = larger form

    float zmax = sqrt(max(1.5625 - rho*rho, 0.0));
    const int N = 52;
    float dt = 2.0*zmax/float(N);
    float z = -zmax + dt*hash21(gl_FragCoord.xy*1.37);

    for(int i = 0; i < N; i++){
      vec3 pw = vec3(xy, z);
      // cursor pulls the form toward itself
      vec3 dm = ml - pw;
      float g = exp(-dot(dm, dm)*2.2)*(uProx*0.6 + uHover*0.4);
      pw += dm*g*0.30;
      vec3 p = R*pw*swell;

      float dens = field(p, t, en, true);
      if(dens > 0.004){
        float dens2 = field(p + Lo*0.11, t, en, false);
        float lit = clamp(1.0 + (dens - dens2)*3.2, 0.25, 2.0);           // facing the light → brighter
        float s = (z + zmax)/(2.0*zmax);                                    // 0 front .. 1 back
        float r = length(p);

        float coreG = exp(-r*r*8.0);
        float mouseL = exp(-dot(dm, dm)*5.5)*uProx*1.2;
        float x = 0.14 + 0.42*clamp(dens, 0.0, 1.3) + 0.22*(lit - 0.6) + 0.55*coreG + 0.55*mouseL + 0.06*uPulse;
        vec3 c = pal(x);
        // depth tint: back sheets drift toward blue-indigo, front catches a touch of magenta
        c = mix(c, vec3(0.20, 0.30, 0.95), smoothstep(0.45, 1.0, s)*0.28);
        c = mix(c, vec3(0.95, 0.30, 0.85), smoothstep(0.55, 0.0, s)*0.12*lit);
        c *= mix(0.55, 1.08, 1.0 - s*0.85);

        float a = dens*dt*5.0;
        col += T*c*a*(0.85 + 0.45*lit + coreG*1.1 + mouseL*1.5);
        T *= exp(-a*0.85);
        if(T < 0.02) break;
      }
      z += dt;
    }
  }

  vec3 outc = 1.0 - exp(-col*1.05);        // filmic roll-off → highlights go lavender-white
  outc += halo;
  float alpha = clamp(1.0 - T, 0.0, 1.0)*0.9;

  // dither
  outc += (hash21(gl_FragCoord.xy + 17.0) - 0.5)/255.0*smoothstep(0.0, 0.1, alpha + length(halo));

  gl_FragColor = vec4(max(outc, 0.0), alpha);
}
`;

export function startScene(){
  const canvas = document.querySelector('#universe');
  let renderer;
  try{ renderer = new THREE.WebGLRenderer({ canvas, antialias:false, alpha:true, powerPreference:'high-performance' }); }catch{ return ()=>{}; }
  let dpr = Math.min(devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 12;
  const viewH = 2*12*Math.tan(20*Math.PI/180);

  const uniforms = {
    uTime:{ value:0 }, uActive:{ value:0 }, uProx:{ value:0 }, uHover:{ value:0 },
    uPulse:{ value:0 }, uMouse:{ value:new THREE.Vector2(9, 9) }
  };
  const orb = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent:true, depthWrite:false, depthTest:false, premultipliedAlpha:true })
  );
  orb.renderOrder = 10;
  scene.add(orb);

  // --- layout: orb centre/radius in CSS px (for cursor maths) ----------------
  let orbY = 0, cx = 0, cy = 0, rpx = 150;
  function resize(){
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    const rect = document.querySelector('.sculpture-space').getBoundingClientRect();
    cx = rect.left + rect.width/2; cy = rect.top + rect.height/2;
    orbY = (.5 - cy/innerHeight)*viewH;
    const diameterPx = Math.min(rect.height*1.2, innerWidth*0.95);
    rpx = diameterPx/2;
    const planeWorld = diameterPx/innerHeight*viewH*PAD;
    orb.scale.set(planeWorld, planeWorld, 1);
    orb.position.set(0, orbY, 0);
  }
  addEventListener('resize', resize); addEventListener('scroll', resize, { passive:true }); resize();

  // --- cursor ----------------------------------------------------------------
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = { x:9, y:9 };            // cursor in orb units
  let pulse = 0;
  function setPointer(e){ target.x = (e.clientX - cx)/rpx; target.y = -(e.clientY - cy)/rpx; }
  function leave(){ target.x = target.y = 9; }
  if(!reduced){
    addEventListener('pointermove', setPointer, { passive:true });
    addEventListener('pointerdown', e=>{ setPointer(e); if(Math.hypot(target.x, target.y) < 1.4) pulse = 1; }, { passive:true });
    addEventListener('pointerup', e=>{ if(e.pointerType === 'touch') leave(); });
    document.documentElement.addEventListener('pointerleave', leave);
    addEventListener('blur', leave);
  }

  // --- loop ------------------------------------------------------------------
  const smooth = { x:9, y:9, prox:0, hover:0, act:0 };
  let active = false, phase = 0, last = 0, slow = 0, frames = 0;
  const ss = (a,b,x)=>{ const k = Math.min(Math.max((x-a)/(b-a),0),1); return k*k*(3-2*k); };

  renderer.setAnimationLoop(ms=>{
    if(document.hidden){ last = ms; return; }
    const dtRaw = (ms - last)*0.001; last = ms;
    const dt = Math.min(dtRaw, 0.05);

    // adaptive resolution: if the GPU struggles, render fewer pixels
    if(dtRaw > 0){ frames++; if(dtRaw > 0.034) slow++; }
    if(frames >= 45){ if(slow > 25 && dpr > 1){ dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight); } frames = slow = 0; }

    const k = Math.min(dt*7, 1);
    const far = Math.hypot(target.x, target.y) > 6;
    const dist = Math.hypot(target.x, target.y);
    smooth.prox  += ((far ? 0 : ss(2.6, 0.55, dist)) - smooth.prox)*k;
    smooth.hover += ((far ? 0 : ss(1.0, 0.45, dist)) - smooth.hover)*k;
    if(far){ smooth.x += (0 - smooth.x)*k*0.5; smooth.y += (0 - smooth.y)*k*0.5; }
    else   { smooth.x += (Math.max(-3, Math.min(3, target.x)) - smooth.x)*k; smooth.y += (Math.max(-3, Math.min(3, target.y)) - smooth.y)*k; }
    smooth.act += ((active ? 1 : 0) - smooth.act)*Math.min(dt*4, 1);
    pulse = Math.max(0, pulse - dt*0.9);

    const energy = Math.max(smooth.act, smooth.hover*0.75);
    if(!reduced){
      phase += dt*(1 + energy*2.2 + smooth.prox*0.6);
    }

    uniforms.uTime.value   = reduced ? 5.0 : phase + 5.0;
    uniforms.uActive.value = reduced ? 0 : smooth.act;
    uniforms.uProx.value   = smooth.prox;
    uniforms.uHover.value  = smooth.hover;
    uniforms.uPulse.value  = pulse*pulse;
    uniforms.uMouse.value.set(smooth.x, smooth.y);
    renderer.render(scene, camera);
  });
  return value=>{ active = value; };
}
