/**
 * Notification Panel Component
 *
 * A reusable notification panel that can be integrated into any page.
 * Features:
 * - Toggle show/hide on bell button click
 * - Mark as read/unread
 * - Close individual notifications
 * - Mark all as read
 * - Smooth animations
 * - Responsive design
 */

// Sample notification data
const sampleNotifications = [
  {
    id: '1',
    admin: 'Admin',
    title: 'System Maintenance Scheduled',
    description: 'Scheduled maintenance on the weekend. Services may be unavailable for a few hours.',
    timestamp: Date.now() - 3600000, // 1 hour ago
    read: false,
    avatar: 'fa-user'
  },
  {
    id: '2',
    admin: 'Admin',
    title: 'New Course Available',
    description: 'Check out the new Computer Science courses available for enrollment.',
    timestamp: Date.now() - 86400000, // 1 day ago
    read: false,
    avatar: 'fa-user'
  },
  {
    id: '3',
    admin: 'Admin',
    title: 'Welcome to SorSUlyap!',
    description: 'Thank you for joining our platform. Explore all the features available.',
    timestamp: Date.now() - 172800000, // 2 days ago
    read: true,
    avatar: 'fa-user'
  }
];

class NotificationPanel {
  constructor(options = {}) {
    this.options = {
      bellSelector: '.icon-button .fa-bell',
      container: document.body,
      storageKey: 'notifications',
      maxItems: 10,
      onMarkAllRead: null,
      onSeeAll: null,
      ...options
    };

    this.isVisible = false;
    this.notifications = this.loadNotifications();
    this.panel = null;
    this.bellButton = null;

    this.init();
  }

  init() {
    this.createPanel();
    this.attachEvents();
    this.render();
    this.updateBellBadge();
  }

  createPanel() {
    // Create panel HTML structure
    const panelHTML = `
      <div class="notification-panel" id="notification-panel">
        <div class="notification-header">
          <h3 class="notification-title">Notification</h3>
        </div>
        <div class="notification-recent">Recent</div>
        <div class="notification-list" id="notification-list">
          <!-- Notifications will be rendered here -->
        </div>
        <div class="notification-footer">
          <a href="#" class="notification-see-all" id="see-all-link">See all Notification</a>
          <button class="notification-mark-read" id="mark-all-read">Mark all as read</button>
        </div>
      </div>
    `;

    this.panel = document.createElement('div');
    this.panel.innerHTML = panelHTML;

    // Initially hide the panel
    this.panel.querySelector('.notification-panel').style.display = 'none';
    this.options.container.appendChild(this.panel);

    this.panel = this.panel.querySelector('.notification-panel');
  }

  attachEvents() {
    this.bellButton = document.querySelector(this.options.bellSelector)?.parentElement;
    if (this.bellButton) {
      this.bellButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Make sure bell button has position relative for the panel
      this.bellButton.style.position = 'relative';
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.panel.contains(e.target) && !this.bellButton.contains(e.target)) {
        this.hide();
      }
    });

    // Prevent panel from closing when clicking inside
    this.panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Mark all as read
    const markAllBtn = this.panel.querySelector('#mark-all-read');
    markAllBtn.addEventListener('click', () => {
      this.markAllAsRead();
    });

    // See all link
    const seeAllLink = this.panel.querySelector('#see-all-link');
    seeAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.seeAll();
    });

    // Listen for notification item events (delegated)
    const list = this.panel.querySelector('#notification-list');
    list.addEventListener('click', (e) => {
      const item = e.target.closest('.notification-item');
      if (!item) return;

      const notifId = item.dataset.id;

      // Close button
      if (e.target.closest('.notification-close')) {
        this.removeNotification(notifId);
        return;
      }

      // Mark as read/unread on item click
      this.toggleRead(notifId);
    });
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    // Calculate position relative to bell button
    if (this.bellButton) {
      const rect = this.bellButton.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      this.panel.style.setProperty('--bell-top', (rect.top + scrollTop) + 'px');
      this.panel.style.setProperty('--bell-height', rect.height + 'px');
      this.panel.style.setProperty('--bell-right', (window.innerWidth - rect.right - scrollLeft) + 'px');
    }

    this.panel.classList.add('show');
    this.isVisible = true;
    // Update bell badge
    this.updateBellBadge();
  }

  hide() {
    this.panel.classList.remove('show');
    this.isVisible = false;
  }

  render() {
    const list = this.panel.querySelector('#notification-list');
    const emptyMsg = this.panel.querySelector('.notification-empty');
    const allItems = this.panel.querySelectorAll('.notification-item');

    // Remove existing empty message if present
    if (emptyMsg) emptyMsg.remove();
    allItems.forEach(item => item.remove());

    if (this.notifications.length === 0) {
      list.innerHTML = '<div class="notification-empty">No notifications available</div>';
      return;
    }

    // Sort notifications: unread first, then by timestamp
    const sorted = [...this.notifications].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.timestamp - a.timestamp;
    });

    // Render items
    sorted.slice(0, this.options.maxItems).forEach(notification => {
      const item = document.createElement('div');
      item.className = `notification-item ${!notification.read ? 'unread' : ''}`;
      item.dataset.id = notification.id;

      item.innerHTML = `
        <div class="notification-item-content">
          <div class="notification-avatar">
            <i class="fas ${notification.avatar}"></i>
          </div>
          <div class="notification-details">
            <div class="notification-meta">
              <span class="notification-admin">${notification.admin}</span>
              <span class="notification-time">${this.timeAgo(notification.timestamp)}</span>
            </div>
            <div class="notification-text">
              <div class="notification-title-text">${notification.title}</div>
              <div class="notification-description">${notification.description}</div>
            </div>
          </div>
          <button class="notification-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;

      list.appendChild(item);
    });

    // Update mark all button
    const markAllBtn = this.panel.querySelector('#mark-all-read');
    const hasUnread = this.notifications.some(n => !n.read);
    markAllBtn.disabled = !hasUnread;
  }

  timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }

  updateBellBadge() {
    if (!this.bellButton) return;

    const unreadCount = this.notifications.filter(n => !n.read).length;

    // Remove existing badge
    const existingBadge = this.bellButton.querySelector('.notification-badge');
    if (existingBadge) existingBadge.remove();

    if (unreadCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'notification-badge';
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ff4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 11px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      `;

      this.bellButton.appendChild(badge);
    }
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
    this.saveNotifications();
    this.render();
    this.updateBellBadge();

    if (this.options.onMarkAllRead) {
      this.options.onMarkAllRead(this.notifications);
    }
  }

  toggleRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = !notification.read;
      this.saveNotifications();
      this.render();
      this.updateBellBadge();
    }
  }

  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.render();
    this.updateBellBadge();
  }

  addNotification(notification) {
    const newNotif = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      admin: 'Admin',
      timestamp: Date.now(),
      read: false,
      avatar: 'fa-user',
      ...notification
    };

    this.notifications.unshift(newNotif);
    this.saveNotifications();
    this.render();
    this.updateBellBadge();
  }

  seeAll() {
    // Close the panel first
    this.hide();

    if (this.options.onSeeAll) {
      this.options.onSeeAll();
    } else {
      // Default behavior - could redirect to notifications page
      console.log('See all notifications clicked');
    }
  }

  loadNotifications() {
    const stored = localStorage.getItem(this.options.storageKey);
    return stored ? JSON.parse(stored) : sampleNotifications;
  }

  saveNotifications() {
    localStorage.setItem(this.options.storageKey, JSON.stringify(this.notifications));
  }

  destroy() {
    this.hide();
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationPanel;
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Create notification panel if bell button exists
  const bellButton = document.querySelector('.icon-button .fa-bell');
  if (bellButton) {
    window.notificationPanel = new NotificationPanel({
      onSeeAll: () => {
        // Custom behavior for "See all" link
        window.location.href = 'admin/notification.html';
      }
    });
  }
});
