const fs = require('fs');
const vm = require('vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const script = fs.readFileSync(__dirname + '/script.js', 'utf8');
const styles = fs.readFileSync(__dirname + '/styles.css', 'utf8');
const tableBody = html.match(/<tbody id="events-body">([\s\S]*?)<\/tbody>/)?.[1] || '';
const rows = tableBody.match(/<tr\b[\s\S]*?<\/tr>/g) || [];

assert.equal(rows.length, 3, 'The compact events table must contain exactly three rows');
assert.match(rows[0], /Çdo ditë/);
assert.match(rows[0], /Turne 20\.000 i garantuar/);
assert.match(rows[0], /Hyrja falas/);
assert.match(rows[0], /18:00/);

assert.match(rows[1], /data-date="2026-11-04"/);
assert.match(rows[1], /4 nëntor 2026/);
assert.match(rows[1], /Special Event 5M/);
assert.match(rows[1], /18:00/);
assert.doesNotMatch(rows[1], /falas/i);

assert.match(rows[2], /data-date="2026-12-02"/);
assert.match(rows[2], /2 dhjetor 2026/);
assert.match(rows[2], /Special Event 5M/);
assert.match(rows[2], /18:00/);
assert.doesNotMatch(rows[2], /falas/i);

assert.match(html, /Deri më 31 dhjetor 2026/);
assert.match(html, /Turneu ditor nuk aplikohet më 4 nëntor dhe 2 dhjetor 2026\./);
assert.match(html, /href="https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=41\.3203651%2C19\.814634&amp;travelmode=driving"/);
assert.match(html, />Drive to location ↗/);
assert.match(styles, /\.brand img\{display:block;width:128px;height:auto;/);
assert.match(styles, /@media\(max-width:520px\)[\s\S]*?\.brand img\{width:112px\}/);
assert.match(styles, /\.button\{display:inline-flex;background:#b42318;color:#fff;/);
assert.match(styles, /\.button:hover\{background:#8f1d14\}/);
assert.match(styles, /\.button:focus-visible\{outline-color:#8f1d14;box-shadow:0 0 0 2px #fff\}/);

const year = { textContent: '' };
class FakeDate extends Date { constructor() { super('2026-10-22T12:00:00Z'); } }
vm.runInNewContext(script, {
  document: { getElementById: id => id === 'year' ? year : null },
  Date: FakeDate,
  Intl
});
assert.equal(year.textContent, '2026');

console.log('PASS: compact three-row schedule, exact event facts, special-event exclusions, unchanged directions link');
