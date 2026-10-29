(function () {
  'use strict';

  /* ---------- Three.js particle hero ---------- */
  var canvas = document.getElementById('hero-canvas');
  if (window.THREE && canvas) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
    camera.position.z = 60;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    var COUNT = window.innerWidth < 700 ? 1400 : 3200;
    var positions = new Float32Array(COUNT * 3);
    var colors = new Float32Array(COUNT * 3);
    var palette = [new THREE.Color('#7C5CFF'), new THREE.Color('#22D3EE'), new THREE.Color('#F472B6')];

    for (var i = 0; i < COUNT; i++) {
      var r = 25 + Math.random() * 70;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      var c = palette[Math.floor(Math.random() * 3)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    var mat = new THREE.PointsMaterial({
      size: 0.9, vertexColors: true, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    var points = new THREE.Points(geo, mat);
    scene.add(points);

    // glowing wireframe core
    var core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(12, 1),
      new THREE.MeshBasicMaterial({ color: 0x7C5CFF, wireframe: true, transparent: true, opacity: 0.25 })
    );
    scene.add(core);

    var mouse = { x: 0, y: 0 }, target = { x: 0, y: 0 };
    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    var clock = new THREE.Clock();
    var running = true;
    new IntersectionObserver(function (en) { running = en[0].isIntersecting; }).observe(canvas);

    (function animate() {
      requestAnimationFrame(animate);
      if (!running) return;
      var t = clock.getElapsedTime();
      target.x += (mouse.x - target.x) * 0.05;
      target.y += (mouse.y - target.y) * 0.05;
      points.rotation.y = t * 0.05 + target.x * 0.4;
      points.rotation.x = t * 0.02 + target.y * 0.3;
      core.rotation.y = -t * 0.2;
      core.rotation.x = t * 0.15;
      core.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06);
      renderer.render(scene, camera);
    })();
  }

  /* ---------- Typed text ---------- */
  var words = ['Web Developer', 'Problem Solver', 'Creative Coder', 'Lifelong Learner'];
  var typedEl = document.getElementById('typed');
  var w = 0, ch = 0, del = false;
  function type() {
    var word = words[w];
    typedEl.textContent = word.substring(0, ch);
    if (!del && ch === word.length) { del = true; return setTimeout(type, 1400); }
    if (del && ch === 0) { del = false; w = (w + 1) % words.length; }
    ch += del ? -1 : 1;
    setTimeout(type, del ? 45 : 90);
  }
  if (typedEl) type();

  /* ---------- Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in-view');
      var bar = e.target.querySelector('.bar i');
      if (bar) bar.style.width = e.target.dataset.level + '%';
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el, i) {
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
    io.observe(el);
  });

  /* ---------- Counters ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, end = +el.dataset.count, cur = 0;
      var step = Math.max(1, Math.ceil(end / 40));
      var iv = setInterval(function () {
        cur = Math.min(end, cur + step);
        el.textContent = cur + '+';
        if (cur >= end) clearInterval(iv);
      }, 40);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- Nav + progress ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (window.scrollY / h) * 100 + '%';
  }, { passive: true });

  /* ---------- Project card tilt ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.project').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + x * 8 + 'deg) rotateX(' + -y * 8 + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
