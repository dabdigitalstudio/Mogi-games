import {escapeHtml as e,safeUrl} from './config.js?v=rig4';
import {t} from './i18n.js?v=rig4';
const paragraphs=s=>String(s||'').split(/\n+/).filter(s=>s.trim()).map(s=>`<p dir="auto">${e(s)}</p>`).join('');
const tags=s=>`<div class="resume-tags">${String(s||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>`<span dir="auto">${e(s)}</span>`).join('')}</div>`;
const link=(label,url)=>safeUrl(url)?`<a href="${e(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>`:'';
export function sectionContent(c,id){
 const lang=c.language,rows=c[id]||[];let html='';
 if(id==='about'){html=`<div class="resume-hero"><span class="resume-eyebrow">${e(c.profile.role)}</span><h2 dir="auto">${e(c.profile.name)}</h2><p class="resume-location" dir="auto">${e(c.profile.location)}</p></div>${paragraphs(c.profile.introduction)}`;return html;}
 if(id==='contact'){const p=c.profile;html=`<div class="resume-links">${p.email?`<a href="mailto:${encodeURIComponent(p.email)}">${e(p.email)}</a>`:''}${link(t(lang,'website'),p.website)}${link('LinkedIn',p.linkedin)}${link('GitHub',p.github)}</div>`;if(p.languages)html+=`<article><h3>${t(lang,'languages')}</h3>${paragraphs(p.languages)}</article>`;if(p.certifications)html+=`<article><h3>${t(lang,'certifications')}</h3>${paragraphs(p.certifications)}</article>`;return html||`<p>${t(lang,'noContent')}</p>`;}
 for(const row of rows){if(id==='skills')html+=`<article><h3 dir="auto">${e(row.name)}</h3>${tags(row.items)}</article>`;
  if(id==='experience'||id==='education'){html+=`<article><span class="resume-eyebrow" dir="auto">${e([row.start,row.end].filter(Boolean).join(' — '))}</span><h3 dir="auto">${e(row.role||row.degree)}</h3><h4 dir="auto">${e(row.company||row.school)}</h4>${paragraphs(row.description)}</article>`;}
  if(id==='projects')html+=`<article><h3 dir="auto">${e(row.name)}</h3>${paragraphs(row.summary)}${tags(row.stack)}${link(t(lang,'projectLink'),row.url)}</article>`;
 }
 return html||`<p>${t(lang,'noContent')}</p>`;
}
export function createResumeDialog(getConfig,onPause=()=>{}){
 const dialog=document.createElement('dialog');dialog.className='resume-dialog';dialog.setAttribute('aria-labelledby','resumeHeading');document.body.appendChild(dialog);let previous;
 function close(){dialog.close();onPause(false);previous?.focus?.();}
 function open(id='all'){
  const c=getConfig(),lang=c.language;previous=document.activeElement;onPause(true);dialog.dir=lang==='he'?'rtl':'ltr';const all=id==='all';
  let content=all?sectionContent(c,'about')+['skills','experience','education','projects','contact'].map(k=>`<section><h2>${t(lang,k)}</h2>${sectionContent(c,k)}</section>`).join(''):sectionContent(c,id);
  dialog.innerHTML=`<div class="resume-bar"><span id="resumeHeading">${all?t(lang,'readResume'):t(lang,id)}</span><button type="button" class="resume-close" aria-label="${t(lang,'close')}">✕</button></div><div class="resume-body">${content}</div><div class="resume-footer"><span>${c.isSample?t(lang,'sampleGame'):e(c.profile.name)}</span><button type="button" class="resume-return">${t(lang,'returnGame')} ↗</button></div>`;
  dialog.querySelector('.resume-close').onclick=close;dialog.querySelector('.resume-return').onclick=close;dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.resume-close').focus();
 }
 dialog.addEventListener('cancel',event=>{event.preventDefault();close()});dialog.addEventListener('click',ev=>{if(ev.target!==dialog)return;const r=dialog.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)close()});
 return {open,close,element:dialog,destroy(){dialog.remove()}};
}
