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
// Loads header.html and footer.html into any page that has the placeholder divs
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
}

// Auto-load when DOM is ready
document.addEventListener('DOMContentLoaded', loadComponents);
