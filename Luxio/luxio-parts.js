// luxio-parts.js (ES Module)
import { buildLuxioMeshes } from './luxio-build.js';

// utils
function mergeMeshes(meshes){
  let vertices=[], faces=[], offset=0;
  for (let m of meshes){
    if (!m) continue;
    vertices.push(...m.vertices);
    for (let f of m.faces) faces.push(f + offset);
    offset += m.vertices.length/6;
  }
  return { vertices, faces };
}
function mergeList(...items){
  const list = [];
  for (const it of items){
    if (!it) continue;
    if (Array.isArray(it)) list.push(...it.filter(Boolean));
    else list.push(it);
  }
  return list.length ? mergeMeshes(list) : null;
}
function boundsOf(mesh){
  if (!mesh || !mesh.vertices || !mesh.faces) {
    return { min:[0,0,0], max:[0,0,0], center:[0,0,0] };
  }
  const v = mesh.vertices;
  const min=[+Infinity,+Infinity,+Infinity], max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<v.length;i+=6){
    const x=v[i], y=v[i+1], z=v[i+2];
    if(x<min[0])min[0]=x; if(y<min[1])min[1]=y; if(z<min[2])min[2]=z;
    if(x>max[0])max[0]=x; if(y>max[1])max[1]=y; if(z>max[2])max[2]=z;
  }
  return { min, max, center:[(min[0]+max[0])/2,(min[1]+max[1])/2,(min[2]+max[2])/2] };
}
function meshToBuffers(createMesh, m){
  if (!m || !m.vertices || !m.faces) return null;
  const verts = (m.vertices instanceof Float32Array) ? m.vertices : new Float32Array(m.vertices);
  const faces = (m.faces    instanceof Uint16Array)  ? m.faces    : new Uint16Array(m.faces);
  return createMesh(verts, faces);
}

export function buildLuxioParts(createMesh){
  const meshes = buildLuxioMeshes();

  // === limbs (leg+foot+claws + ring mapping: FL: ring1+ring3, FR: ring2+ring4) ===
  const limbFL = mergeList(meshes.leg1, meshes.foot1, (meshes.claws1 ?? null), meshes.ring1 ?? null, meshes.ring3 ?? null);
  const limbFR = mergeList(meshes.leg2, meshes.foot2, (meshes.claws4 ?? null), meshes.ring2 ?? null, meshes.ring4 ?? null);
  const limbBL = mergeList(meshes.leg3, meshes.foot3, (meshes.claws3 ?? null));
  const limbBR = mergeList(meshes.leg4, meshes.foot4, (meshes.claws5 ?? null));

  // === tail + star digabung, lalu disatukan ke body ===
  const tailCombined   = mergeList(meshes.tail, meshes.star);
  const bodyCombined   = mergeList(meshes.body, tailCombined); // <-- BODY + TAIL(+STAR)

  const part = {
    // body sudah termasuk tail + star
    body: bodyCombined,

    // tidak ada 'tail' / 'star' lagi sebagai part terpisah
    earL: meshes.earLeft,
    earR: meshes.earRight,

    // limbs nyatu
    legFL: limbFL,
    legFR: limbFR,
    legBL: limbBL,
    legBR: limbBR,
  };

  // === statis (jangan masukkan star, karena sudah menyatu ke body) ===
  const staticList = [
    meshes.nose, meshes.smile,
    meshes.cone, meshes.cone1, meshes.cone2, meshes.cone3, meshes.cone4, meshes.cone5,
    meshes.sideConeTop1, meshes.sideConeBottom1, meshes.sideConeBottom2, meshes.sideConeTop2, meshes.backConeTop1,
    meshes.topCone1, meshes.earInnerL, meshes.earInnerR,
    meshes.eyeWhiteL, meshes.eyeWhiteR, meshes.eyeYellowL, meshes.eyeYellowR,
    meshes.cover2, meshes.selimut, meshes.selimut2, meshes.sideleft1, meshes.sideleft2,
    meshes.thighLeft, meshes.thighRight,
    meshes.sphere
  ].filter(Boolean);

  const staticMerged = staticList.length ? mergeMeshes(staticList) : null;

  // buffers
  const buffers = {};
  for (const [k,m] of Object.entries(part)) if (m) buffers[k] = meshToBuffers(createMesh, m);
  if (staticMerged) buffers.static = meshToBuffers(createMesh, staticMerged);

  // pivots — tidak ada pivot tail lagi; pivot telinga & kaki tetap
  const pivots = {
    earL: boundsOf(part.earL).center,
    earR: boundsOf(part.earR).center,

    legFL: boundsOf(part.legFL).max,
    legFR: boundsOf(part.legFR).max,
    legBL: boundsOf(part.legBL).max,
    legBR: boundsOf(part.legBR).max,
  };

  return { buffers, pivots };
}
