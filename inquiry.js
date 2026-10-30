// Set data-form-endpoint to the owner's verified https://formspree.io/f/FORM_ID.
// With no endpoint configured, the form prepares an email draft and sends nothing.
(() => {
    const form = document.getElementById('inquiry-form');
    const button = form.querySelector('[type="submit"]');
    const fallback = document.getElementById('inquiry-email-fallback');
    const status = document.getElementById('inquiry-status');
    const preview = document.getElementById('inquiry-preview');
    const endpoint = form.dataset.formEndpoint || '';
    const connected = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
    let busy = false;
    let received = false;
    const value = id => document.getElementById(id).value.trim();
    const controls = [...form.querySelectorAll('input, select, textarea, button')];
    const submitLabel = connected ? 'Send inquiry →' : 'Prepare Email Draft →';
    button.textContent = submitLabel;
    if (connected) {
        fallback.hidden = false;
        document.getElementById('inquiry-intro').textContent = 'Share a few details to send an inquiry. Dates and prices are confirmed personally.';
        document.getElementById('inquiry-privacy').textContent = 'Sending shares your details with Leo through Formspree to respond to your inquiry. You can use email instead below. An inquiry does not reserve a date.';
    }
    function payload() {
        return {
            name: value('client-name'), email: value('client-email'),
            service: value('package-select'), date: value('target-date'),
            location: value('project-location') || 'To discuss',
            setting: value('location-vibe'), message: value('client-notes') || 'To discuss'
        };
    }
    function draft() {
        const data = payload();
        const subject = `Story of Leo inquiry: ${data.service} — ${data.name}`;
        const body = `Hi Leo,\n\nI’d like to discuss a project.\n\nService: ${data.service}\nDate / month: ${data.date}\nCity / location: ${data.location}\nPreferred setting: ${data.setting}\nName: ${data.name}\nEmail: ${data.email}\n\nStory, scope and usage:\n${data.message}\n\nThank you!`;
        document.getElementById('inquiry-draft').textContent = `Subject: ${subject}\n\n${body}`;
        document.getElementById('inquiry-email-link').href = `mailto:hello@storyofleo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        preview.hidden = false;
        preview.scrollIntoView({block: 'nearest'});
    }
    fallback.addEventListener('click', draft);
    form.addEventListener('input', () => {
        preview.hidden = true;
        status.textContent = '';
        received = false;
        button.disabled = busy;
    });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy || received) return;
        ['client-name', 'client-email', 'target-date'].forEach(id => {
            document.getElementById(id).value = value(id);
        });
        if (!form.reportValidity()) return;
        if (!connected) { draft(); return; }
        const data = payload();
        busy = true;
        controls.forEach(control => { control.disabled = true; });
        form.setAttribute('aria-busy', 'true');
        button.textContent = 'Sending…';
        status.textContent = 'Sending your inquiry…';
        preview.hidden = true;
        try {
            const response = await fetch(endpoint, {
                method: 'POST', headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
                body: JSON.stringify(data), signal: AbortSignal.timeout(20000)
            });
            if (!response.ok) throw new Error('Submission not confirmed');
            received = true;
            status.textContent = 'Your inquiry was received. Leo will reply by email. Your booking is not confirmed yet.';
        } catch {
            status.textContent = 'Delivery could not be confirmed. Your details are still here. You can retry or use the email draft below.';
            draft();
        } finally {
            busy = false;
            controls.forEach(control => { control.disabled = false; });
            button.disabled = received;
            button.textContent = submitLabel;
            form.removeAttribute('aria-busy');
        }
    });
})();
