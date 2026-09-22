import {PortfolioEngine} from './engine.js?v=rig4';
import {normalizeConfig,DEFAULT_CONFIG} from './config.js?v=rig4';
import {createGameUI} from './game-ui.js?v=rig4';
import {t} from './i18n.js?v=rig4';
let config;try{config=normalizeConfig(JSON.parse(document.querySelector('#portfolio-data')?.textContent||JSON.stringify(DEFAULT_CONFIG)));}catch{config=normalizeConfig(DEFAULT_CONFIG);}
document.documentElement.lang=config.language;document.documentElement.dir=config.language==='he'?'rtl':'ltr';document.title=`${config.profile.name} · ${config.profile.role}`;
const root=document.querySelector('#portfolio-game');root.innerHTML='<canvas class="game-canvas" tabindex="0"></canvas><div class="game-shading"></div><div class="game-error" hidden></div>';
const canvas=root.querySelector('canvas');canvas.setAttribute('aria-label',t(config.language,'welcome'));let engine;
try{engine=new PortfolioEngine(canvas,config,{mode:'play',onError:()=>showError()});}catch(error){console.error('3D initialization failed',error);showError();}
function showError(){const el=root.querySelector('.game-error');el.textContent=t(config.language,'graphicsError');el.hidden=false;}
createGameUI(root,engine,()=>config);
