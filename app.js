// Hero video carousel with crossfade
(function () {
  const videos = Array.from(document.querySelectorAll('.hero-video'));
  let current = 0;

  function advance() {
    const prev = current;
    current = (current + 1) % videos.length;
    const next = videos[current];

    next.load();
    next.play().catch(() => {});
    next.classList.add('active');

    setTimeout(() => videos[prev].classList.remove('active'), 1200);

    // Preload the one after next
    const upcoming = videos[(current + 1) % videos.length];
    if (upcoming.preload === 'none') upcoming.preload = 'auto';

    next.addEventListener('ended', advance, { once: true });
  }

  const first = videos[0];
  const FIRST_DURATION_MS = 25000;
  const startTime = Date.now();
  let fired = false;

  function firstAdvance() {
    if (fired) return;
    const elapsed = Date.now() - startTime;
    const remaining = FIRST_DURATION_MS - elapsed;
    if (remaining > 50) {
      // Video ended early (buffering/seek issue) — wait out the remainder
      setTimeout(function () {
        if (!fired) { fired = true; advance(); }
      }, remaining);
    } else {
      fired = true;
      advance();
    }
  }

  first.play().catch(() => {});
  first.addEventListener('ended', firstAdvance, { once: true });
  // Hard fallback: advance no matter what after 25s + grace
  setTimeout(function () {
    if (!fired) { fired = true; advance(); }
  }, FIRST_DURATION_MS + 500);

  // Preload second video right away
  videos[1].preload = 'auto';
})();

// Hero chat animation (Sierra-style scrolling transcript)
(function () {
  var container = document.querySelector('.hero-chat');
  if (!container) return;

  var AVATAR = 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=80&h=80&fit=crop&crop=face';

  var messages = [
    { sender: 'kalinda', text: 'Hi Kevin, this is Sarah from Acme Law Firm regarding your Depo Provera claim. Is now a good time to confirm your information?' },
    { sender: 'plaintiff', text: 'Yes, go ahead.' },
    { sender: 'kalinda', text: 'Great\u2014confirming DOB March 4, 1968 and address in Ashland, KY 41101. I don\u2019t have an emergency contact\u2014could you provide one?' },
    { sender: 'plaintiff', text: 'That\u2019s correct. Emergency contact is my daughter Virginia\u2014502-318-4471.' },
    { sender: 'kalinda', text: 'Thank you. I have a mobile ending in 8843\u2014is that still current?' },
    { sender: 'plaintiff', text: 'Updated\u2014it\u2019s 502-716-9034 now.' },
    { sender: 'kalinda', text: 'Got it. Can you confirm how you took Depo Provera and roughly when?' },
    { sender: 'plaintiff', text: 'Shots and pills, from about 2003 to 2019. Shots were at a clinic every few months.' },
    { sender: 'kalinda', text: 'I have cerebral meningioma diagnosed via MRI, with surgery March 2025 and follow-up rehab. Some provider details are missing\u2014we can fill those later. Sound right?' },
    { sender: 'plaintiff', text: 'Yes\u2014but I don\u2019t have all the provider info now. Can you call back tomorrow morning?' },
    { sender: 'kalinda', text: 'Of course\u2014does 10 AM EST work?' },
    { sender: 'plaintiff', text: 'Perfect, thanks.' },
    { sender: 'kalinda', text: 'Great\u2014you\u2019re all set.', confirm: true }
  ];

  function buildConfirmWidget() {
    var card = document.createElement('div');
    card.className = 'chat-confirm';

    var iconWrap = document.createElement('div');
    iconWrap.className = 'chat-confirm-icon';

    var cal = document.createElement('div');
    cal.className = 'chat-confirm-cal';
    var calHeader = document.createElement('div');
    calHeader.className = 'chat-confirm-cal-header';
    var calDay = document.createElement('span');
    calDay.className = 'chat-confirm-cal-day';
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    calDay.textContent = tomorrow.getDate();
    cal.appendChild(calHeader);
    cal.appendChild(calDay);
    iconWrap.appendChild(cal);

    var check = document.createElement('div');
    check.className = 'chat-confirm-check';
    check.innerHTML = '<svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6.5L5 9l4.5-6" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    iconWrap.appendChild(check);
    card.appendChild(iconWrap);

    var details = document.createElement('div');
    details.className = 'chat-confirm-details';
    var title = document.createElement('span');
    title.className = 'chat-confirm-title';
    title.textContent = 'Callback scheduled';
    var time = document.createElement('span');
    time.className = 'chat-confirm-time';
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    time.textContent = 'Tomorrow, ' + months[tomorrow.getMonth()] + ' ' + tomorrow.getDate() + ' \u00b7 10:00 AM EST';
    details.appendChild(title);
    details.appendChild(time);
    card.appendChild(details);

    return card;
  }

  function buildBubble(msg) {
    var el = document.createElement('div');
    el.className = 'chat-msg ' + msg.sender;

    var header = document.createElement('div');
    header.className = 'chat-sender';

    if (msg.sender === 'kalinda') {
      var icon = document.createElement('img');
      icon.className = 'chat-sender-avatar';
      icon.src = 'kalinda_tree.png';
      icon.alt = '';
      header.appendChild(icon);
      header.appendChild(document.createTextNode('Kalinda'));
    } else {
      var avatar = document.createElement('img');
      avatar.className = 'chat-sender-avatar';
      avatar.src = AVATAR;
      avatar.alt = '';
      header.appendChild(avatar);
      header.appendChild(document.createTextNode('Kevin'));
    }

    var body = document.createElement('div');
    body.className = 'chat-text';
    body.textContent = msg.text;

    el.appendChild(header);
    el.appendChild(body);

    if (msg.confirm) {
      el.appendChild(buildConfirmWidget());
    }

    return el;
  }

  function runCycle() {
    var track = document.createElement('div');
    track.className = 'hero-chat-track';
    container.innerHTML = '';
    container.appendChild(track);

    var idx = 0;
    var BASE_DELAY = 2200;

    function showNext() {
      if (idx >= messages.length) {
        setTimeout(runCycle, 6000);
        return;
      }

      var bubble = buildBubble(messages[idx]);
      track.appendChild(bubble);

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bubble.classList.add('visible');
        });
      });

      idx++;
      var wordCount = messages[idx - 1].text.split(' ').length;
      var delay = Math.min(BASE_DELAY + wordCount * 75, 5000);
      setTimeout(showNext, delay);
    }

    setTimeout(showNext, 1400);
  }

  runCycle();
})();

// Nav scroll behavior
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = nav.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Fade-up on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.product-col, .intro-inner, .vision-inner, .security-inner, .footer-intro').forEach((el, i) => {
  if (!el.classList.contains('fade-up')) el.classList.add('fade-up');
  if (el.classList.contains('product-col')) {
    el.style.transitionDelay = `${i * 0.08}s`;
  }
  observer.observe(el);
});

// How It Works — tabbed auto-advance
(function () {
  var tabs = document.querySelectorAll('.hiw-tab');
  var slides = document.querySelectorAll('.hiw-slide');
  if (!tabs.length) return;

  var current = 0;
  var timer = null;
  var INTERVAL = 7000;

  function activate(idx) {
    tabs.forEach(function (t) { t.classList.remove('active'); });
    slides.forEach(function (s) { s.classList.remove('active'); });

    tabs[idx].classList.add('active');
    slides[idx].classList.add('active');
    current = idx;

    if (idx === 3) triageAnimate();
    else triageReset();

    restartFill(idx);
  }

  function restartFill(idx) {
    var fill = tabs[idx].querySelector('.hiw-tab-fill');
    fill.style.animation = 'none';
    fill.offsetHeight; // force reflow
    fill.style.animation = '';

    clearTimeout(timer);
    timer = setTimeout(function () {
      activate((current + 1) % tabs.length);
    }, INTERVAL);
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      activate(i);
    });
  });

  restartFill(0);
})();

// Triage Records animation
var triageTimers = [];
function triageClear() {
  triageTimers.forEach(function (t) { clearTimeout(t); });
  triageTimers = [];
}
function triageDelay(fn, ms) {
  triageTimers.push(setTimeout(fn, ms));
}
function triageReset() {
  triageClear();
  var cursor = document.getElementById('triage-cursor');
  var doc = document.getElementById('triage-doc');
  var dropzone = document.getElementById('triage-dropzone');
  var label = document.getElementById('triage-drop-label');
  var sub = document.getElementById('triage-drop-sub');
  var inputText = document.getElementById('triage-input-text');
  var toast = document.getElementById('triage-toast');
  if (!cursor) return;
  cursor.className = 'hiw-triage-cursor';
  doc.className = 'hiw-triage-doc';
  dropzone.classList.remove('uploaded');
  label.textContent = 'Drop files here';
  sub.textContent = 'PDF, DOCX up to 50 MB';
  inputText.textContent = '';
  inputText.classList.remove('typing');
  toast.classList.remove('visible');
}

function triageAnimate() {
  triageReset();
  var cursor = document.getElementById('triage-cursor');
  var doc = document.getElementById('triage-doc');
  var dropzone = document.getElementById('triage-dropzone');
  var label = document.getElementById('triage-drop-label');
  var sub = document.getElementById('triage-drop-sub');
  var inputText = document.getElementById('triage-input-text');
  var toast = document.getElementById('triage-toast');
  if (!cursor) return;

  var fullText = 'Add a field to track the type of Depo-Provera product. The product may appear in medical records as any of the following: Depo Provera, Depo-Provera, DPCI';
  var charIdx = 0;

  triageDelay(function () {
    cursor.classList.add('anim-enter');
    doc.classList.add('anim-enter');
  }, 200);

  triageDelay(function () {
    cursor.classList.remove('anim-enter');
    cursor.classList.add('anim-drop');
    doc.classList.remove('anim-enter');
    doc.classList.add('anim-drop');
  }, 900);

  triageDelay(function () {
    cursor.classList.add('anim-hide');
    doc.classList.add('anim-hide');
    dropzone.classList.add('uploaded');
    label.textContent = 'Depo_Provera_Records.pdf';
    sub.textContent = 'Uploaded · 2.4 MB';
  }, 1500);

  triageDelay(function () {
    inputText.classList.add('typing');
    function typeChar() {
      if (charIdx < fullText.length) {
        inputText.textContent = fullText.substring(0, charIdx + 1);
        charIdx++;
        triageDelay(typeChar, 16);
      } else {
        inputText.classList.remove('typing');
        triageDelay(function () {
          toast.classList.add('visible');
        }, 300);
      }
    }
    typeChar();
  }, 2000);
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.faq-item');
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (el) {
      el.classList.remove('open');
      el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
