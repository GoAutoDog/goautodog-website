// GoAutoDog — small enhancements only. The page works without JavaScript.
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () {
      setOpen(nav.getAttribute("data-open") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* ---------- Inventory filter ---------- */
  var cars = Array.prototype.slice.call(document.querySelectorAll(".car"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-filter]"));
  var empty = document.getElementById("empty-state");

  function countFor(status) {
    return cars.filter(function (c) { return status === "all" || c.dataset.status === status; }).length;
  }
  document.querySelectorAll("[data-count]").forEach(function (el) {
    el.textContent = countFor(el.getAttribute("data-count"));
  });

  function applyFilter(status) {
    var shown = 0;
    cars.forEach(function (c) {
      var match = status === "all" || c.dataset.status === status;
      c.hidden = !match;
      if (match) shown++;
    });
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.filter === status ? "true" : "false");
    });
    if (empty) empty.hidden = shown > 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { applyFilter(chip.dataset.filter); });
  });

  /* ---------- Photo galleries on cards ---------- */
  document.querySelectorAll("[data-gallery]").forEach(function (gallery) {
    var pics = Array.prototype.slice.call(gallery.querySelectorAll("picture"));
    var btn = gallery.querySelector(".photo-next");
    var count = gallery.querySelector("[data-photo-count]");
    if (!btn) return;
    if (pics.length < 2) { btn.hidden = true; return; }
    var i = 0;
    btn.addEventListener("click", function () {
      pics[i].hidden = true;
      i = (i + 1) % pics.length;
      pics[i].hidden = false;
      count.textContent = (i + 1) + " / " + pics.length;
    });
  });

  /* ---------- Ask about this car ---------- */
  var dialog = document.getElementById("ask-dialog");
  var title = document.getElementById("ask-title");
  var text = document.getElementById("ask-text");
  var sms = document.getElementById("ask-sms");
  var email = document.getElementById("ask-email");
  var copyBtn = document.getElementById("ask-copy");
  var copyStatus = document.getElementById("copy-status");
  var PHONE = "+19132088417";
  var EMAIL = "woof@goautodog.com";

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function updateLinks() {
    var body = encodeURIComponent(text.value);
    sms.href = "sms:" + PHONE + "?&body=" + body;
    email.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(title.textContent) + "&body=" + body;
  }

  function openAsk(car) {
    var name = car.dataset.name;
    var price = car.dataset.price;
    var status = car.dataset.status;
    title.textContent = name;
    if (status === "recon") {
      text.value = "Hi GoAutoDog, I'm interested in the " + name + (price ? " (" + money(price) + ")" : "") + " you're reconditioning. Can you let me know when it's ready?";
    } else {
      text.value = "Hi GoAutoDog, I'm interested in the " + name + (price ? " (" + money(price) + ")" : "") + ". Is it still available, and could I see the work summary?";
    }
    copyStatus.textContent = "";
    updateLinks();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      window.location.href = sms.href;
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-ask]");
    if (btn) openAsk(btn.closest(".car"));
  });

  if (text) text.addEventListener("input", updateLinks);

  if (dialog) {
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var done = function () { copyStatus.textContent = "Copied. Paste it into a text to 913-208-8417."; };
      var fallback = function () {
        text.focus();
        text.select();
        copyStatus.textContent = "Message selected. Press Ctrl+C (or ⌘C) to copy.";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text.value).then(done, fallback);
      } else {
        fallback();
      }
    });
  }
})();
