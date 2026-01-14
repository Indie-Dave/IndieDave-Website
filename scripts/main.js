(() => {
    const root = document.documentElement;
  
    // --- helpers
    const $ = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
  
    // --- footer year + name sync
    $("#year").textContent = String(new Date().getFullYear());
    $("#footerName").textContent = $("#devName").textContent;
  
    // --- theme (persist)
    const THEME_KEY = "portfolio_theme";
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  
    $("#themeBtn").addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      localStorage.setItem(THEME_KEY, next);
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
    $("#copyEmailBtn").addEventListener("click", async (e) => {
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
  
    // --- project filter
    const chips = $$(".chip");
    const projects = $$(".project");
    const projectSearch = $("#projectSearch");
    let activeFilter = "all";
  
    function setActiveChip(btn) {
      chips.forEach(c => c.classList.toggle("active", c === btn));
    }
  
    function applyFilter(tag, query) {
      const safeQuery = (query || "").trim().toLowerCase();
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
        const matchesTag = tag === "all" ? true : tags.includes(tag);
        const matchesQuery = safeQuery ? haystack.includes(safeQuery) : true;
        const show = matchesTag && matchesQuery;
        p.style.display = show ? "" : "none";
      });
    }
  
    chips.forEach(btn => {
      btn.addEventListener("click", () => {
        const tag = btn.dataset.filter;
        activeFilter = tag;
        setActiveChip(btn);
        applyFilter(tag, projectSearch.value);
      });
    });

    projectSearch.addEventListener("input", (e) => {
      applyFilter(activeFilter, e.currentTarget.value);
    });
  
    // --- modal
    const modal = $("#modal");
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
  
    // click project
    $$(".project-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const bullets = (btn.dataset.bullets || "")
          .split("|")
          .map(s => s.trim())
          .filter(Boolean);
  
        const links = (btn.dataset.links || "")
          .split("|")
          .map(pair => pair.split(",").map(s => s.trim()))
          .filter(p => p.length >= 1 && p[0]);
  
        openModal({
          title: btn.dataset.title,
          tags: btn.dataset.tags,
          desc: btn.dataset.desc,
          bullets,
          links
        });
      });
    });
  
    // close modal actions
    modal.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.close === "true") closeModal();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
    });
  
    // --- contact form demo
    $("#contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      $("#formHint").textContent = "Saved locally (demo). Hook this to a backend to actually send.";
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      localStorage.setItem("portfolio_last_message", JSON.stringify(data));
      e.currentTarget.reset();
    });
  
  })();
  
