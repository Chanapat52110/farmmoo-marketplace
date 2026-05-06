// MooTrace — main JS (progressive enhancement only)

// ── Auto-dismiss alerts ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.alert').forEach(function (alert) {
    setTimeout(function () {
      alert.style.transition = 'opacity .4s';
      alert.style.opacity = '0';
      setTimeout(function () { alert.remove(); }, 400);
    }, 5000);
  });
});

// ── Mobile hamburger menu ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navbar-toggle');
  var navbar = document.getElementById('navbar');
  var menu   = document.getElementById('navbar-menu');

  if (!toggle || !navbar || !menu) return;

  toggle.addEventListener('click', function () {
    var isOpen = navbar.classList.toggle('navbar--open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when a link inside it is clicked (SPA-style navigation)
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navbar.classList.remove('navbar--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (!navbar.contains(e.target)) {
      navbar.classList.remove('navbar--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// ── AJAX Add to Cart ─────────────────────────────────────────────────────────
// Intercepts `.add-to-cart-form` submits, POSTs via fetch, updates cart badge.
document.addEventListener('DOMContentLoaded', function () {
  const CSRF = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '';

  document.querySelectorAll('.add-to-cart-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'กำลังเพิ่ม…';
      }

      fetch(form.action, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': CSRF,
        },
        body: new FormData(form),
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success || data.cart_count !== undefined) {
          // Update navbar badge
          var badge = document.querySelector('.cart-badge');
          if (badge) {
            badge.textContent = data.cart_count;
          } else if (data.cart_count > 0) {
            // Create badge if it didn't exist yet
            var cartLink = document.querySelector('.cart-link');
            if (cartLink) {
              var newBadge = document.createElement('span');
              newBadge.className = 'cart-badge';
              newBadge.textContent = data.cart_count;
              cartLink.appendChild(newBadge);
            }
          }

          // Flash button green
          if (btn) {
            btn.textContent = '✓ เพิ่มแล้ว';
            btn.style.background = '#15803d';
            setTimeout(function () {
              btn.textContent = originalText;
              btn.style.background = '';
              btn.disabled = false;
            }, 1500);
          }
        } else {
          // Fallback: restore button
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
        }
      })
      .catch(function () {
        // Network error — fall back to normal form submit
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
        form.submit();
      });
    });
  });
});
