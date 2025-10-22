// luxray-anim.js
import { buildLuxrayParts } from './luxray-parts.js';


export function createLuxray(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildLuxrayParts(createMesh, meshes);


  // --- util matriks ---
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
  const T  = (x,y,z)=>{const m=I(); m[12]=x; m[13]=y; m[14]=z; return m;};
  const RX = a => {const c=Math.cos(a), s=Math.sin(a); const m=I(); m[5]=c; m[6]=s; m[9]=-s; m[10]=c; return m;};


  const P = (n)=>pivots?.[n] ?? [0,0,0];
  const around = (R,p)=>mul(T(p[0],p[1],p[2]),mul(R,T(-p[0],-p[1],-p[2])));


  const M = {
    body:I(), head:I(), tail:I(), earL:I(), earR:I(),
    legFL:I(), legFR:I(), legBL:I(), legBR:I(),
    static:I()
  };


  let t=0;


  // params (bisa di-override lewat opts)
const p = {
  basePos: opts.position ?? [0,0,0],
  jumpPeriod: 2.5,
  jumpHeight: 0.7,
  crouchDepth: 0.2,
  legBend: 0.6,
  startBehind: opts.startBehind ?? 4.0,     
  approachDuration: opts.approachDuration ?? 4.0, 
  approachStepAmp: 0.2,                     
  tailWagDuringApproach: true
};

  // posisi awal (di belakang target pada sumbu Z)
  const startPos = [ p.basePos[0], p.basePos[1], p.basePos[2] - p.startBehind ];

  // state pendek
  let inApproach = true;
  let approachTimer = 0;


  function update(dt) {
    t += dt;

    // -------------------------
    // 1) APPROACH PHASE (maju sekali)
    // -------------------------
    if (inApproach) {
      approachTimer += dt;
      const u = Math.min(1, approachTimer / p.approachDuration); // 0..1
      const ease = u*u*(3 - 2*u);
      const curX = startPos[0] + (p.basePos[0] - startPos[0]) * ease;
      const curY = startPos[1] + (p.basePos[1] - startPos[1]) * ease;
      const curZ = startPos[2] + (p.basePos[2] - startPos[2]) * ease;
      const bob = Math.sin(t * 2*Math.PI * 1.2) * 0.03 * (1 - u);

      M.body = T(curX, curY + bob, curZ);
      M.static = M.body;

      const rawStep = Math.sin(t * 2*Math.PI * 1.8) * p.approachStepAmp * (1 - 0.6 * u);
      const maxLegAngle = 0.15; 
      const step = Math.max(-maxLegAngle, Math.min(maxLegAngle, rawStep));
      const opp  = -step;

      if (buffers.legFL) M.legFL = mul(M.body, around(RX(step * 0.6), P('legFL')));
      if (buffers.legFR) M.legFR = mul(M.body, around(RX(opp  * 0.6), P('legFR')));
      if (buffers.legBL) M.legBL = mul(M.body, around(RX(opp  * 0.45), P('legBL')));
      if (buffers.legBR) M.legBR = mul(M.body, around(RX(step * 0.45), P('legBR')));

      if (buffers.head) M.head = mul(M.body, T(0, 0.05 - 0.08 * (1-u), 0.05));

      if (p.tailWagDuringApproach && buffers.tail) {
        const wag = Math.sin(t * 2*Math.PI * 2.0) * 0.18 * (1 - 0.5 * u);
        M.tail = mul(M.body, T(0, -0.05, -0.55));
        M.tail = mul(M.tail, around(RX(0), P('tail'))); 
      }

      if (u >= 1) {
        inApproach = false;
      } else {
        return; 
      }
    }

    // -------------------------
    // 2) JUMP & STRETCH (satu kali)
    // -------------------------
    const jumpTime = t - approachTimer;
    const tc = jumpTime; 

    // ======= Fase loncat & stretch =======
    let jumpY = 0;
    let crouch = 0;
    let legShift = 0;
    
    // Variabel untuk stretch
    let bodyRotX = 0; 
    let legFrontZ_stretch = 0;
    let legRotX_stretch = 0; // UBAH: Kita matikan ini

    // Konstanta waktu untuk fase-fase
    const JUMP_END = 2.0;
    const PAUSE_END = 3.0;    
    const STRETCH_PEAK = 4.5; 
    const STRETCH_END = 6.0;  

    if (tc < 0.6) {
      crouch = tc / 0.6;
      jumpY = -p.crouchDepth * crouch; 
      legShift = Math.sin(tc * Math.PI) * 0.12;
    }
    else if (tc < 1.4) {
      const p2 = (tc - 0.6) / 0.8;
      jumpY = Math.sin(p2 * Math.PI / 2) * 0.9 - p.crouchDepth;
      crouch = (1.0 - p2); 
    }
    else if (tc < JUMP_END) { // (1.4 -> 2.0)
      const p3 = (tc - 1.4) / (JUMP_END - 1.4); 
      const easeIn = 1 - Math.cos(p3 * Math.PI / 2); 
      jumpY = (1 - easeIn) * 0.9 - p.crouchDepth;
      crouch = 0; 
    }
    else if (tc < PAUSE_END) { // (2.0 -> 3.0)
      jumpY = 0;
      crouch = 0;
    }
    else if (tc < STRETCH_PEAK) { // (3.0 -> 4.5)
      // Fase MASUK stretch
      const u = (tc - PAUSE_END) / (STRETCH_PEAK - PAUSE_END); // 0..1
      const ease = u*u*(3 - 2*u); // smoothstep
      
      bodyRotX = ease * 0.4; // Badan nunduk
      legFrontZ_stretch = 0; // UBAH: Jangan geser kaki
      legRotX_stretch = ease * -0.7; // UBAH: Rotasi kaki ke depan (negatif X)
      jumpY = ease * 0.1; 
      crouch = ease * 0.15; 
    }
    else if (tc < STRETCH_END) { // (4.5 -> 6.0)
      // Fase KELUAR stretch
      const u = (tc - STRETCH_PEAK) / (STRETCH_END - STRETCH_PEAK); // 0..1
      const ease = u*u*(3 - 2*u); // smoothstep

      bodyRotX = (1.0 - ease) * 0.4; // kembali ke 0
      legFrontZ_stretch = 0; // UBAH: Jangan geser kaki
      legRotX_stretch = (1.0 - ease) * -0.7; // UBAH: Rotasi kaki kembali
      jumpY = (1.0 - ease) * 0.1; // kembali ke 0
      crouch = (1.0 - ease) * 0.15; // kembali ke 0
    }
    else { // (tc >= 6.0)
      // fase istirahat
      jumpY = 0;
      crouch = 0;
      bodyRotX = 0;
      legFrontZ_stretch = 0;
      legRotX_stretch = 0; // UBAH: Pastikan reset
    }


    // ======= BADAN =======
    const bodyY = p.basePos[1] + jumpY;
    M.static = T(p.basePos[0], bodyY, p.basePos[2]);
    M.body = mul(M.static, RX(bodyRotX)); // M.body nunduk


    // ======= KEPALA (nempel di badan depan) =======
    const headOffset = T(0, 0.05 - crouch * 0.1, 0.05);
    M.head = mul(M.body, headOffset); // Nempel ke M.body yg nunduk


    // ======= EKOR (nempel di badan belakang) =======
    const wag = (tc < JUMP_END) ? Math.sin((t) * 2*Math.PI * 2.0) * 0.35 : 0;
    M.tail = mul(M.static, T(0, -0.05, -0.55)); // Nempel ke M.static (tidak nunduk)


    // ======= KAKI =======
    const legY = 0.05 + crouch * -0.1;  
    const legFrontZ =  0 + legFrontZ_stretch; // Ambil pergeseran Z
    const legBackZ  = 0;
    const legXOff   = 0;

    // Kaki depan (geser saat ancang & stretch)
    // Kaki depan (geser saat ancang & stretch)
    const shift = legShift;
    
    // UBAH: Buat matriks rotasi dari variabel stretch kita
    const legFrontRotation = RX(legRotX_stretch);
    
    const local_T_FL = T(-legXOff - shift, legY, legFrontZ); // legFrontZ sekarang 0
    // Kaki depan nempel ke M.body.
    // Urutan: Body -> Translasi ke sendi kaki -> Rotasi di sendi kaki
    M.legFL = mul(M.body, mul(local_T_FL, legFrontRotation));

    const local_T_FR = T( legXOff + shift, legY, legFrontZ); // legFrontZ sekarang 0
    M.legFR = mul(M.body, mul(local_T_FR, legFrontRotation));

    // Kaki belakang (tetap nempel ke static, tidak berotasi)
    M.legBL = mul(M.static, T(-legXOff - shift, legY, legBackZ));
    M.legBR = mul(M.static, T( legXOff + shift, legY, legBackZ));


    // ======= TELINGA =======
    M.earL = mul(M.head, T(-0.08, 0.1, 0.0));
    M.earR = mul(M.head, T( 0.08, 0.1, 0.0));
  }


  return { buffers, M, update, params:p };
}