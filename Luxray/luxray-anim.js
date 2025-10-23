// luxray-anim.js
import { buildLuxrayParts } from './luxray-parts.js';


export function createLuxray(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildLuxrayParts(createMesh, meshes);


  // --- util matriks (I, mul, T sama gaya sebelumnya) ---
  const I = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  const mul = (A,B) => {
    const m = new Float32Array(16);
    for (let r=0;r<4;r++)
      for (let c=0;c<4;c++)
        m[c+4*r] =
          A[4*r+0]*B[c+0] +
          A[4*r+1]*B[c+4] +
          A[4*r+2]*B[c+8] +
          A[4*r+3]*B[c+12];
    return m;
  };
  const T  = (x,y,z)=>{const m=I(); m[12]=x; m[13]=y; m[14]=z; return m;};
  const RX = a => {const c=Math.cos(a), s=Math.sin(a); const m=I(); m[5]=c; m[6]=s; m[9]=-s; m[10]=c; return m;};
  const RY = a => {
  const c=Math.cos(a), s=Math.sin(a);
  const m=I(); m[0]=c; m[2]=s; m[8]=-s; m[10]=c;
  return m;
};
const RZ = a => { // Opsional, tapi baik untuk dimiliki
    const c=Math.cos(a), s=Math.sin(a);
    const m=I(); m[0]=c; m[1]=s; m[4]=-s; m[5]=c;
    return m;
  };


  /**
   * Membuat matriks rotasi di sekitar sumbu arbitrary [x, y, z]
   * sebesar sudut a (radian).
   * Sumbu TIDAK perlu dinormalisasi sebelumnya.
   */
  const R_axis = (a, x, y, z) => {
    const m = I();
    let len = Math.sqrt(x*x + y*y + z*z);


    if (len < 0.00001) { // hindari divide-by-zero
      return m; // kembalikan matriks identitas
    }
   
    len = 1.0 / len;
    x *= len;
    y *= len;
    z *= len;


    const c = Math.cos(a);
    const s = Math.sin(a);
    const t = 1.0 - c; // (one minus cosine)


    const tx = t * x, ty = t * y;


    // Set matriks (Column-major order, sesuai gaya Anda)
    m[0] = c + tx*x;
    m[1] = s*z + tx*y;
    m[2] = -s*y + tx*z;
    // m[3] = 0;


    m[4] = -s*z + tx*y;
    m[5] = c + ty*y;
    m[6] = s*x + ty*z;
    // m[7] = 0;


    m[8] = s*y + tx*z;
    m[9] = -s*x + ty*z;
    m[10] = c + t*z*z;
    // m[11] = 0;


    // m[12..15] sudah benar (0,0,0,1) dari I()
   
    return m;
  };


  // scale lokal: sama seperti shinx-anim.js (kolom 0..2 dikali, kolom 3/translate nggak ikut)
const scaleLocal = (m, sx, sy, sz) => {
  m[0]=sx; m[1]=sx; m[2]=sx; m[3]=sx;
  m[4]=sy; m[5]=sy; m[6]=sy; m[7]=sy;
  m[8]=sz; m[9]=sz; m[10]=sz; m[11]=sz;
};




  // rotateY in-place (like shinx-anim.js rotateY)
  const rotateY = (m, ang) => {
    const c = Math.cos(ang), s = Math.sin(ang);
    const mv0 = m[0], mv4 = m[4], mv8 = m[8], mv12 = m[12];
    m[0] = c*m[0] + s*m[2];
    m[4] = c*m[4] + s*m[6];
    m[8] = c*m[8] + s*m[10];
    m[12] = c*m[12] + s*m[14];
    m[2] = c*m[2] - s*mv0;
    m[6] = c*m[6] - s*mv4;
    m[10] = c*m[10] - s*mv8;
    m[14] = c*m[14] - s*mv12;
  };


  const P = (n)=>pivots?.[n] ?? [0,0,0];
  const around = (R,p)=>mul(T(p[0],p[1],p[2]),mul(R,T(-p[0],-p[1],-p[2])));


  const M = {
  body:I(), head:I(), tail:I(), earL:I(), earR:I(),
  legFL:I(), legFR:I(), legBL:I(), legBR:I()
};


  let t=0;


  // params (bisa di-override lewat opts)
  const p = {
    basePos: opts.position ?? [0,0,0],
    jumpPeriod: 2.5,
    jumpHeight: 0.7,
    crouchDepth: 0.2,
    legBend: 0.6,


    // approach
    startBehind: opts.startBehind ?? 4.0,
    approachDuration: opts.approachDuration ?? 4.0,
    approachStepAmp: 0.2,
    tailWagDuringApproach: true,


    // gait
    approachLegFreq: 1.8,
    approachLegAmp: 0.08,
    pulseFreq: opts.pulseFreq ?? 1,   // Hz (berapa napas per detik)
pulseAmp:  opts.pulseAmp  ?? 0.05,
returnStartBoost: opts.returnStartBoost ?? 1.6, // x baseAmp di awal balik
returnEndScale:   opts.returnEndScale   ?? 0.6,


    // returning/turn params
    turnRadius: opts.turnRadius ?? 1.2,
    turnDuration: 3.6,        // Durasi Arc 1
    returnArcDuration: 3.6,   // <<< BARU: Durasi Arc 2
    returnDuration: 5.0,     // Durasi jalan lurus mundur
    finalTurnDuration: 1    // <<< Saya kecilkan durasi putar di tempat
  };


  // posisi awal (di belakang target pada sumbu Z)
  const startPos = [ p.basePos[0], p.basePos[1], p.basePos[2] - p.startBehind ];


  // state
  let inApproach = true;
  let approachTimer = 0;


  // jump counting
  let jumpCount = 0;
  let prevJumpCycle = -1;
  let jumpPhaseStartT = 0;


  // returning state
  let returning = false;
  let returnTimer = 0;
  let returnArcTimer = 0;
  let turnTimer = 0;
  let finalTurnTimer = 0;
  let currentYaw = 0;
  let yawStartFinal = 0;


  function applyPulse() {
  // persis gaya shinx: 1.0 + sin(ωt) * amp
  const pulse = 1.0 + Math.sin(t * 2*Math.PI * p.pulseFreq) * p.pulseAmp;


  // OPSIONAL: kalau kamu butuh M.static TIDAK ikut membesar,
  // set M.static = M.body.slice() tepat sebelum panggil applyPulse() di tiap fase.
  scaleLocal(M.body, pulse, pulse, pulse);
}


  function update(dt) {
    t += dt;


    // -------------------------
    // 1) APPROACH PHASE (maju sekali)
    // -------------------------
    if (inApproach && !returning) {
      approachTimer += dt;
      const u = Math.min(1, approachTimer / p.approachDuration);
      const ease = u*u*(3 - 2*u);


      const curX = startPos[0] + (p.basePos[0] - startPos[0]) * ease;
      const curY = startPos[1] + (p.basePos[1] - startPos[1]) * ease;
      const curZ = startPos[2] + (p.basePos[2] - startPos[2]) * ease;


      const bob = Math.sin(t * 2*Math.PI * 1.2) * 0.03 * (1 - u);


      // set body
      M.body = T(curX, curY + bob, curZ);


      // --- APPROACH: legs (phase-explicit, kecil amplitude) ---
      const freq = p.approachLegFreq;
      const amp  = p.approachLegAmp;
      const uAmp = amp * (1 - 0.6 * u);
      const phase = t * 2*Math.PI * freq;


      const phase0 = Math.sin(phase) * uAmp;
      const phaseOpp = Math.sin(phase + Math.PI) * uAmp;


      const maxLegAngle = 0.15;
      const flA = Math.max(-maxLegAngle, Math.min(maxLegAngle, phase0));
      const brA = Math.max(-maxLegAngle, Math.min(maxLegAngle, phase0));
      const frA = Math.max(-maxLegAngle, Math.min(maxLegAngle, phaseOpp));
      const blA = Math.max(-maxLegAngle, Math.min(maxLegAngle, phaseOpp));


      if (buffers.legFL) M.legFL = mul(M.body, around(RX(flA * 0.6), P('legFL')));
      if (buffers.legFR) M.legFR = mul(M.body, around(RX(frA * 0.6), P('legFR')));
      if (buffers.legBL) M.legBL = mul(M.body, around(RX(blA * 0.45), P('legBL')));
      if (buffers.legBR) M.legBR = mul(M.body, around(RX(brA * 0.45), P('legBR')));


      // head & tail
      if (buffers.head) M.head = mul(M.body, T(0, 0.05 - 0.08 * (1-u), 0.05));
      if (p.tailWagDuringApproach && buffers.tail) {
        const wag = Math.sin(t * 2*Math.PI * 2.0) * 0.18 * (1 - 0.5 * u);
        M.tail = mul(M.body, T(0, -0.05, -0.55));
        // renderer may rotate tail by pivot if needed
      }


            if (u >= 1) {
        inApproach = false;
        // Mulai fase loncat: set titik nol waktu & reset counter
        jumpPhaseStartT = t;
        jumpCount = 0;
        prevJumpCycle = -1;
        applyPulse();
      } else {
        applyPulse();
        return;
      }
    }


    // -------------------------
    // RETURNING (Arc -> Straight Back -> Strafe -> Final Turn)
    // -------------------------
    if (returning) {
      // Titik akhir putaran arc
      const turnEndPos = [ p.basePos[0] + 2 * p.turnRadius, p.basePos[1], p.basePos[2] ];
      // Titik akhir setelah jalan lurus MUNDUR
      // (Posisi X masih di [X+2R], tapi Z sudah di [Z_start])
      const backEndPos = [ turnEndPos[0], startPos[1], startPos[2] ];


      // 1) FASE PUTARAN (ARC / SETENGAH LINGKARAN)
      if (turnTimer < p.turnDuration) {
        turnTimer += dt;
        const k = Math.min(1, turnTimer / p.turnDuration);
        const e = k*k*(3 - 2*k);
        const theta = e * Math.PI;
        currentYaw = theta;
let yawStartFinal = 0;


        const centerX = p.basePos[0] + p.turnRadius;
        const centerZ = p.basePos[2];
        const curX = centerX - p.turnRadius * Math.cos(theta);
        const curY = p.basePos[1];
        const curZ = centerZ + p.turnRadius * Math.sin(theta);


        M.body = I();
        rotateY(M.body, currentYaw);
        M.body[12] = curX; M.body[13] = curY; M.body[14] = curZ;
   


        // --- Kaki (Gait saat berputar) ---
        const freqR = p.approachLegFreq;
        const ampR  = p.approachLegAmp;
        const phaseR = t * 2*Math.PI * freqR;
        const phase0R = Math.sin(phaseR) * ampR;
        const phaseOppR = Math.sin(phaseR + Math.PI) * ampR;
        const maxLegAngleR = 0.15;
        const flAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phase0R));
        const brAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phase0R));
        const frAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phaseOppR));
        const blAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phaseOppR));
        if (buffers.legFL) M.legFL = mul(M.body, around(RX(flAR * 0.6), P('legFL')));
        if (buffers.legFR) M.legFR = mul(M.body, around(RX(frAR * 0.6), P('legFR')));
        if (buffers.legBL) M.legBL = mul(M.body, around(RX(blAR * 0.45), P('legBL')));
        if (buffers.legBR) M.legBR = mul(M.body, around(RX(brAR * 0.45), P('legBR')));
        M.head = mul(M.body, T(0, 0.05, 0.05));
        M.tail = mul(M.body, T(0, -0.05, -0.55));
applyPulse();
        return;
      }
     
      // 2) FASE JALAN LURUS MUNDUR (Dari turnEndPos -> backEndPos)
      // <<< INI FASE "JALAN LURUS" ANDA >>>
      if (returnTimer < p.returnDuration) {
        currentYaw = Math.PI; // Pastikan yaw tetap 180


        returnTimer += dt;
        const ru = Math.min(1, returnTimer / p.returnDuration);
        const re = ru*ru*(3 - 2*ru);


        // Interpolasi HANYA Z. X tetap di turnEndPos[0]
        const rx = turnEndPos[0]; // X tetap
        const ry = turnEndPos[1];
        const rz = turnEndPos[2] + (backEndPos[2] - turnEndPos[2]) * re;


        M.body = I();
        rotateY(M.body, currentYaw);
        M.body[12] = rx;
        M.body[13] = ry;
        M.body[14] = rz;
   


        // --- Kaki (Gait saat jalan lurus - dibuat seperti approach) ---
const freqR  = p.approachLegFreq;
  const ampR   = p.approachLegAmp;
  const uAmpR  = ampR * (1 - 0.6 * ru);          // sama persis seperti approach (pakai ru)
  const phaseR = t * 2*Math.PI * freqR;


  const phase0R   = Math.sin(phaseR) * uAmpR;
  const phaseOppR = Math.sin(phaseR + Math.PI) * uAmpR;


  const maxLegAngleR = 0.15;                     // sama seperti approach
  const clamp = (x)=> Math.max(-maxLegAngleR, Math.min(maxLegAngleR, x));


  const flAR = clamp(phase0R);
  const brAR = clamp(phase0R);
  const frAR = clamp(phaseOppR);
  const blAR = clamp(phaseOppR);


  if (buffers.legFL) M.legFL = mul(M.body, around(RX(flAR * 0.6),  P('legFL')));
  if (buffers.legFR) M.legFR = mul(M.body, around(RX(frAR * 0.6),  P('legFR')));
  if (buffers.legBL) M.legBL = mul(M.body, around(RX(blAR * 0.45), P('legBL')));
  if (buffers.legBR) M.legBR = mul(M.body, around(RX(brAR * 0.45), P('legBR')));
        M.head = mul(M.body, T(0, 0.05, 0.05));
        M.tail = mul(M.body, T(0, -0.05, -0.55));
applyPulse();
        return;
      }


      // 3) FASE PUTARAN 2 (ARC MUNDUR) — MIRROR DARI ARC 1, ROTASI KE KIRI
if (returnArcTimer < p.returnArcDuration) {
  returnArcTimer += dt;
  const k = Math.min(1, returnArcTimer / p.returnArcDuration);
  const e = k*k*(3 - 2*k);


  // Sudut mirror: berjalan dari PI -> 0 (posisinya konsisten dengan start di samping)
  const theta = Math.PI * (1.0 - e);


  // Rotasi KE KIRI: yaw negatif dari sudut yang sama (mirror dari Arc 1)
  currentYaw = -theta;


  // Pusat lingkaran kedua di sekitar startPos (mirror dari Arc 1)
  const centerX = startPos[0] + p.turnRadius;
  const centerZ = startPos[2];


  // Lintasan mirror: cos sama, sin dibalik tanda biar arah putarnya kebalikan
  const curX = centerX - p.turnRadius * Math.cos(theta);
  const curY = startPos[1];
  const curZ = centerZ - p.turnRadius * Math.sin(theta);


  M.body = I();
  rotateY(M.body, currentYaw);
  M.body[12] = curX;
  M.body[13] = curY;
  M.body[14] = curZ;


  // Gait SAMA seperti Arc 1 (freq/amp/clamp identik)
  const freqR = p.approachLegFreq;
  const ampR  = p.approachLegAmp;
  const phaseR = t * 2*Math.PI * freqR;
  const phase0R  = Math.sin(phaseR) * ampR;
  const phaseOppR= Math.sin(phaseR + Math.PI) * ampR;


  const maxLegAngleR = 0.15;
  const flAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phase0R));
  const brAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phase0R));
  const frAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phaseOppR));
  const blAR = Math.max(-maxLegAngleR, Math.min(maxLegAngleR, phaseOppR));


  if (buffers.legFL) M.legFL = mul(M.body, around(RX(flAR * 0.6),  P('legFL')));
  if (buffers.legFR) M.legFR = mul(M.body, around(RX(frAR * 0.6),  P('legFR')));
  if (buffers.legBL) M.legBL = mul(M.body, around(RX(blAR * 0.45), P('legBL')));
  if (buffers.legBR) M.legBR = mul(M.body, around(RX(brAR * 0.45), P('legBR')));


  M.head = mul(M.body, T(0, 0.05, 0.05));
  M.tail = mul(M.body, T(0, -0.05, -0.55));
  applyPulse();


  // kalau kamu masih skip fase final turn, lanjutkan logic kamu setelah ini
  // (mis. set finalTurnTimer = p.finalTurnDuration saat k==1)
  if (k < 1) return;
// langsung mulai final turn di frame berikutnya
finalTurnTimer = 0;
yawStartFinal = currentYaw;   // simpan yaw saat selesai arc2
return;
}


      // 4) FASE PUTAR BALIK DI STARTPOS (180 -> 0)
      if (finalTurnTimer < p.finalTurnDuration) {
        finalTurnTimer += dt;
        const k = Math.min(1, finalTurnTimer / p.finalTurnDuration);
        const e = k*k*(3-2*k);
        currentYaw = yawStartFinal * (1.0 - e);


        M.body = I();
        rotateY(M.body, currentYaw);
        M.body[12] = startPos[0];
        M.body[13] = startPos[1];
        M.body[14] = startPos[2];
   


        // ... (Kaki jiggle) ...
        const turnLegA = Math.sin(t * 6.0) * 0.04;
  if (buffers.legFL) M.legFL = mul(M.body, around(RX(turnLegA), P('legFL')));
        if (buffers.legFR) M.legFR = mul(M.body, around(RX(-turnLegA), P('legFR')));
        if (buffers.legBL) M.legBL = mul(M.body, around(RX(-turnLegA*0.6), P('legBL')));
        if (buffers.legBR) M.legBR = mul(M.body, around(RX(turnLegA*0.6), P('legBR')));
        M.head = mul(M.body, T(0, 0.05, 0.05));
        M.tail = mul(M.body, T(0, -0.05, -0.55));
applyPulse();
        return;
      }


            // 5) RESET CYCLE
      inApproach = true;
      approachTimer = 0;


      // biar fase loncat berikutnya mulai fresh (akan di-set lagi saat approach selesai)
      jumpCount = 0;
      prevJumpCycle = -1;


      returning = false;
      returnTimer = 0;
      returnArcTimer = 0;
      turnTimer = 0;
      finalTurnTimer = 0;
      currentYaw = 0;


      return;
    }


    // -------------------------
    // 2) JUMP LOOP (tetap di basePos)
    // -------------------------
        const jumpTime = t - jumpPhaseStartT;
    const cycle = 3.0;
    const tc = jumpTime % cycle;


    // detect finished cycles to count jumps
    const curJumpCycle = Math.floor(jumpTime / cycle);
    if (curJumpCycle !== prevJumpCycle) {
      if (prevJumpCycle >= 0) {
        jumpCount += 1;
      }
      prevJumpCycle = curJumpCycle;
    }


    if (jumpCount >= 2) {
      returning = true;
      turnTimer = 0;
      returnArcTimer = 0;
      returnTimer = 0;
      finalTurnTimer = 0;
      return;
    }


    // ======= Fase loncat (mirip original) =======
    let jumpY = 0;
    let crouch = 0;
    let legShift = 0;


    if (tc < 0.6) {
      crouch = tc / 0.6;
      jumpY = -p.crouchDepth * crouch;
      legShift = Math.sin(tc * Math.PI) * 0.12;
    }
    else if (tc < 1.4) {
      const p2 = (tc - 0.6) / 0.8;
      jumpY = Math.sin(p2 * Math.PI / 2) * 0.9 - p.crouchDepth;
    }
    else if (tc < 2.0) {
      const p3 = (tc - 1.4) / 0.6;
      const easeIn = 1 - Math.cos(p3 * Math.PI / 2);
      jumpY = (1 - easeIn) * 0.9 - p.crouchDepth;
    }
    else {
      jumpY = 0;
    }


    // ======= BADAN =======
    const bodyY = p.basePos[1] + jumpY;
    M.body = T(p.basePos[0], bodyY, p.basePos[2])


    // ======= KEPALA =======
    // ======= KEPALA (DENGAN ARBITRARY ROTATION) =======


    // 1. Tentukan Sumbu Rotasi Arbitrary
    // Kita akan miringkan kepala secara diagonal,
    // di antara sumbu Y (atas) dan sumbu X (kanan).
    const axisX = 1.0;
    const axisY = 1.0;
    const axisZ = 0.0;
   
    // 2. Tentukan Sudut Rotasi (Animasi)
    // Buat animasi "wobble" atau "head tilt" menggunakan sinus
    const wobbleAngle = Math.sin(t * 2 * Math.PI * 2.0) * 0.025; // Goyang 2x/detik


    // 3. Buat Matriks Rotasi Arbitrary
    const wobbleMatrix = R_axis(wobbleAngle, axisX, axisY, axisZ);


    // 4. Dapatkan offset (posisi) kepala seperti sebelumnya
    const headOffset = T(0, 0.05 - crouch * 0.1, 0.05);


    // 5. Gabungkan:
    // M.body = Transformasi badan
    // headOffset = Pindahkan ke posisi leher
    // wobbleMatrix = Terapkan rotasi "wobble" lokal pada kepala
    M.head = mul(M.body, mul(headOffset, wobbleMatrix));


    // ======= EKOR =======
    M.tail = mul(M.body, T(0, -0.05, -0.55));


    // ======= KAKI (tetap non-rotational here; jumping uses translation shift) =======
    const legY = 0.05 + crouch * -0.1;
    const legFrontZ = 0;
    const legBackZ = 0;
    const legXOff = 0;
    const shift = legShift;


    M.legFL = mul(M.body, T(-legXOff - shift, legY, legFrontZ));
    M.legFR = mul(M.body, T( legXOff + shift, legY, legFrontZ));
    M.legBL = mul(M.body, T(-legXOff - shift, legY, legBackZ));
    M.legBR = mul(M.body, T( legXOff + shift, legY, legBackZ));


    M.earL = mul(M.head, T(-0.08, 0.1, 0.0));
    M.earR = mul(M.head, T( 0.08, 0.1, 0.0));
  }


  return { buffers, M, update, params:p };
}
