/* Dependency-free WebGL extruded X logo with orbiting Undertale-style pixel hearts. Geometry and materials are generated locally. */
(() => {
  'use strict';
  const canvas = document.getElementById('sculpture');
  const shell = document.getElementById('scene-shell');
  let gl;
  try { gl = canvas.getContext('webgl', {alpha:true, antialias:true, powerPreference:'low-power'}); } catch (_) {}
  const fallback = () => { shell.classList.remove('webgl-ready'); canvas.hidden=true; };
  if (!gl) { fallback(); return; }
  const vertex = `attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uViewProjection;varying vec3 vPosition;varying vec3 vNormal;varying vec3 vLocal;void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vLocal=aPosition;vNormal=mat3(uModel)*aNormal;gl_Position=uViewProjection*p;}`;
  const fragment = `precision mediump float;
  varying vec3 vPosition;varying vec3 vNormal;varying vec3 vLocal;
  uniform vec3 uCamera;uniform float uGlow;
  void main(){
    vec3 n=normalize(vNormal),v=normalize(uCamera-vPosition);
    float gradient=smoothstep(-1.5,1.5,vLocal.x+vLocal.y*.1);
    vec3 base=mix(vec3(.30,.025,.86),vec3(1.0,.015,.60),gradient);
    vec3 light=normalize(vec3(-2.0,4.0,6.0));
    float diffuse=max(dot(n,light),0.0);
    float spec=pow(max(dot(reflect(-light,n),v),0.0),36.0);
    float fres=pow(1.0-max(dot(n,v),0.0),3.0);
    float grain=fract(sin(dot(vLocal.xy,vec2(127.1,311.7)))*43758.5453);
    float sweep=pow(max(0.0,1.0-abs(vPosition.x+vPosition.y*.48-.15)*1.1),8.0);
    vec3 color=base*(.43+.48*diffuse)+(grain-.5)*.025;
    color+=spec*vec3(.64,.34,.8)*.65+fres*base*.32+sweep*vec3(.16,.08,.22);
    vec3 neon=mix(base,vec3(1.0,.83,1.0),.73);
    color=mix(color,neon,uGlow);
    gl_FragColor=vec4(color,1.0);
  }`;
  function shader(type, src) { const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s; }
  function makeProgram(fs){ const p=gl.createProgram(); gl.attachShader(p,shader(gl.VERTEX_SHADER,vertex)); gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs)); gl.bindAttribLocation(p,0,'aPosition'); gl.bindAttribLocation(p,1,'aNormal'); gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('Could not initialize sculpture'); return p; }
  // Undertale-style soul shading: flat saturated colour, soft light, faint pixel grid on the front and back faces.
  const heartFragment = `precision mediump float;
  varying vec3 vPosition;varying vec3 vNormal;varying vec3 vLocal;
  uniform vec3 uCamera;uniform vec3 uColor;
  void main(){
    vec3 n=normalize(vNormal),v=normalize(uCamera-vPosition);
    vec3 light=normalize(vec3(-2.0,4.0,6.0));
    float diffuse=max(dot(n,light),0.0);
    float spec=pow(max(dot(reflect(-light,n),v),0.0),24.0);
    float fres=pow(1.0-max(dot(n,v),0.0),2.5);
    vec3 color=uColor*(.66+.42*diffuse)+spec*.30+fres*uColor*.30;
    if(abs(n.z)>.5){vec2 f=fract(vLocal.xy);float e=min(min(f.x,1.0-f.x),min(f.y,1.0-f.y));color*=mix(.80,1.0,smoothstep(.0,.07,e));}
    gl_FragColor=vec4(color,1.0);
  }`;
  let program, heartProgram;
  try { program=makeProgram(fragment); heartProgram=makeProgram(heartFragment); } catch(e){ console.warn('3D fallback:',e.message);fallback();return; }
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const loc={};['uModel','uViewProjection','uCamera','uGlow'].forEach(n=>loc[n]=gl.getUniformLocation(program,n));
  const hloc={};['uModel','uViewProjection','uCamera','uColor'].forEach(n=>hloc[n]=gl.getUniformLocation(heartProgram,n));
  const pos=0, normal=1;
  const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function mesh(positions,normals,indices){const p=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);const n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);const i=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);return {p,n,i,count:indices.length};}
  // Clockwise contour: a broad X, matching the supplied purple/pink mark.
  const contour=[[-1.58,1.34],[-.65,1.34],[0,.60],[.65,1.34],[1.58,1.34],[.38,0],[1.58,-1.34],[.65,-1.34],[0,-.60],[-.65,-1.34],[-1.58,-1.34],[-.38,0]].reverse();
  const area2=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  function inset(points,distance){return points.map((p,i)=>{
    const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
    const u=norm([p[0]-prev[0],p[1]-prev[1],0]),v=norm([next[0]-p[0],next[1]-p[1],0]);
    const n1=[-u[1],u[0]],n2=[-v[1],v[0]],denom=1+n1[0]*n2[0]+n1[1]*n2[1];
    return [p[0]+distance*(n1[0]+n2[0])/denom,p[1]+distance*(n1[1]+n2[1])/denom];
  });}
  function triangulate(points){
    const remaining=points.map((_,i)=>i),triangles=[];
    while(remaining.length>3){let found=false;
      for(let k=0;k<remaining.length;k++){
        const a=remaining[(k+remaining.length-1)%remaining.length],b=remaining[k],c=remaining[(k+1)%remaining.length];
        if(area2(points[a],points[b],points[c])<=.00001)continue;
        const inside=remaining.some(j=>j!==a&&j!==b&&j!==c&&area2(points[a],points[b],points[j])>=-.00001&&area2(points[b],points[c],points[j])>=-.00001&&area2(points[c],points[a],points[j])>=-.00001);
        if(inside)continue;triangles.push(a,b,c);remaining.splice(k,1);found=true;break;
      }
      if(!found)throw new Error('Invalid logo outline');
    }
    triangles.push(...remaining);return triangles;
  }
  const inner=inset(contour,.047),positions=[],normals=[],indices=[];
  function triangle(a,b,c){const normal=norm(cross(b.map((v,i)=>v-a[i]),c.map((v,i)=>v-a[i]))),start=positions.length/3;positions.push(...a,...b,...c);normals.push(...normal,...normal,...normal);indices.push(start,start+1,start+2);}
  function surface(a,b,c,d){triangle(a,b,c);triangle(a,c,d);}
  const cap=triangulate(inner);
  for(let i=0;i<cap.length;i+=3){const [a,b,c]=cap.slice(i,i+3).map(j=>inner[j]);triangle([...a,.21],[...b,.21],[...c,.21]);triangle([...c,-.21],[...b,-.21],[...a,-.21]);}
  for(let i=0;i<contour.length;i++){
    const j=(i+1)%contour.length,a=contour[i],b=contour[j],u=inner[i],v=inner[j];
    surface([...a,-.15],[...b,-.15],[...b,.15],[...a,.15]);
    surface([...a,.15],[...b,.15],[...v,.21],[...u,.21]);
    surface([...u,-.21],[...v,-.21],[...b,-.15],[...a,-.15]);
  }
  const logo=mesh(positions,normals,indices);
  // Thin luminous strips run around the front and back face, above the bevel.
  const edgeOuter=inset(contour,.044),edgeInner=inset(contour,.058);
  positions.length=normals.length=indices.length=0;
  for(let i=0;i<contour.length;i++){
    const j=(i+1)%contour.length;
    surface([...edgeOuter[i],.212],[...edgeOuter[j],.212],[...edgeInner[j],.212],[...edgeInner[i],.212]);
    surface([...edgeInner[i],-.212],[...edgeInner[j],-.212],[...edgeOuter[j],-.212],[...edgeOuter[i],-.212]);
  }
  const neon=mesh(positions,normals,indices);
  // ---- Orbits: two glowing tilted rings, drawn as thin tubes. ----
  const orbits=[
    {a:2.42,b:1.70,rx:1.12,rz:.36},
    {a:2.32,b:1.50,rx:-1.02,rz:-.52}
  ];
  function orbitPoint(o,t){
    let x=o.a*Math.cos(t),y=o.b*Math.sin(t),z=0;
    let y1=y*Math.cos(o.rx)-z*Math.sin(o.rx),z1=y*Math.sin(o.rx)+z*Math.cos(o.rx);y=y1;z=z1;
    const x2=x*Math.cos(o.rz)-y*Math.sin(o.rz),y2=x*Math.sin(o.rz)+y*Math.cos(o.rz);
    return [x2,y2,z];
  }
  positions.length=normals.length=indices.length=0;
  const SEG=140,SIDES=10,TUBE=.024;
  orbits.forEach(o=>{
    const base=positions.length/3,zAxis=[0,0,0];
    {const p0=orbitPoint(o,0),p1=orbitPoint(o,Math.PI/2),p2=orbitPoint(o,Math.PI);const n=norm(cross(p1.map((v,i)=>v-p0[i]),p2.map((v,i)=>v-p1[i])));zAxis[0]=n[0];zAxis[1]=n[1];zAxis[2]=n[2];}
    for(let i=0;i<SEG;i++){
      const t=i/SEG*Math.PI*2,c=orbitPoint(o,t),c2=orbitPoint(o,t+.001),T=norm(c2.map((v,k)=>v-c[k])),R=norm(cross(T,zAxis));
      for(let k=0;k<SIDES;k++){
        const ang=k/SIDES*Math.PI*2,dir=[R[0]*Math.cos(ang)+zAxis[0]*Math.sin(ang),R[1]*Math.cos(ang)+zAxis[1]*Math.sin(ang),R[2]*Math.cos(ang)+zAxis[2]*Math.sin(ang)];
        positions.push(c[0]+dir[0]*TUBE,c[1]+dir[1]*TUBE,c[2]+dir[2]*TUBE);normals.push(...dir);
      }
    }
    for(let i=0;i<SEG;i++)for(let k=0;k<SIDES;k++){
      const a=base+i*SIDES+k,b=base+i*SIDES+(k+1)%SIDES,c=base+((i+1)%SEG)*SIDES+(k+1)%SIDES,d=base+((i+1)%SEG)*SIDES+k;
      indices.push(a,b,c,a,c,d);
    }
  });
  const rings=mesh(positions,normals,indices);

  // ---- Undertale soul: an 8x8 pixel heart built from real cubes, so it turns in 3D. ----
  const SOUL=['.XX..XX.','XXXXXXXX','XXXXXXXX','XXXXXXXX','XXXXXXXX','.XXXXXX.','..XXXX..','...XX...'];
  positions.length=normals.length=indices.length=0;
  (function(){
    const H=SOUL.length,W=SOUL[0].length,D=1.15;
    const solid=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&SOUL[y][x]==='X';
    function quad(p,n){const s=positions.length/3;p.forEach(q=>{positions.push(...q);normals.push(...n);});indices.push(s,s+1,s+2,s,s+2,s+3);}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(!solid(x,y))continue;
      const x0=x-W/2,x1=x0+1,y1=H/2-y,y0=y1-1;
      quad([[x0,y0,D],[x1,y0,D],[x1,y1,D],[x0,y1,D]],[0,0,1]);
      quad([[x1,y0,-D],[x0,y0,-D],[x0,y1,-D],[x1,y1,-D]],[0,0,-1]);
      if(!solid(x-1,y))quad([[x0,y0,-D],[x0,y0,D],[x0,y1,D],[x0,y1,-D]],[-1,0,0]);
      if(!solid(x+1,y))quad([[x1,y0,D],[x1,y0,-D],[x1,y1,-D],[x1,y1,D]],[1,0,0]);
      if(!solid(x,y-1))quad([[x0,y1,D],[x1,y1,D],[x1,y1,-D],[x0,y1,-D]],[0,1,0]);
      if(!solid(x,y+1))quad([[x0,y0,-D],[x1,y0,-D],[x1,y0,D],[x0,y0,D]],[0,-1,0]);
    }
  })();
  const soul=mesh(positions,normals,indices);
  // Soul colours in the order of the reference image: determination, bravery, justice, kindness, patience, integrity, perseverance.
  const hearts=[
    {color:[1.0,.0,.0],   orbit:0,phase:.00,speed: .34},
    {color:[1.0,.5,.0],   orbit:0,phase:1.57,speed: .34},
    {color:[1.0,.9,.0],   orbit:0,phase:3.14,speed: .34},
    {color:[.25,.95,.05], orbit:0,phase:4.71,speed: .34},
    {color:[.0,.95,1.0],  orbit:1,phase:.70, speed:-.30},
    {color:[.05,.1,1.0],  orbit:1,phase:2.80,speed:-.30},
    {color:[.78,.05,1.0], orbit:1,phase:4.90,speed:-.30}
  ];
  const apply=(m,p)=>[0,1,2].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]);
  const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  function multiply(a,b){const out=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;}
  function transform(rx,ry,rz,s=1,xyz=[0,0,0]){const x=identity(),y=identity(),z=identity();x[5]=x[10]=Math.cos(rx);x[6]=Math.sin(rx);x[9]=-Math.sin(rx);y[0]=y[10]=Math.cos(ry);y[2]=-Math.sin(ry);y[8]=Math.sin(ry);z[0]=z[5]=Math.cos(rz);z[1]=Math.sin(rz);z[4]=-Math.sin(rz);const m=multiply(z,multiply(y,x));for(let i=0;i<12;i++)m[i]*=s;m[12]=xyz[0];m[13]=xyz[1];m[14]=xyz[2];return m;}
  function projection(aspect){const f=1/Math.tan(.63/2),near=.1,far=50,p=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],view=identity();view[14]=-8.6;return multiply(p,view);}
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,visible=true,contextLost=false,dirty=true,time=0,last=0,frame=0;
  let dragX=0,dragY=0,targetX=0,targetY=0,hoverX=0,hoverY=0,followX=0,followY=0,pointer=null;
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);dirty=true;wake();}
  function draw(mesh,model,glow=0){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.enableVertexAttribArray(normal);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.uniformMatrix4fv(loc.uModel,false,new Float32Array(model));gl.uniform1f(loc.uGlow,glow);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
  function drawHeart(mesh,model){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.enableVertexAttribArray(normal);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.uniformMatrix4fv(hloc.uModel,false,new Float32Array(model));gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
  function render(now){frame=0;if(document.hidden||!visible){last=0;return;}const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused)time+=dt;const ease=1-Math.exp(-12*(dt||1/60));dragX+=(targetX-dragX)*ease;dragY+=(targetY-dragY)*ease;hoverX+=(followX-hoverX)*ease;hoverY+=(followY-hoverY)*ease;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(loc.uViewProjection,false,new Float32Array(projection(canvas.width/canvas.height)));gl.uniform3fv(loc.uCamera,[0,0,8.6]);
    const bob=paused?0:Math.sin(time*.7)*.06,aspect=canvas.width/canvas.height,sc=1.26*Math.min(1,aspect/1.3);
    const model=transform(.08+dragY+hoverY+Math.sin(time*.45)*.035,-.18+Math.sin(time*.32)*.22+dragX+hoverX,-.025,sc,[0,bob*.5,0]);
    draw(logo,model);draw(neon,model,1);draw(rings,model,.28);
    // Hearts: placed on the orbits with the logo's transform, then drawn upright so they always read as Undertale souls.
    gl.useProgram(heartProgram);
    gl.uniformMatrix4fv(hloc.uViewProjection,false,new Float32Array(projection(canvas.width/canvas.height)));gl.uniform3fv(hloc.uCamera,[0,0,8.6]);
    hearts.forEach(h=>{
      const world=apply(model,orbitPoint(orbits[h.orbit],h.phase+time*h.speed*2));
      const beat=1+(paused?0:.05*Math.sin(time*3.2+h.phase*2));
      const m=transform(.10+hoverY*.6+Math.sin(time*.8+h.phase)*.12,hoverX*.8+Math.sin(time*.9+h.phase*1.7)*.62,0,.058*sc*beat,world);
      gl.uniform3fv(hloc.uColor,h.color);
      drawHeart(soul,m);
    });
    gl.useProgram(program);


    dirty=false;if(!paused||Math.abs(targetX-dragX)+Math.abs(targetY-dragY)+Math.abs(followX-hoverX)+Math.abs(followY-hoverY)>.002)wake();
  }
  function wake(){if(!frame&&visible&&!contextLost&&!document.hidden)frame=requestAnimationFrame(render);}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||e.isPrimary===false)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,touch:e.pointerType==='touch',intent:null};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||e.pointerId!==pointer.id)return;
    const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
    if(pointer.touch&&!pointer.intent){
      if(Math.hypot(dx,dy)<6)return;
      pointer.intent=Math.abs(dx)>Math.abs(dy)?'rotate':'scroll';
      pointer.x=e.clientX;pointer.y=e.clientY;return;
    }
    if(pointer.intent==='scroll')return;
    targetX+=dx*.009;targetY+=dy*.009;pointer.x=e.clientX;pointer.y=e.clientY;wake();
  });
  // Follow the mouse across the whole page, without clicking the logo.
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||pointer)return;
    followX=Math.max(-1,Math.min(1,e.clientX/Math.max(window.innerWidth,1)*2-1))*.72;
    followY=Math.max(-1,Math.min(1,e.clientY/Math.max(window.innerHeight,1)*2-1))*.38;
    wake();
  },{passive:true});
  document.addEventListener('pointerout',e=>{if(!e.relatedTarget){followX=followY=0;wake();}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{pointer=null;}));
  canvas.addEventListener('dblclick',()=>{targetX=targetY=followX=followY=0;wake();});
  canvas.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')targetX-=.18;if(e.key==='ArrowRight')targetX+=.18;if(e.key==='ArrowUp')targetY-=.18;if(e.key==='ArrowDown')targetY+=.18;if(e.key==='Home')targetX=targetY=followX=followY=0;wake();});
  reduced.addEventListener?.('change',e=>{paused=e.matches;last=0;wake();});
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)wake();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:'150px'}).observe(shell);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(shell);else window.addEventListener('resize',resize);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;visible=false;pointer=null;fallback();});
  shell.classList.add('webgl-ready');resize();
})();
