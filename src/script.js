import * as THREE from "three";
import * as CANNON from "cannon";

let camera, scene, renderer;
let world;
let cubes = [];
let fallCubes = [];
let gameStarted = false;
let goFoward = false;

const originalBlockSize = 3;
const blockHeight = 1;

// Elements
const canvas = document.querySelector(".webgl");
const score = document.querySelector(".score");
const menu = document.querySelector(".menu_container");
const lastScore = document.querySelector(".menu_container_wrapper h3");
const btnPlay = document.querySelector(".menu_container_wrapper button");

const onInit = () => {
  // CannonJS
  world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40;

  // Scene
  scene = new THREE.Scene();

  // Base
  addBlock(0, 0, originalBlockSize, originalBlockSize);

  // First Block
  addBlock(-10, 0, originalBlockSize, originalBlockSize, "x");

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 0);
  scene.add(directionalLight);

  // Camera
  const aspect = window.innerWidth / window.innerHeight;
  const width = 10;
  const height = width / aspect;

  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    100
  );

  camera.position.set(4, 4, 4);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
};

// Events

// Event - Resize Window
window.addEventListener("resize", () => {
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Event - Start Game
btnPlay.addEventListener("click", () => {
  if (!gameStarted) {
    if (cubes.length > 0 || fallCubes.length > 0) {
      const arrays = cubes.concat(fallCubes);

      for (const cube of arrays) {
        cube.mesh.geometry.dispose();
        cube.mesh.material.dispose();
        scene.remove(cube);
      }

      cubes = [];
      fallCubes = [];
      goFoward = false;

      onInit();
    }

    score.style.display = "block";
    score.style.color = "#fff";

    menu.style.display = "none";

    renderer.setAnimationLoop(tick);
    gameStarted = true;

    return;
  }
});

// Event click on Window
window.addEventListener("click", (e) => {
  const id = e.target.id;

  if (gameStarted && id !== "playbtn") {
    const topBlock = cubes[cubes.length - 1];
    const bottomBlock = cubes[cubes.length - 2];

    const direction = topBlock.direction;

    const delta =
      topBlock.mesh.position[direction] - bottomBlock.mesh.position[direction];

    const absDelta = Math.abs(delta);

    const size = direction === "x" ? topBlock.width : topBlock.depth;

    const overlap = size - absDelta;

    if (overlap > 0) {
      goFoward = false;
      score.innerHTML = `${Number(score.innerHTML) + 1}`;

      const newBlockWidth = direction === "x" ? overlap : topBlock.width;
      const newBlockDepth = direction === "z" ? overlap : topBlock.depth;

      topBlock.width = newBlockWidth;
      topBlock.depth = newBlockDepth;

      topBlock.mesh.scale[direction] = overlap / size;
      topBlock.mesh.position[direction] -= delta / 2;
      topBlock.body.position[direction] -= delta / 2;

      const shape = new CANNON.Box(
        new CANNON.Vec3(newBlockWidth / 2, blockHeight / 2, newBlockDepth / 2)
      );

      topBlock.body.shapes = [];
      topBlock.body.addShape(shape);

      // Fall Part

      const fallBlock = (overlap / 2 + absDelta / 2) * Math.sign(delta);
      const fallBlockX =
        direction === "x"
          ? topBlock.mesh.position.x + fallBlock
          : topBlock.mesh.position.x;
      const fallBlockZ =
        direction === "z"
          ? topBlock.mesh.position.z + fallBlock
          : topBlock.mesh.position.z;

      const fallBlockWidth = direction === "x" ? absDelta : newBlockWidth;
      const fallBlockDepth = direction === "z" ? absDelta : newBlockDepth;

      addFallBlock(fallBlockX, fallBlockZ, fallBlockWidth, fallBlockDepth);

      // End Fall Part

      const newBlockX = direction === "x" ? topBlock.mesh.position.x : -5;
      const newBlockZ = direction === "z" ? topBlock.mesh.position.z : -5;

      const newBlockDirection = direction === "x" ? "z" : "x";

      addBlock(
        newBlockX,
        newBlockZ,
        newBlockWidth,
        newBlockDepth,
        newBlockDirection
      );

      return;
    }

    renderer.setAnimationLoop(null);
    lastScore.innerHTML = `Last Score: ${score.innerHTML}`;
    score.innerHTML = "0";
    score.style.display = "none";
    menu.style.display = "flex";

    gameStarted = false;
  }
});

// Fns

const addBlock = (x, z, width, depth, direction) => {
  const y = blockHeight * cubes.length;

  const block = createBlock(x, y, z, width, depth, false);
  block.direction = direction;

  cubes.push(block);
};

const addFallBlock = (x, z, width, depth) => {
  const y = blockHeight * (cubes.length - 1);
  const fallBlock = createBlock(x, y, z, width, depth, true);
  fallCubes.push(fallBlock);
};

const createBlock = (x, y, z, width, depth, isBlockFall) => {
  // Cube
  const geometry = new THREE.BoxGeometry(width, blockHeight, depth);

  const color = new THREE.Color(`hsl(${30 + cubes.length * 4}, 100%, 50%)`);
  const material = new THREE.MeshLambertMaterial({ color: color });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  // Gravity with Cannon
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, blockHeight / 2, depth / 2)
  );
  let mass = isBlockFall ? 5 : 0;
  const body = new CANNON.Body({ mass: mass, shape: shape });
  body.position.set(x, y, z);
  world.addBody(body);

  return {
    mesh,
    body,
    width,
    depth,
  };
};

const updatePhysics = () => {
  world.step(1 / 60);

  fallCubes.forEach((cube) => {
    cube.mesh.position.copy(cube.body.position);
    cube.mesh.quaternion.copy(cube.body.quaternion);
  });
};

const tick = () => {
  const speed = 0.039;

  const topBlock = cubes[cubes.length - 1];
  const bottomBlock = cubes[cubes.length - 2];

  const direction = topBlock.direction;

  const delta = Math.round(
    topBlock.mesh.position[direction] - bottomBlock.mesh.position[direction]
  );

  if (delta === 5 || goFoward) {
    topBlock.mesh.position[topBlock.direction] -= speed;
    topBlock.body.position[topBlock.direction] -= speed;
    goFoward = true;
  }

  if (delta === -5 || delta === -10 || !goFoward) {
    topBlock.mesh.position[topBlock.direction] += speed;
    topBlock.body.position[topBlock.direction] += speed;
    goFoward = false;
  }

  if (camera.position.y < blockHeight * (cubes.length - 2) + 4) {
    camera.position.y += speed;
  }

  updatePhysics();
  renderer.render(scene, camera);
};

onInit();
