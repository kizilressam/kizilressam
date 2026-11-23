(() => {
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeIconEl = document.getElementById("theme-icon");
  const themeLabelEl = document.getElementById("theme-label");

  const introOverlay = document.getElementById("intro-overlay");
  const introTitle = document.getElementById("intro-title");
  const introSkipBtn = document.getElementById("intro-skip");
  const replayIntroBtn = document.getElementById("replay-intro-btn");

  const siteTitleEl = document.getElementById("site-title");
  const footerCopyEl = document.getElementById("footer-copy");
  const socialLinksEl = document.getElementById("social-links");
  const aboutBtn = document.getElementById("about-btn");
  const aboutModal = document.getElementById("about-modal");
  const aboutHeading = document.getElementById("about-heading");
  const aboutContent = document.getElementById("about-content");
  const aboutClose = document.getElementById("about-close");

  const filterBar = document.getElementById("filter-bar");
  const galleryGrid = document.getElementById("gallery-grid");
  const emptyState = document.getElementById("empty-state");

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCategory = document.getElementById("lightbox-category");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxMeta = document.getElementById("lightbox-meta");
  const lightboxStory = document.getElementById("lightbox-story");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  let allArtworks = [];
  let filteredArtworks = [];
  let activeCategory = "Tümü";
  let currentLightboxIndex = 0;
  let introTimer = null;

  // ---------------- Tema Yönetimi ----------------
  const sunSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
  const moonSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function applyTheme(theme) {
    htmlEl.setAttribute("data-theme", theme);
    localStorage.setItem("kizilressam-theme", theme);
    if (theme === "dark") {
      themeIconEl.innerHTML = sunSvg;
      themeLabelEl.textContent = "Işıkları Aç";
    } else {
      themeIconEl.innerHTML = moonSvg;
      themeLabelEl.textContent = "Işıkları Kapat";
    }
  }

  const savedTheme = localStorage.getItem("kizilressam-theme") || "light";
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = htmlEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  // ---------------- Açılış Çizim Animasyonu ----------------
  function playIntro() {
    clearTimeout(introTimer);
    introOverlay.classList.remove("is-done", "is-playing");
    void introOverlay.offsetWidth; // Animasyonu sıfırla
    introOverlay.classList.add("is-playing");
    introTimer = setTimeout(closeIntro, 2500);
  }

  function closeIntro() {
    clearTimeout(introTimer);
    introOverlay.classList.add("is-done");
  }

  introSkipBtn.addEventListener("click", closeIntro);
  introOverlay.addEventListener("click", (e) => {
    if (e.target === introOverlay) closeIntro();
  });
  replayIntroBtn.addEventListener("click", playIntro);

  // ---------------- Yardımcı Fonksiyonlar ----------------
  function resolveImagePath(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return path.replace(/^\//, "");
  }

  function cleanText(val) {
    return typeof val === "string" ? val.trim() : "";
  }

  // ---------------- Site Ayarlarını Yükle ----------------
  async function loadSiteConfig() {
    try {
      const res = await fetch(`data/site.json?t=${Date.now()}`);
      if (!res.ok) throw new Error("Site config yüklenemedi");
      const site = await res.json();

      const title = cleanText(site.siteTitle) || "Kızıl Ressam — Gülşen";
      document.title = title;
      siteTitleEl.textContent = title;
      introTitle.textContent = title;
      aboutHeading.textContent = title;
      footerCopyEl.textContent = `© ${new Date().getFullYear()} ${title}`;

      if (site.enableIntro !== false) {
        replayIntroBtn.classList.remove("hidden");
        playIntro();
      } else {
        closeIntro();
      }

      // Hakkında (Sadece doluysa göster)
      const about = cleanText(site.aboutText);
      if (about) {
        aboutContent.textContent = about;
        aboutBtn.classList.remove("hidden");
      }

      // Sosyal medya ve iletişim (Sadece doluysa göster)
      const ig = cleanText(site.instagram).replace(/^@/, "");
      const mail = cleanText(site.email);
      socialLinksEl.innerHTML = "";

      if (ig) {
        const igHref = /^https?:\/\//i.test(ig) ? ig : `https://instagram.com/${ig}`;
        const a = document.createElement("a");
        a.className = "social-link";
        a.href = igHref;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg><span>Instagram</span>`;
        socialLinksEl.appendChild(a);
      }

      if (mail) {
        const a = document.createElement("a");
        a.className = "social-link";
        a.href = `mailto:${mail}`;
        a.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>E-posta</span>`;
        socialLinksEl.appendChild(a);
      }

      if (ig || mail) {
        socialLinksEl.classList.remove("hidden");
      }
    } catch (err) {
      closeIntro();
      console.warn(err);
    }
  }

  // ---------------- Eserleri Yükle & Çiz ----------------
  async function loadArtworks() {
    try {
      const res = await fetch(`data/artworks.json?t=${Date.now()}`);
      if (!res.ok) throw new Error("Eserler yüklenemedi");
      const data = await res.json();
      allArtworks = Array.isArray(data.items) ? data.items : [];

      renderCategories();
      renderGallery();
    } catch (err) {
      console.warn(err);
      emptyState.classList.remove("hidden");
    }
  }

  function renderCategories() {
    const categories = Array.from(
      new Set(allArtworks.map((item) => cleanText(item.category)).filter(Boolean))
    );

    if (categories.length === 0) {
      filterBar.classList.add("hidden");
      filterBar.innerHTML = "";
      return;
    }

    const list = ["Tümü", ...categories];
    filterBar.innerHTML = "";
    list.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `filter-btn${cat === activeCategory ? " is-active" : ""}`;
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderCategories();
        renderGallery();
      });
      filterBar.appendChild(btn);
    });
    filterBar.classList.remove("hidden");
  }

  function renderGallery() {
    filteredArtworks =
      activeCategory === "Tümü"
        ? allArtworks
        : allArtworks.filter((item) => cleanText(item.category) === activeCategory);

    galleryGrid.innerHTML = "";

    if (filteredArtworks.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    filteredArtworks.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "artwork-card";
      card.style.animationDelay = `${Math.min(index * 0.06, 0.45)}s`;
      card.tabIndex = 0;

      const frame = document.createElement("div");
      frame.className = "artwork-frame";

      const img = document.createElement("img");
      img.src = resolveImagePath(item.image);
      img.alt = cleanText(item.title) || "Sanat eseri";
      img.loading = "lazy";
      frame.appendChild(img);

      const caption = document.createElement("div");
      caption.className = "artwork-caption";

      const titleEl = document.createElement("h2");
      titleEl.className = "artwork-title";
      titleEl.textContent = cleanText(item.title) || "İsimsiz Eser";
      caption.appendChild(titleEl);

      const metaParts = [cleanText(item.technique), cleanText(item.year)].filter(Boolean);
      if (metaParts.length > 0) {
        const subEl = document.createElement("p");
        subEl.className = "artwork-sub";
        subEl.textContent = metaParts.join(" · ");
        caption.appendChild(subEl);
      }

      card.appendChild(frame);
      card.appendChild(caption);

      const openHandler = () => openLightbox(index);
      card.addEventListener("click", openHandler);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openHandler();
        }
      });

      galleryGrid.appendChild(card);
    });
  }

  // ---------------- Lightbox ----------------
  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    document.body.style.overflow = "";
  }

  function updateLightbox() {
    const item = filteredArtworks[currentLightboxIndex];
    if (!item) return;

    lightboxImg.src = resolveImagePath(item.image);
    lightboxImg.alt = cleanText(item.title) || "Sanat eseri";
    lightboxTitle.textContent = cleanText(item.title) || "İsimsiz Eser";

    const cat = cleanText(item.category);
    if (cat) {
      lightboxCategory.textContent = cat;
      lightboxCategory.classList.remove("hidden");
    } else {
      lightboxCategory.classList.add("hidden");
    }

    const metaParts = [cleanText(item.technique), cleanText(item.year)].filter(Boolean);
    if (metaParts.length > 0) {
      lightboxMeta.textContent = metaParts.join(" · ");
      lightboxMeta.classList.remove("hidden");
    } else {
      lightboxMeta.classList.add("hidden");
    }

    const story = cleanText(item.story);
    if (story) {
      lightboxStory.textContent = story;
      lightboxStory.classList.remove("hidden");
    } else {
      lightboxStory.classList.add("hidden");
    }

    const showNav = filteredArtworks.length > 1;
    lightboxPrev.classList.toggle("hidden", !showNav);
    lightboxNext.classList.toggle("hidden", !showNav);
  }

  function showPrev() {
    currentLightboxIndex =
      (currentLightboxIndex - 1 + filteredArtworks.length) % filteredArtworks.length;
    updateLightbox();
  }

  function showNext() {
    currentLightboxIndex = (currentLightboxIndex + 1) % filteredArtworks.length;
    updateLightbox();
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrev);
  lightboxNext.addEventListener("click", showNext);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Mobil kaydırma (swipe) desteği
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50 && filteredArtworks.length > 1) {
      if (diff > 0) showPrev();
      else showNext();
    }
  }, { passive: true });

  // ---------------- Hakkında Modalı ----------------
  aboutBtn.addEventListener("click", () => {
    aboutModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  function closeAbout() {
    aboutModal.classList.add("hidden");
    document.body.style.overflow = "";
  }

  aboutClose.addEventListener("click", closeAbout);
  aboutModal.addEventListener("click", (e) => {
    if (e.target === aboutModal) closeAbout();
  });

  // Klavye kısayolları
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("hidden")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    } else if (!aboutModal.classList.contains("hidden") && e.key === "Escape") {
      closeAbout();
    }
  });

  // Başlat
  loadSiteConfig();
  loadArtworks();
})();