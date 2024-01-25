var canvas = document.getElementById("canvas");

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
  handleCollision.bind(this)
);

//? TODO:
// fix weird collisions
// add different collision types(merge and such)
// get better quadtree maybe?
// quadtree visualization
// make it impossible for balls to pass through boundary
// wrap around

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
    hsl2rgb((mouseX + mouseY) / 2, 1, 0.5)
  );

  ballHandler.addBall(ball);

  ball.render(ctx);
}

function applyAcceleration(ball) {
  ball.velocity.add(acceleration);
}

var mouseDown = false;

var heldBallIndex = undefined;

canvas.onmousedown = () => {
  mouseDown = true;

  const mouseVector = new Vector(mouseX, mouseY);

  const ballCandidates = ballHandler.getQuadtreeCandidates(mouseVector, 30, 30);

  const min = ballCandidates.sort((a, b) =>
    Math.min(
      Vector.distance(mouseVector, new Vector(a.x, a.y)),
      Vector.distance(mouseVector, new Vector(b.x, b.y))
    )
  )[0];

  heldBallIndex = min.index;
};

canvas.onmouseup = () => {
  mouseDown = false;
};

previousMouseX = 0;
previousMouseY = 0;

mouseVelocity = new Vector(0, 0);

canvas.onmousemove = (e) => {
  mouseX = e.x - 150;
  mouseY = e.y;

  mouseVelocity.x = mouseX - previousMouseX;
  mouseVelocity.y = mouseY - previousMouseY;

  previousMouseX = e.x;
  previousMouseY = e.y;

  mouseVelocity = new Vector(e.movementX, e.movementY);
};

const playSound = false;

var sound = new Howl({
  src: ["assets/bounce2.mp3"],
});

// Howler.volume(0.5);

function handleCollision(ball) {
  if (!playSound) return;
  var id = sound.play();
  // console.log(ball);
  sound.volume((ball.velocity.magnitude / 80) * ball.mass, id);
  sound.fade(1, 0, 100, id);
}

const inputHandler = new InputHandler();

function floatInput(element) {
  return parseFloat(element.value, 3);
}

function checkboxInput(element) {
  return element.checked;
}

inputHandler.addInput(
  "coefficientOfRestitution",
  document.getElementById("coefficientOfRestitution"),
  floatInput,
  undefined
);
inputHandler.addInput(
  "visualizeQuadtreeCheckbox",
  document.getElementById("visualizeQuadtree"),
  checkboxInput,
  undefined
);
inputHandler.addInput(
  "gravityEnabledCheckbox",
  document.getElementById("gravityEnabledCheckbox"),
  checkboxInput,
  undefined,
  undefined,
  (e, value) => {
    if (value) accelerationInput.classList.add("disabled");
    else accelerationInput.classList.remove("disabled");
  }
);

inputHandler.addInput(
  "spawnSizeMin",
  document.getElementById("spawnSizeMinInput"),
  floatInput,
  undefined
);
inputHandler.addInput(
  "spawnSizeMax",
  document.getElementById("spawnSizeMaxInput"),
  floatInput,
  undefined
);
inputHandler.addInput(
  "spawnRadius",
  document.getElementById("spawnRadius"),
  floatInput,
  undefined
);
inputHandler.addInput(
  "accelerationX",
  document.getElementById("accelerationInputX"),
  floatInput,
  undefined
);
inputHandler.addInput(
  "accelerationY",
  document.getElementById("accelerationInputY"),
  floatInput,
  undefined
);
inputHandler.addInput(
  "spawnAmount",
  document.getElementById("spawnAmountInput"),
  floatInput,
  undefined
);

var mouseX = 0;
var mouseY = 0;

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
    handleCollision.bind(this)
  );
});

var lastCalledTime = 1;
var fps = 0;

ballHandler.addBall(new Ball(100, 100, new Vector(4, 4), 100, [255, 255, 255]));

function draw() {
  inputHandler.updateInputs();
  ballHandler.bounceCoefficient = inputHandler.getValue(
    "coefficientOfRestitution"
  );
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
            new Vector(mouseX + randomOffset.x, mouseY + randomOffset.y),
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
        ball.newVelocity = Vector.subtract(
          new Vector(mouseX, mouseY),
          ball.position
        )
          .normalize()
          .multiply(
            Vector.distance(new Vector(mouseX, mouseY), ball.position) ** 1.3
          );
        // ball.newVelocity = ball.velocity;
        console.log(ball);
        break;
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ballHandler.update(Math.min(2, delta), applyAcceleration);
  if (inputHandler.getValue("visualizeQuadtreeCheckbox"))
    drawQuadtree(ballHandler.quadtree, ctx);

  requestAnimationFrame(draw);
}

draw();
