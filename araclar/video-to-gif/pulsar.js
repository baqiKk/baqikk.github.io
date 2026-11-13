// Arka plan süsü: ekranın sağında, çok soluk bir pulsar.
// Hâleli parlak bir nötron yıldızı ve iki ince, uzun ışın. Işınlar sağa yatık bir eksenin
// etrafında dar bir koni çizerek yavaşça salınır (presesyon). Etrafta çekirdekten
// dışa doğru hafif, soluk dalgalar yayılır. Parlama ya da atım yok; sakin bir süs.
// Çizim 128 birimlik bir kare içinde yapılır ve ekranın sağına büyütülerek yerleştirilir.
// Renkler temadan (--cyan) okunur; gece/gündüz değişince yenilenir.
(function () {
  const cv = document.getElementById("pulsar");
  if (!cv || !cv.getContext) return;
  const x = cv.getContext("2d");
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2, C = 64;

  const TILT = 0.2;         // dönme ekseninin sağa yatıklığı (rad, üst uç sağa)
  const CONE = 0.14;        // ışının eksen etrafında çizdiği koninin yarı açısı (dar)
  const SPEED = 0.22;       // salınım hızı (rad/sn) — bir tur ~28 sn, sakin
  const BEAM_LEN = 120;     // ışın uzunluğu (kart birimi), ekran kenarına kadar uzanır
  const WAVE_EVERY = 7;     // yeni dalga aralığı (sn)
  const WAVE_LIFE = 18;     // dalganın sönme süresi (sn) — çok yavaş açılır
  const WAVE_REACH = 72;    // dalganın ulaştığı yarıçap (kart birimi)
  const WAVE_FLAT = 0.3;    // ekvator düzleminin basıklığı: dalga, eksene dik bir disk gibi yatık görünür

  let W = 0, H = 0, k = 1;
  let cy = "#9fd6e4", cyRgb = "159,214,228";

  function rgb(v) {
    let h = (v || "").trim().replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const n = parseInt(h, 16);
    return isNaN(n) ? null : [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(",");
  }
  function readTheme() {
    const s = getComputedStyle(document.documentElement);
    cy = s.getPropertyValue("--cyan").trim() || cy;
    cyRgb = rgb(cy) || cyRgb;
  }
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const side = W < 700 ? Math.min(W * 1.1, H * 0.6) : Math.min(H * 1.05, W * 0.62);
    k = side / 128;
    const cx = W < 700 ? W - side * 0.2 : W - side * 0.3;
    const cyy = W < 700 ? H * 0.74 : H * 0.47;
    x.setTransform(dpr * k, 0, 0, dpr * k, dpr * (cx - C * k), dpr * (cyy - C * k));
  }

  // 3B dalga: dönme eksenine dik ekvator düzleminde yayılan halka. Düzlem bize doğru eğik
  // durduğu için basık bir elips olarak görünür; ön yarısı (alt) parlak, arka yarısı (üst) soluk.
  // Her dalga birbirini izleyen üç ince halkadan oluşan bir dalga paketi: önde belirgin, arkada sönen.
  function wave(r, alpha) {
    if (alpha < 0.004) return;
    x.save();
    x.translate(C, C); x.rotate(TILT);
    x.lineWidth = 1.4 / k;
    [[0, 1], [-3.2, 0.5], [-6.4, 0.22]].forEach(([dr, f]) => {
      const rr = r + dr;
      if (rr <= 2) return;
      x.strokeStyle = `rgba(${cyRgb},${alpha * f * 0.4})`;
      x.beginPath(); x.ellipse(0, 0, rr, rr * WAVE_FLAT, 0, Math.PI, TAU); x.stroke();   // arka yarı
      x.strokeStyle = `rgba(${cyRgb},${alpha * f})`;
      x.beginPath(); x.ellipse(0, 0, rr, rr * WAVE_FLAT, 0, 0, Math.PI); x.stroke();      // ön yarı
    });
    x.restore();
  }

  // ince ışın: dar parlak öz + biraz daha geniş yumuşak hale, uca doğru yavaşça söner
  function beam(ang, len, alpha) {
    const cone = (wd, a) => {
      const ex = C + Math.cos(ang) * len, ey = C + Math.sin(ang) * len;
      const g = x.createLinearGradient(C, C, ex, ey);
      g.addColorStop(0, `rgba(${cyRgb},${a})`);
      g.addColorStop(0.5, `rgba(${cyRgb},${a * 0.55})`);
      g.addColorStop(1, `rgba(${cyRgb},0)`);
      x.fillStyle = g;
      x.beginPath(); x.moveTo(C, C); x.arc(C, C, len, ang - wd, ang + wd); x.closePath(); x.fill();
    };
    cone(0.026, alpha * 0.16);   // dar hale
    cone(0.009, alpha * 0.8);    // öz
  }

  function draw(t) {
    // dalgalar: en arkada
    if (reduce) {
      wave(30, 0.16); wave(55, 0.08);
    } else {
      const newest = Math.floor(t / WAVE_EVERY);
      for (let n = newest; n > newest - Math.ceil(WAVE_LIFE / WAVE_EVERY) - 1; n--) {
        if (n < 0) break;
        const u = (t - n * WAVE_EVERY) / WAVE_LIFE;
        if (u < 0 || u >= 1) continue;
        const r = 8 + (1 - Math.pow(1 - u, 1.6)) * WAVE_REACH;
        const a = 0.32 * Math.pow(1 - u, 1.4) * Math.min(1, u * 5);
        wave(r, a);
      }
    }

    // hâle: yıldızın çevresinde geniş, yumuşak ışıma
    let g = x.createRadialGradient(C, C, 0, C, C, 22);
    g.addColorStop(0, `rgba(${cyRgb},.22)`); g.addColorStop(0.35, `rgba(${cyRgb},.06)`); g.addColorStop(1, `rgba(${cyRgb},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(C, C, 22, 0, TAU); x.fill();

    // ışınlar: sağa yatık eksen etrafında dar koni çizer (3B izdüşüm)
    const ph = (reduce ? 0.6 : t) * SPEED;
    const ax = [Math.sin(TILT), -Math.cos(TILT), 0];          // eksen (ekranda yukarı, sağa yatık)
    const px = [Math.cos(TILT), Math.sin(TILT), 0];           // ekranda eksene dik
    const cc = Math.cos(CONE), sc = Math.sin(CONE), cp = Math.cos(ph), sp = Math.sin(ph);
    const b = [cc * ax[0] + sc * cp * px[0], cc * ax[1] + sc * cp * px[1], sc * sp];
    for (const s of [1, -1]) {
      const bx = s * b[0], by = s * b[1], bz = s * b[2];
      const L = Math.hypot(bx, by);
      beam(Math.atan2(by, bx), BEAM_LEN * L, 0.85 + 0.06 * bz);   // bakana dönen ışın hafifçe parlak
    }

    // çekirdek: parlak, yuvarlak küre (beyaz göbek, belirgin kenar, dışa yumuşak geçiş)
    g = x.createRadialGradient(C, C, 0, C, C, 6.5);
    g.addColorStop(0, "#fff"); g.addColorStop(0.32, "#fff"); g.addColorStop(0.5, `rgba(${cyRgb},.9)`);
    g.addColorStop(0.62, `rgba(${cyRgb},.35)`); g.addColorStop(1, `rgba(${cyRgb},0)`);
    x.fillStyle = g; x.beginPath(); x.arc(C, C, 6.5, 0, TAU); x.fill();
  }

  function render(t) {
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); x.restore();
    draw(t);
  }

  let last = 0;
  const t0 = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    if (now - last < 33) return;   // ~30 fps yeter
    last = now; render((now - t0) / 1000);
  }

  readTheme(); size();
  if (reduce) render(0); else requestAnimationFrame(loop);
  addEventListener("resize", () => { size(); if (reduce) render(0); });
  document.addEventListener("modechange", () => { readTheme(); if (reduce) render(0); });
})();
