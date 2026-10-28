(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  let role = params.get('role') === 'carrier' ? 'carrier' : 'client';
  let filter = 'all', state = 'ready', opener, savedOverflow = '', sequence = 0;
  const isDemo = document.body.classList.contains('notify-demo-page');
  const now = Date.now(), minute = 60000;
  const jobs = {
    703: { title:'Перевезти мебель', route:'Пресненский → Гагаринский район', cargo:'Фургон · 3 м³ · 180 кг', when:'Сегодня, 15:00–18:00', price:'1 800 ₽', extra:'Нужна помощь с погрузкой', match:'Москва · фургон · погрузка' },
    704: { title:'Переезд в область', route:'Москва → Красногорск', cargo:'Газель · 10 м³ · 750 кг', when:'Завтра, 09:00–12:00', price:'4 500 ₽', extra:'Погрузка силами клиента', match:'Москва и область · Газель' },
    705: { title:'Доставить посылку', route:'Хамовники → Сокольники', cargo:'Легковой автомобиль · до 20 кг', when:'Сегодня, 18:00–21:00', price:'900 ₽', extra:'Передать получателю лично', match:'Москва · курьерская доставка' }
  };
  const seed = () => ({
    client: [
      {id:'c1',kind:'NEW_RESPONSE',title:'Новый отклик от Алексея',context:'Перевезти мебель · заказ №1',text:'Готов забрать груз сегодня и помочь с погрузкой.',price:'1 800 ₽',orderId:1,time:now-2*minute,read:false,icon:'↗'},
      {id:'c2',kind:'RESPONSE_UPDATED',title:'Михаил изменил цену',context:'Перевезти мебель · заказ №1',text:'Перевозчик обновил предложение.',before:'2 100 ₽',price:'1 950 ₽',orderId:1,time:now-12*minute,read:false,icon:'↻'},
      {id:'c3',kind:'RESPONSE_UPDATED',title:'Анна уточнила время подачи',context:'Перевезти мебель · заказ №1',text:'Вместо 15:00–16:00 предлагает 17:00–18:00.',orderId:1,time:now-43*minute,read:false,icon:'◷'},
      {id:'c4',kind:'RESPONSE_WITHDRAWN',title:'Отклик больше недоступен',context:'Доставить документы · заказ №2',text:'Дмитрий отозвал предложение. Можно выбрать другого перевозчика.',orderId:2,time:now-90*minute,read:true,icon:'−'},
      {id:'c5',kind:'NEW_RESPONSE',title:'Новый отклик от Сергея',context:'Доставить документы · заказ №2',text:'Готов доставить документы лично в руки.',price:'700 ₽',orderId:2,time:now-25*60*minute,read:true,icon:'↗'}
    ],
    carrier: [
      {id:'t1',kind:'NEW_ORDER',title:'Новый подходящий заказ',orderId:703,time:now-3*minute,read:false,icon:'▱'},
      {id:'t2',kind:'NEW_ORDER',title:'Новый подходящий заказ',orderId:704,time:now-18*minute,read:false,icon:'▱'},
      {id:'t3',kind:'NEW_ORDER',title:'Новый подходящий заказ',orderId:705,time:now-70*minute,read:true,icon:'▱'}
    ]
  });
  let data = seed();
  try { const read = JSON.parse(sessionStorage.getItem('gvp-notification-demo-read') || '{}'); for (const key of ['client','carrier']) if(Array.isArray(read[key])) data[key].forEach(item => { if(read[key].includes(item.id))item.read=true; }); } catch (_) {}
  const persist = () => { try { sessionStorage.setItem('gvp-notification-demo-read',JSON.stringify({client:data.client.filter(item=>item.read).map(item=>item.id),carrier:data.carrier.filter(item=>item.read).map(item=>item.id)})); } catch (_) {} };
  const element = (tag, cls, text) => { const el=document.createElement(tag); if(cls)el.className=cls; if(text!==undefined)el.textContent=text; return el; };
  const bellSVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
  const makeBell = () => { const button=element('button','gvp-bell'); button.type='button'; button.dataset.notifyTrigger=''; return button; };
  // Install the same bell in both versions of the order prototype.
  const account=document.querySelector('.desktop-account'); if(account)account.prepend(makeBell());
  const homeHeader=document.querySelector('.home-header');
  if(homeHeader){const group=element('div','notify-mobile-account');const avatar=homeHeader.querySelector('.profile');group.append(makeBell());if(avatar)group.append(avatar);homeHeader.append(group);}
  const detailNav=document.querySelector('.detail-nav'); if(detailNav)detailNav.insertBefore(makeBell(),document.querySelector('#menu-toggle'));
  const panel=element('dialog','notify-panel'); panel.id='notification-panel'; panel.setAttribute('aria-labelledby','notification-title');
  panel.innerHTML='<div class="notify-panel__layout"><header class="notify-panel__header"><div><h2 id="notification-title">Уведомления</h2><p class="notify-panel__role"></p></div><button class="notify-close" type="button" aria-label="Закрыть уведомления">×</button></header><div class="notify-panel__tools"><div class="notify-tabs" role="group" aria-label="Фильтр уведомлений"><button type="button" data-filter="all" aria-pressed="true">Все</button><button type="button" data-filter="unread" aria-pressed="false">Непрочитанные</button></div><button class="notify-read-all" type="button">Прочитать все</button></div><ul class="notify-list" aria-label="Список уведомлений"></ul><footer class="notify-panel__footer"><p>Открытие панели не отмечает уведомления прочитанными.</p></footer></div>';
  document.body.append(panel);
  const announcement=element('div','notify-announcement'); announcement.setAttribute('role','status'); document.body.append(announcement);
  const announce = text => { announcement.textContent=text; };
  const list=panel.querySelector('.notify-list'),readAll=panel.querySelector('.notify-read-all');
  const items=()=>state==='empty'?[]:data[role];
  const unread=()=>items().filter(item=>!item.read).length;
  const updateBells=()=>document.querySelectorAll('[data-notify-trigger]').forEach(button=> {
    button.innerHTML=bellSVG;
    if(unread()){const badge=element('span','gvp-bell__badge',unread()>99?'99+':String(unread()));badge.setAttribute('aria-hidden','true');button.append(badge);}
    button.setAttribute('aria-label',unread()?`Уведомления, новых: ${unread()}`:'Уведомления');
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',panel.id);button.setAttribute('aria-expanded',String(panel.open));
  });
  const timeText = timestamp => { const mins=Math.max(1,Math.floor((Date.now()-timestamp)/minute));return mins<60?`${mins} мин назад`:new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Moscow'}).format(timestamp)+' МСК'; };
  const destination = item => item.kind==='NEW_ORDER'?`notifications.html?role=carrier&order=${item.orderId}`:`order.html?id=${item.orderId}`;
  const renderEvent = item => {
    const li=element('li','notify-event');li.dataset.unread=String(!item.read);
    const link=element('a');link.href=destination(item);
    const icon=element('span','notify-event__icon',item.icon);icon.setAttribute('aria-hidden','true');
    const body=element('div');const heading=element('div','notify-event__heading');heading.append(element('strong','',item.title));
    if(!item.read){const dot=element('span','notify-event__dot');dot.setAttribute('aria-label','Не прочитано');heading.append(dot);}body.append(heading);
    if(item.kind==='NEW_ORDER'){
      const job=jobs[item.orderId];body.append(element('p','notify-event__context',`${job.title} · №${item.orderId}`),element('p','notify-event__route',job.route),element('p','notify-event__cargo',job.cargo),element('p','notify-event__cargo',job.when),element('p','notify-event__cargo',job.extra),element('p','notify-event__price',job.price));
    }else{
      body.append(element('p','notify-event__context',item.context),element('p','notify-event__text',item.text));
      if(item.price){const price=element('p','notify-event__price');if(item.before)price.append(element('del','',item.before),' → ');price.append(element('span','',item.price));body.append(price);}
    }
    const time=element('time','notify-event__time',timeText(item.time));time.dateTime=new Date(item.time).toISOString();body.append(time,element('span','notify-event__action',item.kind==='NEW_ORDER'?'Посмотреть заказ →':'Посмотреть отклики →'));
    link.append(icon,body);li.append(link);
    link.addEventListener('click',()=>{item.read=true;persist();updateBells();panel.close();});
    return li;
  };
  const render=()=>{
    panel.querySelector('.notify-panel__role').textContent=role==='client'?'Ваши заказы и отклики перевозчиков':'Подходящие заказы для вас';
    panel.querySelectorAll('[data-filter]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.filter===filter));button.textContent=button.dataset.filter==='all'?'Все':`Непрочитанные${unread()?' · '+unread():''}`;});
    readAll.disabled=unread()===0||state==='error';list.replaceChildren();
    if(state==='error'){
      const error=element('li','notify-status');error.append(element('h3','','Не удалось загрузить уведомления'),element('p','','Проверьте соединение и попробуйте ещё раз. События и счётчик сохранятся.'));const retry=element('button','notify-retry','Попробовать снова');retry.type='button';retry.addEventListener('click',()=>{state='ready';const select=document.querySelector('[data-notify-state]');if(select)select.value=state;render();announce('Уведомления загружены');});error.append(retry);list.append(error);
    }else{
      const visible=items().filter(item=>filter==='all'||!item.read);
      if(!visible.length){const empty=element('li','notify-status');const image=element('img');image.src='../01-mascot/light/mascot-640.png';image.alt='';empty.append(image,element('h3','',filter==='unread'?'Всё прочитано':'Пока ничего нового'),element('p','',filter==='unread'?'Все события остаются во вкладке «Все».':role==='client'?'Здесь появятся отклики перевозчиков и изменения в их предложениях.':'Здесь появятся новые заказы, подходящие под ваши настройки.'));list.append(empty);}else{
        let lastGroup='';const today=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow'}).format(Date.now());
        visible.forEach(item=>{const day=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow'}).format(item.time);const group=day===today?'Сегодня':'Ранее';if(group!==lastGroup){list.append(element('li','notify-day',group));lastGroup=group;}list.append(renderEvent(item));});
      }
    }
    updateBells();
  };
  const open = button => {
    const orderMenu = document.querySelector('#menu-toggle');
    if (orderMenu?.getAttribute('aria-expanded') === 'true') orderMenu.click();
    opener=button; render();savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    panel.showModal();updateBells();panel.querySelector('.notify-close').focus({preventScroll:true});
  };
  document.querySelectorAll('[data-notify-trigger]').forEach(button=>button.addEventListener('click',()=>{if(panel.open)panel.close();else open(button);}));
  panel.querySelector('.notify-close').addEventListener('click',()=>panel.close());
  panel.addEventListener('click',event=>{if(event.target!==panel)return;const rect=panel.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)panel.close();});
  panel.addEventListener('close',()=>{document.body.style.overflow=savedOverflow;updateBells();opener?.focus({preventScroll:true});});
  panel.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;render();}));
  readAll.addEventListener('click',()=>{data[role].forEach(item=>item.read=true);persist();render();announce('Все уведомления прочитаны');});
  const stage=document.querySelector('#notify-stage');
  const renderStage=()=>{
    if(!stage)return;stage.replaceChildren();
    const orderId=Number(params.get('order'));
    if(role==='carrier'&&jobs[orderId]){
      const job=jobs[orderId];stage.append(element('h2','',`Заказ №${orderId} · ${job.title}`));
      const note=element('p','notify-stage-note','Подходит под ваши настройки: '+job.match);stage.append(note);
      const dl=element('dl','detail-list');for(const[label,value]of [['Маршрут',job.route],['Груз и машина',job.cargo],['Когда',job.when],['Дополнительно',job.extra],['Предложение клиента',job.price]])dl.append(element('dt','',label),element('dd','',value));stage.append(dl);
      const back=element('a','back-link','← К подходящим заказам');back.href='notifications.html?role=carrier';stage.append(back);
    }else if(role==='carrier'){
      stage.append(element('h2','','Подходящие заказы'),element('p','notify-stage-note','Примеры заказов по вашим направлениям, машине и услугам.'));
      for(const[id,job]of Object.entries(jobs)){const link=element('a','order-card');link.href=`notifications.html?role=carrier&order=${id}`;link.append(element('h3','',job.title),element('p','route',job.route),element('p','route',job.cargo+' · '+job.when),element('p','order-foot',job.price+' · '+job.extra));stage.append(link);}
    }else{
      stage.append(element('h2','','Мои заказы'));
      for(const order of [{id:1,title:'Перевезти мебель',route:'Тверская, 7 → Ленинский пр-т, 30',responses:5},{id:2,title:'Доставить документы',route:'Покровка, 12 → Садовая-Кудринская, 8',responses:3}]){const link=element('a','order-card'+(order.id===2?' secondary':''));link.href=`order.html?id=${order.id}`;link.append(element('h3','',order.title),element('p','route',order.route),element('p','order-foot',`Заказ опубликован · Предложений: ${order.responses}`));stage.append(link);}
    }
  };
  document.querySelectorAll('[data-notify-role]').forEach(button=>button.addEventListener('click',()=>{role=button.dataset.notifyRole;filter='all';document.querySelectorAll('[data-notify-role]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.notifyRole===role)));render();renderStage();announce(role==='client'?'Пример для заказчика':'Пример для перевозчика');}));
  document.querySelectorAll('[data-notify-role]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.notifyRole===role)));
  document.querySelector('[data-notify-state]')?.addEventListener('change',event=>{state=event.target.value;render();});
  document.querySelector('[data-notify-reset]')?.addEventListener('click',()=>{data=seed();state='ready';filter='all';persist();document.querySelector('[data-notify-state]').value=state;render();announce('Пример восстановлен');});
  document.querySelector('[data-notify-add]')?.addEventListener('click',()=>{const fresh={...seed()[role][0],id:`demo-${++sequence}-${Date.now()}`,time:Date.now(),read:false};data[role].unshift(fresh);state='ready';document.querySelector('[data-notify-state]').value=state;render();announce('Добавлено новое уведомление');});
  document.querySelector('[data-notify-theme]')?.addEventListener('click',event=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';event.target.textContent=dark?'Светлая тема':'Тёмная тема';});
  // The order examples can expose this shortcut without changing the real site's header.
  if(!isDemo){const guide=document.querySelector('.guide');if(guide){const link=element('a','back-link','Пример уведомлений для двух ролей ↗');link.href='notifications.html';link.style.cssText='display:block;margin-top:12px';guide.append(link);}}
  render();renderStage();
})();
