document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const wrap = document.getElementById("game-wrap");
  const titleScreen = document.getElementById("title-screen");
  const touchControls = document.getElementById("touch-controls");

  /* ── Internal resolution (fixed, upscaled via CSS + pixelated rendering) ── */
  const W = 320, H = 240, TILE = 20, COLS = 16, ROWS = 12;
  canvas.width = W;
  canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  /* ── World: paths, obstacles, portals ──────────────────────────────────── */
  function isPath(col, row) {
    if (col === 8 && row >= 4 && row <= 10) return true;               // spawn -> junction
    if (row === 4 && col >= 3 && col <= 13) return true;              // junction crossbar
    if (col === 3 && row >= 2 && row <= 4) return true;               // up to about
    if (col === 13 && row >= 2 && row <= 4) return true;              // up to contact
    return false;
  }
  function isAlt(col, row) {
    return (col * 3 + row * 5) % 11 === 0;
  }

  const OBSTACLES = [
    { col: 1,  row: 1, type: "tree" }, { col: 1,  row: 4, type: "rock" },
    { col: 1,  row: 7, type: "tree" }, { col: 14, row: 1, type: "tree" },
    { col: 14, row: 4, type: "rock" }, { col: 14, row: 7, type: "tree" },
    { col: 6,  row: 1, type: "tree" }, { col: 10, row: 1, type: "tree" },
    { col: 5,  row: 7, type: "rock" }, { col: 11, row: 7, type: "rock" },
    { col: 8,  row: 1, type: "tree" },
    { col: 2,  row: 10, type: "tree" }, { col: 13, row: 10, type: "tree" },
    { col: 5,  row: 10, type: "rock" }, { col: 10, row: 10, type: "rock" },
    { col: 1,  row: 9, type: "rock" }, { col: 14, row: 9, type: "rock" },
  ].map(o => ({
    ...o,
    x: o.col * TILE + 2, y: o.row * TILE + 4,
    w: TILE - 4, h: TILE - 4,
  }));

  const PORTALS = [
    { name: "about",   url: "about.html",   col: 3,  row: 2, x: 3 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, color: "accent" },
    { name: "contact", url: "contact.html", col: 13, row: 2, x: 13 * TILE, y: 2 * TILE, w: TILE, h: TILE * 2, color: "accent2" },
  ];

  /* ── Player ─────────────────────────────────────────────────────────────── */
  const player = {
    x: 8 * TILE + 4, y: 10 * TILE + 2, w: 12, h: 16,
    speed: 62, facing: 1, moving: false, animT: 0,
  };

  const keys = { up: false, down: false, left: false, right: false };
  const keyMap = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
  };

  let started = false;
  let transitioning = false;

  function startGame() {
    if (started) return;
    started = true;
    titleScreen.classList.add("hidden");
    touchControls.classList.add("active");
  }

  window.addEventListener("keydown", (e) => {
    if (!started) { startGame(); return; }
    const dir = keyMap[e.key];
    if (dir) { keys[dir] = true; e.preventDefault(); }
  });
  window.addEventListener("keyup", (e) => {
    const dir = keyMap[e.key];
    if (dir) keys[dir] = false;
  });
  titleScreen.addEventListener("pointerdown", startGame);

  /* ── Touch / click D-pad ────────────────────────────────────────────────── */
  document.querySelectorAll(".dpad-btn").forEach((btn) => {
    const dir = btn.getAttribute("data-dir");
    const press = (e) => { e.preventDefault(); if (!started) startGame(); keys[dir] = true; };
    const release = (e) => { e.preventDefault(); keys[dir] = false; };
    btn.addEventListener("pointerdown", press);
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointerleave", release);
    btn.addEventListener("pointercancel", release);
  });

  /* ── Collision ──────────────────────────────────────────────────────────── */
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function collidesWorld(px, py) {
    const box = { x: px, y: py, w: player.w, h: player.h };
    if (box.x < 4 || box.y < 4 || box.x + box.w > W - 4 || box.y + box.h > H - 4) return true;
    for (const o of OBSTACLES) if (rectsOverlap(box, o)) return true;
    return false;
  }

  /* ── Palette (day / night) ─────────────────────────────────────────────── */
  function palette() {
    const day = document.body.classList.contains("light-mode");
    return day
      ? { grass: "#52b788", alt: "#40916c", path: "#c68b59", pathEdge: "#a9744f", trunk: "#6b4a2f", leaf: "#2d6a4f", rock: "#9fa6ad", rockDark: "#767d85" }
      : { grass: "#1b4332", alt: "#143a29", path: "#6b4a2f", pathEdge: "#4a3728", trunk: "#4a3728", leaf: "#14532d", rock: "#4a5560", rockDark: "#33393f" };
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  function drawTiles(pal) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE, y = r * TILE;
        if (isPath(c, r)) {
          ctx.fillStyle = pal.path;
          ctx.fillRect(x, y, TILE, TILE);
          ctx.fillStyle = pal.pathEdge;
          ctx.fillRect(x, y, TILE, 2);
        } else {
          ctx.fillStyle = isAlt(c, r) ? pal.alt : pal.grass;
          ctx.fillRect(x, y, TILE, TILE);
        }
      }
    }
  }

  function drawObstacle(o, pal) {
    if (o.type === "tree") {
      ctx.fillStyle = pal.trunk;
      ctx.fillRect(o.x + o.w / 2 - 2, o.y + o.h - 8, 4, 8);
      ctx.fillStyle = pal.leaf;
      ctx.fillRect(o.x, o.y, o.w, o.h - 6);
      ctx.fillRect(o.x + 2, o.y - 4, o.w - 4, 6);
    } else {
      ctx.fillStyle = pal.rockDark;
      ctx.fillRect(o.x, o.y + 4, o.w, o.h - 4);
      ctx.fillStyle = pal.rock;
      ctx.fillRect(o.x + 2, o.y, o.w - 4, o.h - 4);
    }
  }

  function drawPortalMarker(p, pal) {
    const isAbout = p.name === "about";
    const postX = p.x + p.w / 2 - 2;
    ctx.fillStyle = "#5c4530";
    ctx.fillRect(postX, p.y + 6, 4, TILE + 6);
    ctx.fillStyle = isAbout ? "#ffd23f" : "#4cc9f0";
    if (isAbout) {
      ctx.fillRect(postX - 1, p.y - 2, 20, 10);
    } else {
      ctx.fillRect(postX - 6, p.y, 14, 10);
      ctx.fillStyle = "#0b1224";
      ctx.fillRect(postX - 4, p.y + 2, 10, 5);
    }
  }

  function drawPlayer() {
    const px = Math.round(player.x), py = Math.round(player.y);
    const flip = player.facing < 0;
    ctx.save();
    ctx.translate(flip ? px * 2 + player.w : 0, 0);
    ctx.scale(flip ? -1 : 1, 1);

    const legOffset = player.moving ? (Math.floor(player.animT * 8) % 2 === 0 ? 1 : -1) : 0;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(px + 1, py + player.h - 2, player.w - 2, 2);

    // legs (denim)
    ctx.fillStyle = "#35507a";
    ctx.fillRect(px + 2, py + 11 + Math.max(0, legOffset), 3, 5 - Math.max(0, legOffset));
    ctx.fillRect(px + 7, py + 11 + Math.max(0, -legOffset), 3, 5 - Math.max(0, -legOffset));

    // hoodie body
    ctx.fillStyle = "#3a4a5c";
    ctx.fillRect(px + 1, py + 5, player.w - 2, 7);
    // arms
    ctx.fillStyle = "#2f3c4a";
    ctx.fillRect(px, py + 6, 2, 5);
    ctx.fillRect(px + player.w - 2, py + 6, 2, 5);

    // face
    ctx.fillStyle = "#d9a066";
    ctx.fillRect(px + 2, py + 1, player.w - 4, 5);
    // hair
    ctx.fillStyle = "#211a14";
    ctx.fillRect(px + 1, py, player.w - 2, 3);
    // glasses
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(px + 2, py + 3, player.w - 4, 1);

    ctx.restore();
  }

  /* ── Portal label DOM elements pulse when player is inside trigger ────── */
  const labelEls = {
    about: document.getElementById("label-about"),
    contact: document.getElementById("label-contact"),
  };

  function fadeAndGo(url) {
    if (transitioning) return;
    transitioning = true;
    wrap.style.transition = "filter 0.4s ease, opacity 0.4s ease";
    wrap.style.filter = "brightness(0.1)";
    wrap.style.opacity = "0.4";
    setTimeout(() => { window.location.href = url; }, 380);
  }

  /* ── Update loop ────────────────────────────────────────────────────────── */
  let lastT = performance.now();
  function update(dt) {
    if (!started || transitioning) return;

    let dx = 0, dy = 0;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

    player.moving = dx !== 0 || dy !== 0;
    if (player.moving) {
      const len = Math.hypot(dx, dy) || 1;
      dx = (dx / len) * player.speed * dt;
      dy = (dy / len) * player.speed * dt;
      if (dx > 0) player.facing = 1;
      if (dx < 0) player.facing = -1;

      if (!collidesWorld(player.x + dx, player.y)) player.x += dx;
      if (!collidesWorld(player.x, player.y + dy)) player.y += dy;
      player.animT += dt;
    }

    const pbox = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (const p of PORTALS) {
      const inside = rectsOverlap(pbox, p);
      const el = labelEls[p.name];
      if (el) el.style.outline = inside ? "2px solid #fff" : "none";
      if (inside) fadeAndGo(p.url);
    }
  }

  function render() {
    const pal = palette();
    ctx.clearRect(0, 0, W, H);
    drawTiles(pal);
    for (const o of OBSTACLES) drawObstacle(o, pal);
    for (const p of PORTALS) drawPortalMarker(p, pal);
    drawPlayer();
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ── Responsive sizing of the game viewport ────────────────────────────── */
  function fitWrap() {
    const isSmall = window.innerWidth <= 768;
    const captionH = isSmall ? 30 : 38;
    const chromeH = isSmall ? 92 : 112;
    const availW = window.innerWidth * (isSmall ? 0.96 : 0.97);
    const availH = window.innerHeight - chromeH - captionH;
    let w = availW, h = (w * H) / W;
    if (h > availH) { h = availH; w = (h * W) / H; }
    wrap.style.width = Math.max(240, w) + "px";
    wrap.style.height = Math.max(135, h) + "px";
  }
  fitWrap();
  window.addEventListener("resize", fitWrap);
});
