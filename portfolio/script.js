/* Jack Jin - portfolio v3 · reverse-chronological project story */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------ project data */
  // spans drive both the gantt and the year rail. order = page order.
  var PROJECTS = [
    { id: "ch-anima",   label: "Anima Mesh",            start: "2026-07-05", end: "2026-08-02", color: "var(--c-anima)", year: "2026", ongoing: true },
    { id: "ch-bruce",   label: "Built with Bruce",      start: "2026-02-28", end: "2026-07-17", color: "var(--c-bruce)", year: "2026" },
    { id: "ch-factory", label: "Content Factory",       start: "2025-10-04", end: "2026-06-29", color: "var(--c-factory)", year: "2026" },
    { id: "ch-kit",     label: "AI Builder Kit",        start: "2026-03-22", end: "2026-06-11", color: "var(--c-kit)", year: "2026" },
    { id: "ch-conv",    label: "Conversion Factory",    start: "2026-05-31", end: "2026-06-05", color: "var(--c-conv)", year: "2026" },
    { id: "ch-cea",     label: "Continuous Exec Agent", start: "2026-01-24", end: "2026-05-31", color: "var(--c-cea)", year: "2026" },
    { id: "ch-ciam",    label: "CIAM Demo",             start: "2026-02-07", end: "2026-04-12", color: "var(--c-ciam)", year: "2026" },
    { id: "ch-postal",  label: "Postal Portal",         start: "2025-07-12", end: "2025-07-25", color: "var(--c-postal)", year: "2025" },
    { id: "ch-shadow",  label: "Shadow Pivot",          start: "2025-05-22", end: "2025-07-15", color: "var(--c-shadow)", year: "2025" },
    { id: "ch-star",    label: "STAR Generator",        start: "2025-04-12", end: "2025-05-09", color: "var(--c-star)", year: "2025" }
  ];

  var navLinks = document.getElementById("nav-links");
  var progress = document.getElementById("scroll-progress");
  function updateProgress() {
    var page = document.documentElement;
    var total = page.scrollHeight - page.clientHeight;
    if (progress) progress.style.width = (total > 0 ? page.scrollTop / total * 100 : 0) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* --------------------------------------------------------- year rail */
  var rail = document.getElementById("year-rail");
  if (rail && !rail.querySelector('a')) {
    var lastYear = null;
    PROJECTS.forEach(function (p) {
      var year = p.year;
      if (year !== lastYear) {
        var y = document.createElement("span");
        y.className = "rail-year";
        y.textContent = year;
        rail.appendChild(y);
        lastYear = year;
      }
      var a = document.createElement("a");
      a.href = "#" + p.id;
      a.dataset.rail = p.id;
      a.style.setProperty("--dot", p.color);
      a.innerHTML = "<span>" + p.label + "</span><i></i>";
      rail.appendChild(a);
    });
  }

  /* ------------------------------------------------- active section spy */
  var navAnchors = {};
  navLinks.querySelectorAll("a[data-nav]").forEach(function (a) { navAnchors[a.dataset.nav] = a; });
  var railAnchors = {};
  document.querySelectorAll("#year-rail a[data-rail]").forEach(function (a) { railAnchors[a.dataset.rail] = a; });

  function navKeyFor(id) {
    if (id === "timeline-view") return "timeline-view";
    if (id === "career") return "career";
    if (id === "workbench") return "workbench";
    /* the 2024 prologue belongs to the career zone, not a year of the run */
    if (id === "ch-rockstar") return "career";
    if (id === "ch-postal" || id === "ch-shadow" || id === "ch-star") return "y2025";
    if (id.indexOf("ch-") === 0) return "y2026";
    return null;
  }
  var spyIds = ["timeline-view", "career", "workbench", "ch-rockstar"].concat(PROJECTS.map(function (p) { return p.id; }));
  var accentByChapter = {};
  PROJECTS.forEach(function (p) { accentByChapter[p.id] = p.color; });

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      var key = navKeyFor(id);
      Object.keys(navAnchors).forEach(function (k) {
        navAnchors[k].classList.toggle("active", k === key);
        if (accentByChapter[id]) navAnchors[k].style.setProperty("--accent-nav", accentByChapter[id]);
      });
      Object.keys(railAnchors).forEach(function (k) {
        railAnchors[k].classList.toggle("active", k === id);
      });
      var mark = document.querySelector(".brand-mark");
      if (mark && accentByChapter[id]) mark.style.color = accentByChapter[id];
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  spyIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sectionObserver.observe(el);
  });

  /* --------------------------------------------------------- the gantt */
  var gantt = document.getElementById("gantt");
  if (gantt) {
    var START = Date.parse("2025-04-01");
    var END = Date.parse("2026-08-15");
    var CURRENT = "2026-08-02";
    function pct(d) { return ((Date.parse(d) - START) / (END - START)) * 100; }

    var scale = document.createElement("div");
    scale.className = "gantt-scale";
    ["Apr 2025", "Oct 2025", "Apr 2026", "Aug 2026"].forEach(function (t) {
      var s = document.createElement("span");
      s.textContent = t;
      scale.appendChild(s);
    });
    gantt.appendChild(scale);

    PROJECTS.forEach(function (p) {
      var row = document.createElement("div");
      row.className = "gantt-row";
      var label = document.createElement("span");
      label.className = "gantt-label";
      label.textContent = p.label;
      row.appendChild(label);

      var track = document.createElement("div");
      track.className = "gantt-track";

      var nowLine = document.createElement("i");
      nowLine.className = "gantt-now";
      nowLine.style.left = pct(CURRENT) + "%";
      track.appendChild(nowLine);

      var bar = document.createElement("button");
      bar.className = "gantt-bar";
      var left = pct(p.start);
      var width = Math.max(pct(p.ongoing ? CURRENT : p.end) - left, 1);
      bar.style.left = left.toFixed(2) + "%";
      bar.style.width = width.toFixed(2) + "%";
      bar.style.setProperty("--bar", p.color);
      var range = p.start.slice(0, 7) + " to " + p.end.slice(0, 7);
      bar.setAttribute("data-title", p.label + " · " + range);
      bar.setAttribute("aria-label", p.label + ", " + range + ". Jump to project.");
      bar.addEventListener("click", function () {
        var target = document.getElementById(p.id);
        if (!target) return;
        target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
      track.appendChild(bar);
      row.appendChild(track);
      gantt.appendChild(row);
    });

    // on narrow screens the interesting (recent) end sits off-canvas to the right
    if (gantt.scrollWidth - gantt.clientWidth > 120) gantt.scrollLeft = gantt.scrollWidth;
  }

  /* --------------------------------------------------------- counters
     count up once when scrolled into view; used by anima + cea panels */
  function armCounters(rowEl) {
    if (!rowEl) return;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        runCounters(rowEl);
      });
    }, { threshold: 0.5 }).observe(rowEl);
  }
  function runCounters(rowEl) {
    rowEl.querySelectorAll("b[data-count]").forEach(function (b) {
      var target = parseInt(b.dataset.count, 10);
      if (reducedMotion || target === 0) { b.textContent = String(target); return; }
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / 1200, 1);
        b.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  armCounters(document.getElementById("anima-counters"));
  armCounters(document.getElementById("cea-counters"));

  /* ------------------------------------------------ anima: heartbeat
     draws once on scroll-in; replay button re-runs it */
  var pulsePanel = document.querySelector(".pulse-panel");
  if (pulsePanel) {
    var pulseRan = false;
    function runPulse() {
      pulsePanel.classList.remove("run");
      // force reflow so the animation restarts
      void pulsePanel.offsetWidth;
      if (!reducedMotion) pulsePanel.classList.add("run");
    }
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || pulseRan) return;
        pulseRan = true;
        obs.disconnect();
        runPulse();
      });
    }, { threshold: 0.4 }).observe(pulsePanel);
    var pulseReplay = document.querySelector('[data-replay="anima-beat"]');
    if (pulseReplay) pulseReplay.addEventListener("click", function () {
      runPulse();
      runCounters(document.getElementById("anima-counters"));
    });
  }

  /* -------------------------------------------------- anima: glossary */
  var glossWrap = document.getElementById("gloss-chips");
  if (glossWrap) {
    var glossChips = glossWrap.querySelectorAll(".gloss-chip");
    var glossReadout = document.getElementById("gloss-readout");
    glossChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        glossChips.forEach(function (c) { c.classList.toggle("lit", c === chip); });
        glossReadout.textContent = chip.dataset.def;
      });
    });
  }

  /* ------------------------------------------------ anima: diagram deck */
  document.querySelectorAll(".diagram-deck").forEach(function (deck) {
    var deckTabs = Array.from(deck.querySelectorAll(".deck-tab"));
    var position = deck.querySelector(".deck-position b");

    function activateDeckTab(tab, moveFocus) {
      deckTabs.forEach(function (t) {
        var selected = t === tab;
        t.classList.toggle("active", selected);
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      deck.querySelectorAll(".deck-pane").forEach(function (pane) {
        var selected = pane.id === tab.dataset.deck;
        pane.classList.toggle("active", selected);
        pane.hidden = !selected;
      });
      if (position) position.textContent = tab.querySelector("span").textContent;
      if (moveFocus) {
        tab.focus();
        tab.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      }
    }

    deckTabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { activateDeckTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % deckTabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + deckTabs.length) % deckTabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = deckTabs.length - 1;
        else return;
        event.preventDefault();
        activateDeckTab(deckTabs[next], true);
      });
    });
  });

  /* --------------------------------------------------- cea: bake-off
     bars grow once on scroll-in; replay re-runs */
  var bakeoff = document.querySelector(".bakeoff");
  if (bakeoff) {
    var MAXSCORE = 130;
    function runBakeoff() {
      bakeoff.classList.remove("run");
      bakeoff.querySelectorAll(".bake-row").forEach(function (row) {
        row.querySelector(".bake-bar").style.width = "0";
      });
      void bakeoff.offsetWidth;
      bakeoff.classList.add("run");
      bakeoff.querySelectorAll(".bake-row").forEach(function (row) {
        var w = (parseInt(row.dataset.score, 10) / MAXSCORE) * 100;
        row.querySelector(".bake-bar").style.width = w.toFixed(1) + "%";
      });
    }
    if (reducedMotion) {
      bakeoff.querySelectorAll(".bake-row").forEach(function (row) {
        var w = (parseInt(row.dataset.score, 10) / MAXSCORE) * 100;
        row.querySelector(".bake-bar").style.width = w.toFixed(1) + "%";
      });
    } else {
      var bakeRan = false;
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || bakeRan) return;
          bakeRan = true;
          obs.disconnect();
          runBakeoff();
        });
      }, { threshold: 0.4 }).observe(bakeoff);
      var bakeReplay = document.querySelector('[data-replay="bakeoff"]');
      if (bakeReplay) bakeReplay.addEventListener("click", runBakeoff);
    }
  }

  /* ------------------------------------- factory: request flow, once */
  var rf = document.querySelector(".request-flow");
  if (rf && !reducedMotion) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        rf.classList.add("run"); // css animation runs a fixed 2 cycles, then rests
      });
    }, { threshold: 0.4 }).observe(rf);
  }

  /* -------------------------------------------------- youtube facades */
  document.querySelectorAll(".video-embed").forEach(function (box) {
    var id = box.dataset.video;
    var title = box.dataset.title || "Play video";
    var facade = document.createElement("button");
    facade.className = "video-facade";
    facade.setAttribute("aria-label", "Play video: " + title);
    facade.innerHTML =
      '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" loading="lazy" alt="">' +
      '<span class="play" aria-hidden="true"></span>' +
      '<span class="vf-title">' + title + "</span>";
    facade.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      iframe.title = title;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      box.replaceChild(iframe, facade);
    });
    box.appendChild(facade);
  });

  /* ------------------------------------------------------- carousels */
  document.querySelectorAll("[data-carousel]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var car = document.getElementById(btn.dataset.carousel);
      var slide = car.querySelector(".slide");
      if (!slide) return;
      car.scrollBy({
        left: (slide.getBoundingClientRect().width + 18) * Number(btn.dataset.dir),
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });
  });
  document.querySelectorAll(".carousel").forEach(function (car) {
    var count = document.querySelector('[data-count-for="' + car.id + '"]');
    if (!count) return;
    var total = car.querySelectorAll(".slide").length;
    car.addEventListener("scroll", function () {
      var slide = car.querySelector(".slide");
      if (!slide) return;
      var w = slide.getBoundingClientRect().width + 18;
      var idx = Math.min(total, Math.round(car.scrollLeft / w) + 1);
      count.textContent = idx + " / " + total;
    }, { passive: true });
  });

  /* --------------------------------------------------------- lightbox
     diagrams and photos open in an overlay instead of a new tab.
     anchors keep their href as the no-js fallback and become the
     "open file" action inside the overlay. */
  var IMG_HREF = /\.(svg|png|jpe?g|webp|gif)(\?.*)?$/i;

  var lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Image viewer");
  lightbox.hidden = true;
  lightbox.innerHTML =
    '<div class="lightbox-top">' +
      '<a class="lightbox-file mono" target="_blank" rel="noopener">open file &nearr;</a>' +
      '<button class="lightbox-zoom mono" type="button" aria-pressed="false">zoom 1:1</button>' +
      '<button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>' +
    "</div>" +
    '<div class="lightbox-body"><img alt=""></div>' +
    '<p class="lightbox-caption mono"></p>';
  document.body.appendChild(lightbox);

  var lbBody = lightbox.querySelector(".lightbox-body");
  var lbImg = lbBody.querySelector("img");
  var lbCaption = lightbox.querySelector(".lightbox-caption");
  var lbFile = lightbox.querySelector(".lightbox-file");
  var lbZoom = lightbox.querySelector(".lightbox-zoom");
  var lbClose = lightbox.querySelector(".lightbox-close");
  var lbOpener = null;

  function captionFor(el) {
    var fig = el.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    return cap ? cap.innerText.trim() : "";
  }

  function openLightbox(src, alt, caption, lightPlate, opener) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lbImg.classList.toggle("light-plate", lightPlate);
    lbCaption.textContent = caption || "";
    lbFile.href = src;
    lbOpener = opener || null;
    setZoom(false);
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add("open"); });
    document.documentElement.classList.add("lightbox-open");
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.documentElement.classList.remove("lightbox-open");
    window.setTimeout(function () {
      lightbox.hidden = true;
      lbImg.src = "";
    }, reducedMotion ? 0 : 250);
    if (lbOpener && lbOpener.focus) lbOpener.focus();
    lbOpener = null;
  }

  function setZoom(zoomed) {
    lightbox.classList.toggle("zoomed", zoomed);
    lbZoom.setAttribute("aria-pressed", String(zoomed));
    lbZoom.textContent = zoomed ? "fit screen" : "zoom 1:1";
    // svg diagrams have no intrinsic pixel size, so "natural" width alone
    // would collapse back to the container; floor the zoom at 1200px
    lbImg.style.width = zoomed ? Math.max(lbImg.naturalWidth || 0, 1200) + "px" : "";
  }

  lbClose.addEventListener("click", closeLightbox);
  lbZoom.addEventListener("click", function () { setZoom(!lightbox.classList.contains("zoomed")); });
  lbImg.addEventListener("click", function () { setZoom(!lightbox.classList.contains("zoomed")); });
  lbBody.addEventListener("click", function (e) {
    if (e.target === lbBody) closeLightbox(); // backdrop, not the image
  });

  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") { closeLightbox(); return; }
    if (e.key === "Tab") {
      // small focus trap across the three controls
      var stops = [lbFile, lbZoom, lbClose];
      var i = stops.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? (i <= 0 ? stops.length - 1 : i - 1) : (i === stops.length - 1 ? 0 : i + 1);
      stops[next].focus();
    }
  });

  // linked images: intercept the anchor, keep href as fallback
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a || !lightbox.hidden) return;
    if (!IMG_HREF.test(a.getAttribute("href") || "")) return;
    var img = a.querySelector("img");
    if (!img) return;
    e.preventDefault();
    var lightPlate = !!(a.closest(".diagram-frame") || a.closest(".deck-pane"));
    openLightbox(a.href, img.alt, captionFor(a), lightPlate, a);
  });

  // plain images in frames and carousel slides open the overlay too
  document.querySelectorAll(".frame img, .carousel .slide img").forEach(function (img) {
    if (img.closest("a")) return;
    img.classList.add("lb-zoomable");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    function openIt() { openLightbox(img.currentSrc || img.src, img.alt, captionFor(img), false, img); }
    img.addEventListener("click", openIt);
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIt(); }
    });
  });

  /* ------------------------------------------- hero: signal field
     ambient threads in the chapter accents; pauses off screen */
  var canvas = document.getElementById("signal-field");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    // The threads used to be hard-coded to the dark page's pastels. They now
    // read the v3 project accents so they stay legible in both themes, and
    // re-read whenever the theme changes.
    var THREAD_TOKENS = ["--color-accent", "--color-project-cyan", "--color-project-amber", "--color-project-mint"];
    var THREAD_COLORS = [];
    var THREAD_ALPHA = { line: 0.16, node: 0.72 };
    function toRGB(value) {
      var hex = value.match(/^#([0-9a-f]{3,8})$/i);
      if (hex) {
        var h = hex[1];
        if (h.length === 3 || h.length === 4) h = h.split("").map(function (c) { return c + c; }).join("");
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      }
      var rgb = value.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
      if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
      return [128, 128, 128];
    }
    function readTheme() {
      var cs = getComputedStyle(document.documentElement);
      THREAD_COLORS = THREAD_TOKENS.map(function (token) { return toRGB(cs.getPropertyValue(token).trim()); });
      // Light surfaces need less alpha than the dark page these were drawn for.
      var dark = document.documentElement.getAttribute("data-theme-effective") === "dark";
      // Node alpha is capped so that even a dot sitting directly behind hero
      // copy cannot pull the text below 4.5:1. Above roughly 0.45 in dark and
      // 0.4 in light it can. Lines are 1px and do not move the effective
      // background, so they keep the original weight.
      THREAD_ALPHA = dark ? { line: 0.16, node: 0.44 } : { line: 0.13, node: 0.38 };
    }
    readTheme();
    new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-effective"] });
    var cw = 0, ch = 0, rafId = 0, canvasVisible = true;

    // Boxes of the hero copy, in canvas space. The threads are erased behind
    // these so a node can never sit under a glyph and pull its contrast down.
    // Measured on resize rather than per frame to keep layout reads off the
    // animation loop.
    var copyBoxes = [];
    var PAD_X = 12, PAD_Y = 8;
    function measureCopy() {
      var copy = document.querySelector(".hero-copy");
      var rect = canvas.getBoundingClientRect();
      copyBoxes = [];
      if (!copy) return;
      copy.querySelectorAll("h1, p, .hero-actions").forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (b.width > 0 && b.height > 0) {
          copyBoxes.push({ x: b.left - rect.left - PAD_X, y: b.top - rect.top - PAD_Y, w: b.width + PAD_X * 2, h: b.height + PAD_Y * 2 });
        }
      });
    }

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = rect.width;
      ch = rect.height;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureCopy();
    }

    function clearBehindCopy() {
      if (!copyBoxes.length) return;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "#000";
      // Two passes: a blurred halo so the threads fade out rather than ending
      // on a visible rectangle, then a hard core over the glyph box itself,
      // because a blurred edge leaves enough residue to cost the faintest
      // links their contrast margin.
      try { ctx.filter = "blur(16px)"; } catch (e) { /* unsupported: halo is hard edged */ }
      copyBoxes.forEach(function (b) { ctx.fillRect(b.x, b.y, b.w, b.h); });
      try { ctx.filter = "none"; } catch (e) { /* no-op */ }
      copyBoxes.forEach(function (b) { ctx.fillRect(b.x + PAD_X, b.y + PAD_Y, b.w - PAD_X * 2, b.h - PAD_Y * 2); });
      ctx.restore();
    }

    function drawThread(index, time) {
      var color = THREAD_COLORS[index];
      var base = ch * (0.24 + index * 0.155);
      var amplitude = Math.min(60, ch * 0.07);
      var phase = time * (0.00008 + index * 0.000012) + index * 1.5;
      ctx.beginPath();
      for (var x = -40; x <= cw + 40; x += 10) {
        var y = base
          + Math.sin((x / cw) * Math.PI * 2.2 + phase) * amplitude
          + Math.sin((x / cw) * Math.PI * 5.2 - phase * 0.7) * amplitude * 0.24;
        if (x === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(" + color.join(",") + ", " + THREAD_ALPHA.line + ")";
      ctx.lineWidth = 1;
      ctx.stroke();

      for (var node = 0; node < 6; node += 1) {
        var nx = ((node + 0.45 + index * 0.18) / 6) * cw;
        var ny = base
          + Math.sin((nx / cw) * Math.PI * 2.2 + phase) * amplitude
          + Math.sin((nx / cw) * Math.PI * 5.2 - phase * 0.7) * amplitude * 0.24;
        var pulse = 2.2 + Math.sin(time * 0.0012 + node + index) * 0.8;
        ctx.beginPath();
        ctx.arc(nx, ny, pulse, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + color.join(",") + ", " + THREAD_ALPHA.node + ")";
        ctx.fill();
      }
    }

    function drawField(time) {
      if (!canvasVisible) return;
      ctx.clearRect(0, 0, cw, ch);
      for (var i = 0; i < 4; i += 1) drawThread(i, time);
      clearBehindCopy();
      rafId = window.requestAnimationFrame(drawField);
    }

    resizeCanvas();
    window.setTimeout(measureCopy, 1400);   // after the hero entrance settles
    window.addEventListener("resize", resizeCanvas, { passive: true });
    new IntersectionObserver(function (entries) {
      canvasVisible = entries[0].isIntersecting;
      if (canvasVisible && !rafId) rafId = window.requestAnimationFrame(drawField);
      if (!canvasVisible && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }).observe(canvas);
    rafId = window.requestAnimationFrame(drawField);
  }
})();
