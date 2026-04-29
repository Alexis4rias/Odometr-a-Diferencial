const http = require("http");

// ─── PARÁMETROS DEL ODÓMETRO ──────────────────
const PORT             = 3000;  // Live Server usa 5500 → API en 3000 sin conflicto
const INTERVAL_MS      = 50;           // tiempo entre publicaciones (50 ms)
const WHEEL_DIAMETER   = 0.14;          // diámetro de rueda en metros (140 mm)
const TICKS_PER_REV    = 20;           // ticks por vuelta completa
// incremento de distancia por tick = (π × diámetro) / ticks_por_vuelta
const INCREMENT = (Math.PI * WHEEL_DIAMETER) / TICKS_PER_REV;

// ─── ESTADO ───────────────────────────────────
let ticksL = 0, ticksR = 0;           // ticks acumulados rueda izq / der
let distL  = 0, distR  = 0;           // distancia acumulada en metros
let timeElapsed = 0;                   // tiempo total en segundos

// ─── LOOP PRINCIPAL (cada 50 ms) ──────────────
setInterval(() => {
  timeElapsed += INTERVAL_MS / 1000;   // suma 0.05 s cada ciclo

  const rand1 = Math.floor(Math.random() * 100) + 1;
  const rand2 = Math.floor(Math.random() * 100) + 1;

  // condición: < 50 → incrementa si IMPAR | >= 50 → incrementa si PAR
  const inc1 = rand1 < 50 ? (rand1 % 2 !== 0) : (rand1 % 2 === 0);
  const inc2 = rand2 < 50 ? (rand2 % 2 !== 0) : (rand2 % 2 === 0);

  if (inc1) { ticksL++; distL += INCREMENT; }
  if (inc2) { ticksR++; distR += INCREMENT; }

  console.log(
    `t=${timeElapsed.toFixed(2)}s | ` +
    `r1=${rand1}(${inc1?"INC":"---"}) r2=${rand2}(${inc2?"INC":"---"}) | ` +
    `L: ${ticksL} ticks / ${distL.toFixed(4)}m | ` +
    `R: ${ticksR} ticks / ${distR.toFixed(4)}m`
  );
}, INTERVAL_MS);

// ─── SERVIDOR HTTP ────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(JSON.stringify({
    config: {
      interval_ms:      INTERVAL_MS,
      wheel_diameter_m: WHEEL_DIAMETER,
      ticks_per_rev:    TICKS_PER_REV,
      increment_m:      parseFloat(INCREMENT.toFixed(6))
    },
    time_s: parseFloat(timeElapsed.toFixed(3)),
    left:  { ticks: ticksL, distance_m: parseFloat(distL.toFixed(4)) },
    right: { ticks: ticksR, distance_m: parseFloat(distR.toFixed(4)) }
  }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 ODOM corriendo en http://localhost:${PORT}`);
  console.log(`   Intervalo : ${INTERVAL_MS} ms`);
  console.log(`   Diámetro  : ${WHEEL_DIAMETER} m`);
  console.log(`   Incremento: ${INCREMENT.toFixed(6)} m/tick\n`);
});