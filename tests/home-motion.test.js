// ponytail: test motion lifecycle without installing a browser test framework.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../home-motion.js'), 'utf8');

function page({ reduced = false, touch = false, unsupported = false, restored = false } = {}) {
  const calls = [], observers = [], listeners = {};
  const preference = { matches: reduced, addEventListener: (_, fn) => { preference.change = fn; } };
  const element = label => ({
    matches: () => label,
    animate: (frames, options) => {
      const animation = { frames, options, cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
      calls.push(animation); return animation;
    }
  });
  const children = [element(true), element(false)];
  const section = {
    classList: { add() {}, remove() {} },
    querySelectorAll: () => children,
    getBoundingClientRect: () => ({ top: restored ? 0 : 1200 })
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    unobserve() {}
    disconnect() { this.disconnected = true; }
  }
  const tokens = { entrance: 450, stagger: 70, 'section-limit': 650, 'opening-travel': 12, 'section-travel': 8 };
  const window = unsupported ? {} : { IntersectionObserver: Observer };
  vm.runInNewContext(source, {
    window, Element: { prototype: { animate() {} } }, IntersectionObserver: Observer,
    matchMedia: query => query.includes('reduce') ? preference : { matches: touch },
    getComputedStyle: () => ({ getPropertyValue: key => key === '--motion-ease' ? 'ease' : String(tokens[key.replace('--motion-', '')]) }),
    document: {
      body: { classList: { contains: () => true } }, documentElement: {},
      querySelector: () => null,
      querySelectorAll: selector => selector === 'main > section' ? [section] : selector === '.motion-enter' ? [section] : children,
      addEventListener: (name, fn) => { listeners[name] = fn; },
      getElementById: () => ({ closest: () => section })
    },
    location: { hash: '' }, scrollY: restored ? 1000 : 0, innerHeight: 1000,
    addEventListener: (name, fn) => { listeners[name] = fn; }
  });
  return { calls, observers, preference, section, listeners };
}

test('section entrances run once; section timing stays within budget', () => {
  const p = page(); const before = p.calls.length;
  p.observers[0].callback([{ isIntersecting: true, target: p.section }]);
  assert.equal(p.calls.length, before + 2);
  assert.ok(p.calls.slice(before).every(a => a.options.delay + a.options.duration <= 650));
  p.observers[0].callback([{ isIntersecting: true, target: p.section }]);
  assert.equal(p.calls.length, before + 2);
});

test('reduced motion skips startup and cancels running entrances when changed', () => {
  assert.equal(page({ reduced: true }).calls.length, 0);
  const p = page();
  p.observers[0].callback([{ isIntersecting: true, target: p.section }]);
  p.preference.matches = true; p.preference.change();
  assert.ok(p.calls.every(a => a.cancelled));
  assert.ok(p.observers[0].disconnected);
});

test('touch travel halves; unsupported browsers and restored content stay static', () => {
  const touch = page({ touch: true });
  touch.observers[0].callback([{ isIntersecting: true, target: touch.section }]);
  assert.equal(touch.calls[0].frames[0].transform, 'translateX(-4px)');
  assert.equal(page({ unsupported: true }).calls.length, 0);
  const p = page({ restored: true });
  assert.equal(p.calls.length, 0);
  p.observers[0].callback([{ isIntersecting: true, target: p.section }]);
  assert.equal(p.calls.length, 0);
});

test('keyboard focus settles active text; reduced-motion resume does not replay visited sections', () => {
  const p = page();
  p.observers[0].callback([{ isIntersecting: true, target: p.section }]);
  p.listeners.focusin();
  assert.ok(p.calls.every(a => a.cancelled));
  p.preference.matches = true; p.preference.change();
  p.preference.matches = false; p.preference.change();
  const before = p.calls.length;
  p.observers.at(-1).callback([{ isIntersecting: true, target: p.section }]);
  assert.equal(p.calls.length, before);
});

// Run current Home runtime with a small DOM and a clock we can advance.
function exhibitionPage() {
  const listeners = {};
  const lanes = [];
  const classes = new Set();
  const preference = {
    matches: false,
    addEventListener(_, fn) { this.change = fn; }
  };
  const control = { setAttribute() {} };
  const home = {
    append(lane) { lanes.push(lane); },
    addEventListener(name, fn) { listeners[name] = fn; }
  };
  const dialog = {
    open: false, querySelector: () => ({}), setAttribute() {}, addEventListener() {}
  };
  const document = {
    hidden: false,
    body: {
      append() {},
      classList: { toggle(name, on) { on ? classes.add(name) : classes.delete(name); } }
    },
    getElementById: id => ({ exhibition: home, 'motion-toggle': control })[id],
    createElement: tag => tag === 'dialog' ? dialog : {
      scrollLeft: 0, scrollWidth: 900, clientWidth: 400, addEventListener() {}
    },
    addEventListener() {},
    querySelectorAll: () => []
  };
  let nextFrame;
  const context = vm.createContext({
    document, window: { addEventListener() {} },
    matchMedia: query => query.includes('reduce') ? preference : { matches: false },
    requestAnimationFrame: fn => { nextFrame = fn; }
  });
  for (const file of ['portfolio-data.js', 'exhibition.js']) {
    vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8'), context);
  }
  return { document, preference, lanes, classes, listeners, control, dialog,
    tick: time => nextFrame(time) };
}

test('exhibition pauses for manual control, viewer, and hidden tab', () => {
  const p = exhibitionPage();
  const left = () => p.lanes[0].scrollLeft;
  p.tick(20);
  const moving = left();
  assert.ok(moving > 0);
  p.control.onclick({currentTarget:p.control});
  p.tick(60);
  assert.equal(left(), moving);
  p.control.onclick({currentTarget:p.control});
  p.dialog.open = true;
  p.tick(80);
  assert.equal(left(), moving);
  p.dialog.open = false;
  p.document.hidden = true;
  p.tick(100);
  assert.equal(left(), moving);
  p.document.hidden = false;
  p.tick(120);
  assert.ok(left() > moving);
});

test('exhibition preference changes stop drift without rebuilding tiles', () => {
  const p = exhibitionPage();
  p.tick(20);
  const lane = p.lanes[0];
  const initial = lane.scrollLeft;
  p.preference.matches = true;
  p.preference.change();
  p.tick(40);
  assert.equal(lane.scrollLeft, initial);
  assert.equal(p.lanes.length, 3);
  assert.ok(p.classes.has('static-exhibition'));
  assert.ok(p.control.hidden);
  p.preference.matches = false;
  p.preference.change();
  p.tick(60);
  assert.ok(lane.scrollLeft > initial);
  assert.equal(p.control.hidden, false);
});
