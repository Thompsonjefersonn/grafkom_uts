// shinx-parts.js
// Mengubah hasil build menjadi daftar "parts" + util merge/draw + reset mekanisme.
// Pastikan shinx-build.js mengekspor: export function buildShinxMeshes(){ return {...} }

import { buildShinxMeshes } from './shinx-build.js';

// ---------- helpers ----------
function cloneArray(a){ return new Float32Array(a); }
function toFloat32(arr){ return (arr instanceof Float32Array) ? arr : new Float32Array(arr); }

// hitung pivot default: rata-rata posisi vertex (x,y,z)
function computePivot(vertices){
  let n = vertices.length/6;
  let sx=0, sy=0, sz=0;
  for(let i=0;i<vertices.length;i+=6){
    sx += vertices[i];
    sy += vertices[i+1];
    sz += vertices[i+2];
  }
  return [sx/n, sy/n, sz/n];
}

// ---- util ----
function mergeMeshes(meshes) {
  let vertices = [], faces = [], offset = 0;
  for (let m of meshes) {
    if (!m || !m.vertices) continue;
    vertices.push(...m.vertices);
    for (let f of (m.faces || [])) {
      faces.push(f + offset);
    }
    offset += m.vertices.length / 6;
  }
  return { vertices, faces };
}

function mergeList(...items) {
  const list = [];
  for (const it of items) {
    if (it && it.vertices) list.push(it);
  }
  return list.length ? mergeMeshes(list) : null;
}

function boundsOf(mesh) {
  if (!mesh || !mesh.vertices || !mesh.faces)
    return [0,0,0,0,0,0];
  const v = mesh.vertices;
  const min=[+Infinity,+Infinity,+Infinity], max=[-Infinity,-Infinity,-Infinity];
  for (let i = 0; i < v.length; i += 6) {
    if (v[i] < min[0]) min[0] = v[i];
    if (v[i] > max[0]) max[0] = v[i];
    if (v[i+1] < min[1]) min[1] = v[i+1];
    if (v[i+1] > max[1]) max[1] = v[i+1];
    if (v[i+2] < min[2]) min[2] = v[i+2];
    if (v[i+2] > max[2]) max[2] = v[i+2];
  }
  return [min[0],min[1],min[2],max[0],max[1],max[2]];
}

function meshToBuffers(createMesh, m){
  if (!m) return null;
  return createMesh(m.vertices, m.faces);
}

// ---- main builder ----
export function buildShinxParts(createMesh){
  const meshes = buildShinxMeshes();

  // group parts exactly matching tes2.html
  // Part 1: Head (Tidak berdenyut)
  const headMeshes = [
    meshes.sphere, meshes.earLeft, meshes.earRight, meshes.topCone1, meshes.topCone2, 
    meshes.nose, meshes.smile, meshes.starLeft, meshes.starRight, meshes.eyeLeft, meshes.eyeRight, 
    meshes.sideConeTop1, meshes.sideConeTop2, meshes.sideConeBottom1, meshes.sideConeBottom2
  ];
  
  // Part 2: Tail (Tidak berdenyut)
  const tailMeshes = [
    meshes.tail, meshes.star, meshes.cone1, meshes.cone2, 
    meshes.cone3, meshes.cone4, meshes.cone5
  ];

  // Part 3: Body Core (Berdenyut)
  const bodyMeshes = [meshes.body, meshes.cone, meshes.triLeft, meshes.triRight];
  
  // Part 4: Kaki-kaki (Tidak berubah)
  const legFLMeshes = [
    meshes.leg1, meshes.foot1, meshes.ring1,
    meshes.claws1, meshes.claws2, meshes.claws3
  ];
  const legFRMeshes = [
    meshes.leg2, meshes.foot2, meshes.ring2,
    meshes.claws4, meshes.claws5, meshes.claws6
  ];
  const legBLMeshes = [
    meshes.leg3, meshes.foot3,
    meshes.claws10, meshes.claws11, meshes.claws12
  ];
  const legBRMeshes = [
    meshes.leg4, meshes.foot4,
    meshes.claws7, meshes.claws8, meshes.claws9
  ];

  // merge and create buffers
  const parts = {
    head:    mergeList(...headMeshes),
    body:    mergeList(...bodyMeshes), 
    tail:    mergeList(...tailMeshes),
    legFL:   mergeList(...legFLMeshes),
    legFR:   mergeList(...legFRMeshes),
    legBL:   mergeList(...legBLMeshes),
    legBR:   mergeList(...legBRMeshes)
  };

  // create buffers and pivots
  const buffers = {};
  const pivots = {};
  
  for (let [name, mesh] of Object.entries(parts)) {
    if (mesh) {
      buffers[name] = meshToBuffers(createMesh, mesh);
      pivots[name] = computePivot(mesh.vertices);
    }
  }

  return { buffers, pivots };
}


