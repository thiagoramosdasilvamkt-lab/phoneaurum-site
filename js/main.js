/* =========================================================
   PHONE AURUM — main.js
   ========================================================= */
(function () {
  "use strict";

  /* ---- Configurações fáceis de trocar ---- */
  var WHATSAPP = "5511951083273";
  var MSG_GERAL = "Olá! Vim pelo site da Phone Aurum e gostaria de saber mais sobre os iPhones disponíveis.";
  var MSG_MODELO = "Olá! Vim pelo site da Phone Aurum e tenho interesse no {MODELO}. Ele está disponível?";
  // Horário (fuso America/Sao_Paulo). 0 = domingo ... 6 = sábado. [abre, fecha] em horas.
  var HORARIOS = { 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 15] };

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function waLink(texto) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }
  var ICON = function (id) { return '<svg class="icon" aria-hidden="true"><use href="#' + id + '"/></svg>'; };

  /* ---- Header: fundo ao rolar + menu mobile ---- */
  var header = document.querySelector(".header");
  var menuBtn = document.querySelector(".menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 24); }
  var ticking = false;
  function onScrollRaf() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); }
  requestAnimationFrame(onScroll);
  window.addEventListener("scroll", onScrollRaf, { passive: true });

  function setMenu(open) {
    header.classList.toggle("is-open", open);
    mobileNav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!mobileNav.classList.contains("is-open")); });
  mobileNav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---- Revelar ao rolar + contadores ---- */
  var reveals = document.querySelectorAll(".reveal");
  function countUp(node) {
    var end = parseFloat(node.getAttribute("data-count"));
    if (reduceMotion || isNaN(end)) return;
    var dur = 1400, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    node.textContent = "0";
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (n) { io.observe(n); });
  } else {
    reveals.forEach(function (n) { n.classList.add("is-in"); });
  }

  /* ---- Estoque: abas + lista ---- */
  var tabsEl = document.getElementById("stock-tabs");
  var listEl = document.getElementById("stock-list");
  if (tabsEl && listEl && typeof ESTOQUE !== "undefined") {
    var linhas = [];
    ESTOQUE.forEach(function (i) { if (linhas.indexOf(i.linha) === -1) linhas.push(i.linha); });

    var renderList = function (linha) {
      listEl.innerHTML = "";
      ESTOQUE.filter(function (i) { return i.linha === linha; }).forEach(function (item, idx) {
        var a = el("a", "stock-item");
        a.href = waLink(MSG_MODELO.replace("{MODELO}", item.modelo));
        a.target = "_blank"; a.rel = "noopener";
        a.style.animationDelay = idx * 40 + "ms";
        a.setAttribute("aria-label", item.modelo + ", " + item.condicao + ". Tenho interesse, abrir WhatsApp");
        var novo = /^novo$/i.test(item.condicao);
        a.innerHTML =
          '<div><div class="stock-item__name"></div><span class="badge' + (novo ? " badge--new" : "") + '"></span></div>' +
          '<span class="stock-item__cta">Tenho interesse ' + ICON("i-arrow") + "</span>";
        a.querySelector(".stock-item__name").textContent = item.modelo;
        a.querySelector(".badge").textContent = item.condicao;
        listEl.appendChild(a);
      });
    };

    linhas.forEach(function (linha, i) {
      var b = el("button", "tab");
      b.type = "button"; b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.textContent = linha;
      b.addEventListener("click", function () {
        tabsEl.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", "false"); });
        b.setAttribute("aria-selected", "true");
        renderList(linha);
      });
      tabsEl.appendChild(b);
    });
    if (linhas.length) renderList(linhas[0]);
  }

  /* ---- Carrossel de clientes ---- */
  var track = document.getElementById("carousel-track");
  if (track && typeof CLIENTES !== "undefined") {
    CLIENTES.forEach(function (c) {
      var s = el("div", "slide slide--photo");
      s.setAttribute("role", "group"); s.setAttribute("aria-roledescription", "slide");
      var img = new Image();
      img.src = c.src; img.alt = c.alt || ""; img.loading = "lazy"; img.decoding = "async";
      img.width = 800; img.height = 1000;
      s.appendChild(img);
      track.appendChild(s);
    });

    var step = function () { var s = track.querySelector(".slide"); return s ? s.getBoundingClientRect().width + 16 : 300; };
    var go = function (dir) {
      var max = track.scrollWidth - track.clientWidth;
      if (dir > 0 && track.scrollLeft >= max - 4) track.scrollTo({ left: 0 });
      else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: max });
      else track.scrollBy({ left: dir * step() });
    };
    document.getElementById("car-prev").addEventListener("click", function () { go(-1); });
    document.getElementById("car-next").addEventListener("click", function () { go(1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    // Autoplay suave: pausa ao tocar/passar o mouse/focar, ou fora da tela
    if (!reduceMotion) {
      var timer = null, paused = false, visible = false;
      var play = function () { stop(); timer = setInterval(function () { if (!paused && visible) go(1); }, 3800); };
      var stop = function () { if (timer) clearInterval(timer); timer = null; };
      var carousel = document.getElementById("carousel");
      ["pointerdown", "touchstart", "mouseenter", "focusin"].forEach(function (ev) { carousel.addEventListener(ev, function () { paused = true; }, { passive: true }); });
      ["mouseleave", "focusout"].forEach(function (ev) { carousel.addEventListener(ev, function () { paused = false; }); });
      track.addEventListener("touchend", function () { setTimeout(function () { paused = false; }, 6000); }, { passive: true });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.4 }).observe(carousel);
      } else { visible = true; }
      play();
    }
  }

  /* ---- FAQ (acordeão) ---- */
  document.querySelectorAll(".faq__q").forEach(function (btn, i) {
    var panel = btn.nextElementSibling;
    var id = "faq-a-" + i;
    panel.id = id; btn.setAttribute("aria-controls", id);
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq__q").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---- "Aberto agora" (fuso de São Paulo) ---- */
  (function status() {
    var txt = document.getElementById("wa-status");
    var dot = document.getElementById("wa-status-dot");
    var dot2 = document.getElementById("wa-dot");
    if (!txt) return;
    var open = false;
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      var dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var d = dias[get("weekday")];
      var h = parseInt(get("hour"), 10) % 24 + parseInt(get("minute"), 10) / 60;
      var jan = HORARIOS[d];
      open = !!jan && h >= jan[0] && h < jan[1];
    } catch (e) { return; }
    txt.textContent = open ? "Aberto agora" : "Fechado, respondemos amanhã";
    [dot, dot2].forEach(function (n) { if (n) n.classList.toggle("is-open", open); });
  })();
})();
