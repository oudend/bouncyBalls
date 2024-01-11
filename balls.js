class Ball {
  constructor(x, y, velocity, radius, color, mass = radius) {
    this.position = new Vector(x, y);

    this.radius = radius;

    this.mass = mass;

    this.color = color;

    this.velocity = velocity;

    this.uuid = uuidv4();
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
  constructor(width, height, ctx, bounceCoefficient = 0.5, frameRetrieve = 0) {
    this.width = width;
    this.height = height;

    this.ctx = ctx;

    this.balls = [];

    this.quadtree = new Quadtree(
      {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
      },
      undefined
    );

    this.frame = 0;
    this.frameRetrieve = frameRetrieve;

    this.firstFrame = true;

    this.candidates = [];

    this.newBall = false;

    this.bounceCoefficient = bounceCoefficient;
  }

  addBall(ball) {
    this.newBall = true;
    this.balls.push(ball);

    return ball;
  }

  getQuadtreeObject(index) {
    let ball = this.balls[index];

    var myObject = {
      x: ball.position.x,
      y: ball.position.y,
      width: ball.radius + 20, //TODO!:FIX
      height: ball.radius + 20, //TODO!:FIX
      radius: ball.radius,
      index: index,
      uuid: ball.uuid,
    };

    return myObject;
  }

  updateQuadtreePosition(index) {
    this.quadtree.insert(this.getQuadtreeObject(index));
  }

  getQuadtreeCandidates(index) {
    return this.quadtree.retrieve(this.getQuadtreeObject(index));
  }

  calculateVelocity(ball, ball2) {
    var positionDiff = Vector.subtract(ball.position, ball2.position);

    let formula =
      (((this.bounceCoefficient * ball2.mass + ball2.mass) /
        (ball.mass + ball2.mass)) *
        Vector.dotProduct(
          Vector.subtract(ball.velocity, ball2.velocity),
          positionDiff
        )) /
      positionDiff.magnitude ** 2;

    positionDiff.multiply(formula);

    return Vector.subtract(ball.velocity, positionDiff);
  }

  resolveCollision(ballA, ballB) {
    ballA.velocity = this.calculateVelocity(ballA, ballB);
    ballB.velocity = this.calculateVelocity(ballB, ballA);
  }

  //https://codepen.io/gbnikolov/pen/mdLOayQ
  adjustPositions(ballA, ballB, depth) {
    const percent = 0.2;
    const slop = 0.01;

    var corr =
      (Math.max(depth - slop, 0) / (1 / ballA.radius + 1 / ballB.radius)) *
      percent;

    var norm = [
      ballB.position.x - ballA.position.x,
      ballB.position.y - ballA.position.y,
    ];
    var mag = Math.sqrt(norm[0] * norm[0] + norm[1] * norm[1]) * 2;
    norm = [norm[0] / mag, norm[1] / mag];
    let correction = [corr * norm[0], corr * norm[1]];

    if (ballA.position.x - ((1 / ballA.radius) * correction[0]) / 2 > 0)
      ballA.position.x -= ((1 / ballA.radius) * correction[0]) / 2;
    if (ballA.position.y - ((1 / ballA.radius) * correction[1]) / 2 > 0)
      ballA.position.y -= ((1 / ballA.radius) * correction[1]) / 2;
    if (
      ballB.position.x + ((1 / ballB.radius) * correction[0]) / 2 <
      this.width
    )
      ballB.position.x += ((1 / ballB.radius) * correction[0]) / 2;
    if (
      ballB.position.y + ((1 / ballB.radius) * correction[1]) / 2 <
      this.height
    )
      ballB.position.y += ((1 / ballB.radius) * correction[1]) / 2;
  }

  handleCollision(ball, candidates) {
    //if(candidates.length<=1) console.log(candidates)

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

      //console.log(ball, candidate)

      if (intersect) {
        let dx = candidate.x - ball.position.x;
        let dy = candidate.y - ball.position.y;

        this.adjustPositions(
          ball,
          this.balls[candidate.index],
          Math.sqrt(dx * dx + dy * dy)
        );
        this.resolveCollision(ball, this.balls[candidate.index]);
      }
    }
  }

  update(delta, lazy = true, ballUpdate = (ball) => {}) {
    this.frameRetrieve = delta * 100;

    this.quadtree.clear();

    for (let ballIndex = 0; ballIndex < this.balls.length; ballIndex++) {
      let ball = this.balls[ballIndex];

      ballUpdate(ball);

      ball.move(delta);

      ball.color = hsl2rgb((ball.position.x + ball.position.y) / 2, 1, 0.5);

      ball.render(this.ctx);

      this.updateQuadtreePosition(ballIndex);
    }

    for (let ballIndex = 0; ballIndex < this.balls.length; ballIndex++) {
      let ball = this.balls[ballIndex];

      if (
        (this.frame >= this.frameRetrieve ||
          this.firstFrame === true ||
          this.newBall === true) &&
        delta > 0.08 &&
        lazy
      ) {
        //
        this.candidates[ballIndex] = this.getQuadtreeCandidates(ballIndex);

        this.frame = 0;
      } else {
        this.candidates[ballIndex] = this.getQuadtreeCandidates(ballIndex);
      }

      //console.log(typeof this.candidates[ballIndex], this.newBall);
      //f
      this.handleCollision(ball, this.candidates[ballIndex]);

      if (
        ball.radius / 2 + ball.position.x + ball.velocity.x * delta >
        this.width
      )
        ball.velocity.x = -ball.velocity.x * this.bounceCoefficient;

      if (ball.position.x - ball.radius / 2 + ball.velocity.x * delta < 0)
        ball.velocity.x = -ball.velocity.x * this.bounceCoefficient;

      if (
        ball.position.y + ball.radius / 2 + ball.velocity.y * delta >
        this.height
      )
        ball.velocity.y = -ball.velocity.y * this.bounceCoefficient;

      if (ball.position.y - ball.radius / 2 + ball.velocity.y * delta < 0)
        ball.velocity.y = -ball.velocity.y * this.bounceCoefficient;

      if (ball.position.y - ball.radius / 2 < 0) {
        ball.position.y = ball.radius / 2;
      }
      if (ball.position.y + ball.radius / 2 > this.height) {
        ball.position.y = this.height - ball.radius / 2;
      }
      if (ball.position.x - ball.radius / 2 < 0) {
        ball.position.x = ball.radius / 2;
      }
      if (ball.position.x + ball.radius / 2 > this.width) {
        ball.position.x = this.width - ball.radius / 2;
      }
    }

    // if (this.firstFrame || this.newBall) console.log("?", this.frameRetrieve);

    this.frame++;

    this.firstFrame = false;
    this.newBall = false;
  }
}