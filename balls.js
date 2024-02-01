function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

class Ball {
  constructor(x, y, velocity, radius, color, mass = radius) {
    this.position = new Vector(x, y);

    this.radius = radius;

    this.mass = mass;

    this.color = color;

    this.velocity = velocity;

    this.newVelocity = velocity;
    this.newPosition = new Vector(x, y);

    this.uuid = uuidv4();

    this.index = -1;
  }

  intersects(x, y, r) {
    return (
      Math.hypot(this.position.x - x, this.position.y - y) <=
      this.radius / 2 + r
    );
  }

  move(delta) {
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius / 2, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},1)`;
    ctx.fill();
  }
}

class bouncyBallHandler {
  constructor(
    width,
    height,
    ctx,
    bounceCoefficient = 0.5,
    frameRetrieve = 0,
    onCollision,
    wrapAround = true
  ) {
    this.width = width;
    this.height = height;

    this.ctx = ctx;

    this.balls = [];

    this.wrapAround = wrapAround;

    this.quadtree = new Quadtree(
      {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      },
      5
    );

    this.frame = 0;
    this.frameRetrieve = frameRetrieve;

    this.firstFrame = true;

    this.candidates = [];

    this.newBall = false;

    this.onCollision = onCollision;

    this.bounceCoefficient = bounceCoefficient;
  }

  removeBall(ball) {
    this.balls.splice(this.balls.indexOf(ball), 1);
    // this.balls[ball.index] = undefined;
  }

  addBall(ball) {
    this.newBall = true;
    this.balls.push(ball);

    this.balls.index = this.balls.length - 1;

    return ball;
  }

  getQuadtreeObject(index) {
    let ball = this.balls[index];

    var myObject = {
      x: ball.position.x,
      y: ball.position.y,
      width: ball.radius,
      height: ball.radius,
      radius: ball.radius,
      index: index,
      uuid: ball.uuid,
    };

    return myObject;
  }

  updateQuadtreePosition(index) {
    this.quadtree.insert(this.getQuadtreeObject(index));
  }

  getQuadtreeCandidates(position, width, height) {
    return this.quadtree.retrieve({
      x: position.x,
      y: position.y,
      width: width,
      height: height,
    });
  }

  calculateVelocity(ball, ball2) {
    var positionDiff = Vector.subtract(ball.position, ball2.position);

    let formula =
      (((this.bounceCoefficient * ball2.mass + ball2.mass) /
        (ball.mass + ball2.mass)) *
        Vector.dotProduct(
          Vector.subtract(ball.newVelocity, ball2.newVelocity),
          positionDiff
        )) /
      positionDiff.magnitude ** 2;

    positionDiff.multiply(formula);

    return Vector.subtract(ball.newVelocity, positionDiff);
  }

  resolveCollision(ballA, ballB) {
    let ballAvelocity = this.calculateVelocity(ballA, ballB);
    ballB.newVelocity = this.calculateVelocity(ballB, ballA);

    ballA.newVelocity = ballAvelocity;
  }

  //https://codepen.io/gbnikolov/pen/mdLOayQ
  adjustPositions(ballA, ballB, depth) {
    // var norm = Vector.subtract(ballB.position, ballA.position);
    // // norm = Vector.scale(
    // //   norm.normalize(),
    // //   Vector.distance(ballA.position, ballB.position)
    // // );
    // norm.normalize();
    // var distBetweenRadii =
    //   Vector.distance(ballA.position, ballB.position) -
    //   ballA.radius / 2 -
    //   ballB.radius / 2;
    // norm.multiply(distBetweenRadii / (ballA.mass + ballB.mass));

    // ballA.newPosition.add(Vector.scale(norm, ballB.mass));
    // ballB.newPosition.add(Vector.scale(norm, -1 * ballA.mass));

    // return;

    var percent = 0.2;
    // percent = 1 / Vector.distance(ballA.position, ballB.position);
    const slop = 0.01;

    var corr =
      (Math.max(depth - slop, 0) / (1 / ballA.radius + 1 / ballB.radius)) *
      percent;

    var norm = Vector.subtract(ballB.position, ballA.position);
    norm.normalize();

    let correction = new Vector(corr * norm.x, corr * norm.y);

    ballA.newPosition.x -=
      (1 / ballA.radius) *
      correction.x *
      (ballB.mass / (ballA.mass + ballB.mass));
    ballA.newPosition.y -=
      (1 / ballA.radius) *
      correction.y *
      (ballB.mass / (ballA.mass + ballB.mass));
    ballB.newPosition.x +=
      (1 / ballB.radius) *
      correction.x *
      (ballA.mass / (ballA.mass + ballB.mass));
    ballB.newPosition.y +=
      (1 / ballB.radius) *
      correction.y *
      (ballA.mass / (ballA.mass + ballB.mass));
  }

  handleCollision(ball, candidates) {
    for (
      let candidateIndex = 0;
      candidateIndex < candidates.length;
      candidateIndex++
    ) {
      var candidate = candidates[candidateIndex];

      if (ball.uuid == candidate.uuid) continue;

      let intersect = ball.intersects(
        candidate.x,
        candidate.y,
        candidate.radius / 2
      );

      if (intersect) {
        let dx = candidate.x - ball.position.x;
        let dy = candidate.y - ball.position.y;

        var ball2 = this.balls[candidate.index];

        if (dx < 0) {
          if (this.onCollision) this.onCollision(ball);

          this.adjustPositions(
            ball,
            this.balls[candidate.index],
            Math.sqrt(dx * dx + dy * dy)
          );
          this.resolveCollision(ball, this.balls[candidate.index]);
        }
      }
    }
  }

  update(delta, ballUpdate = (ball) => {}) {
    this.frameRetrieve = delta * 100;

    this.quadtree.clear();

    for (let ballIndex = 0; ballIndex < this.balls.length; ballIndex++) {
      let ball = this.balls[ballIndex];

      ball.position = ball.newPosition;
      ball.velocity = ball.newVelocity;

      ballUpdate(ball);

      ball.move(delta);

      ball.color = hsl2rgb((ball.position.x + ball.position.y) / 2, 1, 0.5);

      ball.render(this.ctx);

      this.updateQuadtreePosition(ballIndex);
    }

    for (let ballIndex = 0; ballIndex < this.balls.length; ballIndex++) {
      let ball = this.balls[ballIndex];

      this.candidates[ballIndex] = this.getQuadtreeCandidates(
        ball.position,
        ball.radius,
        ball.radius
      );

      this.handleCollision(ball, this.candidates[ballIndex]);

      if (this.wrapAround) {
        ball.position.x = ball.position.x % this.width;
        ball.position.y = ball.position.y % this.height;
        if (ball.position.x < 0) {
          ball.position.x = this.width - ball.position.x;
        }
        if (ball.position.y < 0) {
          ball.position.y = this.height - ball.position.y;
        }
        continue;
      }

      if (
        ball.radius / 2 + ball.position.x + ball.velocity.x * delta >
        this.width
      ) {
        ball.newVelocity.x = -ball.velocity.x * this.bounceCoefficient;
        this.onCollision(ball);
      }

      if (ball.position.x - ball.radius / 2 + ball.velocity.x * delta < 0) {
        ball.newVelocity.x = -ball.velocity.x * this.bounceCoefficient;
        this.onCollision(ball);
      }

      if (
        ball.position.y + ball.radius / 2 + ball.velocity.y * delta >
        this.height
      ) {
        ball.newVelocity.y = -ball.velocity.y * this.bounceCoefficient;
        this.onCollision(ball);
      }

      if (ball.position.y - ball.radius / 2 + ball.velocity.y * delta < 0) {
        ball.newVelocity.y = -ball.velocity.y * this.bounceCoefficient;
        this.onCollision(ball);
      }

      if (ball.position.y - ball.radius / 2 < 0) {
        ball.newPosition.y = ball.radius / 2;
      }
      if (ball.position.y + ball.radius / 2 > this.height) {
        ball.newPosition.y = this.height - ball.radius / 2;
      }
      if (ball.position.x - ball.radius / 2 < 0) {
        ball.newPosition.x = ball.radius / 2;
      }
      if (ball.position.x + ball.radius / 2 > this.width) {
        ball.newPosition.x = this.width - ball.radius / 2;
      }
    }
    // if (this.firstFrame || this.newBall) console.log("?", this.frameRetrieve);

    this.frame++;

    this.firstFrame = false;
    this.newBall = false;
  }
}
