const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/promo/index.html', 'utf8');
const script = fs.readFileSync(__dirname + '/promo/script.js', 'utf8');
const message = 'Duke paraqitur kete Chips qe ke ne dore, mund te marash pjese ne turneun 5M';
assert.equal((html.match(/class="card card-/g) || []).length, 2);
assert.match(html, /id="promo-result"[^>]* hidden/);
assert.ok(html.includes(message));
assert.match(html, /<html lang="sq">/);
assert.match(html, /aria-live="polite"/);
for (const file of ['styles.css', 'script.js']) assert.ok(fs.existsSync(__dirname + '/promo/' + file));
function visit() {
  const result = { hidden: true, focus() { this.focused = true; }, scrollIntoView() {} };
  const buttons = ['raise', 'all-in'].map(choice => ({ choice, attributes: {}, addEventListener(event, cb) { assert.equal(event, 'click'); this.click = cb; }, setAttribute(key, value) { this.attributes[key] = value; } }));
  vm.runInNewContext(script, { document: { getElementById: () => result, querySelectorAll: () => buttons } });
  return { result, buttons };
}
for (const choice of [0, 1]) {
  const { result, buttons } = visit();
  assert.equal(result.hidden, true);
  buttons[choice].click();
  assert.equal(result.hidden, false);
  assert.equal(result.focused, true);
  buttons[choice].click();
  buttons[1 - choice].click();
  assert.equal(result.hidden, false);
  buttons.forEach(button => assert.equal(button.attributes['aria-expanded'], 'true'));
}
assert.equal(visit().result.hidden, true);
console.log('PASS: two aces, exact message, hidden initial state, each choice, repeated clicks, focus and expanded state, fresh visit reset');
