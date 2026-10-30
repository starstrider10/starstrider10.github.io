const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup(endpoint = '', fetcher = async () => ({ok: true})) {
    const ids = ['inquiry-form','inquiry-email-fallback','inquiry-status','inquiry-preview','inquiry-intro','inquiry-privacy','inquiry-draft','inquiry-email-link','client-name','client-email','target-date','package-select','project-location','location-vibe','client-notes'];
    const elements = Object.fromEntries(ids.map(id => [id, {value:'', textContent:'', hidden:true, disabled:false, handlers:{},
        addEventListener(type, handler) {this.handlers[type]=handler;}, scrollIntoView(){},
        setAttribute(name,value){this[name]=value;}, removeAttribute(name){delete this[name];}}]));
    const form = elements['inquiry-form'];
    const button = {textContent:'', disabled:false};
    form.dataset = {formEndpoint:endpoint};
    form.querySelector = () => button;
    form.querySelectorAll = () => [button,...['client-name','client-email','target-date','package-select','project-location','location-vibe','client-notes'].map(id=>elements[id])];
    form.reportValidity = () => ['client-name','client-email','target-date'].every(id=>elements[id].value);
    Object.entries({'client-name':' Preview Person ','client-email':'preview@example.com','target-date':'November','package-select':'Essential Portrait ($450)','project-location':'Seattle & Tacoma','location-vibe':'Open to Recommendation','client-notes':'<test> & notes'}).forEach(([id,value])=>elements[id].value=value);
    let requests = [];
    vm.runInNewContext(fs.readFileSync('inquiry.js','utf8'), {document:{getElementById:id=>elements[id]}, AbortSignal,
        fetch: async (...args)=>{requests.push(args); return fetcher(...args);}});
    return {elements,button,requests,submit:()=>form.handlers.submit({preventDefault(){}}),edit:()=>form.handlers.input()};
}
(async () => {
    const local=setup(); await local.submit();
    assert.equal(local.requests.length,0);
    assert.equal(local.elements['inquiry-preview'].hidden,false);
    assert.match(decodeURIComponent(local.elements['inquiry-email-link'].href), /Seattle & Tacoma/);
    assert.match(local.elements['inquiry-draft'].textContent, /<test> & notes/);
    local.edit(); assert.equal(local.elements['inquiry-preview'].hidden,true);
    const invalid=setup('https://unapproved.example/contact'); await invalid.submit(); assert.equal(invalid.requests.length,0);
    const blank=setup('https://formspree.io/f/testid'); blank.elements['client-name'].value='   '; await blank.submit(); assert.equal(blank.requests.length,0);
    let finish;
    const active=setup('https://formspree.io/f/testid',()=>new Promise(resolve=>{finish=resolve;}));
    const first=active.submit(); await active.submit();
    assert.equal(active.requests.length,1); assert.equal(active.button.disabled,true);
    const sent=JSON.parse(active.requests[0][1].body);
    assert.equal(sent.name,'Preview Person'); assert.equal(sent.location,'Seattle & Tacoma');
    assert.equal(sent.email,'preview@example.com');
    finish({ok:true}); await first;
    assert.match(active.elements['inquiry-status'].textContent,/was received/);
    assert.match(active.elements['inquiry-status'].textContent,/not confirmed yet/);
    await active.submit(); assert.equal(active.requests.length,1);
    active.edit(); assert.equal(active.button.disabled,false);
    for (const fetcher of [async()=>({ok:false}), async()=>{throw new Error('Network failure');}, async()=>{throw new DOMException('Timeout','TimeoutError');}]) {
        const failed=setup('https://formspree.io/f/testid',fetcher); await failed.submit();
        assert.match(failed.elements['inquiry-status'].textContent,/could not be confirmed/);
        assert.equal(failed.elements['inquiry-preview'].hidden,false);
        assert.equal(failed.button.disabled,false);
        assert.equal(failed.elements['client-notes'].value,'<test> & notes');
    }
    console.log('Inquiry: local fallback, endpoint guard, validation, payload, duplicate protection, success, HTTP/network/timeout recovery passed. No external requests.');
})().catch(error=>{console.error(error);process.exitCode=1;});
