import { createBlock } from "./createBlock";
import * as THREE from "three";

export const onInitGame = (scene, score, menu, cubes) => {
  // Mesh
  const base = createBlock(
    10,
    10,
    10,
    new THREE.Color(`hsl(${30 + cubes.length * 4}, 100%, 50%)`)
  );
  cubes.push(base);
  base.position.y = -10;
  scene.add(base);

  // First block
  const block = createBlock(
    10,
    2,
    10,
    new THREE.Color(`hsl(${30 + cubes.length * 4}, 100%, 50%)`)
  );

  block.position.x = -20;
  block.position.y = -4;

  cubes.push(block);
  scene.add(block);

  score.style.display = "block";
  menu.style.display = "none";

  return;
};
