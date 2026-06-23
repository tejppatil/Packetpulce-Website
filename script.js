// ===== SCROLL PROGRESS BAR + NAV + HERO PARALLAX + GLOBAL ZOOM =====
const nav = document.querySelector('nav');
const progressBar = document.getElementById('scroll-progress');
const heroContent = document.querySelector('.hero-content');
const heroSection = document.getElementById('hero');
const mainWrap = document.getElementById('main-wrap');
const footer = document.querySelector('footer');
const scrollSpacer = document.getElementById('scroll-spacer');

// Function to update the bottom spacer's height to match the zoom expansion (8% of main-wrap height)
function updateScrollSpacer() {
  if (mainWrap && scrollSpacer) {
    scrollSpacer.style.height = (mainWrap.offsetHeight * 0.08) + 'px';
  }
}

// Automatically observe height changes of main-wrap to update the spacer
if (mainWrap && scrollSpacer && typeof ResizeObserver !== 'undefined') {
  const resizeObserver = new ResizeObserver(() => {
    updateScrollSpacer();
  });
  resizeObserver.observe(mainWrap);
}

// Fallbacks for loading states
window.addEventListener('load', updateScrollSpacer);
document.addEventListener('DOMContentLoaded', updateScrollSpacer);
window.addEventListener('resize', updateScrollSpacer);

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  
  // Progress bar
  if (progressBar && docH > 0) {
    progressBar.style.width = (scrollY / docH * 100) + '%';
  }
  
  // Nav
  if (nav) {
    nav.classList.toggle('scrolled', scrollY > 50);
  }
  
  // Hero parallax fade-out
  if (heroContent && heroSection) {
    const heroH = heroSection.offsetHeight;
    const progress = Math.min(scrollY / heroH, 1);
    heroContent.style.opacity = Math.max(1 - progress * 1.5, 0);
    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
  }
  
  // GLOBAL ZOOM: zoom into the page as you scroll down, zoom out when scrolling back up
  let scrollProgress = 0;
  if (docH > 0) {
    scrollProgress = scrollY / docH; // 0 at top, 1 at bottom
    if (mainWrap) {
      const zoom = 1 + scrollProgress * 0.08; // 1.0 → 1.08
      mainWrap.style.transform = `scale(${zoom})`;
      
      // Translate the footer downwards so it sits perfectly below the visually expanded mainWrap
      if (footer) {
        const translation = scrollProgress * 0.08 * mainWrap.offsetHeight;
        footer.style.transform = `translateY(${translation}px)`;
      }
    }
  }
    
  // Dreamwalker background glow lines — sweep across screen with scroll
  const gl1 = document.querySelector('.gl-1');
  const gl2 = document.querySelector('.gl-2');
  const gl3 = document.querySelector('.gl-3');
  const dwImg = document.getElementById('dw-bg-img');
    
  if (gl1 && gl2 && gl3) {
    // Lines move at different speeds, creating a scanning effect
    const y1 = (scrollProgress * 300) % 120; // fastest
    const y2 = (scrollProgress * 200 + 40) % 120; // medium  
    const y3 = (scrollProgress * 150 + 70) % 120; // slowest
      
    gl1.style.top = y1 + '%';
    gl2.style.top = y2 + '%';
    gl3.style.top = y3 + '%';
      
    // Lines fade in when scrolling, fade out at rest
    gl1.style.opacity = Math.min(scrollProgress * 3, 0.7);
    gl2.style.opacity = Math.min(scrollProgress * 2.5, 0.5);
    gl3.style.opacity = Math.min(scrollProgress * 2, 0.4);
  }
    
  // Background image subtle pulse — gets slightly brighter as you scroll deeper
  if (dwImg) {
    const imgOpacity = 0.12 + scrollProgress * 0.08;
    const imgRotate = scrollProgress * 8; // subtle rotation
    dwImg.style.opacity = imgOpacity;
    dwImg.style.transform = `rotate(${imgRotate}deg) scale(${1 + scrollProgress * 0.1})`;
  }

}, {passive: true});

// ===== HAMBURGER MENU =====
const hamburger = document.querySelector('.hamburger');
const navUl = document.querySelector('nav ul');
if (hamburger && navUl) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    navUl.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (navUl.classList.contains('open') && !navUl.contains(e.target) && e.target !== hamburger) {
      navUl.classList.remove('open');
    }
  });
  navUl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navUl.classList.remove('open');
    });
  });
}

// ===== GLITCH HEADLINE — MOUSE-TRIGGERED =====
const glitchEls = document.querySelectorAll('.glitch');
let glitchTimeout = null;

if (heroSection) {
  heroSection.addEventListener('mousemove', () => {
    glitchEls.forEach(el => {
      el.classList.add('active');
    });
    clearTimeout(glitchTimeout);
    glitchTimeout = setTimeout(() => {
      glitchEls.forEach(el => el.classList.remove('active'));
    }, 200);
  });

  heroSection.addEventListener('mouseleave', () => {
    glitchEls.forEach(el => el.classList.remove('active'));
  });
}

// ===== DEMO & HERO OBSERVER FOR LAZY LOADING =====
const demoObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.target) {
      e.target.isAnimating = e.isIntersecting;
    }
  });
}, { threshold: 0 });

// ===== ENHANCED NETWORK CANVAS (HERO) =====
const canvas = document.getElementById('net');
if (canvas) demoObserver.observe(canvas);
const ctx = canvas ? canvas.getContext('2d') : null;
let nodes = [], W = window.innerWidth, H = window.innerHeight, packets = [];
let mouseX = -1000, mouseY = -1000;

// Track mouse for interactive background
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function resize() {
  if (!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  const count = Math.min(90, Math.floor((W * H) / 12000));
  nodes = Array.from({length: count}, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
    r: Math.random() * 2.5 + .8,
    type: Math.random() < .08 ? 'threat' : 'normal',
    baseR: Math.random() * 2.5 + .8
  }));
}

if (canvas) {
  resize();
  window.addEventListener('resize', resize);
}

function addPacket() {
  if (!nodes || nodes.length < 2) return;
  const a = nodes[Math.floor(Math.random() * nodes.length)];
  const b = nodes[Math.floor(Math.random() * nodes.length)];
  if (a && b && a !== b) packets.push({
    a, b, t: 0,
    speed: .006 + Math.random() * .01,
    threat: Math.random() < .1,
    trail: []
  });
}
setInterval(addPacket, 180);

let frame = 0;
let threatRings = [];

function drawNet() {
  frame++;
  if (!ctx || !W || !H) {
    requestAnimationFrame(drawNet);
    return;
  }
  
  ctx.clearRect(0, 0, W, H);

  // --- Subtle radial glow following mouse ---
  const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 280);
  grd.addColorStop(0, 'rgba(0,217,255,.06)');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // --- Animated grid overlay ---
  ctx.strokeStyle = 'rgba(0,217,255,.025)';
  ctx.lineWidth = .5;
  const gridSize = 60;
  const offsetX = (frame * .2) % gridSize;
  const offsetY = (frame * .15) % gridSize;
  for (let x = -gridSize + offsetX; x < W + gridSize; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -gridSize + offsetY; y < H + gridSize; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // --- Connections ---
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 160) {
        const alpha = (1 - d / 160) * .15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(0,217,255,${alpha})`;
        ctx.lineWidth = .6;
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // --- Packets with trails ---
  packets = packets.filter(p => {
    p.t += p.speed;
    if (p.t > 1) return false;
    const x = p.a.x + (p.b.x - p.a.x) * p.t;
    const y = p.a.y + (p.b.y - p.a.y) * p.t;
    p.trail.push({x, y});
    if (p.trail.length > 8) p.trail.shift();

    // Draw trail
    for (let i = 0; i < p.trail.length; i++) {
      const alpha = (i / p.trail.length) * .5;
      const r = (i / p.trail.length) * 2;
      ctx.beginPath();
      ctx.arc(p.trail[i].x, p.trail[i].y, r, 0, Math.PI * 2);
      ctx.fillStyle = p.threat ? `rgba(255,34,85,${alpha})` : `rgba(0,217,255,${alpha})`;
      ctx.fill();
    }

    // Draw head
    ctx.beginPath();
    ctx.arc(x, y, p.threat ? 3 : 2, 0, Math.PI * 2);
    ctx.fillStyle = p.threat ? 'rgba(255,34,85,.9)' : 'rgba(0,217,255,.85)';
    ctx.fill();

    if (p.threat) {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,34,85,.08)';
      ctx.fill();
    }
    return true;
  });

  // --- Nodes with mouse interaction ---
  nodes.forEach(n => {
    // Mouse repulsion/attraction
    const dmx = n.x - mouseX, dmy = n.y - mouseY;
    const dm = Math.sqrt(dmx * dmx + dmy * dmy);
    if (dm < 200 && dm > 0) {
      const force = (200 - dm) / 200 * .15;
      n.vx += (dmx / dm) * force;
      n.vy += (dmy / dm) * force;
    }

    // Damping
    n.vx *= .995;
    n.vy *= .995;

    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    n.x = Math.max(0, Math.min(W, n.x));
    n.y = Math.max(0, Math.min(H, n.y));

    // Pulsating size
    const pulseR = n.baseR + Math.sin(frame * .02 + n.x * .01) * .5;

    // Glow when near mouse
    if (dm < 150) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR + 4, 0, Math.PI * 2);
      ctx.fillStyle = n.type === 'threat' ? 'rgba(255,34,85,.12)' : 'rgba(0,217,255,.1)';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = n.type === 'threat' ? 'rgba(255,34,85,.8)' : 'rgba(0,217,255,.55)';
    ctx.fill();
  });

  // --- Occasional threat pulse rings ---
  if (frame % 120 === 0) {
    const tn = nodes.find(n => n.type === 'threat');
    if (tn) threatRings.push({x: tn.x, y: tn.y, r: 0, maxR: 60});
  }
  threatRings = threatRings.filter(ring => {
    ring.r += .8;
    if (ring.r > ring.maxR) return false;
    const alpha = (1 - ring.r / ring.maxR) * .3;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,34,85,${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    return true;
  });

  requestAnimationFrame(drawNet);
}
if (canvas) {
  drawNet();
}



// ===== TERMINAL ANIMATION (ABOUT SECTION) =====
function animateTerminal() {
  try {
    const lines = document.querySelectorAll('.term-line');
    if (!lines) return;
    lines.forEach((line, i) => {
      setTimeout(() => {
        if (line) line.classList.add('visible');
      }, 300 + i * 400);
    });
  } catch(e) {
    console.error('Terminal animation error:', e);
  }
}

// ===== CARD STAGGER ANIMATION =====
function animateCards() {
  try {
    const cards = document.querySelectorAll('.feat-card');
    if (!cards) return;
    cards.forEach((card, i) => {
      setTimeout(() => {
        if (card) card.classList.add('visible');
      }, i * 150);
    });
  } catch(e) {
    console.error('Card animation error:', e);
  }
}

// ===== COMPARISON ITEMS STAGGER =====
function animateCompare() {
  try {
    const items = document.querySelectorAll('.compare-item');
    if (!items) return;
    items.forEach((item, i) => {
      setTimeout(() => {
        if (item) item.classList.add('visible');
      }, i * 120);
    });
  } catch(e) {
    console.error('Compare animation error:', e);
  }
}





// ===== TYPEWRITER EFFECT =====
function typewriterEffect(el) {
  try {
    const text = el?.getAttribute('data-cmd');
    if (!text || el?.dataset?.typed) return;
    el.dataset.typed = 'true';
    el.textContent = '';
    let i = 0;
    function type() {
      if (i < text.length && el) {
        el.textContent += text[i];
        i++;
        setTimeout(type, 35 + Math.random() * 25);
      }
    }
    type();
  } catch(e) {
    console.error('Typewriter error:', e);
  }
}

// ===== COPY BUTTON =====
function showCopiedState(btn) {
  try {
    if (!btn) return;
    btn.textContent = '✓ COPIED';
    btn.style.color = 'var(--green)';
    btn.style.borderColor = 'rgba(0,255,136,.3)';
    setTimeout(() => {
      btn.textContent = 'COPY';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  } catch(e) {
    console.error('Show copied state error:', e);
  }
}

function fallbackCopy(btn, text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (success) {
      showCopiedState(btn);
    } else {
      console.error('Fallback copy failed');
    }
  } catch(e) {
    console.error('Fallback copy execution error:', e);
  }
}

function copyCode(btn, text) {
  try {
    if (!btn || !text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          showCopiedState(btn);
        })
        .catch(err => {
          console.warn('Clipboard API failed, using fallback:', err);
          fallbackCopy(btn, text);
        });
    } else {
      fallbackCopy(btn, text);
    }
  } catch(e) {
    console.error('Copy error:', e);
  }
}

// ===== DYNAMIC LISTENERS INITIALIZATION =====
const initDynamicListeners = () => {
  try {
    // Bind COPY buttons dynamically
    const copyBtns = document.querySelectorAll('.copy-btn');
    if (copyBtns) {
      copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const text = btn.getAttribute('data-copy');
          if (text) copyCode(btn, text);
        });
      });
    }

    // Bind Nav logo click to scroll to top
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
      navLogo.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  } catch(e) {
    console.error('Error initializing dynamic listeners:', e);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDynamicListeners);
} else {
  initDynamicListeners();
}

// ===== INTERSECTION OBSERVER — MASTER =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting || !e.target) return;
    
    try {
      e.target.classList.add('visible');
      
      if (e.target.id === 'about') animateTerminal();
      if (e.target.id === 'arsenal') animateCards();
      if (e.target.id === 'compare') { 
        animateCompare(); 
      }
      
      if (e.target.id === 'install') {
        // Stagger each step sliding in
        const steps = document.querySelectorAll('.step');
        if (steps) {
          steps.forEach((step, i) => {
            setTimeout(() => {
              if (step) step.classList.add('visible');
            }, i * 250);
          });
        }
        
        // Typewriter after steps appear
        const cmdTexts = document.querySelectorAll('.cmd-text');
        if (cmdTexts) {
          cmdTexts.forEach((el, i) => {
            setTimeout(() => typewriterEffect(el), 300 + i * 700);
          });
        }
      }
    } catch(err) {
      console.error('Reveal observer error:', err);
    }
  });
}, {threshold: 0.01});

// Observe ALL reveal variant classes
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
if (revealElements) {
  revealElements.forEach(r => {
    if (r && revealObserver) revealObserver.observe(r);
  });
}

// Make visible any sections already in viewport on page load
const checkVisibleSections = () => {
  const allRevealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  allRevealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0 && !el.classList.contains('visible')) {
      el.classList.add('visible');
      // Trigger animations for visible sections
      if (el.id === 'about') setTimeout(animateTerminal, 50);
      if (el.id === 'arsenal') setTimeout(animateCards, 50);
      if (el.id === 'compare') {
        setTimeout(animateCompare, 50);
      }
    }
  });
};

// Check on page load and after short delay
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkVisibleSections);
} else {
  checkVisibleSections();
}
// Also check after page fully loads
window.addEventListener('load', checkVisibleSections);

// IMMEDIATELY trigger reveal checks if anchor is in URL
if (window.location.hash) {
  setTimeout(checkVisibleSections, 100);
}

// Also trigger checks on scroll to catch sections that appear in viewport
window.addEventListener('scroll', () => {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    if (!el.classList.contains('visible')) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('visible');
        if (el.id === 'arsenal') setTimeout(animateCards, 50);
        if (el.id === 'about') setTimeout(animateTerminal, 50);
        if (el.id === 'compare') {
          setTimeout(animateCompare, 50);
        }
      }
    }
  });
}, {passive: true});
