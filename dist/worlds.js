import * as THREE from './vendor/three.module.js?v=rig4';
import {WORLDS} from './config.js?v=rig4';
export const STATIONS=[{id:'skills',x:-14,z:4,color:'#d5f49a'},{id:'experience',x:14,z:-12,color:'#9ccaff'},{id:'education',x:-14,z:-29,color:'#eab8e9'},{id:'projects',x:14,z:-45,color:'#ffc396'}];
export function buildWorld(scene,id,language='he'){
 const theme=WORLDS.find(w=>w.id===id)||WORLDS[0],root=new THREE.Group();scene.add(root);const colliders=[],animated=[],materials=new Map(),geometries=new Map();
 const material=(color,extra={})=>{const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.75,...extra}));return materials.get(key);};
 const unit=new THREE.BoxGeometry(1,1,1);geometries.set('box',unit);
 function box(x,y,z,w,h,d,color,extra={}){const mesh=new THREE.Mesh(unit,material(color,extra));mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;}
 function cylinder(x,y,z,r,h,color,top=r,n=16){const key=`c:${r}:${h}:${top}:${n}`;if(!geometries.has(key))geometries.set(key,new THREE.CylinderGeometry(top,r,h,n));const m=new THREE.Mesh(geometries.get(key),material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
 function ball(x,y,z,r,color,extra={},detail=2){const key=`s:${r}:${detail}`;if(!geometries.has(key))geometries.set(key,new THREE.IcosahedronGeometry(r,detail));const m=new THREE.Mesh(geometries.get(key),material(color,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
 const glow=(x,y,z,w,h,d,color)=>box(x,y,z,w,h,d,color,{emissive:color,emissiveIntensity:1.8,roughness:.35});
 const solid=(x,z,w,d,height=8)=>colliders.push({x,z,w:w/2+.45,d:d/2+.45,height});
 function sign(text,x,y,z,w,h,color=theme.color,bg='#1b2b39'){
  const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction=language==='he'?'rtl':'ltr';ctx.font=`600 ${Math.min(120,c.height*.5)}px Arial`;ctx.fillText(text,c.width/2,c.height/2,940);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));m.position.set(x,y,z);root.add(m);return m;
 }
 let seed=17;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const colors=id==='orbital'?{ground:'#5d6275',path:'#343f58',edge:'#a0a9bd'}:id==='sakura'?{ground:'#8d9d86',path:'#d8cbbd',edge:'#c2b5a9'}:id==='coastal'?{ground:'#d3c7a8',path:'#e3ddd0',edge:'#bba992'}:id==='alpine'?{ground:'#718b7f',path:'#b9b4a6',edge:'#8f978f'}:{ground:'#a2a5a7',path:'#4d5766',edge:'#c1c1bc'};
 scene.background=new THREE.Color(theme.sky);scene.fog=new THREE.FogExp2(theme.sky,id==='orbital'?.0025:.008);
 box(0,-1.1,-19,94,2,119,colors.ground);box(0,-2.25,-19,95,1,120,id==='orbital'?'#272c40':'#5e7278');
 box(0,.02,-19,11,.09,114,colors.path);for(const x of[-6.1,6.1])box(x,.12,-19,.25,.22,114,colors.edge);
 for(let z=-71;z<36;z+=3){if(id==='metropolis'){box(0,.08,z,.13,.012,1.4,'#e2d6ba');}else{box(0,.083,z,10.7,.015,.025,colors.edge);}}
 for(const s of STATIONS){box(s.x/2,.1,s.z+6,Math.abs(s.x)+8,.15,5.5,colors.path);box(s.x,.12,s.z+5,13,.18,10,colors.path);}
 // Distinct horizons: water, deep space or alpine terrain.
 if(id==='orbital'){
  const positions=[];for(let i=0;i<700;i++){const a=rand()*Math.PI*2,r=140+rand()*200,y=20+rand()*200;positions.push(Math.cos(a)*r,y,Math.sin(a)*r);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));root.add(new THREE.Points(geo,new THREE.PointsMaterial({color:'#dce8ff',size:.65,sizeAttenuation:true})));
  const earth=ball(-75,65,-165,30,'#679caf',{roughness:.85},4);for(let i=0;i<16;i++){const p=ball(-75+(rand()-.5)*40,65+(rand()-.5)*40,-139,3+rand()*5,'#9bc0b0',{},2);p.scale.set(1.6,.6,.08);}
  const glowMat=new THREE.MeshBasicMaterial({color:'#b2dbf6',transparent:true,opacity:.13,side:THREE.BackSide});const halo=new THREE.Mesh(new THREE.SphereGeometry(31.5,40,24),glowMat);halo.position.copy(earth.position);root.add(halo);
  for(let i=0;i<25;i++){const x=(rand()-.5)*90,z=(rand()-.5)*105-17;if(Math.abs(x)>28){const rock=ball(x,.4,z,.8+rand()*2,'#7c8091',{},0);rock.scale.y=.5;}}
 }else{
  const water=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),material(id==='coastal'?'#59bdbf':id==='sakura'?'#86a8a8':'#91adb9',{metalness:.3,roughness:.27}));water.rotation.x=-Math.PI/2;water.position.y=-2.9;root.add(water);
  if(id==='alpine')for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=Math.cos(a)*120,z=Math.sin(a)*120-30,h=40+rand()*55;cylinder(x,h/2-4,z,25+rand()*20,h,'#85959d',0,5);cylinder(x,h*.82-3,z,10,h*.36,'#e6e8e1',0,5);}
 }
 const he={skills:'כישורים',experience:'ניסיון',education:'השכלה',projects:'פרויקטים'},en={skills:'SKILLS',experience:'EXPERIENCE',education:'EDUCATION',projects:'PROJECTS'};
 const stations=[];
 for(const [i,s]of STATIONS.entries()){
  let h=7;
  if(id==='metropolis'){
   h=[8,16,9,11][i];box(s.x,h/2,s.z-2,10,h,8,'#567180',{metalness:.48,roughness:.27});solid(s.x,s.z-2,10,8,h);
   for(const dx of[-5,-2.5,0,2.5,5])box(s.x+dx,h/2,s.z+2.06,.15,h,.2,'#d5d1c9');for(let y=3;y<h;y+=3)box(s.x,y,s.z+2.1,10,.17,.24,'#c8c9c8');
   box(s.x,h+.2,s.z-2,10.8,.4,8.8,'#d3c8b9');glow(s.x,h+.42,s.z+2.3,10,.06,.08,s.color);box(s.x,1.45,s.z+2.22,2.4,2.9,.1,'#243e4d');
   if(i===1){box(s.x+1,h+2,s.z-2,5,4,5,'#8496a2');cylinder(s.x+1,h+6,s.z-2,.035,5,'#404d5a');}
  }else if(id==='sakura'){
   box(s.x,1.9,s.z-2,9,3.8,7,'#d9c5aa');solid(s.x,s.z-2,9,7,5);for(const dx of[-4.5,0,4.5])box(s.x+dx,2,s.z+1.6,.23,4,.23,'#6c4b45');
   for(const dx of[-3,-1.5,1.5,3])box(s.x+dx,2.1,s.z+1.58,1.1,2.5,.06,'#e9d7b6');
   box(s.x,4,s.z-2,10.3,.26,8.3,'#60484c');for(let j=0;j<5;j++)box(s.x,4.25+j*.23,s.z-2,10.8-j*1.2,.3,8.6-j*.85,'#6b535b');h=5.8;
   for(const dx of[-4,4]){cylinder(s.x+dx,2,s.z+3,.06,4,'#714d49');const lantern=ball(s.x+dx,3.2,s.z+3,.38,'#f3c7a0',{emissive:'#d97751',emissiveIntensity:.4},2);lantern.scale.y=1.2;}
  }else if(id==='orbital'){
   box(s.x,1.6,s.z-2,10,3.2,8,'#d1d4da');solid(s.x,s.z-2,10,8,7);const dome=new THREE.Mesh(new THREE.SphereGeometry(4.8,28,16,0,Math.PI*2,0,Math.PI/2),material('#7b9dbd',{metalness:.65,roughness:.2}));dome.position.set(s.x,3.1,s.z-2);root.add(dome);h=8;
   for(const dx of[-4.8,4.8])glow(s.x+dx,1.8,s.z+2.05,.09,3,.1,s.color);box(s.x,1.4,s.z+2.1,2.4,2.8,.13,'#243448');glow(s.x,2.85,s.z+2.2,2.5,.08,.1,s.color);
   for(const dx of[-6,6]){box(s.x+dx,2,s.z-2,1,4,1,'#7c879c');glow(s.x+dx,4.1,s.z-2,1,.1,1,s.color);}
  }else if(id==='coastal'){
   for(const dx of[-4.5,4.5])box(s.x+dx,2.4,s.z-2,.55,4.8,7,'#f0e9d8');box(s.x,4.9,s.z-2,10.8,.35,8.6,'#f0e9d8');box(s.x,2.25,s.z-5.25,9,4.5,.3,'#d2ddd8');box(s.x,2,s.z,7,3.6,.08,'#78aeb3',{transparent:true,opacity:.65,metalness:.35,roughness:.1});solid(s.x,s.z-2,10,7,5);h=5.2;
   for(let j=0;j<7;j++)box(s.x-4.4+j*1.5,5.5,s.z-2,.16,.7,8.5,'#b69d78');
  }else{
   box(s.x,1.9,s.z-2,9,3.8,7,'#9b7660');solid(s.x,s.z-2,9,7,7);for(let y=.5;y<3.8;y+=.35)box(s.x,y,s.z+1.55,9,.08,.09,'#715d51');
   for(const side of[-1,1]){const roof=box(s.x+side*2.65,4.8,s.z-2,5.9,.3,8.5,'#53656b');roof.rotation.z=side*-.55;}
   for(const dx of[-2.7,2.7])box(s.x+dx,2.1,s.z+1.6,1.7,1.6,.09,'#deb992',{emissive:'#eab572',emissiveIntensity:.28});h=6.6;
  }
  box(s.x,3.15,s.z+2.35,7.8,.9,.18,id==='coastal'?'#466c72':'#263946');sign((language==='he'?he:en)[s.id],s.x,3.15,s.z+2.46,7.3,.75,s.color);
  const target=new THREE.Vector3(s.x,.2,s.z+5.7);const ring=new THREE.Mesh(new THREE.RingGeometry(1.3,1.39,48),new THREE.MeshBasicMaterial({color:s.color,transparent:true,opacity:.9,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.copy(target);root.add(ring);animated.push({mesh:ring,type:'ring'});
  const beam=box(s.x,.55,s.z+5.7,.4,.7,.4,s.color,{emissive:s.color,emissiveIntensity:.7});beam.visible=false;
  stations.push({...s,target,anchor:new THREE.Vector3(s.x,4.8,s.z+3.5),height:h});
 }
 // Shared landscaping, with a different silhouette in each destination.
 function tree(x,z){
  if(id==='orbital'){cylinder(x,1.2,z,.09,2.4,'#bac1cf');glow(x,2.4,z,.4,.13,.4,'#9cdef5');return;}
  cylinder(x,1.4,z,.11,2.8,id==='sakura'?'#7f5b55':'#8c7d67',.07,9);
  if(id==='sakura'){for(const [dx,y,dz,r]of [[0,3.5,0,1.2],[-.8,3.1,0,.85],[.7,3.3,.3,.9],[0,3.1,-.7,.85]])ball(x+dx,y,z+dz,r,['#e8bac6','#efc3d0','#db9bb3'][Math.floor(rand()*3)],{},1);}
  else if(id==='coastal'){const trunk=cylinder(x,2,z,.15,4,'#a38d72',.1,8);trunk.rotation.z=.09;for(let a=0;a<6;a++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.46,3,5),material('#669d84'));leaf.position.set(x+Math.cos(a)*.9,4,z+Math.sin(a)*.9);leaf.rotation.z=Math.cos(a)*.95;leaf.rotation.x=Math.sin(a)*.95;root.add(leaf);}}
  else if(id==='alpine'){for(let j=0;j<3;j++)cylinder(x,2.3+j*.75,z,1.25-j*.25,2.3,'#4c7a69',0,9);}
  else{for(const [y,r]of [[2.7,1],[3.7,.7]])ball(x,y,z,r,'#699785',{},1);}
 }
 for(const x of[-7.8,7.8])for(let z=-67;z<32;z+=11){tree(x,z);solid(x,z,.8,.8,4);}
 for(const x of[-5.8,5.8])for(let z=-66;z<32;z+=17){cylinder(x,2.1,z,.05,4.2,id==='sakura'?'#725854':'#4d5e6b',.05,8);glow(x,4.15,z,.4,.1,.4,id==='orbital'?'#a3dff9':'#ffe6bb');}
 if(id==='metropolis'){
  for(const x of[-34,34])for(let z=-67;z<35;z+=17){const h=13+rand()*23;box(x,h/2,z,11,h,11,'#8896a5');box(x,h+.2,z,11.5,.4,11.5,'#c4c2bb');solid(x,z,11,11,h);for(let y=3;y<h;y+=3.3){box(x,y,z+5.6,10,.12,.08,'#cfdbdf');for(let dx=-4;dx<=4;dx+=2)box(x+dx,y+1,z+5.57,1.1,1.5,.07,'#405e71',{metalness:.4,roughness:.25});}}
  for(let x=-44;x<=44;x+=14){const h=25+rand()*40;box(x,h/2,-90,10,h,12,'#8897ac');for(let y=5;y<h;y+=4)box(x,y,-83.9,9,.13,.08,'#c2d0df');}
 }else if(id==='sakura'){
  for(const x of[-34,34])for(let z=-70;z<34;z+=10)tree(x,z);
  for(const x of[-5,5])cylinder(x,3.6,-69,.27,7.2,'#a35f56');box(0,7.2,-69,13,.6,1,'#a35f56');box(0,7.75,-69,14,.22,1.4,'#5e434e');box(0,5.8,-69,11,.2,.45,'#9f5c55');
 }else if(id==='orbital'){
  for(const x of[-35,35])for(let z=-65;z<32;z+=18){box(x,1,z,7,2,7,'#535f75');for(let i=0;i<3;i++){const panel=box(x-3+i*3,3,z,2.6,.1,7,'#375b84',{metalness:.6,roughness:.25});panel.rotation.z=x<0?.2:-.2;}}
 }else if(id==='coastal'){
  for(const x of[-33,33])for(let z=-65;z<32;z+=17){tree(x,z);const umbrella=new THREE.Mesh(new THREE.ConeGeometry(2.2,.7,10),material('#eeeee3'));umbrella.position.set(x-4,2.6,z);root.add(umbrella);cylinder(x-4,1.4,z,.045,2.6,'#a19682');box(x-3.5,.45,z+2,.9,.2,2.5,'#e0d4bb');}
 }else{for(const x of[-33,33,-43,43])for(let z=-65;z<34;z+=12)tree(x+rand()*2,z);}
 // A sculptural focal point at the far end.
 cylinder(0,.35,-61,3.2,.7,colors.edge,3.2,40);const sculpture=new THREE.Group();sculpture.position.set(0,3,-61);root.add(sculpture);for(let i=0;i<3;i++){const mesh=new THREE.Mesh(new THREE.TorusGeometry(1.9,.08,10,64),material(theme.color,{metalness:.6,roughness:.3}));mesh.rotation.set(i*.9,i*.9,0);sculpture.add(mesh);}animated.push({mesh:sculpture,type:'rotate'});solid(0,-61,6,6,5);
 if(id==='sakura'){
  const arr=[];for(let i=0;i<130;i++)arr.push((rand()-.5)*70,3+rand()*12,(rand()-.5)*100-20);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));const petals=new THREE.Points(geo,new THREE.PointsMaterial({color:'#ffe0ea',size:.08,transparent:true,opacity:.75}));root.add(petals);animated.push({mesh:petals,type:'petals'});
 }
 return {root,theme,colliders,stations,animate(t){for(const a of animated){if(a.type==='rotate')a.mesh.rotation.y=t*.16;else if(a.type==='ring')a.mesh.scale.setScalar(1+Math.sin(t*2)*.04);else if(a.type==='petals'){a.mesh.position.x=Math.sin(t*.15)*1.5;a.mesh.position.y=-((t*.15)%3);}}}};
}
