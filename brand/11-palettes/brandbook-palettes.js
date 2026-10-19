/* One palette controls the whole guide, native exports and embedded motion. */
(() => {
  'use strict';
  const root=document.documentElement;
  const definitions=window.GVP_BRAND_PALETTES.palettes;
  const brandRoot=new URL('../',document.currentScript.src);
  const select=document.querySelector('[data-gvp-brand-palette]');
  const themeButton=document.getElementById('theme');
  const frames=[...document.querySelectorAll('[data-gvp-theme-frame]')];
  const query=new URLSearchParams(location.search);
  let current='brand';
  const storage=(key,value) => {try{if(value===undefined)return localStorage.getItem(key);localStorage.setItem(key,value);}catch(_){/* Optional offline storage. */}};
  const url=relative=>new URL(relative,brandRoot).href;
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const syncFrames=()=>{
    const icon=document.querySelector('link[rel="icon"]');
    if(icon)icon.href=url(definitions[current].assetRoot+`03-icons/web/${root.dataset.theme||'light'}/favicon.svg`);
    const origin=location.protocol==='file:'?'*':location.origin;
    frames.forEach(frame=>{
      frame.contentWindow?.postMessage({type:'gvp-theme',theme:root.dataset.theme||'light'},origin);
      frame.contentWindow?.postMessage({type:'gvp-palette',palette:current},origin);
    });
  };
  const setPalette=id=>{
    if(typeof id!=='string'||!Object.prototype.hasOwnProperty.call(definitions,id))return false;
    current=id;root.dataset.palette=id;const config=definitions[id];const prefix=config.assetRoot;
    if(select)select.value=id;
    document.querySelectorAll('[data-brand-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.brandChoice===id)));
    document.querySelectorAll('[data-brand-asset]').forEach(element=>{
      const original=element.dataset.brandAsset;
      const target=/^(02-logos|03-icons|09-banners|05-themes|07-brandbook)\//.test(original)?prefix+original:original;
      element.setAttribute(element.dataset.brandAttr||'href',url(target));
    });
    document.querySelectorAll('[data-brand-kit]').forEach(link=>link.href=url(`11-palettes/${id}/brand-kit-${id}.zip`));
    document.querySelectorAll('[data-brand-name]').forEach(element=>element.textContent=config.name);
    const colors=[config.palette.navy,config.palette.blue,config.palette.white,config.palette.ice,config.palette.midnight,config.themes.dark.surface];
    const names=['Глубокая основа','Акцент','Белый','Светлый фон','Тёмный фон','Тёмная поверхность'];
    document.querySelectorAll('#palette .swatch').forEach((swatch,index)=>{
      const color=colors[index];const block=swatch.querySelector('.swatch-color');
      block.style.background=color;block.style.color=index===2||index===3?config.palette.navy:'#ffffff';block.textContent=color.toUpperCase();
      swatch.querySelector('h3').textContent=names[index];swatch.querySelector('p').textContent='RGB '+rgb(color).join(' · ');
    });
    document.querySelector('[data-brand-palette-heading]').textContent=config.name+' — характер в цвете.';
    document.querySelector('[data-brand-palette-description]').textContent=config.description+' Палитра применяется к интерфейсу, логотипам, иконкам, баннерам и PDF.';
    document.querySelector('[data-brand-contrast]').textContent=`Цель контраста текста 4.5:1 · Белый на ${config.palette.blue.toUpperCase()} ≈ ${config.contrast.toFixed(2)}:1`;
    storage('gvp-brand-palette',id);syncFrames();return true;
  };
  const setTheme=theme=>{
    if(theme!=='light'&&theme!=='dark')return false;
    root.dataset.theme=theme;storage('gvp-brand-theme',theme);
    const dark=theme==='dark';themeButton.textContent=dark?'Светлая тема':'Тёмная тема';
    themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label',dark?'Включить светлую тему':'Включить тёмную тему');syncFrames();return true;
  };
  const requested=query.get('palette')||storage('gvp-brand-palette')||'brand';
  if(!setPalette(requested))setPalette('brand');
  if(!setTheme(query.get('theme')||root.dataset.theme||'light'))setTheme(root.dataset.theme||'light');
  select?.addEventListener('change',()=>setPalette(select.value));
  document.querySelectorAll('[data-brand-choice]').forEach(button=>button.addEventListener('click',()=>setPalette(button.dataset.brandChoice)));
  themeButton.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark'));
  frames.forEach(frame=>frame.addEventListener('load',syncFrames));
  window.addEventListener('message',event=>{
    if(!frames.some(frame=>frame.contentWindow===event.source)||!event.data)return;
    if(event.data.type==='gvp-palette-change'&&event.data.palette!==current)setPalette(event.data.palette);
  });
  window.GVPBrandbook=Object.freeze({setPalette,getPalette:()=>current,setTheme,getTheme:()=>root.dataset.theme});
})();
