import * as THREE from "three";

import * as UTILS from "../utils";

type Assignment = 0 | 1 | 2;

function getBarycentricCoordinates(
  asssignents: Array<Assignment>
): Float32Array {
  const barycentricCoordinates = new Float32Array(asssignents.length * 3);
  const corners = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ];
  for (let i = 0; i < asssignents.length; i++) {
    corners[asssignents[i]].toArray(barycentricCoordinates, i * 3);
  }
  return barycentricCoordinates;
}

function getIndependentTrianglesAssignments(
  geometry: THREE.BufferGeometry
): Array<Assignment> | null {
  const vertexFromFaceAttribute = geometry.getIndex();
  if (
    !vertexFromFaceAttribute ||
    geometry.getAttribute("position").count == vertexFromFaceAttribute.count * 3
  ) {
    console.log("Not able to get assignments from geometry");
    return null;
  }
  const vertexFromFace = vertexFromFaceAttribute.array;
  const assignments: Array<Assignment> = new Array(vertexFromFace.length);
  for (let i = 0; i < vertexFromFace.length; i++) {
    assignments[vertexFromFace[i]] = (i % 3) as Assignment;
  }
  return assignments;
}

function getPlaneGeometryAssignments(
  geometry: THREE.PlaneGeometry
): Array<Assignment> {
  const numVertices = geometry.getAttribute("position").count;
  const columns = geometry.parameters.widthSegments + 1;
  return UTILS.range(numVertices).map((n) => {
    const row = Math.floor(n / columns);
    const column = n % columns;
    return UTILS.modulo(column - row, 3) as Assignment;
  });
}

export function setBarycentricCoordinateAttribute(
  geometry: THREE.BufferGeometry
): void {
  let assignments;
  if (geometry instanceof THREE.PlaneGeometry) {
    assignments = getPlaneGeometryAssignments(geometry);
  } else {
    assignments = getIndependentTrianglesAssignments(geometry);
    if (!assignments) {
      return;
    }
  }

  const barycentricCoordinates = getBarycentricCoordinates(assignments);
  geometry.setAttribute(
    "aBarycentricCoordinate",
    new THREE.BufferAttribute(barycentricCoordinates, 3)
  );
}
