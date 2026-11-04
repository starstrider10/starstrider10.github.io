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
  const p = page(); p.preference.matches = true; p.preference.change();
  assert.ok(p.calls.every(a => a.cancelled));
  assert.ok(p.observers[0].disconnected);
});

test('touch travel halves; unsupported browsers and restored content stay static', () => {
  assert.equal(page({ touch: true }).calls[0].frames[0].transform, 'translateX(-6px)');
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
