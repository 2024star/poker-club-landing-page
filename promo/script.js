'use strict';

const result = document.getElementById('promo-result');
const choices = document.querySelectorAll('[data-choice]');

choices.forEach(button => {
  button.addEventListener('click', () => {
    result.hidden = false;
    choices.forEach(choice => choice.setAttribute('aria-expanded', 'true'));
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  });
});
