//File: vector.js
//Author: Martin Terner
//Date: 2024-02-22
//Description: Vector class for simple 2d vector calculations

/**
 * Vector class for simple 2d vector calculations.
 *
 *
 * @class Vector
 * @typedef {Vector}
 */
class Vector {
  /**
   * Creates an instance of Vector.
   *
   * @constructor
   * @param {Number} x - x coordinate of vector
   * @param {Number} y - y coordinate of vector
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * calculates the magnitude/length of the vector
   *
   * @readonly
   * @type {*}
   * @returns {number}
   */
  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  /**
   * calculates the dotProduct of two vectors
   *
   * @static
   * @param {Vector} v1
   * @param {Vector} v2
   * @returns {number}
   */
  static dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * clones a vector/creates a new one with the same coords.
   *
   * @returns {Vector}
   */
  copy() {
    return new Vector(this.x, this.y);
  }

  /**
   * normalizes the vector to unit length.
   *
   * @returns {this}
   */
  normalize() {
    const magnitude = this.magnitude;
    if (magnitude === 0) return this;
    this.x /= magnitude;
    this.y /= magnitude;
    return this;
  }

  /**
   * multiplies vector by scalar or other vector
   *
   * @param {*} scalar
   * @returns {this}
   */
  multiply(scalar) {
    this.x *= scalar.x ?? scalar;
    this.y *= scalar.y ?? scalar;
    return this;
  }
  /**
   * divides vector by scalar or other vector
   *
   * @param {*} scalar
   * @returns {this}
   */
  divide(scalar) {
    this.x /= scalar.x ?? scalar;
    this.y /= scalar.y ?? scalar;
    return this;
  }
  /**
   * adds vector with scalar or other vector
   *
   * @param {*} scalar
   * @returns {this}
   */
  add(scalar) {
    this.x += scalar.x ?? scalar;
    this.y += scalar.y ?? scalar;
    return this;
  }

  /**
   * subtracts vector with scalar or other vector
   *
   * @param {*} scalar
   * @returns {this}
   */
  subtract(scalar) {
    this.x -= scalar.x ?? scalar;
    this.y -= scalar.y ?? scalar;
    return this;
  }

  /**
   * calculates distance between two vectors
   *
   * @static
   * @param {Vector} v1 - first vector
   * @param {Vector} v2 - second vector
   * @returns {Number}
   */
  static distance(v1, v2) {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
  }

  /**
   * adds two vectors
   *
   * @param {Vector} v1 - first vector
   * @param {Vector} v2 - second vector
   * @returns {this}
   */
  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  /**
   * multiplies vector by scalar
   *
   * @static
   * @param {Vector} v1
   * @param {Number} scalar
   * @returns {Vector}
   */
  static scale(v1, scalar) {
    return new Vector(v1.x * scalar, v1.y * scalar);
  }

  /**
   * multiplies two vectors
   *
   * @static
   * @param {Vector} v1 - first vector
   * @param {Vector} v2 - second vector
   * @returns {Vector}
   */
  static multiply(v1, v2) {
    return new Vector(v1.x * v2.x, v1.y * v2.y);
  }

  /**
   * subtracts two vectors
   *
   * @static
   * @param {Vector} v1 - first vector
   * @param {Vector} v2 - second vector
   * @returns {Vector}
   */
  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  /**
   * calculates the distance between two vectors
   *
   * @static
   * @param {Vector} v1 - first vector
   * @param {Vector} v2 - second vector
   * @returns {Number}
   */
  static distance(v1, v2) {
    return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
  }
}
