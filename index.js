function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

acceleration = new Vector(0, 0);
bounceCoefficient = 0.3;

//? TODO:
// Use p5.js vector class and use it in calculations.
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

function spawnBallAtCursor(
  amount = 1,
  sizeOffset = 0,
  velocity = randomDirection()
) {
  for (amountX = 0; amountX < amount; amountX++) {
    let radius = getRandomArbitrary(2, 6) + sizeOffset;

    ball = new Ball(
      mouseX,
      mouseY,
      velocity,
      radius,
      hsl2rgb((mouseX + mouseY) / 2, 1, 0.5)
    );

    ballHandler.addBall(ball);

    ball.render(ctx);
  }
}

document.addEventListener("keydown", onDocumentKeyDown, true);
document.addEventListener("keyup", onDocumentKeyUp, true);

var time = true;
function onDocumentKeyDown(event) {
  var keyCode = event.keyCode;

  switch (keyCode) {
    case 32:
      time = !time;
      break;

    case 82:
      ballHandler = new bouncyBallHandler(
        canvas.width,
        canvas.height,
        ctx,
        bounceCoefficient
      );
      break;

    case 38:
      spawnAmount = Math.min(100, spawnAmount + 1);
      break;

    case 40:
      spawnAmount = Math.round(Math.max(1, spawnAmount - 1));
      break;

    case 79:
      spawnSize = Math.min(100, spawnSize + 1);
      break;

    case 76:
      spawnSize = Math.round(Math.max(1, spawnSize - 1));
      break;

    case 39:
      if (spawnSpeed < 1) {
        spawnSpeed = Math.round((spawnSpeed + 0.1) * 10) / 10;
      } else {
        spawnSpeed = Math.min(100, spawnSpeed + 1);
      }
      break;
    case 37:
      if (spawnSpeed <= 1) {
        spawnSpeed = Math.round(Math.max(0, spawnSpeed - 0.1) * 10) / 10;
      } else {
        spawnSpeed = Math.round(Math.max(1, spawnSpeed - 1));
      }
      break;
  }
}

function applyAcceleration(ball) {
  ball.velocity.add(acceleration);
}

function onDocumentKeyUp(event) {
  var keyCode = event.keyCode;

  if (keyCode == 82) bouncyBalls = [];

  if (keyCode == 38 || keyCode == 40)
    window.localStorage.setItem("spawnAmount", spawnAmount); //storeItem('spawnAmount', spawnAmount);

  if (keyCode == 39 || keyCode == 37)
    window.localStorage.setItem("spawnSpeed", spawnSpeed); //storeItem('spawnSpeed', spawnSpeed);
}

var mouseDown = false;

var canvas = document.getElementById("canvas");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth - 100;
var ctx = canvas.getContext("2d");

canvas.onmousedown = function () {
  mouseDown = true;
};

canvas.onmouseup = function () {
  //document.body.onmouseup = function()
  mouseDown = false;
};

previousMouseX = 0;
previousMouseY = 0;

mouseVelocity = new Vector(0, 0);

canvas.onmousemove = function (e) {
  console.log(e);
  mouseX = e.x;
  mouseY = e.y;

  mouseVelocity.x = mouseX - previousMouseX;
  mouseVelocity.y = mouseY - previousMouseY;

  previousMouseX = e.x;
  previousMouseY = e.y;

  mouseVelocity = new Vector(e.movementX, e.movementY);

  // mouseVelocity.normalize();

  // console.log(mouseVelocity);

  // console.log(mouseVelocity);
};

ballHandler = new bouncyBallHandler(
  canvas.width,
  canvas.height,
  ctx,
  bounceCoefficient
);

var mouseX = 0;
var mouseY = 0;

var spawnSpeed = window.localStorage.getItem("spawnSpeed") ?? 20;
var spawnAmount = window.localStorage.getItem("spawnAmount") ?? 1;

var spawnSize = window.localStorage.getItem("spawnSize") ?? 10;

ctx.font = "15px Arial";

var lastCalledTime = 1;
var fps = 0;

ballHandler.addBall(new Ball(100, 100, new Vector(4, 4), 100, [255, 255, 255]));

function draw() {
  if (!lastCalledTime) {
    lastCalledTime = Date.now();
    fps = 0;
    return;
  }
  delta = (Date.now() - lastCalledTime) / 1000;
  lastCalledTime = Date.now();
  fps = 1 / delta;

  if (mouseDown) {
    console.log(mouseVelocity);
    velocity = mouseVelocity.copy();
    velocity.add(randomDirection());
    // velocity.normalize();
    velocity.multiply(spawnSpeed);
    spawnBallAtCursor(spawnAmount, spawnSize, velocity);
  }

  if (!time) return requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ballHandler.update(Math.min(2, delta), false, applyAcceleration);

  ctx.fillStyle = `black`;
  ctx.fillText("FPS: " + fps.toFixed(2), 10, canvas.height - 10);
  ctx.fillText("BALLS: " + ballHandler.balls.length, 110, canvas.height - 10);
  ctx.fillText("SPEED: " + spawnSpeed, 210, canvas.height - 10);
  ctx.fillText("BPC: " + spawnAmount, 310, canvas.height - 10);
  ctx.fillText("SIZE: " + spawnSize, 410, canvas.height - 10);
  ctx.fillText("DELTA: " + delta, 510, canvas.height - 10);

  requestAnimationFrame(draw);
}

draw();
