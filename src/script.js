import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { createBlock } from "./js/createBlock";
import { onInitGame } from "./js/onInitGame";
import { disposeBlocks } from "./js/disposeBlocks";

// Falta
// - Ir Removiendo de cubes cuando hay mucho
// - Agregar bloqeus que caen cuando se cortan

// Global Variables
let cubes = [];
let direction = "x";
let gameStarted = false;
let scoreGame = 0;
let goBack = 0;
let goForward = 0;

// Debug
// const gui = new dat.GUI();

// Elements
const canvas = document.querySelector(".webgl");
const score = document.querySelector(".score");
const menu = document.querySelector(".menu_container");
const mainContainer = document.querySelector(".main_container");
const lastScore = document.querySelector(".menu_container_wrapper h3");
const btnPlay = document.querySelector(".menu_container_wrapper button");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(`hsl(${5 + cubes.length * 4}, 100%, 50%)`);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Events

// Event - Start Game
btnPlay.addEventListener(
  "click",
  () => {
    if (cubes.length) {
      disposeBlocks(scene, cubes);
    }

    cubes = [];
    scoreGame = 0;
    goBack = 0;
    goForward = 0;
    direction = "x";
    scene.background = new THREE.Color(
      `hsl(${5 + cubes.length * 4}, 100%, 50%)`
    );

    onInitGame(scene, score, menu, cubes);
    gameStarted = true;
  },
  false
);

// Event - Resize Window
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Event - Click on Canvas
mainContainer.addEventListener(
  "click",
  (e) => {
    if (e.target.id === "mainContainer") {
      let delta, newScale;
      goBack = 0;
      goForward = 0;
      const topBlock = cubes[cubes.length - 1];
      const bottomBlock = cubes[cubes.length - 2];

      scene.background = new THREE.Color(
        `hsl(${2 + cubes.length * 1}, 100%, 50%)`
      );

      for (const cube of cubes) {
        cube.position.y -= 2;
      }

      const nextBlock = createBlock(
        10,
        2,
        10,
        new THREE.Color(`hsl(${30 + cubes.length * 4}, 100%, 50%)`)
      );
      nextBlock.position.y = 2 + topBlock.position.y;

      delta = Math.abs(
        bottomBlock.position[direction] - topBlock.position[direction]
      );

      if (delta > bottomBlock.scale[direction] * 10) {
        score.style.display = "none";
        menu.style.display = "flex";
        score.innerHTML = `0`;
        lastScore.innerHTML = `Last Score: ${scoreGame}`;
        gameStarted = false;
        return;
      }

      newScale = topBlock.scale[direction] - delta / 10;
      topBlock.scale[direction] = newScale;

      if (topBlock.position[direction] > bottomBlock.position[direction]) {
        topBlock.position[direction] -= delta / 2;
      } else {
        topBlock.position[direction] += delta / 2;
      }

      cubes.push(nextBlock);

      if (direction === "x") {
        nextBlock.position.set(topBlock.position.x, nextBlock.position.y, -20);
        nextBlock.scale.set(newScale, 1, topBlock.scale.z);
        direction = "z";
      } else {
        nextBlock.position.set(-20, nextBlock.position.y, topBlock.position.z);
        nextBlock.scale.set(topBlock.scale.x, 1, newScale);
        direction = "x";
      }

      scene.add(nextBlock);

      scoreGame += 1;
      score.innerHTML = `${scoreGame}`;
    }
  },
  false
);

// First Mesh Decoration
const base = createBlock(
  10,
  10,
  10,
  new THREE.Color(`hsl(${30 + cubes.length * 4}, 100%, 50%)`)
);
cubes.push(base);
base.position.y = -10;
scene.add(base);

// Lights
const ambientLight = new THREE.AmbientLight("#000", 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight("#fff", 1, 100);
pointLight.position.set(25, -15, 20);
scene.add(pointLight);

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
scene.add(pointLightHelper);

const hemisphereLight = new THREE.HemisphereLight("#5a7974", "#000", 2);
scene.add(hemisphereLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  1,
  400
);
camera.position.z = 30;
camera.position.y = 30;
camera.position.x = 30;

scene.add(camera);

// Render
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Render
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.render(scene, camera);

const tick = () => {
  let topBlock, bottomBlock, delta;
  if (cubes.length > 1) {
    topBlock = cubes[cubes.length - 1];
    bottomBlock = cubes[cubes.length - 2];
    delta = Math.abs(
      bottomBlock.position[direction] - topBlock.position[direction]
    );
  }

  if (cubes.length > 20) {
    disposeBlocks(scene, cubes.slice(0, 3));
    cubes = cubes.slice(3, cubes.length);
  }

  if (gameStarted) {
    if (goForward < 350 && (goBack === 0 || goBack === 350)) {
      goForward++;
      goBack = 0;
      cubes[cubes.length - 1].position[direction] += 0.1;
    } else if (goBack < 350 && (goForward === 0 || goForward === 350)) {
      goForward = 0;
      goBack++;
      cubes[cubes.length - 1].position[direction] -= 0.1;
    }
  }

  // Update controls
  controls.update();

  //Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
