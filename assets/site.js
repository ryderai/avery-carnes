(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".js-year").forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* nav shadow + scroll progress */
  var nav = document.getElementById("nav");
  var bar = document.querySelector(".progress");
  var onScroll = function(){
    nav.classList.toggle("scrolled", window.scrollY > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if(bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
  };
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* mobile menu: full screen, Esc closes + returns focus, focus trapped, scroll locked */
  var burger = document.querySelector(".burger");
  var links = document.getElementById("navlinks");
  function focusables(){ return [].slice.call(links.querySelectorAll("a")).concat([burger]); }
  function setMenu(open){
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("open", open);
    nav.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if(open){ var f = links.querySelector("a"); if(f) f.focus(); }
  }
  burger.addEventListener("click", function(){ setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  links.addEventListener("click", function(e){ if(e.target.closest("a") && burger.getAttribute("aria-expanded") === "true") setMenu(false); });
  document.addEventListener("keydown", function(e){
    var open = burger.getAttribute("aria-expanded") === "true";
    if(!open) return;
    if(e.key === "Escape"){ setMenu(false); burger.focus(); return; }
    if(e.key === "Tab"){
      var f = focusables(), first = f[0], last = f[f.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("resize", function(){ if(window.innerWidth > 1000 && links.classList.contains("open")) setMenu(false); });

  /* reveals */
  var candidates = document.querySelectorAll(
    ".commit .wrap > div > .lead, .commit__rule, .practice__head, .plist li, .partner, .why__item, .quote, .band__item, .foot__grid > div, .contact__info, .contact .form, section .eyebrow, section .h-lg, .icard, .steps__list li, .clock__item, .areas__grid li, .related__grid a"
  );
  candidates.forEach(function(el){
    if(getComputedStyle(el).position === "sticky") return;
    el.setAttribute("data-rv","");
  });
  var groups = new Map();
  document.querySelectorAll("[data-rv]").forEach(function(el){
    var p = el.parentElement;
    if(!groups.has(p)) groups.set(p, 0);
    var i = groups.get(p);
    if(i > 0) el.style.setProperty("--d", Math.min(i * 90, 450) + "ms");
    groups.set(p, i + 1);
  });
  if(!reduce && "IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    },{rootMargin:"0px 0px -7% 0px", threshold:0.01});
    document.querySelectorAll("[data-rv]").forEach(function(el){ io.observe(el); });
    var sweep = function(){
      document.querySelectorAll("[data-rv]:not(.in)").forEach(function(el){
        if(el.getBoundingClientRect().top < window.innerHeight * 0.98) el.classList.add("in");
      });
    };
    window.addEventListener("scroll", function(){ requestAnimationFrame(sweep); }, {passive:true});
    window.addEventListener("load", sweep);
    sweep();
  } else {
    document.querySelectorAll("[data-rv]").forEach(function(el){ el.classList.add("in"); });
  }

  /* hero parallax, desktop only */
  var para = document.querySelector("[data-para]");
  if(para && !reduce && window.matchMedia("(min-width: 901px)").matches){
    var ticking = false;
    var move = function(){
      var y = window.scrollY;
      if(y < window.innerHeight * 1.2) para.style.transform = "scale(1.06) translateY(" + (y * 0.06) + "px)";
      ticking = false;
    };
    window.addEventListener("scroll", function(){ if(!ticking){ requestAnimationFrame(move); ticking = true; } }, {passive:true});
  }

  /* case forms. PREVIEW: nothing is sent anywhere. At launch, set data-endpoint on the form. */
  document.querySelectorAll("form.js-caseform").forEach(function(form){
    var ok = form.querySelector(".form__ok");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var req = [].slice.call(form.querySelectorAll("[required]"));
      var missing = req.filter(function(f){ return !f.value.trim(); });
      req.forEach(function(f){ f.setAttribute("aria-invalid", missing.indexOf(f) > -1 ? "true" : "false"); });
      if(missing.length){ missing[0].focus(); return; }
      var endpoint = form.getAttribute("data-endpoint");
      if(!endpoint){
        ok.textContent = "This is a design preview, so this form is not connected yet and nothing was sent. To reach the firm now, call 404-602-0028.";
        ok.classList.add("show"); ok.focus();
        return;
      }
      var data = new FormData(form);
      fetch(endpoint, {method:"POST", body:data}).then(function(r){
        ok.textContent = r.ok ? "Thank you. An attorney will review this and contact you." : "Something went wrong. Please call 404-602-0028.";
        ok.classList.add("show"); ok.focus();
        if(r.ok) form.reset();
      }).catch(function(){ ok.textContent = "Something went wrong. Please call 404-602-0028."; ok.classList.add("show"); ok.focus(); });
    });
  });
})();
