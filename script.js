const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const header = document.getElementById('siteHeader');
const progress = document.getElementById('progress');
const year = document.getElementById('year');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const filters = [...document.querySelectorAll('.filter')];
const projects = [...document.querySelectorAll('.project-card')];
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

year.textContent = new Date().getFullYear();

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

function closeMenu() {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open menu');
}

navLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});

let ticking = false;
function updateScrollState() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${height > 0 ? (scrollTop / height) * 100 : 0}%`;
  header.classList.toggle('scrolled', scrollTop > 24);

  let active = 'home';
  for (const section of sections) {
    if (scrollTop + 180 >= section.offsetTop) active = section.id;
  }
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateScrollState);
    ticking = true;
  }
}, { passive: true });
updateScrollState();

const revealItems = [...document.querySelectorAll('.reveal')];
revealItems.forEach((item, index) => {
  const siblings = item.parentElement ? [...item.parentElement.querySelectorAll(':scope > .reveal')] : [];
  const position = siblings.indexOf(item);
  item.style.setProperty('--reveal-delay', `${Math.max(0, position) * 85}ms`);
});

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

filters.forEach(filter => {
  filter.setAttribute('aria-pressed', String(filter.classList.contains('active')));
  filter.addEventListener('click', () => {
    filters.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    filter.classList.add('active');
    filter.setAttribute('aria-pressed', 'true');
    const value = filter.dataset.filter;

    projects.forEach(card => {
      const shouldHide = value !== 'all' && card.dataset.type !== value;
      card.classList.remove('is-hidden');
      if (shouldHide) {
        if (reducedMotion) {
          card.classList.add('is-hidden');
          return;
        }
        card.classList.add('is-filtering-out');
        window.setTimeout(() => {
          if (card.classList.contains('is-filtering-out')) card.classList.add('is-hidden');
        }, 260);
      } else {
        card.classList.remove('is-filtering-out');
      }
    });
  });
});

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-art');
  hero.addEventListener('pointermove', event => {
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  }, { passive: true });

  heroArt.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = heroArt.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    const card = heroArt.querySelector('.core-card');
    card.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 6}deg)`;
  }, { passive: true });
  heroArt.addEventListener('pointerleave', () => {
    heroArt.querySelector('.core-card').style.transform = '';
  });

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    }, { passive: true });
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  formNote.textContent = `Thanks ${name || 'there'} — this demo form is ready to connect to a backend.`;
  form.reset();
});
