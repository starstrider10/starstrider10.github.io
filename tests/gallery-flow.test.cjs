// Offline regression tests: no Shopify requests or cart mutations leave this process.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const elements = new Map();
const storage = new Map();
function element(id) {
    if (!elements.has(id)) elements.set(id, {
        innerText: '', textContent: '', innerHTML: '', value: '', href: '', disabled: false,
        classList: { add() {}, remove() {}, contains() { return false; } },
        style: {}, setAttribute() {}
    });
    return elements.get(id);
}
const context = vm.createContext({
    console, Intl, URL, AbortSignal, setTimeout() {}, clearTimeout() {},
    document: { getElementById: element, querySelectorAll: () => [], addEventListener() {} },
    window: { addEventListener() {}, location: { href: '' } },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    fetch: async () => { throw new Error('Unexpected network request in offline test'); }
});
vm.runInContext(fs.readFileSync('gallery-logic.js', 'utf8'), context);
const run = code => vm.runInContext(code, context);
const reply = data => { context.fetch = async () => ({ ok: true, json: async () => data }); };

(async () => {
    reply({data: {products: {edges: [{node: {title: 'master print temp', variants: {edges: []}}}]}}});
    assert.equal(await run("fetchShopifyProduct('Taipei 101 Atmospheric Fog')"), null, 'never use the template for another photograph');

    reply({data: {cartCreate: {cart: null, userErrors: [{message: 'This print is unavailable.'}]}}});
    await assert.rejects(run('createShopifyCart([])'), /unavailable/);
    assert.equal(storage.size, 0, 'failed creation must not persist a bag');

    reply({errors: [{message: 'Query unavailable'}]});
    await assert.rejects(run("shopifyFetch('query { shop { name } }')"), /could not process/);
    context.fetch = async () => ({ok: false});
    await assert.rejects(run("shopifyFetch('query { shop { name } }')"), /could not be reached/);

    run("createShopifyCart = async () => null");
    await assert.rejects(run("addItemToCart('gid://shopify/ProductVariant/example', 1)"), /not added/);

    element('print-size-select').value = '8x12';
    element('print-finish-select').value = 'Matte';
    run(`currentAlbum = [{print_title: 'Test print', is_print: true, shopify_url: 'https://shop.storyofleo.com'}];
        currentIndex = 0; currentModel = 'Test print'; shopifyProductsCache = {}; updatePrintPrice();`);
    assert.match(element('buy-print-btn').innerHTML, /Ask about this print/);
    assert.match(element('print-availability').textContent, /estimate: \$85/);
    assert.doesNotMatch(element('buy-print-btn').innerHTML, /Order|Add to Cart/);

    run(`shopifyProductsCache['Test print'] = {variants: {edges: [{node: {
        id: 'variant-1', availableForSale: true, price: {amount: '85.50', currencyCode: 'USD'},
        selectedOptions: [{name: 'Size', value: '8x12'}, {name: 'Finish', value: 'Matte'}]
    }}]}}; updatePrintPrice();`);
    assert.match(element('buy-print-btn').innerHTML, /\$85\.50/);
    assert.equal(element('buy-print-btn').disabled, false);

    run("addItemToCart = async () => { throw new Error('Could not add this print.'); }; toggleCartDrawer = () => { throw new Error('Must not open bag on failure'); }");
    await run('handleBuyPrintClick({preventDefault() {}})');
    assert.match(element('print-availability').textContent, /Could not add/);
    assert.doesNotMatch(element('buy-print-btn').innerHTML, /Added to Cart/);
    assert.equal(run('isCartBusy'), false);

    run('renderCartUI({totalQuantity: 3, lines: {edges: []}})');
    assert.equal(Number(element('cart-count-desktop').textContent), 3, 'shared navigation bag count must update');
    console.log('Print flow checks passed: exact product matching, API errors, failed cart creation, honest inquiry fallback, precise live price, failed-add feedback and bag count.');
})().catch(error => { console.error(error); process.exitCode = 1; });
