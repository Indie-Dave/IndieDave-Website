// Adds interactive scroll dots to the right side of the page
// Dots grow when the scrollbar handle is near them
(function() {
  const NUM_DOTS = 20;
  // Define your section positions as a fraction of scroll (0=start, 1=end)
  // Example: 5 sections evenly spaced
  const SECTION_POSITIONS = [0, 0.25, 0.5, 0.75, 1];

  let dotsContainer = document.querySelector('.scroll-dots');
  if (!dotsContainer) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'scroll-dots';
    document.body.appendChild(dotsContainer);
  }
  dotsContainer.innerHTML = '';
  for (let i = 0; i < NUM_DOTS; i++) {
    const dot = document.createElement('div');
    dot.className = 'scroll-dot';
    dotsContainer.appendChild(dot);
    // Add section line if this dot is at a section position (except last dot)
    if (i < NUM_DOTS - 1) {
      const dotPos = i / (NUM_DOTS - 1);
      // Find if a section is close to this dot
      if (SECTION_POSITIONS.some(section => Math.abs(section - dotPos) < 0.03)) {
        const line = document.createElement('div');
        line.className = 'scroll-dot-section';
        dot.appendChild(line);
      }
    }
  }
  const dots = Array.from(dotsContainer.children);
  function updateDots() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const handlePos = docHeight > 0 ? scrollTop / docHeight : 0;
    dots.forEach((dot, i) => {
      const dotPos = i / (NUM_DOTS - 1);
      const dist = Math.abs(handlePos - dotPos);
      if (dist < 0.07) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', updateDots);
  window.addEventListener('resize', updateDots);
  updateDots();
})();
