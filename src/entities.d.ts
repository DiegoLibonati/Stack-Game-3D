// TYPES

export type CreateBlock = {
  mesh: THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshLambertMaterial,
    THREE.Object3DEventMap
  >;
  body: CANNON.Body;
  width: number;
  depth: number;
  direction?: "x" | "y" | "z";
};

export type Block = {
  mesh: THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshLambertMaterial,
    THREE.Object3DEventMap
  >;
  body: CANNON.Body;
  width: number;
  depth: number;
  direction: "x" | "y" | "z";
};
