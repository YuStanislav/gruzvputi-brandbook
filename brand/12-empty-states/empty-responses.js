/* Reusable empty response state. Status comes from the server; zero is not a status. */
(() => {
  const states = Object.freeze({
    SEARCHING: {
      label:'В поиске исполнителя', title:'Ждём первые отклики',
      text:'Заказ опубликован. Когда перевозчики предложат свои условия, отклики появятся здесь.',
      image:'searching.png', concept:'Хаски у начала маршрута: спокойно ждёт рядом с коробкой.',
      primary:'Посмотреть условия заказа', action:'details', secondary:'К моим заказам'
    },
    CANCELLED: {
      label:'Отменён вами', title:'Вы отменили заказ',
      text:'По этому заказу откликов не было. Если перевозка снова нужна, можно создать похожий заказ.',
      image:'cancelled.png', concept:'Хаски отдыхает рядом с коробкой: планы изменились, это нормально.',
      primary:'Создать похожий заказ', action:'copy', secondary:'К моим заказам'
    },
    EXPIRED: {
      label:'Срок заказа истёк', title:'Срок заказа истёк',
      text:'До окончания срока отклики не поступили. Можно повторить заказ с актуальными датой и условиями.',
      image:'expired.png', concept:'Хаски рядом с часами и коробкой: время прошло, можно начать заново.',
      primary:'Повторить заказ', action:'repeat', secondary:'К моим заказам'
    }
  });
  let sequence = 0;
  const create = (status, options = {}) => {
    const state = states[status]; if (!state) return null;
    const root = document.createElement('section');root.className='gvp-empty-response';root.dataset.state=status;
    const id=`empty-response-title-${++sequence}`;root.setAttribute('aria-labelledby',id);
    const image=document.createElement('img');image.className='gvp-empty-response__image';image.src=`../12-empty-states/${state.image}?v=4`;image.alt='';image.width=384;image.height=256;image.decoding='async';root.append(image);
    const content=document.createElement('div');content.className='gvp-empty-response__content';
    const title=document.createElement('h3');title.id=id;title.textContent=state.title;
    const text=document.createElement('p');text.textContent=state.text;
    const actions=document.createElement('div');actions.className='gvp-empty-response__actions';
    const button=document.createElement('button');button.type='button';button.className='gvp-empty-response__primary';button.textContent=state.primary;
    button.addEventListener('click',()=>options.onAction?.(state.action,status));
    const link=document.createElement('a');link.href=options.backHref||'orders.html';link.textContent=state.secondary;
    actions.append(button,link);content.append(title,text,actions);root.append(content);return root;
  };
  window.GVPEmptyResponses=Object.freeze({states,create});
})();
