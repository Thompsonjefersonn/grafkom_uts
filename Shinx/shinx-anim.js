import { buildShinxParts } from './shinx-parts.js';

export function createShinx(gl, createMesh, meshes, opts = {}) {
  const { buffers, pivots } = buildShinxParts(createMesh, meshes);

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
  const rotateZ = (m,ang)=> {
    let c=Math.cos(ang), s=Math.sin(ang);
    let mv0=m[0], mv4=m[4], mv8=m[8], mv12=m[12];
    m[0]=c*m[0]-s*m[1]; m[4]=c*m[4]-s*m[5]; m[8]=c*m[8]-s*m[9]; m[12]=c*m[12]-s*m[13];
    m[1]=c*m[1]+s*mv0; m[5]=c*m[5]+s*mv4; m[9]=c*m[9]+s*mv8; m[13]=c*m[13]+s*mv12;
  };
  const scale = (m, sx, sy, sz) => {
    m[0]*=sx; m[1]*=sx; m[2]*=sx; m[3]*=sx;
    m[4]*=sy; m[5]*=sy; m[6]*=sy; m[7]*=sy;
    m[8]*=sz; m[9]*=sz; m[10]*=sz; m[11]*=sz;
  };

  /**
   * Melakukan post-multiply rotasi ke matriks m
   * @param {number[]} m - Matriks 4x4 (Array 16)
   * @param {number} ang - Sudut rotasi (radians)
   * @param {number} x - Komponen x dari sumbu rotasi
   * @param {number} y - Komponen y dari sumbu rotasi
   * @param {number} z - Komponen z dari sumbu rotasi
   */
  const rotateAxis = (m, ang, x, y, z) => {
      let len = Math.sqrt(x*x + y*y + z*z);
      if (len < 0.00001) { return; }
      len = 1.0 / len;
      x *= len; y *= len; z *= len;

      const s = Math.sin(ang);
      const c = Math.cos(ang);
      const t = 1 - c;

      const r00 = c + x*x*t;   const r10 = x*y*t - z*s; const r20 = x*z*t + y*s;
      const r01 = y*x*t + z*s; const r11 = c + y*y*t;   const r21 = y*z*t - x*s;
      const r02 = z*x*t - y*s; const r12 = z*y*t + x*s; const r22 = c + z*z*t;

      for (let i = 0; i < 4; i++) {
          const col = i * 4;
          const m0 = m[col + 0];
          const m1 = m[col + 1];
          const m2 = m[col + 2];

          m[col + 0] = m0*r00 + m1*r10 + m2*r20;
          m[col + 1] = m0*r01 + m1*r11 + m2*r21;
          m[col + 2] = m0*r02 + m1*r12 + m2*r22;
      }
  };

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
    legAngleMultiplier: 2,
    legAngleAmplitude: 0.15,
    orbitSpeed: 0.4,
    orbitRadius: 1.0,
    pulseMultiplier: 2,
    pulseAmplitude: 0.05,
    enableOrbit: true,
    
    pivot_FL: [-0.14, -0.05,  0.03],
    pivot_FR: [ 0.14, -0.05,  0.03],
    pivot_BL: [-0.14, -0.05, 0.03],
    pivot_BR: [ 0.14, -0.05, 0.03],

    flipDuration: 0.9,
    flipAxis: [1, 0, 0],
    jumpHeight: 1.0,
    enableGroundSnap: false,
    groundY: 0.0,
  };

  let flipProg = -1;
  function flip(axis, duration=p.flipDuration, jump=p.jumpHeight){
    if (flipProg < 0) {
      if (typeof axis === 'string') {
          if (axis === 'y') p.flipAxis = [0, 1, 0];
          else if (axis === 'z') p.flipAxis = [0, 0, 1];
          else p.flipAxis = [1, 0, 0];
      } else if (Array.isArray(axis) && axis.length === 3) {
          p.flipAxis = axis;
      } else {
          p.flipAxis = [1, 0, 0];
      }
      
      p.flipDuration = Math.max(0.2, duration || p.flipDuration);
      p.jumpHeight = (jump ?? p.jumpHeight);
      flipProg = 0;
    }
  }

  function easeInOutCos(k){ return 0.5 - 0.5*Math.cos(Math.PI*k); }

  function update(dt){
    time += 0.02;

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

    let legAngle = Math.sin(time * p.legAngleMultiplier) * p.legAngleAmplitude * gaitScale;
    
    let orbitAngle = time * p.orbitSpeed;
    let orbitX = 0, orbitZ = 0;
    if (p.enableOrbit) {
      orbitX = p.orbitRadius * Math.cos(orbitAngle);
      orbitZ = p.orbitRadius * Math.sin(orbitAngle);
    }
    
    let pulse = 1.0 + Math.sin(time * p.pulseMultiplier) * p.pulseAmplitude * gaitScale;

    orbitX += p.basePos[0];
    orbitZ += p.basePos[2];

    let jumpY = 0;
    if (flipAngle !== 0) {
      jumpY = Math.sin(e * Math.PI) * (p.jumpHeight || 1.0);
    }

    
    M.body = get_I4();
    scale(M.body, pulse, pulse, pulse);
    if (flipAngle !== 0) {
        rotateAxis(M.body, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.body, -orbitAngle);
    translate(M.body, orbitX, jumpY, orbitZ);

    M.head = get_I4();
    if (flipAngle !== 0) {
        rotateAxis(M.head, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.head, -orbitAngle);
    translate(M.head, orbitX, jumpY, orbitZ);

    M.tail = get_I4();
    if (flipAngle !== 0) {
        rotateAxis(M.tail, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.tail, -orbitAngle);
    translate(M.tail, orbitX, jumpY, orbitZ);

    
    M.legFL = get_I4();
    translate(M.legFL, p.pivot_FL[0], p.pivot_FL[1], p.pivot_FL[2]);
    rotateX(M.legFL, legAngle);
    translate(M.legFL, -p.pivot_FL[0], -p.pivot_FL[1], -p.pivot_FL[2]);
    if (flipAngle !== 0) {
        rotateAxis(M.legFL, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.legFL, -orbitAngle);
    translate(M.legFL, orbitX, jumpY, orbitZ);

    M.legFR = get_I4();
    translate(M.legFR, p.pivot_FR[0], p.pivot_FR[1], p.pivot_FR[2]);
    rotateX(M.legFR, -legAngle);
    translate(M.legFR, -p.pivot_FR[0], -p.pivot_FR[1], -p.pivot_FR[2]);
    if (flipAngle !== 0) {
        rotateAxis(M.legFR, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.legFR, -orbitAngle);
    translate(M.legFR, orbitX, jumpY, orbitZ);

    M.legBL = get_I4();
    translate(M.legBL, p.pivot_BL[0], p.pivot_BL[1], p.pivot_BL[2]);
    rotateX(M.legBL, -legAngle);
    translate(M.legBL, -p.pivot_BL[0], -p.pivot_BL[1], -p.pivot_BL[2]);
    if (flipAngle !== 0) {
        rotateAxis(M.legBL, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.legBL, -orbitAngle);
    translate(M.legBL, orbitX, jumpY, orbitZ);

    M.legBR = get_I4();
    translate(M.legBR, p.pivot_BR[0], p.pivot_BR[1], p.pivot_BR[2]);
    rotateX(M.legBR, legAngle);
    translate(M.legBR, -p.pivot_BR[0], -p.pivot_BR[1], -p.pivot_BR[2]);
    if (flipAngle !== 0) {
        rotateAxis(M.legBR, flipAngle, p.flipAxis[0], p.flipAxis[1], p.flipAxis[2]);
    }
    rotateY(M.legBR, -orbitAngle);
    translate(M.legBR, orbitX, jumpY, orbitZ);

    if (p.enableGroundSnap) {
      [M.body, M.head, M.tail, M.legFL, M.legFR, M.legBL, M.legBR].forEach(m => {
        if (m[13] < p.groundY) {
          const dy = p.groundY - m[13];
          translate(m, 0, dy, 0);
        }
      });
    }
  }

  function setOrbit(enabled = true, radius = 1.0, speed = 0.2) {
    p.enableOrbit = enabled;
    p.orbitRadius = radius;
    p.orbitSpeed = speed;
  }

  return { buffers, M, update, params: p, flip, setOrbit };
}