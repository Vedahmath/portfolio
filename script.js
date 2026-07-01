/* ═══════════════════════════════════════════════════════════
   VEDA HANUMANAHALLIMATH — PORTFOLIO INTERACTIONS
   Scroll Animations · Skill Bars · Card Tilt · Lightbox · Contact Form
   ═══════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  loadHero3D();
  initScrollProgress();
  initNavbar();
  initScrollAnimations();
  initSkillBars();
  initHeroSocials();
  initKineticCards();
  initCertCardTilt();
  initLightbox();
  initContactForm();
  initSendBtnPulse();
});

let hero3DStarted = false;
let heroFallbackStarted = false;

function loadHero3D() {
  if (window.THREE) {
    initHero3D();
    return;
  }

  const stage = document.querySelector(".hero-3d-stage");
  if (!stage || document.getElementById("three-loader-script")) return;

  const script = document.createElement("script");
  script.id = "three-loader-script";
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js";
  script.async = true;
  const fallbackTimer = window.setTimeout(() => {
    if (!hero3DStarted) startHeroFallbackCanvas();
  }, 3500);

  script.onload = () => {
    window.clearTimeout(fallbackTimer);
    initHero3D();
  };
  script.onerror = () => {
    window.clearTimeout(fallbackTimer);
    startHeroFallbackCanvas();
  };
  document.head.appendChild(script);
}

function startHeroFallbackCanvas() {
  if (hero3DStarted || heroFallbackStarted) return;

  const canvas = document.getElementById("hero-three-canvas");
  const stage = document.querySelector(".hero-3d-stage");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canvas || !stage) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  heroFallbackStarted = true;
  stage.classList.add("three-fallback");
  stage.dataset.renderer = "fallback";

  const points = Array.from({ length: 90 }, (_, index) => ({
    angle: (index / 90) * Math.PI * 2,
    radius: 110 + Math.random() * 210,
    y: -160 + Math.random() * 320,
    speed: 0.25 + Math.random() * 0.45
  }));

  const resize = () => {
    const width = stage.clientWidth || window.innerWidth;
    const height = stage.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * Math.min(window.devicePixelRatio || 1, 1.5));
    canvas.height = Math.floor(height * Math.min(window.devicePixelRatio || 1, 1.5));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  };

  const drawCube = (cx, cy, size, phase) => {
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    const projected = vertices.map(([x, y, z]) => {
      const rotY = phase;
      const rotX = phase * 0.62;
      const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
      const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
      const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
      const depth = 3.2 + z2;
      return [cx + (x1 * size) / depth, cy + (y1 * size) / depth];
    });

    ctx.strokeStyle = "rgba(46, 196, 182, 0.55)";
    ctx.lineWidth = 1.3;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(projected[a][0], projected[a][1]);
      ctx.lineTo(projected[b][0], projected[b][1]);
      ctx.stroke();
    });
  };

  resize();
  window.addEventListener("resize", resize);

  const renderFallback = (time = 0) => {
    const width = stage.clientWidth || window.innerWidth;
    const height = stage.clientHeight || window.innerHeight;
    const t = time * 0.001;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);

    ctx.strokeStyle = "rgba(254, 127, 45, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 20, Math.min(width * 0.28, 360), Math.min(height * 0.16, 130), t * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    points.forEach(point => {
      const angle = point.angle + t * point.speed;
      const x = Math.cos(angle) * point.radius;
      const z = Math.sin(angle) * point.radius;
      const scale = 460 / (560 + z);
      const px = x * scale;
      const py = point.y * scale;
      ctx.fillStyle = "rgba(234, 236, 240, 0.62)";
      ctx.fillRect(px, py, 2, 2);
    });

    drawCube(width * 0.24, -height * 0.12, 210, t * 0.8);
    drawCube(-width * 0.27, height * 0.16, 150, -t * 0.65);

    ctx.restore();

    if (!prefersReducedMotion) requestAnimationFrame(renderFallback);
  };

  renderFallback();
}

/* ───────────────────────────────────────────
   HERO 3D SCENE - Three.js with CSS fallback
   ─────────────────────────────────────────── */
function initHero3D() {
  if (hero3DStarted || heroFallbackStarted) return;

  const canvas = document.getElementById("hero-three-canvas");
  const stage = document.querySelector(".hero-3d-stage");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!canvas || !stage || !window.THREE) return;
  hero3DStarted = true;

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0.15, 8.4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance"
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x2ec4b6,
    emissive: 0x0b403d,
    metalness: 0.72,
    roughness: 0.26,
    transparent: true,
    opacity: 0.76
  });

  const warmWireMaterial = new THREE.MeshBasicMaterial({
    color: 0xfe7f2d,
    wireframe: true,
    transparent: true,
    opacity: 0.34
  });

  const coolWireMaterial = new THREE.MeshBasicMaterial({
    color: 0xeaecf0,
    wireframe: true,
    transparent: true,
    opacity: 0.18
  });

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.08, 0.25, 180, 24),
    accentMaterial
  );
  knot.position.set(2.55, 0.18, -0.6);
  knot.rotation.set(0.45, 0.2, -0.15);
  mainGroup.add(knot);

  const icosahedron = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    warmWireMaterial
  );
  icosahedron.position.set(-3.0, -0.55, -0.7);
  icosahedron.rotation.set(0.2, 0.7, 0.1);
  mainGroup.add(icosahedron);

  const dodecahedron = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.72, 0),
    coolWireMaterial
  );
  dodecahedron.position.set(-0.45, 1.95, -1.4);
  mainGroup.add(dodecahedron);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.012, 12, 160),
    new THREE.MeshBasicMaterial({
      color: 0xfe7f2d,
      transparent: true,
      opacity: 0.32
    })
  );
  ring.rotation.x = Math.PI / 2.45;
  ring.position.set(0.65, -0.2, -1.1);
  mainGroup.add(ring);

  const pointGeometry = new THREE.BufferGeometry();
  const pointCount = 340;
  const pointPositions = new Float32Array(pointCount * 3);
  for (let i = 0; i < pointCount; i += 1) {
    const radius = 3.2 + Math.random() * 5.2;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 5.2;
    pointPositions[i * 3] = Math.cos(angle) * radius;
    pointPositions[i * 3 + 1] = height;
    pointPositions[i * 3 + 2] = Math.sin(angle) * radius - 2;
  }
  pointGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));

  const points = new THREE.Points(
    pointGeometry,
    new THREE.PointsMaterial({
      color: 0xeaecf0,
      size: 0.025,
      transparent: true,
      opacity: 0.58
    })
  );
  scene.add(points);

  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(90 * 6);
  for (let i = 0; i < linePositions.length; i += 6) {
    const x = (Math.random() - 0.5) * 8;
    const y = (Math.random() - 0.5) * 4.8;
    const z = -1 - Math.random() * 4;
    linePositions[i] = x;
    linePositions[i + 1] = y;
    linePositions[i + 2] = z;
    linePositions[i + 3] = x + (Math.random() - 0.5) * 1.1;
    linePositions[i + 4] = y + (Math.random() - 0.5) * 0.85;
    linePositions[i + 5] = z + (Math.random() - 0.5) * 0.6;
  }
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  const lines = new THREE.LineSegments(
    lineGeometry,
    new THREE.LineBasicMaterial({
      color: 0x2ec4b6,
      transparent: true,
      opacity: 0.18
    })
  );
  scene.add(lines);

  scene.add(new THREE.AmbientLight(0xffffff, 0.58));

  const keyLight = new THREE.DirectionalLight(0x2ec4b6, 1.35);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xfe7f2d, 1.5, 14);
  fillLight.position.set(-3.5, -1.8, 3.2);
  scene.add(fillLight);

  const pointer = { x: 0, y: 0 };
  const scroll = { value: 0 };

  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener("scroll", () => {
    scroll.value = window.scrollY * 0.0007;
  }, { passive: true });

  const resize = () => {
    const width = stage.clientWidth || window.innerWidth;
    const height = stage.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener("resize", resize);
  stage.classList.add("three-ready");
  stage.dataset.renderer = "three";

  const renderFrame = (time = 0) => {
    const t = time * 0.001;
    const parallaxX = pointer.x * 0.18;
    const parallaxY = pointer.y * 0.12;

    mainGroup.rotation.y = t * 0.12 + parallaxX + scroll.value;
    mainGroup.rotation.x = -parallaxY;
    knot.rotation.x += 0.006;
    knot.rotation.y += 0.008;
    icosahedron.rotation.x -= 0.004;
    icosahedron.rotation.y += 0.006;
    dodecahedron.rotation.y -= 0.007;
    ring.rotation.z = t * 0.18;
    points.rotation.y = t * 0.025 + scroll.value * 0.4;
    lines.rotation.y = -t * 0.018;

    renderer.render(scene, camera);

    if (!prefersReducedMotion) {
      requestAnimationFrame(renderFrame);
    }
  };

  renderFrame();
}

/* ───────────────────────────────────────────
   SCROLL PROGRESS
   ─────────────────────────────────────────── */
function initScrollProgress() {
  const progress = document.getElementById("scroll-progress");
  if (!progress) return;

  const updateProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress.style.width = `${Math.min(ratio * 100, 100)}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

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
   KINETIC CARDS - pointer depth and light sweep
   ─────────────────────────────────────────── */
function initKineticCards() {
  const cards = document.querySelectorAll(
    ".project-card, .skill-category-card, .mv-card, .edu-card, .ach-card, .contact-form-card, .contact-info-panel"
  );

  cards.forEach(card => {
    card.classList.add("kinetic-card");

    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      const rotateY = ((x / rect.width) - 0.5) * 7;

      card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--spot-x", `${((x / rect.width) * 100).toFixed(1)}%`);
      card.style.setProperty("--spot-y", `${((y / rect.height) * 100).toFixed(1)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--spot-x", "50%");
      card.style.setProperty("--spot-y", "50%");
    });
  });
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
  if (!form) return;

  form.addEventListener("submit", function (e) {

      e.preventDefault();

      const button = document.getElementById("btn-send-message");
      if (!window.emailjs) {
          alert("Email service is still loading. Please try again in a moment.");
          return;
      }

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
