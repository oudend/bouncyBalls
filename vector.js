class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  static dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  normalize() {
    this.x /= this.magnitude;
    this.y /= this.magnitude;
    return this;
  }

  multiply(scalar) {
    this.x *= scalar.x ?? scalar;
    this.y *= scalar.y ?? scalar;
    return this;
  }
  add(scalar) {
    this.x += scalar.x ?? scalar;
    this.y += scalar.y ?? scalar;
    return this;
  }

  static distance(v1, v2) {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
  }

  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }
}
