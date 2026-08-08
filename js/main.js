(function () {
  "use strict";

  var HOTMART_CHECKOUT_URL = "https://pay.hotmart.com/N41933690F?off=8wcx3bxf&checkoutMode=10";

  // ---- visitor id (used by the tracking endpoints) ----
  function getVisitorId() {
    var id = localStorage.getItem("visitorId");
    if (!id) {
      id = "v_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("visitorId", id);
    }
    return id;
  }

  function track(endpoint, extra) {
    var payload = Object.assign(
      {
        id: getVisitorId(),
        referrer: document.referrer || null,
        landing_url: window.location.href,
      },
      extra || {}
    );
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(function () {
      /* tracking is best-effort; ignore failures (e.g. running locally without the API) */
    });
  }

  track("/api/track-view");

  // ---- tela 1 -> tela 2: captura e personalização do nome ----
  var screenName = document.getElementById("screen-name");
  var screenSales = document.getElementById("screen-sales");
  var nameForm = document.getElementById("name-form");
  var nameInput = document.getElementById("child-name-input");

  function capitalize(name) {
    return name
      .trim()
      .toLowerCase()
      .replace(/(^|\s)\p{L}/gu, function (c) { return c.toUpperCase(); });
  }

  nameForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var raw = nameInput.value.trim();
    if (!raw) return;

    var name = capitalize(raw);
    sessionStorage.setItem("childName", name);

    document.querySelectorAll("[data-name-slot]").forEach(function (el) {
      el.textContent = name;
    });
    document.querySelectorAll("[data-name-slot-upper]").forEach(function (el) {
      el.textContent = name.toUpperCase();
    });

    screenName.classList.add("hidden");
    screenSales.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    if (typeof fbq === "function") fbq("track", "PageView");

    updatePreviewSlide();
  });

  // ---- carrossel do preview do livro ----
  var previewCardEl = document.getElementById("preview-card");
  var previewText = document.querySelector(".preview-text");
  var prevBtn = document.querySelector(".carousel-prev");
  var nextBtn = document.querySelector(".carousel-next");
  var slideIndex = 0;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function previewSlides(name) {
    var n = "<strong>" + escapeHtml(name) + "</strong>";
    return [
      {
        bg: "/public/img-2.png",
        style: "slide-center",
        html: "C'era una volta un bambino molto speciale, di nome " + n + ". Questo libro parla di una scoperta incredibile che " + n + " ha fatto... Una scoperta che ha cambiato tutto!",
      },
      {
        bg: "/public/img-3.png",
        style: "slide-bubble",
        html: "Altre volte, quando un tuono faceva \"BUUUM!\", " + n + " sentiva un po' di paura dentro di sé. A chi poteva chiedere aiuto quando aveva paura?",
      },
      {
        bg: "/public/img-4.png",
        style: "slide-bubble",
        html: n + " chiese: \"Chi sei tu?\" La voce rispose: \"Sono Gesù. Ti amo più di tutte le stelle del cielo.\"",
      },
    ];
  }

  function updatePreviewSlide() {
    if (!previewText || !previewCardEl) return;
    var name = sessionStorage.getItem("childName") || "Nome";
    var slides = previewSlides(name);
    var slide = slides[slideIndex % slides.length];
    previewCardEl.style.backgroundImage = "url('" + slide.bg + "')";
    previewText.className = "preview-text " + slide.style;
    previewText.innerHTML = slide.html;
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", function () {
      slideIndex = (slideIndex - 1 + 3) % 3;
      updatePreviewSlide();
    });
    nextBtn.addEventListener("click", function () {
      slideIndex = (slideIndex + 1) % 3;
      updatePreviewSlide();
    });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".faq-item").classList.toggle("open");
    });
  });

  // ---- CTAs de compra: tracking + pixel + redireciona pro checkout da Hotmart ----
  document.querySelectorAll(".btn-cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      track("/api/track-click");
      if (typeof fbq === "function") fbq("track", "InitiateCheckout");
      window.location.href = HOTMART_CHECKOUT_URL;
    });
  });
})();
