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

  /* ---------- Homepage review carousel ---------- */
  var reviewTrack = document.querySelector('.review-carousel-track');
  if (reviewTrack) {
    var prevBtn = document.querySelector('.review-arrow-prev');
    var nextBtn = document.querySelector('.review-arrow-next');
    var scrollToCard = function (direction) {
      var card = reviewTrack.querySelector('.review-card');
      if (!card) return;
      var trackStyles = window.getComputedStyle(reviewTrack);
      var gap = parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
      var step = card.getBoundingClientRect().width + gap;
      var atStart = reviewTrack.scrollLeft <= 4;
      var atEnd = reviewTrack.scrollLeft + reviewTrack.clientWidth >= reviewTrack.scrollWidth - 4;
      if (direction > 0 && atEnd) {
        reviewTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (direction < 0 && atStart) {
        reviewTrack.scrollTo({ left: reviewTrack.scrollWidth, behavior: 'smooth' });
      } else {
        reviewTrack.scrollBy({ left: direction * step, behavior: 'smooth' });
      }
    };
    if (prevBtn) prevBtn.addEventListener('click', function () { scrollToCard(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { scrollToCard(1); });
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
      // Always take over submission ourselves: on success we send it to
      // Formspree via fetch and show a message right here on the page,
      // instead of letting the browser do a normal POST and redirect the
      // visitor away to formspree.io.
      e.preventDefault();

      var status = document.getElementById('form-status');

      // Honeypot spam check: if this hidden field has any value, it's a bot.
      var honeypot = form.querySelector('.hp-field input');
      if (honeypot && honeypot.value.trim() !== '') {
        return; // silently drop; don't tell the bot it failed
      }

      var valid = true;
      var fields = form.querySelectorAll('[data-required]');
      fields.forEach(function (field) {
        var errorEl = document.getElementById(field.id + '-error');
        var value = field.value.trim();
        var fieldValid = true;
        var isOptional = field.hasAttribute('data-optional');

        if (value === '') {
          fieldValid = isOptional ? true : false;
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
        if (status) {
          status.textContent = 'Please fix the highlighted fields and try again.';
          status.className = 'form-status error';
        }
        return;
      }
      // NOTE: This is client-side validation for user experience only.
      // Formspree also validates/sanitizes on its end; never trust
      // client-side validation alone.

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      if (status) {
        status.textContent = '';
        status.className = 'form-status';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          form.reset();
          if (status) {
            status.textContent = "Thanks! Your request has been sent. We'll be in touch soon.";
            status.className = 'form-status success';
          }
        } else {
          return response.json().then(function (data) {
            var message = (data && data.errors && data.errors.length)
              ? data.errors.map(function (err) { return err.message; }).join(', ')
              : 'Something went wrong sending your request. Please call us at (678) 608-8843 instead.';
            if (status) {
              status.textContent = message;
              status.className = 'form-status error';
            }
          });
        }
      }).catch(function () {
        if (status) {
          status.textContent = "Something went wrong sending your request. Please call us at (678) 608-8843 instead.";
          status.className = 'form-status error';
        }
      }).finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    });
  }

  /* ---------- FAQ schema note ----------
     Each FAQ page/section renders visible <details>/<summary> pairs AND a
     matching FAQPage JSON-LD block in the page <head> or before </body>.
     If FAQ copy changes, update both places so they stay in sync. */

});
