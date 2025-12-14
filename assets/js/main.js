/**
* Template Name: Learner
* Template URL: https://bootstrapmade.com/learner-bootstrap-course-template/
* Updated: Jul 08 2025 with Bootstrap v5.3.7
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Role management
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  // Notification functionality for header bell
  const notificationBell = document.querySelector('.notification-bell');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const notificationBadge = document.getElementById('notification-badge');
  const notificationList = document.getElementById('notification-list');
  const closeNotification = document.getElementById('close-notification');
  const markAllRead = document.getElementById('mark-all-read');

  if (notificationBell && notificationDropdown) {
    // LocalStorage key
    const LS_KEYS = {
      notifs: 'cs_notifs'
    };

    // Seed data if empty
    function seedIfEmpty() {
      if (!localStorage.getItem(LS_KEYS.notifs)) {
        const now = Date.now();
        const seedNotifs = [
          {
            id: cryptoRandom(),
            title: 'Welcome to SorSUlyap',
            message: 'Stay updated with your schedules and announcements. Learn more about our features.',
            timestamp: now - 86400000,
            read: false,
            sender: 'Admin',
            link: 'index.html#welcome'
          },
          {
            id: cryptoRandom(),
            title: 'System Maintenance',
            message: 'Scheduled maintenance this weekend from 2 AM to 4 AM. Service might be interrupted.',
            timestamp: now - 3600000,
            read: false,
            sender: 'Admin',
            link: 'customer.html'
          },
          {
            id: cryptoRandom(),
            title: 'New Course Available',
            message: 'Introduction to Computer Science is now open for enrollment. Register today!',
            timestamp: now - 7200000,
            read: false,
            sender: 'Admin',
            link: 'classSched.html'
          }
        ];
        localStorage.setItem(LS_KEYS.notifs, JSON.stringify(seedNotifs));
      }
    }

    function cryptoRandom() {
      try { return crypto.getRandomValues(new Uint32Array(1))[0].toString(16) + Date.now().toString(16); }
      catch { return Math.random().toString(16).slice(2) + Date.now().toString(16); }
    }

    // Helpers to load/save
    const load = (k) => JSON.parse(localStorage.getItem(k) || '[]');
    const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

    // Format timestamp
    function formatTimestamp(ts) {
      const now = Date.now();
      const diff = now - ts;
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;

      // For older dates, show actual date
      const date = new Date(ts);
      return date.toLocaleDateString();
    }

            // Escape HTML
            function escapeHtml(s) { return (s||'').replace(/[&<>]/g, c=>({"&":"&","<":"<",">":">"}[c])); }

            // Expose addTestNotification function globally
            window.addTestNotification = function() {
                const notifs = load(LS_KEYS.notifs);
                const testLinks = ['index.html', 'classSched.html', 'customer.html', 'calendar.html'];
                const randomLink = testLinks[Math.floor(Math.random() * testLinks.length)];

                notifs.unshift({
                    id: cryptoRandom(),
                    title: 'Test Notification ' + (notifs.length + 1),
                    message: 'This is a test notification to demonstrate the functionality. Click to navigate to content.',
                    timestamp: Date.now(),
                    read: false,
                    sender: 'System Test',
                    link: randomLink
                });
                save(LS_KEYS.notifs, notifs);
                renderNotifications();
            };

    // Calculate unread count
    function getUnreadCount(notifs) {
      return notifs.filter(n => !n.read).length;
    }

    // Render notifications
    function renderNotifications() {
      const notifs = load(LS_KEYS.notifs);
      const unreadCount = getUnreadCount(notifs);

      // Update badge
      if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        notificationBadge.style.display = 'flex';
      } else {
        notificationBadge.style.display = 'none';
      }

      // Render notification list
      if (notificationList) {
        if (notifs.length === 0) {
          notificationList.innerHTML = `
            <div class="notification-empty">
              <i class="fas fa-bell-slash"></i>
              <p>No notifications yet</p>
            </div>
          `;
          return;
        }

        // Sort by timestamp (newest first) and limit to recent
        const recentNotifs = notifs
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        notificationList.innerHTML = recentNotifs.map(n => `
          <div class="notification-card ${n.read ? '' : 'unread'}" data-id="${n.id}">
            <div class="notification-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="notification-content">
              <div class="notification-sender">${escapeHtml(n.sender)}</div>
              <div class="notification-title">${escapeHtml(n.title)}</div>
              <div class="notification-message">${escapeHtml(n.message)}</div>
              <div class="notification-timestamp">${formatTimestamp(n.timestamp)}</div>
            </div>
            <button class="dismiss-btn" data-action="dismiss" data-id="${n.id}">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('');
      }
    }

    // Toggle notification dropdown
    function toggleNotificationDropdown() {
      const isVisible = notificationDropdown.style.display === 'block';
      if (isVisible) {
        notificationDropdown.style.display = 'none';
      } else {
        renderNotifications();
        notificationDropdown.style.display = 'block';
        setTimeout(() => notificationDropdown.style.opacity = '1', 10);
      }
    }

    // Close notification dropdown
    function closeNotificationDropdown() {
      notificationDropdown.style.display = 'none';
      notificationDropdown.style.opacity = '0';
    }

    // Mark notification as read
    function markAsRead(notificationId) {
      const notifs = load(LS_KEYS.notifs);
      const notif = notifs.find(n => n.id === notificationId);
      if (notif && !notif.read) {
        notif.read = true;
        save(LS_KEYS.notifs, notifs);
        renderNotifications();
      }
    }

    // Dismiss notification
    function dismissNotification(notificationId) {
      const notifs = load(LS_KEYS.notifs);
      const updatedNotifs = notifs.filter(n => n.id !== notificationId);
      save(LS_KEYS.notifs, updatedNotifs);
      renderNotifications();
    }

    // Mark all notifications as read
    function markAllAsRead() {
      const notifs = load(LS_KEYS.notifs);
      notifs.forEach(n => n.read = true);
      save(LS_KEYS.notifs, notifs);
      renderNotifications();
    }

    // Event listeners
    notificationBell.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNotificationDropdown();
    });

    if (closeNotification) {
      closeNotification.addEventListener('click', closeNotificationDropdown);
    }

    if (markAllRead) {
      markAllRead.addEventListener('click', markAllAsRead);
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!notificationBell.contains(e.target) && !notificationDropdown.contains(e.target)) {
        closeNotificationDropdown();
      }
    });

    // Handle notification card interactions
    notificationList?.addEventListener('click', (e) => {
      const card = e.target.closest('.notification-card');
      const dismissBtn = e.target.closest('.dismiss-btn');

      if (dismissBtn) {
        // Handle dismiss action
        e.stopPropagation();
        const notificationId = dismissBtn.getAttribute('data-id');
        dismissNotification(notificationId);
      } else if (card) {
        // Handle card click (mark as read and navigate to notification link)
        const notificationId = card.getAttribute('data-id');
        const notifs = load(LS_KEYS.notifs);
        const notification = notifs.find(n => n.id === notificationId);

        if (notification) {
          markAsRead(notificationId);
          // Navigate to notification's specific link, or notifications page as fallback
          const targetLink = notification.link || 'notifications.html';
          window.location.href = targetLink;
        }
      }
    });

    // Prevent propagation on dropdown clicks
    notificationDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Initialize
    seedIfEmpty();
    renderNotifications();
  }

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Handle download buttons
   */
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (this.disabled) return; // Skip if disabled

      // Find the attachment name
      const attachmentItem = this.closest('.attachment-item');
      const attachmentName = attachmentItem?.querySelector('.attachment-name')?.textContent || 'file.pdf';

      // Show download feedback
      showDownloadMessage(attachmentName);
    });
  });

  function showDownloadMessage(filename) {
    // Create a temporary message
    const msg = document.createElement('div');
    msg.className = 'download-message';
    msg.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: #e8a5a5; color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <i class="fas fa-download"></i>
        Downloading "${filename}"...
        <br><small>The file will be saved to your downloads folder.</small>
      </div>
    `;
    document.body.appendChild(msg);

    // Remove after 3 seconds
    setTimeout(() => {
      if (msg.parentNode) msg.parentNode.removeChild(msg);
    }, 3000);
  }

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /*
   * Pricing Toggle
   */

  const pricingContainers = document.querySelectorAll('.pricing-toggle-container');

  pricingContainers.forEach(function(container) {
    const pricingSwitch = container.querySelector('.pricing-toggle input[type="checkbox"]');
    const monthlyText = container.querySelector('.monthly');
    const yearlyText = container.querySelector('.yearly');

    pricingSwitch.addEventListener('change', function() {
      const pricingItems = container.querySelectorAll('.pricing-item');

      if (this.checked) {
        monthlyText.classList.remove('active');
        yearlyText.classList.add('active');
        pricingItems.forEach(item => {
          item.classList.add('yearly-active');
        });
      } else {
        monthlyText.classList.add('active');
        yearlyText.classList.remove('active');
        pricingItems.forEach(item => {
          item.classList.remove('yearly-active');
        });
      }
    });
  });

// -----------------------------
  // Customer Service UI Behavior
  // -----------------------------
  const IS_CUSTOMER_PAGE = document.querySelector('#faq') || document.querySelector('#notification-center') || document.querySelector('#feedback');
  if (IS_CUSTOMER_PAGE) {
    // LocalStorage keys
    const LS_KEYS = {
      faqs: 'cs_faqs',
      notifs: 'cs_notifs',
      feedback: 'cs_feedback'
    };

    // Seed data if empty
    function seedIfEmpty() {
      if (!localStorage.getItem(LS_KEYS.faqs)) {
        const seedFaqs = [
          { id: cryptoRandom(), category: 'general', q: 'What is SorSUlyap?', a: 'SorSUlyap is a portal to keep students informed about schedules and announcements.' },
          { id: cryptoRandom(), category: 'account', q: 'How do I reset my password?', a: 'Use the Forgot Password link on the login page to receive reset instructions.' },
          { id: cryptoRandom(), category: 'technical', q: 'The page is not loading properly.', a: 'Try clearing your cache or using a different browser.' },
          { id: cryptoRandom(), category: 'billing', q: 'Do I need to pay to access features?', a: 'Core features are free for students; some advanced tools may require permissions.' }
        ];
        localStorage.setItem(LS_KEYS.faqs, JSON.stringify(seedFaqs));
      }
      if (!localStorage.getItem(LS_KEYS.notifs)) {
        const now = Date.now();
        const seedNotifs = [
          { id: cryptoRandom(), title: 'Welcome to SorSUlyap', message: 'Stay updated with your schedules and events.', ts: now - 86400000, read: false },
          { id: cryptoRandom(), title: 'System Update', message: 'Maintenance scheduled this weekend.', ts: now - 3600000, read: false }
        ];
        localStorage.setItem(LS_KEYS.notifs, JSON.stringify(seedNotifs));
      }
      if (!localStorage.getItem(LS_KEYS.feedback)) {
        localStorage.setItem(LS_KEYS.feedback, JSON.stringify([]));
      }
    }

    function cryptoRandom() {
      try { return crypto.getRandomValues(new Uint32Array(1))[0].toString(16) + Date.now().toString(16); }
      catch { return Math.random().toString(16).slice(2) + Date.now().toString(16); }
    }

    // Helpers to load/save
    const load = (k) => JSON.parse(localStorage.getItem(k) || '[]');
    const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

    // ---------------- FAQ -----------------
    const faqAccordion = document.getElementById('faq-accordion');
    const faqSearch = document.getElementById('faq-search');
    const faqFilter = document.getElementById('faq-category-filter');
    const faqAdminTBody = document.getElementById('faq-admin-tbody');
    const faqAddBtn = document.getElementById('faq-add-btn');

    function renderFaqs() {
      const faqs = load(LS_KEYS.faqs);
      const term = (faqSearch?.value || '').toLowerCase();
      const category = faqFilter?.value || 'all';
      const filtered = faqs.filter(f => {
        const matchCat = category === 'all' || f.category === category;
        const hay = (f.q + ' ' + f.a).toLowerCase();
        const matchTerm = !term || hay.includes(term);
        return matchCat && matchTerm;
      });

      if (faqAccordion) {
        faqAccordion.innerHTML = filtered.map((f, idx) => `
          <div class="accordion-item">
            <h2 class="accordion-header" id="faq-h-${f.id}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-c-${f.id}" aria-expanded="false" aria-controls="faq-c-${f.id}">
                <span class="badge bg-light text-dark me-2 text-uppercase">${f.category}</span> ${f.q}
              </button>
            </h2>
            <div id="faq-c-${f.id}" class="accordion-collapse collapse" aria-labelledby="faq-h-${f.id}" data-bs-parent="#faq-accordion">
              <div class="accordion-body">${escapeHtml(f.a)}</div>
            </div>
          </div>
        `).join('');
      }

      if (faqAdminTBody) {
        faqAdminTBody.innerHTML = faqs.map(f => `
          <tr>
            <td>
              <select class="form-select form-select-sm" data-edit="category" data-id="${f.id}">
                ${['general','account','technical','billing'].map(c=>`<option value="${c}" ${c===f.category?'selected':''}>${cap(c)}</option>`).join('')}
              </select>
            </td>
            <td><input class="form-control form-control-sm" data-edit="q" data-id="${f.id}" value="${escapeAttr(f.q)}"></td>
            <td><textarea class="form-control form-control-sm" rows="2" data-edit="a" data-id="${f.id}">${escapeHtml(f.a)}</textarea></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${f.id}"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `).join('');
      }
    }

    function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
    function escapeHtml(s){ return (s||'').replace(/[&<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }
    function escapeAttr(s){ return (s||'').replace(/["&<>]/g, c=>({"\"":"&quot;","&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }

    function attachFaqEvents() {
      faqSearch?.addEventListener('input', renderFaqs);
      faqFilter?.addEventListener('change', renderFaqs);
      faqAddBtn?.addEventListener('click', () => {
        const faqs = load(LS_KEYS.faqs);
        faqs.unshift({ id: cryptoRandom(), category: 'general', q: 'New question', a: 'Type the answer here.' });
        save(LS_KEYS.faqs, faqs);
        renderFaqs();
      });
      faqAdminTBody?.addEventListener('input', (e) => {
        const el = e.target;
        const id = el.getAttribute('data-id');
        const field = el.getAttribute('data-edit');
        if (!id || !field) return;
        const faqs = load(LS_KEYS.faqs);
        const idx = faqs.findIndex(x=>x.id===id);
        if (idx>-1){ faqs[idx][field] = el.value; save(LS_KEYS.faqs, faqs); }
      });
      faqAdminTBody?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="delete"]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        let faqs = load(LS_KEYS.faqs);
        faqs = faqs.filter(f=>f.id!==id);
        save(LS_KEYS.faqs, faqs);
        renderFaqs();
      });
    }

    // -------------- Notifications ---------------
    const notifList = document.getElementById('notif-list');
    const notifFilter = document.getElementById('notif-filter');
    const notifMarkAll = document.getElementById('notif-mark-all');
    const bellBtn = document.querySelector('.header-right .icon-button .fa-bell')?.parentElement;

    // Create dropdown container under bell
    let notifDropdownEl;
    function ensureBellDropdown() {
      if (!bellBtn) return;
      if (!notifDropdownEl) {
        notifDropdownEl = document.createElement('div');
        notifDropdownEl.className = 'position-absolute bg-white rounded-3 p-0 notif-dropdown d-none';
        notifDropdownEl.style.right = '0';
        notifDropdownEl.style.top = '120%';
        notifDropdownEl.innerHTML = `<div class="list-group" id="notif-dropdown-list"></div>`;
        bellBtn.style.position = 'relative';
        bellBtn.appendChild(notifDropdownEl);
      }
    }

    function unreadCount(notifs){ return notifs.filter(n=>!n.read).length; }

    function renderBell() {
      if (!bellBtn) return;
      const notifs = load(LS_KEYS.notifs);
      // Badge
      let badge = bellBtn.querySelector('.position-absolute.translate-middle.badge');
      const count = unreadCount(notifs);
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        badge.style.fontSize = '0.65rem';
        bellBtn.appendChild(badge);
      }
      badge.textContent = count>99?'99+':String(count);
      badge.style.display = count>0? 'inline-block' : 'none';

      // Dropdown latest
      ensureBellDropdown();
      const dd = document.getElementById('notif-dropdown-list');
      if (dd) {
        const latest = [...notifs].sort((a,b)=>b.ts-a.ts).slice(0,6);
        dd.innerHTML = latest.map(n=>`
          <a href="#notification-center" class="list-group-item list-group-item-action ${n.read?'':'fw-semibold'}">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">${escapeHtml(n.title)}</h6>
              <small class="text-muted">${timeAgo(n.ts)}</small>
            </div>
            <p class="mb-1">${escapeHtml(n.message)}</p>
          </a>
        `).join('') || '<div class="p-3 text-center text-muted">No notifications</div>';
      }
    }

    function renderNotifCenter() {
      if (!notifList) return;
      const filter = notifFilter?.value || 'all';
      let notifs = load(LS_KEYS.notifs).sort((a,b)=>b.ts-a.ts);
      if (filter==='read') notifs = notifs.filter(n=>n.read);
      if (filter==='unread') notifs = notifs.filter(n=>!n.read);
      notifList.innerHTML = notifs.map(n=>`
        <div class="list-group-item d-flex align-items-start justify-content-between ${n.read?'':'bg-light'}">
          <div class="me-2">
            <div class="fw-semibold">${escapeHtml(n.title)}</div>
            <div class="small text-muted">${timeAgo(n.ts)}</div>
            <div>${escapeHtml(n.message)}</div>
          </div>
          <div class="text-nowrap">
            ${n.read?`<button class="btn btn-sm btn-outline-secondary" data-notif="unread" data-id="${n.id}">Mark Unread</button>`:`<button class="btn btn-sm btn-primary" data-notif="read" data-id="${n.id}">Mark Read</button>`}
          </div>
        </div>
      `).join('') || '<div class="p-3 text-center text-muted">No notifications to show</div>';
    }

    function attachNotifEvents() {
      notifFilter?.addEventListener('change', renderNotifCenter);
      notifMarkAll?.addEventListener('click', ()=>{
        const notifs = load(LS_KEYS.notifs).map(n=>({...n, read:true}));
        save(LS_KEYS.notifs, notifs);
        renderNotifCenter();
        renderBell();
      });
      notifList?.addEventListener('click', (e)=>{
        const btn = e.target.closest('[data-notif]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-notif');
        const notifs = load(LS_KEYS.notifs);
        const idx = notifs.findIndex(n=>n.id===id);
        if (idx>-1) {
          notifs[idx].read = action==='read';
          save(LS_KEYS.notifs, notifs);
          renderNotifCenter();
          renderBell();
        }
      });

      // Bell toggle dropdown
      bellBtn?.addEventListener('click', (e)=>{
        e.stopPropagation();
        ensureBellDropdown();
        notifDropdownEl?.classList.toggle('d-none');
      });
      document.addEventListener('click', ()=>{
        notifDropdownEl?.classList.add('d-none');
      });

      // Admin create/schedule
      const titleEl = document.getElementById('notif-title');
      const msgEl = document.getElementById('notif-message');
      const schedEl = document.getElementById('notif-schedule');
      document.getElementById('notif-send-now')?.addEventListener('click', ()=>{
        const t = (titleEl?.value||'').trim();
        const m = (msgEl?.value||'').trim();
        if (!t || !m) return;
        const notifs = load(LS_KEYS.notifs);
        notifs.unshift({ id: cryptoRandom(), title: t, message: m, ts: Date.now(), read: false });
        save(LS_KEYS.notifs, notifs);
        titleEl.value = '';
        msgEl.value = '';
        renderNotifCenter();
        renderBell();
        alert('Notification sent');
      });
      document.getElementById('notif-schedule-btn')?.addEventListener('click', ()=>{
        const t = (titleEl?.value||'').trim();
        const m = (msgEl?.value||'').trim();
        const when = schedEl?.valueAsNumber || null;
        if (!t || !m || !when) return;
        const delay = Math.max(0, when - Date.now());
        alert('Notification scheduled');
        setTimeout(()=>{
          const notifs = load(LS_KEYS.notifs);
          notifs.unshift({ id: cryptoRandom(), title: t, message: m, ts: Date.now(), read: false });
          save(LS_KEYS.notifs, notifs);
          renderNotifCenter();
          renderBell();
        }, delay);
        titleEl.value = '';
        msgEl.value = '';
        schedEl.value = '';
      });
    }

    function timeAgo(ts){
      const s = Math.floor((Date.now()-ts)/1000);
      if (s<60) return `${s}s ago`;
      const m = Math.floor(s/60); if (m<60) return `${m}m ago`;
      const h = Math.floor(m/60); if (h<24) return `${h}h ago`;
      const d = Math.floor(h/24); return `${d}d ago`;
    }

    // -------------- Feedback ---------------
    const ratingStars = document.getElementById('rating-stars');
    const commentEl = document.getElementById('feedback-comment');
    const submitBtn = document.getElementById('feedback-submit');
    const confirmEl = document.getElementById('feedback-confirm');
    const feedbackList = document.getElementById('feedback-list');
    const avgRatingEl = document.getElementById('avg-rating');

    let currentRating = 0;
    function setStars(n){
      currentRating = n;
      ratingStars?.querySelectorAll('.star').forEach(st => {
        const v = Number(st.getAttribute('data-value'));
        st.classList.toggle('inactive', v>n);
      });
    }

    function attachFeedbackEvents(){
      ratingStars?.addEventListener('mouseover', (e)=>{
        const st = e.target.closest('.star'); if(!st) return;
        setStars(Number(st.getAttribute('data-value')));
      });
      ratingStars?.addEventListener('click', (e)=>{
        const st = e.target.closest('.star'); if(!st) return;
        setStars(Number(st.getAttribute('data-value')));
      });
      ratingStars?.addEventListener('mouseleave', ()=>{ setStars(currentRating); });

      submitBtn?.addEventListener('click', ()=>{
        if (!currentRating) { alert('Please select a star rating.'); return; }
        const text = (commentEl?.value||'').trim();
        const items = load(LS_KEYS.feedback);
        items.unshift({ id: cryptoRandom(), rating: currentRating, comment: text, ts: Date.now() });
        save(LS_KEYS.feedback, items);
        commentEl.value = '';
        setStars(0);
        renderFeedback();
        if (confirmEl) { confirmEl.classList.remove('d-none'); setTimeout(()=>confirmEl.classList.add('d-none'), 2000); }
      });
    }

    function renderFeedback(){
      const items = load(LS_KEYS.feedback);
      if (feedbackList) {
        feedbackList.innerHTML = items.map(f=>`
          <div class="list-group-item">
            <div class="d-flex justify-content-between">
              <div>${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div>
              <small class="text-muted">${timeAgo(f.ts)}</small>
            </div>
            <div class="mt-1">${escapeHtml(f.comment || '')}</div>
          </div>
        `).join('') || '<div class="p-3 text-center text-muted">No feedback yet</div>';
      }
      if (avgRatingEl) {
        const avg = items.length ? (items.reduce((s,x)=>s+x.rating,0)/items.length) : 0;
        avgRatingEl.textContent = avg.toFixed(1);
      }
    }

    // -------------- Role-based UI ---------------
    const faqAdminCard = document.getElementById('faq-admin-card');
    const notifAdminCard = document.getElementById('notif-admin-card');
    const feedbackUserCard = document.getElementById('feedback-user-card');
    const feedbackAdminCard = document.getElementById('feedback-admin-card');

    function applyRoleUI(){
      const role = (localStorage.getItem('current_user_role') || 'student').toLowerCase();
      const isAdmin = role === 'admin';

      // Admin-only
      faqAdminCard && (faqAdminCard.style.display = isAdmin ? '' : 'none');
      notifAdminCard && (notifAdminCard.style.display = isAdmin ? '' : 'none');
      feedbackAdminCard && (feedbackAdminCard.style.display = isAdmin ? '' : 'none');

      // User-only (students)
      feedbackUserCard && (feedbackUserCard.style.display = isAdmin ? 'none' : '');
    }

    // Initialize
    seedIfEmpty();
    renderFaqs();
    attachFaqEvents();

    renderBell();
    renderNotifCenter();
    attachNotifEvents();

    renderFeedback();
    attachFeedbackEvents();

  applyRoleUI();
  }

// -----------------------------
// Signup Page Scripts
// -----------------------------
const IS_SIGNUP_PAGE = document.querySelector('.signup-title');
if (IS_SIGNUP_PAGE) {
  function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }
  }

  // Role selection to show program for students
  document.getElementById('role-select').addEventListener('change', function() {
    const role = this.value;
    const programGroup = document.getElementById('program-group');
    const programSelect = document.getElementById('program-select');
    if (role === 'student') {
      programGroup.style.display = 'block';
      programSelect.required = true;
    } else {
      programGroup.style.display = 'none';
      programSelect.required = false;
    }
  });

  // Add event listener to form
  document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Simulate sending form data to backend and OTP
    showOtpModal();
  });

  function showOtpModal() {
    document.getElementById('otpModal').style.display = 'block';
  }

  function closeOtpModal() {
    document.getElementById('otpModal').style.display = 'none';
  }

  function resendOtp() {
    // Simulate resend
    alert('OTP resent to your email');
  }

  // Event listener for verify button
  document.getElementById('verify-btn').addEventListener('click', function() {
    const otp = document.getElementById('otp-input').value;
    if (otp === '123456') { // Simulate backend verification
      closeOtpModal();
      alert('Signup successful!');
      // Redirect to login
      window.location.href = 'login.html';
    } else {
      alert('Invalid OTP. Please try again.');
    }
  });
}
// -----------------------------
// Login Page Scripts
// -----------------------------
const IS_LOGIN_PAGE = document.getElementById('login-form');
if (IS_LOGIN_PAGE) {
  function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('fa-eye');
      toggleIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('fa-eye-slash');
      toggleIcon.classList.add('fa-eye');
    }
  }

  // Login form submit event
  document.getElementById('login-form').addEventListener('submit', function(e) {
    showOtpModal(); // Send OTP
  });

  function showOtpModal() {
    document.getElementById('otpModal').style.display = 'block';
  }

  function closeOtpModal() {
    document.getElementById('otpModal').style.display = 'none';
  }

  function resendOtp() {
    alert('OTP resent to your email');
  }

  // OTP verify for login
  document.getElementById('verify-btn').addEventListener('click', function() {
    const otp = document.getElementById('otp-input').value;
    if (otp === '123456') { // Simulate
      closeOtpModal();
      // Store role (for demo, assume faculty)
      localStorage.setItem('userRole', 'faculty'); // Change as needed
      alert('Login successful!');
      // Redirect to dashboard
      window.location.href = 'index.html'; // or classSched.html
    } else {
      alert('Invalid OTP');
    }
  });

  // Forgot password
  function showForgotModal() {
    document.getElementById('forgotModal').style.display = 'block';
  }

  function closeForgotModal() {
    document.getElementById('forgotModal').style.display = 'none';
  }

  document.getElementById('reset-btn').addEventListener('click', function() {
    const email = document.getElementById('forgot-email').value;
    if (email) {
      closeForgotModal();
      showResetOtpModal();
      // Simulate send reset OTP
    } else {
      alert('Enter email');
    }
  });

  function showResetOtpModal() {
    document.getElementById('resetOtpModal').style.display = 'block';
  }

  function closeResetOtpModal() {
    document.getElementById('resetOtpModal').style.display = 'none';
  }

  document.getElementById('reset-verify-btn').addEventListener('click', function() {
    const otp = document.getElementById('reset-otp').value;
    const newPass = document.getElementById('new-password').value;
    if (otp === '123456' && newPass) {
      closeResetOtpModal();
      alert('Password reset successful! Please log in.');
    } else {
      alert('Invalid OTP or missing new password');
    }
  });
}

})();
