//File: index.js
//Author: Martin Terner
//Date: 2024-02-22
//Description: main file for running ball simulation

var canvas = document.getElementById("canvas");
var outerCursorCircle = document.getElementById("outerCursorCircle");
var cursorCircle = document.getElementById("cursorCircle");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth - 150;
var ctx = canvas.getContext("2d");

acceleration = new Vector(0, 0);
bounceCoefficient = 0.3;

//initializes the bouncyBallHandler
var ballHandler = new bouncyBallHandler(
  canvas.width,
  canvas.height,
  ctx,
  bounceCoefficient,
  handleCollision.bind(this),
  handleIntersect.bind(this)
);

/**
 * Spawns a ball at the cursor position with given velocity and radius.
 *
 * @param {Vector} position - position the ball will spawn
 * @param {number} [radius=0] - radius of the ball
 * @param {Vector} [velocity=randomDirection()] - velocity of the ball
 */
function spawnBallAtCursor(position, radius = 1, velocity = randomDirection()) {
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

/**
 * function for applying acceleration(done using the html menu)
 *
 * @param {*} ball
 */
function applyAcceleration(ball) {
  ball.velocity.add(acceleration);
}

var mouseDown = false;

var heldBallIndex = undefined;

//the position of the mouse
const mouseVector = new Vector(0, 0);
previousMouseVector = new Vector(0, 0);
mouseVelocity = new Vector(0, 0);

canvas.addEventListener("touchstart", onMouseDown);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("touchend", onMouseUp);
window.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("touchmove", onMouseMove);
canvas.addEventListener("mousemove", onMouseMove);

/**
 * runs when the mouse is down, finds the closest ball to the cursor using the ballHandler quadtree
 *
 * @param {Vector}
 */
function onMouseDown() {
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

/**
 * runs when the mouse goes from down to up.
 */
function onMouseUp() {
  mouseDown = false;
}

/**
 * runs while the mouse moves. Handles mouse position calculations and calculates a velocity for the mouse which is used when spawning balls for some start velocity
 *
 * @param {*} e
 */
function onMouseMove(e) {
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

function handleCollision(ball) {
  if (!inputHandler.getValue("playSound")) return;
  var id = sound.play();
  sound.volume(
    (ball.velocity.magnitude / 80) *
      ball.mass *
      inputHandler.getValue("soundVolume"),
    id
  );
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

//initializes the input handler
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
    handleCollision.bind(this),
    handleIntersect.bind(this)
  );
});

//initializes stats panel which shows fps among other things
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.getElementById("canvas-container").appendChild(stats.dom);
stats.dom.style.position = "absolute";

var lastCalledTime = 1;
/**
 * the draw function, called every frame of the simulatin
 */
function draw() {
  stats.begin();

  inputHandler.updateInputs();

  ballHandler.wrapAround = inputHandler.getValue("wrapAroundCheckbox");
  ballHandler.bounceCoefficient = inputHandler.getValue(
    "coefficientOfRestitution"
  );

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

  //sets the html cursor circle elements size based on the spawn radius html input
  cursorCircle.setAttribute("r", inputHandler.getValue("spawnRadius"));

  //handles spawning and grabbing
  if (mouseDown) {
    switch (selectedInteraction) {
      //creates some random semi random direction based on mouse velocity and spawns balls with that velocity
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
      //grabs the closest ball to the cursor and sets its velocity to the direction from the ball to the cursor
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

  if (!lastCalledTime) {
    lastCalledTime = Date.now();
    return;
  }
  delta = (Date.now() - lastCalledTime) / 1000;
  lastCalledTime = Date.now();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ballHandler.update(Math.min(2, delta), applyAcceleration);

  if (inputHandler.getValue("visualizeQuadtree"))
    drawQuadtree(ballHandler.quadtree, ctx);

  stats.end();

  requestAnimationFrame(draw);
}

draw();
