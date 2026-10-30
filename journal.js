const repoOwner = 'starstrider10';
const repoName = 'starstrider10.github.io';
const postList = document.getElementById('post-list');
let postRequest = 0;
function journalMessage(message, retry = true) {
    postList.replaceChildren();
    const paragraph = document.createElement('p');
    paragraph.className = 'text-[#6E727A] leading-relaxed md:col-span-2';
    paragraph.textContent = message;
    postList.append(paragraph);
    if (retry) {
        const button = document.createElement('button');
        button.className = 'text-link'; button.textContent = 'Try loading the Journal again';
        button.addEventListener('click', fetchPosts); postList.append(button);
    }
}
async function fetchPosts() {
    journalMessage('Loading the Journal…', false);
    try {
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/posts`, {signal: AbortSignal.timeout(12000)});
        if (!response.ok) throw new Error(`Journal source returned ${response.status}`);
        const files = await response.json();
        if (!Array.isArray(files)) throw new Error('Unexpected Journal response');
        const posts = files.filter(file => file.type === 'file' && file.name.endsWith('.md'));
        if (!posts.length) { journalMessage('There are no published entries available here yet.', false); return; }
        postList.replaceChildren();
        posts.forEach(file => {
            const card = document.createElement('a');
            card.href = `journal.html?post=${encodeURIComponent(file.path)}`;
            card.className = 'group block';
            const label = document.createElement('span'); label.className = 'eyebrow'; label.textContent = 'Digital entry';
            const title = document.createElement('h3'); title.className = 'text-2xl md:text-3xl font-serif mt-4 mb-6 capitalize';
            title.textContent = file.name.replace(/\.md$/, '').replace(/-/g, ' ');
            card.append(label, title);
            card.addEventListener('click', event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault(); loadPost(file.path, true);
            }); postList.append(card);
        });
    } catch (error) {
        journalMessage('The Journal archive is currently unavailable. Please try again later, or contact hello@storyofleo.com about an article.');
    }
}
async function loadPost(path, push = false) {
    // Existing posts are Markdown files directly under posts/. Reject arbitrary URLs/paths.
    if (!/^posts\/[^/]+\.md$/.test(path) || path.includes('..')) return;
    const request = ++postRequest;
    const content = document.getElementById('post-content');
    document.getElementById('journal-index').classList.add('hidden');
    document.getElementById('post-view').classList.remove('hidden');
    content.textContent = 'Loading entry…';
    if (push) history.pushState({}, '', `journal.html?post=${encodeURIComponent(path)}`);
    try {
        const response = await fetch(`https://raw.githubusercontent.com/${repoOwner}/${repoName}/main/${path.split('/').map(encodeURIComponent).join('/')}`, {signal: AbortSignal.timeout(12000)});
        if (!response.ok) throw new Error(`Article returned ${response.status}`);
        const markdown = await response.text();
        if (request !== postRequest) return;
        content.innerHTML = DOMPurify.sanitize(marked.parse(markdown), {FORBID_TAGS: ['iframe', 'form', 'input', 'button', 'style']});
        content.querySelectorAll('a[target="_blank"]').forEach(link => link.rel = 'noopener noreferrer');
        content.tabIndex = -1; content.focus(); window.scrollTo(0, 0);
    } catch (error) {
        if (request === postRequest) content.textContent = 'This entry could not be loaded. Return to the Journal and try again.';
    }
}
function showIndex(push = true) {
    ++postRequest;
    document.getElementById('journal-index').classList.remove('hidden');
    document.getElementById('post-view').classList.add('hidden');
    if (push) history.pushState({}, '', 'journal.html');
    document.getElementById('main-content').tabIndex = -1;
    document.getElementById('main-content').focus(); window.scrollTo(0, 0);
}
window.addEventListener('popstate', () => {
    const path = new URLSearchParams(location.search).get('post');
    if (path) loadPost(path); else showIndex(false);
});
fetchPosts();
const initialPost = new URLSearchParams(location.search).get('post');
if (initialPost) loadPost(initialPost);
