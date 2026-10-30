(() => {
  'use strict';
  if(new URLSearchParams(location.search).get('embed')==='1') document.body.dataset.embed='true';
  if(new URLSearchParams(location.search).get('view')==='mobile') document.body.dataset.view='mobile';
  const desktopQuery = matchMedia('(min-width: 1000px)');
  const isDesktop = () => desktopQuery.matches && !document.body.dataset.embed && document.body.dataset.view !== 'mobile';
  const isOrderPage = document.body.dataset.page === 'order';
  const persist = () => { try { sessionStorage.setItem('gvp-orders-demo',JSON.stringify(orders)); sessionStorage.setItem('gvp-orders-theme',document.documentElement.dataset.theme); } catch (_) {} };
  window.addEventListener('message',event=> { if(event.source===window.parent && (event.origin===location.origin || location.protocol==='file:') && event.data?.type==='gvp-theme' && ['light','dark'].includes(event.data.theme)) document.documentElement.dataset.theme=event.data.theme; });
  const $ = selector => document.querySelector(selector);
  const home = $('#home'), detail = $('#detail'), menu = $('#order-menu'), modal = $('#modal');
  const people = [
    { name: 'Алексей Волков', initials: 'АВ', rating: '4,9', reviews: 48, price: 1800, car: 'Фургон · 3 м³', message: 'Могу забрать сегодня после 15:00. Помогу с погрузкой.', unread: 2, online: true },
    { name: 'Михаил Соколов', initials: 'МС', rating: '5,0', reviews: 32, price: 2100, car: 'Фургон · 5 м³', message: 'Здравствуйте! Есть свободная машина, готов обсудить детали.', unread: 1, online: true },
    { name: 'Дмитрий Орлов', initials: 'ДО', rating: '4,8', reviews: 76, price: 1900, car: 'Фургон · 3 м³', message: 'Еду в вашу сторону. Груз закрепим ремнями.', unread: 2, online: false },
    { name: 'Анна Миронова', initials: 'АМ', rating: '5,0', reviews: 21, price: 2300, car: 'Фургон · 4 м³', message: 'Могу приехать к удобному времени. На связи.', unread: 1, online: true },
    { name: 'Сергей Белов', initials: 'СБ', rating: '4,9', reviews: 63, price: 2000, car: 'Фургон · 3 м³', message: 'Добрый день! Упаковка и аккуратная перевозка.', unread: 2, online: false }
  ];
  let orders, current, toastTimer, refreshTimer, generation = 0;
  const offersWord = count => count === 1 ? 'отклик' : count > 1 && count < 5 ? 'отклика' : 'откликов';
  const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  const initialOrders = () => [
    { id: 1, title: 'Перевезти мебель', from: 'Тверская, 7', to: 'Ленинский пр-т, 30', cargo: 'Диван и 6 коробок · 3 м³ · 180 кг', price: 1800, count: 5, status: 'Заказ опубликован', hidden: false, unread: [2,1,2,1,2], chats: {} },
    { id: 2, title: 'Доставить документы', from: 'Покровка, 12', to: 'Садовая-Кудринская, 8', cargo: 'Пакет документов · до 1 кг', price: 700, count: 3, status: 'Заказ опубликован', hidden: false, unread: [1,0,0], chats: {} }
  ];
  const toast = text => { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000); };
  const closeMenu = (focus = true) => { menu.hidden = true; $('#menu-backdrop').hidden = true; $('#menu-toggle').setAttribute('aria-expanded','false'); if (focus) $('#menu-toggle').focus(); };
  const renderHome = () => {
    const visible = orders.filter(order => !order.hidden);
    $('#order-count').textContent = visible.length;
    $('#empty').hidden = visible.length !== 0;
    $('#order-list').replaceChildren(...visible.map((order, index) => {
      const button = document.createElement(isDesktop() ? 'a' : 'button');
      if (isDesktop()) button.href = `order.html?id=${order.id}`;
      else button.type = 'button';
      button.className = 'order-card' + (index ? ' secondary' : '');
      if (current?.id === order.id) button.setAttribute('aria-current','true');
      // Only fixed demo content and values assigned through the edit form are rendered.
      const heading = document.createElement('h3'); heading.textContent = order.title;
      const route = document.createElement('p'); route.className = 'route'; route.textContent = `${order.from} → ${order.to}`;
      const foot = document.createElement('div'); foot.className = 'order-foot';
      const status = document.createElement('span'); const dot = document.createElement('i'); dot.className = 'dot'; status.append(dot,order.status);
      const meta = document.createElement('span'); meta.className = 'order-meta'; meta.textContent = `◉ 17 · ${order.count} ${offersWord(order.count)}`;
      if (!order.count) dot.style.background = 'var(--muted)';
      foot.append(status,meta); button.append(heading,route,foot);
      const unread = order.unread.reduce((a,b) => a+b,0);
      if (unread) { const badge = document.createElement('span'); badge.className = 'unread'; badge.textContent = unread; badge.setAttribute('aria-label',`${unread} непрочитанных сообщений`); button.append(badge); }
      button.addEventListener('click',() => { persist(); if (!isDesktop()) openOrder(order); });
      return button;
    }));
    persist();
  };
  const offerPrice = index => current.id === 2 ? [700,900,800][index] : people[index].price;
  const renderDetail = () => {
    const emptyStatus = current.emptyState || (current.status === 'Заказ отменён' ? 'CANCELLED' : null);
    const cancelled = emptyStatus === 'CANCELLED';
    const expired = emptyStatus === 'EXPIRED';
    $('.live-label').textContent = cancelled ? 'Отменён' : expired ? 'Срок истёк' : current.count === 0 ? 'Ожидаем отклики' : 'На связи';
    $('.published i').hidden = cancelled || expired;
    $('.offers-tip b').textContent = cancelled ? 'Этот заказ отменён' : 'Выберите своего попутчика';
    $('.offers-tip p').textContent = cancelled ? 'Нажмите «Начать заново», чтобы восстановить пример.' : 'Откройте предложение, чтобы обсудить время и детали перевозки.';
    $('#status-extra > b').textContent = cancelled ? 'Заказ снят с публикации' : 'Заказ виден перевозчикам';
    $('#status-extra > p').textContent = cancelled ? 'Новые отклики больше не поступают. Это демонстрационное состояние.' : 'Отклики появляются здесь. Непрочитанные сообщения отмечены синим.';
    $('#detail-title').textContent = current.title;
    $('#detail-status').textContent = current.status;
    $('#detail-route').textContent = `${current.from} → ${current.to}`;
    $('#offers-count').textContent = current.count;
    $('#status-offers').textContent = current.count;
    $('#status-toggle b').textContent = current.status;
    $('#offers').replaceChildren(...people.slice(0,current.count).map((person,index) => {
      const button = document.createElement('button'); button.type='button'; button.className='offer';
      button.innerHTML = `<span class="avatar ${person.online ? 'online' : ''}" aria-hidden="true">${person.initials}</span><span><span class="offer-top"><span class="offer-name">${person.name}</span><span class="offer-time">13:${47-index*2}</span></span><span class="offer-tags"><span class="tag star">★ ${person.rating}</span><span class="tag">${person.reviews} отзывов</span></span><span class="offer-price">${money(offerPrice(index))}</span><span class="offer-bottom"><span class="offer-message">${current.id === 2 ? 'Доставлю лично в руки. Готов выехать.' : person.message}</span>${current.unread[index] ? `<span class="unread" aria-label="Новых сообщений: ${current.unread[index]}">${current.unread[index]}</span>` : ''}</span></span>`;
      button.addEventListener('click',() => openChat(index)); return button;
    }));
    document.querySelector('#offers-empty-state')?.remove();
    $('.offers-tip').hidden = current.count === 0;
    if (current.count === 0 && emptyStatus && window.GVPEmptyResponses) {
      const empty = window.GVPEmptyResponses.create(emptyStatus, {onAction: action => {
        if(action === 'details') actions.details();
        else openModal(action === 'copy' ? 'Создать похожий заказ' : 'Повторить заказ', body => {
          paragraph(body,'Маршрут и параметры груза можно перенести в новый заказ. Дату, время и цену нужно проверить заново.');
          paragraph(body,'Это пример следующего шага. Новый заказ не публикуется.');
          actionButton(body,'Понятно',()=>modal.close());
        });
      }});
      if (empty) { empty.id='offers-empty-state'; $('#offers').after(empty); }
      $('#status-extra > b').textContent = cancelled ? 'Заказ отменён вами' : expired ? 'Срок заказа истёк' : 'Заказ опубликован';
      $('#status-extra > p').textContent = window.GVPEmptyResponses.states[emptyStatus].text;
    }
    persist();
  };
  const openOrder = (order, focus = true) => {
    closeMenu(false);
    $('#status-extra').hidden = true;
    $('#status-toggle').setAttribute('aria-expanded','false');
    current = order; renderDetail(); home.hidden = true; detail.hidden = false;
    $('#desktop-empty').hidden = true; detail.scrollTop = 0;
    $('.device').setAttribute('aria-label',isDesktop() ? 'Пример кабинета заказчика' : 'Пример мобильного кабинета заказчика');
    if (focus) {
      $('#detail-title').tabIndex = -1;
      (isDesktop() ? $('#detail-title') : $('#back')).focus({preventScroll:true});
    }
  };
  const goHome = () => {
    if (isOrderPage) { persist(); location.href='orders.html'; return; }
    closeMenu(false); detail.hidden = true; home.hidden = false;
    $('#status-extra').hidden = true; $('#status-toggle').setAttribute('aria-expanded','false');
    current = null; renderHome();
    const card = $('#order-list button'); if(card) card.focus({preventScroll:true}); else $('#refresh').focus({preventScroll:true});
  };
  const positionModal = () => {
    if (isDesktop()) {
      modal.style.cssText = `position:fixed;inset:auto;left:50%;top:50%;transform:translate(-50%,-50%);width:${Math.min(560,window.innerWidth-48)}px;max-height:${window.innerHeight-64}px`;
      return;
    }
    const rect = $('.device').getBoundingClientRect();
    const width = Math.min(rect.width-2,window.innerWidth-24);
    modal.style.transform='none'; modal.style.position='fixed'; modal.style.inset='auto'; modal.style.left=`${Math.max(12,Math.min(rect.left+1,window.innerWidth-width-12))}px`;
    modal.style.width=`${width}px`; modal.style.maxHeight=`${Math.min(650,window.innerHeight-48)}px`; modal.style.bottom=`${Math.max(18,window.innerHeight-Math.min(rect.bottom-1,window.innerHeight-18))}px`;
  };
  const openModal = (title,build) => { closeMenu(false); $('#modal-title').textContent=title; $('#modal-body').replaceChildren(); build($('#modal-body')); positionModal(); modal.showModal(); };
  const paragraph = (parent,text) => { const p=document.createElement('p'); p.className='modal-copy'; p.textContent=text; parent.append(p); };
  const actionButton = (parent,text,handler,kind='primary') => { const button=document.createElement('button'); button.type='button'; button.className=kind; button.textContent=text; button.addEventListener('click',handler); parent.append(button); return button; };
  const field = (parent,label,value,multiline=false) => { const wrapper=document.createElement('label'); wrapper.className='field'; wrapper.append(label); const input=document.createElement(multiline?'textarea':'input'); input.value=value; input.required=true; input.maxLength=multiline?500:90; wrapper.append(input); parent.append(wrapper); return input; };
  const openChat = index => {
    current.unread[index]=0; renderDetail();
    const person=people[index];
    openModal(person.name,body => {
      const price=document.createElement('p'); price.className='chat-price'; price.textContent=money(offerPrice(index)); body.append(price);
      paragraph(body,`${person.rating} ★ · ${person.reviews} отзывов · ${current.id===2?'Курьер на автомобиле':person.car}`);
      const thread=document.createElement('div'); body.append(thread);
      const addMessage=(text,mine=false) => { const p=document.createElement('p'); p.className='chat-message'+(mine?' mine':''); p.textContent=text; thread.append(p); };
      addMessage(current.id===2?'Здравствуйте! Доставлю документы лично в руки. Готов выехать.':person.message);
      (current.chats[index] || []).forEach(text => addMessage(text,true));
      const form=document.createElement('form'); const input=field(form,'Ваше сообщение','',true); input.placeholder='Уточните время или детали';
      const send=document.createElement('button'); send.type='submit'; send.className='primary'; send.textContent='Отправить в демо-чат'; form.append(send); body.append(form);
      form.addEventListener('submit',event => { event.preventDefault(); const text=input.value.trim(); if(!text)return; (current.chats[index] ||= []).push(text); addMessage(text,true); input.value=''; toast('Сообщение добавлено только в прототип'); });
      paragraph(body,'Демонстрационный чат. Сообщения никуда не отправляются.');
    });
  };
  const actions = {
    hide: () => openModal('Скрыть заказ?',body => { paragraph(body,'Заказ исчезнет с главного экрана этого примера. Все демонстрационные заказы можно вернуть кнопкой «Начать заново».'); actionButton(body,'Скрыть заказ',() => { current.hidden=true; modal.close(); goHome(); toast('Заказ скрыт в прототипе'); }); actionButton(body,'Оставить',() => modal.close(),'secondary-button'); }),
    details: () => openModal('Детали заказа',body => { const list=document.createElement('dl'); list.className='detail-list'; [['Откуда',current.from],['Куда',current.to],['Груз',current.cargo],['Когда','Сегодня, с 15:00 до 18:00'],['Ваша цена',money(current.price)]].forEach(([label,value]) => { const dt=document.createElement('dt'),dd=document.createElement('dd'); dt.textContent=label; dd.textContent=value; list.append(dt,dd); }); body.append(list); }),
    edit: () => openModal('Изменить заказ',body => { const form=document.createElement('form'); const title=field(form,'Название',current.title),from=field(form,'Откуда',current.from),to=field(form,'Куда',current.to); const submit=document.createElement('button'); submit.className='primary'; submit.textContent='Сохранить в прототипе'; form.append(submit); body.append(form); form.addEventListener('submit',event => { event.preventDefault(); if(![title,from,to].every(input=>input.value.trim()))return; current.title=title.value.trim(); current.from=from.value.trim(); current.to=to.value.trim(); renderDetail(); modal.close(); toast('Изменения сохранены в этом примере'); }); }),
    support: () => openModal('Мы рядом',body => { paragraph(body,'Если изменились планы, откройте меню заказа и обновите детали. Вопросы по времени и погрузке можно обсудить с перевозчиком в чате.'); paragraph(body,'Это пример экрана поддержки. Обращение в реальную службу не создаётся.'); actionButton(body,'Понятно',()=>modal.close()); }),
    cancel: () => openModal('Отменить заказ?',body => { paragraph(body,'В прототипе заказ получит статус «Отменён», а новые отклики будут скрыты. Кнопка «Начать заново» восстановит исходный пример.'); actionButton(body,'Отменить заказ',()=> { current.status='Заказ отменён'; current.emptyState='CANCELLED'; current.count=0; current.unread=[]; renderDetail(); modal.close(); toast('Заказ отменён только в прототипе'); },'primary cancel-button'); actionButton(body,'Продолжить поиск',()=>modal.close(),'secondary-button'); })
  };
  $('#menu-toggle').addEventListener('click',()=> { const open=menu.hidden; menu.hidden=!open; $('#menu-backdrop').hidden=!open; $('#menu-toggle').setAttribute('aria-expanded',String(open)); if(open) menu.querySelector('button').focus(); });
  $('#menu-backdrop').addEventListener('click',()=>closeMenu());
  menu.addEventListener('click',event => { const button=event.target.closest('[data-action]'); if(button)actions[button.dataset.action](); });
  menu.addEventListener('keydown',event=> { const buttons=[...menu.querySelectorAll('button')]; const index=buttons.indexOf(document.activeElement); if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault(); buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();} if(event.key==='Tab'){closeMenu(false);} });
  document.addEventListener('keydown',event=> { if(event.key==='Escape' && !menu.hidden)closeMenu(); });
  $('#modal-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',event=> { if(event.target===modal){const rect=modal.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)modal.close();} });
  modal.addEventListener('close',()=> { if(!detail.hidden)$('#menu-toggle').focus({preventScroll:true}); });
  window.addEventListener('resize',()=> { if(modal.open)positionModal(); });
  $('#back').addEventListener('click',goHome);
  $('#status-toggle').addEventListener('click',()=> { const open=$('#status-extra').hidden; $('#status-extra').hidden=!open; $('#status-toggle').setAttribute('aria-expanded',String(open)); });
  const refresh = () => { if(home.classList.contains('refreshing'))return; const token=generation; home.classList.add('refreshing'); home.setAttribute('aria-busy','true'); $('#refresh').disabled=true; refreshTimer=setTimeout(()=> { if(token!==generation)return; home.classList.remove('refreshing'); home.removeAttribute('aria-busy'); $('#refresh').disabled=false; toast('Заказы обновлены · новых откликов нет'); },950); };
  $('#refresh').addEventListener('click',refresh);
  let touchStart;
  home.addEventListener('touchstart',event=> { touchStart=home.scrollTop===0?event.touches[0].clientY:null; },{passive:true});
  home.addEventListener('touchend',event=> { if(touchStart!==null&&event.changedTouches[0].clientY-touchStart>65)refresh(); touchStart=null; },{passive:true});
  $('#theme').addEventListener('click',()=> { const dark=document.documentElement.dataset.theme!=='dark'; document.documentElement.dataset.theme=dark?'dark':'light'; $('#theme').textContent=dark?'Светлая тема':'Тёмная тема'; $('#theme').setAttribute('aria-pressed',String(dark)); persist(); });
  const reset=(restore=false)=> {
    generation++; clearTimeout(refreshTimer); if(modal.open)modal.close(); orders=initialOrders(); current=null;
    if (restore) { try { const saved=JSON.parse(sessionStorage.getItem('gvp-orders-demo')); if(Array.isArray(saved)&&saved.length===2&&saved.every(order=>Array.isArray(order.unread)&&typeof order.id==='number')) orders=saved; const theme=sessionStorage.getItem('gvp-orders-theme'); if(['light','dark'].includes(theme)) document.documentElement.dataset.theme=theme; } catch (_) {} }
    const dark=document.documentElement.dataset.theme==='dark'; $('#theme').textContent=dark?'Светлая тема':'Тёмная тема'; $('#theme').setAttribute('aria-pressed',String(dark));
    $('.device').setAttribute('aria-label',isDesktop()?'Пример кабинета заказчика':'Пример мобильного кабинета заказчика');
    home.classList.remove('refreshing'); home.removeAttribute('aria-busy'); $('#refresh').disabled=false; closeMenu(false); detail.hidden=true; home.hidden=false; home.scrollTop=0; $('#desktop-empty').hidden=true; $('#status-extra').hidden=true; $('#status-toggle').setAttribute('aria-expanded','false'); renderHome();
    if(isOrderPage) {
      const params=new URLSearchParams(location.search),id=Number(params.get('id'));
      const storedOrder=orders.find(order=>order.id===id)||orders[0];
      const order=params.has('empty')?{...storedOrder}:storedOrder;
      const empty=params.get('empty');
      if (window.GVPEmptyResponses && Object.hasOwn(window.GVPEmptyResponses.states,empty)) {
        order.count=0;order.unread=[];order.emptyState=empty;order.status=window.GVPEmptyResponses.states[empty].label;
      }
      openOrder(order,false);
    }
  };
  $('#reset').addEventListener('click',()=> { reset(); toast('Можно пройти сценарий заново'); });
  $('#empty-reset').addEventListener('click',()=> { reset(); toast('Демо-заказы восстановлены'); });
  desktopQuery.addEventListener('change',()=> {
    closeMenu(false);
    if (isDesktop() && !isOrderPage) {
      current=null; home.hidden=false; detail.hidden=true; renderHome();
    } else {
      home.hidden=!!current; detail.hidden=!current; $('#desktop-empty').hidden=true;
      $('.device').setAttribute('aria-label','Пример мобильного кабинета заказчика');
    }
    if (modal.open) positionModal();
  });
  reset(true);
  window.addEventListener('pageshow',event => { if(event.persisted) reset(true); });
})();
