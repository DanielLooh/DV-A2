// How Australia Pays — chart embedding.
// Each .vl div carries data-spec="specs/<file>.json". We embed with
// vegaEmbed (SVG renderer, no actions), then make the SVG responsive
// via a viewBox so charts scale to their panel without horizontal scroll.

(function () {
  "use strict";

  var EMBED_OPTS = {
    renderer: "svg",
    actions: false,
    // Respect the page's fonts and colors; specs already set their own.
    config: { background: "transparent" }
  };

  function makeResponsive(container) {
    var svg = container.querySelector("svg");
    if (!svg) return;
    var w = svg.getAttribute("width");
    var h = svg.getAttribute("height");
    if (w && h && !svg.getAttribute("viewBox")) {
      // Some widths come with units (e.g. "778"), strip anything non-numeric.
      var wNum = parseFloat(w);
      var hNum = parseFloat(h);
      if (wNum > 0 && hNum > 0) {
        svg.setAttribute("viewBox", "0 0 " + wNum + " " + hNum);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "auto";
      }
    }
  }

  function fail(container, name) {
    container.innerHTML =
      '<div class="vl-error">Chart could not be loaded' +
      (name ? " (" + name + ")" : "") +
      ". If you opened this page from the file system, serve it instead: " +
      "<code>python3 -m http.server 8000</code> in the project folder.</div>";
  }

  function load(container) {
    var specUrl = container.getAttribute("data-spec");
    var name = container.getAttribute("data-name") || specUrl;
    if (typeof vegaEmbed !== "function") {
      fail(container, "Vega libraries not loaded (offline?)");
      return Promise.resolve();
    }
    return vegaEmbed(container, specUrl, EMBED_OPTS)
      .then(function (result) {
        makeResponsive(container);
        container.setAttribute("aria-label", name);
        container.dataset.loaded = "true";
      })
      .catch(function (err) {
        console.error("vegaEmbed failed for " + specUrl, err);
        fail(container, name);
      });
  }

  function init() {
    document.querySelectorAll('.fact').forEach(function (card) {
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') card.classList.add('tooltip-dismissed');
      });
      ['mouseenter', 'focusin'].forEach(function (eventName) {
        card.addEventListener(eventName, function () {
          card.classList.remove('tooltip-dismissed');
        });
      });
    });
    var containers = Array.prototype.slice.call(
      document.querySelectorAll(".vl[data-spec]")
    );
    containers.forEach(function (c) { load(c); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
