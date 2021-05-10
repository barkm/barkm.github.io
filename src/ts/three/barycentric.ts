import * as THREE from "three";

function getBarycentricCoordinates(
  geometry: THREE.BufferGeometry
): Float32Array | null {
  const positionAttribute = geometry.attributes.position;
  const vertexFromFace = geometry.getIndex();
  if (!vertexFromFace || vertexFromFace.count != positionAttribute.count) {
    console.log("Could not get barycentric coordinates");
    return null;
  }
  const barycentricCoordinates = new Float32Array(positionAttribute.count * 3);
  const corners = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
  ];
  for (let i = 0; i < positionAttribute.count; i++) {
    if (vertexFromFace) {
      const vertex = vertexFromFace.array[i];
      corners[i % 3].toArray(barycentricCoordinates, vertex * 3);
    }
  }
  return barycentricCoordinates;
}

export function setBarycentricCoordinateAttribute(
  geometry: THREE.BufferGeometry
): void {
  const barycentricCoordinates = getBarycentricCoordinates(geometry);
  if (!barycentricCoordinates) {
    return;
  }
  geometry.setAttribute(
    "aBarycentricCoordinate",
    new THREE.BufferAttribute(barycentricCoordinates, 3)
  );
}
