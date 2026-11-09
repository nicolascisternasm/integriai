/* IntegriAI: menú, robot del inicio, selector, acordeón, mapa y firma deformable. Cada parte corre solo si su sección existe. */
(() => {
  const BRAND = 'IntegriAI';
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  /* ---------- Campaña: guarda los utm del primer enlace para el formulario ---------- */
  try {
    const q = new URLSearchParams(location.search), u = JSON.parse(sessionStorage.getItem('utm') || '{}');
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(k => { if (q.get(k)) u[k] = q.get(k).slice(0, 200); });
    if (!u.landing) u.landing = location.pathname;
    sessionStorage.setItem('utm', JSON.stringify(u));
  } catch (e) {}

  /* ---------- Menú ---------- */
  const svcBtn = $('#svc-btn'), drop = $('#drop'), burger = $('#burger'), mnav = $('#mnav'), totop = $('#totop');
  const setDrop = open => { drop.hidden = !open; svcBtn.setAttribute('aria-expanded', open); };
  svcBtn.addEventListener('click', e => { e.stopPropagation(); setDrop(drop.hidden); });
  document.addEventListener('click', e => { if (!drop.hidden && !drop.contains(e.target)) setDrop(false); });
  drop.addEventListener('click', e => { const a = e.target.closest('a'); if (a) { setDrop(false); if (svcs.length) openSvc(+a.dataset.svc); } });
  burger.addEventListener('click', () => { const open = mnav.hidden; mnav.hidden = !open; burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
  mnav.addEventListener('click', e => { if (e.target.closest('a')) { mnav.hidden = true; burger.setAttribute('aria-expanded', false); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !drop.hidden) { setDrop(false); svcBtn.focus(); } });
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  addEventListener('scroll', () => totop.classList.toggle('off', scrollY < 600), { passive: true });

  /* ---------- Aparición al bajar (solo lo que no se ve al cargar) ---------- */
  const rvs = [...document.querySelectorAll('.rv')];
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach((el, i) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); } });
    setTimeout(() => rvs.forEach(el => el.classList.remove('pre')), 9000);   // por si algo no llega a verse
  }

  /* ---------- Indicador del hero ---------- */
  const svcs = [...document.querySelectorAll('#acc .svc')];
  const hero = $('#inicio');
  if (hero) {
  const NOW = ['Sistemas y ERP', 'Automatización', 'Agentes de IA', 'Web y tiendas online'];
  let nowI = 0;
  const nowDots = [...document.querySelectorAll('#now-dots span')], nowBar = $('#now-bar');
  function nowSet(i) {
    nowI = i; $('#now-n').textContent = '0' + (i + 1); $('#now-t').textContent = NOW[i];
    nowDots.forEach((d, k) => d.classList.toggle('on', k === i));
    if (!reduce) { nowBar.style.transition = 'none'; nowBar.style.width = '0'; nowBar.offsetWidth; nowBar.style.transition = 'width 3.4s linear'; nowBar.style.width = '100%'; }
  }
  nowSet(0);
  if (!reduce) setInterval(() => nowSet((nowI + 1) % NOW.length), 3500);
  $('#now').addEventListener('click', () => openSvc(nowI));
  }

  /* ---------- Puntero ---------- */
  const P = { x: innerWidth * .7, y: innerHeight * .4, last: -1e9 };
  const setP = (x, y) => { P.x = x; P.y = y; P.last = performance.now(); };
  addEventListener('pointermove', e => setP(e.clientX, e.clientY), { passive: true });
  addEventListener('pointerdown', e => setP(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', e => { const t = e.touches[0]; if (t) setP(t.clientX, t.clientY); }, { passive: true });
  const idle = () => performance.now() - P.last > 2600;

  function sizeCanvas(cv) {
    const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; return true; }
    return false;
  }

  /* ---------- Robot en vivo + desintegración al hacer scroll ---------- */
  const fx = $('#fx'), fctx = fx ? fx.getContext('2d') : null, stage = $('#stage');
  const G = { x: 0, y: 0 }, B = { x: 0 }, A = { x: 0, y: 0, vx: 0, vy: 0 };
  let nextBlink = performance.now() + 1800, blinkStart = -1;
  const live = document.createElement('canvas'); live.width = live.height = 640;
  const ACC = css('--acc');

  function rr(g, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function drawRobot(dx, dy, o) {
    const g = live.getContext('2d'), W = 640, bob = o.bob, open = o.open;
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, W);
    g.save(); g.translate(W / 2 - o.bx * 10, 568); g.scale(1 - bob * .004, .2);
    const sg = g.createRadialGradient(0, 0, 0, 0, 0, 190);
    sg.addColorStop(0, 'rgba(31,28,29,.28)'); sg.addColorStop(1, 'rgba(31,28,29,0)');
    g.fillStyle = sg; g.beginPath(); g.arc(0, 0, 190, 0, Math.PI * 2); g.fill(); g.restore();
    g.save(); g.translate(W / 2 + o.bx * 6, bob * .5);
    g.fillStyle = '#221E3D'; g.fillRect(-26 + (dx - o.bx) * 8, 372, 52, 40);
    const bg = g.createLinearGradient(-100, 0, 100, 0);
    bg.addColorStop(0, '#3426D9'); bg.addColorStop(clamp(.5 + o.bx * .2, .05, .95), '#6151FF'); bg.addColorStop(1, '#2E21C4');
    g.fillStyle = bg; rr(g, -100, 400, 200, 160, 52); g.fill();
    g.fillStyle = 'rgba(255,255,255,.16)'; rr(g, -46 + o.bx * 10, 438, 92, 56, 18); g.fill();
    g.fillStyle = '#FF7A3D'; g.beginPath(); g.arc(28 + o.bx * 10, 466, 9, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save(); g.translate(W / 2 + dx * 20, 252 + dy * 16 + bob); g.rotate(dx * .05);
    const tx = dx * 30 + 6 + o.lx * 70, ty = -178 + dy * 6 + o.ly * 30;
    g.strokeStyle = '#221E3D'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(dx * 14, -122); g.quadraticCurveTo(dx * 18, -150, tx, ty + 4); g.stroke();
    g.fillStyle = '#FF7A3D'; g.beginPath(); g.arc(tx, ty, 15, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#221E3D';
    g.beginPath(); g.ellipse(-152 + dx * 12, 4, 30 * (1 + .4 * dx), 44, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(152 + dx * 12, 4, 30 * (1 - .4 * dx), 44, 0, 0, Math.PI * 2); g.fill();
    const hg = g.createLinearGradient(-150, -120, 150, 120);
    hg.addColorStop(0, '#FFFFFF'); hg.addColorStop(clamp(.55 + dx * .25, .05, .95), '#E6E5F2'); hg.addColorStop(1, '#C9C6DE');
    g.fillStyle = hg; rr(g, -152, -128, 304, 256, 96); g.fill();
    g.strokeStyle = 'rgba(31,28,29,.12)'; g.lineWidth = 3; g.stroke();
    const fx2 = dx * 26, fy = dy * 20;
    g.fillStyle = '#16132B'; rr(g, -114 + fx2, -84 + fy, 228, 168, 64); g.fill();
    g.fillStyle = 'rgba(255,255,255,.07)'; rr(g, -96 + fx2, -70 + fy, 92, 26, 13); g.fill();
    const ex = dx * 40, ey = dy * 30, sep = 48 * (1 - .14 * Math.abs(dx));
    const eh = Math.max(6, 54 * open), eyY = -34 + ey + (54 - eh) / 2;
    g.shadowColor = '#7A6CFF'; g.shadowBlur = 28; g.fillStyle = '#ABA2FF';
    rr(g, -sep - 17 + ex, eyY, 34, eh, 17); g.fill();
    rr(g, sep - 17 + ex, eyY, 34, eh, 17); g.fill();
    g.shadowBlur = 0;
    g.strokeStyle = '#ABA2FF'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(ex * .9, 30 + ey * .8, 22, .18 * Math.PI, .82 * Math.PI); g.stroke();
    g.restore();
  }

  // Partículas: una "foto" del robot en una grilla de 160×160; cada celda con color se vuelve un punto o un carácter de código.
  const samp = document.createElement('canvas'); samp.width = samp.height = 160;
  const sctx = samp.getContext('2d', { willReadFrequently: true });
  const GLYPHS = '01{}<>/=+*;01#$01';
  let parts = [], snapped = false;
  const hash = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177) >>> 0; h ^= h >>> 13; return Math.imul(h, 1103515245) >>> 0; };
  function snapshot() {
    sctx.clearRect(0, 0, 160, 160); sctx.drawImage(live, 0, 0, 160, 160);
    const d = sctx.getImageData(0, 0, 160, 160).data; parts = [];
    for (let y = 0; y < 160; y += 2) for (let x = 0; x < 160; x += 2) {
      const i = (y * 160 + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
      if (.299 * r + .587 * g + .114 * b > 236) continue;          // el fondo blanco no se desarma
      const h = hash(x, y);
      parts.push({ x: x * 4 + 4, y: y * 4 + 4, c: `rgb(${r},${g},${b})`, a: (h % 1000) / 1000, b: ((h >>> 10) % 1000) / 1000, glyph: h % 4 === 0, k: h % GLYPHS.length });
    }
    snapped = true;
  }

  function renderHero(t) {
    sizeCanvas(fx);
    const dpr = fx.width / Math.max(1, fx.getBoundingClientRect().width);
    const hr = hero.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    const S = sr.width * dpr / 640, OX = (sr.left - hr.left) * dpr, OY = (sr.top - hr.top) * dpr;
    const cx = sr.left + sr.width / 2, cy = sr.top + sr.height * .42;
    // progreso de la desintegración: empieza cuando el robot llega bajo el menú
    const p = reduce ? 0 : clamp((96 - sr.top) / (sr.height * .75), 0, 1);

    let tx, ty;
    if (idle()) { if (reduce) { tx = 0; ty = 0; } else { tx = Math.sin(t * .00065) * .8; ty = Math.sin(t * .001 + .7) * .5; } }
    else { tx = clamp((P.x - cx) / (innerWidth * .3), -1, 1); ty = clamp((P.y - cy) / (innerHeight * .3), -1, 1); }
    if (p < .02) {   // mientras está entero, sigue moviéndose; al desarmarse queda congelado en su pose
      G.x += (tx - G.x) * .1; G.y += (ty - G.y) * .1;
      B.x += (G.x - B.x) * .04;
      A.vx = (A.vx + (G.x - A.x) * .09) * .8; A.x += A.vx;
      A.vy = (A.vy + (G.y - A.y) * .09) * .8; A.y += A.vy;
      let open = 1;
      if (!reduce) {
        if (blinkStart < 0 && t > nextBlink) blinkStart = t;
        if (blinkStart >= 0) { const ph = (t - blinkStart) / 170; if (ph >= 1) { blinkStart = -1; nextBlink = t + 2200 + Math.random() * 3200; } else open = 1 - Math.sin(ph * Math.PI); }
      }
      drawRobot(G.x, G.y, { bx: B.x, lx: A.x - G.x, ly: A.y - G.y, open, bob: reduce ? 0 : Math.sin(t * .0021) * 5 });
    }

    fctx.clearRect(0, 0, fx.width, fx.height);
    if (p <= 0) { snapped = false; fctx.drawImage(live, OX, OY, 640 * S, 640 * S); return; }
    if (!snapped) snapshot();

    const solid = 1 - smooth(0, .22, p);
    if (solid > 0) { fctx.globalAlpha = solid; fctx.drawImage(live, OX, OY, 640 * S, 640 * S); fctx.globalAlpha = 1; }

    const spread = fx.width * .62, lift = fx.height * .5, sz = Math.max(1.8, 4.2 * S);
    fctx.font = `500 ${Math.round(11 * dpr)}px "JetBrains Mono", monospace`;
    fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
    const net = [];
    for (let i = 0; i < parts.length; i++) {
      const q = parts[i];
      let k = clamp((p - q.a * .4) / .6, 0, 1);
      if (k <= 0) continue;
      k = k * k * (3 - 2 * k);
      const side = q.x < 320 ? -1 : 1;
      const x = OX + q.x * S + side * (.35 + q.b) * k * spread + Math.sin(t * .0018 + q.a * 40) * 10 * dpr * k;
      const y = OY + q.y * S + ((q.b - .5) * .9 - .35) * k * lift + Math.cos(t * .0015 + q.b * 30) * 8 * dpr * k;
      const al = (1 - k * .9) * (solid > .6 ? k * 2 : 1);
      if (al <= .01) continue;
      fctx.globalAlpha = Math.min(1, al);
      if (q.glyph) {
        fctx.fillStyle = ACC;
        fctx.fillText(GLYPHS[(q.k + (t / 140 | 0)) % GLYPHS.length], x, y);
        if (i % 3 === 0) net.push(x, y, al);
      } else {
        fctx.fillStyle = q.c;
        fctx.beginPath(); fctx.arc(x, y, sz * (1 - k * .35), 0, Math.PI * 2); fctx.fill();
      }
    }
    // la red: líneas finas entre caracteres cercanos
    fctx.strokeStyle = ACC; fctx.lineWidth = Math.max(1, .8 * dpr);
    const maxD = 90 * dpr;
    for (let i = 0; i < net.length; i += 3) {
      for (let j = i + 3; j < Math.min(net.length, i + 18); j += 3) {
        const dx = net[j] - net[i], dy = net[j + 1] - net[i + 1], dd = Math.hypot(dx, dy);
        if (dd < maxD) { fctx.globalAlpha = (1 - dd / maxD) * .55 * Math.min(net[i + 2], net[j + 2]); fctx.beginPath(); fctx.moveTo(net[i], net[i + 1]); fctx.lineTo(net[j], net[j + 1]); fctx.stroke(); }
      }
    }
    fctx.globalAlpha = 1;
  }

  /* ---------- Selector "dónde encaja tu empresa" ---------- */
  const SCENES = [
    { h: 'Atención a clientes', p: 'Desde la primera pregunta hasta la venta, cada paso es rápido para tu cliente y ordenado para tu equipo.', tag: 'Recorrido del cliente', html: `
      <div class="journey">
        <div class="mini pop" style="--d:.05s"><span class="ji"><svg><use href="#i-chat"/></svg></span><b>Pregunta por WhatsApp</b><span>Martes · 23:40</span><span class="okpill">Recibida</span></div>
        <div class="mini pop" style="--d:.2s"><span class="ji"><svg><use href="#i-bell"/></svg></span><b>El agente responde</b><span>"Sí, quedan 120 m². ¿Te envío la cotización?"</span></div>
        <div class="mini pop" style="--d:.35s"><span class="ji"><svg><use href="#i-doc"/></svg></span><b>Cotización enviada</b><span>COT-1042 · en 2 minutos</span></div>
        <div class="mini pop" style="--d:.5s"><span class="ji"><svg><use href="#i-star"/></svg></span><b>Venta cerrada</b><span>Derivada a Javiera · cliente nuevo</span></div>
      </div>
      <div class="track"><div><i><svg><use href="#i-chat"/></svg></i>Pregunta</div><div><i><svg><use href="#i-bell"/></svg></i>Respuesta inmediata</div><div><i><svg><use href="#i-doc"/></svg></i>Cotización</div><div><i><svg><use href="#i-star"/></svg></i>Cliente que vuelve</div></div>
      <div class="outcome pop" style="--d:.9s"><span class="stars">★★★★★</span>Clientes atendidos a cualquier hora, sin sumar personal</div>` },
    { h: 'Empresas de servicios', p: 'Agenda, clientes, cotizaciones y recordatorios en un solo lugar, para talleres, clínicas, estudios, mantención y más.', tag: 'Sistema de recepción', html: `
      <div class="desk">
        <div class="mini pop" style="--d:.05s"><h4>Agenda</h4><div class="week"><span>L</span><span class="on">M</span><span>M</span><span class="on">J</span><span>V</span><span class="on">S</span><span>D</span></div><div class="slot"><span>Mantención caldera</span><b>Jue 10:00</b></div></div>
        <div class="mini pop" style="--d:.18s"><h4>Clientes</h4><div class="member"><span class="avatar">CR</span><span><b>Carla Rojas</b><small>Cliente frecuente</small></span></div><div class="pts" id="pts">0<small>visitas este año</small></div></div>
        <div class="mini pop" style="--d:.31s"><h4>Cotización</h4><div class="quote"><span class="paid">PAGADA</span><div class="row"><span>COT-0142 · Mantención anual</span></div><div class="row"><span>Total</span><span class="total">$380.000</span></div></div></div>
        <div class="mini pop" style="--d:.44s"><h4>Recordatorios</h4><div class="rem"><div><span>Visita mañana 10:00</span><em>Enviado ✓</em></div><div><span>Contrato vence en 3 días</span><em>Enviado ✓</em></div><div><span>¿Cómo fue tu atención?</span><em>Enviado ✓</em></div></div></div>
      </div>` },
    { h: 'Pymes, constructoras y distribuidoras', p: 'Planillas, cuadernos y seguimientos por chat pasan a un sistema con datos en tiempo real y menos errores.', tag: 'De manual a digital', html: `
      <div class="m2d">
        <div class="mini pop" style="--d:.05s"><h4>Registro manual</h4><div class="chat"><span class="bub">¿Cuántos rollos de pasto nos quedan?</span><span class="bub r">Espera, reviso el Excel…</span><span class="bub x">Stock_final_v3_REAL.xlsx</span></div><div class="lab"><b>Manual</b>Planillas, papeles y chats</div></div>
        <span class="arrow-c pop" style="--d:.3s"><svg><use href="#i-arrow"/></svg></span>
        <div class="mini pop" style="--d:.45s"><div class="inv-head"><h4 style="margin:0">Inventario</h4><span class="live">En vivo</span></div><div class="stats"><div><small>Saldo</small><b id="inv-a">0</b></div><div><small>Entradas</small><b id="inv-b">0</b></div><div><small>Salidas</small><b id="inv-c">0</b></div></div><div class="moves"><div><span>Recepción · Pasto 40 mm</span><span class="in">+20 rollos</span></div><div><span>Venta · Constructora Sur</span><span class="out">−40 rollos</span></div><div><span>Despacho · Guía 1918</span><span class="done">Listo</span></div></div><div class="lab"><b>Sistema</b>Un lugar, en tiempo real</div></div>
      </div>` },
    { h: 'Emprendedores', p: '¿Tienes la idea de una plataforma? La llevamos del concepto a un producto listo para vender.', tag: 'De la idea al lanzamiento', html: `
      <div class="ideas">
        <div class="mini pop" style="--d:.05s"><i><svg><use href="#i-store"/></svg></i><b>Tienda online</b><small>con pagos y despacho</small></div>
        <div class="mini pop" style="--d:.15s"><i><svg><use href="#i-food"/></svg></i><b>Pedidos</b><small>para restaurantes</small></div>
        <div class="mini pop" style="--d:.25s"><i><svg><use href="#i-users"/></svg></i><b>Portal de clientes</b><small>con acceso propio</small></div>
        <div class="mini pop" style="--d:.35s"><i><svg><use href="#i-rocket"/></svg></i><b>App de reservas</b><small>para servicios</small></div>
      </div>
      <div class="launch"><div><i></i>Idea</div><div><i></i>Diseño</div><div><i></i>Desarrollo</div><div><i></i>Lanzamiento</div></div>` },
  ];
  const opts = [...document.querySelectorAll('#opts .opt')], panel = $('#panel');
  let cur = 0, auto = !reduce, autoT;
  function countUp(el, to, ms) { if (!el) return; if (reduce) { el.textContent = to; return; } const t0 = performance.now(); const f = n => { const k = clamp((n - t0) / ms, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }
  function showScene(i, focus) {
    cur = i; const s = SCENES[i];
    opts.forEach((o, k) => { const on = k === i; o.setAttribute('aria-selected', on); o.tabIndex = on ? 0 : -1; const pr = o.querySelector('.prog'); pr.classList.remove('run'); if (on && auto) { pr.offsetWidth; pr.classList.add('run'); } if (on && focus) o.focus(); });
    panel.setAttribute('aria-labelledby', 'o' + i);
    panel.innerHTML = `<h3 class="pop">${s.h}</h3><p class="pop" style="--d:.05s">${s.p}</p><span class="tag pop" style="--d:.1s">${s.tag}</span><div class="scene">${s.html}</div>`;
    if (i === 1) countUp($('#pts'), 6, 1200);
    if (i === 2) { countUp($('#inv-a'), 650, 1400); countUp($('#inv-b'), 500, 1400); countUp($('#inv-c'), 200, 1400); }
    clearTimeout(autoT); if (auto) autoT = setTimeout(() => showScene((cur + 1) % SCENES.length), 6500);
  }
  opts.forEach((o, i) => {
    o.addEventListener('click', () => { auto = false; showScene(i); });
    o.addEventListener('keydown', e => { if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return; e.preventDefault(); auto = false; showScene((i + (e.key === 'ArrowDown' ? 1 : SCENES.length - 1)) % SCENES.length, true); });
  });
  if (panel) showScene(0);

  /* ---------- Servicios en acordeón ---------- */
  function openSvc(i) {
    if (!svcs[i]) return;
    svcs.forEach((s, k) => { const on = k === i; s.classList.toggle('open', on); s.querySelector(':scope > button').setAttribute('aria-expanded', on); });
    const bars = svcs[i].querySelectorAll('.bars span'); bars.forEach(b => { b.style.animation = 'none'; b.offsetWidth; b.style.animation = ''; });
  }
  svcs.forEach((s, i) => s.querySelector(':scope > button').addEventListener('click', () => openSvc(i)));

  /* ---------- Mapa en red ---------- */
  const CITIES = [
    ['Chile', -33.45, -70.67, 1, 'l'], ['Antofagasta', -23.65, -70.4, 0, 'l'], ['Concepción', -36.83, -73.05, 0, 'l'], ['Puerto Montt', -41.47, -72.94, 0, 'l'],
    ['Lima', -12.05, -77.04, 0, 'l'], ['Bogotá', 4.71, -74.07, 0, 'r'], ['Ciudad de México', 19.43, -99.13, 0, 'r'], ['Buenos Aires', -34.6, -58.38, 0, 'r'],
    ['Quito', -.18, -78.47, 0, 'l'], ['São Paulo', -23.55, -46.63, 0, 'r'], ['Panamá', 8.98, -79.52, 0, 'l'],
  ];
  const proj = (lat, lon) => [40 + (lon + 106) / 66 * 440, 30 + (24 - lat) / 70 * 500];
  const map = $('#map'), NS = 'http://www.w3.org/2000/svg';
  if (map) {
  const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  for (let gx = 0; gx < 520; gx += 20) for (let gy = 0; gy < 560; gy += 20) map.appendChild(el('circle', { cx: gx + 10, cy: gy + 10, r: 1.2, fill: css('--line') }));
  const [hx, hy] = proj(CITIES[0][1], CITIES[0][2]);
  CITIES.slice(1).forEach(([, la, lo], i) => {
    const [x, y] = proj(la, lo), mx = (x + hx) / 2 + (y - hy) * .18, my = (y + hy) / 2 - (x - hx) * .18;
    map.appendChild(el('path', { d: `M${hx} ${hy}Q${mx} ${my} ${x} ${y}`, fill: 'none', stroke: css('--acc'), 'stroke-width': 1.3, opacity: .45, class: 'route', style: `animation-delay:${-i * .2}s` }));
  });
  CITIES.forEach(([name, la, lo, home, side], i) => {
    const [x, y] = proj(la, lo), c = home ? css('--warm') : css('--acc'), L = side === 'l';
    map.appendChild(el('circle', { cx: x, cy: y, r: home ? 7 : 5, fill: c, class: 'pulse', style: `animation-delay:${i * .25}s` }));
    map.appendChild(el('circle', { cx: x, cy: y, r: home ? 7 : 4.5, fill: c, stroke: '#fff', 'stroke-width': 2 }));
    const tl = el('text', { x: x + (L ? -12 : 12), y: y + 4, 'font-size': home ? 14 : 12, 'font-weight': home ? 700 : 500, 'font-family': 'Figtree, sans-serif', fill: css('--ink-2'), 'text-anchor': L ? 'end' : 'start' });
    tl.textContent = home ? 'IntegriAI · Chile' : name; map.appendChild(tl);
  });
  }

  /* ---------- Firma deformable (WebGL) ---------- */
  const word = $('#word');
  const fallback = () => word.replaceWith(Object.assign(document.createElement('p'), { className: 'word-fallback', textContent: BRAND }));
  const gl = word.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  const N = 16, pts = new Float32Array(N * 3), trail = [], head = { x: 0, y: 0, z: 0, has: false };
  let wordReady = false, tex, uni = {};
  const mask = document.createElement('canvas'), mctx = mask.getContext('2d');
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  function buildMask() {
    mask.width = word.width; mask.height = word.height;
    const W = mask.width, H = mask.height;
    mctx.fillStyle = '#000'; mctx.fillRect(0, 0, W, H);
    mctx.font = '800 100px Outfit, "Arial Black", sans-serif';
    const w100 = mctx.measureText(BRAND).width || 1;
    const size = Math.min(H * .9, (W * .94) / w100 * 100);
    mctx.font = `800 ${size}px Outfit, "Arial Black", sans-serif`;
    mctx.fillStyle = '#fff'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
    mctx.fillText(BRAND, W / 2, H * .54);
    if (tex) { gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask); }
  }
  function initGL() {
    if (!gl) { fallback(); return; }
    const vs = `attribute vec2 a; varying vec2 vUv; void main(){ vUv = a*.5+.5; gl_Position = vec4(a,0.,1.); }`;
    const fs = `precision highp float; varying vec2 vUv;
      uniform sampler2D uTex; uniform vec2 uRes; uniform vec3 uPts[${N}]; uniform float uRadius; uniform float uStrength;
      uniform vec3 uBg; uniform vec3 uInk; uniform vec3 uAcc;
      void main(){
        vec2 p = vUv * uRes; vec2 disp = vec2(0.); float s = 0.;
        for (int i = 0; i < ${N}; i++) { vec3 pt = uPts[i]; if (pt.z < .002) continue; vec2 d = p - pt.xy;
          float r = uRadius * (.55 + .45 * pt.z); float f = 1. - smoothstep(0., r, length(d)); f = f * f * pt.z; disp += d * f; s += f; }
        disp /= max(1., s); float infl = clamp(s, 0., 1.); vec2 off = disp * uStrength / uRes;
        float cr = texture2D(uTex, vUv - off * 1.12).r; float cg = texture2D(uTex, vUv - off).r; float cb = texture2D(uTex, vUv - off * .88).r;
        vec3 ink = mix(uInk, uAcc, smoothstep(.04, .55, infl));
        gl_FragColor = vec4(mix(uBg.r, ink.r, cr), mix(uBg.g, ink.g, cg), mix(uBg.b, ink.b, cb), 1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uTex', 'uRes', 'uPts', 'uRadius', 'uStrength', 'uBg', 'uInk', 'uAcc'].forEach(n => uni[n] = gl.getUniformLocation(prog, n));
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uni.uTex, 0);
    gl.uniform3fv(uni.uBg, hex(css('--bg'))); gl.uniform3fv(uni.uInk, hex(css('--ink'))); gl.uniform3fv(uni.uAcc, hex(css('--acc')));
    sizeCanvas(word); buildMask(); wordReady = true;
  }
  function renderWord(t) {
    if (!wordReady) return;
    if (sizeCanvas(word)) buildMask();
    const rect = word.getBoundingClientRect(), W = word.width, H = word.height, kx = W / rect.width, ky = H / rect.height;
    let target = null;
    if (!idle()) { if (P.x >= rect.left && P.x <= rect.right && P.y >= rect.top - 20 && P.y <= rect.bottom + 20) target = [(P.x - rect.left) * kx, (rect.bottom - P.y) * ky]; }
    else if (!reduce) target = [W * (.5 + .43 * Math.sin(t * .00052)), H * (.5 + .22 * Math.sin(t * .0013 + 1.2))];
    if (target) {
      if (!head.has) { head.x = target[0]; head.y = target[1]; head.has = true; }
      head.x += (target[0] - head.x) * .22; head.y += (target[1] - head.y) * .22; head.z += (1 - head.z) * .12;
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(head.x - last.x, head.y - last.y) > 14 * kx) { trail.push({ x: head.x, y: head.y, z: .9 }); if (trail.length > N - 1) trail.shift(); }
    } else { head.z *= .9; if (head.z < .01) head.has = false; }
    trail.forEach(p => p.z *= .94);
    pts.fill(0); pts[0] = head.x; pts[1] = head.y; pts[2] = head.z;
    trail.forEach((p, i) => { pts[(i + 1) * 3] = p.x; pts[(i + 1) * 3 + 1] = p.y; pts[(i + 1) * 3 + 2] = p.z; });
    gl.viewport(0, 0, W, H); gl.uniform2f(uni.uRes, W, H); gl.uniform3fv(uni.uPts, pts);
    gl.uniform1f(uni.uRadius, H * .4); gl.uniform1f(uni.uStrength, .55);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ---------- Bucle: cada efecto corre solo cuando está en pantalla ---------- */
  const vis = { hero: !!hero, word: false };
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(es => es.forEach(e => { vis[e.target === hero ? 'hero' : 'word'] = e.isIntersecting; }));
    if (hero) io2.observe(hero); io2.observe(word);
  } else vis.word = true;
  try { initGL(); } catch (e) { console.error(e); fallback(); }
  function loop(t) {
    if (vis.hero) renderHero(t);
    if (vis.word && document.body.contains(word)) renderWord(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  if (document.fonts && document.fonts.load) document.fonts.load('800 100px Outfit').then(() => { if (wordReady) buildMask(); }).catch(() => {});
})();
