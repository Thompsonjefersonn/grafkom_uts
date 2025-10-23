import { buildLuxioParts } from './luxio-parts.js';

export function createLuxio(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildLuxioParts(createMesh, meshes);

  const I = () => new Float32Array([1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1]);
  const D = a => a * Math.PI / 180;
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

  const RAxis = (ax, ay, az, a) => {
    let len = Math.hypot(ax, ay, az) || 1;
    ax/=len; ay/=len; az/=len;
    const c=Math.cos(a), s=Math.sin(a), t=1-c, m=I();
    m[0]=t*ax*ax+c;     m[1]=t*ax*ay+s*az; m[2]=t*ax*az-s*ay;
    m[4]=t*ax*ay-s*az;  m[5]=t*ay*ay+c;    m[6]=t*ay*az+s*ax;
    m[8]=t*ax*az+s*ay;  m[9]=t*ay*az-s*ax; m[10]=t*az*az+c;
    return m;
  };

  const P = (name) => {
    const p = pivots && pivots[name];
    return (p && p.length === 3) ? p : [0,0,0];
  };
  const aroundSafe = (Mtx, pivot) => {
    const p = (pivot && pivot.length === 3) ? pivot : [0,0,0];
    return mul(T(p[0],p[1],p[2]), mul(Mtx, T(-p[0],-p[1],-p[2])));
  };

  const M = {
    body:I(), head:I(), earL:I(), earR:I(), tail1:I(),
    tail2:I(), 
    legFL:I(), legFR:I(), legBL:I(), legBR:I(),
    footFL:I(), footFR:I(), footBL:I(), footBR:I(),
    clawsFL:I(), clawsFR:I(), clawsBL:I(), clawsBR:I(),
    static:I()
  };

  let t = 0;
  const p = {
    basePos:       opts.position ?? [0,0,0],
    orbitHz:       0.06,
    orbitRadiusXY: [0.6, 0.4],

    breatheHz:     1.0,
    breatheAmp:    0.05,

    bodyYawHz:     0.22,
    bodyYawAmp:    0.22,
    bodySwayAxis:  [0.3, 1.0, 0.2],
    bodySwayHz:    0.16,
    bodySwayAmp:   0.14,

    headYawHz:     0.6,
    headYawAmp:    0.10,

    headRollHz: 0.06,
    headRollAmp: 0.05,


    

tailHz:        0.1,
tailAmp:       0.1,
tailAxis:      [0,1,1],
useArbTail:    true,

tailSegPhase:  0.5,
tailSegGain:   1.15,
tailLeapDamp:  0.30,

    stepHz:        0.9,
    stepAmp:       0.10,
    footComp:      0.5,

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

    lockLegsDuringLeap: true,

    enableGroundSnap: false,
    groundY:       0.0,
  };

  let leapK = -1;

  const clamp01 = x => Math.max(0, Math.min(1, x));
  const easeInOutCos = k => 0.5 - 0.5*Math.cos(Math.PI*k);
  const easeOutCubic = k => 1 - Math.pow(1 - clamp01(k), 3);
  const smoothstep = k => k*k*(3-2*k);

  function leap(duration=p.leapDuration, dist=p.leapDistance, height=p.leapHeight){
    if (leapK < 0){
      p.leapDuration = Math.max(0.25, duration || p.leapDuration);
      p.leapDistance = (dist ?? p.leapDistance);
      p.leapHeight   = (height ?? p.leapHeight);
      leapK = 0;
    }
  }
  const flip = () => leap();






  function update(dt){
    t += dt;

    const orbAng = t * 2*Math.PI * p.orbitHz;
    const cx = Math.cos(orbAng), sz = Math.sin(orbAng);
    const moveX = (p.orbitRadiusXY?.[0] ?? 0.6) * cx;
    const moveZ = (p.orbitRadiusXY?.[1] ?? 0.4) * sz;

    const bob = Math.sin(t * 2*Math.PI * p.breatheHz) * p.breatheAmp;
    let base = T(p.basePos[0] + moveX, p.basePos[1] + bob, p.basePos[2] + moveZ);

    let k = -1, eArc = 0, gaitScale = 1, inLeap = false;
    if (leapK >= 0){
      leapK += dt / Math.max(0.0001, p.leapDuration);
      k = Math.min(leapK, 1);
      eArc = easeInOutCos(k);
      gaitScale = 1 - smoothstep(k);
      inLeap = true;
      if (leapK >= 1) leapK = -1;
    }

    const yaw = Math.sin(t * 2*Math.PI * p.bodyYawHz) * p.bodyYawAmp * (inLeap ? 0.25*gaitScale : 1);
    base = mul(base, aroundSafe(RY(yaw), P('body')));

    const sway = Math.sin(t * 2*Math.PI * p.bodySwayHz) * p.bodySwayAmp * (inLeap ? 0.25*gaitScale : 1);
    base = mul(base, aroundSafe(RAxis(p.bodySwayAxis[0],p.bodySwayAxis[1],p.bodySwayAxis[2], sway), P('body')));

    const sYIdle = 1 + 0.04 * Math.sin(t * 2*Math.PI * p.breatheHz) * (inLeap ? 0.2*gaitScale : 1);
    base = mul(base, aroundSafe(S(1, sYIdle, 1), P('body')));

    if (inLeap){
      const crouchEnd = p.crouchFrac;
      const landStart = 1 - p.landFrac;

      if (k <= crouchEnd){
        const kc = k / Math.max(1e-6, crouchEnd);
        const sy = 1 - (1 - p.crouchScaleY) * easeOutCubic(kc);
        base = mul(base, aroundSafe(S(1, sy, 1), P('body')));
        base = mul(base, aroundSafe(RX(p.crouchPitch * kc), P('body')));
      }

      const arcY = Math.sin(eArc * Math.PI) * p.leapHeight;
      base = mul(T(0, arcY, 0), base);
      const dist = p.leapDistance * easeInOutCos(k);
      base = mul(base, T(0, 0, dist));
      const pitch = p.flightPitch * Math.sin(Math.PI * Math.min(1, Math.max(0, (k - crouchEnd)/(Math.max(1e-6, landStart - crouchEnd)))));
      base = mul(base, aroundSafe(RX(pitch), P('body')));

      if (k >= landStart){
        const kl = (k - landStart) / Math.max(1e-6, (1 - landStart));
        const sy = 1 - p.landSquash * Math.sin(kl * Math.PI);
        base = mul(base, aroundSafe(S(1, sy, 1), P('body')));
      }
    }

    if (p.enableGroundSnap) {
      const ty = base[13];
      if (ty < p.groundY) base = mul(T(0, p.groundY - ty, 0), base);
    }

    M.body   = base;
    M.static = M.body;

if (buffers.head) {
  const hyIdle = Math.sin(t*2*Math.PI*p.headYawHz) * p.headYawAmp * (inLeap ? 0.2*gaitScale : 1);
  const hRoll  = Math.sin(t*2*Math.PI*p.headRollHz) * p.headRollAmp * (inLeap ? 0.3*gaitScale : 1);
  let H = mul(M.body, aroundSafe(RY(hyIdle), P('head')));
  H = mul(H, aroundSafe(RZ(hRoll), P('head')));
  M.head = H;
}

    if (buffers.earL) M.earL = mul(buffers.head ? M.head : M.body, aroundSafe(RX(0), P('earL')));
    if (buffers.earR) M.earR = mul(buffers.head ? M.head : M.body, aroundSafe(RX(0), P('earR')));

const wag = Math.sin(t * 2*Math.PI * p.tailHz) * p.tailAmp * (inLeap ? 0.3*gaitScale : 1);

if (buffers.tail1) {
  let T1 = mul(M.body, aroundSafe(RY(wag), P('tail1')));
  if (inLeap) T1 = mul(T1, aroundSafe(RX(p.tailCounter), P('tail1')));
  M.tail1 = T1;

  if (buffers.tail2) {
    M.tail2 = M.tail1;
  }
} else if (buffers.tail) {
  const Rt = p.useArbTail
    ? RAxis(p.tailAxis?.[0] ?? 0, p.tailAxis?.[1] ?? 1, p.tailAxis?.[2] ?? 0, wag)
    : RY(wag);
  let tailM = mul(M.body, aroundSafe(Rt, P('tail')));
  if (inLeap) tailM = mul(tailM, aroundSafe(RX(p.tailCounter), P('tail')));
  M.tail = tailM;
}



    const step = Math.sin(t * 2*Math.PI * p.stepHz) * p.stepAmp * (inLeap ? 0.2*gaitScale : 1);
    const opp  = -step;
    const leapFront = inLeap ? +0.6 * Math.sin(Math.min(1, k) * Math.PI) : 0;
    const leapBack  = inLeap ? -0.6 * Math.sin(Math.min(1, k) * Math.PI) : 0;

    if (p.lockLegsDuringLeap && inLeap) {
      if (buffers.legFL) M.legFL = M.body;
      if (buffers.legFR) M.legFR = M.body;
      if (buffers.legBL) M.legBL = M.body;
      if (buffers.legBR) M.legBR = M.body;
      if (buffers.tail)  M.tail  = M.body;
    } else {
      if (buffers.legFL) M.legFL = mul(M.body, aroundSafe(RX(step + leapFront), P('legFL')));
      if (buffers.legFR) M.legFR = mul(M.body, aroundSafe(RX(opp  + leapFront), P('legFR')));
      if (buffers.legBL) M.legBL = mul(M.body, aroundSafe(RX(opp  + leapBack ), P('legBL')));
      if (buffers.legBR) M.legBR = mul(M.body, aroundSafe(RX(step + leapBack ), P('legBR')));
    }

    const fc = p.footComp ?? 0.5;
    const footFLParent = buffers.legFL ? M.legFL : M.body;
    const footFRParent = buffers.legFR ? M.legFR : M.body;
    const footBLParent = buffers.legBL ? M.legBL : M.body;
    const footBRParent = buffers.legBR ? M.legBR : M.body;

    if (buffers.footFL) M.footFL = mul(footFLParent, aroundSafe(RX(-step*fc), P('footFL')));
    if (buffers.footFR) M.footFR = mul(footFRParent, aroundSafe(RX(-opp *fc), P('footFR')));
    if (buffers.footBL) M.footBL = mul(footBLParent, aroundSafe(RX(-opp *fc), P('footBL')));
    if (buffers.footBR) M.footBR = mul(footBRParent, aroundSafe(RX(-step*fc), P('footBR')));

    

    if (buffers.clawsFL) M.clawsFL = buffers.footFL ? M.footFL : (buffers.legFL ? M.legFL : M.body);
    if (buffers.clawsFR) M.clawsFR = buffers.footFR ? M.footFR : (buffers.legFR ? M.legFR : M.body);
    if (buffers.clawsBL) M.clawsBL = buffers.footBL ? M.footBL : (buffers.legBL ? M.legBL : M.body);
    if (buffers.clawsBR) M.clawsBR = buffers.footBR ? M.footBR : (buffers.legBR ? M.legBR : M.body);
  }

  return { buffers, M, update, params: p, leap, flip };
}