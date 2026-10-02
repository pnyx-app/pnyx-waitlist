/*
 * Animated countdown digits, shared by the site (main.js) and widget.html.
 *
 *   PNYX_setDigits(el, "07")
 *
 * Each character gets its own slot, and only the slots whose character changed
 * animate: the old character falls and fades out below while the new one drops
 * in from above. With reduced motion the text just swaps.
 */
(function () {
  "use strict";

  var DURATION = 420;
  // One curve for both directions, so the outgoing and incoming characters move
  // and fade in lockstep and cross at the midpoint.
  var EASE = "cubic-bezier(0.65,0,0.35,1)";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var css =
    ".flip-slot{position:relative;display:inline-block}" +
    ".flip-char{display:block;" +
    "transition:transform " + DURATION + "ms " + EASE + ",opacity " + DURATION + "ms " + EASE + "}" +
    ".flip-char.is-entering{transform:translateY(-0.4em);opacity:0}" +
    ".flip-char.is-leaving{position:absolute;inset:0;transform:translateY(0.4em);opacity:0}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function makeChar(ch, entering) {
    var span = document.createElement("span");
    span.className = entering ? "flip-char is-entering" : "flip-char";
    span.textContent = ch;
    return span;
  }

  function build(el, text) {
    el.textContent = "";
    for (var i = 0; i < text.length; i++) {
      var slot = document.createElement("span");
      slot.className = "flip-slot";
      slot.setAttribute("data-char", text[i]);
      slot.appendChild(makeChar(text[i], false));
      el.appendChild(slot);
    }
  }

  window.PNYX_setDigits = function (el, text) {
    var slots = el.querySelectorAll(".flip-slot");
    // First render, or the number of characters changed (e.g. 100 → 99 days): no animation.
    if (slots.length !== text.length) return build(el, text);

    for (var i = 0; i < text.length; i++) {
      var slot = slots[i];
      var ch = text[i];
      if (slot.getAttribute("data-char") === ch) continue;
      slot.setAttribute("data-char", ch);

      if (reduceMotion.matches || document.hidden) {
        slot.textContent = "";
        slot.appendChild(makeChar(ch, false));
        continue;
      }

      // Drop anything still mid-exit from a previous tick, then send the current one out.
      slot.querySelectorAll(".is-leaving").forEach(function (n) { n.remove(); });
      var old = slot.querySelector(".flip-char");
      var next = makeChar(ch, true);
      slot.appendChild(next);
      if (old) {
        old.classList.add("is-leaving");
        setTimeout(old.remove.bind(old), DURATION + 40);
      }
      next.getBoundingClientRect(); // commit the entering state so the transition runs
      next.classList.remove("is-entering");
    }
  };
})();
