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

export function buildShinxParts(){
  const m = buildShinxMeshes(); // object berisi semua mesh (vertices, faces)
  // Pemetaan nama “ramah”
  const nameMap = {
    sphere: 'head',
    body: 'body',
    cone: 'neckCone',
    earLeft: 'earL',
    earRight: 'earR',
    leg1: 'legFL', leg2: 'legFR', leg3: 'legBL', leg4: 'legBR',
    foot1: 'footFL', foot2: 'footFR', foot3: 'footBL', foot4: 'footBR',
    tail: 'tail',
    ring1: 'ringFL', ring2: 'ringFR',
    nose: 'nose',
    smile: 'smile',
    star: 'tailStar',
    starLeft: 'starL', starRight: 'starR',
    topCone1: 'tuft1', topCone2: 'tuft2',
    cone1: 'cone1', cone2: 'cone2', cone3: 'cone3', cone4: 'cone4', cone5: 'cone5',
    sideConeTop1: 'sideConeTopR', sideConeTop2: 'sideConeTopL',
    sideConeBottom1: 'sideConeBotR', sideConeBottom2: 'sideConeBotL',
    triLeft: 'cheekL', triRight: 'cheekR',
    eyeLeft: 'eyeL', eyeRight: 'eyeR'
  };

  const parts = [];
  for(const key of Object.keys(m)){
    const mesh = m[key];
    const name = nameMap[key] || key;

    const vertices = toFloat32(mesh.vertices);
    const part = {
      name,
      mesh: {
        vertices,
        faces: toFloat32(mesh.faces || []), // faces dipakai untuk index buffer
      },
      baseVertices: cloneArray(vertices),   // backup untuk reset tiap frame
      pivot: computePivot(vertices)
    };
    parts.push(part);
  }

  // buat lookup by name
  const index = Object.fromEntries(parts.map((p,i)=>[p.name,i]));

  return { parts, index };
}

// -------- transforms (dipakai juga oleh anim) --------
export function resetPart(part){
  part.mesh.vertices.set(part.baseVertices);
}

export function translate(part, tx, ty, tz){
  const v = part.mesh.vertices;
  for(let i=0;i<v.length;i+=6){
    v[i]   += tx;
    v[i+1] += ty;
    v[i+2] += tz;
  }
  part.pivot = [part.pivot[0]+tx, part.pivot[1]+ty, part.pivot[2]+tz];
}

function rotateAround(part, angle, axis, cx, cy, cz){
  const v = part.mesh.vertices;
  const c = Math.cos(angle), s = Math.sin(angle);
  for(let i=0;i<v.length;i+=6){
    let x = v[i]-cx, y=v[i+1]-cy, z=v[i+2]-cz;
    let x2=x, y2=y, z2=z;
    if(axis==='x'){ y2 = y*c - z*s; z2 = y*s + z*c; }
    else if(axis==='y'){ x2 =  x*c + z*s; z2 = -x*s + z*c; }
    else if(axis==='z'){ x2 = x*c - y*s; y2 = x*s + y*c; }
    v[i]=x2+cx; v[i+1]=y2+cy; v[i+2]=z2+cz;
  }
}
export function rotateX(part, ang, pivot=part.pivot){ rotateAround(part, ang,'x', ...pivot); }
export function rotateY(part, ang, pivot=part.pivot){ rotateAround(part, ang,'y', ...pivot); }
export function rotateZ(part, ang, pivot=part.pivot){ rotateAround(part, ang,'z', ...pivot); }

// -------- merge untuk render (gabung semua parts ke satu big-buffer) --------
export function mergeForDraw(parts){
  // gabung vertices & buat index triangles dari faces
  let totalV = 0, totalI = 0;
  for(const p of parts){ totalV += p.mesh.vertices.length; totalI += p.mesh.faces.length; }

  const vertices = new Float32Array(totalV);
  const indices  = new Uint32Array(totalI);
  let vo=0, io=0, base=0;

  for(const p of parts){
    vertices.set(p.mesh.vertices, vo);
    for(let i=0;i<p.mesh.faces.length;i++){
      indices[io+i] = p.mesh.faces[i] + base;
    }
    base += p.mesh.vertices.length/6;
    vo += p.mesh.vertices.length;
    io += p.mesh.faces.length;
  }
  return { vertices, indices };
}
