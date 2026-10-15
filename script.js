/* All displayed dates are local calendar dates in Tirana, independent of the visitor's timezone. */
(() => {
  'use strict';
  const TIME_ZONE = 'Europe/Tirane';
  const SPECIAL_DATE = '2026-11-04';
  const specialDates = new Set([SPECIAL_DATE, '2026-12-02']);
  const months = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor'];
  const weekdays = ['E diel','E hënë','E martë','E mërkurë','E enjte','E premte','E shtunë'];
  function getToday() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
    const getPart = type => Number(parts.find(part => part.type === type).value);
    return {year:getPart('year'), month:getPart('month') - 1, day:getPart('day')};
  }
  let today = getToday();
  let shownYear = today.year, shownMonth = today.month;
  const key = (year, month, day) => `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  let todayKey = key(today.year,today.month,today.day);
  let selected = todayKey;
  const grid = document.getElementById('calendar-grid');
  const details = document.getElementById('selected-event');
  function describe(year, month, day) {
    const dateKey = key(year,month,day);
    const weekday = weekdays[new Date(Date.UTC(year,month,day)).getUTCDay()];
    const title = specialDates.has(dateKey) ? 'Turneu 5M' : 'Turne ditor';
    return {dateKey, title, dateLabel:`${weekday}, ${day} ${months[month].toLowerCase()} ${year}`};
  }
  function showDetails(year,month,day) {
    const event = describe(year,month,day);
    details.replaceChildren();
    const title = document.createElement('strong'); title.textContent = `${event.title} · ${event.dateLabel}`;
    const text = document.createElement('span'); text.textContent = specialDates.has(event.dateKey) ? '18:00 · Europe/Tirane' : '18:00 · Europe/Tirane · Hyrja falas';
    details.append(title,text);
  }
  function render() {
    document.getElementById('month-label').textContent = `${months[shownMonth]} ${shownYear}`;
    grid.replaceChildren();
    const offset = (new Date(Date.UTC(shownYear,shownMonth,1)).getUTCDay()+6)%7;
    const count = new Date(Date.UTC(shownYear,shownMonth+1,0)).getUTCDate();
    for(let n=0;n<offset;n++) { const space=document.createElement('span'); space.setAttribute('aria-hidden','true'); grid.append(space); }
    for(let day=1;day<=count;day++) {
      const event=describe(shownYear,shownMonth,day);
      const button=document.createElement('button'); button.type='button'; button.className='calendar-day';
      button.dataset.date=event.dateKey;
      button.setAttribute('aria-label',`${event.dateLabel}, ${event.title}, 18:00${specialDates.has(event.dateKey) ? '' : ', hyrja falas'}`);
      button.setAttribute('aria-pressed',String(event.dateKey===selected));
      if(event.dateKey===todayKey) {button.classList.add('is-today'); button.setAttribute('aria-current','date');}
      if(specialDates.has(event.dateKey)) button.classList.add('is-special');
      if(event.dateKey===selected) button.classList.add('is-selected');
      const number=document.createElement('span'); number.className='day-number'; number.textContent=day;
      const label=document.createElement('span'); label.className='day-label'; label.textContent=specialDates.has(event.dateKey)?'5M · 18:00':'18:00';
      button.append(number,label);
      button.addEventListener('click',()=>{selected=event.dateKey;render();grid.querySelector(`[data-date="${selected}"]`).focus();showDetails(shownYear,shownMonth,day);});
      grid.append(button);
    }
  }
  function navigate(delta) {
    const date=new Date(Date.UTC(shownYear,shownMonth+delta,1)); shownYear=date.getUTCFullYear(); shownMonth=date.getUTCMonth();
    selected=key(shownYear,shownMonth,1); render(); showDetails(shownYear,shownMonth,1);
  }
  document.getElementById('prev-month').addEventListener('click',()=>navigate(-1));
  document.getElementById('next-month').addEventListener('click',()=>navigate(1));
  document.getElementById('today').addEventListener('click',()=>{today=getToday();todayKey=key(today.year,today.month,today.day);updateFeatured();shownYear=today.year;shownMonth=today.month;selected=todayKey;render();showDetails(today.year,today.month,today.day);});
  let featuredDate = SPECIAL_DATE;
  function updateFeatured() {
    const now = getToday();
    const nowKey = key(now.year,now.month,now.day);
    featuredDate = [...specialDates].find(date => date >= nowKey) || nowKey;
    const [year,month,day] = featuredDate.split('-').map(Number);
    const special = specialDates.has(featuredDate);
    document.getElementById('featured-kicker').textContent = special ? 'EVENTI I VEÇANTË' : 'TAKIMI I PËRDITSHËM';
    document.getElementById('featured-number').textContent = String(day).padStart(2,'0');
    document.getElementById('featured-date').textContent = `${months[month-1].toUpperCase()} ${year} · ${weekdays[new Date(Date.UTC(year,month-1,day)).getUTCDay()].toUpperCase()}`;
    document.getElementById('featured-title').textContent = special ? 'Turneu 5M' : 'Turne ditor';
    document.getElementById('featured-note').textContent = featuredDate === SPECIAL_DATE ? 'Gjithashtu më 2 dhjetor 2026. E mërkurë · 18:00' : 'Poker për argëtim dhe shoqëri.';
    document.getElementById('featured-pill').textContent = special ? 'Turneu 5M' : 'Hyrja falas';
  }
  document.getElementById('show-special').addEventListener('click',()=>{
    updateFeatured();
    const [year,month,day] = featuredDate.split('-').map(Number);
    shownYear=year;shownMonth=month-1;selected=featuredDate;render();showDetails(year,month-1,day);grid.querySelector(`[data-date="${featuredDate}"]`).focus();
  });
  updateFeatured();
  document.getElementById('year').textContent=today.year;
  render();showDetails(today.year,today.month,today.day);
})();
