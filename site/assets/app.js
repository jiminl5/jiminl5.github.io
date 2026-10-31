// content.json을 읽어서 페이지를 채운다. 내용 수정은 content.json(또는 편집기)에서만 한다.

const ICONS = {
  facebook: '<svg viewBox="0 0 24 24"><path d="M14 8V6c0-.9.6-1 1-1h3V1h-4c-4 0-5 3-5 5v2H6v4h3v11h5V12h3.5l.5-4h-4z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.79-1.7-2.79-1.7 0-1.96 1.33-1.96 2.7V21h-4z"/></svg>',
  github: '<svg viewBox="0 0 24 24"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
  link: '<svg viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0zM8.5 20a5 5 0 0 1-3.5-8.5l2.1-2.1a1 1 0 1 1 1.4 1.4l-2.1 2.1a3 3 0 0 0 4.2 4.2l2.1-2.1a1 1 0 1 1 1.4 1.4L12 18.5A5 5 0 0 1 8.5 20zm8-6.7a1 1 0 0 1-.7-1.7l2.1-2.1a3 3 0 0 0-4.2-4.2l-2.1 2.1a1 1 0 1 1-1.4-1.4L12.3 3.9a5 5 0 0 1 7.1 7.1l-2.1 2.1a1 1 0 0 1-.8.2z"/></svg>'
};
const RESUME_ICON = '<svg viewBox="0 0 36 40"><rect x="1" y="1" width="34" height="38"/><circle cx="18" cy="11" r="3"/><path d="M12 19c0-3 2.7-5 6-5s6 2 6 5zM8 25h20M8 29h20M8 33h20"/></svg>';

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
const lines = v => (Array.isArray(v) ? v : String(v || '').split('\n')).filter(s => s.trim());

function socials(links) {
  const wrap = document.createDocumentFragment();
  for (const l of links || []) {
    if (!l.url) continue;
    const a = el('a');
    a.href = l.url; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', l.type);
    a.innerHTML = ICONS[l.type] || ICONS.link;
    wrap.append(a);
  }
  return wrap;
}

function render(c) {
  document.title = c.site.title;
  document.querySelectorAll('[data-bind]').forEach(n => { n.textContent = get(c, n.dataset.bind) || ''; });

  const email = document.querySelector('[data-bind-email]');
  email.textContent = c.contact.email;
  email.href = 'mailto:' + c.contact.email;
  document.querySelectorAll('[data-socials]').forEach(n => n.replaceChildren(socials(c.contact.links)));

  // 메인
  const hero = document.querySelector('.hero');
  hero.style.backgroundImage = `url("${c.hero.image}")`;
  document.querySelector('[data-hero-lines]').replaceChildren(...lines(c.hero.lines).map(t => el('p', null, t)));

  // 포트폴리오
  const link = document.querySelector('[data-portfolio-link]');
  link.textContent = c.portfolio.linkLabel;
  link.href = c.portfolio.linkUrl;
  link.parentElement.hidden = !c.portfolio.linkUrl;
  document.querySelector('[data-projects]').replaceChildren(...c.portfolio.projects.map(p => {
    const card = el('button', 'card');
    const box = el('div', 'card-img');
    const img = el('img');
    img.src = p.image; img.alt = p.title; img.loading = 'lazy';
    box.append(img);
    card.append(box, el('div', 'card-title', p.title));
    card.addEventListener('click', () => openLightbox(p));
    return card;
  }));

  // 소개
  // 빈 줄은 문단 간격
  document.querySelector('[data-about]').replaceChildren(...(c.about.body || []).map(t => (t.trim() ? el('p', null, t) : el('p', 'gap'))));

  // 이력
  document.querySelector('[data-history]').replaceChildren(...c.history.items.map(h => {
    const row = el('div', 'history-item');
    const icon = el('div', 'history-icon');
    icon.innerHTML = RESUME_ICON;
    const meta = el('div', 'history-meta');
    meta.append(el('div', null, h.company), el('div', null, h.period));
    const desc = el('div');
    if (h.project) desc.append(el('p', 'history-project', h.project));
    const ul = el('ul', 'history-details');
    ul.append(...lines(h.details).map(t => el('li', null, t)));
    desc.append(ul);
    row.append(icon, meta, el('div', 'history-role', h.role), desc);
    return row;
  }));

  // 연락처
  const contact = document.querySelector('[data-contact]');
  const mail = el('a', null, c.contact.email);
  mail.href = 'mailto:' + c.contact.email;
  const pEmail = el('p'); pEmail.append(mail);
  const box = el('div', 'socials');
  box.append(socials(c.contact.links));
  contact.replaceChildren(pEmail, ...(c.contact.phone ? [el('p', null, c.contact.phone)] : []), box);
}

// 확대 보기
const lb = document.querySelector('.lightbox');
function openLightbox(p) {
  lb.querySelector('img').src = p.image;
  lb.querySelector('img').alt = p.title;
  lb.querySelector('h3').textContent = p.title;
  lb.querySelector('ul').replaceChildren(...lines(p.description).map(t => el('li', null, t)));
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.hidden = true;
  document.body.style.overflow = '';
}
lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lightbox-close')) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// 모바일 메뉴
const topbar = document.querySelector('.topbar');
topbar.querySelector('.menu-toggle').addEventListener('click', () => {
  const open = topbar.classList.toggle('open');
  topbar.querySelector('.menu-toggle').setAttribute('aria-expanded', open);
});
topbar.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => topbar.classList.remove('open')));

// GitHub Pages는 10분 캐시를 걸기 때문에, 올린 내용이 바로 보이도록 매번 서버에 변경 여부를 확인한다
fetch('content.json', { cache: 'no-cache' })
  .then(r => r.json())
  .then(render)
  .then(() => { if (location.hash) document.querySelector(location.hash)?.scrollIntoView(); })
  .catch(err => { document.body.prepend(el('p', null, '내용을 불러오지 못했습니다: ' + err)); });
