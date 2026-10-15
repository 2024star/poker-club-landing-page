const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
class Element{constructor(){this.children=[];this.dataset={};this.attributes={};this.listeners={};this.classes=new Set();this.classList={add:x=>this.classes.add(x)};}setAttribute(k,v){this.attributes[k]=v;}append(...c){this.children.push(...c);}replaceChildren(){this.children=[];}addEventListener(k,f){this.listeners[k]=f;}focus(){this.focused=true;}querySelector(s){const key=s.match(/data-date="([^"]+)"/)[1];return this.children.find(e=>e.dataset.date===key);}click(){this.listeners.click();}}
const code=fs.readFileSync(__dirname+'/script.js','utf8');
function run(instant){const elements={};const document={getElementById:id=>elements[id]??=new Element(),createElement:()=>new Element()};const NativeDate=Date;class FakeDate extends NativeDate{constructor(...a){super(...(a.length?a:[instant]));}}vm.runInNewContext(code,{document,Date:FakeDate,Intl,Set});elements.setTime = value => {instant=value;};return elements;}
for(const instant of ['2026-10-15T23:30:00Z','2026-03-28T23:30:00Z','2026-10-25T23:30:00Z']){const el=run(instant),grid=el['calendar-grid'];const today=grid.children.find(x=>x.classes.has('is-today'));const expected=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Tirane'}).format(new Date(instant));assert.equal(today.dataset.date,expected);el['show-special'].click();assert.equal(el['month-label'].textContent,'Nëntor 2026');assert.equal(grid.children.filter(x=>x.dataset.date).length,30);assert.equal(grid.children.findIndex(x=>x.dataset.date==='2026-11-04')%7,2);assert.equal(grid.children.filter(x=>x.classes.has('is-special')).length,1);assert.equal(el['selected-event'].children[1].textContent,'18:00 · Europe/Tirane');el['next-month'].click();grid.querySelector('[data-date="2026-12-02"]').click();assert.match(el['selected-event'].children[0].textContent,/Turneu 5M/);assert.doesNotMatch(el['selected-event'].children[1].textContent,/falas/);assert.equal(grid.children.findIndex(x=>x.dataset.date==='2026-12-02')%7,2);el['next-month'].click();assert.equal(el['month-label'].textContent,'Janar 2027');el['prev-month'].click();assert.equal(el['month-label'].textContent,'Dhjetor 2026');grid.querySelector('[data-date="2026-12-03"]').click();assert.match(el['selected-event'].children[1].textContent,/Hyrja falas/);el.today.click();assert.equal(grid.children.find(x=>x.classes.has('is-selected')).dataset.date,expected);console.log('PASS: '+instant+' timezone, daily events, both special dates, labels, navigation, rollover, reset, selection focus');}

const midnight=run('2026-11-04T22:30:00Z');
assert.equal(midnight['featured-number'].textContent,'04');
midnight.setTime('2026-11-04T23:30:00Z');midnight.today.click();
assert.equal(midnight['calendar-grid'].children.find(x=>x.classes.has('is-today')).dataset.date,'2026-11-05');
assert.equal(midnight['featured-number'].textContent,'02');
assert.match(midnight['featured-date'].textContent,/DHJETOR/);
midnight['show-special'].click();assert.match(midnight['selected-event'].children[0].textContent,/2 dhjetor 2026/);
midnight.setTime('2026-12-02T23:30:00Z');midnight.today.click();
assert.equal(midnight['featured-title'].textContent,'Turne ditor');
assert.equal(midnight['featured-pill'].textContent,'Hyrja falas');
midnight['show-special'].click();assert.match(midnight['selected-event'].children[0].textContent,/3 dhjetor 2026/);
console.log('PASS: midnight refresh, feature advances Nov4 → Dec2 → ordinary daily event, special navigation follows feature');
