// luxray-anim.js
import { buildLuxrayParts } from './luxray-parts.js';

export function createLuxray(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildLuxrayParts(createMesh, meshes);

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

  // safe pivot getter (fallback [0,0,0])
  const P = (name) => {
    const p = pivots && pivots[name];
    return (p && p.length === 3) ? p : [0,0,0];
  };
  const aroundSafe = (R, pivot) => {
    const p = (pivot && pivot.length === 3) ? pivot : [0,0,0];
    return mul(T(p[0],p[1],p[2]), mul(R, T(-p[0],-p[1],-p[2])));
  };

  // matriks per-part (hanya dipakai jika buffer-nya ada)
  const M = {
    body:I(), head:I(), earL:I(), earR:I(), tail:I(),
    legFL:I(), legFR:I(), legBL:I(), legBR:I(),
    // kalau foot/claws dipisah, tetap sediakan
    footFL:I(), footFR:I(), footBL:I(), footBR:I(),
    clawsFL:I(), clawsFR:I(), clawsBL:I(), clawsBR:I(),
    static:I()
  };

  let t = 0;
  const p = {
    basePos:   opts.position ?? [0,0,0],
    breatheAmp: 0.05,  breatheHz: 1.1,
    spin:        0.0,
    tailAmp:     0.36, tailHz:   1.2,
    stepAmp:     0.18, stepHz:   1.0,   // ayunan kaki
    headYawAmp:  0.25, headYawHz: 0.6,  // gerak kepala halus
    earWiggleAmp: 0.08, earWiggleHz: 1.6
  };

  function update(dt){
    t += dt;

    // body: napas + (opsional) spin
    const bob  = Math.sin(t * 2*Math.PI*p.breatheHz) * p.breatheAmp;
    const base = mul(T(p.basePos[0], p.basePos[1] + bob, p.basePos[2]), RY(t * p.spin));
    M.body   = base;
    M.static = M.body; // static parts nempel ke body

    // head & subtle yaw (jika ada)
    if (buffers.head) {
      const yaw = Math.sin(t * 2*Math.PI*p.headYawHz) * p.headYawAmp;
      M.head = mul(M.body, aroundSafe(RY(yaw), P('head')));
    }

    // ears: ikut kepala, tidak goyang
if (buffers.earL) M.earL = mul(M.head, T(0,0,0)); // langsung ikut kepala
if (buffers.earR) M.earR = mul(M.head, T(0,0,0));

    // tail wag — jika tail sudah digabung ke body (tidak ada buffer.tail) maka skip
    if (buffers.tail) {
      const wag = Math.sin(t * 2*Math.PI*p.tailHz) * p.tailAmp;
      M.tail = mul(M.body, aroundSafe(RY(wag), P('tail')));
    }

    // ----- kaki: step cycle -----
    const step = Math.sin(t * 2*Math.PI*p.stepHz) * p.stepAmp;
    const opp  = -step;

    if (buffers.legFL) M.legFL = mul(M.body, aroundSafe(RX( step), P('legFL')));
    if (buffers.legFR) M.legFR = mul(M.body, aroundSafe(RX( opp ), P('legFR')));
    if (buffers.legBL) M.legBL = mul(M.body, aroundSafe(RX( opp ), P('legBL')));
    if (buffers.legBR) M.legBR = mul(M.body, aroundSafe(RX( step), P('legBR')));

    // feet (jika terpisah)
    if (buffers.footFL) M.footFL = mul(M.legFL, aroundSafe(RX(-step*0.45), P('footFL')));
    if (buffers.footFR) M.footFR = mul(M.legFR, aroundSafe(RX(-opp *0.45), P('footFR')));
    if (buffers.footBL) M.footBL = mul(M.legBL, aroundSafe(RX(-opp *0.45), P('footBL')));
    if (buffers.footBR) M.footBR = mul(M.legBR, aroundSafe(RX(-step*0.45), P('footBR')));

    // claws mengikuti foot jika ada, atau mengikuti leg jika foot tidak dipisah
    if (buffers.clawsFL) M.clawsFL = buffers.footFL ? M.footFL : M.legFL;
    if (buffers.clawsFR) M.clawsFR = buffers.footFR ? M.footFR : M.legFR;
    if (buffers.clawsBL) M.clawsBL = buffers.footBL ? M.footBL : M.legBL;
    if (buffers.clawsBR) M.clawsBR = buffers.footBR ? M.footBR : M.legBR;

    // catatan: jika 'star' (bintang ekor) tidak di-merge ke body dan kamu ingin star ikut ekor,
    // render star dengan M.tail pada renderer (Luxray-only.html does that if needed).
  }

  return { buffers, M, update, params: p };
}
