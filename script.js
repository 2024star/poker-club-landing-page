// script.js

// Inject small CSS needed for ripple + mobile-friendly chip entrance animation.
// This avoids editing styles.css and avoids transform conflicts with your stacked chips.
(function injectExtraStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to { transform: scale(4); opacity: 0; }
    }

    /* Mobile-friendly chip entrance:
       - doesn't override your existing stack transforms
       - uses opacity + a subtle "pop" via filter + scale on a wrapper-like effect
       - we animate with keyframes but keep your base transforms intact
    */
    .chip-stack .chip {
      opacity: 0;
      filter: blur(2px);
      transform-origin: center;
      transition: opacity 450ms ease, filter 450ms ease;
      will-change: opacity, filter;
    }

    /* When activated, we DON'T set transform here (important),
       so your existing nth-child transforms remain untouched. */
    .chip-stack .chip.is-in {
      opacity: 1;
      filter: blur(0);
    }

    /* Optional: a small "glow pulse" once they're in view */
    @keyframes chipGlow {
      0% { box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 8px 18px rgba(255,215,0,0.25); }
      100% { box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
    }
    .chip-stack .chip.is-glow {
      animation: chipGlow 900ms ease 1;
    }
  `;
  document.head.appendChild(style);
})();

document.addEventListener("DOMContentLoaded", function () {
  // --- 1) Chips: animate when visible (great for mobile) ---
  const chips = document.querySelectorAll(".chip-stack .chip");

  if (chips.length) {
    // If IntersectionObserver is supported (it is on most mobile browsers)
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            // Stagger in nicely
            chips.forEach((chip, index) => {
              setTimeout(() => {
                chip.classList.add("is-in");
                // Small glow once
                chip.classList.add("is-glow");
                setTimeout(() => chip.classList.remove("is-glow"), 950);
              }, index * 140);
            });

            obs.disconnect(); // run once
          });
        },
        { threshold: 0.25 },
      );

      // Observe the stack container if possible, otherwise the first chip
      const stack = document.querySelector(".chip-stack");
      observer.observe(stack || chips[0]);
    } else {
      // Fallback: just show them
      chips.forEach((chip) => chip.classList.add("is-in"));
    }
  }

  // --- 2) Map button ripple effect ---
  const mapButton = document.querySelector(".map-button");
  if (mapButton) {
    mapButton.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.28);
        width: ${size}px;
        height: ${size}px;
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple 0.6s linear;
      `;

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 650);
    });
  }

  // --- 3) Prize value intro + subtle pulse (mobile-friendly) ---
  const prizeValue = document.querySelector(".prize-value");
  if (prizeValue) {
    // Intro
    prizeValue.style.transform = "scale(0.92)";
    prizeValue.style.opacity = "0.6";

    setTimeout(() => {
      prizeValue.style.transition = "transform 700ms ease, opacity 700ms ease";
      prizeValue.style.transform = "scale(1)";
      prizeValue.style.opacity = "1";
    }, 250);

    // Pulse glow (not too aggressive on mobile)
    setInterval(() => {
      prizeValue.style.textShadow = "0 0 16px rgba(0, 255, 85, 0.45)";
      setTimeout(() => {
        prizeValue.style.textShadow = "0 0 10px rgba(0, 255, 85, 0.25)";
      }, 450);
    }, 3200);
  }
});
