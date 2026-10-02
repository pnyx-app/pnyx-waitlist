/*
 * PNYX waitlist page.
 *
 * Grid tables are copied from pnyx-native/src/lib/grids.ts (spec §3.2) — names,
 * coordinates and hex values are product facts, keep them in sync if those change.
 */
(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────
  /** Defined in launch.js, shared with widget.html. */
  var LAUNCH = window.PNYX_LAUNCH;

  /**
   * pnyx-backend's POST /waitlist (stored in Supabase's `waitlist` table).
   * The backend only accepts browser calls from origins listed in its
   * ALLOWED_ORIGINS env var, so the site's own address has to be in there.
   * Set this to "" to keep signups in the visitor's browser only (local dev).
   */
  var WAITLIST_ENDPOINT = "https://pnyx-backend-ld7n.onrender.com/waitlist";

  // ── Grid data (from src/lib/grids.ts) ────────────────────────────────
  var P = function (x, y, name, extra) {
    var p = { x: x, y: y, name: name };
    for (var k in extra) p[k] = extra[k];
    return p;
  };

  var GRIDS = {
    values: {
      title: "Values",
      axes: ["Individualist ↔ Communitarian", "Traditionalist ↔ Progressive"],
      shapes: "Your animal",
      points: [
        P(0, 0, "Adapt", { animal: "dragon", meaning: "Balances independence and belonging" }),
        P(0.33, 0.33, "Stable", { animal: "bear", meaning: "Values security, loyalty, continuity" }),
        P(0.66, 0.66, "Lead", { animal: "lion", meaning: "Protects the group and its traditions" }),
        P(1, 1, "Loyalty", { animal: "wolf", meaning: "The group comes first" }),
        P(0.33, -0.33, "Flex", { animal: "fish", meaning: "Moves with change while staying connected" }),
        P(0.66, -0.66, "Harmony", { animal: "capybara", meaning: "Seeks cooperation and social balance" }),
        P(1, -1, "Empath", { animal: "deer", meaning: "Prioritises inclusion and others' wellbeing" }),
        P(-0.33, -0.33, "Patience", { animal: "turtle", meaning: "Follows its own pace, open to change" }),
        P(-0.66, -0.66, "Marvel", { animal: "owl", meaning: "Questions convention, thinks independently" }),
        P(-1, -1, "Free", { animal: "eagle", meaning: "Values autonomy above convention" }),
        P(-0.33, 0.33, "Fervent", { animal: "bull", meaning: "Holds firmly to personal principles" }),
        P(-0.66, 0.66, "Defy", { animal: "cobra", meaning: "Resists pressure to conform" }),
        P(-1, 1, "Cunning", { animal: "fox", meaning: "Finds its own way around constraints" }),
      ],
    },
    mind: {
      title: "Mind",
      axes: ["Emotive ↔ Scientific", "Theoretical ↔ Practical"],
      shapes: "Your primary colour and profile dot",
      points: [
        P(0, 0, "Grey", { hex: "#6B6862" }), P(0.33, 0.33, "Orange", { hex: "#FF924C" }),
        P(0.66, 0.66, "Yellow", { hex: "#FFCA3A" }), P(1, 1, "Green", { hex: "#8AC926" }),
        P(0.33, -0.33, "Teal", { hex: "#2EC4B6" }), P(0.66, -0.66, "Blue", { hex: "#1982C4" }),
        P(1, -1, "Indigo", { hex: "#4267E8" }), P(-0.33, -0.33, "Purple", { hex: "#7B2CBF" }),
        P(-0.66, -0.66, "Violet", { hex: "#C77DFF" }), P(-1, -1, "Pink", { hex: "#FF70A6" }),
        P(-0.33, 0.33, "Purple-pink", { hex: "#9B5DE5" }), P(-0.66, 0.66, "Bright cyan", { hex: "#00BBF9" }),
        P(-1, 1, "Magenta", { hex: "#F15BB5" }),
      ],
    },
    soul: {
      title: "Soul",
      axes: ["Extrovert ↔ Introvert", "Grave ↔ Humorous"],
      shapes: "Your animal's highlight",
      points: [
        P(0, 0, "Teal", { hex: "#14B8A6" }), P(0.33, 0.33, "Coral", { hex: "#FB7185" }),
        P(0.66, 0.66, "Pink", { hex: "#F43F8E" }), P(1, 1, "Rose", { hex: "#E11D74" }),
        P(0.33, -0.33, "Mint", { hex: "#2DD4BF" }), P(0.66, -0.66, "Aqua", { hex: "#06B6D4" }),
        P(1, -1, "Cyan", { hex: "#0891B2" }), P(-0.33, -0.33, "Slate", { hex: "#475569" }),
        P(-0.66, -0.66, "Navy", { hex: "#334155" }), P(-1, -1, "Midnight", { hex: "#1E293B" }),
        P(-0.33, 0.33, "Amber", { hex: "#D97706" }), P(-0.66, 0.66, "Vermilion", { hex: "#C2410C" }),
        P(-1, 1, "Crimson", { hex: "#BE123C" }),
      ],
    },
    culture: {
      title: "Culture",
      axes: ["Classical ↔ Contemporary", "Broad ↔ Niche"],
      shapes: "Your animal's base colour",
      points: [
        P(0, 0, "Stone", { hex: "#94A3B8" }), P(0.33, 0.33, "Champagne", { hex: "#D6C6A8" }),
        P(0.66, 0.66, "Antique", { hex: "#C9A66B" }), P(1, 1, "Gold", { hex: "#B89445" }),
        P(0.33, -0.33, "Sky", { hex: "#7DD3FC" }), P(0.66, -0.66, "Aqua", { hex: "#67E8F9" }),
        P(1, -1, "Cyan", { hex: "#22D3EE" }), P(-0.33, -0.33, "Lilac", { hex: "#DA97F7" }),
        P(-0.66, -0.66, "Indigo", { hex: "#7051EC" }), P(-1, -1, "Electric", { hex: "#347AF4" }),
        P(-0.33, 0.33, "Sage", { hex: "#86A68A" }), P(-0.66, 0.66, "Olive", { hex: "#8F9560" }),
        P(-1, 1, "Moss", { hex: "#647052" }),
      ],
    },
    focus: {
      title: "Focus",
      axes: ["Physical ↔ Intellectual", "Competitive ↔ Relaxed"],
      shapes: "The plate behind your animal",
      points: [
        P(0, 0, "Charcoal", { hex: "#25253A" }), P(0.33, 0.33, "Umber", { hex: "#46333A" }),
        P(0.66, 0.66, "Rust", { hex: "#633B32" }), P(1, 1, "Burnt", { hex: "#713C2F" }),
        P(0.33, -0.33, "Bluegrey", { hex: "#293B4A" }), P(0.66, -0.66, "Navy", { hex: "#1F3445" }),
        P(1, -1, "Ink", { hex: "#172B3A" }), P(-0.33, -0.33, "Indigo", { hex: "#29264A" }),
        P(-0.66, -0.66, "Plum", { hex: "#30203F" }), P(-1, -1, "Obsidian", { hex: "#21182F" }),
        P(-0.33, 0.33, "Maroon", { hex: "#542634" }), P(-0.66, 0.66, "Burgundy", { hex: "#641F32" }),
        P(-1, 1, "Crimson", { hex: "#681D2B" }),
      ],
    },
  };
  var GRID_IDS = ["values", "mind", "soul", "culture", "focus"];

  function nearestPoint(grid, pos) {
    var best = null, bestD = Infinity;
    GRIDS[grid].points.forEach(function (p) {
      var d = Math.hypot(p.x - pos.x, p.y - pos.y);
      if (d < bestD) { bestD = d; best = p; }
    });
    return best;
  }

  /** Shortest prefix that keeps every name on a grid unique — same rule as algorithm.ts. */
  var codeLenCache = {};
  function codeLength(grid) {
    if (codeLenCache[grid]) return codeLenCache[grid];
    var names = GRIDS[grid].points.map(function (p) { return p.name.toUpperCase(); });
    var longest = Math.max.apply(null, names.map(function (n) { return n.length; }));
    var len = 2;
    while (len < longest) {
      var seen = {}, unique = true;
      for (var i = 0; i < names.length; i++) {
        var pre = names[i].slice(0, len);
        if (seen[pre]) { unique = false; break; }
        seen[pre] = true;
      }
      if (unique) break;
      len++;
    }
    return (codeLenCache[grid] = len);
  }

  function identityCode(positions) {
    return GRID_IDS.map(function (g) {
      return nearestPoint(g, positions[g]).name.slice(0, codeLength(g)).toUpperCase();
    }).join("·");
  }

  // ── Colour helpers (ported from theme/tokens.ts glossGradient) ────────
  function parseHex(hex) {
    var n = parseInt(hex.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  function rgbToHls(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return [0, l, 0];
    var d = max - min;
    var s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    var h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h / 6, l, s];
  }
  function hlsToRgb(h, l, s) {
    if (s === 0) return [l, l, l];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function f(t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
  }
  function toHex(rgb) {
    return "#" + rgb.map(function (c) {
      return Math.max(0, Math.min(255, Math.round(c * 255))).toString(16).padStart(2, "0");
    }).join("");
  }
  function glossGradient(hex) {
    var rgb = parseHex(hex), hls = rgbToHls(rgb[0], rgb[1], rgb[2]);
    return [
      toHex(hlsToRgb(hls[0], Math.min(0.85, hls[1] + 0.1), Math.min(1, hls[2] + 0.03))),
      toHex(hlsToRgb(hls[0], Math.max(0.1, hls[1] - 0.24), Math.min(1, hls[2] + 0.12))),
    ];
  }

  // ── Crest ─────────────────────────────────────────────────────────────
  function crestColors(positions) {
    return {
      animal: nearestPoint("values", positions.values).animal,
      base: nearestPoint("culture", positions.culture).hex,
      highlight: nearestPoint("soul", positions.soul).hex,
      shadow: nearestPoint("focus", positions.focus).hex,
    };
  }

  function setMask(el, url) {
    el.style.webkitMaskImage = "url(" + url + ")";
    el.style.maskImage = "url(" + url + ")";
  }

  function paintCrest(el, colors) {
    var base = el.querySelector(".crest-layer--base");
    var hi = el.querySelector(".crest-layer--hi");
    if (!base) {
      base = document.createElement("span");
      base.className = "crest-layer crest-layer--base";
      hi = document.createElement("span");
      hi.className = "crest-layer crest-layer--hi";
      el.appendChild(base);
      el.appendChild(hi);
    }
    var g = glossGradient(colors.base);
    el.style.setProperty("--shadow", colors.shadow);
    base.style.background = "linear-gradient(135deg, " + g[0] + ", " + g[1] + ")";
    hi.style.background = colors.highlight;
    setMask(base, "assets/animals/" + colors.animal + "-base.png");
    setMask(hi, "assets/animals/" + colors.animal + "-highlight.png");
  }

  var ORIGIN = { x: 0, y: 0 };
  function positionsWith(overrides) {
    var p = { values: ORIGIN, mind: ORIGIN, soul: ORIGIN, culture: ORIGIN, focus: ORIGIN };
    for (var k in overrides) p[k] = overrides[k];
    return p;
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

  // ── Hero crest rotation (same showcase set as components/Landing.tsx) ─
  (function heroCrest() {
    var el = document.querySelector("[data-hero-crest]");
    var nameEl = document.querySelector("[data-hero-name]");
    var codeEl = document.querySelector("[data-hero-code]");
    if (!el) return;
    var preview = [
      { values: { x: 1, y: 1 }, culture: { x: -1, y: -1 } },
      { values: { x: -0.66, y: -0.66 }, culture: { x: 1, y: 1 }, soul: { x: -0.33, y: 0.33 } },
      { values: { x: 0, y: 0 }, culture: { x: -0.33, y: -0.33 }, focus: { x: -0.66, y: -0.66 } },
      { values: { x: -1, y: 1 }, culture: { x: 1, y: -1 }, soul: { x: 0.66, y: 0.66 } },
      { values: { x: 0.66, y: 0.66 }, culture: { x: -0.33, y: 0.33 }, focus: { x: 0.66, y: 0.66 } },
    ];
    var i = 0;
    function show(idx) {
      var pos = positionsWith(preview[idx]);
      var colors = crestColors(pos);
      paintCrest(el, colors);
      nameEl.textContent = cap(colors.animal) + " · " + nearestPoint("values", pos.values).name;
      codeEl.textContent = identityCode(pos);
    }
    show(0);
    // Warm the cache so swaps don't flash an empty plate.
    preview.forEach(function (p) {
      var a = nearestPoint("values", p.values).animal;
      ["base", "highlight"].forEach(function (layer) { new Image().src = "assets/animals/" + a + "-" + layer + ".png"; });
    });
    if (reduceMotion) return;
    setInterval(function () {
      el.classList.add("is-fading");
      setTimeout(function () {
        i = (i + 1) % preview.length;
        show(i);
        el.classList.remove("is-fading");
      }, 240);
    }, 2600);
  })();

  // ── Countdown ─────────────────────────────────────────────────────────
  (function countdown() {
    var clock = document.querySelector("[data-clock]");
    var live = document.querySelector("[data-live]");
    var parts = {
      days: document.querySelector("[data-days]"),
      hours: document.querySelector("[data-hours]"),
      minutes: document.querySelector("[data-minutes]"),
      seconds: document.querySelector("[data-seconds]"),
    };
    var inline = document.querySelector("[data-days-inline]");
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var timer;

    function tick() {
      var ms = LAUNCH.getTime() - Date.now();
      if (ms <= 0) {
        clock.hidden = true;
        live.hidden = false;
        if (inline) inline.parentElement.textContent = "PNYX is open.";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor((s % 86400) / 3600);
      var m = Math.floor((s % 3600) / 60);
      window.PNYX_setDigits(parts.days, pad(d));
      window.PNYX_setDigits(parts.hours, pad(h));
      window.PNYX_setDigits(parts.minutes, pad(m));
      window.PNYX_setDigits(parts.seconds, pad(s % 60));
      clock.setAttribute("aria-label", d + " days, " + h + " hours and " + m + " minutes until launch");
      if (inline) {
        inline.textContent = d === 0 ? "Less than a day" : d === 1 ? "One day" : d + " days";
      }
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  // ── Values-grid demo ─────────────────────────────────────────────────
  (function demo() {
    var svg = document.querySelector("[data-plane]");
    if (!svg) return;
    var NS = "http://www.w3.org/2000/svg";
    var S = 100; // grid unit → svg units; y is flipped so Traditionalist is up.

    // Value coordinates per take: x Individualist(-1) ↔ Communitarian(+1), y Progressive(-1) ↔ Traditionalist(+1).
    var TAKES = [
      { text: "Grandparents' recipes should never be “improved.”", x: 0.35, y: 0.85 },
      { text: "You owe your hometown nothing.", x: -0.85, y: -0.15 },
      { text: "Taxes are the membership fee for a decent society.", x: 0.85, y: -0.35 },
      { text: "Most rules exist for people who can't think for themselves.", x: -0.75, y: -0.6 },
      { text: "Sunday lunch with family is non-negotiable.", x: 0.75, y: 0.75 },
      { text: "Tradition is just peer pressure from dead people.", x: -0.35, y: -0.95 },
      { text: "Being self-made is mostly a myth.", x: 0.6, y: -0.4 },
      { text: "Some things should stay exactly the way they've always been.", x: 0, y: 0.95 },
    ];
    var RATE = 0.38;

    function el(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }

    el("rect", { class: "frame", x: -S, y: -S, width: 2 * S, height: 2 * S, rx: 6 });
    el("line", { class: "axis", x1: -S, y1: 0, x2: S, y2: 0 });
    el("line", { class: "axis", x1: 0, y1: -S, x2: 0, y2: S });
    el("text", { class: "axis-label", x: 0, y: -S - 8, "text-anchor": "middle" }).textContent = "Traditionalist";
    el("text", { class: "axis-label", x: 0, y: S + 16, "text-anchor": "middle" }).textContent = "Progressive";
    el("text", { class: "axis-label", x: 0, y: 0, "text-anchor": "middle", transform: "translate(" + (-S - 10) + " 0) rotate(-90)" }).textContent = "Individualist";
    el("text", { class: "axis-label", x: 0, y: 0, "text-anchor": "middle", transform: "translate(" + (S + 10) + " 0) rotate(90)" }).textContent = "Communitarian";

    var refs = {};
    GRIDS.values.points.forEach(function (p) {
      var cx = p.x * S, cy = -p.y * S;
      var dot = el("circle", { class: "ref", cx: cx, cy: cy, r: 2.6 });
      var label = el("text", { class: "ref-label", x: cx, y: cy + (p.y === 1 ? -6 : 10), "text-anchor": "middle" });
      label.textContent = cap(p.animal);
      refs[p.name] = [dot, label];
    });

    var trail = el("polyline", { class: "trail", points: "0,0" });
    var you = el("g", { class: "you-group" });
    el("circle", { class: "you-ring", r: 9 }, you);
    el("circle", { class: "you", r: 4.5 }, you);

    var takeEl = document.querySelector("[data-take]");
    var countEl = document.querySelector("[data-take-count]");
    var crestEl = document.querySelector("[data-demo-crest]");
    var nameEl = document.querySelector("[data-demo-name]");
    var meaningEl = document.querySelector("[data-demo-meaning]");
    var voteBtns = Array.prototype.slice.call(document.querySelectorAll("[data-vote]"));

    var pos, path, index, lastNear;

    function render() {
      you.style.transform = "translate(" + pos.x * S + "px, " + -pos.y * S + "px)";
      trail.setAttribute("points", path.map(function (p) { return p.x * S + "," + -p.y * S; }).join(" "));
      var near = nearestPoint("values", pos);
      if (near !== lastNear) {
        if (lastNear) refs[lastNear.name].forEach(function (n) { n.classList.remove("is-near"); });
        refs[near.name].forEach(function (n) { n.classList.add("is-near"); });
        lastNear = near;
        paintCrest(crestEl, crestColors(positionsWith({ values: pos })));
        nameEl.textContent = cap(near.animal) + " · " + near.name;
        meaningEl.textContent = near.meaning;
      }
    }

    function showTake() {
      var done = index >= TAKES.length;
      voteBtns.forEach(function (b) { b.disabled = done; });
      if (done) {
        countEl.textContent = "That's all 8";
        takeEl.textContent = "That's one grid from eight takes. The app does this for all five, from every reaction.";
        return;
      }
      countEl.textContent = "Take " + (index + 1) + " of " + TAKES.length;
      takeEl.textContent = TAKES[index].text;
    }

    function swapTake() {
      if (reduceMotion) return showTake();
      takeEl.classList.add("is-fading");
      setTimeout(function () { showTake(); takeEl.classList.remove("is-fading"); }, 180);
    }

    function reset() {
      pos = { x: 0, y: 0 };
      path = [{ x: 0, y: 0 }];
      index = 0;
      render();
      showTake();
    }

    voteBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (index >= TAKES.length) return;
        var w = parseFloat(btn.getAttribute("data-vote"));
        var t = TAKES[index];
        // Positive votes pull toward the take, negative ones push away from it.
        var dx = (t.x - pos.x) * RATE * w;
        var dy = (t.y - pos.y) * RATE * w;
        pos = {
          x: Math.max(-1, Math.min(1, pos.x + dx)),
          y: Math.max(-1, Math.min(1, pos.y + dy)),
        };
        path.push(pos);
        index++;
        render();
        swapTake();
      });
    });
    document.querySelector("[data-reset]").addEventListener("click", reset);
    reset();
  })();

  // ── Grid list ─────────────────────────────────────────────────────────
  (function gridList() {
    var list = document.querySelector("[data-grid-list]");
    if (!list) return;
    GRID_IDS.forEach(function (id, i) {
      var g = GRIDS[id];
      var li = document.createElement("li");
      li.className = "grid-row";
      li.innerHTML =
        '<span class="grid-index">0' + (i + 1) + "</span>" +
        '<h3 class="grid-name">' + g.title + "</h3>" +
        '<p class="grid-axes"><span>' + g.axes[0] + "</span><span>" + g.axes[1] + "</span></p>" +
        '<div class="grid-shape"><span class="label">' + g.shapes + "</span></div>";
      var shape = li.querySelector(".grid-shape");
      if (id === "values") {
        var row = document.createElement("div");
        row.className = "mini-animals";
        g.points.forEach(function (p) {
          var c = document.createElement("span");
          c.className = "crest";
          c.title = cap(p.animal) + " · " + p.name;
          paintCrest(c, crestColors(positionsWith({ values: p })));
          row.appendChild(c);
        });
        shape.appendChild(row);
      } else {
        var sw = document.createElement("div");
        sw.className = "swatches";
        g.points.forEach(function (p) {
          var s = document.createElement("span");
          s.className = "swatch";
          s.style.background = p.hex;
          s.title = p.name;
          sw.appendChild(s);
        });
        shape.appendChild(sw);
      }
      list.appendChild(li);
    });
  })();

  // ── Signup ────────────────────────────────────────────────────────────
  (function signup() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-signup]"));
    var STORE_KEY = "pnyx-waitlist-email";
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function markDone(email) {
      forms.forEach(function (f) {
        f.classList.add("is-done");
        var note = f.querySelector("[data-note]");
        note.classList.remove("is-error");
        note.textContent = "You're on the list. We'll write to " + email + " when the doors open on 2 November.";
      });
    }

    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved) markDone(saved);
    } catch (e) { /* storage unavailable — fine */ }

    forms.forEach(function (form) {
      var input = form.querySelector("input");
      var button = form.querySelector("button");
      var note = form.querySelector("[data-note]");
      var original = note.textContent;

      input.addEventListener("input", function () {
        if (note.classList.contains("is-error")) {
          note.classList.remove("is-error");
          note.textContent = original;
        }
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = input.value.trim();
        if (!EMAIL_RE.test(email)) {
          note.classList.add("is-error");
          note.textContent = "That doesn't look like an email address.";
          input.focus();
          return;
        }
        button.disabled = true;
        button.textContent = "Joining…";
        // The API may be waking from idle on Render, which can take a while.
        var slow = setTimeout(function () { button.textContent = "Still joining…"; }, 4000);

        var request = WAITLIST_ENDPOINT
          ? fetch(WAITLIST_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email, source: "waitlist-site" }),
            }).then(function (res) {
              if (res.status === 429) throw new Error("rate-limited");
              if (res.status === 400) throw new Error("invalid");
              if (!res.ok) throw new Error("HTTP " + res.status);
            })
          : Promise.resolve(console.warn("[pnyx-waitlist] WAITLIST_ENDPOINT is not set; signup kept locally only."));

        request
          .then(function () {
            try { localStorage.setItem(STORE_KEY, email); } catch (err) { /* ignore */ }
            markDone(email);
          })
          .catch(function (err) {
            note.classList.add("is-error");
            note.textContent =
              err.message === "rate-limited" ? "Too many tries from here. Give it a minute and try again."
              : err.message === "invalid" ? "That doesn't look like an email address."
              : "Something went wrong on our end. Please try again in a moment.";
          })
          .then(function () {
            clearTimeout(slow);
            button.disabled = false;
            button.textContent = "Join the waitlist";
          });
      });
    });
  })();
})();
