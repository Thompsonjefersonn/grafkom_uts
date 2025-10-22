// shinx-anim.js
import { buildShinxParts } from './shinx-parts.js';

export function createShinx(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildShinxParts(createMesh, meshes);

  // -------- LIBS functions (matching tes2.html) --------
  const get_I4 = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  const translate = (m, x, y, z) => { m[12]+=x; m[13]+=y; m[14]+=z; };
  const translateZ = (m,t)=>{ m[14]+=t; };
  const rotateX = (m,ang)=> {
    let c=Math.cos(ang), s=Math.sin(ang);
    let mv1=m[1], mv5=m[5], mv9=m[9], mv13=m[13];
    m[1]=c*m[1]-s*m[2]; m[5]=c*m[5]-s*m[6]; m[9]=c*m[9]-s*m[10]; m[13]=c*m[13]-s*m[14];
    m[2]=c*m[2]+s*mv1; m[6]=c*m[6]+s*mv5; m[10]=c*m[10]+s*mv9; m[14]=c*m[14]+s*mv13;
  };
  const rotateY = (m,ang)=> {
    let c=Math.cos(ang), s=Math.sin(ang);
    let mv0=m[0], mv4=m[4], mv8=m[8], mv12=m[12];
    m[0]=c*m[0]+s*m[2]; m[4]=c*m[4]+s*m[6]; m[8]=c*m[8]+s*m[10]; m[12]=c*m[12]+s*m[14];
    m[2]=c*m[2]-s*mv0; m[6]=c*m[6]-s*mv4; m[10]=c*m[10]-s*mv8; m[14]=c*m[14]-s*mv12;
  };
  const scale = (m, sx, sy, sz) => {
    m[0]*=sx; m[1]*=sx; m[2]*=sx; m[3]*=sx;
    m[4]*=sy; m[5]*=sy; m[6]*=sy; m[7]*=sy;
    m[8]*=sz; m[9]*=sz; m[10]*=sz; m[11]*=sz;
  };

  // matrices
  const M = {
    head: get_I4(),
    tail: get_I4(), 
    body: get_I4(),
    legFL: get_I4(),
    legFR: get_I4(),
    legBL: get_I4(),
    legBR: get_I4()
  };

  let time = 0;
  const p = {
    basePos: opts.position ?? [0,0,0],
    // Animation parameters exactly matching tes2.html
    legAngleMultiplier: 2,      // time * 2 for leg animation
    legAngleAmplitude: 0.15,    // Math.sin(time * 2) * 0.15
    orbitSpeed: 0.4,            // time * 0.2
    orbitRadius: 1.0,           // orbit radius
    pulseMultiplier: 2,         // time * 2 for pulsing
    pulseAmplitude: 0.05,       // 1.0 + Math.sin(time * 2) * 0.05
    enableOrbit: true,
    
    // Pivots matching tes2.html exactly
    pivot_FL: [-0.14, -0.05,  0.03],
    pivot_FR: [ 0.14, -0.05,  0.03],
    pivot_BL: [-0.14, -0.05, 0.03],
    pivot_BR: [ 0.14, -0.05, 0.03],

    // ---- Backflip params ----
    flipDuration: 0.9,
    flipAxis: 'x',
    jumpHeight: 1.0,
    enableGroundSnap: false,
    groundY: 0.0,
  };

  // state backflip
  let flipProg = -1;
  function flip(axis='x', duration=p.flipDuration, jump=p.jumpHeight){
    if (flipProg < 0) {
      p.flipAxis = axis || 'x';
      p.flipDuration = Math.max(0.2, duration || p.flipDuration);
      p.jumpHeight = (jump ?? p.jumpHeight);
      flipProg = 0;
    }
  }

  // easing 0..1
  function easeInOutCos(k){ return 0.5 - 0.5*Math.cos(Math.PI*k); }

  function update(dt){
    time += 0.02; // Matching tes2.html increment

    // progress flip
    let flipAngle = 0;
    let gaitScale = 1;
    let e = 0;

    if (flipProg >= 0) {
      flipProg += dt / Math.max(0.0001, p.flipDuration);
      const k = Math.min(flipProg, 1);
      e = easeInOutCos(k);
      flipAngle = e * Math.PI * 2.0;
      gaitScale = 1 - e;
      if (flipProg >= 1) flipProg = -1;
    }

    // --- ANIMATION VALUES (exactly matching tes2.html) ---
    // 1. Leg movement
    let legAngle = Math.sin(time * p.legAngleMultiplier) * p.legAngleAmplitude * gaitScale;
    
    // 2. Orbital movement  
    let orbitAngle = time * p.orbitSpeed;
    let orbitX = 0, orbitZ = 0;
    if (p.enableOrbit) {
      orbitX = p.orbitRadius * Math.cos(orbitAngle);
      orbitZ = p.orbitRadius * Math.sin(orbitAngle);
    }
    
    // 3. Pulsing scale for body (exactly matching tes2.html)
    let pulse = 1.0 + Math.sin(time * p.pulseMultiplier) * p.pulseAmplitude * gaitScale;

    // Apply base position offset
    orbitX += p.basePos[0];
    orbitZ += p.basePos[2];

    // ---- BACKFLIP transform ----
    let jumpY = 0;
    if (flipAngle !== 0) {
      jumpY = Math.sin(e * Math.PI) * (p.jumpHeight || 1.0);
    }

    // --- Build matrices exactly like tes2.html ---
    
    // Body Core (with pulsing)
    M.body = get_I4();
    scale(M.body, pulse, pulse, pulse);        // 1. Local scaling
    rotateY(M.body, -orbitAngle);              // 2. Orbit rotation
    translate(M.body, orbitX, jumpY, orbitZ);  // 3. Global translation

    // Head (no pulsing)
    M.head = get_I4();
    rotateY(M.head, -orbitAngle);              // 2. Orbit rotation
    translate(M.head, orbitX, jumpY, orbitZ);  // 3. Global translation

    // Tail (no pulsing)  
    M.tail = get_I4();
    rotateY(M.tail, -orbitAngle);              // 2. Orbit rotation
    translate(M.tail, orbitX, jumpY, orbitZ);  // 3. Global translation

    // Legs with pivot transforms (exactly matching tes2.html)
    
    // Leg FL (Front Left)
    M.legFL = get_I4();
    translate(M.legFL, p.pivot_FL[0], p.pivot_FL[1], p.pivot_FL[2]);
    rotateX(M.legFL, legAngle);
    translate(M.legFL, -p.pivot_FL[0], -p.pivot_FL[1], -p.pivot_FL[2]);
    rotateY(M.legFL, -orbitAngle);
    translate(M.legFL, orbitX, jumpY, orbitZ);

    // Leg FR (Front Right)
    M.legFR = get_I4();
    translate(M.legFR, p.pivot_FR[0], p.pivot_FR[1], p.pivot_FR[2]);
    rotateX(M.legFR, -legAngle);  // opposite phase
    translate(M.legFR, -p.pivot_FR[0], -p.pivot_FR[1], -p.pivot_FR[2]);
    rotateY(M.legFR, -orbitAngle);
    translate(M.legFR, orbitX, jumpY, orbitZ);

    // Leg BL (Back Left)
    M.legBL = get_I4();
    translate(M.legBL, p.pivot_BL[0], p.pivot_BL[1], p.pivot_BL[2]);
    rotateX(M.legBL, -legAngle);  // opposite phase
    translate(M.legBL, -p.pivot_BL[0], -p.pivot_BL[1], -p.pivot_BL[2]);
    rotateY(M.legBL, -orbitAngle);
    translate(M.legBL, orbitX, jumpY, orbitZ);

    // Leg BR (Back Right)
    M.legBR = get_I4();
    translate(M.legBR, p.pivot_BR[0], p.pivot_BR[1], p.pivot_BR[2]);
    rotateX(M.legBR, legAngle);   // same phase as FL
    translate(M.legBR, -p.pivot_BR[0], -p.pivot_BR[1], -p.pivot_BR[2]);
    rotateY(M.legBR, -orbitAngle);
    translate(M.legBR, orbitX, jumpY, orbitZ);

    // optional snap ke tanah
    if (p.enableGroundSnap) {
      [M.body, M.head, M.tail, M.legFL, M.legFR, M.legBL, M.legBR].forEach(m => {
        if (m[13] < p.groundY) {
          const dy = p.groundY - m[13];
          translate(m, 0, dy, 0);
        }
      });
    }
  }

  // orbital controls
  function setOrbit(enabled = true, radius = 1.0, speed = 0.2) {
    p.enableOrbit = enabled;
    p.orbitRadius = radius;
    p.orbitSpeed = speed;
  }

  // expose API & params
  return { buffers, M, update, params: p, flip, setOrbit };
}
