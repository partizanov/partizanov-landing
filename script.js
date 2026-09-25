(() => {
  const root = document.documentElement;
  const cursor = document.querySelector('.cursor');
  const heroImg = document.querySelector('.hero-image');
  const progress = document.querySelector('.scroll-progress');
  const nav = document.querySelector('.nav');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mouseX = innerWidth/2, mouseY = innerHeight/2, lastY = scrollY;

  // Reveal-on-scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('visible'));
  }, {threshold:.14});
  document.querySelectorAll('.reveal').forEach((el,i)=>{ el.style.transitionDelay = `${Math.min(i%4,3)*70}ms`; io.observe(el); });

  // Cursor + liquid-glass light tracking
  addEventListener('pointermove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (cursor) cursor.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
    document.querySelectorAll('.glass-reactive').forEach(el => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${mouseX-r.left}px`);
      el.style.setProperty('--my', `${mouseY-r.top}px`);
    });
  }, {passive:true});
  document.querySelectorAll('a,.tilt').forEach(el => {
    el.addEventListener('pointerenter',()=>cursor?.classList.add('hover'));
    el.addEventListener('pointerleave',()=>cursor?.classList.remove('hover'));
  });

  // Magnetic buttons
  if (!reduced) document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r=el.getBoundingClientRect(), x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
      el.style.transform=`translate(${x*.08}px,${y*.12}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });

  // 3D tilt cards
  if (!reduced) document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r=card.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-.5)*-7, ry=((e.clientX-r.left)/r.width-.5)*9;
      card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });

  // Scroll behaviors
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight-innerHeight;
    progress.style.width = `${max ? scrollY/max*100 : 0}%`;
    if (!reduced && heroImg) heroImg.style.transform = `scale(1.08) translate3d(${Math.min(scrollY*.012,18)}px,${scrollY*.055}px,0)`;
    if (scrollY > lastY && scrollY > 180) nav.classList.add('hidden'); else nav.classList.remove('hidden');
    lastY = scrollY;
  }, {passive:true});

  // Monochrome fluid trail canvas
  const canvas = document.querySelector('#fx');
  const ctx = canvas.getContext('2d');
  let dpr=1, particles=[];
  const resize=()=>{dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0)};
  resize(); addEventListener('resize',resize);
  let px=mouseX, py=mouseY;
  addEventListener('pointermove', e=>{
    const dx=e.clientX-px, dy=e.clientY-py, speed=Math.hypot(dx,dy);
    if(speed>2){
      for(let i=0;i<Math.min(3,1+speed/20);i++) particles.push({x:e.clientX+(Math.random()-.5)*10,y:e.clientY+(Math.random()-.5)*10,vx:-dx*.015+(Math.random()-.5)*.3,vy:-dy*.015+(Math.random()-.5)*.3,r:6+Math.random()*18,a:.11+Math.min(speed/650,.08),life:1});
    }
    px=e.clientX;py=e.clientY;
  },{passive:true});
  function frame(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.globalCompositeOperation='lighter';
    particles=particles.filter(p=>p.life>.02);
    particles.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy*=.985;p.r*=1.018;p.life*=.94;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
      g.addColorStop(0,`rgba(255,255,255,${p.a*p.life})`);g.addColorStop(.35,`rgba(255,255,255,${p.a*p.life*.32})`);g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    });
    requestAnimationFrame(frame);
  }
  if(!reduced) frame();
})();
