import * as THREE from "/src/three.js";
// import { CustomBlending } from "./three.js";
// import { BoundingBoxHelper } from "./three.js";
const scene = new THREE.Scene();
const playerCar = Car();
scene.add(playerCar);
// const color = [0xa52523, 0xbdb638, 0x78b14b];
//lights
const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
//camera
const aspRatio = window.innerWidth / window.innerHeight;
const camWidth = 960;
const camHeight = camWidth / aspRatio;
scene.add(dirLight);
const camera = new THREE.OrthographicCamera(
  camWidth / -2, //left
  camWidth / 2, //right
  camHeight / 2, //top
  camHeight / -2, //bottom
  0, //near plane
  1000 //far plane
);
camera.position.set(0, -210, 300);
camera.lookAt(0, 0, 0);
mapRender(camWidth, camHeight * 2);
//renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
document.body.appendChild(renderer.domElement);

//car
function Car() {
  //former of a car
  const car = new THREE.Group();

  //backWheel of a car
  const backWheel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  backWheel.position.z = 6;
  backWheel.position.x = -18;
  car.add(backWheel);

  //frontWheel of a car

  const frontWheel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(12, 33, 12),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  frontWheel.position.z = 6;
  frontWheel.position.x = 18;
  car.add(frontWheel);

  //body of a car
  const body = new THREE.Mesh(
    new THREE.BoxBufferGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color: 0xbdb638 })
  );
  body.position.z = 12;
  car.add(body);

  //cabin of a car

  //setup the cabin
  const cabFront = getFrontTextureOfCar();
  cabFront.center = new THREE.Vector2(0.5, 0.5);
  cabFront.rotation = Math.PI / 2;
  const cabBack = getFrontTextureOfCar();
  cabBack.center = new THREE.Vector2(0.5, 0.5);
  cabBack.rotation = -Math.PI / 2;
  const cabLeft = getSideTextureOfCar();
  cabLeft.flipY = false;
  const cabRight = getSideTextureOfCar();
  const cabin = new THREE.Mesh(
    new THREE.BoxBufferGeometry(33, 24, 12),
    new THREE.MeshLambertMaterial({ map: cabFront }),
    new THREE.MeshLambertMaterial({ map: cabBack }),
    new THREE.MeshLambertMaterial({ map: cabLeft }),
    new THREE.MeshLambertMaterial({ map: cabRight }),
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );

  cabin.position.x = -6;
  cabin.position.z = 25.6;

  car.add(cabin);
  return car;
}

//window for the car

//front
function getFrontTextureOfCar() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 64;
  canvas.height = 32;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 64, 32);
  ctx.fillStyle = "#666666";
  ctx.fillRect(8, 8, 48, 24);

  return new THREE.CanvasTexture(canvas);
}
//side

function getSideTextureOfCar() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 128;
  canvas.height = 32;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 32);

  ctx.fillStyle = "#666666";
  ctx.fillRect(10, 8, 38, 24);
  ctx.fillRect(50, 8, 60, 24);

  return new THREE.CanvasTexture(canvas);
}

//Calculation for the track
//Using Sin(aSin) and Cos(aCos) theorem for this (sin = opposite/hypotenuse)(cos = adjacent / hypotenuse)
const trackRadius = 225;
const trackWidth = 45;
const innerTrackRad = trackRadius - trackWidth;
const outerTrackRad = trackRadius + trackWidth;

const arcAng1 = (1 / 3) * Math.PI; // 60deg
const arcAng2 = Math.sin(arcAng1) * innerTrackRad;

const centerOfArc =
  (Math.cos(arcAng1) * innerTrackRad + Math.cos(arcAng2) * outerTrackRad) / 2;

const arcAng3 = Math.acos(centerOfArc / innerTrackRad);
const arcAng4 = Math.acos(centerOfArc / outerTrackRad);

//render the map
function mapRender(mwidth, mheight) {
  const lineMarkingsTexture = getLineMarkings(mwidth, mheight);

  //create the plane
  const planeGeometry = new THREE.PlaneBufferGeometry(mwidth, mheight);
  const planeMaterial = new THREE.MeshLambertMaterial({
    map: lineMarkingsTexture
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);

  //geometry
  const IslandLeft = leftIsland();
  const IslandRight = RightIsland();
  const IslandMid = MiddleIsland();
  const OuterField = TheOuterField(mwidth, mheight);

  const fieldGeo = new THREE.ExtrudeBufferGeometry(
    [IslandLeft, IslandMid, IslandRight, OuterField],
    {
      depth: 6,
      bevelEnabled: false
    }
  );
  const meshField = new THREE.Mesh(fieldGeo, [
    new THREE.MeshLambertMaterial({ color: 0x67c240 }),
    new THREE.MeshLambertMaterial({ color: 0x23311c })
  ]);
  scene.add(meshField);
}

//line markings
function getLineMarkings(newWidth, newHeight) {
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#546E90";
  ctx.fillRect(0, 0, newWidth, newHeight);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#E0FFFF";
  ctx.setLineDash([10, 14]);

  //L Circle

  ctx.beginPath();
  ctx.arc(
    newWidth / 2 - centerOfArc,
    newHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  //R Circle

  ctx.beginPath();
  ctx.arc(
    newWidth / 2 + centerOfArc,
    newHeight / 2,
    trackRadius,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

function leftIsland() {
  const islandLeft = new THREE.Shape();
  islandLeft.absarc(-centerOfArc, 0, innerTrackRad, arcAng1, -arcAng1, false);

  islandLeft.absarc(
    centerOfArc,
    0,
    outerTrackRad,
    Math.PI + arcAng2,
    Math.PI - arcAng2,
    true
  );
  return islandLeft;
}

function MiddleIsland() {
  const midIsland = new THREE.Shape();
  midIsland.absarc(-centerOfArc, 0, innerTrackRad, arcAng3, -arcAng3, true);

  midIsland.absarc(
    centerOfArc,
    0,
    innerTrackRad,
    Math.PI + arcAng3,
    Math.PI - arcAng3,
    true
  );
  return midIsland;
}

function RightIsland() {
  const islandRight = new THREE.Shape();
  islandRight.absarc(
    centerOfArc,
    0,
    innerTrackRad,
    Math.PI - arcAng1,
    Math.PI + arcAng1,
    true
  );
  islandRight.absarc(-centerOfArc, 0, outerTrackRad, -arcAng2, arcAng2, false);
  return islandRight;
}

function TheOuterField(width, height) {
  const outerField = new THREE.Shape();
  outerField.moveTo(-width / 2, -height / 2);
  outerField.lineTo(0, -height / 2);

  outerField.absarc(-centerOfArc, 0, outerTrackRad, -arcAng4, arcAng4, true);

  outerField.absarc(
    centerOfArc,
    0,
    outerTrackRad,
    Math.PI - arcAng4,
    Math.PI + arcAng4,
    true
  );
  outerField.lineTo(0, -height / 2);
  outerField.lineTo(width / 2, -height / 2);
  outerField.lineTo(width / 2, height / 2);
  outerField.lineTo(-width / 2, height / 2);
  return outerField;
}
function keepSize() {
  camera.aspect = window.innerHeight / window.innerWidth;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

keepSize();

//Logic of the game

//initializing for the logic
let ready;
let playerAngleMoved;
let score;
const ScoreElem = document.getElementById("score");
let newVehicle = [];
let lastTimeStamp;
let accelerate = false;
let decelerate = false;
const InitialPlayerAngle = Math.PI;
const speed = 0.017;

//resetting the whole game and set everything to begin
function reset() {
  playerAngleMoved = 0;
  movePlayerCar(0);
  score = 0;
  ScoreElem.innerText = score;
  lastTimeStamp = null;
  //remove another vehicle;
  newVehicle.forEach((vehicle) => {
    scene.remove(vehicle.mesh);
  });
  newVehicle = [];

  renderer.render(scene, camera);
  ready = true;
}
//starting the game
reset();
function startGame() {
  if (ready) {
    ready = false;
    renderer.setAnimationLoop(animation);
  }
}

//handling keypress

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    startGame();
    accelerate = true;
    return;
  }
  if (e.key === "ArrowDown") {
    decelerate = true;
    return;
  }

  if (e.key === "Escape") {
    reset();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key == "ArrowUp") {
    accelerate = false;
    return;
  }

  if (e.key == "ArrowDown") {
    decelerate = false;
    return;
  }
});

//animating the car (animation function)

function animation(tStamp) {
  if (!lastTimeStamp) {
    lastTimeStamp = tStamp;
    return;
  }
  const deltaTime = tStamp - lastTimeStamp;
  movePlayerCar(deltaTime);
  const laps = Math.floor(Math.abs(playerAngleMoved) / (Math.PI * 2));
  if (laps !== score) {
    score = laps;
    ScoreElem.innerText = score;
  }
  if (newVehicle.length < (laps + 1) / 5) addVehicle();

  renderer.render(scene, camera);
  lastTimeStamp = tStamp;
}

function movePlayerCar(dt) {
  const sCar = carSpeed();
  playerAngleMoved -= sCar * dt;
  const totalAngleOfPlayer = InitialPlayerAngle + playerAngleMoved;
  const playerX = Math.cos(totalAngleOfPlayer) * trackRadius - centerOfArc;
  const playerY = Math.sin(totalAngleOfPlayer) * trackRadius;

  Car().position.x = playerX;
  Car().position.y = playerY;
  Car().rotation.z = totalAngleOfPlayer - Math.PI / 2;
}

//defining the decel and accel of the car
function carSpeed() {
  if (accelerate === true) return speed * 2;
  if (decelerate === true) return speed * 0.5;
}

function addVehicle() {}
