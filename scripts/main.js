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
  
    // --- copy buttons
    const copyBtns = $$(".copy-btn");
    copyBtns.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const text = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add("copied");
          const icon = btn.querySelector(".copy-icon");
          if (icon.tagName === "IMG") {
            icon.style.display = "none";
          } else {
            icon.textContent = "✓";
          }
          setTimeout(() => {
            btn.classList.remove("copied");
            if (icon.tagName === "IMG") {
              icon.style.display = "";
            } else {
              icon.textContent = "📋";
            }
          }, 1500);
        } catch (err) {
          alert(`Copy failed. Text: ${text}`);
        }
      });
    });
  
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
      const messageTextarea = contactForm.querySelector("textarea[name='message']");
      const charCounter = $("#charCount");
      
      // Character counter update
      if (messageTextarea && charCounter) {
        messageTextarea.addEventListener("input", () => {
          charCounter.textContent = messageTextarea.value.length;
        });
      }
      
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formHint = $("#formHint");
        
        const formData = Object.fromEntries(new FormData(e.currentTarget).entries());
        const { name, email, message } = formData;
        
        // Prepare email data
        const emailData = {
          to: "egginquiries@proton.me",
          subject: `Message from: ${name}`,
          body: `Email: ${email}\n\nMessage:\n${message}`
        };
        
        // Store locally for demo
        localStorage.setItem("portfolio_last_message", JSON.stringify(emailData));
        
        // Generate mailto link as a fallback
        const mailtoLink = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        
        if (formHint) {
          formHint.textContent = "✓ Message prepared! Click below to open your email client or copy the details to send manually.";
          formHint.classList.add("show");
          
          // Add a link to open email client
          const link = document.createElement("a");
          link.href = mailtoLink;
          link.textContent = "Open Email Client";
          link.style.marginTop = "8px";
          link.style.display = "inline-block";
          link.style.color = "var(--accent)";
          link.style.textDecoration = "underline";
        }
        
        e.currentTarget.reset();
        charCounter.textContent = "0";
        
        // Hide hint after 8 seconds
        setTimeout(() => {
          if (formHint) {
            formHint.classList.remove("show");
          }
        }, 8000);
      });
    }
    
    // --- smooth scroll with offset for section anchors
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#']");
      if (link) {
        const href = link.getAttribute("href");
        const target = document.querySelector(href);
        if (target && target.id) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 100; // 100px offset from top
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth"
          });
        }
      }
    });

    // --- devlog grid system
    const devlogSearch = $("#devlogSearch");
    const devlogGrid = $("#devlogGrid");
    const devlogItems = $$(".devlog-item");
    const filterBtns = $$(".filter-btn");
    const devlogExpanded = $("#devlogExpanded");
    const devlogBackBtn = $(".devlog-back-btn");
    const devlogPlayer = $("#devlogPlayer");
    const devlogTitle = $("#devlogTitle");
    const devlogLoadMore = $("#devlogLoadMore");

    let activeFilter = "all";
    let itemsPerLoad = 8;
    let totalItems = devlogItems.length;

    // Fetch YouTube video titles
    async function fetchYouTubeTitle(videoId) {
      try {
        // Using noembed.com API (no API key needed)
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        return data.title || null;
      } catch (error) {
        console.log("Could not fetch YouTube title:", error);
        return null;
      }
    }

    // Initialize video titles from YouTube
    devlogItems.forEach(async (item) => {
      const videoId = item.dataset.video;
      const titleElement = item.querySelector("h4");
      const currentTitle = item.dataset.title;
      
      const youtubeTitle = await fetchYouTubeTitle(videoId);
      if (youtubeTitle) {
        item.dataset.title = youtubeTitle;
        titleElement.textContent = youtubeTitle;
      }
    });

    function filterDevlogs(searchQuery = "", filterType = "all") {
      let visibleCount = 0;
      const query = (searchQuery || "").trim().toLowerCase();

      devlogItems.forEach((item) => {
        const title = (item.dataset.title || "").toLowerCase();
        const filter = item.dataset.filter || "";
        
        const matchesSearch = query === "" || title.includes(query);
        const matchesFilter = filterType === "all" || filter === filterType;
        const show = matchesSearch && matchesFilter;
        
        item.classList.toggle("hidden", !show);
        if (show) visibleCount++;
      });

      // Show/hide load more button
      devlogLoadMore.style.display = visibleCount < totalItems ? "block" : "none";
    }

    // Search functionality
    if (devlogSearch) {
      devlogSearch.addEventListener("input", (e) => {
        filterDevlogs(e.target.value, activeFilter);
      });
    }

    // Filter buttons
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.dataset.filter;
        filterDevlogs(devlogSearch?.value || "", activeFilter);
      });
    });
    // Devlog item click to expand
    devlogItems.forEach((item) => {
      item.addEventListener("click", async () => {
        const videoId = item.dataset.video;
        const title = item.dataset.title;
        
        devlogPlayer.src = `https://www.youtube.com/embed/${videoId}`;
        devlogTitle.textContent = title;
        devlogExpanded.setAttribute("aria-hidden", "false");
      });
    });

    // Back button to close expanded view
    if (devlogBackBtn) {
      devlogBackBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        devlogExpanded.setAttribute("aria-hidden", "true");
        devlogPlayer.src = "";
      });
    }

    // Close expanded view when clicking on the card background
    if (devlogExpanded) {
      devlogExpanded.addEventListener("click", (e) => {
        if (e.target === devlogExpanded) {
          devlogExpanded.setAttribute("aria-hidden", "true");
          devlogPlayer.src = "";
        }
      });
    }

    // Load more functionality
    if (devlogLoadMore) {
      devlogLoadMore.addEventListener("click", () => {
        itemsPerLoad += 4;
        // In a real app, this would load more items from a server
        // For now, we'll just show all items
        filterDevlogs(devlogSearch?.value || "", activeFilter);
      });
    }

    // --- FAQ: Add Q: and A: prefixes
    const faqQuestions = $$(".question");
    const faqAnswers = $$(".answer");
    
    faqQuestions.forEach(q => {
      if (!q.textContent.trim().startsWith("Q:")) {
        q.textContent = "Q: " + q.textContent;
      }
    });
    
    faqAnswers.forEach(a => {
      if (!a.textContent.trim().startsWith("A:")) {
        a.textContent = "A: " + a.textContent;
      }
    });
  
  })();
  
