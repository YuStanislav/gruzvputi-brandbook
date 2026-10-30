(() => {
  const component=window.GVPEmptyResponses;if(!component)return;
  const params=new URLSearchParams(location.search);
  let state=Object.hasOwn(component.states,params.get('state'))?params.get('state'):'SEARCHING';
  let theme=params.get('theme')==='dark'?'dark':'light';
  const frame=document.querySelector('#empty-mobile-frame');
  const dialog=document.querySelector('.empty-action-dialog');
  const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;};
  const act=action=>{
    const title=document.querySelector('#empty-action-title'),body=document.querySelector('[data-empty-action-body]');body.replaceChildren();
    if(action==='details'){
      title.textContent='Условия заказа';const list=node('dl',null,'detail-list');
      for(const[label,value]of [['Маршрут','Тверская, 7 → Ленинский пр-т, 30'],['Груз','Диван и 6 коробок · 3 м³ · 180 кг'],['Цена клиента','1 800 ₽'],['Статус',component.states[state].label]])list.append(node('dt',label),node('dd',value));body.append(list,node('p','Здесь клиент проверяет параметры опубликованного заказа. Никаких изменений не внесено.','empty-action-note'));
    }else{
      title.textContent=action==='copy'?'Создать похожий заказ':'Повторить заказ';
      body.append(node('p','Маршрут и параметры груза можно перенести в новый заказ. Дату, время и цену нужно проверить заново.','modal-copy'));
      const list=node('dl',null,'detail-list');for(const[label,value]of [['Маршрут','Тверская, 7 → Ленинский пр-т, 30'],['Груз','Диван и 6 коробок · 3 м³ · 180 кг'],['Следующий шаг','Указать актуальные дату, время и условия']])list.append(node('dt',label),node('dd',value));body.append(list,node('p','Пример следующего шага. Новый заказ не создаётся и не публикуется.','empty-action-note'));
    }
    dialog.showModal();
  };
  const send=()=>frame?.contentWindow?.postMessage({type:'gvp-empty-state',state,theme},location.protocol==='file:'?'*':location.origin);
  const render=()=>{
    document.documentElement.dataset.theme=theme;document.body.dataset.state=state;
    document.querySelectorAll('[data-empty-status]').forEach(el=>el.textContent=component.states[state].label);
    document.querySelectorAll('[data-empty-state]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.emptyState===state)));
    document.querySelectorAll('[data-empty-slot]').forEach(slot=>slot.replaceChildren(component.create(state,{onAction:act,backHref:'orders.html'+(slot.dataset.emptySlot==='mobile'?'?view=mobile':'')})));
    const concept=document.querySelector('[data-empty-concept]');if(concept)concept.textContent=component.states[state].concept;
    const toggle=document.querySelector('[data-empty-theme]');if(toggle){toggle.textContent=theme==='dark'?'Светлая тема':'Тёмная тема';toggle.setAttribute('aria-pressed',String(theme==='dark'));}
    send();
  };
  document.querySelectorAll('[data-empty-state]').forEach(button=>button.addEventListener('click',()=>{state=button.dataset.emptyState;render();const url=new URL(location.href);url.searchParams.set('state',state);history.replaceState(null,'',url);}));
  document.querySelector('[data-empty-theme]')?.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';render();});
  document.querySelector('[data-empty-close]')?.addEventListener('click',()=>dialog.close());
  dialog?.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  frame?.addEventListener('load',send);
  window.addEventListener('message',event=>{
    if(event.source!==window.parent||(event.origin!==location.origin&&location.protocol!=='file:')||event.data?.type!=='gvp-empty-state')return;
    if(!Object.hasOwn(component.states,event.data.state)||!['light','dark'].includes(event.data.theme))return;
    state=event.data.state;theme=event.data.theme;render();
  });
  render();
})();
