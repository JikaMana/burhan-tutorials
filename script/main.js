(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
  drawIcons();

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Nav state + progress bar ---------- */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("progressbar");
  var waFloat = document.getElementById("wa-float");
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("section[id]"),
  );
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-link"),
  );
  var methodGrid = document.getElementById("method-grid");
  var railFill = methodGrid ? methodGrid.querySelector(".rail-fill") : null;
  var ticking = false;

  function update() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle("is-stuck", y > 12);
    waFloat.classList.toggle("on", y > 620);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? Math.min(y / h, 1) : 0) + ")";
    var current = "";
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop - 140 <= y) current = sections[i].id;
    }
    for (var j = 0; j < navLinks.length; j++) {
      navLinks[j].classList.toggle(
        "is-active",
        navLinks[j].getAttribute("href") === "#" + current,
      );
    }
    if (railFill && methodGrid) {
      var r = methodGrid.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.82 - r.top) / (r.height + vh * 0.2);
      p = Math.max(0, Math.min(1, p));
      railFill.style.transform =
        window.innerWidth >= 768 ? "scaleX(" + p + ")" : "scaleY(" + p + ")";
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menu-btn");
  var menu = document.getElementById("mobile-menu");
  var menuIconWrap = document.getElementById("menu-icon-wrap");
  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    menu.style.maxHeight = open ? menu.scrollHeight + "px" : "0px";
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuIconWrap.innerHTML =
      '<i data-lucide="' + (open ? "x" : "menu") + '" class="w-5 h-5"></i>';
    drawIcons();
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!menuOpen);
  });
  Array.prototype.forEach.call(
    document.querySelectorAll(".mob-link"),
    function (l) {
      l.addEventListener("click", function () {
        if (menuOpen) setMenu(false);
      });
    },
  );
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024 && menuOpen) setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal"),
  );
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("revealed");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var sibs = Array.prototype.slice
            .call(el.parentElement ? el.parentElement.children : [])
            .filter(function (n) {
              return n.classList && n.classList.contains("reveal");
            });
          var idx = Math.max(0, sibs.indexOf(el));
          el.style.transitionDelay = Math.min(idx * 80, 320) + "ms";
          el.classList.add("revealed");
          io.unobserve(el);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Hero headline ---------- */
  var heroCopy = document.getElementById("hero-copy");
  if (heroCopy) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        heroCopy.classList.add("hero-in");
      });
    });
  }

  /* ---------- Hero Carousel ---------- */
  var carouselTrack = document.getElementById("carousel-track");
  var carouselDots = document.getElementById("carousel-dots");
  var carouselPrev = document.getElementById("carousel-prev");
  var carouselNext = document.getElementById("carousel-next");
  var currentSlide = 0;
  var totalSlides = 8;
  var carouselInterval;

  function initCarousel() {
    if (!carouselTrack || !carouselDots) return;

    for (var i = 0; i < totalSlides; i++) {
      var dot = document.createElement("button");

      dot.className = "hero-carousel-dot" + (i === 0 ? " active" : "");

      dot.setAttribute("aria-label", "Go to slide " + (i + 1));

      dot.addEventListener(
        "click",
        (function (idx) {
          return function () {
            stopCarousel();
            goToSlide(idx);
            startCarousel();
          };
        })(i),
      );

      carouselDots.appendChild(dot);
    }

    drawIcons();
    startCarousel();
  }

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    currentSlide = index;

    var carouselWidth = document.getElementById("hero-carousel").clientWidth;

    carouselTrack.style.transform =
      "translateX(-" + index * carouselWidth + "px)";

    var dots = carouselDots.querySelectorAll(".hero-carousel-dot");

    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }

  function startCarousel() {
    carouselInterval = setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 4500);
  }

  function stopCarousel() {
    clearInterval(carouselInterval);
  }

  if (carouselPrev) {
    carouselPrev.addEventListener("click", function () {
      stopCarousel();
      goToSlide(currentSlide - 1);
      startCarousel();
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", function () {
      stopCarousel();
      goToSlide(currentSlide + 1);
      startCarousel();
    });
  }

  if (carouselTrack) {
    carouselTrack.addEventListener("mouseenter", stopCarousel);
    carouselTrack.addEventListener("mouseleave", startCarousel);
  }

  window.addEventListener("resize", function () {
    goToSlide(currentSlide);
  });

  initCarousel();

  /* ---------- Count up stats ---------- */
  var counters = Array.prototype.slice.call(
    document.querySelectorAll(".count"),
  );
  function runCount(el) {
    var to = parseInt(el.getAttribute("data-to"), 10) || 0;
    var sep = el.hasAttribute("data-sep");
    if (reduced) {
      el.textContent = sep ? to.toLocaleString("en-US") : to;
      return;
    }
    var start = null,
      dur = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = sep ? v.toLocaleString("en-US") : v;
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            runCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach(function (c) {
      cio.observe(c);
    });
  } else {
    counters.forEach(runCount);
  }

  /* ---------- FAQ: one open at a time ---------- */
  var faqs = Array.prototype.slice.call(
    document.querySelectorAll("details.faq"),
  );
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      faqs.forEach(function (o) {
        if (o !== d) o.open = false;
      });
    });
  });

  /* ---------- QR code ---------- */
  var qrBox = document.getElementById("qr");
  var siteUrl = "https://burhantutors.netlify.app/";
  if (qrBox) {
    try {
      if (!window.QRCode) throw new Error("qr unavailable");
      qrBox.innerHTML = "";
      new QRCode(qrBox, {
        text: siteUrl,
        width: 144,
        height: 144,
        colorDark: "#081423",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch (err) {
      qrBox.innerHTML =
        '<span class="font-mono text-[10px] text-ink/55 leading-snug px-2">burhantutors<br>.netlify.app</span>';
    }
  }

  /* ---------- Copy link ---------- */
  var copyBtn = document.getElementById("copy-link");
  var copyLabel = document.getElementById("copy-label");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      function done() {
        copyLabel.textContent = "Link copied";
        setTimeout(function () {
          copyLabel.textContent = "Copy page link";
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(siteUrl)
          .then(done)
          .catch(function () {
            copyLabel.textContent = siteUrl;
          });
      } else {
        var ta = document.createElement("textarea");
        ta.value = siteUrl;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch (e) {
          copyLabel.textContent = siteUrl;
        }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- Registration poll (Firebase) ---------- */
  var pollRoot = document.getElementById("reg-poll");
  if (pollRoot) {
    var STORAGE_KEY = "burhan_poll_answered";
    var pollButtons = Array.prototype.slice.call(
      pollRoot.querySelectorAll(".poll-option"),
    );
    var stateAsk = pollRoot.querySelector('[data-poll-state="ask"]');
    var stateThanks = pollRoot.querySelector('[data-poll-state="thanks"]');
    var errorEl = pollRoot.querySelector(".poll-error");
    var submitting = false;

    function showThanks() {
      if (stateAsk) stateAsk.classList.remove("is-active");
      if (stateThanks) stateThanks.classList.add("is-active");
    }

    // If this device already answered, skip straight to the thank-you state.
    try {
      if (window.localStorage && localStorage.getItem(STORAGE_KEY)) {
        showThanks();
      }
    } catch (e) {
      /* localStorage unavailable — no-op, poll still works */
    }

    function submitAnswer(button) {
      if (submitting) return;
      submitting = true;

      var answer = button.getAttribute("data-answer");
      pollButtons.forEach(function (b) {
        b.disabled = true;
      });
      button.classList.add("is-picked");
      if (errorEl) errorEl.classList.remove("is-active");

      function onSuccess() {
        try {
          if (window.localStorage) {
            localStorage.setItem(STORAGE_KEY, answer);
          }
        } catch (e) {
          /* ignore */
        }
        showThanks();
      }

      function onFailure(err) {
        console.error("Poll submission failed:", err);
        submitting = false;
        pollButtons.forEach(function (b) {
          b.disabled = false;
        });
        button.classList.remove("is-picked");
        if (errorEl) errorEl.classList.add("is-active");
      }

      // Requires Firebase to be initialised — see the firebaseConfig
      // block near the top of this file / the <script> in index.html.
      if (
        window.firebase &&
        window.firebase.apps &&
        window.firebase.apps.length
      ) {
        window.firebase
          .firestore()
          .collection("poll_responses")
          .add({
            question: "what_stops_registration",
            answer: answer,
            page: window.location.href,
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(onSuccess)
          .catch(onFailure);
      } else {
        onFailure(new Error("Firebase is not configured yet."));
      }
    }

    pollButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        submitAnswer(b);
      });
    });
  }
})();
