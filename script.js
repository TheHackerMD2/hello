const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();

// Camera and player setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

let player = { x: 0, y: 2, z: 0, velocityY: 0, onGround: true };
const moveSpeed = 0.1;
const jumpSpeed = 0.2;
const gravity = 0.01;

// Terrain settings
const blockSize = 1;
const terrainSize = 10;
const blockTypes = ["grass", "stone", "dirt", "wood", "ore"];
const blockTextures = {
  grass: "https://threejs.org/examples/textures/terrain/grasslight-big.jpg",
  stone: "https://threejs.org/examples/textures/terrain/stone-01.jpg",
  dirt: "https://threejs.org/examples/textures/terrain/dirt-01.jpg",
  wood: "https://threejs.org/examples/textures/terrain/wood.jpg",
  ore: "https://threejs.org/examples/textures/terrain/stone-02.jpg"
};

const blockGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
let blockMaterials = {};
blockTypes.forEach(type => {
  blockMaterials[type] = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(blockTextures[type])
  });
});

// Generate terrain
const blocks = [];
function generateTerrain() {
  for (let x = -terrainSize; x < terrainSize; x++) {
    for (let z = -terrainSize; z < terrainSize; z++) {
      const type = blockTypes[Math.floor(Math.random() * blockTypes.length)];
      const block = new THREE.Mesh(blockGeometry, blockMaterials[type]);
      block.position.set(x * blockSize, 0, z * blockSize);
      scene.add(block);
      blocks.push({
        mesh: block,
        type,
        x: block.position.x,
        y: block.position.y,
        z: block.position.z
      });
    }
  }
}

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// Crosshair and mouse rotation
let rotationX = 0;
let rotationY = 0;
document.addEventListener("mousemove", event => {
  rotationX -= event.movementY * 0.002;
  rotationY -= event.movementX * 0.002;
  camera.rotation.set(rotationX, rotationY, 0);
});

// Player controls
const keys = {};
document.addEventListener("keydown", e => (keys[e.key.toLowerCase()] = true));
document.addEventListener("keyup", e => (keys[e.key.toLowerCase()] = false));

// Inventory
const inventorySlots = document.querySelectorAll(".inventory-slot");

// Physics and movement
function updatePlayer() {
  if (keys["w"]) {
    player.x -= Math.sin(rotationY) * moveSpeed;
    player.z -= Math.cos(rotationY) * moveSpeed;
  }
  if (keys["s"]) {
    player.x += Math.sin(rotationY) * moveSpeed;
    player.z += Math.cos(rotationY) * moveSpeed;
  }
  if (keys["a"]) {
    player.x -= Math.cos(rotationY) * moveSpeed;
    player.z += Math.sin(rotationY) * moveSpeed;
  }
  if (keys["d"]) {
    player.x += Math.cos(rotationY) * moveSpeed;
    player.z -= Math.sin(rotationY) * moveSpeed;
  }

  if (keys[" "] && player.onGround) {
    player.velocityY = jumpSpeed;
    player.onGround = false;
  }

  player.velocityY -= gravity;
  player.y += player.velocityY;

  if (player.y < 2) {
    player.y = 2;
    player.velocityY = 0;
    player.onGround = true;
  }

  camera.position.set(player.x, player.y, player.z);
}

// Main game loop
function animate() {
  updatePlayer();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Initialize game
generateTerrain();
animate();
