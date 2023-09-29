export const disposeBlocks = (scene, cubes) => {
  for (const cube of cubes) {
    cube.geometry.dispose();
    cube.material.dispose();
    scene.remove(cube);
  }

  return;
};
