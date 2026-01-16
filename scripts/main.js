(() => {
    const root = document.documentElement;
  
    // --- helpers
    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
  
    // --- footer year + name sync
    $("#year").textContent = String(new Date().getFullYear());
    $("#footerName").textContent = $("#devName").textContent;

    // --- hamburger menu
    const hamburgerBtn = $("#hamburgerBtn");
    const mobileNav = $("#mobileNav");
    const mobileNavLinks = $$(".mobile-nav a");

    if (hamburgerBtn && mobileNav) {
      hamburgerBtn.addEventListener("click", () => {
        const isOpen = hamburgerBtn.classList.contains("open");
        hamburgerBtn.classList.toggle("open");
        mobileNav.classList.toggle("open");
        hamburgerBtn.setAttribute("aria-expanded", !isOpen);
      });

      // Close menu when a link is clicked
      mobileNavLinks.forEach(link => {
        link.addEventListener("click", () => {
          hamburgerBtn.classList.remove("open");
          mobileNav.classList.remove("open");
          hamburgerBtn.setAttribute("aria-expanded", "false");
        });
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!hamburgerBtn.contains(e.target) && !mobileNav.contains(e.target)) {
          hamburgerBtn.classList.remove("open");
          mobileNav.classList.remove("open");
          hamburgerBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  
    // --- theme (persist)
    const THEME_KEY = "portfolio_theme";
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") root.dataset.theme = saved;

    // --- update theme-aware images
    function updateThemeImages() {
      const theme = root.dataset.theme || "dark";
      const themeImages = $$(".theme-image");
      themeImages.forEach(img => {
        const lightSrc = img.dataset.light;
        const darkSrc = img.dataset.dark;
        if (theme === "light" && lightSrc) {
          img.src = lightSrc;
        } else if (theme === "dark" && darkSrc) {
          img.src = darkSrc;
        }
      });
    }

    // Update images on initial load
    updateThemeImages();

    $("#themeBtn").addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
      updateThemeImages();
    });
  
    // --- IndieDave capital letters styling
    const heroName = $(".hero-name");
    if (heroName) {
      const text = heroName.textContent;
      const processedHTML = text.split('').map(char => {
        if (char === char.toUpperCase() && char !== char.toLowerCase()) {
          return `<span class="hero-capital">${char}</span>`;
        }
        return `<span>${char}</span>`;
      }).join('');
      heroName.innerHTML = processedHTML;
    }
  
    // --- copy email
    const copyEmailBtn = $("#copyEmailBtn");
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener("click", async (e) => {
        const btn = e.currentTarget;
        const email = btn.dataset.email || "you@example.com";
        try {
          await navigator.clipboard.writeText(email);
          const old = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = old), 900);
        } catch {
          alert(`Copy failed. Email: ${email}`);
        }
      });
    }
  
    // --- project filter
    // --- project filter
    const filterDropdownBtn = document.querySelector(".filter-dropdown-btn");
    const filterDropdownMenu = document.querySelector(".filter-dropdown-menu");
    const filterCheckboxes = $$(".filter-checkbox");
    const projects = $$(".project");
    const projectSearch = $("#projectSearch");
    let activeFilters = [];
  
    // Dropdown toggle
    if (filterDropdownBtn && filterDropdownMenu) {
      filterDropdownBtn.addEventListener("click", () => {
        filterDropdownBtn.classList.toggle("open");
        filterDropdownMenu.classList.toggle("open");
      });
      
      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!filterDropdownBtn.contains(e.target) && !filterDropdownMenu.contains(e.target)) {
          filterDropdownBtn.classList.remove("open");
          filterDropdownMenu.classList.remove("open");
        }
      });
    }
  
    function applyFilter(query) {
      const safeQuery = (query || "").trim().toLowerCase();
      let visibleCount = 0;
      
      projects.forEach(p => {
        const tags = (p.dataset.tags || "").split(/\s+/).filter(Boolean);
        const button = $(".project-btn", p);
        const haystack = [
          button?.dataset.title,
          button?.dataset.desc,
          button?.dataset.tags
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        
        // If no filters are checked, show all (only filter by search)
        let matchesFilters = activeFilters.length === 0;
        
        // If filters are checked, project must have ALL selected filter tags
        if (activeFilters.length > 0) {
          matchesFilters = activeFilters.every(filter => tags.includes(filter));
        }
        
        const matchesQuery = safeQuery ? haystack.includes(safeQuery) : true;
        const show = matchesFilters && matchesQuery;
        p.style.display = show ? "" : "none";
        
        if (show) visibleCount++;
      });
      
      // Show/hide no projects found message
      const noProjectsCard = $("#noProjectsFound");
      if (noProjectsCard) {
        noProjectsCard.classList.toggle("show", visibleCount === 0);
      }
    }
  
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener("change", () => {
        activeFilters = $$(".filter-checkbox:checked").map(cb => cb.dataset.filter);
        applyFilter(projectSearch.value);
      });
    });

    projectSearch.addEventListener("input", (e) => {
      applyFilter(e.currentTarget.value);
    });
    $$(".project-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const cardFlip = btn.closest(".project-card-flip");
        if (cardFlip) {
          cardFlip.classList.toggle("flipped");
        }
      });
    });
    
    // Allow flipping back by clicking on the back side
    $$(".project-card-back").forEach(back => {
      back.addEventListener("click", (e) => {
        const cardFlip = back.closest(".project-card-flip");
        if (cardFlip) {
          cardFlip.classList.toggle("flipped");
        }
      });
    });

    projectSearch.addEventListener("input", (e) => {
      applyFilter(activeFilter, e.currentTarget.value);
    });
  
    // --- modal
    const modal = $("#modal");
    if (modal) {
      const modalTitle = $("#modalTitle");
      const modalTags = $("#modalTags");
      const modalDesc = $("#modalDesc");
      const modalBullets = $("#modalBullets");
      const modalLinks = $("#modalLinks");
  
    function openModal(data) {
      modalTitle.textContent = data.title || "Project";
      modalTags.textContent = data.tags || "";
      modalDesc.textContent = data.desc || "";
  
      modalBullets.innerHTML = "";
      (data.bullets || []).forEach(b => {
        const li = document.createElement("li");
        li.textContent = b;
        modalBullets.appendChild(li);
      });
  
      modalLinks.innerHTML = "";
      (data.links || []).forEach(([label, href]) => {
        const a = document.createElement("a");
        a.className = "btn";
        a.textContent = label;
        a.href = href || "#";
        a.target = "_blank";
        a.rel = "noreferrer";
        modalLinks.appendChild(a);
      });
  
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
  
      function closeModal() {
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
  
      // close modal actions
      modal.addEventListener("click", (e) => {
        const t = e.target;
        if (t && t.dataset && t.dataset.close === "true") closeModal();
      });
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
      });
    }
  
    // --- contact form demo
    const contactForm = $("#contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formHint = $("#formHint");
        if (formHint) formHint.textContent = "Saved locally (demo). Hook this to a backend to actually send.";
        const data = Object.fromEntries(new FormData(e.currentTarget).entries());
        localStorage.setItem("portfolio_last_message", JSON.stringify(data));
        e.currentTarget.reset();
      });
    }
  
  })();
  
