(() => {
  const root = document.documentElement;
  const nav = document.querySelector('.nav');
  const art = document.querySelector('.hero-art');
  const heroImage = document.querySelector('.hero-image');
  const wordmark = document.querySelector('.wordmark');
  const timecode = document.querySelector('.timecode');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  let previous = scrollY, scheduled = false;
  function frame() {
    scheduled = false;
    const y = scrollY;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    root.style.setProperty('--progress', (100 * y / max).toFixed(2) + '%');
    nav.classList.toggle('hide', y > 200 && y > previous + 3);
    if (y < previous - 3 || y < 70) nav.classList.remove('hide');
    previous = y;
    if (!reduce && y < innerHeight * 1.3) {
      const progress = Math.min(1, y / Math.max(1, innerHeight));
      heroImage.style.transform = 'translate3d(0,' + (progress * 32).toFixed(1) + 'px,0) scale(1.04)';
      wordmark.style.setProperty('opacity', (1 - progress * .28).toFixed(2));
      wordmark.style.translate = '0 ' + (-progress * 30).toFixed(1) + 'px';
    }
  }
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(frame); }
  }, {passive:true});
  frame();
  if (fine && !reduce) {
    let pending = false, x = 65, y = 35;
    addEventListener('pointermove', event => {
      x = event.clientX / innerWidth * 100;
      y = event.clientY / innerHeight * 100;
      if (!pending) requestAnimationFrame(() => {
        pending = false;
        art.style.setProperty('--lx', x + '%');
        art.style.setProperty('--ly', y + '%');
      });
      pending = true;
    }, {passive:true});
  }
  if (timecode && !reduce) {
    const start = performance.now();
    function tick() {
      if (document.hidden) return;
      const s = Math.floor((performance.now() - start) / 1000);
      timecode.textContent = '00:' + String(Math.floor(s / 60) % 60).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
    }
    setInterval(tick, 1000);
  }
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback) {
        img.src = img.dataset.fallback;
        delete img.dataset.fallback;
      }
    }, {once:true});
  });
})();
