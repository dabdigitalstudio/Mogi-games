import * as THREE from './vendor/three.module.js';
import {data} from './resume.js';
const $=s=>document.querySelector(s),canvas=$('#scene'),dialog=$('#details'),keys=new Set(),visited=new Set();
let nearby=null,returnFocus=null;
function updateProgress(){ $('#count').textContent=`${visited.size} / 4`;$('#progress').style.width=`${visited.size*25}%`;for(const id of visited){const b=$(`[data-section="${id}"]`);b.classList.add('visited');b.querySelector('.check').textContent='✓';}if(visited.size===4)toast('District explored. Thanks for getting to know my work.'); }
function showDialog(){keys.clear();returnFocus=document.activeElement;dialog.showModal();dialog.scrollTop=0;$('#closeDialog').focus();}
function openSection(id){const d=data[id];visited.add(id);$('#dialogEyebrow').textContent=d.label;$('#dialogContent').innerHTML=`<h2>${d.title}</h2><p class="content-intro">${d.intro}</p>${d.body}`;showDialog();updateProgress();}
function closeDialog(){dialog.close();keys.clear();(returnFocus?.isConnected?returnFocus:canvas).focus();}
$('#closeDialog').onclick=closeDialog;$('#backToMap').onclick=closeDialog;dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog()});
function resume(){$('#dialogEyebrow').textContent='PLAYER ONE / COMPLETE RÉSUMÉ';$('#dialogContent').innerHTML=`<h2>Alex Morgan</h2><p class="content-intro">AI Full Stack Developer · Fictional sample profile<br>Building thoughtful web products with applied AI.</p>`+Object.values(data).map(d=>`<section class="content-block"><h2>${d.title}</h2><p>${d.intro}</p>${d.body}</section>`).join('');showDialog();}
$('#readResume').onclick=resume;$('#fallbackResume').onclick=resume;
document.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>openSection(b.dataset.section));$('#explore').onclick=()=>nearby&&openSection(nearby.id);
let toastTimeout;function toast(text){$('#toast').textContent=text;$('#toast').classList.remove('fade');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('#toast').classList.add('fade'),6500);}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch(e){$('#loading').classList.add('done');$('#error').hidden=false;console.error(e);}
if(renderer)start();
function start(){
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
const scene=new THREE.Scene();scene.background=new THREE.Color('#aca6bb');scene.fog=new THREE.FogExp2('#b2a8bd',.0075);const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,450);
scene.add(new THREE.HemisphereLight('#cadcff','#625663',2.1));const sun=new THREE.DirectionalLight('#ffd6ad',3.5);sun.position.set(-40,65,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:180});sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;scene.add(sun);scene.add(sun.target);sun.target.position.set(0,0,-15);
const fill=new THREE.DirectionalLight('#a7c3ff',1.1);fill.position.set(45,20,-40);scene.add(fill);
const mats={};function mat(color,opts={}){const key=color+JSON.stringify(opts);return mats[key]??=new THREE.MeshStandardMaterial({color,roughness:.7,...opts});}
const boxGeo=new THREE.BoxGeometry(1,1,1);function box(x,y,z,w,h,d,color,parent=scene,opts={}){const o=new THREE.Mesh(boxGeo,mat(color,opts));o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cyl(x,y,z,r,h,color,parent=scene,r2=r,sides=12){const o=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,h,sides),mat(color));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function glow(x,y,z,w,h,d,color,parent=scene){return box(x,y,z,w,h,d,color,parent,{emissive:color,emissiveIntensity:2,roughness:.25});}
const colliders=[];function solid(x,z,w,d){colliders.push({x,z,w:w/2+.48,d:d/2+.48});}
function sign(text,width,height,color='#d3ff69',bg='#10242e',font=75){let c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*height/width);const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`600 ${font}px Arial`;ctx.fillText(text,c.width/2,c.height/2);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));}
// Ground, boulevard and traversable pedestrian spaces.
box(0,-1.1,-20,154,2,164,'#58616f');box(0,-2.8,-20,160,1.4,170,'#33495b');
const water=new THREE.Mesh(new THREE.PlaneGeometry(2200,2200),mat('#8ba7b9',{metalness:.45,roughness:.3}));water.rotation.x=-Math.PI/2;water.position.y=-3.5;scene.add(water);
box(0,.02,-20,13,.08,151,'#424856');box(0,.06,-20,1,.035,148,'#666575');
for(let z=-88;z<53;z+=6){box(-.2,.108,z,.12,.02,2.5,'#e9d4a3');box(.2,.108,z,.12,.02,2.5,'#e9d4a3');}
for(const x of[-10,10]){box(x,.12,-20,7,.22,151,'#a7a0a0');box(x+(x<0?3.55:-3.55),.15,-20,.18,.28,151,'#d1c2b4');}
for(let z=-85;z<55;z+=3)for(const x of[-10,10])box(x,.24,z,6.8,.008,.018,'#82848e');
for(const z of[15,-14,-46]){for(let x=-5.7;x<=5.7;x+=1.45)box(x,.11,z,.8,.025,3,'#ddd7ce');box(0,.11,z+2.7,12,.02,.18,'#b9bab7');}
box(0,.1,29,27,.15,13,'#9b99a1');for(let x=-12;x<=12;x+=3)box(x,.185,29,.025,.005,12,'#bfb7b6');
for(const x of[-14.5,14.5])box(x,.22,-20,2.1,.4,145,'#677d74');
// The four résumé landmarks.
const defs=[{id:'skills',x:-25,z:-2,color:'#cefa80',name:'INNOVATION LAB',height:9},{id:'experience',x:25,z:-19,color:'#91bfff',name:'NORTHSTAR',height:19},{id:'education',x:-25,z:-42,color:'#edb0e3',name:'LEARNING CAMPUS',height:11},{id:'projects',x:25,z:-58,color:'#ffb67c',name:'THE LAUNCHPAD',height:13}];
const rings=[];
for(const [i,s]of defs.entries()){
 const side=s.x<0?-1:1;box(s.x,.1,s.z+9,21,.2,11,'#b3aaa6');solid(s.x,s.z,16,12);box(s.x,s.height/2,s.z,16,s.height,12,'#c6c0bd');box(s.x,s.height/2,s.z+.1,15.2,s.height-.5,12.1,'#3d5a68',{add:o=>scene.add(o)},{metalness:.5,roughness:.25});
 for(const xx of[-7.7,-3.9,0,3.9,7.7])box(s.x+xx,s.height/2,s.z+6.25,.32,s.height, .55,'#c7c2bd');
 for(let y=3;y<s.height;y+=3)box(s.x,y,s.z+6.3,16,.25,.6,'#bfc0bd');
 box(s.x,s.height+.3,s.z,17,.6,13,'#ded0be');glow(s.x,s.height+.65,s.z+6.5,16,.11,.12,s.color);
 box(s.x,1.75,s.z+6.48,3.3,3.5,.18,'#172e3b',{add:o=>scene.add(o)},{metalness:.45,roughness:.15});for(const dx of[-1.8,1.8])glow(s.x+dx,1.8,s.z+6.65,.08,3.6,.1,s.color);glow(s.x,3.6,s.z+6.65,3.7,.08,.1,s.color);
 box(s.x,5,s.z+6.7,12,1.65,.3,'#162635');const title=sign(data[s.id].title.toUpperCase(),11,1.3,s.color);title.position.set(s.x,5,s.z+6.87);scene.add(title);
 const sub=sign(s.name,9,.75,'#eeeeed','#263844',50);sub.position.set(s.x,s.height-1.2,s.z+6.4);scene.add(sub);
 box(s.x,3.8,s.z+8.1,8,.23,3.8,'#394c57');glow(s.x,3.65,s.z+9.9,7.7,.06,.06,s.color);
 s.target=new THREE.Vector3(s.x,.24,s.z+10.6);const ring=new THREE.Mesh(new THREE.RingGeometry(1.6,1.73,64),new THREE.MeshBasicMaterial({color:s.color,transparent:true,opacity:.9,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.copy(s.target);ring.position.y=.25;scene.add(ring);rings.push(ring);
 const label=document.createElement('div');label.className='world-label';label.innerHTML=`<span style="border-color:${s.color}">${String(i+1).padStart(2,'0')} / ${data[s.id].title.toUpperCase()}</span><small></small>`;$('#labels').appendChild(label);s.label=label;s.anchor=new THREE.Vector3(s.x,7,s.z+9.7);
 for(const dx of[-6.5,6.5]){box(s.x+dx,.45,s.z+10.6,1.8,.8,1.8,'#435359');cyl(s.x+dx,1.2,s.z+10.6,.7,1.4,'#5d8275',scene,.9,7);}
 if(s.id==='experience'){box(s.x+2,s.height+4,s.z-1,8,8,8,'#6f8194');box(s.x+2,s.height+8.2,s.z-1,8.7,.4,8.7,'#c7bdb7');cyl(s.x+2,s.height+12,s.z-1,.06,8,'#3f4f61');glow(s.x+2,s.height+16,s.z-1,.18,.18,.18,s.color);}
 if(s.id==='projects'){for(let j=0;j<3;j++)box(s.x-4+j*4,s.height+.8,s.z-1,3,.18,5,'#334f67').rotation.x=.22;}
 if(s.id==='skills'){const hoop=new THREE.Mesh(new THREE.TorusGeometry(2.3,.13,8,48),mat(s.color,{emissive:s.color,emissiveIntensity:.65}));hoop.position.set(s.x,s.height+3.2,s.z);scene.add(hoop);rings.push(hoop);}
 if(s.id==='education'){box(s.x,s.height+1.6,s.z,8,2.5,8,'#ddd2c5');box(s.x,s.height+3,s.z,9,.4,9,'#b7adab');}
}
// Neighbourhood skyline. Repeated geometry keeps the scene light.
let seed=77;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
for(const x of[-54,54])for(let z=-80;z<55;z+=22){const h=13+rand()*30,w=12+rand()*6,d=12+rand()*5;box(x,h/2,z,w,h,d,['#8a8d9e','#748595','#b0a7b0'][Math.floor(rand()*3)]);solid(x,z,w,d);box(x,h+.3,z,w+1,.6,d+1,'#b7b1b3');for(let y=3;y<h-1;y+=3.4){glow(x,y,z+d/2+.02,w-.8,.12,.05,'#b7d9e8');for(let dx=-w/2+1;dx<w/2;dx+=2.5)box(x+dx,y+1,z+d/2+.04,1.3,1.7,.07,rand()>.4?'#456074':'#dac6a8',scene,{emissive:rand()>.6?'#d9a783':'#132b42',emissiveIntensity:.3,metalness:.45,roughness:.3});}box(x+2,h+1.2,z-1,3,2,3,'#4a5c6a');}
for(let x=-68;x<=68;x+=17){const h=25+rand()*50;box(x,h/2,-109,12,h,14,'#737c94');for(let y=4;y<h;y+=4)box(x,y,-101.9,10,.18,.1,'#bac5d7',scene,{emissive:'#8aabc9',emissiveIntensity:.4});}
// Street furniture and greenery.
function tree(x,z,scale=1){box(x,.35,z,2.7,.6,2.7,'#879297');cyl(x,1.6*scale,z,.16,3.2*scale,'#776967',scene,.13,6);for(const [y,r]of[[3,1.25],[4,1],[4.8,.6]]){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(r*scale,0),mat(y===3?'#4d8177':'#6d9a85'));crown.position.set(x,y*scale,z);crown.castShadow=true;scene.add(crown);}solid(x,z,1.2,1.2);}
for(let z=-80;z<=45;z+=13){tree(-14.8,z,.8+rand()*.3);tree(14.8,z,.8+rand()*.3);}
for(const x of[-7.5,7.5])for(let z=-80;z<=45;z+=17){cyl(x,2.6,z,.065,5.2,'#354657',scene,.07,6);box(x+(x<0?.6:-.6),5.2,z,1.4,.13,.2,'#354657');glow(x+(x<0?1.1:-1.1),5.14,z,.5,.09,.24,'#ffe6bd');}
for(let z=-65;z<=40;z+=21)for(const x of[-11.7,11.7]){box(x,.75,z,1.25,.18,2.6,'#6c6161');box(x+(x<0?-.5:.5),1.1,z,.13,.8,2.6,'#73696b');for(const zz of[-.9,.9])box(x,.4,z+zz,.15,.7,.15,'#354653');solid(x,z,1.2,2.6);}
// A civic sculpture is a visible destination at the far end of the road.
cyl(0,.6,-80,5,1.1,'#aba8ac',scene,5,48);const sculpture=new THREE.Group();sculpture.position.set(0,5,-80);scene.add(sculpture);for(let i=0;i<3;i++){const o=new THREE.Mesh(new THREE.TorusGeometry(2.6,.13,12,80),mat('#edcaa5',{metalness:.8,roughness:.25}));o.rotation.set(i*.9,i*1.1,0);o.castShadow=true;sculpture.add(o);}solid(0,-80,10,10);
const welcome=sign('BUILD SOMETHING THAT MATTERS.',22,2,'#e7e0d5','#374858',57);welcome.position.set(0,10,-85);scene.add(welcome);for(const x of[-11,11])box(x,5,-85,.2,10,.2,'#394959');
// Third-person player, facing -Z. Articulated limbs animate from movement.
const avatar=new THREE.Group();avatar.position.set(0,0,25);scene.add(avatar);const body=new THREE.Group();avatar.add(body);
function capsule(x,y,z,r,len,color,parent,sx=1,sz=1){const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,5,10),mat(color));m.position.set(x,y,z);m.scale.set(sx,1,sz);m.castShadow=true;parent.add(m);return m;}
capsule(0,1.48,0,.33,.36,'#cbe886',body,1.12,.72);capsule(0,1.94,.05,.23,.05,'#b1ca79',body,1,.8);
const head=new THREE.Mesh(new THREE.SphereGeometry(.245,12,10),mat('#c89e87'));head.position.set(0,2.23,-.025);head.scale.set(.88,1.15,.9);body.add(head);box(0,2.41,.01,.45,.15,.41,'#292e3c',body);box(0,2.28,.16,.43,.27,.1,'#292e3c',body);
box(0,1.52,.29,.48,.63,.22,'#314550',body);box(0,1.59,.412,.3,.13,.02,'#d1e7a0',body);box(-.25,1.58,.18,.055,.8,.045,'#344650',body);box(.25,1.58,.18,.055,.8,.045,'#344650',body);
const limbs={};for(const side of[-1,1]){const arm=new THREE.Group();arm.position.set(side*.45,1.83,0);body.add(arm);capsule(0,-.31,0,.135,.4,'#bedb7e',arm);box(0,-.7,-.005,.18,.21,.18,'#c89e87',arm);limbs[side<0?'la':'ra']=arm;const leg=new THREE.Group();leg.position.set(side*.19,1.02,0);body.add(leg);capsule(0,-.36,0,.145,.48,'#27384a',leg);box(0,-.8,-.11,.31,.19,.5,'#eee7dc',leg);box(0,-.91,-.11,.32,.055,.51,'#566677',leg);limbs[side<0?'ll':'rl']=leg;}
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,28),new THREE.MeshBasicMaterial({color:'#273748',transparent:true,opacity:.2,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.18;scene.add(shadow);
let yaw=0,jump=0,vy=0,walkTime=0,previous=performance.now(),time=0;const camTarget=new THREE.Vector3(),camDesired=new THREE.Vector3(),look=new THREE.Vector3();camera.position.set(0,4.3,32.3);
const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',ShiftLeft:'run',ShiftRight:'run'};
function doJump(){if(!dialog.open&&jump===0)vy=6.4;}
window.addEventListener('keydown',e=>{if(dialog.open||e.metaKey||e.ctrlKey||e.altKey)return;if(keyMap[e.code]){const dir=keyMap[e.code];if(!keys.has(dir)){const step=dir==='forward'?.12:dir==='back'?-.12:0;const nx=avatar.position.x-Math.sin(yaw)*step,nz=avatar.position.z-Math.cos(yaw)*step;if(!blocked(nx,nz)){avatar.position.x=nx;avatar.position.z=nz;}if(dir==='left')yaw+=.035;if(dir==='right')yaw-=.035;}keys.add(dir);e.preventDefault();}if(e.code==='Space'){e.preventDefault();if(!e.repeat)doJump();}if(e.code==='KeyE'&&!e.repeat&&nearby){e.preventDefault();openSection(nearby.id);}});window.addEventListener('keyup',e=>keys.delete(keyMap[e.code]));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();previous=performance.now()});
let dragging=false,lastX=0;canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);canvas.focus();});canvas.addEventListener('pointermove',e=>{if(dragging&&!dialog.open){yaw-=(e.clientX-lastX)*.005;lastX=e.clientX;}});for(const name of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>dragging=false);
document.querySelectorAll('[data-dir]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.dir)});for(const name of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys.delete(b.dataset.dir));});$('#mobileJump').onclick=doJump;
$('#reset').onclick=()=>{avatar.position.set(0,0,25);yaw=0;jump=0;vy=0;keys.clear();camera.position.set(0,4.3,32.3);toast('Back at Morgan Square. Your discoveries are saved for this visit.');canvas.focus()};
function blocked(x,z){return x<-68||x>68||z<-91||z>49||colliders.some(c=>Math.abs(x-c.x)<c.w&&Math.abs(z-c.z)<c.d)}
const mini=$('#mini').getContext('2d');function minimap(){mini.clearRect(0,0,220,220);mini.fillStyle='#213d4b';mini.fillRect(0,0,220,220);mini.strokeStyle='#65757d';mini.lineWidth=22;mini.beginPath();mini.moveTo(110,15);mini.lineTo(110,210);mini.stroke();mini.lineWidth=1;mini.strokeStyle='#97a595';mini.setLineDash([3,7]);mini.beginPath();mini.moveTo(110,15);mini.lineTo(110,210);mini.stroke();mini.setLineDash([]);const px=x=>110+x*1.8,pz=z=>160+z*1.8;for(const s of defs){mini.fillStyle=s.color;mini.fillRect(px(s.x)-6,pz(s.z)-6,12,12);if(visited.has(s.id)){mini.fillStyle='#163144';mini.fillRect(px(s.x)-2,pz(s.z)-2,4,4)}}mini.save();mini.translate(px(avatar.position.x),pz(avatar.position.z));mini.rotate(-yaw);mini.fillStyle='#fff';mini.beginPath();mini.moveTo(0,-7);mini.lineTo(5,5);mini.lineTo(0,3);mini.lineTo(-5,5);mini.fill();mini.restore();}
const projector=new THREE.Vector3();function labels(){for(const s of defs){let dist=avatar.position.distanceTo(s.target);projector.copy(s.anchor).project(camera);const screenX=(projector.x*.5+.5)*innerWidth,screenY=(-projector.y*.5+.5)*innerHeight;let visible=projector.z<1&&projector.z>0&&screenX>70&&screenX<innerWidth-70&&screenY>170&&screenY<innerHeight-130&&dist<75&&!(screenX<290&&screenY<550);s.label.style.display=visible?'block':'none';if(visible){s.label.style.left=`${(projector.x*.5+.5)*innerWidth}px`;s.label.style.top=`${(-projector.y*.5+.5)*innerHeight}px`;s.label.style.opacity=String(Math.min(1,(95-dist)/35));s.label.querySelector('small').textContent=`${Math.round(dist)} m`;}}}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}window.addEventListener('resize',resize);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#error').hidden=false;keys.clear()});
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.04);previous=now;time+=dt;if(!dialog.open){const turning=Number(keys.has('left'))-Number(keys.has('right'));yaw+=turning*1.9*dt;const forward=Number(keys.has('forward'))-Number(keys.has('back')),speed=keys.has('run')?10:5;let nx=avatar.position.x-Math.sin(yaw)*forward*speed*dt,nz=avatar.position.z-Math.cos(yaw)*forward*speed*dt;if(!blocked(nx,avatar.position.z))avatar.position.x=nx;if(!blocked(avatar.position.x,nz))avatar.position.z=nz;avatar.rotation.y=yaw;if(vy||jump>0){vy-=16*dt;jump=Math.max(0,jump+vy*dt);if(jump===0)vy=0;}avatar.position.y=jump+.12;walkTime+=dt*(keys.has('run')?13:8);const stride=forward?Math.sin(walkTime)*.6:0;for(const [name,sign]of[['la',1],['ra',-1],['ll',-1],['rl',1]])limbs[name].rotation.x=THREE.MathUtils.lerp(limbs[name].rotation.x,stride*sign,Math.min(1,dt*15));body.position.y=forward?Math.abs(Math.sin(walkTime))* .035:Math.sin(time*2)*.012;camDesired.set(avatar.position.x+Math.sin(yaw)*7.5,avatar.position.y+4,avatar.position.z+Math.cos(yaw)*7.5);camera.position.lerp(camDesired,1-Math.exp(-dt*7));look.set(avatar.position.x-Math.sin(yaw)*3,avatar.position.y+1.65,avatar.position.z-Math.cos(yaw)*3);camTarget.lerp(look,1-Math.exp(-dt*12));camera.lookAt(camTarget);}
 shadow.position.set(avatar.position.x,.2,avatar.position.z);shadow.material.opacity=.2/(1+jump);nearby=defs.find(s=>avatar.position.distanceTo(s.target)<4.3)||null;$('#interaction').hidden=!nearby;if(nearby){$('#nearTitle').textContent=data[nearby.id].title;$('#location').innerHTML=`${nearby.name}<small>PRESS E TO DISCOVER</small>`;}else{$('#location').innerHTML=`${avatar.position.z<0?'INNOVATION AVENUE':'MORGAN SQUARE'}<small>PORTFOLIO CITY · GOLDEN HOUR</small>`;}
 for(const r of rings){if(r.geometry.type==='TorusGeometry'){r.rotation.y=time*.4;}else{const scale=1+Math.sin(time*2)*.055;r.scale.setScalar(scale);}}sculpture.rotation.y=time*.15;minimap();labels();renderer.render(scene,camera);
}
camTarget.set(0,1.65,22);camera.lookAt(camTarget);renderer.render(scene,camera);$('#loading').classList.add('done');setTimeout(()=>$('#loading').hidden=true,700);toast('Welcome to the district. WASD to move · Drag to look · E to explore.');requestAnimationFrame(frame);
}
