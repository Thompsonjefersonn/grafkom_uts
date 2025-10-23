import { buildLuxioMeshes } from './luxio-build.js';

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
  const m = buildLuxioMeshes();

  const head = mergeList(
    m.sphere , 
    m.nose, m.smile,
    m.eyeWhiteL, m.eyeWhiteR,
    m.eyeYellowL, m.eyeYellowR,
    m.cover2, m.selimut  ,m.sideleft1 , m.sideleft2  , m.topCone1 , m.backConeTop1
  );

  const earL = mergeList(m.earLeft,  m.earInnerL);
  const earR = mergeList(m.earRight, m.earInnerR);

  const tail = mergeList(m.tail, m.star);

  const legFL = mergeList(m.leg1, m.foot1, m.claws1, m.ring1, m.ring3 , m.thighLeft);
  const legFR = mergeList(m.leg2, m.foot2, m.claws4, m.ring2, m.ring4 , m.thighRight);
  const legBL = mergeList(m.leg3, m.foot3, m.claws3);
  const legBR = mergeList(m.leg4, m.foot4, m.claws5);

  const body = mergeList(
    m.body,
    m.cone, m.cone1, m.cone2, m.cone3, m.cone4, m.cone5, m.selimut2  
  );

  const staticMerged = null;

  const part = { body, head, earL, earR, tail, legFL, legFR, legBL, legBR };

  const buffers = {};
  for (const [k,pm] of Object.entries(part)) if (pm) buffers[k] = meshToBuffers(createMesh, pm);
  if (staticMerged) buffers.static = meshToBuffers(createMesh, staticMerged);

  const pivots = {
    body:  boundsOf(body ).center,
    head:  boundsOf(head ).center,
    tail:  boundsOf(tail ).center,
    earL:  boundsOf(earL ).max,
    earR:  boundsOf(earR ).max,
    legFL: boundsOf(legFL).max,
    legFR: boundsOf(legFR).max,
    legBL: boundsOf(legBL).max,
    legBR: boundsOf(legBR).max,
    footFL: boundsOf(legFL).min,
    footFR: boundsOf(legFR).min,
    footBL: boundsOf(legBL).min,
    footBR: boundsOf(legBR).min,
  };

  return { buffers, pivots };
}
