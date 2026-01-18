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
    const filterRadios = $$(".filter-radio");
    const projects = $$(".project");
    const projectSearch = $("#projectSearch");
    const projectGrid = $("#projectGrid");
    const sortDropdownBtn = $("#sortDropdownBtn");
    const sortDropdownMenu = $("#sortDropdownMenu");
    const sortRadios = $$(".sort-radio");
    const activeFiltersContainer = $("#activeFiltersContainer");
    const priceMinInput = $("#priceMin");
    const priceMaxInput = $("#priceMax");
    const priceMinDisplay = $("#priceMinDisplay");
    const priceMaxDisplay = $("#priceMaxDisplay");
    const priceMinDisplayInline = $("#priceMinDisplayInline");
    const priceMaxDisplayInline = $("#priceMaxDisplayInline");
    const freeToPlayCheckbox = $("#freeToPlayCheckbox");
    let activeFilters = {}; // Object with category as key, filter value as value
    let currentSort = "popular";
    let priceRange = { min: 0, max: 20 };
    let freeToPlayOnly = false;
    
    // Store original order of projects (their index in the DOM)
    const originalProjectOrder = new Map();
    projects.forEach((project, index) => {
      originalProjectOrder.set(project, index);
    });

    // Mapping of categories to display names
    const categoryDisplayNames = {
      "type": "Type",
      "engine": "Engine",
      "platform": "Platform",
      "progress": "Progress"
    };

    // Mapping of filter values to display names
    const filterDisplayNames = {
      "game": "Game",
      "tool": "Tool",
      "website": "Website",
      "unity": "Unity",
      "phaser": "Phaser",
      "pc": "PC",
      "vr": "VR",
      "web": "Web",
      "released": "Released",
      "in-development": "In Development",
      "closed-alpha": "Closed Alpha",
      "open-beta": "Open Beta",
      "cancelled": "Cancelled"
    };
  
    // Filter dropdown toggle
    if (filterDropdownBtn && filterDropdownMenu) {
      filterDropdownBtn.addEventListener("click", () => {
        const isOpening = !filterDropdownBtn.classList.contains("open");
        filterDropdownBtn.classList.toggle("open");
        filterDropdownMenu.classList.toggle("open");
        
        // Close sort dropdown if opening filter dropdown
        if (isOpening && sortDropdownBtn && sortDropdownMenu) {
          sortDropdownBtn.classList.remove("open");
          sortDropdownMenu.classList.remove("open");
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!filterDropdownBtn.contains(e.target) && !filterDropdownMenu.contains(e.target)) {
          filterDropdownBtn.classList.remove("open");
          filterDropdownMenu.classList.remove("open");
        }
      });
    }

    // Sort dropdown toggle
    if (sortDropdownBtn && sortDropdownMenu) {
      sortDropdownBtn.addEventListener("click", () => {
        const isOpening = !sortDropdownBtn.classList.contains("open");
        sortDropdownBtn.classList.toggle("open");
        sortDropdownMenu.classList.toggle("open");
        
        // Close filter dropdown if opening sort dropdown
        if (isOpening && filterDropdownBtn && filterDropdownMenu) {
          filterDropdownBtn.classList.remove("open");
          filterDropdownMenu.classList.remove("open");
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (!sortDropdownBtn.contains(e.target) && !sortDropdownMenu.contains(e.target)) {
          sortDropdownBtn.classList.remove("open");
          sortDropdownMenu.classList.remove("open");
        }
      });
    }

    // Sort radio button change handler
    sortRadios.forEach(radio => {
      radio.addEventListener("change", () => {
        if (radio.checked) {
          currentSort = radio.value;
          applyFilter(projectSearch.value);
          updateActiveFiltersDisplay();
        }
      });
    });

    // Function to update active filters display
    function updateActiveFiltersDisplay() {
      if (!activeFiltersContainer) return;

      activeFiltersContainer.innerHTML = "";
      const chips = [];

      // Add category filter chips
      Object.keys(activeFilters).forEach(category => {
        const filterValue = activeFilters[category];
        const displayName = filterDisplayNames[filterValue] || filterValue;
        const categoryName = categoryDisplayNames[category] || category;
        chips.push({
          type: "category",
          category: category,
          value: filterValue,
          label: `${categoryName}: ${displayName}`
        });
      });

      // Add sort chip if not "popular" (default)
      if (currentSort !== "popular") {
        const sortLabel = currentSort === "recent" ? "Most Recently Updated" : currentSort;
        chips.push({
          type: "sort",
          value: currentSort,
          label: sortLabel
        });
      }

      // Add dorking filter chips from search query
      const query = projectSearch.value || "";
      const dorking = parseDorkingQuery(query.toLowerCase());
      
      if (dorking.type) {
        chips.push({
          type: "dorking",
          key: "Type",
          value: dorking.type,
          label: `Type: ${dorking.type.charAt(0).toUpperCase() + dorking.type.slice(1)}`
        });
      }
      if (dorking.engine) {
        chips.push({
          type: "dorking",
          key: "Engine",
          value: dorking.engine,
          label: `Engine: ${dorking.engine.charAt(0).toUpperCase() + dorking.engine.slice(1)}`
        });
      }
      if (dorking.platform) {
        chips.push({
          type: "dorking",
          key: "Platform",
          value: dorking.platform,
          label: `Platform: ${dorking.platform.toUpperCase()}`
        });
      }
      if (dorking.genre) {
        chips.push({
          type: "dorking",
          key: "Genre",
          value: dorking.genre,
          label: `Genre: ${dorking.genre.charAt(0).toUpperCase() + dorking.genre.slice(1)}`
        });
      }

      // Add price filter chips
      if (freeToPlayOnly) {
        chips.push({
          type: "price",
          subtype: "free",
          label: "Free To Play"
        });
      }
      
      if (priceRange.min > 0 || priceRange.max < 20) {
        chips.push({
          type: "price",
          subtype: "range",
          min: priceRange.min,
          max: priceRange.max,
          label: `Price: $${priceRange.min} - $${priceRange.max}`
        });
      }

      // Show/hide container based on whether there are chips
      if (chips.length === 0) {
        activeFiltersContainer.style.display = "none";
        return;
      }
      
      activeFiltersContainer.style.display = "flex";

      // Create and append chips
      chips.forEach(chip => {
        const chipElement = document.createElement("div");
        chipElement.className = "active-filter-chip";
        chipElement.innerHTML = `
          <span>${chip.label}</span>
          <button type="button" class="filter-chip-remove" aria-label="Remove ${chip.label}" data-chip-type="${chip.type}" data-chip-value="${chip.value || ''}" ${chip.category ? `data-chip-category="${chip.category}"` : ''} ${chip.key ? `data-chip-key="${chip.key}"` : ''} ${chip.subtype ? `data-chip-subtype="${chip.subtype}"` : ''}>×</button>
        `;
        activeFiltersContainer.appendChild(chipElement);
      });

      // Add click handlers to remove buttons
      $$(".filter-chip-remove", activeFiltersContainer).forEach(btn => {
        btn.addEventListener("click", () => {
          const chipType = btn.dataset.chipType;
          const chipValue = btn.dataset.chipValue;
          const chipKey = btn.dataset.chipKey;

          if (chipType === "category") {
            // Uncheck the corresponding radio button
            const category = btn.dataset.chipCategory;
            const radio = $(`.filter-radio[data-category="${category}"][data-filter="${chipValue}"]`);
            if (radio) {
              radio.checked = false;
              delete activeFilters[category];
              applyFilter(projectSearch.value);
              updateActiveFiltersDisplay();
            }
          } else if (chipType === "sort") {
            // Reset sort to "popular"
            const popularRadio = $(`.sort-radio[value="popular"]`);
            if (popularRadio) {
              popularRadio.checked = true;
              currentSort = "popular";
              applyFilter(projectSearch.value);
              updateActiveFiltersDisplay();
            }
          } else if (chipType === "dorking") {
            // Remove dorking from search query
            const currentQuery = projectSearch.value || "";
            // Match the dorking pattern with optional spaces before/after
            const dorkingPattern = new RegExp(`\\s*${chipKey.toLowerCase()}:${chipValue}\\s*`, "gi");
            let newQuery = currentQuery.replace(dorkingPattern, " ").trim();
            // Clean up multiple spaces
            newQuery = newQuery.replace(/\s+/g, " ").trim();
            projectSearch.value = newQuery;
            applyFilter(newQuery);
            updateActiveFiltersDisplay();
          } else if (chipType === "price") {
            const subtype = btn.dataset.chipSubtype;
            if (subtype === "free") {
              // Uncheck free-to-play checkbox
              if (freeToPlayCheckbox) {
                freeToPlayCheckbox.checked = false;
                freeToPlayOnly = false;
                applyFilter(projectSearch.value);
                updateActiveFiltersDisplay();
              }
            } else if (subtype === "range") {
              // Reset price range to default
              if (priceMinInput && priceMaxInput) {
                priceMinInput.value = 0;
                priceMaxInput.value = 20;
                priceRange = { min: 0, max: 20 };
                updatePriceDisplay();
                applyFilter(projectSearch.value);
                updateActiveFiltersDisplay();
              }
            }
          }
        });
      });
    }

    // Helper function to extract metadata from project card
    function getProjectMetadata(project) {
      const meta = $(".project-meta", project);
      if (!meta) return {};
      
      const metadata = {};
      const paragraphs = $$("p", meta);
      
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.startsWith("Type:")) {
          metadata.type = text.replace("Type:", "").trim().toLowerCase();
        } else if (text.startsWith("Genre:")) {
          metadata.genre = text.replace("Genre:", "").trim().toLowerCase();
        } else if (text.startsWith("Engine:")) {
          metadata.engine = text.replace("Engine:", "").trim().toLowerCase();
        } else if (text.startsWith("Platforms:")) {
          metadata.platforms = text.replace("Platforms:", "").trim().toLowerCase();
        } else if (text.startsWith("Last Updated:")) {
          metadata.lastUpdated = text.replace("Last Updated:", "").trim();
        }
      });
      
      return metadata;
    }

    // Helper function to extract price from project card
    function getProjectPrice(project) {
      // Check for data-price attribute first
      const priceAttr = project.dataset.price;
      if (priceAttr !== undefined) {
        const price = parseFloat(priceAttr);
        if (!isNaN(price)) {
          return { price, isFree: price === 0 };
        }
      }
      
      // Check pricetag element
      const pricetag = $(".pricetag", project);
      if (pricetag) {
        const priceText = pricetag.textContent.trim().toLowerCase();
        if (priceText.includes("free")) {
          return { price: 0, isFree: true };
        }
        // Try to extract number from text like "$5" or "5$"
        const priceMatch = priceText.match(/\$?\s*(\d+(?:\.\d+)?)/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          return { price, isFree: false };
        }
      }
      
      // Default to free if no price found
      return { price: 0, isFree: true };
    }

    // Helper function to parse date from DD.MM.YYYY format
    function parseDate(dateString) {
      if (!dateString) return new Date(1970, 0, 1); // January 1, 1970 as default
      
      const parts = dateString.split(".");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      
      return new Date(1970, 0, 1); // Default to January 1, 1970 if parsing fails
    }

    // Helper function to parse dorking syntax from query
    function parseDorkingQuery(query) {
      const dorking = {
        type: null,
        engine: null,
        platform: null,
        genre: null,
        sort: null,
        searchText: ""
      };

      // Match patterns like "Type:game", "Engine:unity", etc.
      // Using word boundary and allowing spaces/quotes for multi-word values
      const dorkingPatterns = [
        { pattern: /type:([^\s]+)/gi, key: 'type' },
        { pattern: /engine:([^\s]+)/gi, key: 'engine' },
        { pattern: /platform:([^\s]+)/gi, key: 'platform' },
        { pattern: /genre:([^\s]+)/gi, key: 'genre' },
        { pattern: /sort:([^\s]+)/gi, key: 'sort' }
      ];

      let remainingQuery = query;
      
      dorkingPatterns.forEach(({ pattern, key }) => {
        const matches = [...remainingQuery.matchAll(pattern)];
        if (matches.length > 0) {
          // Take the last match if multiple (most recent)
          const match = matches[matches.length - 1];
          dorking[key] = match[1].toLowerCase();
          // Remove this specific match from the query
          const beforeMatch = remainingQuery.substring(0, match.index);
          const afterMatch = remainingQuery.substring(match.index + match[0].length);
          remainingQuery = (beforeMatch + afterMatch).trim();
        }
      });

      dorking.searchText = remainingQuery;
      return dorking;
    }
  
    function applyFilter(query) {
      const safeQuery = (query || "").trim();
      const dorking = parseDorkingQuery(safeQuery.toLowerCase());
      let visibleCount = 0;
      
      // Get all projects with their metadata and dates
      const projectsWithData = projects.map(p => {
        const tags = (p.dataset.tags || "").split(/\s+/).filter(Boolean);
        const button = $(".project-btn", p);
        // Get title from h3 element in project-meta, fallback to data-title
        const meta = $(".project-meta", p);
        const titleElement = meta ? $("h3", meta) : null;
        const title = titleElement ? titleElement.textContent.trim() : (button?.dataset.title || "");
        const metadata = getProjectMetadata(p);
        const date = parseDate(metadata.lastUpdated);
        const priceInfo = getProjectPrice(p);
        
        return {
          element: p,
          tags,
          title,
          metadata,
          date,
          price: priceInfo.price,
          isFree: priceInfo.isFree,
          button
        };
      });

      // Filter projects
      const filteredProjects = projectsWithData.filter(({ tags, title, metadata, price, isFree, button }) => {
        // Apply category-based filters
        // Map categories to how they're stored in project data
        const categoryMappings = {
          "type": (value) => {
            // Type filters: game, tool, website
            return tags.includes(value);
          },
          "engine": (value) => {
            // Engine filters: unity, phaser
            return tags.includes(value) || metadata.engine === value;
          },
          "platform": (value) => {
            // Platform filters: pc, vr, web
            return tags.includes(value) || metadata.platforms?.includes(value);
          },
          "progress": (value) => {
            // Progress filters: released, in-development, etc.
            return tags.includes(value);
          }
        };

        // Check each active category filter
        for (const category in activeFilters) {
          const filterValue = activeFilters[category];
          const matches = categoryMappings[category] ? categoryMappings[category](filterValue) : tags.includes(filterValue);
          if (!matches) {
            return false;
          }
        }

        // Apply dorking filters
        if (dorking.type && metadata.type !== dorking.type) return false;
        if (dorking.engine && metadata.engine !== dorking.engine) return false;
        if (dorking.platform && !metadata.platforms?.includes(dorking.platform)) return false;
        if (dorking.genre && !metadata.genre?.includes(dorking.genre)) return false;

        // Apply search text (defaults to title search)
        if (dorking.searchText) {
          const searchLower = dorking.searchText.toLowerCase();
          // Search in title by default
          if (!title.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Apply price filters
        if (freeToPlayOnly && !isFree) {
          return false;
        }
        
        if (price < priceRange.min || price > priceRange.max) {
          return false;
        }

        return true;
      });

      // Sort projects
      // Priority: UI sort option, then dorking sort syntax
      const sortOption = currentSort !== "popular" ? currentSort : (dorking.sort || "popular");
      
      if (sortOption === 'recent') {
        filteredProjects.sort((a, b) => b.date - a.date); // Most recent first
      } else if (sortOption === 'popular') {
        // Restore original DOM order
        filteredProjects.sort((a, b) => {
          const indexA = originalProjectOrder.get(a.element) ?? Infinity;
          const indexB = originalProjectOrder.get(b.element) ?? Infinity;
          return indexA - indexB;
        });
      }

      // Hide all projects first
      projects.forEach(p => {
        p.style.display = "none";
      });

      // Reorder DOM elements if sorting was applied
      // Remove filtered elements from DOM, then re-add them in sorted order
      if ((sortOption === 'recent' || sortOption === 'popular') && filteredProjects.length > 0) {
        // Store references and remove from DOM
        const elementsToReorder = filteredProjects.map(({ element }) => element);
        elementsToReorder.forEach(element => {
          if (element.parentNode === projectGrid) {
            projectGrid.removeChild(element);
          }
        });
        
        // Re-add in sorted order
        elementsToReorder.forEach(element => {
          projectGrid.appendChild(element);
        });
      }

      // Show filtered projects in order
      filteredProjects.forEach(({ element }) => {
        element.style.display = "";
        visibleCount++;
      });
      
      // Show/hide no projects found message
      const noProjectsCard = $("#noProjectsFound");
      if (noProjectsCard) {
        noProjectsCard.classList.toggle("show", visibleCount === 0);
      }
    }
  
    // Filter radio button handlers with deselection support
    filterRadios.forEach(radio => {
      radio.addEventListener("mousedown", (e) => {
        const category = radio.dataset.category;
        const filterValue = radio.dataset.filter;
        const wasChecked = radio.checked;
        
        // If clicking an already checked radio, prevent default and deselect
        if (wasChecked && activeFilters[category] === filterValue) {
          e.preventDefault();
          radio.checked = false;
          delete activeFilters[category];
          applyFilter(projectSearch.value);
          updateActiveFiltersDisplay();
        }
      });
      
      radio.addEventListener("change", () => {
        const category = radio.dataset.category;
        const filterValue = radio.dataset.filter;
        
        if (radio.checked) {
          activeFilters[category] = filterValue;
        } else {
          delete activeFilters[category];
        }
        
        applyFilter(projectSearch.value);
        updateActiveFiltersDisplay();
      });
    });

    projectSearch.addEventListener("input", (e) => {
      applyFilter(e.currentTarget.value);
      updateActiveFiltersDisplay();
    });

    // Price filter event listeners
    function updatePriceDisplay() {
      if (priceMinDisplay) priceMinDisplay.textContent = priceRange.min;
      if (priceMaxDisplay) priceMaxDisplay.textContent = priceRange.max;
      if (priceMinDisplayInline) priceMinDisplayInline.textContent = priceRange.min;
      if (priceMaxDisplayInline) priceMaxDisplayInline.textContent = priceRange.max;
    }

    if (priceMinInput && priceMaxInput) {
      // Ensure min doesn't exceed max and vice versa
      priceMinInput.addEventListener("input", (e) => {
        const min = parseInt(e.target.value);
        const max = parseInt(priceMaxInput.value);
        priceRange.min = Math.min(min, max);
        priceRange.max = Math.max(min, max);
        priceMinInput.value = priceRange.min;
        priceMaxInput.value = priceRange.max;
        updatePriceDisplay();
        applyFilter(projectSearch.value);
        updateActiveFiltersDisplay();
      });

      priceMaxInput.addEventListener("input", (e) => {
        const max = parseInt(e.target.value);
        const min = parseInt(priceMinInput.value);
        priceRange.min = Math.min(min, max);
        priceRange.max = Math.max(min, max);
        priceMinInput.value = priceRange.min;
        priceMaxInput.value = priceRange.max;
        updatePriceDisplay();
        applyFilter(projectSearch.value);
        updateActiveFiltersDisplay();
      });
    }

    if (freeToPlayCheckbox) {
      freeToPlayCheckbox.addEventListener("change", (e) => {
        freeToPlayOnly = e.target.checked;
        applyFilter(projectSearch.value);
        updateActiveFiltersDisplay();
      });
    }

    // Initialize price display
    updatePriceDisplay();

    // Initialize active filters display
    updateActiveFiltersDisplay();

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
        
        // Handle home button - scroll to top
        if (href === "#home") {
          e.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });
          return;
        }
        
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
    $$(".question").forEach(q => {
      const text = q.textContent.trim();
      if (!text.startsWith("Q:")) {
        q.textContent = "Q: " + text;
      }
    });
    
    $$(".answer").forEach(a => {
      const text = a.textContent.trim();
      if (!text.startsWith("A:")) {
        a.textContent = "A: " + text;
      }
    });
  
  })();
  
