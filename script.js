(() => {
  'use strict';
  const TIME_ZONE = 'Europe/Tirane';
  const year = new Intl.DateTimeFormat('en', { timeZone: TIME_ZONE, year: 'numeric' }).format(new Date());
  document.getElementById('year').textContent = year;
})();
