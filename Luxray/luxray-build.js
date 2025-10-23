export function buildLuxrayMeshes() {
    console.log("Building Luxray...");
function generateSphere(r, stacks, slices, tx=0, ty=0, tz=0, col=[1,0.6,0.6]){
  var vertices=[], faces=[];
  for(let i=0;i<=stacks;i++){
    let theta=i*Math.PI/stacks;
    for(let j=0;j<=slices;j++){
      let phi=j*2*Math.PI/slices;
      let x=r*Math.sin(theta)*Math.cos(phi);
      let y=r*Math.cos(theta);
      let z=r*Math.sin(theta)*Math.sin(phi);
      vertices.push(x+tx,y+ty,z+tz,col[0],col[1],col[2]);
    }
  }
  for(let i=0;i<stacks;i++){
    for(let j=0;j<slices;j++){
      let row1=i*(slices+1), row2=(i+1)*(slices+1);
      let a=row1+j,b=row1+j+1,c=row2+j,d=row2+j+1;
      faces.push(a,b,d,a,d,c);
    }
  }
  return {vertices,faces};
}

function generateEllipsoid(rx, ry, rz, stacks, slices, tx, ty, tz, color=[0,255,255]) {
  var vertices = [], faces = [];
  for (let i = 0; i <= stacks; i++) {
    let theta = i * Math.PI / stacks;
    for (let j = 0; j <= slices; j++) {
      let phi = j * 2 * Math.PI / slices;
      let x = rx * Math.sin(theta) * Math.cos(phi);
      let y = ry * Math.cos(theta);
      let z = rz * Math.sin(theta) * Math.sin(phi);

      vertices.push(
        x + tx, y + ty, z + tz,
        color[0], color[1], color[2]
      );
    }
  }

  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < slices; j++) {
      let row1 = i * (slices + 1), row2 = (i + 1) * (slices + 1);
      let a = row1 + j, b = row1 + j + 1, c = row2 + j, d = row2 + j + 1;
      faces.push(a, b, d, a, d, c);
    }
  }
  return { vertices, faces };
}


function generateEllipsoidFlatColor(rx, ry, rz, stacks, slices, tx, ty, tz, color = [0.5, 0.5, 0.5]) {
  var vertices = [], faces = [];
  let index = 0;

  for (let i = 0; i < stacks; i++) {
    let theta1 = i * Math.PI / stacks;
    let theta2 = (i + 1) * Math.PI / stacks;

    for (let j = 0; j < slices; j++) {
      let phi1 = j * 2 * Math.PI / slices;
      let phi2 = (j + 1) * 2 * Math.PI / slices;

      let p = [];
      for (let [theta, phi] of [[theta1, phi1],[theta1, phi2],[theta2, phi1],[theta2, phi2]]) {
        let x = rx * Math.sin(theta) * Math.cos(phi);
        let y = ry * Math.cos(theta);
        let z = rz * Math.sin(theta) * Math.sin(phi);
        p.push([x+tx, y+ty, z+tz]);
      }

      // Hapus logika warna lama
      let col = color; // <-- Gunakan warna dari parameter

      let quadVerts = [
        ...p[0],...col, ...p[1],...col, ...p[3],...col,
        ...p[0],...col, ...p[3],...col, ...p[2],...col
      ];

      for (let v=0; v<quadVerts.length; v++) vertices.push(quadVerts[v]);

      faces.push(index, index+1, index+2, index+3, index+4, index+5);
      index += 6;
    }
  }

  return {vertices, faces};
}

// ===== FUNGSI BARU UNTUK KEPALA DUA WARNA =====
function generateSphereFlatColor(r, stacks, slices, tx, ty, tz) {
  var vertices = [], faces = [];
  let index = 0;

  for (let i = 0; i < stacks; i++) {
    let theta1 = i * Math.PI / stacks;
    let theta2 = (i + 1) * Math.PI / stacks;

    for (let j = 0; j < slices; j++) {
      let phi1 = j * 2 * Math.PI / slices;
      let phi2 = (j + 1) * 2 * Math.PI / slices;

      let p = [];
      for (let [theta, phi] of [[theta1, phi1],[theta1, phi2],[theta2, phi1],[theta2, phi2]]) {
        let x = r * Math.sin(theta) * Math.cos(phi);
        let y = r * Math.cos(theta);
        let z = r * Math.sin(theta) * Math.sin(phi);
        p.push([x+tx, y+ty, z+tz]);
      }

      // Hitung posisi rata-rata Z untuk menentukan warna
      let avgZ = (p[0][2] + p[1][2] + p[2][2] + p[3][2]) / 4;

      // Beri warna biru jika di depan (z >= 0), hitam jika di belakang
      // Kita gunakan nilai ambang 0.4 (posisi Z kepala) agar pas di tengah
      let col = (avgZ >= 0.4) ? [0.2, 0.8, 1.0] : [0,0,0];

      let quadVerts = [
        ...p[0],...col, ...p[1],...col, ...p[3],...col,
        ...p[0],...col, ...p[3],...col, ...p[2],...col
      ];

      for (let v=0; v<quadVerts.length; v++) vertices.push(quadVerts[v]);

      faces.push(index, index+1, index+2, index+3, index+4, index+5);
      index += 6;
    }
  }

  return {vertices, faces};
}

function generateCylinder(radius,height,slices,tx,ty,tz,col=[0.5,0.5,0.5]){
  var vertices=[],faces=[];
  for(let i=0;i<=1;i++){
    let y=i*height;
    for(let j=0;j<=slices;j++){
      let phi=j*2*Math.PI/slices;
      let x=radius*Math.cos(phi), z=radius*Math.sin(phi);
      vertices.push(x+tx,y+ty,z+tz,col[0],col[1],col[2]);
    }
  }
  for(let j=0;j<slices;j++){
    let a=j,b=j+1,c=(slices+1)+j,d=(slices+1)+j+1;
    faces.push(a,b,d,a,d,c);
  }
  return {vertices,faces};
}

function generateStar4(size,thickness,tx,ty,tz,col=[1,0.8,0.2]){
  var vertices=[],faces=[];
  let pts=[
    [0,0,size],[0,0,-size],
    [size,0,0],[-size,0,0],
    [0,size,0],[0,-size,0]
  ];
  for(let [x,y,z] of pts){
    vertices.push(x+tx,y+ty,z+tz,col[0],col[1],col[2]);
  }
  let centerIndex=vertices.length/6;
  vertices.push(tx,ty,tz,col[0],col[1],col[2]);
  for(let i=0;i<pts.length;i++){
    let a=i, b=(i+1)%pts.length;
    faces.push(a,b,centerIndex);
  }
  return {vertices,faces};
}

function generateCylinderZ(radius,length,slices,tx,ty,tz,col=[0.5,0.5,0.5]){
  var vertices=[],faces=[];
  for(let i=0;i<=1;i++){
    let z=i*length; 
    for(let j=0;j<=slices;j++){
      let phi=j*2*Math.PI/slices;
      let x=radius*Math.cos(phi), y=radius*Math.sin(phi);
      vertices.push(x+tx,y+ty,z+tz,col[0],col[1],col[2]);
    }
  }
  for(let j=0;j<slices;j++){
    let a=j,b=j+1,c=(slices+1)+j,d=(slices+1)+j+1;
    faces.push(a,b,d,a,d,c);
  }
  return {vertices,faces};


}

function generateCone(radius, height, slices, tx, ty, tz, col=[0.9,0.6,0.3]) {
  var vertices=[], faces=[];

  // titik puncak
  vertices.push(tx, ty+height/2, tz, col[0], col[1], col[2]);
  let apexIndex = 0;

  // lingkaran bawah
  let baseCenterIndex = 1;
  vertices.push(tx, ty-height/2, tz, col[0], col[1], col[2]);

  let startIndex = vertices.length/6;
  for (let j=0;j<=slices;j++){
    let phi = j*2*Math.PI/slices;
    let x = radius*Math.cos(phi);
    let z = radius*Math.sin(phi);
    vertices.push(x+tx, ty-height/2, z+tz, col[0], col[1], col[2]);
  }

  // sisi
  for (let j=0;j<slices;j++){
    let b1 = startIndex+j;
    let b2 = startIndex+j+1;
    faces.push(apexIndex, b1, b2); // sisi segitiga
  }

  // tutup bawah
  for (let j=0;j<slices;j++){
    let b1 = startIndex+j;
    let b2 = startIndex+j+1;
    faces.push(baseCenterIndex, b2, b1);
  }

  return {vertices,faces};
}

// HAPUS FUNGSI rotateConeZ LAMA, GANTI DENGAN INI
function rotateMeshX(mesh, angle, cx, cy, cz) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (let i = 0; i < mesh.vertices.length; i += 6) {
        // 1. Geser ke titik pusat (0,0,0)
        let y = mesh.vertices[i + 1] - cy;
        let z = mesh.vertices[i + 2] - cz;
        
        // 2. Lakukan rotasi
        let y_rotated = y * c - z * s;
        let z_rotated = y * s + z * c;
        
        // 3. Geser kembali ke posisi semula
        mesh.vertices[i + 1] = y_rotated + cy;
        mesh.vertices[i + 2] = z_rotated + cz;
    }
}
// GANTI FUNGSI clawsAt LAMA ANDA DENGAN INI
function clawsAt(x, y, z, col) {
    // Tentukan posisi pusat untuk setiap cone cakar
    let c1_x = x - 0.05, c2_x = x, c3_x = x + 0.05;
    
    // Buat cone-nya
    let c1 = generateCone(0.01, 0.05, 4, c1_x, y, z, col);
    let c2 = generateCone(0.01, 0.05, 4, c2_x, y, z, col);
    let c3 = generateCone(0.01, 0.05, 4, c3_x, y, z, col);
    
    let ang = Math.PI / 2;
    
    // Panggil fungsi rotasi baru dengan menyertakan titik pusat masing-masing cone
    rotateMeshX(c1, ang, c1_x, y, z);
    rotateMeshX(c2, ang, c2_x, y, z);
    rotateMeshX(c3, ang, c3_x, y, z);
    
    return [c1, c2, c3];
}

// === 3 daging jari (Â¼-sphere) sejajar claw, agak masuk ke foot ===
function fingerPadsAt(x, y, z, col=[0,0,0]) {
  const r = 0.07;      
  const scale = 0.75;   // sedikit gepeng (low profile) -> opsi B
  const tiltX = Math.PI/2; // putar supaya tonjolan menghadap +Z (ke depan)

  // "sedikit masuk" ke foot: Y dinaikkan dikit (kurang negatif)
  const yPad = y + 0.004;

  // posisinya lebih ke belakang dari claw supaya claw keluar di depan
  const zPad = z - 0.025;

  
  const p1 = makeQuarterSphereCover(r, 20, 14, tiltX, 0, 0, x - 0.05, yPad, zPad, scale, col); // kiri
  const p2 = makeQuarterSphereCover(r, 20, 14, tiltX, 0, 0, x + 0.00, yPad, zPad, scale, col); // tengah
  const p3 = makeQuarterSphereCover(r, 20, 14, tiltX, 0, 0, x + 0.05, yPad, zPad, scale, col); // kanan

  return [p1, p2, p3];
}


function rotateX(mesh, angle){
  for (let i=0; i<mesh.vertices.length; i+=6){
    let y = mesh.vertices[i+1];
    let z = mesh.vertices[i+2];
    let y2 = y * Math.cos(angle) - z * Math.sin(angle);
    let z2 = y * Math.sin(angle) + z * Math.cos(angle);
    mesh.vertices[i+1] = y2;
    mesh.vertices[i+2] = z2;
  }
}

function rotateZ(mesh, angle){
  for (let i=0; i<mesh.vertices.length; i+=6){
    let x = mesh.vertices[i];
    let y = mesh.vertices[i+1];
    let x2 = x * Math.cos(angle) - y * Math.sin(angle);
    let y2 = x * Math.sin(angle) + y * Math.cos(angle);
    mesh.vertices[i]   = x2;
    mesh.vertices[i+1] = y2;
  }
}


function generateStar4_3D(size, thickness, tx, ty, tz, col=[1,0.8,0.2]) {
  var vertices=[], faces=[];

  let outerR = size;
  let innerR = size * 0.4; // lebih kecil biar runcing
  let numPoints = 4;

  // Buat lingkaran atas & bawah (extrude)
  for (let k=0;k<=1;k++) { 
    let z = (k===0 ? -thickness/2 : thickness/2);
    for (let i=0;i<numPoints*2;i++){
      let r = (i%2===0)?outerR:innerR;
      let ang = i*Math.PI/numPoints;  // 90Â° per sisi
      let x=r*Math.cos(ang);
      let y=r*Math.sin(ang);
      vertices.push(x+tx, y+ty, z+tz, col[0],col[1],col[2]);
    }
  }

  let topStart=0;
  let bottomStart=numPoints*2;

  // sisi luar
  for(let i=0;i<numPoints*2;i++){
    let next=(i+1)%(numPoints*2);
    let a=topStart+i, b=topStart+next;
    let c=bottomStart+next, d=bottomStart+i;
    faces.push(a,b,c, a,c,d);
  }

  // tutup atas
  let centerTop=vertices.length/6;
  vertices.push(tx,ty,tz+thickness/2,col[0],col[1],col[2]);
  for(let i=0;i<numPoints*2;i++){
    let next=(i+1)%(numPoints*2);
    faces.push(centerTop, topStart+i, topStart+next);
  }

  // tutup bawah
  let centerBottom=vertices.length/6;
  vertices.push(tx,ty,tz-thickness/2,col[0],col[1],col[2]);
  for(let i=0;i<numPoints*2;i++){
    let next=(i+1)%(numPoints*2);
    faces.push(centerBottom, bottomStart+next, bottomStart+i);
  }

  return {vertices,faces};
}

// ===== fungsi helper buat cone di samping =====
function makeSideCone(xPos, yPos, zPos, radius=0.05, height=0.2, slices=16, tiltAngle=Math.PI/2, sideOffsetAngle=0, color=[0.9,0.6,0.3]) {
    // buat cone dasar
    var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

    for(let i=0; i<cone.vertices.length; i+=6){
        // geser pivot ke pusat cone
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        // rotasi cone ke samping (sumbu X)
        let y2 = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle);
        let z2 = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle);

        // rotasi tambahan untuk offset arah (sumbu Z)
        let x2 = x * Math.cos(sideOffsetAngle) - y2 * Math.sin(sideOffsetAngle);
        let y3 = x * Math.sin(sideOffsetAngle) + y2 * Math.cos(sideOffsetAngle);

        // kembalikan ke posisi
        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y3 + yPos;
        cone.vertices[i+2] = z2 + zPos;
    }

    return cone;
}

// ===== fungsi helper buat cone di samping dengan tilt atas/bawah =====
function makeSideConeFlexible(xPos, yPos, zPos, radius=0.05, height=0.2, slices=16, tiltSide=Math.PI/2, tiltUpDown=0, color=[0.9,0.6,0.3]) {
    // buat cone dasar
    var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

    for(let i=0; i<cone.vertices.length; i+=6){
        // geser pivot ke pusat cone
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        // rotasi ke samping (sumbu X)
        let y2 = y * Math.cos(tiltSide) - z * Math.sin(tiltSide);
        let z2 = y * Math.sin(tiltSide) + z * Math.cos(tiltSide);

        // rotasi tilt ke atas/bawah (sumbu Z)
        let x2 = x * Math.cos(tiltUpDown) - y2 * Math.sin(tiltUpDown);
        let y3 = x * Math.sin(tiltUpDown) + y2 * Math.cos(tiltUpDown);

        // kembalikan ke posisi asli
        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y3 + yPos;
        cone.vertices[i+2] = z2 + zPos;
    }

    return cone;
}



function generateFlatEllipsoid(rx, ry, rz, stacks, slices, tx, ty, tz, col=[0.5,0.5,0.5]) {
  var vertices=[], faces=[];
  // vertex array
  for(let i=0;i<=stacks/2;i++){   // hanya setengah atas
    let theta = i * Math.PI / stacks;
    for(let j=0;j<=slices;j++){
      let phi = j * 2 * Math.PI / slices;
      let x = rx * Math.sin(theta) * Math.cos(phi);
      let y = ry * Math.cos(theta);
      let z = rz * Math.sin(theta) * Math.sin(phi);
      vertices.push(x+tx, y+ty, z+tz, col[0], col[1], col[2]);
    }
  }

  // buat sisi ellipsoid
  for(let i=0;i<stacks/2;i++){
    for(let j=0;j<slices;j++){
      let a=i*(slices+1)+j;
      let b=a+1;
      let c=a+(slices+1);
      let d=c+1;
      faces.push(a,b,d, a,d,c);
    }
  }

  // Tambah "disk" untuk nutup bagian bawah
  let baseCenterIndex = vertices.length;
  vertices.push(tx, ty, tz, col[0], col[1], col[2]); // pusat bawah

  for(let j=0;j<=slices;j++){
    let phi = j * 2 * Math.PI / slices;
    let x = rx * Math.sin(Math.PI/2) * Math.cos(phi);
    let z = rz * Math.sin(Math.PI/2) * Math.sin(phi);
    vertices.push(x+tx, 0+ty, z+tz, col[0], col[1], col[2]);
  }

  for(let j=0;j<slices;j++){
    let a=baseCenterIndex;
    let b=baseCenterIndex+1+j;
    let c=baseCenterIndex+1+((j+1)%slices);
    faces.push(a,b,c);
  }

  return {vertices,faces};
}

// ===== fungsi helper buat segitiga di depan body =====
function makeTriangleFront(xPos, yPos, zPos, size=0.1, height=0.15, slices=1, tiltSide=0, tiltUpDown=0, color=[1,0,0]) {
    var vertices = [], faces = [];

    // apex segitiga (titik atas)
    vertices.push(xPos, yPos + height/2, zPos, color[0], color[1], color[2]);
    let apexIndex = 0;

    // base segitiga (3 titik)
    let basePoints = [
        [-size/2, -height/2, -size/2],
        [ size/2, -height/2, -size/2],
        [ 0,     -height/2,  size/2]
    ];

    for (let p of basePoints){
        let x = p[0], y = p[1], z = p[2];

        // rotasi ke samping (sumbu Y)
        let x2 = x * Math.cos(tiltSide) + z * Math.sin(tiltSide);
        let z2 = -x * Math.sin(tiltSide) + z * Math.cos(tiltSide);

        // rotasi tilt ke atas/bawah (sumbu X)
        let y2 = y * Math.cos(tiltUpDown) - z2 * Math.sin(tiltUpDown);
        let z3 = y * Math.sin(tiltUpDown) + z2 * Math.cos(tiltUpDown);

        vertices.push(x2 + xPos, y2 + yPos, z3 + zPos, color[0], color[1], color[2]);
    }

    // sisi segitiga
    faces.push(apexIndex, 1, 2);
    faces.push(apexIndex, 2, 3);
    faces.push(apexIndex, 3, 1);

    return {vertices, faces};
}


// ===== fungsi helper buat cone dengan rotasi ke belakang + ke samping =====
function makeCone(xPos, yPos, zPos, tiltBack=Math.PI*310/180, sideAngle=0){
    var cone = generateCone(0.07, 0.40, 12, xPos, yPos, zPos, [0,0,0]);

    for(let i=0;i<cone.vertices.length;i+=6){
        // geser pivot ke dasar cone
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        // rotasi ke belakang (sumbu X/Z)
        let y2 = y * Math.cos(tiltBack) - z * Math.sin(tiltBack);
        let z2 = y * Math.sin(tiltBack) + z * Math.cos(tiltBack);

        // rotasi ke samping (sumbu Y)
        let x2 = x * Math.cos(sideAngle) + z2 * Math.sin(sideAngle);
        let z3 = -x * Math.sin(sideAngle) + z2 * Math.cos(sideAngle);

        // kembalikan ke posisi asli
        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y2 + yPos;
        cone.vertices[i+2] = z3 + zPos;
    }

    return cone;
}

// ===== cone dengan ukuran custom (lebih kecil) =====
function makeConeSized(
  xPos, yPos, zPos,
  radius=0.05, height=0.28, slices=12,
  tiltBack=Math.PI*250/180, sideAngle=0, color=[0,0,0]
){
  var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

  for (let i=0; i<cone.vertices.length; i+=6){
    // pivot di dasar kerucut
    let x = cone.vertices[i]   - xPos;
    let y = cone.vertices[i+1] - yPos;
    let z = cone.vertices[i+2] - zPos;

    // rotasi ke belakang (X/Z)
    let y2 = y * Math.cos(tiltBack) - z * Math.sin(tiltBack);
    let z2 = y * Math.sin(tiltBack) + z * Math.cos(tiltBack);

    // rotasi ke samping (Y)
    let x2 = x * Math.cos(sideAngle) + z2 * Math.sin(sideAngle);
    let z3 = -x * Math.sin(sideAngle) + z2 * Math.cos(sideAngle);

    cone.vertices[i]   = x2 + xPos;
    cone.vertices[i+1] = y2 + yPos;
    cone.vertices[i+2] = z3 + zPos;
  }
  return cone;
}

// ===== segitiga gepeng di depan body =====
function makeFlatTriangle(
  xPos, yPos, zPos,
  width=0.1, height=0.15,
  tiltSide=0,       // yaw   (sumbu Y)
  tiltUpDown=0,     // pitch (sumbu X)
  tiltRoll=0,       // roll  (sumbu Z)  <-- BARU
  color=[1,0,0]
){
  var vertices=[], faces=[];

  // titik-titik segitiga (di plane YZ)
  let p0 = [0, height/2, 0];       // apex
  let p1 = [-width/2, -height/2, 0];
  let p2 = [ width/2, -height/2, 0];

  let points = [p0,p1,p2];

  for(let p of points){
    let x=p[0], y=p[1], z=p[2];

    // yaw (sumbu Y)
    let x2 = x * Math.cos(tiltSide) + z * Math.sin(tiltSide);
    let z2 = -x * Math.sin(tiltSide) + z * Math.cos(tiltSide);

    // pitch (sumbu X)
    let y2 = y * Math.cos(tiltUpDown) - z2 * Math.sin(tiltUpDown);
    let z3 = y * Math.sin(tiltUpDown) + z2 * Math.cos(tiltUpDown);

    // roll (sumbu Z)  <-- BARU
    let xr = x2 * Math.cos(tiltRoll) - y2 * Math.sin(tiltRoll);
    let yr = x2 * Math.sin(tiltRoll) + y2 * Math.cos(tiltRoll);

    vertices.push(xr+xPos, yr+yPos, z3+zPos, color[0], color[1], color[2]);
  }

  faces.push(0,1,2);
  return {vertices, faces};
}

function makeConeAdjustable(xPos, yPos, zPos, radius=0.05, height=0.2, slices=16, tiltForward=Math.PI/9, color=[0,0,0]){
    // buat cone dasar
    var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

    // rotasi kemiringan ke depan (sumbu X/Z)
    for(let i=0; i<cone.vertices.length; i+=6){
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        let y2 = y * Math.cos(tiltForward) - z * Math.sin(tiltForward);
        let z2 = y * Math.sin(tiltForward) + z * Math.cos(tiltForward);

        cone.vertices[i]   = x + xPos;
        cone.vertices[i+1] = y2 + yPos;
        cone.vertices[i+2] = z2 + zPos;
    }

    return cone;
}


function makeHorizontalRing(xPos, yPos, zPos, radius=0.2, thickness=0.05, slices=20, color=[1,1,0]){
    var vertices = [], faces = [];
    // cylinder tipis di sumbu Z
    for(let i=0;i<=1;i++){
        let z = i*thickness - thickness/2;  // pusat di 0
        for(let j=0;j<=slices;j++){
            let phi = j*2*Math.PI/slices;
            let x = radius * Math.cos(phi);
            let y = radius * Math.sin(phi);
            vertices.push(x+xPos, z+yPos, y+zPos, color[0], color[1], color[2]); 
            // <-- rotasi: x tetap, y=tinggi, z=lingkaran
        }
    }
    for(let j=0;j<slices;j++){
        let a=j, b=j+1, c=(slices+1)+j, d=(slices+1)+j+1;
        faces.push(a,b,d, a,d,c);
    }
    return {vertices,faces};
}

function generateSmile3D(width, curveHeight, verticalThickness, horizontalThickness, slices, tx, ty, tz, color = [1, 0.3, 0.3]) {
    var vertices = [], faces = [];

    // Untuk setiap segmen di sepanjang kurva...
    for (let i = 0; i <= slices; i++) {
        let phi = i * Math.PI / slices;
        let x = (i / slices - 0.5) * width;
        let y_center = Math.sin(phi) * curveHeight;

        // Buat 4 titik untuk membentuk penampang persegi panjang
        const v_thick = verticalThickness / 2;
        const h_thick = horizontalThickness / 2;

        // 1. Atas-Depan (Top-Front)
        vertices.push(x + tx, y_center + ty + v_thick, tz + h_thick, color[0], color[1], color[2]);
        // 2. Atas-Belakang (Top-Back)
        vertices.push(x + tx, y_center + ty + v_thick, tz - h_thick, color[0], color[1], color[2]);
        // 3. Bawah-Depan (Bottom-Front)
        vertices.push(x + tx, y_center + ty - v_thick, tz + h_thick, color[0], color[1], color[2]);
        // 4. Bawah-Belakang (Bottom-Back)
        vertices.push(x + tx, y_center + ty - v_thick, tz - h_thick, color[0], color[1], color[2]);
    }

    // Buat sisi-sisi yang menghubungkan setiap penampang persegi
    for (let i = 0; i < slices; i++) {
        // Indeks untuk penampang saat ini (slice i)
        let p1_tf = i * 4 + 0; // Top-Front
        let p1_tb = i * 4 + 1; // Top-Back
        let p1_bf = i * 4 + 2; // Bottom-Front
        let p1_bb = i * 4 + 3; // Bottom-Back

        // Indeks untuk penampang berikutnya (slice i+1)
        let p2_tf = (i + 1) * 4 + 0;
        let p2_tb = (i + 1) * 4 + 1;
        let p2_bf = (i + 1) * 4 + 2;
        let p2_bb = (i + 1) * 4 + 3;

        // Buat 4 sisi (atas, bawah, depan, belakang)
        // Setiap sisi adalah quad (2 segitiga)
        
        // Sisi Atas
        faces.push(p1_tf, p2_tf, p2_tb);
        faces.push(p1_tf, p2_tb, p1_tb);

        // Sisi Bawah
        faces.push(p1_bb, p2_bb, p2_bf);
        faces.push(p1_bb, p2_bf, p1_bf);

        // Sisi Depan
        faces.push(p1_bf, p2_bf, p2_tf);
        faces.push(p1_bf, p2_tf, p1_tf);

        // Sisi Belakang
        faces.push(p1_tb, p2_tb, p2_bb);
        faces.push(p1_tb, p2_bb, p1_bb);
    }

    return { vertices, faces };
}

function makeManualStar(x, y, z, size=0.03, height=0.08, color=[1,1,0], tiltY=0){
    var vertices = [];
    var colors = [];

    // titik-titik bintang, puncak atas lebih tinggi
    var p = [
        [ size, 0, 0],   // kanan
        [0, size, 0],    // atas samping
        [-size, 0, 0],   // kiri
        [0, -size, 0],   // bawah
        [0, 0, height]   // puncak atas
    ];

    var cosY = Math.cos(tiltY), sinY = Math.sin(tiltY);

    function rotateY(v){
        var x1 = v[0]*cosY + v[2]*sinY;
        var z1 = -v[0]*sinY + v[2]*cosY;
        v[0] = x1; v[2] = z1;
        return v;
    }

    // rotasi + offset
    for(let i=0;i<p.length;i++){
        p[i] = rotateY(p[i]);
        p[i][0] += x;
        p[i][1] += y;
        p[i][2] += z;
    }

    // buat 4 segitiga dari puncak ke sisi bawah
    var triangles = [
        [4,0,1],
        [4,1,2],
        [4,2,3],
        [4,3,0]
    ];

    for(let t of triangles){
        for(let idx of t){
            vertices.push(p[idx][0], p[idx][1], p[idx][2]);
            colors.push(color[0], color[1], color[2]);
        }
    }

    return {vertices: vertices, colors: colors};
}

function generateAsymmetricStar(size, topPointLength, thickness, tx, ty, tz, tiltAngle = 0, col = [1, 0.8, 0.2]) {
    var vertices = [], faces = [];

    const innerR = size * 0.4; // Radius untuk titik-titik bagian dalam
    const cos_t = Math.cos(tiltAngle);
    const sin_t = Math.sin(tiltAngle);

    // Definisikan 8 titik untuk bentuk dasar bintang 2D
    let points = [
        [0, topPointLength], // 0: Titik luar atas (bisa dipanjangkan)
        [innerR, innerR],    // 1: Titik dalam kanan atas
        [size, 0],           // 2: Titik luar kanan
        [innerR, -innerR],   // 3: Titik dalam kanan bawah
        [0, -size],          // 4: Titik luar bawah
        [-innerR, -innerR],  // 5: Titik dalam kiri bawah
        [-size, 0],          // 6: Titik luar kiri
        [-innerR, innerR]    // 7: Titik dalam kiri atas
    ];

    // Terapkan rotasi (tilt) ke setiap titik
    let rotatedPoints = points.map(p => {
        let x = p[0] * cos_t - p[1] * sin_t;
        let y = p[0] * sin_t + p[1] * cos_t;
        return [x, y];
    });

    // Buat vertex depan dan belakang (ekstrusi 3D)
    for (let k = 0; k <= 1; k++) {
        let z = (k === 0 ? -thickness / 2 : thickness / 2);
        for (const p of rotatedPoints) {
            vertices.push(p[0] + tx, p[1] + ty, z + tz, col[0], col[1], col[2]);
        }
    }

    const frontStart = 0;
    const backStart = 8;

    // Buat sisi-sisi samping
    for (let i = 0; i < 8; i++) {
        let next = (i + 1) % 8;
        let a = frontStart + i, b = frontStart + next;
        let c = backStart + next, d = backStart + i;
        faces.push(a, b, c, a, c, d);
    }

    // Buat tutup depan
    let centerFront = vertices.length / 6;
    vertices.push(tx, ty, tz + thickness / 2, col[0], col[1], col[2]);
    for (let i = 0; i < 8; i++) {
        let next = (i + 1) % 8;
        faces.push(centerFront, frontStart + i, frontStart + next);
    }

    // Buat tutup belakang
    let centerBack = vertices.length / 6;
    vertices.push(tx, ty, tz - thickness / 2, col[0], col[1], col[2]);
    for (let i = 0; i < 8; i++) {
        let next = (i + 1) % 8;
        faces.push(centerBack, backStart + next, backStart + i);
    }

    return { vertices, faces };
}

function makeSphereCover(
    radius = 1,
    segments = 24,
    rings = 16,
    coverAngle = Math.PI,
    tiltX = 0,
    tiltY = 0,
    tiltZ = 0,
    xPos = 0,
    yPos = 0,
    zPos = 0,
    color = [0.5, 0.5, 0.5]
) {
    var vertices = [];
    var faces = [];

    // coverAngle = seberapa besar bagian sphere (Ï€ = setengah, 2Ï€ = penuh)
    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * (coverAngle / 2); // dari 0 sampai coverAngle/2
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * 2 * Math.PI;

            // koordinat dasar sphere
            let x = radius * Math.sin(theta) * Math.cos(phi);
            let y = radius * Math.cos(theta);
            let z = radius * Math.sin(theta) * Math.sin(phi);

            // rotasi tilt (Euler rotation)
            let rx = x;
            let ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
            let rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);

            let rxy = rx * Math.cos(tiltY) + rz * Math.sin(tiltY);
            let ryz = ry;
            let rzz = -rx * Math.sin(tiltY) + rz * Math.cos(tiltY);

            let rxx = rxy * Math.cos(tiltZ) - ryz * Math.sin(tiltZ);
            let ryy = rxy * Math.sin(tiltZ) + ryz * Math.cos(tiltZ);
            let rzz2 = rzz;

            // tambahkan posisi offset (xPos, yPos, zPos)
            vertices.push(
                rxx + xPos,
                ryy + yPos,
                rzz2 + zPos,
                color[0],
                color[1],
                color[2]
            );
        }
    }

    // buat face antar titik
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            let first = i * (segments + 1) + j;
            let second = first + segments + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return { vertices, faces };
}

function makeEllipsoidCover(
    radiusX = 1, // <--- PERUBAHAN 1
    radiusY = 1, // <--- PERUBAHAN 2
    radiusZ = 1, // <--- PERUBAHAN 3
    segments = 24,
    rings = 16,
    coverAngle = Math.PI,
    tiltX = 0,
    tiltY = 0,
    tiltZ = 0,
    xPos = 0,
    yPos = 0,
    zPos = 0,
    color = [0.5, 0.5, 0.5]
) {
    var vertices = [];
    var faces = [];

    // coverAngle = seberapa besar bagian ellipsoid (Ï€ = setengah, 2Ï€ = penuh)
    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * (coverAngle / 2); // dari 0 sampai coverAngle/2
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * 2 * Math.PI;

            // koordinat dasar ellipsoid
            let x = radiusX * Math.sin(theta) * Math.cos(phi); // <--- PERUBAHAN 4
            let y = radiusY * Math.cos(theta); // <--- PERUBAHAN 5
            let z = radiusZ * Math.sin(theta) * Math.sin(phi); // <--- PERUBAHAN 6

            // rotasi tilt (Euler rotation)
            let rx = x;
            let ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
            let rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);

            let rxy = rx * Math.cos(tiltY) + rz * Math.sin(tiltY);
            let ryz = ry;
            let rzz = -rx * Math.sin(tiltY) + rz * Math.cos(tiltY);

            let rxx = rxy * Math.cos(tiltZ) - ryz * Math.sin(tiltZ);
            let ryy = rxy * Math.sin(tiltZ) + ryz * Math.cos(tiltZ);
            let rzz2 = rzz;

            // tambahkan posisi offset (xPos, yPos, zPos)
            vertices.push(
                rxx + xPos,
                ryy + yPos,
                rzz2 + zPos,
                color[0],
                color[1],
                color[2]
            );
        }
    }

    // buat face antar titik
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            let first = i * (segments + 1) + j;
            let second = first + segments + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    return { vertices, faces };
}

function makeQuarterSphereCover(
    radius = 1,        // besar sphere
    segments = 24,     // jumlah segmen horizontal
    rings = 16,        // jumlah segmen vertikal
    tiltX = 0,         // miring di sumbu X
    tiltY = 0,         // miring di sumbu Y
    tiltZ = 0,         // miring di sumbu Z
    xPos = 0,          // posisi X
    yPos = 0,          // posisi Y
    zPos = 0,          // posisi Z
    scale = 1,         // faktor skala (besar keseluruhan)
    color = [0.6, 0.8, 1] // warna RGB
) {
    const vertices = [];
    const faces = [];

  // 1/3 horizontal, tinggi tetap 1/4
const THETA_MAX = Math.PI / 2;       // 90Â° (vertikal)
const PHI_MAX   = 2 * Math.PI / 3;   // 120Â° (horizontal)

// Offset Ï† biar tidak mengiris muka.
// Negatif = geser ke belakang kiri; positif = belakang kanan.
// Coba nilai ini dulu > agak ke belakang:
const PHI_START = -PHI_MAX * 0.35;   // â‰ˆ -42Â°

for (let i = 0; i <= rings; i++) {
  let theta = (i / rings) * THETA_MAX;
  for (let j = 0; j <= segments; j++) {
    let phi = PHI_START + (j / segments) * PHI_MAX;

    let x = radius * Math.cos(theta) * Math.cos(phi);
    let y = radius * Math.sin(theta);
    let z = radius * Math.cos(theta) * Math.sin(phi);

      // rotasi Euler spt semula
      let rx = x;
      let ry = y * Math.cos(tiltX) - z * Math.sin(tiltX);
      let rz = y * Math.sin(tiltX) + z * Math.cos(tiltX);

      let rxy = rx * Math.cos(tiltY) + rz * Math.sin(tiltY);
      let ryz = ry;
      let rzz = -rx * Math.sin(tiltY) + rz * Math.cos(tiltY);

      let rxx = rxy * Math.cos(tiltZ) - ryz * Math.sin(tiltZ);
      let ryy = rxy * Math.sin(tiltZ) + ryz * Math.cos(tiltZ);
      let rzz2 = rzz;

      vertices.push(
        rxx * scale + xPos,
        ryy * scale + yPos,
        rzz2 * scale + zPos,
        color[0], color[1], color[2]
      );
    }
  }
    
    // --- AWAL MODIFIKASI: Tambah Vertex Pusat ---
    // Tambahkan vertex di titik pusat (sudut) dari seperempat bola.
    // Ini adalah (0,0,0) yang ditransformasi, yg mana sama dengan (xPos, yPos, zPos)
    const centerIndex = (rings + 1) * (segments + 1);
    vertices.push(
        xPos, 
        yPos, 
        zPos,
        color[0],
        color[1],
        color[2]
    );
    // --- AKHIR MODIFIKASI ---


    // Buat face antar titik (permukaan melengkung)
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            let first = i * (segments + 1) + j;
            let second = first + segments + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    // --- AWAL MODIFIKASI: Tambah Face Penutup ---
    
    // 1. Buat face penutup alas (bidang XZ, saat i=0 atau y=0)
    //    Menghubungkan semua vertex di 'i=0' ke 'centerIndex'
    for (let j = 0; j < segments; j++) {
        // (pusat, titik_j, titik_j+1)
        faces.push(centerIndex, j, j + 1);
    }

    // 2. Buat face penutup samping (bidang XY, saat j=0 atau z=0)
    //    Menghubungkan semua vertex di 'j=0' ke 'centerIndex'
    for (let i = 0; i < rings; i++) {
        let current = i * (segments + 1);
        let next = (i + 1) * (segments + 1);
        // (pusat, titik_i, titik_i+1)
        faces.push(centerIndex, current, next);
    }

    // 3. Buat face penutup samping (bidang YZ, saat j=segments atau x=0)
    //    Menghubungkan semua vertex di 'j=segments' ke 'centerIndex'
    for (let i = 0; i < rings; i++) {
        let current = i * (segments + 1) + segments;
        let next = (i + 1) * (segments + 1) + segments;
        // (pusat, titik_i+1, titik_i) -> Dibalik untuk winding order yg benar
        faces.push(centerIndex, next, current);
    }
    // --- AKHIR MODIFIKASI ---

    return { vertices, faces };
}

function mergeMeshes(meshes){
  let vertices=[], faces=[], offset=0;
  for(let m of meshes){
    vertices.push(...m.vertices);
    for(let f of m.faces){
      faces.push(f+offset);
    }
    offset+=m.vertices.length/6;
  }
  return {vertices,faces};
}

var head = generateSphereFlatColor(0.37, 30, 30, 0, 0.27, 0.4); // Kepala dua warna

  // body dinaikkan biar lebih nempel ke sphere
    // body dinaikkan + ujung agak gepeng (radiusZ lebih kecil)
var body = generateEllipsoidFlatColor(0.34, 0.20, 0.7, 30, 30, 0, -0.25, -0.3, [0.2,0.8,1]);

var line = generateEllipsoidFlatColor(0.1, 0.20, 0.65, 30, 30, 0, -0.23, -0.3, [0, 0, 0]);

let ellipsoidData = makeEllipsoidCover(
    0.33,    // radiusX
    0.6,  // radiusY
    0.2,    // radiusZ
    24,   // segments
    16,   // rings
    Math.PI, // coverAngle
    4.7,    // tiltX
    0,    // tiltY
    0,    // tiltZ
    0,    // xPos
    -0.25,    // yPos
    -0.5,    // zPos
    [0, 0, 0] // color (merah)
);




  // kaki dilebarkan posisinya di sumbu X
    // kaki lebih besar dan panjang ke atas
var leg1 = generateCylinder(0.09, 0.6, 20, -0.14, -0.9, 0.23, [0.2, 0.8, 1.0]);
var leg2 = generateCylinder(0.09, 0.6, 20,  0.14, -0.9, 0.23, [0.2, 0.8, 1.0]);
// kaki belakang hitam
var leg3 = generateCylinder(0.09, 0.6, 20, -0.14, -0.9, -0.7, [0.2, 0.8, 1.0]);
var leg4 = generateCylinder(0.09, 0.6, 20,  0.14, -0.9, -0.7, [0.2, 0.8, 1.0]);

// ellipsoid tipis di depan leg1 & leg2 (shoulder/upper pad)
var legFrontL = generateFlatEllipsoid(
  0.1, 0.65, 0.06,   // rx, ry, rz
  20, 20,             // stacks, slices
  -0.14, -0.9, 0.3, // tx, ty, tz (depan leg1)
  [0,0,0]             // warna hitam
);

// ellipsoid tipis di depan leg1 & leg2 (shoulder/upper pad)
var uplegFrontL = generateFlatEllipsoid(
  0.06, 0.25, 0.06,   // rx, ry, rz
  20, 20,             // stacks, slices
  -0.14, -0.36, 0.28, // tx, ty, tz (depan leg1)
  [0,0,0]             // warna hitam
);

var legFrontR = generateFlatEllipsoid(
  0.1, 0.65, 0.06,   // rx, ry, rz
  20, 20,
  0.14, -0.9, 0.3,  // depan leg2
  [0,0,0]
);

// ellipsoid tipis di depan leg1 & leg2 (shoulder/upper pad)
var uplegFrontR = generateFlatEllipsoid(
  0.06, 0.25, 0.06,   // rx, ry, rz
  20, 20,             // stacks, slices
  0.14, -0.36, 0.28, // tx, ty, tz (depan leg1)
  [0,0,0]             // warna hitam
);

// --- cone kuning "mengintip" di belakang front legs (leg1 & leg2) ---
var coneLegBackL1 = makeConeSized(
  -0.2,      // x: agak ke kiri dari leg1 (-0.14)
  -0.8,      // y: ketinggian di antara badan & paha
   0.17,      // z: sedikit DI BELAKANG leg depan (leg z ≈ 0.23)
  0.06,       // radius
  0.22,       // height
  8,         // slices
  -20 * Math.PI/180,  // tiltBack: condong ke bawah/ke belakang
   20 * Math.PI/180,  // sideAngle: keluar ke kiri
  [0, 0, 0]    // kuning
);

// --- cone kuning "mengintip" di belakang front legs (leg1 & leg2) ---
var coneLegBackL2 = makeConeSized(
  -0.15,      // x: agak ke kiri dari leg1 (-0.14)
  -0.8,      // y: ketinggian di antara badan & paha
   0.14,      // z: sedikit DI BELAKANG leg depan (leg z ≈ 0.23)
  0.06,       // radius
  0.22,       // height
  8,         // slices
  -20 * Math.PI/180,  // tiltBack: condong ke bawah/ke belakang
  0 * Math.PI/180,  // sideAngle: keluar ke kiri
  [0, 0, 0]    // kuning
);

// --- cone kuning "mengintip" di belakang front legs (leg1 & leg2) ---
var coneLegBackL3 = makeConeSized(
  -0.09,      // x: agak ke kiri dari leg1 (-0.14)
  -0.8,      // y: ketinggian di antara badan & paha
   0.16,      // z: sedikit DI BELAKANG leg depan (leg z ≈ 0.23)
  0.06,       // radius
  0.22,       // height
  8,         // slices
  -20 * Math.PI/180,  // tiltBack: condong ke bawah/ke belakang
   -20 * Math.PI/180,  // sideAngle: keluar ke kiri
  [0, 0, 0]    // kuning
);

var coneLegBackR1 = makeConeSized(
   0.2,      // x: kanan
  -0.8,      // y
   0.18,      // z
  0.06,       // radius
  0.22,       // height
  16,         
  -20 * Math.PI/180,  // tiltBack
  320 * Math.PI/180,  // keluar ke kanan (mirror)
  [0, 0, 0]
);

var coneLegBackR2 = makeConeSized(
   0.15,      // x: kanan
  -0.8,      // y
   0.15,      // z
  0.06,       // radius
  0.22,       // height
  16,         
  -20 * Math.PI/180,  // tiltBack
  0 * Math.PI/180,  // keluar ke kanan (mirror)
  [0, 0, 0]
);

var coneLegBackR3 = makeConeSized(
   0.1,      // x: kanan
  -0.8,      // y
   0.16,      // z
  0.06,       // radius
  0.22,       // height
  16,         
  -20 * Math.PI/180,  // tiltBack
  20 * Math.PI/180,  // keluar ke kanan (mirror)
  [0, 0, 0]
);

var foot1 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20, -0.14, -0.9, 0.28, [0, 0, 0]);
var foot2 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20,  0.14, -0.9, 0.28, [0, 0, 0]);
var foot3 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20, -0.14, -0.9, -0.63, [0.2, 0.8, 1.0]);
var foot4 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20,  0.14, -0.9, -0.63, [0.2, 0.8, 1.0]);

let claws1 = clawsAt(-0.14, -0.89, 0.41, [0.6, 0.6, 0.6]); 
let claws2 = clawsAt(-0.14, -0.89, -0.50, [0.6, 0.6, 0.6]);
let claws3 = clawsAt(0.14, -0.89, 0.41, [0.6, 0.6, 0.6]);
let claws4 = clawsAt(0.14, -0.89, -0.50, [0.6, 0.6, 0.6]);

const padsFrontL = fingerPadsAt(-0.16, -0.89, 0.36, [0,0,0]);
const padsFrontR = fingerPadsAt( 0.12, -0.89, 0.36, [0,0,0]);
const padsBackL = fingerPadsAt(-0.16, -0.89, -0.55, [0.2,0.8,1.0]);
const padsBackR = fingerPadsAt( 0.12, -0.89, -0.55, [0.2,0.8,1.0]);


// --- telapak bawah: ellipsoid utuh warna hitam di bawah setiap foot ---
const soleY = -0.91;      // sedikit lebih rendah dari foot (-0.90)
const soleRx = 0.1;      // lebar kiri-kanan
const soleRy = 0.025;      // tipis vertikal (pipih tapi tetap ellipsoid utuh)
const soleRz = 0.12;      // panjang depan-belakang

var sole1 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24, -0.14, soleY,  0.25, [0,0,0]);
var sole2 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24,  0.14, soleY,  0.25, [0,0,0]);
var sole3 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24, -0.14, soleY, -0.67, [0.2, 0.8, 1.0]);
var sole4 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24,  0.14, soleY, -0.67, [0.2, 0.8, 1.0]);



var thighMuscle3 = generateAndRotateInvertedCone(0.15, 0.3, 10, -0.14, -0.46, -0.6, [0,0,0], 0.2);
var thighMuscleBack3 = generateAndRotateInvertedCone(0.1, 0.3, 10, -0.14, -0.46, -0.76, [0,0,0], 0.1);



var thighMuscle4 = generateAndRotateInvertedCone(0.15, 0.3, 10,  0.14, -0.46, -0.6, [0,0,0], 0.2);
var thighMuscleBack4 = generateAndRotateInvertedCone(0.1, 0.3, 10,  0.14, -0.46, -0.76, [0,0,0], 0.1);

  // telapak pipih untuk tiap kaki


  // ekor pakai silinder tipis
// ekor horizontal ke belakang
var tail=generateCylinderZ(0.03,0.8,20, 0,-0.25,-1.8,[0,0,0]);


  var star = generateStar4_3D(0.25, 0.05, 0, -0.25, -1.83, [1,0.85,0.1]);

  // telinga kiri (kecil, elipsoid)
// telinga kiri (elipsoid biasa)
var earLeft = generateEllipsoid(0.15, 0.2, 0.08, 20, 20, -0.39, 0.4, 0.6, [0.2, 0.8, 1.0]);
rotateZ(earLeft, 0 * Math.PI/180); // rotasi sumbu 


// telinga kanan (elipsoid biasa)
var earRight = generateEllipsoid(0.15, 0.2, 0.08, 20, 20, 0.39, 0.4, 0.6, [0.2, 0.8, 1.0]);
rotateZ(earRight, 360 * Math.PI/180);

var ring1 = makeHorizontalRing(-0.14, -0.76, 0.23, 0.095, 0.08, 20, [1,1,0]);
var ring2 = makeHorizontalRing( 0.14, -0.76, 0.23, 0.095, 0.08, 20, [1,1,0]);
var ring3 = makeHorizontalRing(-0.14, -0.63, 0.23, 0.095, 0.08, 20, [1,1,0]);
var ring4 = makeHorizontalRing( 0.14, -0.63, 0.23, 0.095, 0.08, 20, [1,1,0]);
var ring5 = makeHorizontalRing(-0.14, -0.5, 0.23, 0.095, 0.08, 20, [1,1,0]);
var ring6 = makeHorizontalRing( 0.14, -0.5, 0.23, 0.095, 0.08, 20, [1,1,0]);
var ring7 = makeHorizontalRing(-0.14, -0.87, 0.23, 0.095, 0.1, 20, [0,0,0]);
var ring8 = makeHorizontalRing( 0.14, -0.87, 0.23, 0.095, 0.1, 20, [0,0,0]);

  // cone di bawah sphere, agak miring ke depan
var cone = generateCone(0.18, 0.37, 20, 0, 0.017, 0.4, [0,0,0]);

let angle = 23 * Math.PI/180;
for (let i=0; i<cone.vertices.length; i+=6){
  let y = cone.vertices[i+1] - 0.3; // geser pivot ke sphere bawah
  let z = cone.vertices[i+2] - 0.4;
  let y2 = y*Math.cos(angle) - z*Math.sin(angle);
  let z2 = y*Math.sin(angle) + z*Math.cos(angle);
  cone.vertices[i+1] = y2 + 0.3;
  cone.vertices[i+2] = z2 + 0.4;
}

// ===== cone kecil di belakang body =====
var cone1 = makeCone(0, -0.15, -1.1, 310*Math.PI/180, 0);

// cone kanan miring ke samping 40Â° (positif = kanan)
var cone2 = makeCone(-0.06, -0.21, -1.1, 290*Math.PI/180, 40*Math.PI/180);

// cone kiri miring ke samping -40Â° (negatif = kiri)
var cone3 = makeCone(0.06, -0.21, -1.1, 290*Math.PI/180, -40*Math.PI/180);

var cone4 = makeCone(0.1, -0.32, -1.1, 250*Math.PI/180, -50*Math.PI/180);

var cone5 = makeCone(-0.1, -0.32, -1.1, 250*Math.PI/180, 50*Math.PI/180);

var frontConeL1 = makeConeSized(
  -0.25, -0.3, 0,   // posisi (x, y, z) — agak ke luar dari leg kiri
  0.1, 0.5, 12,       // radius, height, slices (lebih kecil)
  260*Math.PI/180,      // tiltBack (mundur)
  30*Math.PI/180,       // sideAngle (keluar ke kiri)
  [0,0,0]
);

var frontConeL2 = makeConeSized(
  -0.3, -0.2, 0,   // posisi (x, y, z) — agak ke luar dari leg kiri
  0.12, 0.6, 12,       // radius, height, slices (lebih kecil)
  285*Math.PI/180,      // tiltBack (mundur)
  30*Math.PI/180,       // sideAngle (keluar ke kiri)
  [0,0,0]
);

var frontConeL3 = makeConeSized(
  -0.28, -0.1, 0.05,   // posisi (x, y, z) — agak ke luar dari leg kiri
  0.09, 0.5, 12,       // radius, height, slices (lebih kecil)
  285*Math.PI/180,      // tiltBack (mundur)
  30*Math.PI/180,       // sideAngle (keluar ke kiri)
  [0,0,0]
);

var frontConeR1 = makeConeSized(
  0.25, -0.3, 0,   // posisi (x, y, z) — agak ke luar dari leg kanan
  0.1, 0.5, 12,       // radius, height, slices (lebih kecil)
  260*Math.PI/180,      // tiltBack (mundur)
  -30*Math.PI/180,       // sideAngle (keluar ke kanan)
  [0,0,0]
);

var frontConeR2 = makeConeSized(
  0.3, -0.2, 0,   // posisi (x, y, z) — agak ke luar dari leg kanan
  0.12, 0.6, 12,       // radius, height, slices (lebih kecil)
  285*Math.PI/180,      // tiltBack (mundur)
  -30*Math.PI/180,       // sideAngle (keluar ke kanan)
  [0,0,0]
);

var frontConeR3 = makeConeSized(
  0.28, -0.1, 0.05,   // posisi (x, y, z) — agak ke luar dari leg kanan
  0.09, 0.5, 12,       // radius, height, slices (lebih kecil)
  285*Math.PI/180,      // tiltBack (mundur)
  -30*Math.PI/180,       // sideAngle (keluar ke kanan)
  [0,0,0]
);

// cone atas menghadap samping kanan
var sideConeTop1 = makeSideCone(0.4, 0.2, 0, 0.05, 0.2, 16, 180*Math.PI/180, 90*Math.PI/180, [0.2, 0.8, 1.0]);

// segitiga kiri (roll +20Â°)
var triLeft = makeFlatTriangle(
  -0.2, 0.16, 0.7,
  0.2, 0.25,
  180*Math.PI/180,   // yaw
  140*Math.PI/180,   // pitch
  130*Math.PI/180,    // roll (BARU)
  [0,0,0]
);

// segitiga kanan (roll -20Â°)
var triRight = makeFlatTriangle(
  0.2, 0.16, 0.7,
  0.2, 0.25,
  180*Math.PI/180,   // yaw
  140*Math.PI/180,   // pitch
  -130*Math.PI/180,   // roll (BARU)
  [0,0,0]
);

// ===== elipsoid kecil untuk hidung =====
var nose = generateEllipsoid(
    0.05,  // rx: lebar hidung
    0.02,  // ry: tinggi hidung
    0.02,  // rz: kedalaman/tebal hidung
    20,    // stacks
    20,    // slices
    0,     // tx: pos X (di tengah)
    0.21,  // ty: pos Y (di depan sphere)
    0.775,   // tz: pos Z (sedikit di depan sphere)
    [1, 0, 0] // warna pink/hidung
);

// === Bulu Persegi Panjang di Atas Hidung ===
function makeFlatRectangle(xPos, yPos, zPos, w=0.06, h=0.05, thickness=0.01, color=[0,0,0]){
  var vertices = [], faces = [];
  const halfW = w/2, halfH = h/2, halfT = thickness/2;

  // 4 titik depan
  vertices.push(
    xPos - halfW, yPos + halfH, zPos + halfT, color[0], color[1], color[2],
    xPos + halfW, yPos + halfH, zPos + halfT, color[0], color[1], color[2],
    xPos + halfW, yPos - halfH, zPos + halfT, color[0], color[1], color[2],
    xPos - halfW, yPos - halfH, zPos + halfT, color[0], color[1], color[2]
  );

  // 4 titik belakang
  vertices.push(
    xPos - halfW, yPos + halfH, zPos - halfT, color[0], color[1], color[2],
    xPos + halfW, yPos + halfH, zPos - halfT, color[0], color[1], color[2],
    xPos + halfW, yPos - halfH, zPos - halfT, color[0], color[1], color[2],
    xPos - halfW, yPos - halfH, zPos - halfT, color[0], color[1], color[2]
  );

  // 12 segitiga (6 face)
  faces.push(
    0,1,2, 0,2,3,  // depan
    4,5,6, 4,6,7,  // belakang
    0,4,7, 0,7,3,  // kiri
    1,5,6, 1,6,2,  // kanan
    0,1,5, 0,5,4,  // atas
    3,2,6, 3,6,7   // bawah
  );

  return {vertices, faces};
}

// --- Panggil (ini posisinya pas di atas hidung, tweak bebas)
var noseFur = makeFlatRectangle(
  0, 0.3, 0.76,   // X,Y,Z posisi pusat
  0.1, 0.16, 0.015, // w,h,tebal
  [0,0,0]           // warna hitam (bulu gelap)
);


// Ganti panggilan fungsi `smile` Anda dengan yang ini
var smile = generateSmile3D(
    0.3,       // width: Lebar senyuman
   0.05,       // curveHeight: Lengkungan ke bawah
    0.02,       // verticalThickness: Ketebalan NAIK-TURUN
    0.03,       // horizontalThickness: Ketebalan MAJU-MUNDUR
    20,         // slices: Kehalusan kurva
    0,          // tx: Posisi X
    0.1,        // ty: Posisi Y
    0.72,       // tz: Posisi Z
    [0, 0, 0] // color
);

// misal pengen roll 15 derajat searah jarum jam
const smileRollDeg = 15;
rotateMeshX(smile, smileRollDeg * Math.PI/180, 0, 0.1, 0.74);

// === helpers dari luxio.html untuk bentuk mata ===
function scaleMeshXY(mesh, sx, sy, cx, cy, cz){
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]-cx, y = mesh.vertices[i+1]-cy;
    mesh.vertices[i] = x*sx + cx;
    mesh.vertices[i+1] = y*sy + cy;
  }
}
function rotateMeshY(mesh, ang, cx, cy, cz){
  const c=Math.cos(ang), s=Math.sin(ang);
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]-cx, y = mesh.vertices[i+1]-cy, z = mesh.vertices[i+2]-cz;
    let x2 =  c*x + s*z, z2 = -s*x + c*z;
    mesh.vertices[i]=x2+cx; mesh.vertices[i+1]=y+cy; mesh.vertices[i+2]=z2+cz;
  }
}
function rotateMeshX(mesh, ang, cx, cy, cz){
  const c=Math.cos(ang), s=Math.sin(ang);
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]-cx, y = mesh.vertices[i+1]-cy, z = mesh.vertices[i+2]-cz;
    let y2 = c*y - s*z, z2 = s*y + c*z;
    mesh.vertices[i]=x+cx; mesh.vertices[i+1]=y2+cy; mesh.vertices[i+2]=z2+cz;
  }
}
function translateMesh(mesh, dx,dy,dz){
  for (let i=0;i<mesh.vertices.length;i+=6){
    mesh.vertices[i]+=dx; mesh.vertices[i+1]+=dy; mesh.vertices[i+2]+=dz;
  }
}

// clip & extrude polygon elips â†’ jadi mesh mata
function clipPolygonWithLine(poly, a, b, c){
  const out = []; function f(p){return a*p[0]+b*p[1]+c;}
  for (let i=0;i<poly.length;i++){
    const P=poly[i], Q=poly[(i+1)%poly.length];
    const fP=f(P), fQ=f(Q), inP=fP<=0, inQ=fQ<=0;
    if (inP && inQ){ out.push(Q); }
    else if (inP && !inQ){ const t=fP/(fP-fQ); out.push([P[0]+t*(Q[0]-P[0]), P[1]+t*(Q[1]-P[1])]); }
    else if (!inP && inQ){ const t=fP/(fP-fQ); out.push([P[0]+t*(Q[0]-P[0]), P[1]+t*(Q[1]-P[1])]); out.push(Q); }
  }
  return out;
}
function ellipsePolygon(rx, ry, segments){
  const poly=[]; for (let i=0;i<segments;i++){ const ang=i*2*Math.PI/segments; poly.push([rx*Math.cos(ang), ry*Math.sin(ang)]); }
  return poly;
}
function fanTriangulate(poly){ const faces=[]; for (let i=1;i<poly.length-1;i++) faces.push(0,i,i+1); return faces; }
function extrudeConvexPoly(poly, tx,ty,tz, thickness, col){
  const half=thickness/2, n=poly.length, vertices=[], faces=[];
  const frontBase=0; for (let i=0;i<n;i++) vertices.push(poly[i][0]+tx, poly[i][1]+ty, tz+half, col[0],col[1],col[2]);
  const frontFaces=fanTriangulate(poly).map(i=>i+frontBase);
  const backBase=vertices.length/6;
  for (let i=0;i<n;i++) vertices.push(poly[i][0]+tx, poly[i][1]+ty, tz-half, col[0],col[1],col[2]);
  const backFaces=fanTriangulate(poly).map(idx=>[0,idx,(idx+1)%n]).flat().map(i=>i+backBase);
  for (let i=0;i<n;i++){ const j=(i+1)%n, a=frontBase+i, b=frontBase+j, c=backBase+j, d=backBase+i; faces.push(a,b,c, a,c,d); }
  faces.push(...frontFaces, ...backFaces);
  return {vertices, faces};
}
function makeClippedEllipseExtruded(rx, ry, segments, tx, ty, tz, thickness, cuts, col){
  let poly=ellipsePolygon(rx,ry,segments);
  if (cuts){ for (const cut of cuts){ poly=clipPolygonWithLine(poly, cut.a,cut.b,cut.c); if (poly.length<3) break; } }
  return extrudeConvexPoly(poly, tx,ty,tz, thickness, col);
}


// ===== MATA (bentuk Luxio, posisi & skala tetap dari index2) =====
var eyePosY = 0.32;
var eyePosX = 0.15;
var eyePosZ = 0.76;

// ukuran luar (putih) & dalam (kuning) disamakan dengan skala kamu (0.08 & 0.06)
const rxWhite = 0.08, ryWhite = 0.08;
const rxInner = 0.06, ryInner = 0.06;
const thick   = 0.004;

// sudut potong diagonal (mirip Luxio) dan â€œperataanâ€ sisi dalam
const th = 32 * Math.PI/180;

// --- MATA KIRI (putih) ---
{
  // CUT 1: diagonal kiri-atas (keep sisi kiri-bawah)
  const a1 =  Math.cos(th), b1 = Math.sin(th);
  const x0d = -0.04, y0d = 0.06;                 // titik lewat garis (lokal terhadap pusat mata)
  const c1 = -(a1*x0d + b1*y0d);
  // CUT 2: vertikal sisi dalam (x <= x_cut)
  const x_cut = 0.02; const a2 = 1, b2 = 0, c2 = -x_cut;

  var eyeWhiteL = makeClippedEllipseExtruded(
    rxWhite, ryWhite, 76,
    -eyePosX, eyePosY, eyePosZ,
    thick,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1,0,0]
  );

  // INNER KIRI (kuning)
  var eyeYellowL = makeClippedEllipseExtruded(
    rxInner, ryInner, 76,
    -eyePosX, eyePosY, eyePosZ,
    thick,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );

  // kamu minta posisi & skala tetap â‡’ tidak aku miringkan/scale ekstra
  // supaya nongol sedikit di depan putih:
  translateMesh(eyeYellowL, 0, 0, 0.002);
}

// --- MATA KANAN (mirror dari kiri) ---
{
  // CUT 1: diagonal kanan-atas (keep sisi kanan-bawah)
  const a1 = -Math.cos(th), b1 =  Math.sin(th);
  const x0d =  0.05, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);
  // CUT 2: vertikal sisi dalam (x >= -x_cut) â†’ bentuk â‰¤ 0
  const x_cut = 0.02; const a2 = -1, b2 = 0, c2 = -x_cut;

  var eyeWhiteR = makeClippedEllipseExtruded(
    rxWhite, ryWhite, 76,
    eyePosX, eyePosY, eyePosZ,
    thick,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1,0,0]
  );

  var eyeYellowR = makeClippedEllipseExtruded(
    rxInner, ryInner, 76,
    eyePosX, eyePosY, eyePosZ,
    thick,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );

  translateMesh(eyeYellowR, 0, 0, 0.002);
}

// --- IRIS & RING: pakai clipped ellipse supaya "kecut" ---
// ukuran (sedikit lebih kecil utk iris, sedikit lebih besar utk ring)
const segIris = 76;
const irisRx = 0.035, irisRy = 0.035;
const ringRx = 0.040, ringRy = 0.040;   // lebih besar dikit dari iris
const thIris = 0.004;

// ---- KIRI (pakai cuts kiri yang sama dengan eyeWhiteL/eyeYellowL) ----
{
  const th = 32 * Math.PI/180;
  const a1 =  Math.cos(th), b1 = Math.sin(th);
  const x0d = -0.04, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);
  const x_cut = 0.02; 
  const a2 = 1, b2 = 0, c2 = -x_cut;

  // ring hitam â€“ sedikit LEBIH BELAKANG supaya jadi â€œtepiâ€ saja
  var ringL  = makeClippedEllipseExtruded(
    ringRx, ringRy, segIris,
    -eyePosX, eyePosY, eyePosZ + 0.0033,
    thIris,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [0,0,0]
  );

  // iris kuning â€“ sedikit LEBIH DEPAN agar menutup bagian dalam ring
  var irisL  = makeClippedEllipseExtruded(
    irisRx, irisRy, segIris,
    -eyePosX, eyePosY, eyePosZ + 0.0036,
    thIris,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );
}

// ---- KANAN (mirror cuts kanan yang sama dengan eyeWhiteR/eyeYellowR) ----
{
  const th = 32 * Math.PI/180;
  const a1 = -Math.cos(th), b1 =  Math.sin(th);
  const x0d =  0.05, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);
  const x_cut = 0.02; 
  const a2 = -1, b2 = 0, c2 = -x_cut;

  var ringR = makeClippedEllipseExtruded(
    ringRx, ringRy, segIris,
    eyePosX, eyePosY, eyePosZ + 0.0033,
    thIris,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [0,0,0]
  );

  var irisR = makeClippedEllipseExtruded(
    irisRx, irisRy, segIris,
    eyePosX, eyePosY, eyePosZ + 0.0036,
    thIris,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );
}



// --- helper: buat annulus (cincin) extruded tipis ---
function extrudeAnnulus(rxOuter, ryOuter, rxInner, ryInner, segments, tx, ty, tz, thickness, col=[0,0,0]){
  const half = thickness/2, V=[], F=[];
  // indeks basis
  const baseFrontOuter = 0;
  // front outer
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxOuter*Math.cos(a)+tx, ryOuter*Math.sin(a)+ty, tz+half, col[0],col[1],col[2]);
  }
  const baseFrontInner = V.length/6;
  // front inner (searah jarum jam biar facing sama)
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxInner*Math.cos(a)+tx, ryInner*Math.sin(a)+ty, tz+half, col[0],col[1],col[2]);
  }
  const baseBackOuter = V.length/6;
  // back outer
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxOuter*Math.cos(a)+tx, ryOuter*Math.sin(a)+ty, tz-half, col[0],col[1],col[2]);
  }
  const baseBackInner = V.length/6;
  // back inner
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxInner*Math.cos(a)+tx, ryInner*Math.sin(a)+ty, tz-half, col[0],col[1],col[2]);
  }

  // front face (antara outer & inner)
  for(let i=0;i<segments;i++){
    const o1=baseFrontOuter+i, o2=o1+1;
    const in1=baseFrontInner+i, in2=in1+1;
    F.push(o1, o2, in2,  o1, in2, in1);
  }
  // back face
  for(let i=0;i<segments;i++){
    const o1=baseBackOuter+i, o2=o1+1;
    const in1=baseBackInner+i, in2=in1+1;
    // dibalik winding-nya agar normal ke belakang
    F.push(o1, in2, o2,  o1, in1, in2);
  }
  // dinding luar (outer wall)
  for(let i=0;i<segments;i++){
    const f1=baseFrontOuter+i, f2=f1+1;
    const b1=baseBackOuter+i,  b2=b1+1;
    F.push(f1, f2, b2,  f1, b2, b1);
  }
  // dinding dalam (inner wall)
  for(let i=0;i<segments;i++){
    const f1=baseFrontInner+i, f2=f1+1;
    const b1=baseBackInner+i,  b2=b1+1;
    // dibalik agar normal menghadap dalam
    F.push(f1, b2, f2,  f1, b1, b2);
  }
  return {vertices:V, faces:F};
}

// --- helper: disc (lingkaran penuh) extruded tipis ---
function extrudeDisc(rx, ry, segments, tx, ty, tz, thickness, col=[1,0.85,0.1]){
  const half=thickness/2, V=[], F=[];
  const centerFront = 0;
  V.push(tx,ty,tz+half,col[0],col[1],col[2]);
  const ringFront = 1;
  for(let i=0;i<=segments;i++){
    const a=i*2*Math.PI/segments;
    V.push(rx*Math.cos(a)+tx, ry*Math.sin(a)+ty, tz+half, col[0],col[1],col[2]);
  }
  const centerBack = V.length/6;
  V.push(tx,ty,tz-half,col[0],col[1],col[2]);
  const ringBack = V.length/6;
  for(let i=0;i<=segments;i++){
    const a=i*2*Math.PI/segments;
    V.push(rx*Math.cos(a)+tx, ry*Math.sin(a)+ty, tz-half, col[0],col[1],col[2]);
  }
  // tutup depan
  for(let i=0;i<segments;i++) F.push(centerFront, ringFront+i, ringFront+i+1);
  // tutup belakang
  for(let i=0;i<segments;i++) F.push(centerBack, ringBack+i+1, ringBack+i);
  // dinding samping
  for(let i=0;i<segments;i++){
    const f1=ringFront+i, f2=f1+1, b1=ringBack+i, b2=b1+1;
    F.push(f1,f2,b2, f1,b2,b1);
  }
  return {vertices:V, faces:F};
}

// --- util: konversi derajat ke radian (kalau mau pakai derajat)
function deg2rad(d){ return d * Math.PI / 180; }

// --- rotasi satu mesh terhadap pusat (cx,cy,cz) ---
// urutan rotasi: Z → Y → X (roll, yaw, pitch)
function rotateMeshEuler(mesh, rx, ry, rz, cx, cy, cz){
  const czs = Math.cos(rz), szs = Math.sin(rz); // Z
  const cys = Math.cos(ry), sys = Math.sin(ry); // Y
  const cxs = Math.cos(rx), sxs = Math.sin(rx); // X

  for (let i=0; i<mesh.vertices.length; i+=6){
    // translate ke pusat
    let x = mesh.vertices[i]   - cx;
    let y = mesh.vertices[i+1] - cy;
    let z = mesh.vertices[i+2] - cz;

    // 1) Roll di sumbu Z
    let xz =  x*czs - y*szs;
    let yz =  x*szs + y*czs;
    let zz =  z;

    // 2) Yaw di sumbu Y
    let xy =  xz*cys + zz*sys;
    let yy =  yz;
    let zy = -xz*sys + zz*cys;

    // 3) Pitch di sumbu X
    let xf =  xy;
    let yf =  yy*cxs - zy*sxs;
    let zf =  yy*sxs + zy*cxs;

    // kembali ke posisi dunia
    mesh.vertices[i]   = xf + cx;
    mesh.vertices[i+1] = yf + cy;
    mesh.vertices[i+2] = zf + cz;
  }
}

// --- helper: rotasi 2 mata sekaligus (kiri & kanan) ---
// rx=pitch (angkat/turunin), ry=yaw (arahkan ke dalam/keluar), rz=roll (miringin)
function rotateBothEyes(rx, ry, rz){
  // pusat masing-masing mata:
  const Lcx = -eyePosX, Rcx = eyePosX;
  const cy  =  eyePosY,  cz  = eyePosZ;

  // kiri
  rotateMeshEuler(eyeWhiteL,  rx, ry, rz, Lcx, cy, cz);
  rotateMeshEuler(eyeYellowL, rx, ry, rz, Lcx, cy, cz);

  // kanan
  rotateMeshEuler(eyeWhiteR,  rx, -ry, -rz, Rcx, cy, cz);
  rotateMeshEuler(eyeYellowR, rx, -ry, -rz, Rcx, cy, cz);

    // putar iris & ring agar selalu “menempel” arah mata
  rotateMeshEuler(irisL,  rx, ry,  rz,  Lcx, cy, cz);
  rotateMeshEuler(ringL,  rx, ry,  rz,  Lcx, cy, cz);
  rotateMeshEuler(irisR,  rx, -ry, -rz, Rcx, cy, cz);
  rotateMeshEuler(ringR,  rx, -ry, -rz, Rcx, cy, cz);

}

// --- contoh penggunaan ---
// 1) “Melirik ke dalam” 10° + sedikit pitch naik 5°:
rotateBothEyes( deg2rad(0), deg2rad(-35), 0 );

// 2) Miringkan kelopak (roll) 12° (mirror di kanan seperti banyak ilustrasi):
rotateBothEyes( 0, 0, deg2rad(24) );

// 3) Lihat ke atas (pitch) 8° tanpa yaw/roll:
rotateBothEyes( deg2rad(0), 0, 0 );

// ===== FUNGSI BARU KHUSUS UNTUK RAMBUT KEPALA =====
function makeHeadCone(xPos, yPos, zPos, radius, height, tiltBack=Math.PI*310/180, sideAngle=0){
    // Fungsi ini adalah duplikat dari makeCone, tapi dengan parameter ukuran
    var cone = generateCone(radius, height, 16, xPos, yPos, zPos, [0,0,0]);

    for(let i=0;i<cone.vertices.length;i+=6){
        // geser pivot ke dasar cone
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        // rotasi ke belakang (sumbu X/Z)
        let y2 = y * Math.cos(tiltBack) - z * Math.sin(tiltBack);
        let z2 = y * Math.sin(tiltBack) + z * Math.cos(tiltBack);

        // rotasi ke samping (sumbu Y)
        let x2 = x * Math.cos(sideAngle) + z2 * Math.sin(sideAngle);
        let z3 = -x * Math.sin(sideAngle) + z2 * Math.cos(sideAngle);

        // kembalikan ke posisi asli
        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y2 + yPos;
        cone.vertices[i+2] = z3 + zPos;
    }

    return cone;
}

// ===== KODE BARU UNTUK RAMBUT KEPALA (COPY-PASTE DARI CONE PUNGGUNG) =====
// ===== GANTI DENGAN KODE BARU INI =====
// Memanggil fungsi baru: makeHeadCone(posisiX, posisiY, posisiZ, RADIUS, TINGGI, sudutMiring, sudutSamping)
var headFur1 = makeHeadCone(0, 0.76, 0.25, 0.3, 0.6, 340*Math.PI/180, 0); // Cone tengah, paling besar
var headFur2 = makeHeadCone(-0.35, 0.6, 0.1, 0.3, 0.8, 310*Math.PI/180, 40*Math.PI/180); // Cone samping
var headFur3 = makeHeadCone(0.35, 0.6, 0.1, 0.3, 0.8, 310*Math.PI/180, -40*Math.PI/180); // Cone samping
var headFur4 = makeHeadCone(0.4, 0.22, 0.1, 0.2, 0.8, 260*Math.PI/180, -40*Math.PI/180); // Cone bawah
var headFur5 = makeHeadCone(-0.4, 0.22, 0.1, 0.2, 0.8, 260*Math.PI/180, 40*Math.PI/180); // Cone bawah



// ===== Bintang di depan telinga =====
var innerEarLeft = generateEllipsoid(
    0.08, 0.12, -0.08, 20, 20, -0.39, 0.4, 0.63, [1, 0.85, 0.1]
);
// Rotasi disamakan dengan bintang sebelumnya
rotateZ(innerEarLeft, 1 * Math.PI/180);

var cover3 = makeSphereCover(
    0.38,           // radius
    32, 16,        // segments & rings
    Math.PI * 1.4,// coverAngle (lebih kecil = selimut terbuka)
    -1.6, 0, 0,   // tiltX, tiltY, tiltZ
    0, 0.265, 0.4,
    [0, 0, 0]  // warna biru muda
);

// Buat selimut sphere 1/4 mengelilingi ke samping kanan
var selimut = makeQuarterSphereCover(
    0.38,      // radius
    32, 16,   // detail sphere
    1.5, -0.2, 1.85,// tilt X, Y, Z
    0, 0.3, 0.4,  // posisi X, Y, Z
    1,        // skala
    [0, 0, 0] // warna biru muda
);

// Buat selimut sphere 1/4 mengelilingi ke samping kanan
var selimut2 = makeQuarterSphereCover(
    0.15,      // radius
    32, 16,   // detail sphere
    1, -0.6, 0.3,// tilt X, Y, Z
    -0.01, -0.22, 0.26,  // posisi X, Y, Z
    1,        // skala
    [0, 0, 0] // warna biru muda
);

// Buat selimut sphere 1/4 mengelilingi ke samping kanan
var selimut3 = makeQuarterSphereCover(
    0.15,      // radius
    32, 16,   // detail sphere
    1, -0.6, 0.3,// tilt X, Y, Z
    -0.1, -0.22, 0.26,  // posisi X, Y, Z
    1,        // skala
    [0, 0, 0] // warna biru muda
);

// Buat selimut sphere 1/4 mengelilingi ke samping kanan
var selimut4 = makeQuarterSphereCover(
    0.15,      // radius
    32, 16,   // detail sphere
    1, -0.6, 0.3,// tilt X, Y, Z
    0.1, -0.22, 0.26,  // posisi X, Y, Z
    1,        // skala
    [0, 0, 0] // warna biru muda
);

var selimut5 = makeQuarterSphereCover(
    0.15,      // radius
    32, 16,   // detail sphere
    1, -0.6, 0.3,// tilt X, Y, Z
    -0.15, -0.22, 0.26,  // posisi X, Y, Z
    1,        // skala
    [0, 0, 0] // warna biru muda
);

// Bagian dalam telinga kanan (elips kuning kecil)
var innerEarRight = generateEllipsoid(
    0.08, 0.12, 0.08, 20, 20, 0.39, 0.4, 0.63, [1, 0.85, 0.1]
);
// Rotasi disamakan dengan bintang sebelumnya
rotateZ(innerEarRight, -1 * Math.PI/180);

function generateInvertedCone(radius, height, slices, tx, ty, tz, col) {
    // Fungsi ini membuat kerucut dengan puncak di bawah dan alas di atas
    var vertices = [], faces = [];

    // Titik pusat untuk alas (lingkaran atas)
    let topCenterIndex = 0;
    vertices.push(tx, ty + height / 2, tz, col[0], col[1], col[2]);

    // Buat titik-titik di sekeliling alas
    let startIndex = vertices.length / 6;
    for (let j = 0; j <= slices; j++) {
        let phi = j * 2 * Math.PI / slices;
        let x = radius * Math.cos(phi);
        let z = radius * Math.sin(phi);
        vertices.push(x + tx, ty + height / 2, z + tz, col[0], col[1], col[2]);
    }

    // Titik puncak (di bagian bawah)
    let apexIndex = vertices.length / 6;
    vertices.push(tx, ty - height / 2, tz, col[0], col[1], col[2]);

    // Buat sisi-sisi kerucut
    for (let j = 0; j < slices; j++) {
        let b1 = startIndex + j;
        let b2 = startIndex + j + 1;
        faces.push(apexIndex, b2, b1);
    }

    // Buat tutup atas (alas kerucut)
    for (let j = 0; j < slices; j++) {
        let b1 = startIndex + j;
        let b2 = startIndex + j + 1;
        faces.push(topCenterIndex, b1, b2);
    }

    return { vertices, faces };
}

function generateAndRotateInvertedCone(radius, height, slices, tx, ty, tz, col, rotX) {
    var vertices = [], faces = [], tempVerts = [];

    // Buat template titik-titik (vertices) kerucut di pusat (0,0,0)
    let topCenterIndex = 0;
    tempVerts.push({ x: 0, y: height / 2, z: 0 });

    let startIndex = 1;
    for (let j = 0; j <= slices; j++) {
        let phi = j * 2 * Math.PI / slices;
        let x = radius * Math.cos(phi);
        let z_ = radius * Math.sin(phi);
        tempVerts.push({ x: x, y: height / 2, z: z_ });
    }

    let apexIndex = tempVerts.length;
    tempVerts.push({ x: 0, y: -height / 2, z: 0 });

    // Buat daftar sisi (faces) berdasarkan indeks titik
    for (let j = 0; j < slices; j++) { faces.push(apexIndex, startIndex + j + 1, startIndex + j); }
    for (let j = 0; j < slices; j++) { faces.push(topCenterIndex, startIndex + j, startIndex + j + 1); }

    // Hitung sin & cos untuk rotasi
    let c = Math.cos(rotX);
    let s = Math.sin(rotX);

    // Lakukan rotasi pada setiap titik, lalu geser (translate) ke posisi akhir
    for (const v of tempVerts) {
        let y = v.y, z = v.z;
        let rotatedY = y * c - z * s;
        let rotatedZ = y * s + z * c;
        vertices.push(v.x + tx, rotatedY + ty, rotatedZ + tz, col[0], col[1], col[2]);
    }

    return { vertices, faces };
}

return{
    head, cone,
  body, line,
  leg1, leg2, leg3, thighMuscle3, thighMuscleBack3, 
  leg4, thighMuscle4, thighMuscleBack4,              
  foot1, foot2, foot3, foot4,
  sole1, sole2, sole3, sole4,
  legFrontL, legFrontR, uplegFrontL, uplegFrontR,
  coneLegBackL1, coneLegBackL2, coneLegBackL3, coneLegBackR1, coneLegBackR2, coneLegBackR3,
  ring1, ring2, ring3, ring4, ring5, ring6, ring7, ring8, nose, noseFur, smile,
  tail, star, claws1, claws2, claws3, claws4, padsFrontL , padsFrontR , padsBackL , padsBackR ,
  earLeft, earRight, cone1, cone2, cone3, cone4, cone5, 
  frontConeL1, frontConeL2, frontConeL3, frontConeR1, frontConeR2, frontConeR3,
  triLeft, triRight, innerEarLeft, innerEarRight,
  headFur1, headFur2, headFur3, headFur4, headFur5,
  eyeWhiteL, eyeYellowL, eyeWhiteR, eyeYellowR,
  irisL, ringL, irisR, ringR,
  selimut, cover3, ellipsoidData, selimut2, selimut3, selimut4
}
}