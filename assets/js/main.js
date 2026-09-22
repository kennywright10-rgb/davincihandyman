// =========================================================
// Davinci Home Improvements: shared site behavior
// =========================================================

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  /* ---------- Cookie consent banner ---------- */
  var COOKIE_KEY = 'davinci_cookie_consent'; // 'accepted' | 'declined'
  var banner = document.getElementById('cookie-banner');
  if (banner) {
    var existing = localStorage.getItem(COOKIE_KEY);
    if (!existing) {
      banner.classList.add('visible');
    }
    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        localStorage.setItem(COOKIE_KEY, 'accepted');
        banner.classList.remove('visible');
        // TODO: once a real GA4 Measurement ID is added in the <head> of each
        // page, gate loading of the analytics script on this consent value
        // (only fire analytics after 'accepted').
      });
    }
    if (declineBtn) {
      declineBtn.addEventListener('click', function () {
        localStorage.setItem(COOKIE_KEY, 'declined');
        banner.classList.remove('visible');
      });
    }
  }

  /* ---------- Contact / quote form validation ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      var valid = true;

      // Honeypot spam check: if this hidden field has any value, it's a bot.
      var honeypot = form.querySelector('.hp-field input');
      if (honeypot && honeypot.value.trim() !== '') {
        e.preventDefault();
        return; // silently drop; don't tell the bot it failed
      }

      var fields = form.querySelectorAll('[data-required]');
      fields.forEach(function (field) {
        var errorEl = document.getElementById(field.id + '-error');
        var value = field.value.trim();
        var fieldValid = true;

        if (value === '') {
          fieldValid = false;
        } else if (field.type === 'email') {
          fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        } else if (field.dataset.required === 'phone') {
          fieldValid = /^[\d\s\-\+\(\)]{7,}$/.test(value);
        }

        if (!fieldValid) {
          valid = false;
          if (errorEl) errorEl.classList.add('show');
          field.setAttribute('aria-invalid', 'true');
        } else {
          if (errorEl) errorEl.classList.remove('show');
          field.removeAttribute('aria-invalid');
        }
      });

      if (!valid) {
        e.preventDefault();
        var status = document.getElementById('form-status');
        if (status) {
          status.textContent = 'Please fix the highlighted fields and try again.';
          status.className = 'form-status error';
        }
      }
      // NOTE: This is client-side validation only, for user experience.
      // The form's real submission endpoint (Netlify Forms, Formspree, a
      // server-side handler, etc.) MUST also validate/sanitize server-side:
      // never trust client-side validation alone. The `action` attribute on
      // this form is a placeholder until a real backend/service is wired up.
    });
  }

  /* ---------- FAQ schema note ----------
     Each FAQ page/section renders visible <details>/<summary> pairs AND a
     matching FAQPage JSON-LD block in the page <head> or before </body>.
     If FAQ copy changes, update both places so they stay in sync. */

});
