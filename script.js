/* ═══════════════════════════════════════════════════════════
   VEDA HANUMANAHALLIMATH — PORTFOLIO INTERACTIONS
   Scroll Animations · Skill Bars · Card Tilt · Lightbox · Contact Form
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initScrollAnimations();
  initSkillBars();
  initHeroSocials();
  initCertCardTilt();
  initLightbox();
  initContactForm();
  initSendBtnPulse();
});

/* ───────────────────────────────────────────
   NAVBAR — Scroll class + Mobile toggle
   ─────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById("main-navbar");
  const toggle = document.getElementById("nav-toggle");
  const overlay = document.getElementById("mobile-nav-overlay");

  // Sticky scroll styling
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile hamburger toggle
  if (toggle && overlay) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      overlay.classList.toggle("open");
      document.body.style.overflow = overlay.classList.contains("open") ? "hidden" : "";
    });

    // Close overlay on link click
    overlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        toggle.classList.remove("active");
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }
}

/* ───────────────────────────────────────────
   SCROLL ANIMATIONS — IntersectionObserver
   ─────────────────────────────────────────── */
function initScrollAnimations() {
  const animEls = document.querySelectorAll(".animate-el");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute("data-delay") || 0;

        setTimeout(() => {
          el.classList.add("visible");

          // Apply specific animation via data attribute
          const anim = el.getAttribute("data-anim");
          if (anim) {
            const duration = el.getAttribute("data-duration") || "0.7s";
            el.style.animation = `${anim} ${duration} ease forwards`;
            el.style.animationDelay = `${delay}s`;
          }
        }, parseFloat(delay) * 1000);

        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -40px 0px"
  });

  animEls.forEach(el => observer.observe(el));
}

/* ───────────────────────────────────────────
   SKILL BARS — Animate width + count up
   ─────────────────────────────────────────── */
function initSkillBars() {
  const skillSection = document.getElementById("skills");
  if (!skillSection) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateSkillBars();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(skillSection);
}

function animateSkillBars() {
  const fills = document.querySelectorAll(".skill-bar-fill");
  const percents = document.querySelectorAll(".skill-percent");

  fills.forEach((fill, i) => {
    const targetWidth = parseInt(fill.getAttribute("data-width"), 10);

    // Animate the bar
    setTimeout(() => {
      fill.style.width = targetWidth + "%";
    }, i * 80);

    // Animate the percentage counter
    if (percents[i]) {
      const targetVal = parseInt(percents[i].getAttribute("data-target"), 10);
      countUp(percents[i], targetVal, i * 80);
    }
  });
}

function countUp(el, target, startDelay) {
  let current = 0;
  const increment = Math.ceil(target / 40);
  const interval = 30;

  setTimeout(() => {
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current + "%";
    }, interval);
  }, startDelay);
}

/* ───────────────────────────────────────────
   HERO SOCIALS — Bounce in one by one
   ─────────────────────────────────────────── */
function initHeroSocials() {
  const socials = document.querySelectorAll("#hero-socials a");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        socials.forEach((icon, i) => {
          setTimeout(() => {
            icon.classList.add("pop-in");
          }, 300 + i * 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const heroSection = document.getElementById("hero-socials");
  if (heroSection) observer.observe(heroSection);
}

/* ───────────────────────────────────────────
   CERTIFICATION CARD TILT — Mouse follow
   ─────────────────────────────────────────── */
function initCertCardTilt() {
  const certCards = document.querySelectorAll(".cert-card");

  certCards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
}

/* ───────────────────────────────────────────
   LIGHTBOX MODAL — Image zoom
   ─────────────────────────────────────────── */
function initLightbox() {
  const lightbox = document.getElementById("lightbox-overlay");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.getElementById("lightbox-close-btn");

  const zoomElements = document.querySelectorAll(".cert-img");

  zoomElements.forEach(el => {
    el.style.cursor = "zoom-in";
    el.addEventListener("click", (e) => {
      // Don't trigger if clicking on overlay link
      if (e.target.closest(".cert-overlay")) return;

      const largeImgUrl = el.getAttribute("data-large") || el.src;
      const altText = el.alt || "Certificate Image";

      if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = largeImgUrl;
        lightboxCaption.textContent = altText;
        lightbox.style.display = "flex";

        requestAnimationFrame(() => {
          lightbox.classList.add("open");
        });
      }
    });
  });

  // Close Modal
  if (closeBtn && lightbox) {
    const closeModal = () => {
      lightbox.classList.remove("open");
      setTimeout(() => {
        lightbox.style.display = "none";
      }, 300);
    };

    closeBtn.addEventListener("click", closeModal);

    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) closeModal();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && lightbox.classList.contains("open")) {
        closeModal();
      }
    });
  }
}

/* ───────────────────────────────────────────
   CONTACT FORM — mailto redirect
   ─────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById("portfolio-contact-form");

  form.addEventListener("submit", function (e) {

      e.preventDefault();

      const button = document.getElementById("btn-send-message");

      button.disabled = true;
      button.innerHTML = "Sending...";

      emailjs.sendForm(
          "service_iyj9pqg",
          "template_6pez5ux",
          this
      )
      .then(() => {

          alert("✅ Message sent successfully!");

          form.reset();

          button.disabled = false;
          button.innerHTML =
          '<i class="fa-solid fa-paper-plane"></i> Send Message';

      })
      .catch((error) => {

          console.error(error);

          alert("❌ Failed to send message.");

          button.disabled = false;
          button.innerHTML =
          '<i class="fa-solid fa-paper-plane"></i> Send Message';

      });

  });
}

/* ───────────────────────────────────────────
   SEND BUTTON PULSE — After form renders
   ─────────────────────────────────────────── */
function initSendBtnPulse() {
  const contactSection = document.getElementById("contact");
  if (!contactSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          const btn = document.getElementById("btn-send-message");
          if (btn) {
            btn.style.animation = "pulseSend 1s ease";
            btn.addEventListener("animationend", () => {
              btn.style.animation = "";
            }, { once: true });
          }
        }, 1200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(contactSection);
}

