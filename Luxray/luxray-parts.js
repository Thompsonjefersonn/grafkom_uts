// luxray-parts.js (Full Extended Version)
// Disinkronkan otomatis dengan luxray-build.js
// Mengelompokkan setiap mesh ke bagian logis (head/body/ear/legs)
import { buildLuxrayMeshes } from './luxray-build.js';

// ---- util ----
function mergeMeshes(meshes) {
  let vertices = [], faces = [], offset = 0;
  for (let m of meshes) {
    if (!m) continue;
    vertices.push(...m.vertices);
    for (let f of m.faces) faces.push(f + offset);
    offset += m.vertices.length / 6;
  }
  return { vertices, faces };
}
function mergeList(...items) {
  const list = [];
  for (const it of items) {
    if (!it) continue;
    if (Array.isArray(it)) list.push(...it.filter(Boolean));
    else list.push(it);
  }
  return list.length ? mergeMeshes(list) : null;
}
function boundsOf(mesh) {
  if (!mesh || !mesh.vertices || !mesh.faces)
    return { min:[0,0,0], max:[0,0,0], center:[0,0,0] };
  const v = mesh.vertices;
  const min=[+Infinity,+Infinity,+Infinity], max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<v.length;i+=6){
    const x=v[i], y=v[i+1], z=v[i+2];
    if(x<min[0])min[0]=x; if(y<min[1])min[1]=y; if(z<min[2])min[2]=z;
    if(x>max[0])max[0]=x; if(y>max[1])max[1]=y; if(z>max[2])max[2]=z;
  }
  return { 
    min, max,
    center:[(min[0]+max[0])/2,(min[1]+max[1])/2,(min[2]+max[2])/2]
  };
}
function meshToBuffers(createMesh, m){
  if (!m || !m.vertices || !m.faces) return null;
  const verts = (m.vertices instanceof Float32Array) ? m.vertices : new Float32Array(m.vertices);
  const faces = (m.faces    instanceof Uint16Array)  ? m.faces    : new Uint16Array(m.faces);
  return createMesh(verts, faces);
}

// ---- main builder ----
export function buildLuxrayParts(createMesh){
  const meshes = buildLuxrayMeshes();

  // Gabungan tail + star ke body
  const tailCombined = mergeList(
    meshes.tail, meshes.star
  );

  // BODY (+ pindahan dari "static")
  const bodyCombined = mergeList(
    meshes.body, meshes.chest, meshes.neckBase,
    meshes.backFur, meshes.sideFurL, meshes.sideFurR,
    meshes.furBody1, meshes.furBody2, meshes.furBody3,
    meshes.frontConeL1, meshes.frontConeL2, meshes.frontConeL3,
    meshes.frontConeR1, meshes.frontConeR2, meshes.frontConeR3,

    // --- moved from former static ---
    meshes.cover2,
    meshes.selimut2, meshes.selimut3, meshes.selimut4,
    meshes.cone, meshes.cone1, meshes.cone2, meshes.cone3, meshes.cone4, meshes.cone5,
    meshes.ellipsoidData, meshes.line, meshes.sphere
  );

  const nose    = meshes.nose    ?? meshes.noseMain ?? null;
  const noseFur = meshes.noseFur ?? meshes.noseFur ?? null;

  // Kepala (semua elemen kepala & wajah)
  const headCombined = mergeList(
    meshes.head, meshes.headMain, meshes.face, meshes.jaw, meshes.snout,
    meshes.headFur1, meshes.headFur2, meshes.headFur3, meshes.headFur4, meshes.headFur5,
    meshes.mane, meshes.maneTop, meshes.maneBack, meshes.maneSideL, meshes.maneSideR,
    meshes.furNeck, meshes.whiskerL, meshes.whiskerR, meshes.eyebrowL, meshes.eyebrowR,
    meshes.selimut, meshes.cover3, meshes.triLeft, meshes.triRight,
    nose, meshes.smile, noseFur,
    meshes.eyeWhiteL, meshes.eyeWhiteR, meshes.eyeYellowL, meshes.eyeYellowR,
    meshes.irisL, meshes.irisR, meshes.ringL, meshes.ringR
  );

  // Telinga
  const earL = mergeList(
    meshes.earLeft, meshes.earLeft1, meshes.innerEarLeft, meshes.earFurLeft
  );
  const earR = mergeList(
    meshes.earRight, meshes.earRight1, meshes.innerEarRight, meshes.earFurRight
  );

  // Kaki depan kiri (+ uplegFrontL)
  const legFL = mergeList(
    meshes.leg1, meshes.legFrontL, meshes.foot1, meshes.claws1,
    meshes.ring1, meshes.ring3, meshes.ring5, meshes.ring7,
    meshes.padsFrontL, meshes.sole1,
    meshes.coneFrontL1, meshes.coneFrontL2, meshes.coneFrontL3,
    meshes.coneLegBackL1, meshes.coneLegBackL2, meshes.coneLegBackL3,
    meshes.uplegFrontL
  );
  // Kaki depan kanan (+ uplegFrontR)
  const legFR = mergeList(
    meshes.leg2, meshes.legFrontR, meshes.foot2, meshes.claws3,
    meshes.ring2, meshes.ring4, meshes.ring6, meshes.ring8,
    meshes.padsFrontR, meshes.sole2,
    meshes.coneFrontR1, meshes.coneFrontR2, meshes.coneFrontR3,
    meshes.coneLegBackR1, meshes.coneLegBackR2, meshes.coneLegBackR3,
    meshes.uplegFrontR
  );
  // Kaki belakang kiri
  const legBL = mergeList(
    meshes.leg3, meshes.foot3, meshes.padsBackL, meshes.sole3,
    meshes.thighMuscle3, meshes.thighMuscleBack3, meshes.claws2
  );
  // Kaki belakang kanan
  const legBR = mergeList(
    meshes.leg4, meshes.foot4, meshes.claws4, meshes.padsBackR, meshes.sole4,
    meshes.thighMuscle4, meshes.thighMuscleBack4
  );

  // ---- Grouped Parts ----
  const parts = {
    body: bodyCombined,
    head: headCombined,
    earL, earR,
    legFL, legFR, legBL, legBR,
    tail: tailCombined,
  };

  // convert mesh → GPU buffer
  const buffers = {};
  for (const [k,m] of Object.entries(parts))
    if (m) buffers[k] = meshToBuffers(createMesh, m);

  // (staticList & buffers.static dihapus)

  // ---- pivot per bagian ----
  const pivots = {};
  if (parts.head)  pivots.head  = boundsOf(parts.head).center;
  if (parts.earL)  pivots.earL  = boundsOf(parts.earL).center;
  if (parts.earR)  pivots.earR  = boundsOf(parts.earR).center;
  if (parts.legFL) pivots.legFL = boundsOf(parts.legFL).max;
  if (parts.legFR) pivots.legFR = boundsOf(parts.legFR).max;
  if (parts.legBL) pivots.legBL = boundsOf(parts.legBL).max;
  if (parts.legBR) pivots.legBR = boundsOf(parts.legBR).max;
  if (parts.tail)  pivots.tail  = boundsOf(parts.tail).center;

  return { buffers, pivots };
}
