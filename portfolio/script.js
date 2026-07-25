/* Jack Jin — portfolio v2 · reverse-chronological project story */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------ project data */
  // spans drive both the gantt and the year rail. order = page order.
  var PROJECTS = [
    { id: "ch-anima",   label: "Anima Mesh",            start: "2026-07-05", end: "2026-07-25", color: "#c0b3ff", year: "2026", ongoing: true },
    { id: "ch-bruce",   label: "Built with Bruce",      start: "2026-02-28", end: "2026-07-17", color: "#ff9d9d", year: "2026" },
    { id: "ch-factory", label: "Content Factory",       start: "2025-10-04", end: "2026-06-29", color: "#8fd8e8", year: "2026" },
    { id: "ch-kit",     label: "AI Builder Kit",        start: "2026-03-22", end: "2026-06-11", color: "#f0cf8e", year: "2026" },
    { id: "ch-conv",    label: "Conversion Factory",    start: "2026-05-31", end: "2026-06-05", color: "#b3dba0", year: "2026" },
    { id: "ch-cea",     label: "Continuous Exec Agent", start: "2026-01-24", end: "2026-05-31", color: "#ffc46b", year: "2026" },
    { id: "ch-ciam",    label: "CIAM Demo",             start: "2026-02-07", end: "2026-04-12", color: "#9db8e8", year: "2026" },
    { id: "ch-postal",  label: "Postal Portal",         start: "2025-07-12", end: "2025-07-25", color: "#d8b48f", year: "2025" },
    { id: "ch-shadow",  label: "Shadow Pivot",          start: "2025-05-22", end: "2025-07-15", color: "#9fe0c0", year: "2025" },
    { id: "ch-star",    label: "STAR Generator",        start: "2025-04-12", end: "2025-05-09", color: "#e8a9b8", year: "2025" }
  ];

  /* ---------------------------------------------------- scroll progress */
  var progress = document.getElementById("scroll-progress");
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    progress.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------- mobile menu */
  var toggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");
  toggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* --------------------------------------------------------- year rail */
  var rail = document.getElementById("year-rail");
  if (rail) {
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

  /* --------------------------------------------------- reveal on scroll */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  /* --------------------------------------------------------- the gantt */
  var gantt = document.getElementById("gantt");
  if (gantt) {
    var START = Date.parse("2025-04-01");
    var END = Date.parse("2026-08-01");
    var NOW = Date.parse("2026-07-25");
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
      nowLine.style.left = pct("2026-07-25") + "%";
      track.appendChild(nowLine);

      var bar = document.createElement("button");
      bar.className = "gantt-bar";
      var left = pct(p.start);
      var width = Math.max(pct(p.ongoing ? "2026-08-01" : p.end) - left, 1);
      bar.style.left = left.toFixed(2) + "%";
      bar.style.width = width.toFixed(2) + "%";
      bar.style.setProperty("--bar", p.color);
      var range = p.start.slice(0, 7) + " → " + (p.ongoing ? "now" : p.end.slice(0, 7));
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
  document.querySelectorAll(".deck-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var deck = tab.closest(".diagram-deck");
      deck.querySelectorAll(".deck-tab").forEach(function (t) {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      deck.querySelectorAll(".deck-pane").forEach(function (pane) {
        pane.classList.toggle("active", pane.id === tab.dataset.deck);
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

  /* ------------------------------------------- hero: signal field
     ambient threads in the chapter accents; pauses off screen */
  var canvas = document.getElementById("signal-field");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var THREAD_COLORS = [
      [192, 179, 255], // anima violet
      [143, 216, 232], // factory cyan
      [255, 196, 107], // cea amber
      [159, 224, 192]  // shadow mint
    ];
    var cw = 0, ch = 0, rafId = 0, canvasVisible = true;

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = rect.width;
      ch = rect.height;
      canvas.width = Math.round(cw * dpr);
      canvas.height = Math.round(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      ctx.strokeStyle = "rgba(" + color.join(",") + ", 0.16)";
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
        ctx.fillStyle = "rgba(" + color.join(",") + ", 0.72)";
        ctx.fill();
      }
    }

    function drawField(time) {
      if (!canvasVisible) return;
      ctx.clearRect(0, 0, cw, ch);
      for (var i = 0; i < 4; i += 1) drawThread(i, time);
      rafId = window.requestAnimationFrame(drawField);
    }

    resizeCanvas();
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
