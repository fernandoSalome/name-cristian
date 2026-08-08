(function () {
  "use strict";

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

    updatePreviewSlide();
  });

  // ---- carrossel do preview do livro ----
  var previewCard = document.querySelector(".preview-text");
  var prevBtn = document.querySelector(".carousel-prev");
  var nextBtn = document.querySelector(".carousel-next");
  var slideIndex = 0;

  function previewSlides(name) {
    return [
      "Era uma vez uma criança muito especial, chamada " + name + ". Este livro é sobre uma descoberta incrível que " + name + " fez... Uma descoberta que mudou tudo!",
      name + " abre os olhos e vê seu próprio nome brilhando na primeira página, ao lado da estrela que guiou os pastores até Jesus.",
      "Assim como os discípulos, " + name + " aprende que coragem e fé andam juntas — em cada página, um novo passo da jornada.",
    ];
  }

  function updatePreviewSlide() {
    if (!previewCard) return;
    var name = sessionStorage.getItem("childName") || "Nome";
    var slides = previewSlides(name);
    previewCard.textContent = slides[slideIndex % slides.length];
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

  // ---- CTAs de compra: tracking + rolar até o preço ----
  document.querySelectorAll(".btn-cta").forEach(function (btn) {
    btn.addEventListener("click", function () {
      track("/api/track-click");
      var target = document.querySelector(".price-block") || document.querySelector(".final-price-card");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // ---- contador regressivo (visual) ----
  var countdownEl = document.getElementById("countdown");
  if (countdownEl) {
    var remaining = 24 * 60 * 60; // 24h em segundos
    setInterval(function () {
      remaining = remaining > 0 ? remaining - 1 : 24 * 60 * 60;
      var h = String(Math.floor(remaining / 3600)).padStart(2, "0");
      var m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
      var s = String(remaining % 60).padStart(2, "0");
      countdownEl.textContent = h + ":" + m + ":" + s;
    }, 1000);
  }
})();
