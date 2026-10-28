/**
 * Interactive Wedding E-Invitation Engine
 * -------------------------------------------------------------
 * Provides envelope opening experience, canvas rose petals &
 * golden sparkles, dynamic countdown, Google Maps integration,
 * calendar sync, and live in-browser customization.
 */

(function () {
  'use strict';

  // Wedding Configuration (Guru S M & Pooja K)
  const englishConfig = {
    couple: {
      groom: {
        name: "Guru S M",
        title: "Groom",
        parents: "With the divine blessings of family & elders",
        bio: "Ready to embark on a sacred lifelong journey with his beloved Pooja.",
        image: "images/groom.jpg?v=3"
      },
      bride: {
        name: "Pooja K",
        title: "Bride",
        parents: "With the loving blessings of family & ancestors",
        bio: "Stepping into a lifetime of endless laughter, companionship, and joy with Guru.",
        image: "images/bride.jpg?v=3"
      },
      coupleImage: "images/couple.jpg",
      initials: "G & P",
      hashtag: "#GuruWedsPooja",
      invitationQuote: "Two souls united by destiny, blessed by tradition, beginning a lifetime of togetherness."
    },
    weddingDate: "2026-11-14T19:30:00",
    dateFormatted: "14th & 15th November 2026",
    muhurthamTime: "Auspicious Muhurtha: Sunday, 15th Nov • 9:15 AM – 10:45 AM",
    venue: {
      name: "Shree Rudreshwara Samudaya Bhavana",
      hall: "Main Kalyana Mantapa",
      address: "Hebbalu, NH-4 Highway, near hebbalu Toll plaza ,Davanagere District, Karnataka - 577556",
      city: "Hebbalu, Davanagere",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Shree+Rudreshwara+Samudaya+Bhavana,+Hebbalu,+near+hebbalu+Toll+plaza,+Davanagere",
      directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Shree+Rudreshwara+Samudaya+Bhavana,+Hebbalu,+near+hebbalu+Toll+plaza,+Davanagere",
      contactPerson: "Wedding Helpdesk / Family: +91 98765 43210"
    },
    events: [
      {
        id: "reception",
        title: "Grand Wedding Reception",
        subtitle: "Join us for an evening of warm greetings, dinner, and celebration",
        date: "Saturday, 14th November 2026",
        time: "07:30 PM onwards",
        venue: "Shree Rudreshwara Samudaya Bhavana, Hebbalu, Davanagere",
        badge: "Evening Celebration"
      },
      {
        id: "muhurtha",
        title: "Auspicious Wedding Ceremony (Muhurtha)",
        subtitle: "The sacred Dhaare / Mangalyadharana ritual under Vedic mantras and elder blessings",
        date: "Sunday, 15th November 2026",
        time: "09:15 AM to 10:45 AM (Lagnam)",
        venue: "Shree Rudreshwara Samudaya Bhavana, Hebbalu, Davanagere",
        badge: "Sacred Muhurtha"
      }
    ]
  };

  const kannada = window.weddingKannada;
  let language = 'en';
  let config = englishConfig;
  let languageChosen = false;
  let countdownInterval = null;
  let copyFeedbackTimeout = null;
  const englishUi = {
    ceremony: 'Ceremony', date: 'Date', time: 'Time', venue: 'Venue',
    addEvent: 'Add Event', directions: 'Directions', copyAddress: 'Copy Full Address',
    copied: 'Copied!', copyError: 'Could not copy the address. Please select and copy the address above.',
    openInvitation: 'Open Invitation', mapTitle: 'Venue Location Map', changeLanguage: 'Change language',
    calendarTitle: "Wedding of Guru S M & Pooja K",
    calendarIntro: 'Wedding Celebrations of Guru S M & Pooja K',
    calendarReception: 'Reception: Saturday, 14th November 2026, 7:30 PM onwards',
    calendarMuhurtha: 'Auspicious Muhurtha: Sunday, 15th November 2026, 9:15 AM – 10:45 AM',
    address: 'Address'
  };
  const ui = key => language === 'kn' ? kannada.ui[key] : englishUi[key];
  const localizedContent = Object.entries(kannada.content).map(([selector, translated]) => {
    const node = document.querySelector(selector);
    return { node, translated, original: node.innerHTML };
  });
  const originalTitle = document.title;
  const metadata = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]']
    .map(selector => ({ node: document.querySelector(selector), original: document.querySelector(selector).content }));
  const languageOverlay = document.getElementById('languageOverlay');
  const languageButtons = [...languageOverlay.querySelectorAll('[data-language]')];
  const changeLanguageBtn = document.getElementById('changeLanguageBtn');

  function setInvitationInert(inert) {
    document.getElementById('navbar').inert = inert;
    document.getElementById('mainContent').inert = inert;
  }

  function applyLanguage(selected) {
    language = selected;
    config = selected === 'kn' ? {
      ...englishConfig,
      couple: {
        ...englishConfig.couple, ...kannada.couple,
        groom: { ...englishConfig.couple.groom, ...kannada.couple.groom },
        bride: { ...englishConfig.couple.bride, ...kannada.couple.bride }
      },
      dateFormatted: kannada.dateFormatted,
      muhurthamTime: kannada.muhurthamTime,
      venue: { ...englishConfig.venue, ...kannada.venue },
      events: kannada.events
    } : englishConfig;
    document.documentElement.lang = selected;
    localizedContent.forEach(({ node, translated, original }) => {
      node.innerHTML = selected === 'kn' ? translated : original;
    });
    document.title = selected === 'kn' ? kannada.title : originalTitle;
    const translatedMetadata = [kannada.description, kannada.title, kannada.socialDescription];
    metadata.forEach(({ node, original }, index) => {
      node.content = selected === 'kn' ? translatedMetadata[index] : original;
    });
    elements.openInviteBtn.setAttribute('aria-label', ui('openInvitation'));
    elements.venueMapIframe.title = ui('mapTitle');
    changeLanguageBtn.setAttribute('aria-label', ui('changeLanguage'));
    elements.groomImg.alt = `${config.couple.groom.name} - ${config.couple.groom.title}`;
    elements.brideImg.alt = `${config.couple.bride.name} - ${config.couple.bride.title}`;
    clearTimeout(copyFeedbackTimeout);
    initData();
    startCountdown();
  }

  languageButtons.forEach(button => button.addEventListener('click', () => {
    applyLanguage(button.dataset.language);
    languageChosen = true;
    languageOverlay.hidden = true;
    document.body.classList.remove('choosing-language');
    changeLanguageBtn.hidden = false;
    const opened = elements.envelopeOverlay.classList.contains('opened');
    elements.envelopeOverlay.inert = opened;
    elements.envelopeOverlay.setAttribute('aria-hidden', String(opened));
    setInvitationInert(!opened);
    (opened ? changeLanguageBtn : elements.openInviteBtn).focus({ preventScroll: true });
  }));

  changeLanguageBtn.addEventListener('click', () => {
    languageOverlay.hidden = false;
    document.body.classList.add('choosing-language');
    setInvitationInert(true);
    elements.envelopeOverlay.inert = true;
    elements.envelopeOverlay.setAttribute('aria-hidden', 'true');
    languageButtons.find(button => button.dataset.language === language).focus();
  });

  languageOverlay.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const current = languageButtons.indexOf(document.activeElement);
      languageButtons[(current + (event.shiftKey ? -1 : 1) + languageButtons.length) % languageButtons.length].focus();
    }
    if (event.key === 'Escape' && languageChosen) {
      languageButtons.find(button => button.dataset.language === language).click();
    }
  });

  let canvasAnimationId = null;

  // Clear any old temporary customizer cached states
  try {
    localStorage.removeItem('wedding_custom_config');
  } catch (e) {}

  // --- DOM Elements ---
  const elements = {
    envelopeOverlay: document.getElementById('envelopeOverlay'),
    envelopeBox: document.getElementById('envelopeBox'),
    openInviteBtn: document.getElementById('openInviteBtn'),
    petalsCanvas: document.getElementById('petalsCanvas'),
    
    // Couple & Hero
    envCoupleNames: document.getElementById('envCoupleNames'),
    envInitials: document.getElementById('envInitials'),
    waxInitials: document.getElementById('waxInitials'),
    envDate: document.getElementById('envDate'),
    navInitials: document.getElementById('navInitials'),
    heroGroomName: document.getElementById('heroGroomName'),
    heroBrideName: document.getElementById('heroBrideName'),
    heroQuote: document.getElementById('heroQuote'),
    heroDateFormatted: document.getElementById('heroDateFormatted'),
    heroMuhurtham: document.getElementById('heroMuhurtham'),
    heroVenueSummary: document.getElementById('heroVenueSummary'),
    
    // Countdown
    cdDays: document.getElementById('cdDays'),
    cdHours: document.getElementById('cdHours'),
    cdMinutes: document.getElementById('cdMinutes'),
    cdSeconds: document.getElementById('cdSeconds'),
    
    // Couple Section
    groomNameCard: document.getElementById('groomNameCard'),
    groomParents: document.getElementById('groomParents'),
    groomBio: document.getElementById('groomBio'),
    groomImg: document.getElementById('groomImg'),
    brideNameCard: document.getElementById('brideNameCard'),
    brideParents: document.getElementById('brideParents'),
    brideBio: document.getElementById('brideBio'),
    brideImg: document.getElementById('brideImg'),
    coupleHashtag: document.getElementById('coupleHashtag'),
    
    // Itinerary & Venue
    eventsContainer: document.getElementById('eventsContainer'),
    venueName: document.getElementById('venueName'),
    venueHall: document.getElementById('venueHall'),
    venueAddress: document.getElementById('venueAddress'),
    venueHelpdesk: document.getElementById('venueHelpdesk'),
    venueDirectionsBtn: document.getElementById('venueDirectionsBtn'),
    venueMapIframe: document.getElementById('venueMapIframe'),
    venueMapLink: document.getElementById('venueMapLink'),
    navMapBtn: document.getElementById('navMapBtn'),
    heroMapBtn: document.getElementById('heroMapBtn'),
    copyAddressBtn: document.getElementById('copyAddressBtn'),
    
    // Actions
    addToCalBtn: document.getElementById('addToCalBtn'),
    
    // Footer
    footerInitials: document.getElementById('footerInitials'),
    footerDate: document.getElementById('footerDate')
  };

  /* ============================================================
     1. INITIALIZATION & DATA BINDING
  ============================================================ */
  function initData() {
    // Envelope Info
    if (elements.envCoupleNames) elements.envCoupleNames.textContent = `${config.couple.groom.name.split(' ')[0]} ${language === 'kn' ? 'ಮತ್ತು' : '&'} ${config.couple.bride.name.split(' ')[0]}`;
    if (elements.envInitials) elements.envInitials.textContent = config.couple.initials;
    if (elements.waxInitials) elements.waxInitials.textContent = language === 'kn' ? config.couple.initials : config.couple.initials.replace(/\s+/g, '');
    [elements.envInitials, elements.waxInitials, elements.navInitials, elements.footerInitials].forEach(node => {
      if (node) node.lang = 'en';
    });
    if (elements.envDate) elements.envDate.textContent = config.dateFormatted;
    
    // Navigation & Hero
    if (elements.navInitials) elements.navInitials.textContent = config.couple.initials;
    if (elements.heroGroomName) elements.heroGroomName.textContent = config.couple.groom.name;
    if (elements.heroBrideName) elements.heroBrideName.textContent = config.couple.bride.name;
    if (elements.heroQuote) elements.heroQuote.textContent = `"${config.couple.invitationQuote}"`;
    if (elements.heroDateFormatted) elements.heroDateFormatted.textContent = config.dateFormatted;
    if (elements.heroMuhurtham) elements.heroMuhurtham.textContent = config.muhurthamTime;
    if (elements.heroVenueSummary) elements.heroVenueSummary.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${config.venue.name}, ${config.venue.city}`;
    
    // Couple Section
    if (elements.groomNameCard) elements.groomNameCard.textContent = config.couple.groom.name;
    if (elements.groomParents) elements.groomParents.textContent = config.couple.groom.parents;
    if (elements.groomBio) elements.groomBio.textContent = config.couple.groom.bio;
    if (elements.groomImg && config.couple.groom.image) elements.groomImg.src = config.couple.groom.image;

    if (elements.brideNameCard) elements.brideNameCard.textContent = config.couple.bride.name;
    if (elements.brideParents) elements.brideParents.textContent = config.couple.bride.parents;
    if (elements.brideBio) elements.brideBio.textContent = config.couple.bride.bio;
    if (elements.brideImg && config.couple.bride.image) elements.brideImg.src = config.couple.bride.image;

    if (elements.coupleHashtag) elements.coupleHashtag.textContent = config.couple.hashtag;

    // Venue
    if (elements.venueName) elements.venueName.textContent = config.venue.name;
    if (elements.venueHall) elements.venueHall.textContent = config.venue.hall;
    if (elements.venueAddress) elements.venueAddress.textContent = config.venue.address;
    if (elements.venueHelpdesk) elements.venueHelpdesk.textContent = config.venue.contactPerson;
    if (elements.venueDirectionsBtn && config.venue.directionsUrl) {
      elements.venueDirectionsBtn.href = config.venue.directionsUrl;
    }
    if (elements.venueMapLink && config.venue.mapUrl) {
      elements.venueMapLink.href = config.venue.mapUrl;
    }
    if (elements.navMapBtn && config.venue.mapUrl) {
      elements.navMapBtn.href = config.venue.mapUrl;
    }
    if (elements.heroMapBtn && config.venue.mapUrl) {
      elements.heroMapBtn.href = config.venue.mapUrl;
    }
    if (elements.venueMapIframe && config.venue.address) {
      // Keep the same searchable place in both languages; localize map controls.
      const query = encodeURIComponent(`${englishConfig.venue.name}, ${englishConfig.venue.address}`);
      const mapSrc = `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed&hl=${language}`;
      if (elements.venueMapIframe.getAttribute('src') !== mapSrc) elements.venueMapIframe.src = mapSrc;
    }

    // Footer
    if (elements.footerInitials) elements.footerInitials.textContent = config.couple.initials;
    if (elements.footerDate) elements.footerDate.textContent = `${config.dateFormatted} • ${config.venue.name}, ${config.venue.city}`;

    // Render Events Itinerary
    renderEvents();
  }

  /* ============================================================
     2. RENDER EVENTS (ITINERARY)
  ============================================================ */
  function renderEvents() {
    if (!elements.eventsContainer || !config.events) return;
    elements.eventsContainer.innerHTML = '';

    config.events.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'event-card';

      // Google Calendar link for this event
      const calTitle = encodeURIComponent(language === 'kn' ? `${evt.title} - ${ui('calendarTitle')}` : `${evt.title} - ${config.couple.groom.name} & ${config.couple.bride.name}'s Wedding`);
      const calDetails = encodeURIComponent(`${evt.subtitle}\n${ui('venue')}: ${evt.venue}`);
      const calLocation = encodeURIComponent(`${evt.venue}`);
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&details=${calDetails}&location=${calLocation}`;

      const mapUrl = config.venue.directionsUrl || `https://maps.google.com/?q=${encodeURIComponent(evt.venue)}`;

      card.innerHTML = `
        <div class="event-card-header">
          <span class="event-badge">${evt.badge || ui('ceremony')}</span>
        </div>
        <h3 class="event-title">${evt.title}</h3>
        <p class="event-subtitle">${evt.subtitle}</p>
        
        <ul class="event-info-list">
          <li class="event-info-item">
            <i class="fa-regular fa-calendar-days"></i>
            <div>
              <strong>${ui('date')}</strong>
              <span>${evt.date}</span>
            </div>
          </li>
          <li class="event-info-item">
            <i class="fa-regular fa-clock"></i>
            <div>
              <strong>${ui('time')}</strong>
              <span>${evt.time}</span>
            </div>
          </li>
          <li class="event-info-item">
            <i class="fa-solid fa-location-pin"></i>
            <div>
              <strong>${ui('venue')}</strong>
              <span>${evt.venue}</span>
            </div>
          </li>
        </ul>

        <div class="event-actions">
          <a href="${googleCalUrl}" target="_blank" rel="noopener noreferrer" class="event-cal-btn">
            <i class="fa-regular fa-calendar-plus"></i> ${ui('addEvent')}
          </a>
          <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="event-map-btn">
            <i class="fa-solid fa-location-dot"></i> ${ui('directions')}
          </a>
        </div>
      `;
      elements.eventsContainer.appendChild(card);
    });
  }

  /* ============================================================
     3. COUNTDOWN TIMER
  ============================================================ */
  function startCountdown() {
    clearInterval(countdownInterval);
    function update() {
      const targetDate = new Date(config.weddingDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        if (elements.cdDays) elements.cdDays.textContent = '00';
        if (elements.cdHours) elements.cdHours.textContent = '00';
        if (elements.cdMinutes) elements.cdMinutes.textContent = '00';
        if (elements.cdSeconds) elements.cdSeconds.textContent = '00';
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (elements.cdDays) elements.cdDays.textContent = String(days).padStart(2, '0');
      if (elements.cdHours) elements.cdHours.textContent = String(hours).padStart(2, '0');
      if (elements.cdMinutes) elements.cdMinutes.textContent = String(minutes).padStart(2, '0');
      if (elements.cdSeconds) elements.cdSeconds.textContent = String(seconds).padStart(2, '0');
    }

    update();
    countdownInterval = setInterval(update, 1000);
  }

  /* ============================================================
     4. ENVELOPE UNSEALING CEREMONY
  ============================================================ */
  if (elements.openInviteBtn) {
    elements.openInviteBtn.addEventListener('click', function () {
      if (elements.envelopeBox.classList.contains('unsealing')) return;
      // Trigger flap opening & card slide
      elements.envelopeBox.classList.add('unsealing');

      // Start canvas rose petals & golden sparklers
      initPetalsCanvas();

      // Smoothly dismiss envelope overlay after animation finishes
      setTimeout(() => {
        elements.envelopeOverlay.classList.add('opened');
        elements.envelopeOverlay.inert = true;
        elements.envelopeOverlay.setAttribute('aria-hidden', 'true');
        if (languageOverlay.hidden) {
          setInvitationInert(false);
          document.getElementById('hero').setAttribute('tabindex', '-1');
          document.getElementById('hero').focus({ preventScroll: true });
        }
      }, 1100);
    });
  }

  /* ============================================================
     5. FLOATING ROSE PETALS & GOLDEN SPARKLES CANVAS
  ============================================================ */
  function initPetalsCanvas() {
    const canvas = elements.petalsCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 35; // optimal performance

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(width, height, true));
    }

    function createParticle(w, h, randomY) {
      const isGold = Math.random() > 0.45;
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -20,
        size: isGold ? Math.random() * 3 + 2 : Math.random() * 12 + 8,
        speedX: Math.random() * 1.5 - 0.75,
        speedY: Math.random() * 1.2 + 0.8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        isGold: isGold,
        opacity: Math.random() * 0.6 + 0.3
      };
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          Object.assign(p, createParticle(width, height, false));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.isGold) {
          // Golden sparkle
          ctx.fillStyle = '#f3e5ab';
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Soft rose petal
          ctx.fillStyle = '#b72449';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.65, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      canvasAnimationId = requestAnimationFrame(animate);
    }

    if (!canvasAnimationId) {
      animate();
    }
  }

  /* ============================================================
     6. ADD TO CALENDAR & COPY ADDRESS
  ============================================================ */
  if (elements.addToCalBtn) {
    elements.addToCalBtn.addEventListener('click', () => {
      const title = encodeURIComponent(ui('calendarTitle'));
      const details = encodeURIComponent(
        `${ui('calendarIntro')}\n\n` +
        `• ${ui('calendarReception')}\n` +
        `• ${ui('calendarMuhurtha')}\n\n` +
        `${ui('venue')}: ${config.venue.name}\n` +
        `${ui('address')}: ${config.venue.address}\n` +
        `${ui('directions')}: ${config.venue.directionsUrl}`
      );
      const location = encodeURIComponent(`${config.venue.name}, ${config.venue.address}`);
      const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
      window.open(calUrl, '_blank');
    });
  }

  if (elements.copyAddressBtn) {
    elements.copyAddressBtn.addEventListener('click', async () => {
      const fullAddress = `${config.venue.name}, ${config.venue.address}`;
      const copiedLanguage = language;
      try {
        await navigator.clipboard.writeText(fullAddress);
        if (copiedLanguage !== language) return;
        elements.copyAddressBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${ui('copied')}`;
        clearTimeout(copyFeedbackTimeout);
        copyFeedbackTimeout = setTimeout(() => {
          elements.copyAddressBtn.innerHTML = `<i class="fa-regular fa-copy"></i> ${ui('copyAddress')}`;
        }, 2200);
      } catch (error) {
        window.alert(ui('copyError'));
      }
    });
  }

  // Boot
  initData();
  startCountdown();
  languageButtons[0].focus();

})();
