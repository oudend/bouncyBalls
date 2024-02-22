//File: balls.js
//Author: Martin Terner
//Date: 2024-02-22
//Description: Ball classes for handling the balls.

/**
 * uuid generating function
 *
 * @returns {String} uuid
 */
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

/**
 * Ball class used for drawing and moving balls as well as storing some ball related data among other things
 *
 * @class Ball
 * @typedef {Ball}
 */
class Ball {
  /**
   * Creates an instance of Ball.
   *
   * @constructor
   * @param {*} x - x cooordinate of balls position
   * @param {*} y - y cooordinate of balls position
   * @param {Vector} velocity - velocity of ball
   * @param {Number} radius - radius of ball
   * @param {*} color - color of ball
   * @param {Number} [mass=radius] - mass of ball(defaults to radius)
   */
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

  /**
   * Returns whether or not the ball intersects with another ball with the given values
   *
   * @param {*} x - x coordinate of ball to compare to
   * @param {*} y - y coordinate of ball to compare to
   * @param {*} r - radius of ball to compare to
   * @returns {boolean}
   */
  intersects(x, y, r) {
    return (
      Math.hypot(this.position.x - x, this.position.y - y) <=
      this.radius / 2 + r
    );
  }

  /**
   * Moves the ball based on its velocity and a delta
   *
   * @param {Number} delta
   */
  move(delta) {
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
  }

  /**
   * renders the ball to a ctx
   *
   * @param {*} ctx
   */
  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius / 2, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},1)`;
    ctx.fill();
  }
}

/**
 * BouncyBallHandler class that handles collision calculations and such as well as storing all the balls.
 *
 * @class bouncyBallHandler
 * @typedef {bouncyBallHandler}
 */
class bouncyBallHandler {
  /**
   * Creates an instance of bouncyBallHandler.
   *
   * @constructor
   * @param {*} width - width of the domain
   * @param {*} height - height of the domain
   * @param {*} ctx - ctx of the canvas to draw to
   * @param {number} [bounceCoefficient=0.5] - coefficient of restitution
   * @param {*} onCollision - function to call when a collision is detected
   * @param {() => boolean} [onIntersect=() => { return true; }] - function to call when a ball intersects with another ball
   * @param {boolean} [wrapAround=true] - whether or not to wrap around the domain when a ball goes out of bounds.
   */
  constructor(
    width,
    height,
    ctx,
    bounceCoefficient = 0.5,
    onCollision,
    onIntersect = () => {
      return true;
    },
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

    this.firstFrame = true;

    this.candidates = [];

    this.newBall = false;

    this.onCollision = onCollision;

    this.onIntersect = onIntersect;

    this.bounceCoefficient = bounceCoefficient;
  }

  /**
   * removes the ball from the ballHandler.
   *
   * @param {*} ball
   */
  removeBall(ball) {
    this.balls.splice(this.balls.indexOf(ball), 1);
  }

  /**
   * adds a ball to the ballHandler.
   *
   * @param {*} ball
   * @returns {*}
   */
  addBall(ball) {
    this.newBall = true;
    this.balls.push(ball);

    this.balls.index = this.balls.length - 1;

    return ball;
  }

  /**
   * gets quadtree object for a ball based on its index which includes data for the quadtree library
   *
   * @param {*} index
   * @returns {{ x: any; y: any; width: any; height: any; radius: any; index: any; uuid: any; }}
   */
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

  /**
   * updates the position of a ball in the quadtree based on its index.
   *
   * @param {*} index
   */
  updateQuadtreePosition(index) {
    this.quadtree.insert(this.getQuadtreeObject(index));
  }

  /**
   * retrieves quadtree candidates/nearby elements based on position, width and height.
   *
   * @param {Vector} position
   * @param {Number} width
   * @param {Number} height
   * @returns {*}
   */
  getQuadtreeCandidates(position, width, height) {
    return this.quadtree.retrieve({
      x: position.x,
      y: position.y,
      width: width,
      height: height,
    });
  }

  /**
   * calculates the velocity for a ball.
   *
   * @param {*} ball - the ball whose velocity will be calculated.
   * @param {*} ball2 - the ball whose velocity will be used to calculate the velocity of ball.
   * @returns {Vector}
   */
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

  /**
   * recalculates the velocity for two balls assuming they collide.
   *
   * @param {*} ballA
   * @param {*} ballB
   */
  resolveCollision(ballA, ballB) {
    let ballAvelocity = this.calculateVelocity(ballA, ballB);
    ballB.newVelocity = this.calculateVelocity(ballB, ballA);

    ballA.newVelocity = ballAvelocity;
  }

  //https://codepen.io/gbnikolov/pen/mdLOayQ
  /**
   * code to smoothly adjust the positions of intersecting balls over multiple frames based on codepen above.
   *
   * @param {*} ballA - first ball
   * @param {*} ballB - second ball
   * @param {Number} depth - depth
   */
  adjustPositions(ballA, ballB, depth) {
    var percent = 0.2;
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
      Math.max(ballB.mass / (ballA.mass + ballB.mass), 0);
    ballA.newPosition.y -=
      (1 / ballA.radius) *
      correction.y *
      Math.max(ballB.mass / (ballA.mass + ballB.mass), 0);
    ballB.newPosition.x +=
      (1 / ballB.radius) *
      correction.x *
      Math.max(ballA.mass / (ballA.mass + ballB.mass), 0);
    ballB.newPosition.y +=
      (1 / ballB.radius) *
      correction.y *
      Math.max(ballA.mass / (ballA.mass + ballB.mass), 0);
  }

  /**
   * checks ball and candidates for intersection and handles accordingly.
   *
   * @param {*} ball
   * @param {*} candidates
   */
  handleCollision(ball, candidates) {
    for (
      let candidateIndex = 0;
      candidateIndex < candidates.length;
      candidateIndex++
    ) {
      var candidate = candidates[candidateIndex];

      if (ball.uuid === candidate.uuid) continue;

      let intersect = ball.intersects(
        candidate.x,
        candidate.y,
        candidate.radius / 2
      );

      if (intersect) {
        let dx = candidate.x - ball.position.x;
        let dy = candidate.y - ball.position.y;

        var ball2 = this.balls[candidate.index];

        if (ball2 === undefined) return;

        if (!this.onIntersect(ball, ball2)) {
          return;
        }

        if (dx < 0) {
          if (this.onCollision) this.onCollision(ball);

          this.adjustPositions(ball, ball2, Math.sqrt(dx * dx + dy * dy));
          this.resolveCollision(ball, ball2);
        }
      }
    }
  }

  /**
   * updates the entire simulation
   *
   * @param {Number} delta - delta time
   * @param {(ball: any) => void} [ballUpdate=(ball) => {}]
   */
  update(delta, ballUpdate = (ball) => {}) {
    //clears quadtree and sets the position of all balls in the quadtree again, effectively updating their positions
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

    //gets candidates and handles collisions as well as boundary bounces for all balls.
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

    this.frame++;

    this.firstFrame = false;
    this.newBall = false;
  }
}
