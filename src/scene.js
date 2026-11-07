import * as THREE from 'three';
export function startScene(){
 const canvas=document.querySelector('#universe');
 let renderer;
 try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});}catch{return ()=>{};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,100);
 camera.position.z=12;
 const group=new THREE.Group();scene.add(group);
 // A real 3D, folded parametric surface inspired by Calabi–Yau visualizations.
 // It is a decorative surface, not an exact six-dimensional manifold.
 const vertices=[],colors=[],indices=[],n=160,m=100;
 for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){
  const u=i/n*Math.PI*2,v=j/m*Math.PI*2;
  const r=1.1+.43*Math.cos(3*u+v);
  vertices.push(r*Math.cos(2*u),r*Math.sin(2*u),.72*Math.sin(3*u+v)+.4*Math.cos(v));
  const c=new THREE.Color().setHSL(.74+.04*Math.sin(v),.55,.48+.36*(.5+.5*Math.sin(u+v)));
  colors.push(c.r,c.g,c.b);
  if(i<n&&j<m){const a=i*(m+1)+j,b=a+m+1;indices.push(a,b,a+1,b,b+1,a+1);}
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshPhysicalMaterial({vertexColors:true,metalness:.45,roughness:.24,side:THREE.DoubleSide,clearcoat:1}));group.add(mesh);
 const wire=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xe6caff,wireframe:true,transparent:true,opacity:.055}));group.add(wire);
 scene.add(new THREE.AmbientLight(0xc7a2ff,2));const key=new THREE.PointLight(0xffffff,70);key.position.set(2,3,5);scene.add(key);const rim=new THREE.PointLight(0x873aff,70);rim.position.set(-3,-1,2);scene.add(rim);
 const points=[],paths=[];
 for(let i=0;i<180;i++){const x=(Math.random()-.5)*20,y=(Math.random()-.5)*14,z=-3-Math.random()*5;points.push(x,y,z);if(i%9===0)paths.push(x,y,z,0,0,0);}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xc0a4ed,size:.025,transparent:true,opacity:.65})));
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(paths,3));const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x9671cd,transparent:true,opacity:.11}));scene.add(lines);
 const tracerGeometry=new THREE.BufferGeometry();const tracerPositions=new Float32Array(paths.length/2);tracerGeometry.setAttribute('position',new THREE.BufferAttribute(tracerPositions,3));scene.add(new THREE.Points(tracerGeometry,new THREE.PointsMaterial({color:0xe9d7ff,size:.05})));
 function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();const rect=document.querySelector('.sculpture-space').getBoundingClientRect();const h=2*12*Math.tan(20*Math.PI/180);group.position.y=(.5-(rect.top+rect.height/2)/innerHeight)*h;const scale=Math.min(rect.height/innerHeight*h/3.4,1);group.scale.setScalar(scale);lines.position.y=group.position.y;}
 addEventListener('resize',resize);addEventListener('scroll',resize,{passive:true});resize();
 let active=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 renderer.setAnimationLoop(t=>{if(document.hidden)return;const time=t*.001;if(!reduced){group.rotation.set(.4+Math.sin(time*.2)*.2,time*.16,.25);mesh.scale.setScalar(1+Math.sin(time*(active?5:1.2))*(active?.045:.009));for(let i=0;i<paths.length/6;i++){const f=(time*.16+i*.137)%1;tracerPositions[i*3]=paths[i*6]*(1-f);tracerPositions[i*3+1]=paths[i*6+1]*(1-f)+group.position.y;tracerPositions[i*3+2]=paths[i*6+2]*(1-f);}tracerGeometry.attributes.position.needsUpdate=true;}renderer.render(scene,camera);});
 return value=>{active=value;};
}
