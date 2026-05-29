(function () {
  "use strict";

  const cfg = window.MUSICALION_CONFIG || {};
  const introText = "Hay algo que quería preguntarte.";
  const transitionText = "Entonces quiero enseñarte algo.";

  const timings = {
    introToQuestionMs: 5400,
    pauseBeforeRestartMs: 450,
    ...(cfg.autoTimings || {}),
  };

  const els = {
    bgImage: document.getElementById("bgImage"),
    screenIntro: document.getElementById("screenIntro"),
    screenQuestion: document.getElementById("screenQuestion"),
    screenNo: document.getElementById("screenNo"),
    screenTransition: document.getElementById("screenTransition"),
    screenMemories: document.getElementById("screenMemories"),
    memSlides: document.getElementById("memSlides"),
    ytMusicBg: document.getElementById("ytMusicBg"),
    introLine1: document.getElementById("introLine1"),
    btnYes: document.getElementById("btnYes"),
    btnNo: document.getElementById("btnNo"),
    btnNoBack: document.getElementById("btnNoBack"),
    transitionLine: document.getElementById("transitionLine"),
  };

  let memoryFlowTimer = null;
  /** @type {ReturnType<typeof setTimeout>[]} */
  let galleryTimeouts = [];
  let introT1 = null;
  let introT2 = null;

  let slideIndex = 0;

  /** @type {string[]} */
  let mediaImageUrls = [];

  function getYoutubeVideoId() {
    const raw = String(cfg.youtubeBackground || "").trim();
    if (!raw) return "62WV4tFEh0Q";
    const m = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    return "62WV4tFEh0Q";
  }

  function buildYoutubeEmbedSrc() {
    const id = getYoutubeVideoId();
    const u = new URL(`https://www.youtube.com/embed/${id}`);
    u.searchParams.set("autoplay", "1");
    /* Sin loop: al terminar la canción el audio se queda al final (no vuelve al inicio). */
    u.searchParams.set("controls", "0");
    u.searchParams.set("playsinline", "1");
    u.searchParams.set("modestbranding", "1");
    u.searchParams.set("rel", "0");
    u.searchParams.set("enablejsapi", "1");
    try {
      const o = window.location.origin;
      if (o && o !== "null") u.searchParams.set("origin", o);
    } catch (_) {
      /* vacío */
    }
    return u.toString();
  }

  function ytCommand(func, args) {
    const iframe = els.ytMusicBg;
    if (!iframe?.contentWindow) return;
    const src = iframe.getAttribute("src") || "";
    if (!src || src === "about:blank") return;
    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func, args: args || [] }),
        "*"
      );
    } catch (_) {
      /* vacío */
    }
  }

  /** Tras el gesto “Sí”, arranca la canción en bucle (iframe oculto). */
  function startYoutubeBackground() {
    const iframe = els.ytMusicBg;
    if (!iframe) return;
    iframe.addEventListener(
      "load",
      function onYtLoad() {
        iframe.removeEventListener("load", onYtLoad);
        ytCommand("unMute");
        ytCommand("setVolume", [100]);
      },
      { once: true }
    );
    iframe.src = buildYoutubeEmbedSrc();
  }

  function stopYoutubeBackground() {
    const iframe = els.ytMusicBg;
    if (!iframe) return;
    iframe.src = "about:blank";
    iframe.removeAttribute("src");
  }

  function resolveMediaUrl(path) {
    if (!path || /^https?:\/\//i.test(path) || /^data:/i.test(path)) {
      return path;
    }
    return path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  function clearIntroTimers() {
    if (introT1) {
      clearTimeout(introT1);
      introT1 = null;
    }
    if (introT2) {
      clearTimeout(introT2);
      introT2 = null;
    }
  }

  function clearGalleryTimers() {
    if (memoryFlowTimer) {
      clearTimeout(memoryFlowTimer);
      memoryFlowTimer = null;
    }
    galleryTimeouts.forEach((id) => clearTimeout(id));
    galleryTimeouts = [];
  }

  function showScreen(screenEl) {
    document.querySelectorAll(".screen").forEach((s) => {
      s.classList.remove("is-active");
      s.hidden = true;
    });
    screenEl.hidden = false;
    requestAnimationFrame(() => {
      screenEl.classList.add("is-active");
    });
  }

  function setBackgroundImage() {
    const primary = cfg.backgroundImage;
    const fallback = cfg.backgroundFallback;
    const primaryUrl = primary ? resolveMediaUrl(primary) : "";
    const fallbackUrl = fallback ? resolveMediaUrl(fallback) : "";
    const img = new Image();
    img.onload = () => {
      els.bgImage.style.backgroundImage = `url("${primaryUrl}")`;
    };
    img.onerror = () => {
      if (fallbackUrl) {
        els.bgImage.style.backgroundImage = `url("${fallbackUrl}")`;
      }
    };
    if (primaryUrl) img.src = primaryUrl;
    else if (fallbackUrl) img.src = fallbackUrl;
  }

  function collectImageUrls() {
    const urls = [...mediaImageUrls];
    const bg = cfg.backgroundImage;
    const fb = cfg.backgroundFallback;
    if (bg) urls.push(bg);
    if (fb) urls.push(fb);
    return [...new Set(urls)];
  }

  function preloadUrls(urls) {
    return Promise.all(
      urls.map(
        (u) =>
          new Promise((resolve) => {
            const im = new Image();
            im.onload = im.onerror = () => resolve();
            im.src = resolveMediaUrl(u);
          })
      )
    );
  }

  async function loadMediaManifest() {
    mediaImageUrls = [];
    try {
      const res = await fetch("js/media-manifest.json", { cache: "no-store" });
      if (!res.ok) throw new Error("manifest");
      const data = await res.json();
      mediaImageUrls = (data.images || []).filter(Boolean);
    } catch {
      /* vacío */
    }
    if (mediaImageUrls.length === 0) {
      const memories = cfg.memories || [];
      memories.forEach((m) => {
        (m.slides || []).forEach((u) => mediaImageUrls.push(u));
      });
      mediaImageUrls = [...new Set(mediaImageUrls)];
    }
  }

  function runIntro() {
    clearIntroTimers();
    els.introLine1.textContent = introText;
    els.introLine1.classList.remove("is-visible");
    showScreen(els.screenIntro);
    introT1 = setTimeout(() => {
      els.introLine1.classList.add("is-visible");
    }, 600);
    introT2 = setTimeout(() => {
      showScreen(els.screenQuestion);
    }, timings.introToQuestionMs);
  }

  function runTransitionToMemories() {
    showScreen(els.screenTransition);
    els.screenTransition.classList.remove("is-blackout");
    els.transitionLine.textContent = transitionText;
    els.transitionLine.classList.remove("is-visible");
    requestAnimationFrame(() => {
      els.transitionLine.classList.add("is-visible");
    });
    setTimeout(() => {
      els.screenTransition.classList.add("is-blackout");
    }, 2800);
    setTimeout(() => {
      startMemories();
    }, 5200);
  }

  function buildAutoplaySlides() {
    els.memSlides.innerHTML = "";
    mediaImageUrls.forEach((url, i) => {
      const wrap = document.createElement("div");
      wrap.className = "mem-slide" + (i === 0 ? " is-active" : "");
      const img = document.createElement("img");
      img.src = resolveMediaUrl(url);
      img.alt = "";
      img.decoding = "async";
      img.loading = i < 2 ? "eager" : "lazy";
      wrap.appendChild(img);
      els.memSlides.appendChild(wrap);
    });
    slideIndex = 0;
  }

  function updateActiveSlide() {
    const slides = els.memSlides.querySelectorAll(".mem-slide");
    slides.forEach((s, i) => {
      s.classList.toggle("is-active", i === slideIndex);
    });
  }

  function scheduleRestartFromBeginning() {
    memoryFlowTimer = setTimeout(() => {
      memoryFlowTimer = null;
      restartToBeginning();
    }, timings.pauseBeforeRestartMs);
  }

  function restartToBeginning() {
    clearGalleryTimers();
    clearIntroTimers();
    /* No tocar YouTube: la música sigue o queda donde acabó el tema. */
    els.btnYes.classList.remove("is-selected");
    els.btnNo.classList.remove("is-selected");
    els.screenTransition.classList.remove("is-blackout");
    els.memSlides.innerHTML = "";
    runIntro();
  }

  /**
   * Cada foto i (0…n-1) aparece en [ songMs·i/n , songMs·(i+1)/n ) → recorrido total = songMs (p. ej. 3:58).
   */
  function startAutoplayThroughGallery() {
    const slides = els.memSlides.querySelectorAll(".mem-slide");
    const n = slides.length;
    const songMs =
      typeof cfg.gallerySongDurationMs === "number" && cfg.gallerySongDurationMs > 0
        ? cfg.gallerySongDurationMs
        : (3 * 60 + 58) * 1000;

    if (!n) {
      memoryFlowTimer = setTimeout(() => endAfterGalleryEmpty(), 800);
      return;
    }

    slideIndex = 0;
    updateActiveSlide();

    if (n === 1) {
      galleryTimeouts.push(
        setTimeout(() => {
          scheduleRestartFromBeginning();
        }, songMs)
      );
      return;
    }

    for (let i = 1; i < n; i++) {
      const t = (songMs * i) / n;
      galleryTimeouts.push(
        setTimeout(() => {
          slideIndex = i;
          updateActiveSlide();
        }, t)
      );
    }

    galleryTimeouts.push(
      setTimeout(() => {
        scheduleRestartFromBeginning();
      }, songMs)
    );
  }

  async function startMemories() {
    await loadMediaManifest();
    clearGalleryTimers();
    showScreen(els.screenMemories);

    if (!mediaImageUrls.length) {
      endAfterGalleryEmpty();
      return;
    }

    buildAutoplaySlides();
    startAutoplayThroughGallery();
  }

  function endAfterGalleryEmpty() {
    clearGalleryTimers();
    stopYoutubeBackground();
    showScreen(els.screenQuestion);
  }

  function bind() {
    els.btnYes.addEventListener("click", () => {
      startYoutubeBackground();
      els.btnYes.classList.add("is-selected");
      els.btnNo.classList.remove("is-selected");
      runTransitionToMemories();
    });

    els.btnNo.addEventListener("click", () => {
      els.btnNo.classList.add("is-selected");
      els.btnYes.classList.remove("is-selected");
      showScreen(els.screenNo);
    });

    els.btnNoBack.addEventListener("click", () => {
      els.btnNo.classList.remove("is-selected");
      els.btnYes.classList.remove("is-selected");
      showScreen(els.screenQuestion);
    });
  }

  async function init() {
    setBackgroundImage();
    await loadMediaManifest();
    preloadUrls(collectImageUrls()).finally(() => {
      runIntro();
    });
    bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
