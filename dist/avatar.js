import * as THREE from './vendor/three.module.js?v=rig4';
import {GLTFLoader} from './vendor/GLTFLoader.js?v=rig4';
import {clone as cloneSkeleton} from './vendor/utils/SkeletonUtils.js?v=rig4';
const templates=new Map();
const rendererAnisotropy=8;
import {PRESETS} from './config.js?v=rig21';
export function avatarAssetKey(c){return PRESETS.find(p=>p.asset===c.asset)?.asset||PRESETS[0].asset;}
async function template(key){if(!templates.has(key))templates.set(key,(async()=>{const embedded=document.querySelector('#avatar-assets');const data=embedded?JSON.parse(embedded.textContent)[key]:null;let bytes;if(data)bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)).buffer;else{const response=await fetch(new URL('assets/'+key+'.glb?v=4',document.baseURI));if(!response.ok)throw Error('Character asset unavailable');bytes=await response.arrayBuffer();}const gltf=await new GLTFLoader().parseAsync(bytes,'');gltf.scene.animations=gltf.animations;return gltf.scene;})().catch(e=>{templates.delete(key);throw e;}));return templates.get(key);}
export function createAvatar(config){return createLicensedAvatar(config);}
function createLicensedAvatar(config){
 const group=new THREE.Group();let mixer,active,actions={};
 const ready=template(avatarAssetKey(config)).then(source=>{
  if(group.userData.disposed)return;
  const rig=cloneSkeleton(source);group.add(rig);
  rig.traverse(o=>{if(o.isMesh){o.visible=/^(Barbarian|Knight|Mage|Rogue|Skeleton)_/.test(o.name);if(config.originalGear===false&&/_(Hat|Helmet|Hood|Cape|Cloak)$/.test(o.name))o.visible=false;o.geometry=o.geometry.clone();o.material=o.material.clone();for(const [key,value] of Object.entries(o.material))if(value?.isTexture){o.material[key]=value.clone();o.material[key].anisotropy=8;}o.castShadow=true;o.receiveShadow=true;}});
  const bounds=new THREE.Box3().setFromObject(rig);const size=bounds.getSize(new THREE.Vector3());const scale=2.45/size.y;rig.scale.multiplyScalar(scale);rig.position.y=-bounds.min.y*scale;rig.rotation.y=Math.PI;
  mixer=new THREE.AnimationMixer(rig);
  for(const [state,name] of Object.entries({idle:'Idle',walk:'Walking_A',run:'Running_A',jump:'Jump_Idle'})){const clip=source.animations.find(c=>c.name===name);if(clip)actions[state]=mixer.clipAction(clip);}
  active=actions.idle;active?.play();mixer.update(0);return rig;
 });
 return {group,ready,animate(t,moving,running,jump,dt){if(!mixer)return;const next=actions[jump>.05?'jump':moving?(running?'run':'walk'):'idle']||actions.idle;if(next!==active){next.reset().play();if(active)next.crossFadeFrom(active,.18,true);active=next;}mixer.update(Math.min(dt||.016,.05));}};
}
