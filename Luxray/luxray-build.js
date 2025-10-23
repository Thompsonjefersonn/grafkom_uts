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

      let col = color;

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

      let avgZ = (p[0][2] + p[1][2] + p[2][2] + p[3][2]) / 4;

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
function clawsAt(x, y, z, col) {
    let c1_x = x - 0.05, c2_x = x, c3_x = x + 0.05;
    
    let c1 = generateCone(0.01, 0.05, 4, c1_x, y, z, col);
    let c2 = generateCone(0.01, 0.05, 4, c2_x, y, z, col);
    let c3 = generateCone(0.01, 0.05, 4, c3_x, y, z, col);
    
    let ang = Math.PI / 2;
    
    rotateMeshX(c1, ang, c1_x, y, z);
    rotateMeshX(c2, ang, c2_x, y, z);
    rotateMeshX(c3, ang, c3_x, y, z);
    
    return [c1, c2, c3];
}

function fingerPadsAt(x, y, z, col=[0,0,0]) {
  const r = 0.07;      
  const scale = 0.75;
  const tiltX = Math.PI/2;

  const yPad = y + 0.004;

  const zPad = z - 0.025;

  
  const p1 = makeQuarterSphereCover(r, 20, 14, tiltX, 0, 0, x - 0.05, yPad, zPad, scale, col);
  const p2 = makeQuarterSphereCover(r, 20, 14, tiltX, 0, 0, x + 0.00, yPad, zPad, scale, col);
  const p3 = makeQuarterSphereCover(r, 20, 14, tiltX, 0, 0, x + 0.05, yPad, zPad, scale, col);

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
    var cone = generateCone(0.07, 0.40, 12, xPos, yPos, zPos, [0,0,0]);

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

function makeConeSized(
  xPos, yPos, zPos,
  radius=0.05, height=0.28, slices=12,
  tiltBack=Math.PI*250/180, sideAngle=0, color=[0,0,0]
){
  var cone = generateCone(radius, height, slices, xPos, yPos, zPos, color);

  for (let i=0; i<cone.vertices.length; i+=6){
    let x = cone.vertices[i]   - xPos;
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

function makeFlatTriangle(
  xPos, yPos, zPos,
  width=0.1, height=0.15,
  tiltSide=0,
  tiltUpDown=0,
  tiltRoll=0,
  color=[1,0,0]
){
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

    let xr = x2 * Math.cos(tiltRoll) - y2 * Math.sin(tiltRoll);
    let yr = x2 * Math.sin(tiltRoll) + y2 * Math.cos(tiltRoll);

    vertices.push(xr+xPos, yr+yPos, z3+zPos, color[0], color[1], color[2]);
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

    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * (coverAngle / 2);
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * 2 * Math.PI;

            let x = radius * Math.sin(theta) * Math.cos(phi);
            let y = radius * Math.cos(theta);
            let z = radius * Math.sin(theta) * Math.sin(phi);

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
                rxx + xPos,
                ryy + yPos,
                rzz2 + zPos,
                color[0],
                color[1],
                color[2]
            );
        }
    }

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
    radiusX = 1,
    radiusY = 1,
    radiusZ = 1,
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

    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * (coverAngle / 2);
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * 2 * Math.PI;

            let x = radiusX * Math.sin(theta) * Math.cos(phi);
            let y = radiusY * Math.cos(theta);
            let z = radiusZ * Math.sin(theta) * Math.sin(phi);

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
                rxx + xPos,
                ryy + yPos,
                rzz2 + zPos,
                color[0],
                color[1],
                color[2]
            );
        }
    }

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
    radius = 1,
    segments = 24,
    rings = 16,
    tiltX = 0,
    tiltY = 0,
    tiltZ = 0,
    xPos = 0,
    yPos = 0,
    zPos = 0,
    scale = 1,
    color = [0.6, 0.8, 1]
) {
    const vertices = [];
    const faces = [];

const THETA_MAX = Math.PI / 2;
const PHI_MAX   = 2 * Math.PI / 3;

const PHI_START = -PHI_MAX * 0.35;

for (let i = 0; i <= rings; i++) {
  let theta = (i / rings) * THETA_MAX;
  for (let j = 0; j <= segments; j++) {
    let phi = PHI_START + (j / segments) * PHI_MAX;

    let x = radius * Math.cos(theta) * Math.cos(phi);
    let y = radius * Math.sin(theta);
    let z = radius * Math.cos(theta) * Math.sin(phi);

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
    
    const centerIndex = (rings + 1) * (segments + 1);
    vertices.push(
        xPos, 
        yPos, 
        zPos,
        color[0],
        color[1],
        color[2]
    );


    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            let first = i * (segments + 1) + j;
            let second = first + segments + 1;
            faces.push(first, second, first + 1);
            faces.push(second, second + 1, first + 1);
        }
    }

    
    for (let j = 0; j < segments; j++) {
        faces.push(centerIndex, j, j + 1);
    }

    for (let i = 0; i < rings; i++) {
        let current = i * (segments + 1);
        let next = (i + 1) * (segments + 1);
        faces.push(centerIndex, current, next);
    }

    for (let i = 0; i < rings; i++) {
        let current = i * (segments + 1) + segments;
        let next = (i + 1) * (segments + 1) + segments;
        faces.push(centerIndex, next, current);
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

var head = generateSphereFlatColor(0.37, 30, 30, 0, 0.27, 0.4);

var body = generateEllipsoidFlatColor(0.34, 0.20, 0.7, 30, 30, 0, -0.25, -0.3, [0.2,0.8,1]);

var line = generateEllipsoidFlatColor(0.1, 0.20, 0.65, 30, 30, 0, -0.23, -0.3, [0, 0, 0]);

let ellipsoidData = makeEllipsoidCover(
    0.33,
    0.6,
    0.2,
    24,
    16,
    Math.PI,
    4.7,
    0,
    0,
    0,
    -0.25,
    -0.5,
    [0, 0, 0]
);




var leg1 = generateCylinder(0.09, 0.6, 20, -0.14, -0.9, 0.23, [0.2, 0.8, 1.0]);
var leg2 = generateCylinder(0.09, 0.6, 20,  0.14, -0.9, 0.23, [0.2, 0.8, 1.0]);
var leg3 = generateCylinder(0.09, 0.6, 20, -0.14, -0.9, -0.7, [0.2, 0.8, 1.0]);
var leg4 = generateCylinder(0.09, 0.6, 20,  0.14, -0.9, -0.7, [0.2, 0.8, 1.0]);

var legFrontL = generateFlatEllipsoid(
  0.1, 0.65, 0.06,
  20, 20,
  -0.14, -0.9, 0.3,
  [0,0,0]
);

var uplegFrontL = generateFlatEllipsoid(
  0.06, 0.25, 0.06,
  20, 20,
  -0.14, -0.36, 0.28,
  [0,0,0]
);

var legFrontR = generateFlatEllipsoid(
  0.1, 0.65, 0.06,
  20, 20,
  0.14, -0.9, 0.3,
  [0,0,0]
);

var uplegFrontR = generateFlatEllipsoid(
  0.06, 0.25, 0.06,
  20, 20,
  0.14, -0.36, 0.28,
  [0,0,0]
);

var coneLegBackL1 = makeConeSized(
  -0.2,
  -0.8,
   0.17,
  0.06,
  0.22,
  8,
  -20 * Math.PI/180,
   20 * Math.PI/180,
  [0, 0, 0]
);

var coneLegBackL2 = makeConeSized(
  -0.15,
  -0.8,
   0.14,
  0.06,
  0.22,
  8,
  -20 * Math.PI/180,
  0 * Math.PI/180,
  [0, 0, 0]
);

var coneLegBackL3 = makeConeSized(
  -0.09,
  -0.8,
   0.16,
  0.06,
  0.22,
  8,
  -20 * Math.PI/180,
   -20 * Math.PI/180,
  [0, 0, 0]
);

var coneLegBackR1 = makeConeSized(
   0.2,
  -0.8,
   0.18,
  0.06,
  0.22,
  16,         
  -20 * Math.PI/180,
  320 * Math.PI/180,
  [0, 0, 0]
);

var coneLegBackR2 = makeConeSized(
   0.15,
  -0.8,
   0.15,
  0.06,
  0.22,
  16,         
  -20 * Math.PI/180,
  0 * Math.PI/180,
  [0, 0, 0]
);

var coneLegBackR3 = makeConeSized(
   0.1,
  -0.8,
   0.16,
  0.06,
  0.22,
  16,         
  -20 * Math.PI/180,
  20 * Math.PI/180,
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


const soleY = -0.91;
const soleRx = 0.1;
const soleRy = 0.025;
const soleRz = 0.12;

var sole1 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24, -0.14, soleY,  0.25, [0,0,0]);
var sole2 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24,  0.14, soleY,  0.25, [0,0,0]);
var sole3 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24, -0.14, soleY, -0.67, [0.2, 0.8, 1.0]);
var sole4 = generateEllipsoid(soleRx, soleRy, soleRz, 20, 24,  0.14, soleY, -0.67, [0.2, 0.8, 1.0]);



var thighMuscle3 = generateAndRotateInvertedCone(0.15, 0.3, 10, -0.14, -0.46, -0.6, [0,0,0], 0.2);
var thighMuscleBack3 = generateAndRotateInvertedCone(0.1, 0.3, 10, -0.14, -0.46, -0.76, [0,0,0], 0.1);



var thighMuscle4 = generateAndRotateInvertedCone(0.15, 0.3, 10,  0.14, -0.46, -0.6, [0,0,0], 0.2);
var thighMuscleBack4 = generateAndRotateInvertedCone(0.1, 0.3, 10,  0.14, -0.46, -0.76, [0,0,0], 0.1);



var tail=generateCylinderZ(0.03,0.8,20, 0,-0.25,-1.8,[0,0,0]);


  var star = generateStar4_3D(0.25, 0.05, 0, -0.25, -1.83, [1,0.85,0.1]);

var earLeft = generateEllipsoid(0.15, 0.2, 0.08, 20, 20, -0.39, 0.4, 0.6, [0.2, 0.8, 1.0]);
rotateZ(earLeft, 0 * Math.PI/180);


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

var cone = generateCone(0.18, 0.37, 20, 0, 0.017, 0.4, [0,0,0]);

let angle = 23 * Math.PI/180;
for (let i=0; i<cone.vertices.length; i+=6){
  let y = cone.vertices[i+1] - 0.3;
  let z = cone.vertices[i+2] - 0.4;
  let y2 = y*Math.cos(angle) - z*Math.sin(angle);
  let z2 = y*Math.sin(angle) + z*Math.cos(angle);
  cone.vertices[i+1] = y2 + 0.3;
  cone.vertices[i+2] = z2 + 0.4;
}

var cone1 = makeCone(0, -0.15, -1.1, 310*Math.PI/180, 0);

var cone2 = makeCone(-0.06, -0.21, -1.1, 290*Math.PI/180, 40*Math.PI/180);

var cone3 = makeCone(0.06, -0.21, -1.1, 290*Math.PI/180, -40*Math.PI/180);

var cone4 = makeCone(0.1, -0.32, -1.1, 250*Math.PI/180, -50*Math.PI/180);

var cone5 = makeCone(-0.1, -0.32, -1.1, 250*Math.PI/180, 50*Math.PI/180);

var frontConeL1 = makeConeSized(
  -0.25, -0.3, 0,
  0.1, 0.5, 12,
  260*Math.PI/180,
  30*Math.PI/180,
  [0,0,0]
);

var frontConeL2 = makeConeSized(
  -0.3, -0.2, 0,
  0.12, 0.6, 12,
  285*Math.PI/180,
  30*Math.PI/180,
  [0,0,0]
);

var frontConeL3 = makeConeSized(
  -0.28, -0.1, 0.05,
  0.09, 0.5, 12,
  285*Math.PI/180,
  30*Math.PI/180,
  [0,0,0]
);

var frontConeR1 = makeConeSized(
  0.25, -0.3, 0,
  0.1, 0.5, 12,
  260*Math.PI/180,
  -30*Math.PI/180,
  [0,0,0]
);

var frontConeR2 = makeConeSized(
  0.3, -0.2, 0,
  0.12, 0.6, 12,
  285*Math.PI/180,
  -30*Math.PI/180,
  [0,0,0]
);

var frontConeR3 = makeConeSized(
  0.28, -0.1, 0.05,
  0.09, 0.5, 12,
  285*Math.PI/180,
  -30*Math.PI/180,
  [0,0,0]
);

var sideConeTop1 = makeSideCone(0.4, 0.2, 0, 0.05, 0.2, 16, 180*Math.PI/180, 90*Math.PI/180, [0.2, 0.8, 1.0]);

var triLeft = makeFlatTriangle(
  -0.2, 0.16, 0.7,
  0.2, 0.25,
  180*Math.PI/180,
  140*Math.PI/180,
  130*Math.PI/180,
  [0,0,0]
);

var triRight = makeFlatTriangle(
  0.2, 0.16, 0.7,
  0.2, 0.25,
  180*Math.PI/180,
  140*Math.PI/180,
  -130*Math.PI/180,
  [0,0,0]
);

var nose = generateEllipsoid(
    0.05,
    0.02,
    0.02,
    20,
    20,
    0,
    0.21,
    0.775,
    [1, 0, 0]
);

function makeFlatRectangle(xPos, yPos, zPos, w=0.06, h=0.05, thickness=0.01, color=[0,0,0]){
  var vertices = [], faces = [];
  const halfW = w/2, halfH = h/2, halfT = thickness/2;

  vertices.push(
    xPos - halfW, yPos + halfH, zPos + halfT, color[0], color[1], color[2],
    xPos + halfW, yPos + halfH, zPos + halfT, color[0], color[1], color[2],
    xPos + halfW, yPos - halfH, zPos + halfT, color[0], color[1], color[2],
    xPos - halfW, yPos - halfH, zPos + halfT, color[0], color[1], color[2]
  );

  vertices.push(
    xPos - halfW, yPos + halfH, zPos - halfT, color[0], color[1], color[2],
    xPos + halfW, yPos + halfH, zPos - halfT, color[0], color[1], color[2],
    xPos + halfW, yPos - halfH, zPos - halfT, color[0], color[1], color[2],
    xPos - halfW, yPos - halfH, zPos - halfT, color[0], color[1], color[2]
  );

  faces.push(
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    0,4,7, 0,7,3,
    1,5,6, 1,6,2,
    0,1,5, 0,5,4,
    3,2,6, 3,6,7
  );

  return {vertices, faces};
}

var noseFur = makeFlatRectangle(
  0, 0.3, 0.76,
  0.1, 0.16, 0.015,
  [0,0,0]
);


var smile = generateSmile3D(
    0.3,
   0.05,
    0.02,
    0.03,
    20,
    0,
    0.1,
    0.72,
    [0, 0, 0]
);

const smileRollDeg = 15;
rotateMeshX(smile, smileRollDeg * Math.PI/180, 0, 0.1, 0.74);

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


var eyePosY = 0.32;
var eyePosX = 0.15;
var eyePosZ = 0.76;

const rxWhite = 0.08, ryWhite = 0.08;
const rxInner = 0.06, ryInner = 0.06;
const thick   = 0.004;

const th = 32 * Math.PI/180;

{
  const a1 =  Math.cos(th), b1 = Math.sin(th);
  const x0d = -0.04, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);
  const x_cut = 0.02; const a2 = 1, b2 = 0, c2 = -x_cut;

  var eyeWhiteL = makeClippedEllipseExtruded(
    rxWhite, ryWhite, 76,
    -eyePosX, eyePosY, eyePosZ,
    thick,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1,0,0]
  );

  var eyeYellowL = makeClippedEllipseExtruded(
    rxInner, ryInner, 76,
    -eyePosX, eyePosY, eyePosZ,
    thick,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );

  translateMesh(eyeYellowL, 0, 0, 0.002);
}

{
  const a1 = -Math.cos(th), b1 =  Math.sin(th);
  const x0d =  0.05, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);
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

const segIris = 76;
const irisRx = 0.035, irisRy = 0.035;
const ringRx = 0.040, ringRy = 0.040;
const thIris = 0.004;

{
  const th = 32 * Math.PI/180;
  const a1 =  Math.cos(th), b1 = Math.sin(th);
  const x0d = -0.04, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);
  const x_cut = 0.02; 
  const a2 = 1, b2 = 0, c2 = -x_cut;

  var ringL  = makeClippedEllipseExtruded(
    ringRx, ringRy, segIris,
    -eyePosX, eyePosY, eyePosZ + 0.0033,
    thIris,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [0,0,0]
  );

  var irisL  = makeClippedEllipseExtruded(
    irisRx, irisRy, segIris,
    -eyePosX, eyePosY, eyePosZ + 0.0036,
    thIris,
    [{a:a1,b:b1,c:c1},{a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );
}

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



function extrudeAnnulus(rxOuter, ryOuter, rxInner, ryInner, segments, tx, ty, tz, thickness, col=[0,0,0]){
  const half = thickness/2, V=[], F=[];
  const baseFrontOuter = 0;
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxOuter*Math.cos(a)+tx, ryOuter*Math.sin(a)+ty, tz+half, col[0],col[1],col[2]);
  }
  const baseFrontInner = V.length/6;
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxInner*Math.cos(a)+tx, ryInner*Math.sin(a)+ty, tz+half, col[0],col[1],col[2]);
  }
  const baseBackOuter = V.length/6;
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxOuter*Math.cos(a)+tx, ryOuter*Math.sin(a)+ty, tz-half, col[0],col[1],col[2]);
  }
  const baseBackInner = V.length/6;
  for(let i=0;i<=segments;i++){
    const a = i*2*Math.PI/segments;
    V.push(rxInner*Math.cos(a)+tx, ryInner*Math.sin(a)+ty, tz-half, col[0],col[1],col[2]);
  }

  for(let i=0;i<segments;i++){
    const o1=baseFrontOuter+i, o2=o1+1;
    const in1=baseFrontInner+i, in2=in1+1;
    F.push(o1, o2, in2,  o1, in2, in1);
  }
  for(let i=0;i<segments;i++){
    const o1=baseBackOuter+i, o2=o1+1;
    const in1=baseBackInner+i, in2=in1+1;
    F.push(o1, in2, o2,  o1, in1, in2);
  }
  for(let i=0;i<segments;i++){
    const f1=baseFrontOuter+i, f2=f1+1;
    const b1=baseBackOuter+i,  b2=b1+1;
    F.push(f1, f2, b2,  f1, b2, b1);
  }
  for(let i=0;i<segments;i++){
    const f1=baseFrontInner+i, f2=f1+1;
    const b1=baseBackInner+i,  b2=b1+1;
    F.push(f1, b2, f2,  f1, b1, b2);
  }
  return {vertices:V, faces:F};
}

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
  for(let i=0;i<segments;i++) F.push(centerFront, ringFront+i, ringFront+i+1);
  for(let i=0;i<segments;i++) F.push(centerBack, ringBack+i+1, ringBack+i);
  for(let i=0;i<segments;i++){
    const f1=ringFront+i, f2=f1+1, b1=ringBack+i, b2=b1+1;
    F.push(f1,f2,b2, f1,b2,b1);
  }
  return {vertices:V, faces:F};
}

function deg2rad(d){ return d * Math.PI / 180; }

function rotateMeshEuler(mesh, rx, ry, rz, cx, cy, cz){
  const czs = Math.cos(rz), szs = Math.sin(rz);
  const cys = Math.cos(ry), sys = Math.sin(ry);
  const cxs = Math.cos(rx), sxs = Math.sin(rx);

  for (let i=0; i<mesh.vertices.length; i+=6){
    let x = mesh.vertices[i]   - cx;
    let y = mesh.vertices[i+1] - cy;
    let z = mesh.vertices[i+2] - cz;

    let xz =  x*czs - y*szs;
    let yz =  x*szs + y*czs;
    let zz =  z;

    let xy =  xz*cys + zz*sys;
    let yy =  yz;
    let zy = -xz*sys + zz*cys;

    let xf =  xy;
    let yf =  yy*cxs - zy*sxs;
    let zf =  yy*sxs + zy*cxs;

    mesh.vertices[i]   = xf + cx;
    mesh.vertices[i+1] = yf + cy;
    mesh.vertices[i+2] = zf + cz;
  }
}

function rotateBothEyes(rx, ry, rz){
  const Lcx = -eyePosX, Rcx = eyePosX;
  const cy  =  eyePosY,  cz  = eyePosZ;

  rotateMeshEuler(eyeWhiteL,  rx, ry, rz, Lcx, cy, cz);
  rotateMeshEuler(eyeYellowL, rx, ry, rz, Lcx, cy, cz);

  rotateMeshEuler(eyeWhiteR,  rx, -ry, -rz, Rcx, cy, cz);
  rotateMeshEuler(eyeYellowR, rx, -ry, -rz, Rcx, cy, cz);

  rotateMeshEuler(irisL,  rx, ry,  rz,  Lcx, cy, cz);
  rotateMeshEuler(ringL,  rx, ry,  rz,  Lcx, cy, cz);
  rotateMeshEuler(irisR,  rx, -ry, -rz, Rcx, cy, cz);
  rotateMeshEuler(ringR,  rx, -ry, -rz, Rcx, cy, cz);

}

rotateBothEyes( deg2rad(0), deg2rad(-35), 0 );

rotateBothEyes( 0, 0, deg2rad(24) );

rotateBothEyes( deg2rad(0), 0, 0 );

function makeHeadCone(xPos, yPos, zPos, radius, height, tiltBack=Math.PI*310/180, sideAngle=0){
    var cone = generateCone(radius, height, 16, xPos, yPos, zPos, [0,0,0]);

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

var headFur1 = makeHeadCone(0, 0.76, 0.25, 0.3, 0.6, 340*Math.PI/180, 0);
var headFur2 = makeHeadCone(-0.35, 0.6, 0.1, 0.3, 0.8, 310*Math.PI/180, 40*Math.PI/180);
var headFur3 = makeHeadCone(0.35, 0.6, 0.1, 0.3, 0.8, 310*Math.PI/180, -40*Math.PI/180);
var headFur4 = makeHeadCone(0.4, 0.22, 0.1, 0.2, 0.8, 260*Math.PI/180, -40*Math.PI/180);
var headFur5 = makeHeadCone(-0.4, 0.22, 0.1, 0.2, 0.8, 260*Math.PI/180, 40*Math.PI/180);



var innerEarLeft = generateEllipsoid(
    0.08, 0.12, -0.08, 20, 20, -0.39, 0.4, 0.63, [1, 0.85, 0.1]
);
rotateZ(innerEarLeft, 1 * Math.PI/180);

var cover3 = makeSphereCover(
    0.38,
    32, 16,
    Math.PI * 1.4,
    -1.6, 0, 0,
    0, 0.265, 0.4,
    [0, 0, 0]
);

var selimut = makeQuarterSphereCover(
    0.38,
    32, 16,
    1.5, -0.2, 1.85,
    0, 0.3, 0.4,
    1,
    [0, 0, 0]
);

var selimut2 = makeQuarterSphereCover(
    0.15,
    32, 16,
    1, -0.6, 0.3,
    -0.01, -0.22, 0.26,
    1,
    [0, 0, 0]
);

var selimut3 = makeQuarterSphereCover(
    0.15,
    32, 16,
    1, -0.6, 0.3,
    -0.1, -0.22, 0.26,
    1,
    [0, 0, 0]
);

var selimut4 = makeQuarterSphereCover(
    0.15,
    32, 16,
    1, -0.6, 0.3,
    0.1, -0.22, 0.26,
    1,
    [0, 0, 0]
);

var selimut5 = makeQuarterSphereCover(
    0.15,
    32, 16,
    1, -0.6, 0.3,
    -0.15, -0.22, 0.26,
    1,
    [0, 0, 0]
);

var innerEarRight = generateEllipsoid(
    0.08, 0.12, 0.08, 20, 20, 0.39, 0.4, 0.63, [1, 0.85, 0.1]
);
rotateZ(innerEarRight, -1 * Math.PI/180);

function generateInvertedCone(radius, height, slices, tx, ty, tz, col) {
    var vertices = [], faces = [];

    let topCenterIndex = 0;
    vertices.push(tx, ty + height / 2, tz, col[0], col[1], col[2]);

    let startIndex = vertices.length / 6;
    for (let j = 0; j <= slices; j++) {
        let phi = j * 2 * Math.PI / slices;
        let x = radius * Math.cos(phi);
        let z = radius * Math.sin(phi);
        vertices.push(x + tx, ty + height / 2, z + tz, col[0], col[1], col[2]);
    }

    let apexIndex = vertices.length / 6;
    vertices.push(tx, ty - height / 2, tz, col[0], col[1], col[2]);

    for (let j = 0; j < slices; j++) {
        let b1 = startIndex + j;
        let b2 = startIndex + j + 1;
        faces.push(apexIndex, b2, b1);
    }

    for (let j = 0; j < slices; j++) {
        let b1 = startIndex + j;
        let b2 = startIndex + j + 1;
        faces.push(topCenterIndex, b1, b2);
    }

    return { vertices, faces };
}

function generateAndRotateInvertedCone(radius, height, slices, tx, ty, tz, col, rotX) {
    var vertices = [], faces = [], tempVerts = [];

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

    for (let j = 0; j < slices; j++) { faces.push(apexIndex, startIndex + j + 1, startIndex + j); }
    for (let j = 0; j < slices; j++) { faces.push(topCenterIndex, startIndex + j, startIndex + j + 1); }

    let c = Math.cos(rotX);
    let s = Math.sin(rotX);

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