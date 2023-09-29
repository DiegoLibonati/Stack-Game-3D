import * as THREE from "three";

export const createBlock = (width, height, depth, color) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({
    color: color,
    wireframe: false,
  });
  const block = new THREE.Mesh(geometry, material);

  return block;
};
