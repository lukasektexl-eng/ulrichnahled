(function () {
  "use strict";

  // "Jak to probíhá": the pipe fills with water when it scrolls into view.
  var steps = document.querySelector(".steps-wrap");
  var mq = window.matchMedia("(max-width: 980px)");
  function orient() {
    var svg = steps.querySelector(".steps-pipe");
    var d = mq.matches ? "M8 0V1000" : "M0 20H1000";
    svg.setAttribute("viewBox", mq.matches ? "0 0 16 1000" : "0 0 1000 40");
    svg.querySelectorAll("path").forEach(function (p) { p.setAttribute("d", d); });
  }
  if (steps) {
    orient();
    if (mq.addEventListener) mq.addEventListener("change", orient); else mq.addListener(orient);
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

  // Area network pipes fill on scroll.
  var net = document.querySelector(".net");
  if (net) {
    if ("IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { net.classList.add("is-in"); io2.disconnect(); } });
      }, { threshold: 0.4 });
      io2.observe(net);
    } else { net.classList.add("is-in"); }
  }

  // Copy phone number (handy on desktop, where tel: links do nothing).
  var copyBtn = document.getElementById("copy-tel");
  var copyMsg = document.getElementById("copy-msg");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var num = copyBtn.getAttribute("data-tel");
      function ok() { copyMsg.textContent = "Číslo zkopírováno."; setTimeout(function () { copyMsg.textContent = ""; }, 3000); }
      function fail() { copyMsg.textContent = "Kopírování se nepovedlo, číslo je " + num + "."; }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(num).then(ok, fail);
      } else {
        try {
          var ta = document.createElement("textarea");
          ta.value = num; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy") ? ok() : fail();
          document.body.removeChild(ta);
        } catch (e) { fail(); }
      }
    });
  }

  // Demo form + live work-order slip. Nothing is sent anywhere.
  var form = document.getElementById("poptavka-form");
  if (!form) return;
  var done = document.getElementById("form-done");
  var stamp = document.getElementById("slip-stamp");
  var slipCol = document.getElementById("slip-col");
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
  form.querySelectorAll('input[name="misto"]').forEach(function (r) {
    r.addEventListener("change", function () { slipSet("misto", r.value); });
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
    var ids = [];
    if (el.name === "telefon") ids.push("h-tel");
    if (!ok) ids.push(errIds[el.name]);
    if (ids.length) el.setAttribute("aria-describedby", ids.join(" ")); else el.removeAttribute("aria-describedby");
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
    if (slipCol) slipCol.classList.add("show");
    done.focus();
  });
})();
