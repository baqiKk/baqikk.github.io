// Arka plan süsü: ekranın sağında, çok soluk dönen bir pulsar.
// Manyetik ekseni dönme ekseninden eğik bir nötron yıldızı: iki ışın konisi döner, ışın bakana
// döndüğünde çekirdek parlar ve dışa doğru silik bir halka yayılır. Dipol alan çizgileri eksenle birlikte döner.
// Renkler temadan (--cyan, --accent) okunur; gece/gündüz değişince yenilenir.
(function () {
  const cv = document.getElementById("pulsar");
  if (!cv || !cv.getContext) return;
  const x = cv.getContext("2d");
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;

  const PERIOD = 7000;          // bir tam dönüş (ms) — süs olduğu için yavaş
  const INCL = 0.62;            // manyetik eksenin dönme ekseninden eğikliği (rad)
  const TILT = 0.38;            // dönme ekseninin bakana doğru eğikliği
  const ROLL = -0.22;           // ekranda hafif yana yatma
  const SHELLS = [0.34, 0.58, 0.86];
  const AZ = 6;

  let W = 0, H = 0, cx = 0, cy = 0, R = 0, light = false;
  let C = "159,214,228", A = "255,181,71";
  const rings = [];
  const prevPulse = [0, 0];

  function rgb(v) {
    let h = (v || "").trim().replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const n = parseInt(h, 16);
    return isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",");
  }
  function readTheme() {
    const s = getComputedStyle(document.documentElement);
    C = rgb(s.getPropertyValue("--cyan")) || C;
    A = rgb(s.getPropertyValue("--accent")) || A;
    light = document.documentElement.dataset.mode === "light";
  }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W < 700) { R = Math.min(W * 0.62, H * 0.32); cx = W - R * 0.28; cy = H * 0.74; }
    else { R = Math.min(H * 0.44, W * 0.36); cx = W - R * 0.62; cy = H * 0.47; }
  }

  // dönme çerçevesinden ekrana: önce bakana doğru eğ (x ekseni), sonra ekranda yatır (z ekseni)
  function toScreen(v) {
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const y1 = v[1] * ct - v[2] * st, z1 = v[1] * st + v[2] * ct;
    const cr = Math.cos(ROLL), sr = Math.sin(ROLL);
    return [v[0] * cr - y1 * sr, v[0] * sr + y1 * cr, z1];   // [sağ, yukarı, bakana]
  }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  function frame(now) {
    const phi = (now % PERIOD) / PERIOD * TAU;
    const m = toScreen([Math.sin(INCL) * Math.cos(phi), Math.cos(INCL), Math.sin(INCL) * Math.sin(phi)]);
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = light ? "source-over" : "lighter";

    // zemin ışıması
    let g = x.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
    g.addColorStop(0, `rgba(${C},.10)`); g.addColorStop(1, `rgba(${C},0)`);
    x.fillStyle = g; x.fillRect(cx - R * 1.2, cy - R * 1.2, R * 2.4, R * 2.4);

    // dipol alan çizgileri: r = L·sin²θ, manyetik eksen etrafında AZ farklı düzlemde
    const a = norm(Math.abs(m[2]) > 0.95 ? cross(m, [1, 0, 0]) : cross(m, [0, 0, 1]));
    const b = cross(m, a);
    x.lineWidth = 1;
    for (let k = 0; k < AZ; k++) {
      const ang = k / AZ * Math.PI;              // yarım tur yeter: θ 0..π her iki yanı çizer
      const e = [a[0] * Math.cos(ang) + b[0] * Math.sin(ang), a[1] * Math.cos(ang) + b[1] * Math.sin(ang), a[2] * Math.cos(ang) + b[2] * Math.sin(ang)];
      for (const L of SHELLS) {
        for (const side of [1, -1]) {
          x.beginPath(); let depth = 0;
          for (let i = 0; i <= 36; i++) {
            const th = 0.12 + (Math.PI - 0.24) * i / 36, s = Math.sin(th), r = L * R * s * s;
            const px = r * (Math.cos(th) * m[0] + side * s * e[0]);
            const py = r * (Math.cos(th) * m[1] + side * s * e[1]);
            depth += Math.cos(th) * m[2] + side * s * e[2];
            i ? x.lineTo(cx + px, cy - py) : x.moveTo(cx + px, cy - py);
          }
          const front = depth / 37 > 0;
          x.strokeStyle = `rgba(${C},${front ? 0.32 : 0.14})`;
          x.stroke();
        }
      }
    }

    // ışın konileri ve atım
    let pulse = 0;
    for (let i = 0; i < 2; i++) {
      const s = i ? -1 : 1, dx = s * m[0], dy = -s * m[1], dz = s * m[2];
      const p = Math.pow(Math.max(0, dz), 10);
      pulse = Math.max(pulse, p);
      if (p > 0.55 && prevPulse[i] <= 0.55 && !reduce) rings.push(now);
      prevPulse[i] = p;
      const L = Math.hypot(dx, dy), len = R * 1.7 * Math.max(0.12, L);
      const ux = L ? dx / L : 0, uy = L ? dy / L : 1, wx = -uy, wy = ux;
      const half = R * (0.1 + 0.28 * (1 - L));       // bakana dönünce koni genişler
      const tipX = cx + ux * len, tipY = cy + uy * len;
      const al = 0.32 + 0.4 * Math.max(0, dz);
      g = x.createLinearGradient(cx, cy, tipX, tipY);
      g.addColorStop(0, `rgba(${C},${al})`); g.addColorStop(0.55, `rgba(${C},${al * 0.3})`); g.addColorStop(1, `rgba(${C},0)`);
      x.fillStyle = g;
      x.beginPath(); x.moveTo(cx, cy);
      x.lineTo(tipX + wx * half, tipY + wy * half);
      x.quadraticCurveTo(tipX + ux * half * 0.35, tipY + uy * half * 0.35, tipX - wx * half, tipY - wy * half);
      x.closePath(); x.fill();
    }

    // atım halkaları
    for (let i = rings.length - 1; i >= 0; i--) {
      const u = (now - rings[i]) / 3200;
      if (u >= 1) { rings.splice(i, 1); continue; }
      x.strokeStyle = `rgba(${C},${0.35 * (1 - u) * (1 - u)})`;
      x.lineWidth = 1 + 2 * (1 - u);
      x.beginPath(); x.arc(cx, cy, R * (0.08 + 1.3 * u), 0, TAU); x.stroke();
    }

    // çekirdek: atım anında parlar, kehribar iç ışık
    const cr = R * (0.035 + 0.05 * pulse);
    g = x.createRadialGradient(cx, cy, 0, cx, cy, cr * 4);
    g.addColorStop(0, `rgba(${light ? A : "255,255,255"},${0.75 + 0.25 * pulse})`);
    g.addColorStop(0.25, `rgba(${C},${0.45 + 0.4 * pulse})`);
    g.addColorStop(1, `rgba(${C},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, cr * 4, 0, TAU); x.fill();
    x.globalCompositeOperation = "source-over";
  }

  let last = 0, raf = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return;   // ~30 fps yeter
    last = now; frame(now);
  }

  readTheme(); size();
  if (reduce) frame(PERIOD * 0.15); else raf = requestAnimationFrame(loop);
  addEventListener("resize", () => { size(); if (reduce) frame(PERIOD * 0.15); });
  document.addEventListener("modechange", () => { readTheme(); if (reduce) frame(PERIOD * 0.15); });
})();
