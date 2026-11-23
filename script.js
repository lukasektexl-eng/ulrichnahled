(function () {
  "use strict";

  // Pipe in "Jak to probíhá" draws itself when it scrolls into view.
  var steps = document.querySelector(".steps-wrap");
  var mq = window.matchMedia("(max-width: 900px)");
  function orient() {
    var p = steps.querySelector(".steps-pipe");
    var path = p.querySelector("path");
    if (mq.matches) {
      p.setAttribute("viewBox", "0 0 16 1000");
      path.setAttribute("d", "M8 0V1000");
    } else {
      p.setAttribute("viewBox", "0 0 1000 40");
      path.setAttribute("d", "M0 20H1000");
    }
  }
  if (steps) {
    orient();
    mq.addEventListener ? mq.addEventListener("change", orient) : mq.addListener(orient);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { steps.classList.add("is-in"); io.disconnect(); }
        });
      }, { threshold: 0.35 });
      io.observe(steps);
    } else {
      steps.classList.add("is-in");
    }
  }

  // Demo form + live work-order slip. Nothing is sent anywhere.
  var form = document.getElementById("poptavka-form");
  if (!form) return;
  var done = document.getElementById("form-done");
  var stamp = document.getElementById("slip-stamp");
  var timers = {};

  function slipSet(name, value) {
    var dd = document.querySelector('[data-slip="' + name + '"]');
    if (!dd) return;
    var v = value.trim();
    if (v.length > 140) v = v.slice(0, 140) + "…";
    dd.textContent = v || " ";
    dd.classList.add("flash");
    clearTimeout(timers[name]);
    timers[name] = setTimeout(function () { dd.classList.remove("flash"); }, 500);
  }

  ["jmeno", "telefon", "popis"].forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener("input", function () {
      slipSet(n, el.value);
      if (el.getAttribute("aria-invalid") === "true") validate(el);
    });
  });

  var rules = {
    jmeno: function (v) { return v.trim().length >= 2; },
    telefon: function (v) { return v.replace(/\D/g, "").length >= 9; },
    popis: function (v) { return v.trim().length >= 3; }
  };
  var errIds = { jmeno: "e-jmeno", telefon: "e-tel", popis: "e-popis" };

  function validate(el) {
    var ok = rules[el.name](el.value);
    var err = document.getElementById(errIds[el.name]);
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    err.hidden = ok;
    var base = el.name === "telefon" ? "h-tel" : "";
    el.setAttribute("aria-describedby", ok ? base : (base ? base + " " : "") + errIds[el.name]);
    if (!el.getAttribute("aria-describedby")) el.removeAttribute("aria-describedby");
    return ok;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var first = null;
    ["jmeno", "telefon", "popis"].forEach(function (n) {
      var el = form.elements[n];
      if (!validate(el) && !first) first = el;
    });
    if (first) { done.hidden = true; first.focus(); return; }
    done.hidden = false;
    if (stamp) stamp.hidden = false;
    done.focus();
  });
})();
