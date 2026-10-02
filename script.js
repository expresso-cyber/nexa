const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const header = document.getElementById('siteHeader');
const progress = document.getElementById('progress');
const year = document.getElementById('year');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (year) year.textContent = new Date().getFullYear();

if (menuBtn && nav) {
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

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
}

let ticking = false;
function updateScrollState() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) progress.style.width = `${height > 0 ? (scrollTop / height) * 100 : 0}%`;
  if (header) header.classList.toggle('scrolled', scrollTop > 24);
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
revealItems.forEach(item => {
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
  revealItems.forEach(item => observer.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('visible'));
}

const filters = [...document.querySelectorAll('.filter')];
const projects = [...document.querySelectorAll('.project-card[data-type]')];
const filterStatus = document.getElementById('filterStatus');

filters.forEach(filter => {
  filter.addEventListener('click', () => {
    filters.forEach(button => {
      button.classList.toggle('active', button === filter);
      button.setAttribute('aria-pressed', String(button === filter));
    });

    const value = filter.dataset.filter;
    let shown = 0;
    projects.forEach(card => {
      const matches = value === 'all' || card.dataset.type === value;
      card.classList.remove('is-filtering-out');
      if (matches) {
        card.classList.remove('is-hidden');
        shown++;
      } else if (reducedMotion) {
        card.classList.add('is-hidden');
      } else {
        card.classList.add('is-filtering-out');
        window.setTimeout(() => {
          if (card.classList.contains('is-filtering-out')) card.classList.add('is-hidden');
        }, 280);
      }
    });

    if (filterStatus) {
      const label = value === 'all' ? 'concepts' : `${value} concepts`;
      filterStatus.textContent = `Showing ${value === 'all' ? 'all ' : ''}${shown} ${label}${shown === 1 ? '' : ''}.`;
    }
  });
});

const projectDialog = document.getElementById('projectDialog');
if (projectDialog) {
  const fields = {
    title: document.getElementById('dialogTitle'),
    category: document.getElementById('dialogCategory'),
    summary: document.getElementById('dialogSummary'),
    challenge: document.getElementById('dialogChallenge'),
    approach: document.getElementById('dialogApproach'),
    outcome: document.getElementById('dialogOutcome')
  };

  document.querySelectorAll('.project-open').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.project-card');
      if (!card) return;
      fields.title.textContent = card.dataset.title;
      fields.category.textContent = card.dataset.category;
      fields.summary.textContent = card.dataset.summary;
      fields.challenge.textContent = card.dataset.challenge;
      fields.approach.textContent = card.dataset.approach;
      fields.outcome.textContent = card.dataset.outcome;
      projectDialog.showModal();
    });
  });

  projectDialog.querySelector('.dialog-close').addEventListener('click', () => projectDialog.close());
  projectDialog.addEventListener('click', event => {
    if (event.target === projectDialog) projectDialog.close();
  });
}

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-art');

  if (hero && heroArt) {
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
      if (card) card.style.transform = `rotateX(${-y * 5}deg) rotateY(${x * 6}deg)`;
    }, { passive: true });
    heroArt.addEventListener('pointerleave', () => {
      const card = heroArt.querySelector('.core-card');
      if (card) card.style.transform = '';
    });
  }

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    }, { passive: true });
  });
}

const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const briefPreview = document.getElementById('briefPreview');
const briefContent = document.getElementById('briefContent');
const copyBriefButton = document.getElementById('copyBrief');
const defaultCopyLabel = copyBriefButton?.innerHTML;
let preparedBrief = '';

if (form && briefPreview && briefContent) {
  const serviceParam = new URLSearchParams(window.location.search).get('service');
  const projectSelect = form.elements.namedItem('project');
  if (serviceParam && projectSelect) {
    const option = [...projectSelect.options].find(item => item.value === serviceParam);
    if (option) projectSelect.value = option.value;
  }

  function formValue(name) {
    return String(form.elements.namedItem(name)?.value || '').trim();
  }

  function resetPreparedBrief() {
    if (!briefPreview.hidden) {
      briefPreview.hidden = true;
      preparedBrief = '';
      if (copyBriefButton && defaultCopyLabel) copyBriefButton.innerHTML = defaultCopyLabel;
      if (formNote) formNote.textContent = 'Your answers changed. Prepare the brief again to update it.';
    }
  }

  form.addEventListener('input', resetPreparedBrief);
  form.addEventListener('change', resetPreparedBrief);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = formValue('name');
    const email = formValue('email');
    const project = formValue('project');
    const message = formValue('message');

    preparedBrief = [
      'NEXA STUDIO / PROJECT BRIEF',
      '================================',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Project: ${project}`,
      `Preferred start: ${formValue('timeline') || 'Flexible'}`,
      '',
      'THE IDEA',
      message,
      ...(formValue('context') ? ['', 'ADDITIONAL CONTEXT', formValue('context')] : []),
      '',
      'Prepared in my browser. Nothing has been sent.'
    ].join('\n');

    briefContent.textContent = preparedBrief;
    briefPreview.hidden = false;
    if (formNote) formNote.textContent = 'Your brief is ready below. Copy it or download it to share when you are ready.';
    briefPreview.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  });

  copyBriefButton?.addEventListener('click', async event => {
    if (!preparedBrief) return;
    const button = event.currentTarget;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard access is unavailable.');
      await navigator.clipboard.writeText(preparedBrief);
      button.textContent = 'Copied to clipboard ✓';
      if (formNote) formNote.textContent = 'Copied. Your project brief is still only on this device.';
    } catch {
      const selection = document.createElement('textarea');
      selection.value = preparedBrief;
      selection.setAttribute('readonly', '');
      selection.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(selection);
      try {
        selection.select();
        const copied = document.execCommand('copy');
        button.textContent = copied ? 'Copied to clipboard ✓' : 'Select the brief to copy';
        if (formNote) formNote.textContent = copied
          ? 'Copied. Your project brief is still only on this device.'
          : 'Clipboard access was unavailable. Select the brief above and copy it manually.';
      } catch {
        button.textContent = 'Select the brief to copy';
        if (formNote) formNote.textContent = 'Clipboard access was unavailable. Select the brief above and copy it manually.';
      } finally {
        selection.remove();
      }
    }
  });

  document.getElementById('downloadBrief')?.addEventListener('click', () => {
    if (!preparedBrief) return;
    const file = new Blob([preparedBrief], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexa-project-brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (formNote) formNote.textContent = 'Your project brief was downloaded. It was not sent or stored.';
  });
}
