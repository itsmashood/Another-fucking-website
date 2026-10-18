/* Dependency-free WebGL sculpture. All geometry is generated locally. */
(() => {
  'use strict';
  const canvas = document.getElementById('sculpture');
  const shell = document.getElementById('scene-shell');
  let gl;
  try { gl = canvas.getContext('webgl', {alpha:true, antialias:true, powerPreference:'low-power'}); } catch (_) {}
  const fallback = () => { shell.classList.remove('webgl-ready'); canvas.hidden=true; document.getElementById('scene-hint').textContent='CHROME / SCULPTURE'; };
  if (!gl) { fallback(); return; }
  const vertex = `attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uModel;uniform mat4 uViewProjection;varying vec3 vPosition;varying vec3 vNormal;void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=mat3(uModel)*aNormal;gl_Position=uViewProjection*p;}`;
  const fragment = `precision mediump float;varying vec3 vPosition;varying vec3 vNormal;uniform vec3 uAccent;uniform vec3 uCamera;uniform float uGlow;
  void main(){
    vec3 n=normalize(vNormal);vec3 v=normalize(uCamera-vPosition);vec3 r=reflect(-v,n);
    float fres=pow(1.0-max(dot(n,v),0.0),3.0);
    float band=pow(max(0.0,sin(r.y*5.0+r.x*2.8)),12.0);
    float stripe=pow(max(0.0,cos(r.x*4.2-r.z*2.0)),28.0);
    float soft=pow(max(dot(n,normalize(vec3(-3.0,4.0,5.0))),0.0),1.8);
    float spec=pow(max(dot(reflect(-normalize(vec3(-3.0,4.0,5.0)),n),v),0.0),64.0);
    float rim=pow(max(dot(n,normalize(vec3(4.0,-1.0,1.0))),0.0),6.0);
    vec3 metal=mix(vec3(.075,.052,.10),uAccent*.63,soft);
    metal+=band*mix(uAccent,vec3(1.0),.7)*.8+stripe*uAccent*.30;
    metal+=spec*vec3(1.0,.93,.97)*1.1+rim*uAccent*.48;
    metal+=fres*mix(uAccent,vec3(.85,.9,1.0),.25)*.65;
    metal=mix(metal,uAccent*.65+metal*.55,uGlow);
    gl_FragColor=vec4(pow(metal,vec3(.85)),1.0);
  }`;
  function shader(type, src) { const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s; }
  let program;
  try { program=gl.createProgram(); gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Could not initialize sculpture'); } catch(e){ console.warn('3D fallback:',e.message);fallback();return; }
  gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const loc={};['uModel','uViewProjection','uAccent','uCamera','uGlow'].forEach(n=>loc[n]=gl.getUniformLocation(program,n));
  const pos=gl.getAttribLocation(program,'aPosition'), normal=gl.getAttribLocation(program,'aNormal');
  const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function mesh(positions,normals,indices){const p=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,p);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);const n=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,n);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);const i=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);return {p,n,i,count:indices.length};}
  function tube(path, radius, segments, sides){const p=[],n=[],idx=[];for(let i=0;i<=segments;i++){const t=i/segments*Math.PI*2,c=path(t),next=path(t+.0001),prev=path(t-.0001),tangent=norm(next.map((x,k)=>x-prev[k])),a=norm(cross(tangent,[0,0,1])),b=norm(cross(tangent,a));for(let j=0;j<=sides;j++){const theta=j/sides*Math.PI*2,nn=a.map((x,k)=>x*Math.cos(theta)+b[k]*Math.sin(theta));p.push(...c.map((x,k)=>x+radius*nn[k]));n.push(...nn);if(i<segments&&j<sides){const k=i*(sides+1)+j;idx.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}return mesh(p,n,idx);}
  const knot=tube(t=>{const r=1.15+.35*Math.cos(3*t);return[r*Math.cos(2*t),r*Math.sin(2*t),.48*Math.sin(3*t)];},.245,240,24);
  const ring=tube(t=>[2.04*Math.cos(t),2.04*Math.sin(t),0],.012,180,6);
  function sphere(){const p=[],n=[],idx=[];const cols=24,rows=16;for(let i=0;i<=rows;i++){const t=i/rows*Math.PI;for(let j=0;j<=cols;j++){const f=j/cols*Math.PI*2,v=[Math.sin(t)*Math.cos(f),Math.cos(t),Math.sin(t)*Math.sin(f)];p.push(...v);n.push(...v);if(i<rows&&j<cols){const k=i*(cols+1)+j;idx.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}}}return mesh(p,n,idx);}
  const ball=sphere();
  const identity=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  function multiply(a,b){const out=new Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];return out;}
  function transform(rx,ry,rz,s=1,xyz=[0,0,0]){const x=identity(),y=identity(),z=identity();x[5]=x[10]=Math.cos(rx);x[6]=Math.sin(rx);x[9]=-Math.sin(rx);y[0]=y[10]=Math.cos(ry);y[2]=-Math.sin(ry);y[8]=Math.sin(ry);z[0]=z[5]=Math.cos(rz);z[1]=Math.sin(rz);z[4]=-Math.sin(rz);const m=multiply(z,multiply(y,x));for(let i=0;i<12;i++)m[i]*=s;m[12]=xyz[0];m[13]=xyz[1];m[14]=xyz[2];return m;}
  function projection(aspect){const f=1/Math.tan(.63/2),near=.1,far=50,p=[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],view=identity();view[14]=-8.6;return multiply(p,view);}
  let accent=[.929,.690,.796],paused=matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true,dirty=true,time=0,last=0,frame=0;
  let dragX=0,dragY=0,targetX=0,targetY=0,hoverX=0,hoverY=0,pointer=null;
  function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));gl.viewport(0,0,canvas.width,canvas.height);dirty=true;wake();}
  function draw(mesh,model,glow=0){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.p);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.n);gl.enableVertexAttribArray(normal);gl.vertexAttribPointer(normal,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.i);gl.uniformMatrix4fv(loc.uModel,false,new Float32Array(model));gl.uniform1f(loc.uGlow,glow);gl.drawElements(gl.TRIANGLES,mesh.count,gl.UNSIGNED_SHORT,0);}
  function render(now){frame=0;if(document.hidden||!visible){last=0;return;}const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused)time+=dt;dragX+=(targetX-dragX)*.12;dragY+=(targetY-dragY)*.12;
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(loc.uViewProjection,false,new Float32Array(projection(canvas.width/canvas.height)));gl.uniform3fv(loc.uCamera,[0,0,8.6]);gl.uniform3fv(loc.uAccent,accent);
    const bob=paused?0:Math.sin(time*.7)*.06;
    draw(knot,transform(.36+dragY+hoverY,.25+time*.13+dragX+hoverX,-.31+Math.sin(time*.18)*.12,1,[0,bob,0]));
    draw(ring,transform(1.05,.22+time*.08,-.5),.7);draw(ring,transform(-.65,.72,-.35-time*.045),.5);
    const a=time*.26+.7;draw(ball,transform(0,time*.3,0,.105,[2.04*Math.cos(a),.9*Math.sin(a),1.4*Math.sin(a)]));draw(ball,transform(0,0,0,.055,[-1.8,1.28,.2]));draw(ball,transform(0,0,0,.075,[1.5,-1.45,.7]));
    dirty=false;if(!paused||Math.abs(targetX-dragX)+Math.abs(targetY-dragY)>.002)wake();
  }
  function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(pointer&&e.pointerId===pointer.id){targetX+=(e.clientX-pointer.x)*.009;targetY+=(e.clientY-pointer.y)*.009;pointer.x=e.clientX;pointer.y=e.clientY;wake();}else if(e.pointerType==='mouse'&&!paused){const r=canvas.getBoundingClientRect();hoverX=(e.clientX-r.left-r.width/2)/r.width*.18;hoverY=(e.clientY-r.top-r.height/2)/r.height*.12;}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>canvas.addEventListener(event,()=>{pointer=null;}));
  canvas.addEventListener('pointerleave',()=>{hoverX=hoverY=0;});
  canvas.addEventListener('dblclick',()=>{targetX=targetY=0;wake();});
  canvas.addEventListener('keydown',e=>{const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')targetX-=.18;if(e.key==='ArrowRight')targetX+=.18;if(e.key==='ArrowUp')targetY-=.18;if(e.key==='ArrowDown')targetY+=.18;if(e.key==='Home')targetX=targetY=0;wake();});
  document.addEventListener('themechange',e=>{accent=e.detail.rgb.map(v=>v/255);dirty=true;wake();});
  document.addEventListener('motionchange',e=>{paused=e.detail.paused;last=0;dirty=true;wake();});
  document.addEventListener('visibilitychange',()=>{last=0;if(!document.hidden)wake();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;last=0;}},{rootMargin:'150px'}).observe(shell);
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(shell);else window.addEventListener('resize',resize);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0;visible=false;fallback();});
  shell.classList.add('webgl-ready');resize();
})();
