(() => {
  const baseHeight = 60;

  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (value == null || value === '') {
      el.textContent = '';
      return;
    }
    el.textContent = value;
  };

  const clearEl = el => {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  };

  const createLink = (label, href, className) => {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = href || '#';
    if (className) link.className = className;
    return link;
  };

  const createButtonLink = (btn) => {
    const link = createLink(btn.label || 'Learn more', btn.href || '#', 'btn');
    if (btn.style === 'primary') link.classList.add('primary');
    return link;
  };

  const renderNav = (siteData, lang) => {
    const brand = siteData?.brand?.[lang] || siteData?.brand || {};
    const nav = siteData?.nav?.[lang] || siteData?.nav || {};
    setText('logo-text', brand.name || 'Team');
    const logoEl = document.getElementById('logo-mark');
    if (logoEl && brand.logoText) logoEl.textContent = brand.logoText;

    const actionsEl = document.getElementById('nav-actions');
    clearEl(actionsEl);
    (nav.actions || []).forEach(action => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-icon-btn';
      btn.id = action.id || '';
      if (action.id === 'lang-toggle') {
        btn.textContent = lang === 'nl' ? 'EN' : 'NL';
        btn.title = lang === 'nl' ? 'Switch language' : 'Wissel taal';
      } else {
        btn.title = action.title || action.label || '';
        btn.textContent = action.label || 'BTN';
      }
      actionsEl.appendChild(btn);
    });

    const cardsEl = document.getElementById('nav-cards');
    clearEl(cardsEl);
    (nav.cards || []).forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = 'nav-card';
      if (card.tone) cardEl.classList.add(card.tone);

      const label = document.createElement('div');
      label.className = 'nav-card-label';
      label.textContent = card.label || 'Menu';
      cardEl.appendChild(label);

      const links = document.createElement('div');
      links.className = 'nav-card-links';
      (card.links || []).forEach(link => {
        const linkEl = createLink(link.label || 'Link', link.href || '#', 'nav-card-link');
        links.appendChild(linkEl);
      });
      cardEl.appendChild(links);
      cardsEl.appendChild(cardEl);
    });

    const navEl = document.getElementById('card-nav');
    const contentEl = document.getElementById('nav-cards');
    const toggleBtn = document.getElementById('nav-toggle');
    const langBtn = document.getElementById('lang-toggle');

    const setNavHeight = (open) => {
      if (!navEl || !contentEl) return;
      if (open) {
        navEl.style.height = `${baseHeight + contentEl.scrollHeight + 24}px`;
      } else {
        navEl.style.height = `${baseHeight}px`;
      }
    };

    if (toggleBtn && navEl) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = navEl.classList.toggle('open');
        toggleBtn.classList.toggle('open', isOpen);
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        setNavHeight(isOpen);
      });

      window.addEventListener('resize', () => {
        setNavHeight(navEl.classList.contains('open'));
      });
    }

    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const next = lang === 'nl' ? 'en' : 'nl';
        localStorage.setItem('lang', next);
        window.location.reload();
      });
    }

    setNavHeight(false);
  };

  const renderHero = (hero) => {
    if (!hero) return;
    setText('hero-kicker', hero.kicker);
    setText('hero-title', hero.title);
    setText('hero-highlight', hero.highlight);
    setText('hero-lead', hero.lead);

    const actionsEl = document.getElementById('hero-actions');
    clearEl(actionsEl);
    (hero.actions || []).forEach(action => actionsEl.appendChild(createButtonLink(action)));

    const linksEl = document.getElementById('hero-links');
    clearEl(linksEl);
    (hero.quickLinks || []).forEach(link => {
      const pill = createLink(link.label || 'Link', link.href || '#', 'pill');
      linksEl.appendChild(pill);
    });
  };

  const renderStats = (stats) => {
    const grid = document.getElementById('stats-grid');
    clearEl(grid);
    (stats || []).forEach(stat => {
      const card = document.createElement('div');
      card.className = 'card stat-card';
      const value = document.createElement('div');
      value.className = 'stat-value';
      value.textContent = stat.value || '0';
      const label = document.createElement('div');
      label.className = 'muted';
      label.textContent = stat.label || '';
      card.appendChild(value);
      card.appendChild(label);
      grid.appendChild(card);
    });
  };

  const renderCardGrid = (containerId, items) => {
    const grid = document.getElementById(containerId);
    clearEl(grid);
    (items || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const title = document.createElement('h3');
      title.textContent = item.title || '';
      const text = document.createElement('p');
      text.className = 'muted';
      text.textContent = item.text || '';
      card.appendChild(title);
      card.appendChild(text);
      grid.appendChild(card);
    });
  };

  const renderTeam = (team) => {
    if (!team) return;
    setText('team-kicker', team.kicker);
    setText('team-title', team.title);
    const grid = document.getElementById('team-grid');
    clearEl(grid);
    (team.members || []).forEach(member => {
      const card = document.createElement('div');
      card.className = 'card';
      const name = document.createElement('h3');
      name.textContent = member.name || '';
      const role = document.createElement('div');
      role.className = 'muted';
      role.textContent = member.role || '';
      card.appendChild(name);
      card.appendChild(role);
      grid.appendChild(card);
    });
  };

  const renderGallery = (gallery) => {
    if (!gallery) return;
    setText('gallery-kicker', gallery.kicker);
    setText('gallery-title', gallery.title);
    const grid = document.getElementById('gallery-grid');
    clearEl(grid);
    (gallery.items || []).forEach(item => {
      const card = document.createElement('figure');
      card.className = 'card media-card';
      const img = document.createElement('img');
      img.src = item.image || '';
      img.alt = item.label || '';
      const caption = document.createElement('figcaption');
      caption.textContent = item.label || '';
      card.appendChild(img);
      card.appendChild(caption);
      grid.appendChild(card);
    });
  };

  const renderSponsors = (sponsors) => {
    if (!sponsors) return;
    setText('sponsors-kicker', sponsors.kicker);
    setText('sponsors-title', sponsors.title);
    const grid = document.getElementById('sponsor-grid');
    clearEl(grid);
    (sponsors.items || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'card sponsor-card';
      const img = document.createElement('img');
      img.src = item.logo || '';
      img.alt = item.name || '';
      const name = document.createElement('div');
      name.className = 'muted';
      name.textContent = item.name || '';
      card.appendChild(img);
      card.appendChild(name);
      grid.appendChild(card);
    });

    setText('sponsor-cta-title', sponsors.cta?.title);
    setText('sponsor-cta-text', sponsors.cta?.text);
    const ctaEl = document.getElementById('sponsor-cta-buttons');
    clearEl(ctaEl);
    (sponsors.cta?.buttons || []).forEach(btn => ctaEl.appendChild(createButtonLink(btn)));
  };

  const renderContact = (contact) => {
    if (!contact) return;
    setText('contact-title', contact.title);
    setText('contact-lead', contact.lead);
    setText('contact-email', contact.email);
    setText('contact-submit', contact.submitLabel || 'Send message');
    const formEl = document.getElementById('contact-form');
    clearEl(formEl);
    if (contact.form?.action) formEl.setAttribute('action', contact.form.action);
    formEl.setAttribute('method', contact.form?.method || 'POST');
    formEl.setAttribute('accept-charset', 'UTF-8');
    if (contact.form?.redirect) {
      const redirect = document.createElement('input');
      redirect.type = 'hidden';
      redirect.name = '_redirect';
      redirect.value = contact.form.redirect;
      formEl.appendChild(redirect);
    }
    (contact.form?.fields || []).forEach(field => {
      const wrap = document.createElement('label');
      wrap.className = 'form-field';
      const label = document.createElement('span');
      label.textContent = field.label || '';
      let input;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
      } else {
        input = document.createElement('input');
        input.type = field.type || 'text';
      }
      input.name = field.name || '';
      input.placeholder = field.placeholder || '';
      wrap.appendChild(label);
      wrap.appendChild(input);
      formEl.appendChild(wrap);
    });
  };

  const renderCountdown = (countdown) => {
    if (!countdown) return;
    setText('countdown-label', countdown.label);
    const valueEl = document.getElementById('countdown-value');
    if (!valueEl) return;

    const target = new Date(countdown.target);
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        valueEl.textContent = '00d 00h 00m 00s';
        return;
      }
      const sec = Math.floor(diff / 1000);
      const days = Math.floor(sec / 86400);
      const hours = Math.floor((sec % 86400) / 3600);
      const mins = Math.floor((sec % 3600) / 60);
      const secs = sec % 60;
      valueEl.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
    };
    tick();
    setInterval(tick, 1000);
  };

  const renderIndex = (data) => {
    renderHero(data.hero);
    renderCountdown(data.countdown);
    renderStats(data.stats);
    renderCardGrid('about-grid', data.aboutCards);
    renderTeam(data.team);
    renderGallery(data.gallery);
    renderSponsors(data.sponsors);
    renderContact(data.contact);
  };

  const renderInfo = (data) => {
    renderHero(data.hero);
    setText('values-kicker', data.headings?.valuesKicker);
    setText('values-title', data.headings?.valuesTitle);
    setText('leaders-kicker', data.headings?.leadersKicker);
    setText('leaders-title', data.headings?.leadersTitle);
    setText('members-kicker', data.headings?.membersKicker);
    setText('members-title', data.headings?.membersTitle);
    renderCardGrid('info-sections', data.sections);
    renderCardGrid('values-grid', data.values);

    const leaders = document.getElementById('leaders-grid');
    clearEl(leaders);
    (data.leaders || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const name = document.createElement('h3');
      name.textContent = item.name || '';
      const role = document.createElement('div');
      role.className = 'muted';
      role.textContent = item.role || '';
      const note = document.createElement('p');
      note.className = 'muted';
      note.textContent = item.note || '';
      card.appendChild(name);
      card.appendChild(role);
      card.appendChild(note);
      leaders.appendChild(card);
    });

    const members = document.getElementById('members-grid');
    clearEl(members);
    (data.members || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const name = document.createElement('h3');
      name.textContent = item.name || '';
      const role = document.createElement('div');
      role.className = 'muted';
      role.textContent = item.role || '';
      card.appendChild(name);
      card.appendChild(role);
      members.appendChild(card);
    });
  };

  const renderSponsorsPage = (data) => {
    renderHero(data.hero);
    const grid = document.getElementById('package-grid');
    clearEl(grid);
    (data.packages || []).forEach(pkg => {
      const card = document.createElement('div');
      card.className = 'card package-card';
      if (pkg.featured) card.classList.add('featured');
      const title = document.createElement('h3');
      title.textContent = pkg.name || '';
      const price = document.createElement('div');
      price.className = 'price-tag';
      price.textContent = pkg.price || '';
      const perks = document.createElement('ul');
      (pkg.perks || []).forEach(perk => {
        const li = document.createElement('li');
        li.textContent = perk;
        perks.appendChild(li);
      });
      const reqTitle = document.createElement('div');
      reqTitle.className = 'kicker';
      reqTitle.textContent = 'Requirements';
      const reqs = document.createElement('ul');
      (pkg.requirements || []).forEach(req => {
        const li = document.createElement('li');
        li.textContent = req;
        reqs.appendChild(li);
      });
      card.appendChild(price);
      card.appendChild(title);
      card.appendChild(perks);
      card.appendChild(reqTitle);
      card.appendChild(reqs);
      grid.appendChild(card);
    });

    setText('practical-title', data.practical?.title);
    const practical = document.getElementById('practical-list');
    clearEl(practical);
    (data.practical?.items || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      practical.appendChild(li);
    });

    setText('sponsor-cta-title', data.cta?.title);
    setText('sponsor-cta-text', data.cta?.text);
    const ctaButtons = document.getElementById('sponsor-cta-buttons');
    clearEl(ctaButtons);
    (data.cta?.buttons || []).forEach(btn => ctaButtons.appendChild(createButtonLink(btn)));
  };

  const renderTerms = (data) => {
    renderHero(data.hero);
    const grid = document.getElementById('terms-grid');
    clearEl(grid);
    (data.sections || []).forEach(section => {
      const card = document.createElement('div');
      card.className = 'card';
      const title = document.createElement('h3');
      title.textContent = section.title || '';
      const list = document.createElement('ul');
      (section.items || []).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      card.appendChild(title);
      card.appendChild(list);
      grid.appendChild(card);
    });
  };

  const renderThankYou = (data) => {
    renderHero(data.hero);
    const steps = document.getElementById('thankyou-steps');
    clearEl(steps);
    (data.steps || []).forEach(step => {
      const card = document.createElement('div');
      card.className = 'card';
      const title = document.createElement('h3');
      title.textContent = step.title || '';
      const text = document.createElement('p');
      text.className = 'muted';
      text.textContent = step.text || '';
      card.appendChild(title);
      card.appendChild(text);
      steps.appendChild(card);
    });

    const links = document.getElementById('thankyou-links');
    clearEl(links);
    (data.links || []).forEach(btn => links.appendChild(createButtonLink(btn)));
  };

  const render404 = (data) => {
    renderHero(data.hero);
    const links = document.getElementById('error-links');
    clearEl(links);
    (data.links || []).forEach(btn => links.appendChild(createButtonLink(btn)));

    const tips = document.getElementById('error-tips');
    clearEl(tips);
    (data.tips || []).forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      tips.appendChild(li);
    });
  };

  const renderTest = (data) => {
    renderHero(data.hero);
    renderCardGrid('test-grid', data.cards);
  };

  const applyMeta = (meta) => {
    if (!meta) return;
    if (meta.title) document.title = meta.title;
    const descEl = qs('meta[name="description"]');
    if (descEl && meta.description) descEl.setAttribute('content', meta.description);
  };

  const init = async () => {
    const page = document.body.dataset.page;
    if (!page) return;
    try {
      const storedLang = localStorage.getItem('lang');
      const lang = storedLang === 'en' || storedLang === 'nl' ? storedLang : 'nl';
      document.documentElement.lang = lang;

      const [siteRes, pageRes] = await Promise.all([
        fetch('data/site.json', { cache: 'no-store' }),
        fetch(`data/${lang}/${page}.json`, { cache: 'no-store' })
      ]);
      if (!siteRes.ok || !pageRes.ok) return;
      const siteData = await siteRes.json();
      const data = await pageRes.json();
      applyMeta(data.meta);
      renderNav(siteData, lang);
      switch (page) {
        case 'index':
          renderIndex(data);
          break;
        case 'info':
          renderInfo(data);
          break;
        case 'sponsors':
          renderSponsorsPage(data);
          break;
        case 'terms':
          renderTerms(data);
          break;
        case 'thankyou':
          renderThankYou(data);
          break;
        case '404':
          render404(data);
          break;
        case 'test':
          renderTest(data);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Failed to load page data', err);
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
