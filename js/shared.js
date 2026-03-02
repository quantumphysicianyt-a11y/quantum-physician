// ========== SHARED JS — Used by ALL pages ==========

// Mobile menu toggle
function toggleMenu() {
  document.getElementById('mainMenu').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('active');
  document.body.style.overflow = document.getElementById('mainMenu').classList.contains('open') ? 'hidden' : '';
}

// Close menu when a link is clicked
document.querySelectorAll('#mainMenu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mainMenu').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ========== COMPONENT LOADER ==========
async function loadComponents() {
  const headerEl = document.getElementById('shared-header');
  const footerEl = document.getElementById('shared-footer');

  if (headerEl) {
    try {
      const res = await fetch('/components/header.html');
      headerEl.innerHTML = await res.text();
    } catch(e) { console.warn('Header load failed:', e); }
  }

  if (footerEl) {
    try {
      const res = await fetch('/components/footer.html');
      footerEl.innerHTML = await res.text();
    } catch(e) { console.warn('Footer load failed:', e); }
  }

  // After header loads, check auth state
  initAuthHeader();
}

document.addEventListener('DOMContentLoaded', loadComponents);


// ========== AUTH-AWARE HEADER ==========
// Checks Supabase session. If logged in, replaces Sign Up/Login with avatar dropdown.

const QP_SUPABASE_URL = 'https://rihlrfiqokqrlmzjjyxj.supabase.co';
const QP_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaGxyZmlxb2txcmxtempqeXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MTU2NDYsImV4cCI6MjA4NDA5MTY0Nn0.G2TQKSmQpPYb8Cyzo7R833G7xkr0855faLRjrJ9ov-4';

let _qpSb = null;
function getQpSb() {
  if (_qpSb) return _qpSb;
  if (window.supabase) {
    _qpSb = window.supabase.createClient(QP_SUPABASE_URL, QP_SUPABASE_ANON);
  }
  return _qpSb;
}

async function initAuthHeader() {
  const sb = getQpSb();
  if (!sb) return; // Supabase SDK not loaded on this page

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return; // Not logged in — leave header as-is

    const user = session.user;

    // Load profile for name + avatar
    const { data: profile } = await sb.from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    const firstName = fullName.split(' ')[0];
    const initials = fullName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const avatarUrl = profile?.avatar_url || null;
    const email = user.email || '';

    // Find the nav menu
    const menu = document.getElementById('mainMenu');
    if (!menu) return;

    // Remove Sign Up and Login links
    const links = menu.querySelectorAll('a');
    links.forEach(a => {
      const text = a.textContent.trim().toLowerCase();
      if (text === 'sign up' || text === 'login' || text === 'log in') {
        a.remove();
      }
    });

    // Inject auth styles (once)
    if (!document.getElementById('qp-auth-styles')) {
      const style = document.createElement('style');
      style.id = 'qp-auth-styles';
      style.textContent = `
        .qp-avatar-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .qp-avatar-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5ba8b2, #4a939c);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid rgba(91,168,178,0.3);
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
          padding: 0;
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.5px;
        }
        .qp-avatar-btn:hover {
          border-color: #5ba8b2;
          box-shadow: 0 0 0 3px rgba(91,168,178,0.15);
        }
        .qp-avatar-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .qp-dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background: #131e3d;
          border: 1px solid rgba(91,168,178,0.25);
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.4);
          z-index: 9999;
          overflow: hidden;
          animation: qpDropIn 0.2s ease-out;
        }
        .qp-dropdown.open { display: block; }
        @keyframes qpDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qp-drop-profile {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(91,168,178,0.12);
          text-align: center;
        }
        .qp-drop-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #5ba8b2, #4a939c);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          overflow: hidden;
        }
        .qp-drop-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .qp-drop-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }
        .qp-drop-email {
          font-size: 12px;
          color: rgba(255,255,255,0.45);
          word-break: break-all;
        }
        .qp-drop-links {
          padding: 8px 0;
        }
        .qp-drop-links a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          font-size: 14px;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .qp-drop-links a:hover {
          background: rgba(91,168,178,0.08);
          color: #5ba8b2;
        }
        .qp-drop-links a svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .qp-drop-links a:hover svg { opacity: 1; }
        .qp-drop-divider {
          height: 1px;
          background: rgba(91,168,178,0.12);
          margin: 0;
        }
        .qp-drop-links a.qp-signout {
          color: rgba(232,93,93,0.7);
        }
        .qp-drop-links a.qp-signout:hover {
          color: #e85d5d;
          background: rgba(232,93,93,0.06);
        }
      `;
      document.head.appendChild(style);
    }

    // Build avatar + dropdown HTML
    const avatarInner = avatarUrl
      ? `<img src="${avatarUrl}" alt="${firstName}">`
      : initials;

    const dropAvatarInner = avatarUrl
      ? `<img src="${avatarUrl}" alt="${firstName}">`
      : initials;

    const wrap = document.createElement('div');
    wrap.className = 'qp-avatar-wrap';
    wrap.innerHTML = `
      <button class="qp-avatar-btn" id="qpAvatarBtn" aria-label="Account menu">${avatarInner}</button>
      <div class="qp-dropdown" id="qpDropdown">
        <div class="qp-drop-profile">
          <div class="qp-drop-avatar">${dropAvatarInner}</div>
          <div class="qp-drop-name">${fullName}</div>
          <div class="qp-drop-email">${email}</div>
        </div>
        <div class="qp-drop-links">
          <a href="/members/dashboard.html">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            Member Dashboard
          </a>
          <a href="/academy/dashboard.html">
            <svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            Academy Dashboard
          </a>
          <a href="/pages/one-on-sessions.html">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book a Session
          </a>
          <a href="/members/settings.html">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            Account Settings
          </a>
        </div>
        <div class="qp-drop-divider"></div>
        <div class="qp-drop-links">
          <a href="#" class="qp-signout" id="qpSignOut">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </a>
        </div>
      </div>
    `;

    // Insert into nav (replace cart link position or append)
    menu.appendChild(wrap);

    // Toggle dropdown
    const avatarBtn = document.getElementById('qpAvatarBtn');
    const dropdown = document.getElementById('qpDropdown');

    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dropdown.classList.remove('open');
    });

    // Sign out
    document.getElementById('qpSignOut').addEventListener('click', async (e) => {
      e.preventDefault();
      await sb.auth.signOut();
      window.location.href = '/members/login.html?logged_out=true';
    });

  } catch (err) {
    console.warn('Auth header init failed:', err);
  }
}
