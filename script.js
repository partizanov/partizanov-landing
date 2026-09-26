(() => {
  const root = document.documentElement;
  const body = document.body;
  const nav = document.querySelector('.nav');
  const track = document.querySelector('.hero-track');
  const weapon = document.querySelector('.weapon');
  const orbit = document.querySelector('.manifesto-orbit');
  const cards = [...document.querySelectorAll('.work-card')];
  const rhythm = document.querySelector('.rhythm');
  const object = document.querySelector('.about-object');
  const about = document.querySelector('.about');
  const cursor = document.querySelector('.cursor-lens');
  const clock = document.querySelector('.timecode');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  let previousY = scrollY;
  let scheduled = false;
  let px = -100, py = -100, pointerVisible = false;

  function render() {
    scheduled = false;
    const y = scrollY;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    root.style.setProperty('--page-progress', (y / max * 100).toFixed(2) + '%');

    if (y > 240 && y > previousY + 5) nav.classList.add('is-hidden');
    if (y < previousY - 5 || y < 100) nav.classList.remove('is-hidden');
    previousY = y;

    if (!reduce) {
      const rect = track.getBoundingClientRect();
      const distance = Math.max(1, rect.height - innerHeight);
      const p = clamp(-rect.top / distance);
      root.style.setProperty('--hero-p', p.toFixed(3));
      root.style.setProperty('--cut-p', clamp((p - .81) / .19).toFixed(3));
      if (weapon) {
        const w = weapon.getBoundingClientRect();
        const wp = clamp((innerHeight - w.top) / (innerHeight + w.height));
        weapon.style.setProperty('--weapon-y', ((.5 - wp) * 32).toFixed(1) + 'px');
        weapon.style.setProperty('--weapon-rotate', ((wp - .5) * 2).toFixed(2) + 'deg');
        weapon.style.setProperty('--weapon-beam', clamp((wp - .22) * 2.4).toFixed(3));
      }
      if (orbit) {
        const m = orbit.getBoundingClientRect();
        orbit.style.setProperty('--orbit-turn', ((innerHeight - m.top) / innerHeight * 32).toFixed(1) + 'deg');
      }
      cards.forEach(card => {
        const r = card.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = clamp((innerHeight - r.top) / (innerHeight + r.height));
        card.style.setProperty('--card-scale', (1.13 - p * .11).toFixed(3));
        card.style.setProperty('--card-y', ((p - .5) * -20).toFixed(1) + 'px');
      });
      if (rhythm) {
        const r = rhythm.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          rhythm.style.setProperty('--rhythm-scale', (1 + clamp((innerHeight - r.top) / (innerHeight + r.height)) * .2).toFixed(3));
        }
      }
      if (object && about) {
        const r = about.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          object.style.setProperty('--object-turn', ((.5 - clamp((innerHeight - r.top) / (innerHeight + r.height))) * 28).toFixed(2) + 'deg');
        }
      }
    }
    if (fine && cursor) {
      cursor.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%)';
      cursor.style.opacity = pointerVisible ? '1' : '0';
    }
  }
  function queue() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(render); }
  }
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', queue, {passive:true});
  queue();

  if (!reduce) {
    body.classList.add('motion');
    requestAnimationFrame(() => body.classList.add('is-ready'));
    const revealTargets = document.querySelectorAll('.manifesto h2,.manifesto-note,.weapon-heading,.works-heading,.work-card,.rhythm-body,.about-visual,.about-copy,.finale-kicker,.finale h2,.finale-links');
    revealTargets.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.12,rootMargin:'0px 0px -4% 0px'});
    revealTargets.forEach(el => observer.observe(el));
    const bars = document.querySelector('.rhythm-meter');
    if (bars) {
      for (let i = 0; i < 26; i++) {
        const bar = document.createElement('i');
        bar.style.setProperty('--h', (8 + ((i * 17) % 34)) + 'px');
        bar.style.setProperty('--delay', ((i % 7) * -.13) + 's');
        bars.append(bar);
      }
    }
  }

  if (fine && !reduce && cursor) {
    addEventListener('pointermove', event => {
      px = event.clientX;
      py = event.clientY;
      pointerVisible = true;
      queue();
    }, {passive:true});
    document.addEventListener('pointerleave', () => { pointerVisible = false; queue(); });
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('pointerenter', () => cursor.classList.add('is-link'));
      link.addEventListener('pointerleave', () => cursor.classList.remove('is-link'));
    });
  }

  if (clock && !reduce) {
    const started = performance.now();
    const tick = () => {
      if (document.hidden) return;
      const seconds = Math.floor((performance.now() - started) / 1000);
      clock.textContent = '00:' + String(Math.floor(seconds / 60) % 60).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0');
    };
    tick();
    setInterval(tick, 1000);
  }
})();
