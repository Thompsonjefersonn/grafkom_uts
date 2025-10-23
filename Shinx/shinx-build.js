export function buildShinxMeshes() {
  console.log("Building Shinx...");
  
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


function generateEllipsoidFlatColor(rx, ry, rz, stacks, slices, tx, ty, tz) {
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

      let avgZ = (p[0][2]+p[1][2]+p[2][2]+p[3][2])/4;
      let col = (avgZ >= 0) ? [0.2, 0.8, 1.0] : [0,0,0];

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
    function makeShinxEye(ex, ey, ez){
    const eyeWhite = generateEllipsoid(0.080, 0.058, 0.015, 24,24, ex,ey,ez - 0.003, [1,1,1]);
    const eyeYellow = generateEllipsoid(0.06, 0.042, 0.015, 24,24, ex,ey,ez+0.008, [0.95,0.8,0.2]);
    const eyeBlack  = generateEllipsoid(0.022, 0.022, 0.015, 24,24, ex,ey,ez+0.015, [0,0,0]);

    const ang = 90 * Math.PI/180;
    [eyeWhite, eyeYellow, eyeBlack].forEach(m => rotateMeshZ(m, ang, ex, ey, ez));

    return mergeMeshes([eyeWhite, eyeYellow, eyeBlack]);
    }

var eyeLeft = makeShinxEye(-0.16, 0.25, 0.75);
var eyeRight = makeShinxEye(0.16, 0.25, 0.75);

rotateMeshY(eyeLeft,  -20*Math.PI/180, -0.13, 0.27, 0.74);
rotateMeshY(eyeRight,  20*Math.PI/180,  0.13, 0.27, 0.74);


function generateCone(radius, height, slices, tx, ty, tz, col=[0.9,0.6,0.3]) {
  var vertices=[], faces=[];

  vertices.push(tx, ty+height/2, tz, col[0], col[1], col[2]);
  let apexIndex = 0;

  let baseCenterIndex = 1;
  vertices.push(tx, ty-height/2, tz, col[0], col[1], col[2]);

  let startIndex = vertices.length/6;
  for (let j=0;j<=slices;j++){
    let phi = j*2*Math.PI/slices;
    let x = radius*Math.cos(phi);
    let z = radius*Math.sin(phi);
    vertices.push(x+tx, ty-height/2, z+tz, col[0], col[1], col[2]);
  }

  for (let j=0;j<slices;j++){
    let b1 = startIndex+j;
    let b2 = startIndex+j+1;
    faces.push(apexIndex, b1, b2);
  }

  for (let j=0;j<slices;j++){
    let b1 = startIndex+j;
    let b2 = startIndex+j+1;
    faces.push(baseCenterIndex, b2, b1);
  }

  return {vertices,faces};
}

function rotateMeshX(mesh, angle, cx, cy, cz) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    for (let i = 0; i < mesh.vertices.length; i += 6) {
        
        let y = mesh.vertices[i + 1] - cy;
        let z = mesh.vertices[i + 2] - cz;
        
        let y_rotated = y * c - z * s;
        let z_rotated = y * s + z * c;
        
        mesh.vertices[i + 1] = y_rotated + cy;
        mesh.vertices[i + 2] = z_rotated + cz;
    }
}

function rotateMeshZ(mesh, angle, cx=0, cy=0, cz=0){
  const c=Math.cos(angle), s=Math.sin(angle);
  for(let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]   - cx;
    let y = mesh.vertices[i+1] - cy;
    let x2 = x*c - y*s;
    let y2 = x*s + y*c;
    mesh.vertices[i]   = x2 + cx;
    mesh.vertices[i+1] = y2 + cy;
  }
}

function rotateMeshY(mesh, angle, cx=0, cy=0, cz=0){
  const c=Math.cos(angle), s=Math.sin(angle);
  for(let i=0;i<mesh.vertices.length;i+=6){
    let x=mesh.vertices[i]-cx, z=mesh.vertices[i+2]-cz;
    let x2 =  x*c + z*s;
    let z2 = -x*s + z*c;
    mesh.vertices[i]   = x2 + cx;
    mesh.vertices[i+2] = z2 + cz;
  }
}

function clawsAt(x, y, z, col) {
    let c1_x = x - 0.05, c2_x = x, c3_x = x + 0.05;
    
    let c1 = generateCone(0.01, 0.05, 8, c1_x, y, z, col);
    let c2 = generateCone(0.01, 0.05, 8, c2_x, y, z, col);
    let c3 = generateCone(0.01, 0.05, 8, c3_x, y, z, col);
    
    let ang = Math.PI / 2;
    
    rotateMeshX(c1, ang, c1_x, y, z);
    rotateMeshX(c2, ang, c2_x, y, z);
    rotateMeshX(c3, ang, c3_x, y, z);
    
    return [c1, c2, c3];
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
  let innerR = size * 0.4; 
  let numPoints = 4;

  for (let k=0;k<=1;k++) { 
    let z = (k===0 ? -thickness/2 : thickness/2);
    for (let i=0;i<numPoints*2;i++){
      let r = (i%2===0)?outerR:innerR;
      let ang = i*Math.PI/numPoints;  
      let x=r*Math.cos(ang);
      let y=r*Math.sin(ang);
      vertices.push(x+tx, y+ty, z+tz, col[0],col[1],col[2]);
    }
  }

  let topStart=0;
  let bottomStart=numPoints*2;

  for(let i=0;i<numPoints*2;i++){
    let next=(i+1)%(numPoints*2);
    let a=topStart+i, b=topStart+next;
    let c=bottomStart+next, d=bottomStart+i;
    faces.push(a,b,c, a,c,d);
  }

  let centerTop=vertices.length/6;
  vertices.push(tx,ty,tz+thickness/2,col[0],col[1],col[2]);
  for(let i=0;i<numPoints*2;i++){
    let next=(i+1)%(numPoints*2);
    faces.push(centerTop, topStart+i, topStart+next);
  }

  let centerBottom=vertices.length/6;
  vertices.push(tx,ty,tz-thickness/2,col[0],col[1],col[2]);
  for(let i=0;i<numPoints*2;i++){
    let next=(i+1)%(numPoints*2);
    faces.push(centerBottom, bottomStart+next, bottomStart+i);
  }

  return {vertices,faces};
}

function makeSideCone(xPos, yPos, zPos, radius=0.05, height=0.2, slices=16, tiltAngle=Math.PI/2, sideOffsetAngle=0, color=[0.9,0.6,0.3]) {
    var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

    for(let i=0; i<cone.vertices.length; i+=6){
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        let y2 = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle);
        let z2 = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle);

        let x2 = x * Math.cos(sideOffsetAngle) - y2 * Math.sin(sideOffsetAngle);
        let y3 = x * Math.sin(sideOffsetAngle) + y2 * Math.cos(sideOffsetAngle);

        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y3 + yPos;
        cone.vertices[i+2] = z2 + zPos;
    }

    return cone;
}

function makeSideConeFlexible(xPos, yPos, zPos, radius=0.05, height=0.2, slices=16, tiltSide=Math.PI/2, tiltUpDown=0, color=[0.9,0.6,0.3]) {
    var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

    for(let i=0; i<cone.vertices.length; i+=6){
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;
        let y2 = y * Math.cos(tiltSide) - z * Math.sin(tiltSide);
        let z2 = y * Math.sin(tiltSide) + z * Math.cos(tiltSide);

        let x2 = x * Math.cos(tiltUpDown) - y2 * Math.sin(tiltUpDown);
        let y3 = x * Math.sin(tiltUpDown) + y2 * Math.cos(tiltUpDown);

        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y3 + yPos;
        cone.vertices[i+2] = z2 + zPos;
    }

    return cone;
}

function generateFlatEllipsoid(rx, ry, rz, stacks, slices, tx, ty, tz, col=[0.5,0.5,0.5]) {
  var vertices=[], faces=[];
  for(let i=0;i<=stacks/2;i++){  
    let theta = i * Math.PI / stacks;
    for(let j=0;j<=slices;j++){
      let phi = j * 2 * Math.PI / slices;
      let x = rx * Math.sin(theta) * Math.cos(phi);
      let y = ry * Math.cos(theta);
      let z = rz * Math.sin(theta) * Math.sin(phi);
      vertices.push(x+tx, y+ty, z+tz, col[0], col[1], col[2]);
    }
  }

  for(let i=0;i<stacks/2;i++){
    for(let j=0;j<slices;j++){
      let a=i*(slices+1)+j;
      let b=a+1;
      let c=a+(slices+1);
      let d=c+1;
      faces.push(a,b,d, a,d,c);
    }
  }

  let baseCenterIndex = vertices.length;
  vertices.push(tx, ty, tz, col[0], col[1], col[2]);

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

function makeTriangleFront(xPos, yPos, zPos, size=0.1, height=0.15, slices=1, tiltSide=0, tiltUpDown=0, color=[1,0,0]) {
    var vertices = [], faces = [];
    vertices.push(xPos, yPos + height/2, zPos, color[0], color[1], color[2]);
    let apexIndex = 0;
    let basePoints = [
        [-size/2, -height/2, -size/2],
        [ size/2, -height/2, -size/2],
        [ 0,     -height/2,  size/2]
    ];

    for (let p of basePoints){
        let x = p[0], y = p[1], z = p[2];

        let x2 = x * Math.cos(tiltSide) + z * Math.sin(tiltSide);
        let z2 = -x * Math.sin(tiltSide) + z * Math.cos(tiltSide);

        let y2 = y * Math.cos(tiltUpDown) - z2 * Math.sin(tiltUpDown);
        let z3 = y * Math.sin(tiltUpDown) + z2 * Math.cos(tiltUpDown);

        vertices.push(x2 + xPos, y2 + yPos, z3 + zPos, color[0], color[1], color[2]);
    }
    faces.push(apexIndex, 1, 2);
    faces.push(apexIndex, 2, 3);
    faces.push(apexIndex, 3, 1);

    return {vertices, faces};
}

function makeCone(xPos, yPos, zPos, tiltBack=Math.PI*310/180, sideAngle=0){
    var cone = generateCone(0.05, 0.2, 16, xPos, yPos, zPos, [0,0,0]);

    for(let i=0;i<cone.vertices.length;i+=6){
        let x = cone.vertices[i] - xPos;
        let y = cone.vertices[i+1] - yPos;
        let z = cone.vertices[i+2] - zPos;

        let y2 = y * Math.cos(tiltBack) - z * Math.sin(tiltBack);
        let z2 = y * Math.sin(tiltBack) + z * Math.cos(tiltBack);

        let x2 = x * Math.cos(sideAngle) + z2 * Math.sin(sideAngle);
        let z3 = -x * Math.sin(sideAngle) + z2 * Math.cos(sideAngle);

        cone.vertices[i]   = x2 + xPos;
        cone.vertices[i+1] = y2 + yPos;
        cone.vertices[i+2] = z3 + zPos;
    }

    return cone;
}

function makeFlatTriangle(xPos, yPos, zPos, width=0.1, height=0.15, tiltSide=0, tiltUpDown=0, color=[1,0,0]){
    var vertices=[], faces=[];

    let p0 = [0, height/2, 0];      
    let p1 = [-width/2, -height/2, 0]; 
    let p2 = [ width/2, -height/2, 0]; 

    let points = [p0,p1,p2];

    for(let p of points){
        let x=p[0], y=p[1], z=p[2];

        let x2 = x * Math.cos(tiltSide) + z * Math.sin(tiltSide);
        let z2 = -x * Math.sin(tiltSide) + z * Math.cos(tiltSide);

        let y2 = y * Math.cos(tiltUpDown) - z2 * Math.sin(tiltUpDown);
        let z3 = y * Math.sin(tiltUpDown) + z2 * Math.cos(tiltUpDown);

        vertices.push(x2+xPos, y2+yPos, z3+zPos, color[0], color[1], color[2]);
    }

    faces.push(0,1,2);

    return {vertices, faces};
}

function makeConeAdjustable(xPos, yPos, zPos, radius=0.05, height=0.2, slices=16, tiltForward=Math.PI/9, color=[0,0,0]){
    var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

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
    for(let i=0;i<=1;i++){
        let z = i*thickness - thickness/2;  
        for(let j=0;j<=slices;j++){
            let phi = j*2*Math.PI/slices;
            let x = radius * Math.cos(phi);
            let y = radius * Math.sin(phi);
            vertices.push(x+xPos, z+yPos, y+zPos, color[0], color[1], color[2]); 
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

    for (let i = 0; i <= slices; i++) {
        let phi = i * Math.PI / slices;
        let x = (i / slices - 0.5) * width;
        let y_center = Math.sin(phi) * curveHeight;

        const v_thick = verticalThickness / 2;
        const h_thick = horizontalThickness / 2;

        vertices.push(x + tx, y_center + ty + v_thick, tz + h_thick, color[0], color[1], color[2]);
        vertices.push(x + tx, y_center + ty + v_thick, tz - h_thick, color[0], color[1], color[2]);
        vertices.push(x + tx, y_center + ty - v_thick, tz + h_thick, color[0], color[1], color[2]);
        vertices.push(x + tx, y_center + ty - v_thick, tz - h_thick, color[0], color[1], color[2]);
    }

    for (let i = 0; i < slices; i++) {
        let p1_tf = i * 4 + 0; 
        let p1_tb = i * 4 + 1; 
        let p1_bf = i * 4 + 2; 
        let p1_bb = i * 4 + 3; 

        let p2_tf = (i + 1) * 4 + 0;
        let p2_tb = (i + 1) * 4 + 1;
        let p2_bf = (i + 1) * 4 + 2;
        let p2_bb = (i + 1) * 4 + 3;

        faces.push(p1_tf, p2_tf, p2_tb);
        faces.push(p1_tf, p2_tb, p1_tb);

        faces.push(p1_bb, p2_bb, p2_bf);
        faces.push(p1_bb, p2_bf, p1_bf);

        faces.push(p1_bf, p2_bf, p2_tf);
        faces.push(p1_bf, p2_tf, p1_tf);

        faces.push(p1_tb, p2_tb, p2_bb);
        faces.push(p1_tb, p2_bb, p1_bb);
    }

    return { vertices, faces };
}

function makeManualStar(x, y, z, size=0.03, height=0.08, color=[1,1,0], tiltY=0){
    var vertices = [];
    var colors = [];

    var p = [
        [ size, 0, 0],   
        [0, size, 0],   
        [-size, 0, 0],  
        [0, -size, 0],   
        [0, 0, height]   
    ];

    var cosY = Math.cos(tiltY), sinY = Math.sin(tiltY);

    function rotateY(v){
        var x1 = v[0]*cosY + v[2]*sinY;
        var z1 = -v[0]*sinY + v[2]*cosY;
        v[0] = x1; v[2] = z1;
        return v;
    }

    for(let i=0;i<p.length;i++){
        p[i] = rotateY(p[i]);
        p[i][0] += x;
        p[i][1] += y;
        p[i][2] += z;
    }

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

    const innerR = size * 0.4; 
    const cos_t = Math.cos(tiltAngle);
    const sin_t = Math.sin(tiltAngle);

    let points = [
        [0, topPointLength], 
        [innerR, innerR],    
        [size, 0],          
        [innerR, -innerR],   
        [0, -size],          
        [-innerR, -innerR],  
        [-size, 0],          
        [-innerR, innerR]   
    ];

    let rotatedPoints = points.map(p => {
        let x = p[0] * cos_t - p[1] * sin_t;
        let y = p[0] * sin_t + p[1] * cos_t;
        return [x, y];
    });

    for (let k = 0; k <= 1; k++) {
        let z = (k === 0 ? -thickness / 2 : thickness / 2);
        for (const p of rotatedPoints) {
            vertices.push(p[0] + tx, p[1] + ty, z + tz, col[0], col[1], col[2]);
        }
    }

    const frontStart = 0;
    const backStart = 8;

    for (let i = 0; i < 8; i++) {
        let next = (i + 1) % 8;
        let a = frontStart + i, b = frontStart + next;
        let c = backStart + next, d = backStart + i;
        faces.push(a, b, c, a, c, d);
    }

    let centerFront = vertices.length / 6;
    vertices.push(tx, ty, tz + thickness / 2, col[0], col[1], col[2]);
    for (let i = 0; i < 8; i++) {
        let next = (i + 1) % 8;
        faces.push(centerFront, frontStart + i, frontStart + next);
    }

    let centerBack = vertices.length / 6;
    vertices.push(tx, ty, tz - thickness / 2, col[0], col[1], col[2]);
    for (let i = 0; i < 8; i++) {
        let next = (i + 1) % 8;
        faces.push(centerBack, backStart + next, backStart + i);
    }

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

var sphere=generateSphere(0.37,10,10,0,0.27,0.4, [0.2, 0.8, 1.0]);

  var body = generateEllipsoidFlatColor(0.3,0.2,0.4,30,30,0,-0.2,0);



var leg1 = generateCylinder(0.09, 0.4, 10, -0.14, -0.6, 0.2, [0.2, 0.8, 1.0]);
var leg2 = generateCylinder(0.09, 0.4, 10,  0.14, -0.6, 0.2, [0.2, 0.8, 1.0]);
var leg3 = generateCylinder(0.09, 0.4, 10, -0.14, -0.6, -0.23, [0,0,0]);
var leg4 = generateCylinder(0.09, 0.4, 10,  0.14, -0.6, -0.23, [0,0,0]);


var foot1 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20, -0.14, -0.6, 0.22, [0.2, 0.8, 1.0]);
var foot2 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20,  0.14, -0.6, 0.22, [0.2, 0.8, 1.0]);
var foot3 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20, -0.14, -0.6, -0.2, [0,0,0]);
var foot4 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20,  0.14, -0.6, -0.2, [0,0,0]);


var tail=generateCylinderZ(0.03,0.8,20, 0,-0.2,-1,[0,0,0]);


  var star = generateStar4_3D(0.25, 0.05, 0, -0.2, -1, [1,0.85,0.1]);

var earLeft = generateEllipsoid(0.2, 0.3, 0.08, 20, 20, -0.26, 0.55, 0.4, [0.2, 0.8, 1.0]);
rotateZ(earLeft, 23 * Math.PI/180);


var earRight = generateEllipsoid(0.2, 0.3, 0.08, 20, 20, 0.25, 0.55, 0.4, [0.2, 0.8, 1.0]);
rotateZ(earRight, 337 * Math.PI/180);

var ring1 = makeHorizontalRing(-0.14, -0.5, 0.2, 0.095, 0.05, 20, [1,1,0]);
var ring2 = makeHorizontalRing( 0.14, -0.5, 0.2, 0.095, 0.05, 20, [1,1,0]);

var cone = generateCone(0.18, 0.3, 20, 0, 0.017, 0.4, [0,0,0]);

let angle = 23 * Math.PI/180;
for (let i=0; i<cone.vertices.length; i+=6){
  let y = cone.vertices[i+1] - 0.3;
  let z = cone.vertices[i+2] - 0.4;
  let y2 = y*Math.cos(angle) - z*Math.sin(angle);
  let z2 = y*Math.sin(angle) + z*Math.cos(angle);
  cone.vertices[i+1] = y2 + 0.3;
  cone.vertices[i+2] = z2 + 0.4;
}

var cone1 = makeCone(0, -0.08, -0.39, 310*Math.PI/180, 0);

var cone2 = makeCone(-0.1, -0.15, -0.39, 290*Math.PI/180, 40*Math.PI/180);

var cone3 = makeCone(0.1, -0.15, -0.39, 290*Math.PI/180, -40*Math.PI/180);

var cone4 = makeCone(0.08, -0.25, -0.39, 250*Math.PI/180, -50*Math.PI/180);

var cone5 = makeCone(-0.08, -0.25, -0.39, 250*Math.PI/180, 50*Math.PI/180);

var sideConeTop1 = makeSideCone(0.4, 0.2, 0, 0.05, 0.2, 16, 180*Math.PI/180, 90*Math.PI/180, [0.2, 0.8, 1.0]);

var sideConeTop1 = makeSideConeFlexible(0.3, 0.08, 0.4, 0.1, 0.2, 16, 180*Math.PI/180, 50*Math.PI/180, [0.2, 0.8, 1.0]);

var sideConeBottom1 = makeSideConeFlexible(0.25, 0.03, 0.4, 0.1, 0.2, 16, 180*Math.PI/180, 45*Math.PI/180, [0.2, 0.8, 1.0]);

var sideConeTop2 = makeSideConeFlexible(-0.3, 0.08, 0.4, 0.1, 0.2, 16, -180*Math.PI/180, -50*Math.PI/180, [0.2, 0.8, 1.0]);

var sideConeBottom2 = makeSideConeFlexible(-0.25, 0.03, 0.4, 0.1, 0.2, 16, -180*Math.PI/180, -45*Math.PI/180, [0.2, 0.8, 1.0]);


var triLeft = makeFlatTriangle(-0.1, -0.18, 0.378, 0.08, 0.1, 210*Math.PI/180, 165*Math.PI/180, [0,0,0]);

var triRight = makeFlatTriangle(0.1, -0.18, 0.378, 0.08, 0.1, 150*Math.PI/180, 165*Math.PI/180, [0,0,0]);

var nose = generateEllipsoid(
    0.045,
    0.02,
    0.02,
    20,
    20,
    0,
    0.2,
    0.775,
    [1, 0, 0]
);

var smile = generateSmile3D(
    0.3,
   -0.05,
    0.02,
    0.03,
    20,
    0,
    0.1,
    0.69,
    [0, 0, 0]
);

var topCone1 = makeConeAdjustable(0,0.68,0.5, 0.12, 0.35, 20, 40*Math.PI/180, [0.2, 0.8, 1.0]);
var topCone2 = makeConeAdjustable(0,0.6,0.55, 0.12, 0.3, 20, 60*Math.PI/180, [0.2, 0.8, 1.0]);

let claws1 = clawsAt(-0.14, -0.59, 0.33, [0.6, 0.6, 0.6]); 
let claws3 = clawsAt(-0.14, -0.59, -0.09, [0.6, 0.6, 0.6]);
let claws4 = clawsAt(0.14, -0.59, 0.33, [0.6, 0.6, 0.6]);
let claws5 = clawsAt(0.14, -0.59, -0.09, [0.6, 0.6, 0.6]);

var starLeft = generateAsymmetricStar(
    0.12,
    0.22,
    0.01,
    0.44, 0.35, 0.4799,
    -20 * Math.PI/180,
    [1, 0.85, 0.1]
);

var starRight = generateAsymmetricStar(
    0.12,
    0.22,
    0.01,
    -0.44, 0.35, 0.4799,
    20 * Math.PI/180,
    [1, 0.85, 0.1]      
);


  return {
    sphere, cone, body,
    leg1, leg2, leg3, leg4,
    foot1, foot2, foot3, foot4,
    ring1, ring2, nose, smile,
    tail, star, 
    claws1: claws1[0], claws2: claws1[1], claws3: claws1[2],
    claws4: claws4[0], claws5: claws4[1], claws6: claws4[2],
    claws7: claws5[0], claws8: claws5[1], claws9: claws5[2],
    claws10: claws3[0], claws11: claws3[1], claws12: claws3[2],
    earLeft, earRight, cone1, cone2, cone3, cone4, cone5, 
    sideConeTop1, sideConeBottom1, sideConeBottom2, sideConeTop2, 
    triLeft, triRight, topCone1, topCone2, starLeft, starRight, 
    eyeLeft, eyeRight
  };
}