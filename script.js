/* ================================================================
   makura — private
   ambient particles + cursor light + parallax
   vanilla js · no dependencies · transform-only (60fps friendly)
   ================================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  /* ----------------------------------------------------------------
     1. ambient bokeh motes — slow, dreamy, never busy
     ---------------------------------------------------------------- */

  if (!reducedMotion) {
    var layer = document.getElementById("particles");
    var isSmall = Math.min(window.innerWidth, window.innerHeight) < 480;

    /* glowing bokeh dots */
    var count = isSmall ? 14 : 22;
    for (var i = 0; i < count; i++) {
      var m = document.createElement("span");
      m.className = "mote";

      var size = rand(2.5, 8);
      m.style.width = size + "px";
      m.style.height = size + "px";
      m.style.left = rand(1, 99) + "vw";
      m.style.bottom = "-4vh";
      m.style.setProperty("--wx", rand(-50, 50).toFixed(0) + "px");
      m.style.setProperty("--o1", rand(0.15, 0.35).toFixed(2));
      m.style.setProperty("--o2", rand(0.5, 0.85).toFixed(2));

      var rise = rand(30, 60);            /* very slow */
      m.style.animationDuration = rise + "s, " + rand(2.5, 5).toFixed(1) + "s";
      m.style.animationDelay = "-" + rand(0, rise).toFixed(1) + "s, 0s";

      layer.appendChild(m);
    }

    /* soft floating hearts — cute, never busy */
    var hearts = isSmall ? 7 : 11;
    for (var h = 0; h < hearts; h++) {
      var el = document.createElement("span");
      el.className = "mote mote--heart";
      el.textContent = "♡";

      el.style.left = rand(2, 96) + "vw";
      el.style.bottom = "-5vh";
      el.style.fontSize = rand(12, 24) + "px";
      el.style.setProperty("--wx", rand(-60, 60).toFixed(0) + "px");
      el.style.setProperty("--o1", rand(0.25, 0.4).toFixed(2));
      el.style.setProperty("--o2", rand(0.55, 0.8).toFixed(2));

      var hRise = rand(26, 50);
      el.style.animationDuration = hRise + "s, " + rand(3, 6).toFixed(1) + "s";
      el.style.animationDelay = "-" + rand(0, hRise).toFixed(1) + "s, 0s";

      layer.appendChild(el);
    }
  }

  /* ----------------------------------------------------------------
     2. cursor light + card parallax (desktop only)
        one rAF loop, eased targets, css vars for the light
     ---------------------------------------------------------------- */

  if (finePointer && !reducedMotion) {
    var root = document.documentElement;
    var card = document.getElementById("card");

    var tX = 0.5, tY = 0.4;   /* light target (viewport fractions) */
    var cX = 0.5, cY = 0.4;   /* light current */
    var tRx = 0, tRy = 0;     /* card tilt target */
    var cRx = 0, cRy = 0;
    var raf = null;

    function tick() {
      cX += (tX - cX) * 0.07;
      cY += (tY - cY) * 0.07;
      cRx += (tRx - cRx) * 0.06;
      cRy += (tRy - cRy) * 0.06;

      root.style.setProperty("--mx", (cX * 100).toFixed(2) + "%");
      root.style.setProperty("--my", (cY * 100).toFixed(2) + "%");

      /* note: keeps the float animation on the wrapper intact by
         rotating only — translation is handled by the css keyframes */
      card.style.rotate = "y " + cRy.toFixed(3) + "deg";
      card.style.transformStyle = "preserve-3d";
      card.style.setProperty("transform",
        "rotateY(" + cRy.toFixed(3) + "deg) rotateX(" + (-cRx).toFixed(3) + "deg)");

      var settled =
        Math.abs(tX - cX) < 0.0015 && Math.abs(tY - cY) < 0.0015 &&
        Math.abs(tRx - cRx) < 0.002 && Math.abs(tRy - cRy) < 0.002;

      raf = settled ? null : requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", function (e) {
      tX = e.clientX / window.innerWidth;
      tY = e.clientY / window.innerHeight;
      tRy = (tX - 0.5) * 5;   /* max ±2.5deg */
      tRx = (tY - 0.5) * 5;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  /* ----------------------------------------------------------------
     3. stardust on CTA press — instant, never blocks navigation
     ---------------------------------------------------------------- */

  var cta = document.getElementById("cta");

  cta.addEventListener("pointerdown", function (e) {
    if (reducedMotion) return;
    for (var j = 0; j < 8; j++) {
      var s = document.createElement("span");
      s.textContent = "♡";
      s.style.cssText =
        "position:fixed;z-index:99;pointer-events:none;" +
        "font-size:" + rand(11, 20) + "px;color:#f591c9;font-weight:700;" +
        "text-shadow:0 0 10px rgba(245,145,201,.85);" +
        "left:" + e.clientX + "px;top:" + e.clientY + "px;" +
        "transition:transform .75s cubic-bezier(.2,.6,.3,1),opacity .75s ease;opacity:1;";
      document.body.appendChild(s);

      (function (el) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.style.transform =
              "translate(" + rand(-70, 70) + "px," + rand(-85, -25) + "px) scale(" + rand(0.4, 1.2) + ")";
            el.style.opacity = "0";
          });
        });
        setTimeout(function () { el.remove(); }, 850);
      })(s);
    }
  }, { passive: true });

})();
