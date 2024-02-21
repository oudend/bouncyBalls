var canvas = document.getElementById("canvas");
var outerCursorCircle = document.getElementById("outerCursorCircle");
var cursorCircle = document.getElementById("cursorCircle");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth - 150;
var ctx = canvas.getContext("2d");

acceleration = new Vector(0, 0);
bounceCoefficient = 0.3;

var ballHandler = new bouncyBallHandler(
  canvas.width,
  canvas.height,
  ctx,
  bounceCoefficient,
  undefined,
  handleCollision.bind(this),
  handleIntersect.bind(this)
);

//? TODO:
// add different collision types(merge and such)

function hsl2rgb(h, s, l) {
  let a = s * Math.min(l, 1 - l);
  let f = (n, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function randomDirection() {
  rangrad = 2 * Math.PI * Math.random();
  return new Vector(Math.cos(rangrad), Math.sin(rangrad));
}

function spawnBallAtCursor(position, radius = 0, velocity = randomDirection()) {
  ball = new Ball(
    position.x,
    position.y,
    velocity,
    radius,
    hsl2rgb((mouseVector.x + mouseVector.y) / 2, 1, 0.5)
  );

  ballHandler.addBall(ball);

  ball.render(ctx);
}

function applyAcceleration(ball) {
  ball.velocity.add(acceleration);
}

var mouseDown = false;

var heldBallIndex = undefined;

const mouseVector = new Vector(0, 0);

canvas.addEventListener("touchstart", down);
canvas.addEventListener("mousedown", down);
canvas.addEventListener("touchend", up);
window.addEventListener("mouseup", up);
canvas.addEventListener("touchmove", move);
canvas.addEventListener("mousemove", move);

function down() {
  mouseDown = true;
  const ballCandidates = ballHandler.getQuadtreeCandidates(mouseVector, 10, 10);

  var closestBall = undefined;
  var minDistance = Infinity;

  for (var i = 0; i < ballCandidates.length; i++) {
    const ball = ballCandidates[i];
    const distance = Vector.distance(mouseVector, new Vector(ball.x, ball.y));

    if (distance < minDistance) {
      minDistance = distance;
      closestBall = ball;
    }
  }
  if (closestBall !== undefined) heldBallIndex = closestBall.index;
}

function up() {
  mouseDown = false;
}

previousMouseVector = new Vector(0, 0);

mouseVelocity = new Vector(0, 0);
function move(e) {
  mouseVector.x = e.clientX - 150;
  mouseVector.y = e.clientY;

  outerCursorCircle.style.left = e.clientX - 150 - 150;
  outerCursorCircle.style.top = e.clientY - 150;

  mouseVelocity.x = mouseVector.x - previousMouseVector.x;
  mouseVelocity.y = mouseVector.y - previousMouseVector.y;

  previousMouseVector.x = mouseVector.x;
  previousMouseVector.y = mouseVector.y;

  mouseVelocity = new Vector(e.movementX, e.movementY);
}

const playSound = false;

var sound = new Howl({
  src: ["assets/bounce2.mp3"],
});

// Howler.volume(0.5);

function handleCollision(ball) {
  if (!inputHandler.getValue("playSound")) return;
  var id = sound.play();
  sound.volume(
    (ball.velocity.magnitude / 80) *
      ball.mass *
      inputHandler.getValue("soundVolume"),
    id
  );
  // sound.fade(1, 0, 100, id);
}

function handleIntersect(ball, ball2) {
  if (!inputHandler.getValue("merge")) return true;

  if (
    Vector.distance(ball.position, ball2.position) <=
    Math.max(ball2.radius, ball.radius) / 2
  ) {
    if (ball.radius >= ball2.radius) {
      ball.radius += Math.sqrt(ball2.radius);
      ballHandler.removeBall(ball2);
    }
  }
  return false;
}

const inputHandler = new InputHandler();

inputHandler.addContainer(document.getElementById("sidebar"));

inputHandler.setCallback("gravityEnabledCheckbox", (e, value) => {
  if (value) accelerationInput.classList.add("disabled");
  else accelerationInput.classList.remove("disabled");
});

const accelerationInput = document.getElementById("accelerationInput");

const resetButton = document.getElementById("resetButton");

const interactionSelection = document.getElementById("interactionSelection");

let selectedInteraction =
  interactionSelection.options[interactionSelection.selectedIndex].value;

resetButton.addEventListener("click", () => {
  ballHandler = new bouncyBallHandler(
    canvas.width,
    canvas.height,
    ctx,
    bounceCoefficient,
    undefined,
    handleCollision.bind(this),
    handleIntersect.bind(this)
  );
});

var lastCalledTime = 1;
var fps = 0;

ballHandler.addBall(new Ball(100, 100, new Vector(4, 4), 100, [255, 255, 255]));

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.getElementById("canvas-container").appendChild(stats.dom);
stats.dom.style.position = "absolute";

function draw() {
  stats.begin();

  inputHandler.updateInputs();
  ballHandler.bounceCoefficient = inputHandler.getValue(
    "coefficientOfRestitution"
  );
  ballHandler.wrapAround = inputHandler.getValue("wrapAroundCheckbox");
  if (isNaN(ballHandler.bounceCoefficient)) ballHandler.bounceCoefficient = 0.5;

  selectedInteraction =
    interactionSelection.options[interactionSelection.selectedIndex].value;

  acceleration = new Vector(0, 0);
  if (gravityEnabledCheckbox.checked) {
    acceleration = new Vector(0, 9.82);
  } else {
    acceleration = new Vector(
      inputHandler.getValue("accelerationX"),
      inputHandler.getValue("accelerationY")
    );
  }

  if (!lastCalledTime) {
    lastCalledTime = Date.now();
    fps = 0;
    return;
  }
  delta = (Date.now() - lastCalledTime) / 1000;
  lastCalledTime = Date.now();
  fps = 1 / delta;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ballHandler.update(Math.min(2, delta), applyAcceleration);

  cursorCircle.setAttribute("r", inputHandler.getValue("spawnRadius"));

  if (mouseDown) {
    switch (selectedInteraction) {
      case "spawn":
        velocity = mouseVelocity.copy();
        velocity.add(randomDirection());
        velocity.multiply(40);
        const spawnAmount = inputHandler.getValue("spawnAmount");
        for (let i = 0; i < spawnAmount; i++) {
          let randomOffset = randomDirection()
            .multiply(inputHandler.getValue("spawnRadius"))
            .multiply(Math.random());
          spawnBallAtCursor(
            new Vector(
              mouseVector.x + randomOffset.x,
              mouseVector.y + randomOffset.y
            ),
            getRandomArbitrary(
              inputHandler.getValue("spawnSizeMin"),
              inputHandler.getValue("spawnSizeMax")
            ),
            velocity
          );
        }
        break;
      case "grab":
        const ball = ballHandler.balls[heldBallIndex];
        if (!ball) break;
        ball.newVelocity = Vector.subtract(mouseVector, ball.position)
          .normalize()
          .multiply(Vector.distance(mouseVector, ball.position) ** 1.4)
          .add(Vector.scale(ball.newVelocity, 0.1));
        break;
    }
  }

  if (inputHandler.getValue("visualizeQuadtree"))
    drawQuadtree(ballHandler.quadtree, ctx);

  stats.end();

  requestAnimationFrame(draw);
}

draw();
