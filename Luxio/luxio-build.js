export function buildLuxioMeshes() {
    console.log("Building Luxio...");
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

function scaleMeshXY(mesh, sx, sy, cx, cy, cz){
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]   - cx;
    let y = mesh.vertices[i+1] - cy;
    
    mesh.vertices[i]   = x*sx + cx;
    mesh.vertices[i+1] = y*sy + cy;
  }
}

function rotateMeshY(mesh, ang, cx, cy, cz){
  const c=Math.cos(ang), s=Math.sin(ang);
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]-cx;
    let y = mesh.vertices[i+1]-cy;
    let z = mesh.vertices[i+2]-cz;
    let x2 =  c*x + s*z;
    let z2 = -s*x + c*z;
    mesh.vertices[i]=x2+cx; mesh.vertices[i+1]=y+cy; mesh.vertices[i+2]=z2+cz;
  }
}
function rotateMeshX(mesh, ang, cx, cy, cz){
  const c=Math.cos(ang), s=Math.sin(ang);
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x = mesh.vertices[i]-cx;
    let y = mesh.vertices[i+1]-cy;
    let z = mesh.vertices[i+2]-cz;
    let y2 = c*y - s*z;
    let z2 = s*y + c*z;
    mesh.vertices[i]=x+cx; mesh.vertices[i+1]=y2+cy; mesh.vertices[i+2]=z2+cz;
  }
}
function translateMesh(mesh, dx,dy,dz){
  for (let i=0;i<mesh.vertices.length;i+=6){
    mesh.vertices[i]+=dx; mesh.vertices[i+1]+=dy; mesh.vertices[i+2]+=dz;
  }
}


function clipPolygonWithLine(poly, a, b, c){
  const out = [];
  function f(p){ return a*p[0] + b*p[1] + c; }
  for (let i=0; i<poly.length; i++){
    const P = poly[i], Q = poly[(i+1)%poly.length];
    const fP = f(P), fQ = f(Q);
    const inP = fP <= 0, inQ = fQ <= 0;

    if (inP && inQ){
      out.push(Q);                 
    } else if (inP && !inQ){

      const t = fP / (fP - fQ);
      out.push([P[0] + t*(Q[0]-P[0]), P[1] + t*(Q[1]-P[1])]);
    } else if (!inP && inQ){
    
      const t = fP / (fP - fQ);
      out.push([P[0] + t*(Q[0]-P[0]), P[1] + t*(Q[1]-P[1])]);
      out.push(Q);
    }

  }
  return out;
}


function ellipsePolygon(rx, ry, segments){
  const poly = [];
  for (let i=0;i<segments;i++){
    const ang = i*2*Math.PI/segments;
    poly.push([rx*Math.cos(ang), ry*Math.sin(ang)]);
  }
  return poly;
}

function fanTriangulate(poly){
  const faces = [];
  for (let i=1; i<poly.length-1; i++){
    faces.push(0, i, i+1);
  }
  return faces;
}

function extrudeConvexPoly(poly, tx,ty,tz, thickness, col){
  const half = thickness/2;
  const n = poly.length;
  const vertices = [];
  const faces = [];

  const frontBase = 0;
  for (let i=0;i<n;i++)
    vertices.push(poly[i][0]+tx, poly[i][1]+ty, tz+half, col[0], col[1], col[2]);
  const frontFaces = fanTriangulate(poly).map(i => i + frontBase);

  const backBase = vertices.length/6;
  for (let i=0;i<n;i++)
    vertices.push(poly[i][0]+tx, poly[i][1]+ty, tz-half, col[0], col[1], col[2]);
  const backFaces = fanTriangulate(poly).map(idx => {
    const tri = [0, idx, ((idx+1)%(n))];
    return tri;
  }).flat().map(i => i + backBase);

  for (let i=0;i<n;i++){
    const j = (i+1)%n;
    const a = frontBase+i, b = frontBase+j;
    const c = backBase+j,  d = backBase+i;
    faces.push(a,b,c, a,c,d);
  }
  faces.push(...frontFaces, ...backFaces);
  return {vertices, faces};
}

function makeClippedEllipseExtruded(rx, ry, segments, tx, ty, tz, thickness,
                                    cuts, col){
  let poly = ellipsePolygon(rx, ry, segments);
  if (cuts){
    for (const cut of cuts){
      poly = clipPolygonWithLine(poly, cut.a, cut.b, cut.c);
      if (poly.length < 3) break;
    }
  }
  return extrudeConvexPoly(poly, tx,ty,tz, thickness, col);
}

function generateArcMouth(width, curveHeight, thickness, slices, tx, ty, tz, color = [0, 0, 0]) {
    var vertices = [], faces = [];

    for (let i = 0; i <= slices; i++) {
        let phi = i * Math.PI / slices;
        let x = (i / slices - 0.5) * width;
        let y_center = Math.sin(phi) * curveHeight;

        vertices.push(x + tx, y_center + ty + thickness / 2, tz, color[0], color[1], color[2]);
        vertices.push(x + tx, y_center + ty - thickness / 2, tz, color[0], color[1], color[2]);
    }

    for (let i = 0; i < slices; i++) {
        let top1 = i * 2;
        let bottom1 = i * 2 + 1;
        let top2 = (i + 1) * 2;
        let bottom2 = (i + 1) * 2 + 1;

        faces.push(top1, bottom1, top2);
        faces.push(bottom1, bottom2, top2);
    }

    return { vertices, faces };
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

function rotateMeshZ(mesh, ang, cx,cy,cz){
  const c=Math.cos(ang), s=Math.sin(ang);
  for (let i=0;i<mesh.vertices.length;i+=6){
    let x=mesh.vertices[i]-cx;
    let y=mesh.vertices[i+1]-cy;
    let z=mesh.vertices[i+2]-cz;
    let x2 = c*x - s*y;
    let y2 = s*x + c*y;
    mesh.vertices[i]=x2+cx; mesh.vertices[i+1]=y2+cy; mesh.vertices[i+2]=z+cz;
  }
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

    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * (Math.PI / 2);
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * (Math.PI / 2);

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
                color[0],
                color[1],
                color[2]
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

function makeHalfCrescent(
    outerRadius = 1.0,
    innerRadius = 0.6,
    offset = 0.3,
    segments = 32,
    rings = 16,
    tiltX = 0,
    tiltY = 0,
    tiltZ = 0,
    xPos = 0,
    yPos = 0,
    zPos = 0,
    color = [1.0, 0.9, 0.6]
) {
    const vertices = [];
    const faces = [];

    const phiMax = Math.PI;
    
    const thetaMax = Math.PI; 

    const numVerticesPerShell = (rings + 1) * (segments + 1);
    const innerColor = [color[0] * 0.9, color[1] * 0.9, color[2] * 0.9];

    function transformVertex(x, y, z, col) {
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
            col[0],
            col[1],
            col[2]
        );
    }

    
    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * thetaMax; 
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * phiMax;
            let xOuter = outerRadius * sinTheta * Math.cos(phi);
            let yOuter = outerRadius * cosTheta;
            let zOuter = outerRadius * sinTheta * Math.sin(phi);
            transformVertex(xOuter, yOuter, zOuter, color);
        }
    }

    for (let i = 0; i <= rings; i++) {
        let theta = (i / rings) * thetaMax; 
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);
        for (let j = 0; j <= segments; j++) {
            let phi = (j / segments) * phiMax;
            let xInner = innerRadius * sinTheta * Math.cos(phi) + offset;
            let yInner = innerRadius * cosTheta;
            let zInner = innerRadius * sinTheta * Math.sin(phi);
            transformVertex(xInner, yInner, zInner, innerColor);
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

    const innerOffset = numVerticesPerShell; 
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            let first = innerOffset + i * (segments + 1) + j;
            let second = first + segments + 1;
            faces.push(first, first + 1, second);
            faces.push(second, first + 1, second + 1);
        }
    }




    const backIndex = 0;
    for (let i = 0; i < rings; i++) {
        let outer1 = (i * (segments + 1)) + backIndex;
        let outer2 = ((i + 1) * (segments + 1)) + backIndex;
        let inner1 = innerOffset + (i * (segments + 1)) + backIndex;
        let inner2 = innerOffset + ((i + 1) * (segments + 1)) + backIndex;
        
        faces.push(outer1, outer2, inner1);
        faces.push(inner1, outer2, inner2);
    }
    
    const frontIndex = segments;
    for (let i = 0; i < rings; i++) {
        let outer1 = (i * (segments + 1)) + frontIndex;
        let outer2 = ((i + 1) * (segments + 1)) + frontIndex;
        let inner1 = innerOffset + (i * (segments + 1)) + frontIndex;
        let inner2 = innerOffset + ((i + 1) * (segments + 1)) + frontIndex;

        faces.push(outer1, inner1, outer2);
        faces.push(inner1, inner2, outer2);
    }

    return { vertices, faces };
}
  var sphere=generateSphere(0.37,30,30,0,0.30,0.4, [0.2, 0.8, 1.0]);

  var body = generateEllipsoidFlatColor(0.3,0.2,0.5,30,30,0,-0.2,0);

 


const exL = -0.12, exR = 0.12;
const ey   =  0.30;
const ez   =  0.75;

const th = 40 * Math.PI/180;


{
  const th = 42 * Math.PI/180;
  const a1 =  Math.cos(th), b1 = Math.sin(th);
  const x0d = -0.05, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);

  const x_cut = 0.02;
  const a2 = 1, b2 = 0, c2 = -x_cut;

  var eyeWhiteL = makeClippedEllipseExtruded(
    0.095, 0.070, 76,
    exL, ey, ez,
    0.004,
    [{a:a1,b:b1,c:c1}, {a:a2,b:b2,c:c2}],
    [1,1,1]
  );

var eyeYellowL = makeClippedEllipseExtruded(
  0.060, 0.045, 76,
  exL, ey, ez,
  0.004,
  [{a:a1,b:b1,c:c1}, {a:a2,b:b2,c:c2}],
  [1.0, 0.85, 0.1]
);




rotateMeshY(eyeYellowL, -22*Math.PI/180, exL,ey,ez);
rotateMeshX(eyeYellowL,   8*Math.PI/180, exL,ey,ez);
scaleMeshXY(eyeYellowL, 1.28, 1.34, exL, ey, ez);
translateMesh(eyeYellowL, 0,0, 0.011);

{
  const th = 42 * Math.PI/180;
  const a1 = -Math.cos(th), b1 =  Math.sin(th);
  const x0d =  0.05, y0d = 0.06;            
  const c1 = -(a1*x0d + b1*y0d);

  const x_cut = 0.02;
  const a2 = -1, b2 = 0, c2 = -x_cut;

  var eyeYellowR = makeClippedEllipseExtruded(
    0.060, 0.045, 76,
    exR, ey, ez,
    0.004,
    [{a:a1,b:b1,c:c1}, {a:a2,b:b2,c:c2}],
    [1.0, 0.85, 0.1]
  );

  rotateMeshY(eyeYellowR,  22*Math.PI/180, exR,ey,ez);
  rotateMeshX(eyeYellowR,   8*Math.PI/180, exR,ey,ez);
  scaleMeshXY(eyeYellowR, 1.28, 1.34, exR, ey, ez);
  translateMesh(eyeYellowR, 0,0, 0.011);
}


  rotateMeshY(eyeWhiteL, -22*Math.PI/180, exL,ey,ez);
  rotateMeshX(eyeWhiteL,   8*Math.PI/180, exL,ey,ez);
  scaleMeshXY(eyeWhiteL, 1.28, 1.34, exL, ey, ez);
  translateMesh(eyeWhiteL, 0,0, 0.010);
}
var hairTop = generateCone(0.10, 0.45, 24, 0, 0.68, 0.45, [0,0,0]);
rotateMeshX(hairTop, -15*Math.PI/180, 0,0.68,0.45);

var hairLeft = generateCone(0.09, 0.35, 24, -0.35, 0.45, 0.40, [0,0,0]);
rotateMeshZ(hairLeft, 60*Math.PI/180, -0.35,0.45,0.40);

var hairRight = generateCone(0.09, 0.35, 24, 0.35, 0.45, 0.40, [0,0,0]);
rotateMeshZ(hairRight, -60*Math.PI/180, 0.35,0.45,0.40);

var hoodLeft = makeFlatTriangle(
   -0.18, 0.10, 0.50,
   0.40, 0.40,
   210*Math.PI/180,
   165*Math.PI/180,
   [0,0,0]
);

var hoodRight = makeFlatTriangle(
    0.18, 0.10, 0.50,
    0.18, 0.25,
    150*Math.PI/180,
    165*Math.PI/180,
    [0,0,0]
);

var hoodBottom = makeFlatTriangle(
    0, -0.18, 0.48,
    0.22, 0.22,
    180*Math.PI/180,
    165*Math.PI/180,
    [0,0,0]
);


var cover2 = makeSphereCover(
    0.38,
    32, 16,
    Math.PI * 1.4,
    -1.2, 0, 0,
    0, 0.3, 0.4,
    [0, 0, 0]
);

var selimut = makeQuarterSphereCover(
    0.38,
    32, 16,
    0.2, -0.2, 0.75,
    0, 0.3, 0.4,
    1,
    [0, 0, 0]
);

var selimut2 = makeQuarterSphereCover(
    0.25,
    32, 16,
    0.2, -0.2, 0.75,
    0, -0.2, 0.25,
    1,
    [0, 0, 0]
);

var sideleft1 = makeQuarterSphereCover(
    0.3,
    32, 16,
    2.7, 0.1, -0.5,
    0.25, 0.2, 0.37,
    1,
    [0, 0, 0]
);

var sideleft2 = makeQuarterSphereCover(
    0.3,
    32, 16,
    -1.3, 0.1, 3.6,
    -0.25, 0.2, 0.4,
    1,
    [0, 0, 0]
);

{
  const th = 42 * Math.PI/180;
  const a1 = -Math.cos(th), b1 =  Math.sin(th);
  const x0d =  0.05, y0d = 0.06;
  const c1 = -(a1*x0d + b1*y0d);

  const x_cut = 0.02;
  const a2 = -1, b2 = 0, c2 = -x_cut;

  var eyeWhiteR = makeClippedEllipseExtruded(
    0.095, 0.070, 76,
    exR, ey, ez,
    0.004,
    [{a:a1,b:b1,c:c1}, {a:a2,b:b2,c:c2}],
    [1,1,1]
  );

  rotateMeshY(eyeWhiteR,  22*Math.PI/180, exR,ey,ez);
  rotateMeshX(eyeWhiteR,   8*Math.PI/180, exR,ey,ez);
  scaleMeshXY(eyeWhiteR, 1.28, 1.34, exR, ey, ez);
  translateMesh(eyeWhiteR, 0,0, 0.010);
}




var leg1 = generateCylinder(0.09, 0.6, 20, -0.14, -0.75, 0.32, [0.2, 0.8, 1.0]);
var leg2 = generateCylinder(0.09, 0.6, 20,  0.14, -0.75, 0.32, [0.2, 0.8, 1.0]);
var leg3 = generateCylinder(0.09, 0.6, 20, -0.14, -0.75, -0.26, [0,0,0]);
var leg4 = generateCylinder(0.09, 0.6, 20,  0.14, -0.75, -0.26, [0,0,0]);


var foot1 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20, -0.14, -0.75, 0.37, [0.2, 0.8, 1.0]);
var foot2 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20,  0.14, -0.75, 0.37, [0.2, 0.8, 1.0]);
var foot3 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20, -0.14, -0.75, -0.23, [0,0,0]);
var foot4 = generateFlatEllipsoid(0.09, 0.05, 0.09, 20, 20,  0.14, -0.75, -0.23, [0,0,0]);


var tail=generateCylinderZ(0.03,0.8,20, 0,-0.2,-1.15,[0,0,0]);


  var star = generateStar4_3D(0.25, 0.05, 0, -0.2, -1.15, [1,0.85,0.1]);

var earLeft = generateEllipsoid(0.2, 0.3, 0.08, 20, 20, -0.26, 0.65, 0.4, [0.2, 0.8, 1.0]);
rotateZ(earLeft, 23 * Math.PI/180);


var earRight = generateEllipsoid(0.2, 0.3, 0.08, 20, 20, 0.25, 0.65, 0.4, [0.2, 0.8, 1.0]);
rotateZ(earRight, 337 * Math.PI/180);

var ring1 = makeHorizontalRing(-0.14, -0.5, 0.32, 0.095, 0.05, 20, [1,1,0]);
var ring2 = makeHorizontalRing( 0.14, -0.5, 0.32, 0.095, 0.05, 20, [1,1,0]);
var ring3 = makeHorizontalRing(-0.14, -0.65, 0.32, 0.095, 0.05, 20, [1,1,0]);
var ring4 = makeHorizontalRing(0.14, -0.65, 0.32, 0.095, 0.05, 20, [1,1,0]);

let claws1 = clawsAt(-0.14, -0.74, 0.46, [0.6, 0.6, 0.6]); 
let claws3 = clawsAt(-0.14, -0.74, -0.14, [0.6, 0.6, 0.6]);
let claws4 = clawsAt(0.14, -0.74, 0.46, [0.6, 0.6, 0.6]);
let claws5 = clawsAt(0.14, -0.74, -0.14, [0.6, 0.6, 0.6]);

var thighRight = generateEllipsoid(
  0.040, 0.26, 0.090,
  22, 22,
  0.14, -0.31, 0.34,     
  [0, 0, 0]
);
rotateMeshX(thighRight, 12 * Math.PI/180, 0.14, -0.46, 0.26);



var thighLeft = generateEllipsoid(
  0.040, 0.26, 0.090,
  20, 20,
  -0.14, -0.31, 0.34,
  [0, 0, 0]
);
rotateMeshX(thighLeft, 12 * Math.PI/180, -0.14, -0.46, 0.26);





var cone = generateCone(0.18, 0.3, 20, 0, 0.017, 0.45, [0,0,0]);

let angle = 23 * Math.PI/180;
for (let i=0; i<cone.vertices.length; i+=6){
  let y = cone.vertices[i+1] - 0.3;
  let z = cone.vertices[i+2] - 0.4;
  let y2 = y*Math.cos(angle) - z*Math.sin(angle);
  let z2 = y*Math.sin(angle) + z*Math.cos(angle);
  cone.vertices[i+1] = y2 + 0.3;
  cone.vertices[i+2] = z2 + 0.4;
}

var cone1 = makeCone(0, -0.08, -0.54, 310*Math.PI/180, 0);

var cone2 = makeCone(-0.1, -0.30, -0.39, 290*Math.PI/180, 40*Math.PI/180);

var cone3 = makeCone(0.1, -0.30, -0.39, 290*Math.PI/180, -40*Math.PI/180);

var cone4 = makeCone(0.08, -0.40, -0.39, 250*Math.PI/180, -50*Math.PI/180);

var cone5 = makeCone(-0.08, -0.40, -0.39, 250*Math.PI/180, 50*Math.PI/180);

var backConeTop = makeCone(0, 0.05, 0.04, 250*Math.PI/180, 0);
var backConeTop1 = makeSideCone(0, 0.05, 0.04, 0.05, 0.2, 16, 250*Math.PI/180, 0, [0, 0, 0]);
var sideConeTop1 = makeSideCone(0.4, 0.2, 0, 0.05, 0.2, 16, 180*Math.PI/180, 90*Math.PI/180, [0, 0, 0]);

var sideConeTop1 = makeSideConeFlexible(0.3, 0.08, 0.4, 0.1, 0.2, 16, 180*Math.PI/180, 50*Math.PI/180, [0, 0, 0]);

var sideConeBottom1 = makeSideConeFlexible(0.25, 0.03, 0.4, 0.1, 0.2, 16, 180*Math.PI/180, 45*Math.PI/180, [0, 0, 0]);

var sideConeTop2 = makeSideConeFlexible(-0.3, 0.08, 0.4, 0.1, 0.2, 16, -180*Math.PI/180, -50*Math.PI/180, [0, 0, 0]);

var sideConeBottom2 = makeSideConeFlexible(-0.25, 0.03, 0.4, 0.1, 0.2, 16, -180*Math.PI/180, -45*Math.PI/180, [0, 0, 0]);

var backConeBottom = makeSideCone

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

var smile = generateArcMouth(
    0.2,
    0.03,
    0.01,
    20,
    0,
    0.12,
    0.74,
    [0, 0, 0]
);




var topCone1 = makeConeAdjustable(0,0.7,0.6, 0.15, 0.45, 20, 40*Math.PI/180, [0, 0, 0]);



var earInnerL = generateEllipsoid(
    0.08, 0.12, 0.02,
    20, 20,
    0.25, 0.65, 0.48,
    [1.0, 0.85, 0.1]
);
rotateZ(earInnerL, 337 * Math.PI/180);

var earInnerR = generateEllipsoid(0.08, 0.12, 0.02,20, 20,
    -0.25, 0.65, 0.48,
    [1.0, 0.85, 0.1]
);
rotateZ(earInnerR, -337 * Math.PI/180);

  return {
  
    body, tail, earLeft, earRight,
    leg1, leg2, leg3, leg4,
    foot1, foot2, foot3, foot4,
    claws1, claws3, claws4, claws5, 

    
    ring1, ring2, ring3, ring4, star, nose, smile,
    cone, cone1, cone2, cone3, cone4, cone5,
    sideConeTop1, sideConeBottom1, sideConeBottom2, sideConeTop2, backConeTop1,
    topCone1, earInnerL, earInnerR, thighLeft, thighRight,
    eyeWhiteL, eyeWhiteR, eyeYellowL, eyeYellowR,
    cover2, selimut, selimut2, sideleft1, sideleft2,
    sphere
  };
}