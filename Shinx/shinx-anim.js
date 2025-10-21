// luxio-anim.js
import { buildLuxioParts } from '../Luxio/luxio-parts.js';

export function createLuxio(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildLuxioParts(createMesh, meshes);

  // -------- mini mat4 --------
  const I = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  const mul = (A,B) => {
    const m = new Float32Array(16);
    for (let r=0; r<4; r++) for (let c=0; c<4; c++)
      m[c+4*r] = A[4*r+0]*B[c+0] + A[4*r+1]*B[c+4] + A[4*r+2]*B[c+8] + A[4*r+3]*B[c+12];
    return m;
  };
  const T  = (x,y,z)=>{const m=I(); m[12]=x; m[13]=y; m[14]=z; return m;};
  const RX = a => { const c=Math.cos(a), s=Math.sin(a); const m=I(); m[5]=c; m[6]=s; m[9]=-s; m[10]=c; return m; };
  const RY = a => { const c=Math.cos(a), s=Math.sin(a); const m=I(); m[0]=c; m[2]=s; m[8]=-s; m[10]=c; return m; };
  const RZ = a => { const c=Math.cos(a), s=Math.sin(a); const m=I(); m[0]=c; m[1]=s; m[4]=-s; m[5]=c; return m; };

  // pivots
  const P = (name) => {
    const p = pivots && pivots[name];
    return (p && p.length === 3) ? p : [0,0,0];
  };
  const aroundSafe = (R, pivot) => {
    const p = (pivot && pivot.length === 3) ? pivot : [0,0,0];
    return mul(T(p[0],p[1],p[2]), mul(R, T(-p[0],-p[1],-p[2])));
  };

  // matrices
  const M = {
    body:I(), head:I(), earL:I(), earR:I(), tail:I(),
    legFL:I(), legFR:I(), legBL:I(), legBR:I(),
    footFL:I(), footFR:I(), footBL:I(), footBR:I(),
    clawsFL:I(), clawsFR:I(), clawsBL:I(), clawsBR:I(),
    static:I()
  };

  let t = 0;
  const p = {
    basePos:     opts.position ?? [0,0,0],

    // idle
    breatheAmp:  0.05,
    breatheHz:   1.2,
    spin:        0.0,

    tailAmp:     0.35,
    tailHz:      1.2,

    stepAmp:     0.08,
    stepHz:      0.8,

    headYawAmp:  0.25,
    headYawHz:   0.5,

    // ---- Backflip params (staged) ----
    flipDuration: 0.9,   // total durasi
    flipAxis: 'x',       // 'x' backflip, 'y' spin, 'z' roll
    jumpHeight: 1.2,     // puncak lompatan (parabola)
    flipStart:  0.15,    // rotasi mulai setelah naik dulu (15%)
    flipEnd:    0.85,    // rotasi selesai sebelum landing (85%)

    // ground safety
    enableGroundSnap: true,
    groundY: 0.0,
    groundMargin: 0.02,  // sedikit jarak agar tak “nyentuh”
  };

  // state backflip
  let flipProg = -1; // <0 idle, 0..1 berjalan
  function flip(axis='x', duration=p.flipDuration, jump=p.jumpHeight){
    if (flipProg < 0) {
      p.flipAxis    = axis || 'x';
      p.flipDuration= Math.max(0.2, duration || p.flipDuration);
      p.jumpHeight  = (jump ?? p.jumpHeight);
      flipProg = 0;
    }
  }

  // easing helpers
  const easeInOutCos = (k)=> 0.5 - 0.5*Math.cos(Math.PI*k);
  const clamp01 = (x)=> Math.max(0, Math.min(1, x));

  function update(dt){
    t += dt;

    // --- progress flip + staging ---
    let e = 0;                 // eased 0..1
    let gaitScale = 1;         // scale idle while flipping
    let angle = 0;             // final flip angle (rad)

    if (flipProg >= 0) {
      flipProg += dt / Math.max(0.0001, p.flipDuration);
      const k = Math.min(flipProg, 1);
      e = easeInOutCos(k);
      gaitScale = 1 - e; // idle mengecil menuju puncak

      // rotasi hanya pada window [flipStart..flipEnd]
      const r0 = p.flipStart, r1 = p.flipEnd;
      const r = clamp01( (e - r0) / Math.max(0.0001, (r1 - r0)) );
      const rEase = easeInOutCos(r);
      angle = rEase * Math.PI*2.0; // 360°

      if (flipProg >= 1) flipProg = -1;
    }

    // --- base idle (napas + spin) ---
    const bob  = Math.sin(t * 2*Math.PI*p.breatheHz) * p.breatheAmp * gaitScale;
    let base = mul(T(p.basePos[0], p.basePos[1] + bob, p.basePos[2]), RY(t * p.spin));

    // --- apply staged backflip ---
    if (e > 0) {
      // 1) ROTATE around body pivot (backflip: -angle di X)
      const Rflip = (()=>{
        if (p.flipAxis === 'x') return RX(-angle);
        if (p.flipAxis === 'y') return RY(+angle);
        if (p.flipAxis === 'z') return RZ(+angle);
        return RX(-angle);
      })();
      base = mul(base, aroundSafe(Rflip, P('body')));

      // 2) JUMP ARC (parabola 0→H→0, puncak di tengah)
      //    formula: y = 4 * H * e * (1-e)  (selalu >= 0 sepanjang flip)
      const jumpY = 4.0 * (p.jumpHeight || 1.0) * e * (1.0 - e);
      base = mul(T(0, jumpY, 0), base);
    }

    // --- ground clamp (jaga tidak “nyentuh”) ---
    if (p.enableGroundSnap) {
      const minY = p.groundY + (p.groundMargin || 0);
      const ty = base[13];
      if (ty < minY) {
        base = mul(T(0, minY - ty, 0), base);
      }
    }

    // assign
    M.body   = base;
    M.static = M.body;

    // --- head & ears ---
    if (buffers.head) {
      const yaw = Math.sin(t * 2*Math.PI*p.headYawHz) * p.headYawAmp * gaitScale;
      M.head = mul(M.body, aroundSafe(RY(yaw), P('head')));
    }
    if (buffers.earL) M.earL = mul(buffers.head ? M.head : M.body, aroundSafe(RX(0), P('earL')));
    if (buffers.earR) M.earR = mul(buffers.head ? M.head : M.body, aroundSafe(RX(0), P('earR')));

    // --- tail ---
    if (buffers.tail) {
      const wag = Math.sin(t * 2*Math.PI*p.tailHz) * p.tailAmp * gaitScale;
      M.tail = mul(M.body, aroundSafe(RY(wag), P('tail')));
    }

    // --- legs ---
    const step = Math.sin(t * 2*Math.PI*p.stepHz) * p.stepAmp * gaitScale;
    const opp  = -step;

    if (buffers.legFL) M.legFL = mul(M.body, aroundSafe(RX( step), P('legFL')));
    if (buffers.legFR) M.legFR = mul(M.body, aroundSafe(RX( opp ), P('legFR')));
    if (buffers.legBL) M.legBL = mul(M.body, aroundSafe(RX( opp ), P('legBL')));
    if (buffers.legBR) M.legBR = mul(M.body, aroundSafe(RX( step), P('legBR')));

    // --- feet (opsional) ---
    if (buffers.footFL) M.footFL = mul(M.legFL, aroundSafe(RX(-step*0.5), P('footFL')));
    if (buffers.footFR) M.footFR = mul(M.legFR, aroundSafe(RX(-opp *0.5), P('footFR')));
    if (buffers.footBL) M.footBL = mul(M.legBL, aroundSafe(RX(-opp *0.5), P('footBL')));
    if (buffers.footBR) M.footBR = mul(M.legBR, aroundSafe(RX(-step*0.5), P('footBR')));

    // --- claws ikut foot/leg ---
    if (buffers.clawsFL) M.clawsFL = buffers.footFL ? M.footFL : M.legFL;
    if (buffers.clawsFR) M.clawsFR = buffers.footFR ? M.footFR : M.legFR;
    if (buffers.clawsBL) M.clawsBL = buffers.footBL ? M.footBL : M.legBL;
    if (buffers.clawsBR) M.clawsBR = buffers.footBR ? M.footBR : M.legBR;
  }

  // expose API
  return { buffers, M, update, params: p, flip };
}
