// luxio-anim.js (LEAP + lock legs during leap)
import { buildLuxioParts } from './luxio-parts.js';

export function createLuxio(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildLuxioParts(createMesh, meshes);

  // -------- mini mat4 --------
  const I = () => new Float32Array([1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1]);
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
  const S  = (sx,sy,sz)=>{const m=I(); m[0]=sx; m[5]=sy; m[10]=sz; return m; };

  // Rotasi sumbu sebarang (Rodrigues)
  const RAxis = (ax, ay, az, a) => {
    let len = Math.hypot(ax, ay, az) || 1;
    ax/=len; ay/=len; az/=len;
    const c=Math.cos(a), s=Math.sin(a), t=1-c, m=I();
    m[0]=t*ax*ax+c;     m[1]=t*ax*ay+s*az; m[2]=t*ax*az-s*ay;
    m[4]=t*ax*ay-s*az;  m[5]=t*ay*ay+c;    m[6]=t*ay*az+s*ax;
    m[8]=t*ax*az+s*ay;  m[9]=t*ay*az-s*ax; m[10]=t*az*az+c;
    return m;
  };

  // pivot & transform di sekitar pivot
  const P = (name) => {
    const p = pivots && pivots[name];
    return (p && p.length === 3) ? p : [0,0,0];
  };
  const aroundSafe = (Mtx, pivot) => {
    const p = (pivot && pivot.length === 3) ? pivot : [0,0,0];
    return mul(T(p[0],p[1],p[2]), mul(Mtx, T(-p[0],-p[1],-p[2])));
  };

  // matriks per-part
  const M = {
    body:I(), head:I(), earL:I(), earR:I(), tail:I(),
    legFL:I(), legFR:I(), legBL:I(), legBR:I(),
    footFL:I(), footFR:I(), footBL:I(), footBR:I(),
    clawsFL:I(), clawsFR:I(), clawsBL:I(), clawsBR:I(),
    static:I()
  };

  let t = 0;
  const p = {
    // ===== Root/world translate (idle glide) =====
    basePos:       opts.position ?? [0,0,0],
    orbitHz:       0.06,
    orbitRadiusXY: [0.6, 0.4], // X/Z

    // ===== Idle breathe (Scaling + bob) =====
    breatheHz:     1.0,
    breatheAmp:    0.05,

    // ===== Body rotations (idle) =====
    bodyYawHz:     0.22,
    bodyYawAmp:    0.22,
    bodySwayAxis:  [0.3, 1.0, 0.2], // arbitrary axis untuk sway ringan
    bodySwayHz:    0.16,
    bodySwayAmp:   0.14,

    // ===== Head =====
    headYawHz:     0.6,
    headYawAmp:    0.22,

    // ===== Tail (Arbitrary-axis wag) =====
    tailHz:        1.2,
    tailAmp:       0.32,
    tailAxis:      [0,1,1],
    useArbTail:    true,

    // ===== Legs/feet =====
    stepHz:        0.9,
    stepAmp:       0.10,
    footComp:      0.5,

    // ===== LEAP (pounce) =====
    leapDuration:  0.95,
    leapDistance:  3.5,
    leapHeight:    1.2,
    crouchFrac:    0.25,
    landFrac:      0.20,
    crouchScaleY:  0.82,
    crouchPitch:   +0.10,
    flightPitch:   -0.18,
    landSquash:    0.12,
    tailCounter:   0.25,

    // >>> NEW: Lock legs during leap <<<
    lockLegsDuringLeap: true,

    // ===== Safety ground (opsional) =====
    enableGroundSnap: false,
    groundY:       0.0,
  };

  // ====== State for LEAP ======
  let leapK = -1;   // <0: idle, 0..1: in progress

  // Easing helpers
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const easeInOutCos = k => 0.5 - 0.5*Math.cos(Math.PI*k);
  const easeOutCubic = k => 1 - Math.pow(1 - clamp01(k), 3);
  const smoothstep = k => k*k*(3-2*k);

  // Trigger leap (alias flip)
  function leap(duration=p.leapDuration, dist=p.leapDistance, height=p.leapHeight){
    if (leapK < 0){
      p.leapDuration = Math.max(0.25, duration || p.leapDuration);
      p.leapDistance = (dist ?? p.leapDistance);
      p.leapHeight   = (height ?? p.leapHeight);
      leapK = 0;
    }
  }
  const flip = () => leap(); // alias agar HTML lama yang pakai flip() tetap berfungsi

  function update(dt){
    t += dt;

    // ===== Root/world translate (idle glide) =====
    const orbAng = t * 2*Math.PI * p.orbitHz;
    const cx = Math.cos(orbAng), sz = Math.sin(orbAng);
    const moveX = (p.orbitRadiusXY?.[0] ?? 0.6) * cx;
    const moveZ = (p.orbitRadiusXY?.[1] ?? 0.4) * sz;

    // breathe bob + basePos (Translate)
    const bob = Math.sin(t * 2*Math.PI * p.breatheHz) * p.breatheAmp;
    let base = T(p.basePos[0] + moveX, p.basePos[1] + bob, p.basePos[2] + moveZ);

    // ===== LEAP progress =====
    let k = -1, eArc = 0, gaitScale = 1, inLeap = false;
    if (leapK >= 0){
      leapK += dt / Math.max(0.0001, p.leapDuration);
      k = Math.min(leapK, 1);
      eArc = easeInOutCos(k);
      gaitScale = 1 - smoothstep(k);
      inLeap = true;
      if (leapK >= 1) leapK = -1;
    }

    // ===== Body idle rotations (damped during leap) =====
    const yaw = Math.sin(t * 2*Math.PI * p.bodyYawHz) * p.bodyYawAmp * (inLeap ? 0.25*gaitScale : 1);
    base = mul(base, aroundSafe(RY(yaw), P('body')));

    const sway = Math.sin(t * 2*Math.PI * p.bodySwayHz) * p.bodySwayAmp * (inLeap ? 0.25*gaitScale : 1);
    base = mul(base, aroundSafe(RAxis(p.bodySwayAxis[0],p.bodySwayAxis[1],p.bodySwayAxis[2], sway), P('body')));

    // ===== Body scaling (breathing) =====
    const sYIdle = 1 + 0.04 * Math.sin(t * 2*Math.PI * p.breatheHz) * (inLeap ? 0.2*gaitScale : 1);
    base = mul(base, aroundSafe(S(1, sYIdle, 1), P('body')));

    // ===== LEAP phases =====
    if (inLeap){
      const crouchEnd = p.crouchFrac;
      const landStart = 1 - p.landFrac;

      // CROUCH
      if (k <= crouchEnd){
        const kc = k / Math.max(1e-6, crouchEnd); // 0..1
        const sy = 1 - (1 - p.crouchScaleY) * easeOutCubic(kc);
        base = mul(base, aroundSafe(S(1, sy, 1), P('body')));
        base = mul(base, aroundSafe(RX(p.crouchPitch * kc), P('body')));
      }

      // FLIGHT: world up + local forward
      const arcY = Math.sin(eArc * Math.PI) * p.leapHeight;
      base = mul(T(0, arcY, 0), base); // world up
      const dist = p.leapDistance * easeInOutCos(k);
      base = mul(base, T(0, 0, dist)); // local +Z
      const pitch = p.flightPitch * Math.sin(Math.PI * Math.min(1, Math.max(0, (k - crouchEnd)/(Math.max(1e-6, landStart - crouchEnd)))));
      base = mul(base, aroundSafe(RX(pitch), P('body')));

      // LAND: squash & recover
      if (k >= landStart){
        const kl = (k - landStart) / Math.max(1e-6, (1 - landStart));
        const sy = 1 - p.landSquash * Math.sin(kl * Math.PI);
        base = mul(base, aroundSafe(S(1, sy, 1), P('body')));
      }
    }

    // Ground snap (opsional)
    if (p.enableGroundSnap) {
      const ty = base[13];
      if (ty < p.groundY) base = mul(T(0, p.groundY - ty, 0), base);
    }

    // Root
    M.body   = base;
    M.static = M.body;

    // Head & ears
    if (buffers.head) {
      const hyIdle = Math.sin(t * 2*Math.PI * p.headYawHz) * p.headYawAmp * (inLeap ? 0.2*gaitScale : 1);
      M.head = mul(M.body, aroundSafe(RY(hyIdle), P('head')));
    }
    if (buffers.earL) M.earL = mul(buffers.head ? M.head : M.body, aroundSafe(RX(0), P('earL')));
    if (buffers.earR) M.earR = mul(buffers.head ? M.head : M.body, aroundSafe(RX(0), P('earR')));

    // Tail (wag + counter in leap)
    if (buffers.tail) {
      const wag = Math.sin(t * 2*Math.PI * p.tailHz) * p.tailAmp * (inLeap ? 0.3*gaitScale : 1);
      const Rt = p.useArbTail
        ? RAxis(p.tailAxis?.[0] ?? 0, p.tailAxis?.[1] ?? 1, p.tailAxis?.[2] ?? 0, wag)
        : RY(wag);
      let tailM = mul(M.body, aroundSafe(Rt, P('tail')));
      if (inLeap) tailM = mul(tailM, aroundSafe(RX(p.tailCounter), P('tail')));
      M.tail = tailM;
    }

    // ===== Legs =====
    const step = Math.sin(t * 2*Math.PI * p.stepHz) * p.stepAmp * (inLeap ? 0.2*gaitScale : 1);
    const opp  = -step;
    const leapFront = inLeap ? +0.6 * Math.sin(Math.min(1, k) * Math.PI) : 0;
    const leapBack  = inLeap ? -0.6 * Math.sin(Math.min(1, k) * Math.PI) : 0;

    if (p.lockLegsDuringLeap && inLeap) {
      // --- LOCK: kaki menyatu dengan body selama leap ---
      if (buffers.legFL) M.legFL = M.body;
      if (buffers.legFR) M.legFR = M.body;
      if (buffers.legBL) M.legBL = M.body;
      if (buffers.legBR) M.legBR = M.body;
    } else {
      // --- Normal swing/pose ---
      if (buffers.legFL) M.legFL = mul(M.body, aroundSafe(RX(step + leapFront), P('legFL')));
      if (buffers.legFR) M.legFR = mul(M.body, aroundSafe(RX(opp  + leapFront), P('legFR')));
      if (buffers.legBL) M.legBL = mul(M.body, aroundSafe(RX(opp  + leapBack ), P('legBL')));
      if (buffers.legBR) M.legBR = mul(M.body, aroundSafe(RX(step + leapBack ), P('legBR')));
    }

    // Feet (compensate) — otomatis ikut parent (body saat lock)
    const fc = p.footComp ?? 0.5;
    const footFLParent = buffers.legFL ? M.legFL : M.body;
    const footFRParent = buffers.legFR ? M.legFR : M.body;
    const footBLParent = buffers.legBL ? M.legBL : M.body;
    const footBRParent = buffers.legBR ? M.legBR : M.body;

    if (buffers.footFL) M.footFL = mul(footFLParent, aroundSafe(RX(-step*fc), P('footFL')));
    if (buffers.footFR) M.footFR = mul(footFRParent, aroundSafe(RX(-opp *fc), P('footFR')));
    if (buffers.footBL) M.footBL = mul(footBLParent, aroundSafe(RX(-opp *fc), P('footBL')));
    if (buffers.footBR) M.footBR = mul(footBRParent, aroundSafe(RX(-step*fc), P('footBR')));

    // Claws follow
    if (buffers.clawsFL) M.clawsFL = buffers.footFL ? M.footFL : (buffers.legFL ? M.legFL : M.body);
    if (buffers.clawsFR) M.clawsFR = buffers.footFR ? M.footFR : (buffers.legFR ? M.legFR : M.body);
    if (buffers.clawsBL) M.clawsBL = buffers.footBL ? M.footBL : (buffers.legBL ? M.legBL : M.body);
    if (buffers.clawsBR) M.clawsBR = buffers.footBR ? M.footBR : (buffers.legBR ? M.legBR : M.body);
  }

  // expose
  return { buffers, M, update, params: p, leap, flip };
}