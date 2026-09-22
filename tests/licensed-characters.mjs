import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PRESETS,DEFAULT_CONFIG,normalizeConfig} from '../dist/config.js';
import {exportAssets,standaloneHtml} from '../dist/export.js';
globalThis.fetch=async url=>{try{const data=await fs.readFile(url);return {ok:true,text:async()=>data.toString(),arrayBuffer:async()=>data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)};}catch{return {ok:false};}};
for(const preset of PRESETS.filter(p=>p.asset)){
 const config=normalizeConfig({...DEFAULT_CONFIG,avatar:preset});assert.equal(config.avatar.asset,preset.asset);
 const bytes=await fs.readFile(new URL('../dist/assets/'+preset.asset+'.glb',import.meta.url));assert.equal(bytes.readUInt32LE(0),0x46546c67);
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));assert(gltf.skins.length);for(const name of ['Idle','Walking_A','Running_A','Jump_Idle'])assert(gltf.animations.some(a=>a.name===name));assert(gltf.buffers.every(b=>!b.uri));assert(gltf.images.every(i=>i.bufferView!==undefined));
 const [js,css,license,characters,assets]=await exportAssets(preset.asset);assert.deepEqual(Object.keys(assets),[preset.asset]);assert(Buffer.from(assets[preset.asset],'base64').equals(bytes));assert(characters.includes('CC0'));assert(!characters.includes('QUATERNIUS'));assert(!characters.includes('AVATAR SDK'));const html=standaloneHtml(config,js,css,assets);assert(html.includes('id="avatar-assets"'));assert(html.includes(preset.asset));
}
for(const asset of ['human-male','human-female','human-male-jacket','human-male-longsleeve','human-female-hoodie']){
 const bytes=await fs.readFile(new URL('../dist/assets/'+asset+'.glb',import.meta.url));assert.equal(bytes.readUInt32LE(0),0x46546c67);
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));assert(gltf.skins?.length,`${asset} is missing a skin`);assert(gltf.images?.every(i=>i.bufferView!==undefined),`${asset} has an external image`);
 const [, , , characters, assets]=await exportAssets(asset);assert.deepEqual(Object.keys(assets),[asset]);assert(!characters.includes('KAYKIT'));assert(characters.includes('QUATERNIUS')||characters.includes('Avatar'));assert(Buffer.from(assets[asset],'base64').equals(bytes));
}
console.log(`PASS: ${PRESETS.filter(p=>p.asset).length} rigged characters, embedded textures, 4 animation states, project round trip and self-contained export assets.`);
