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
  }

  multiply(scalar) {
    this.x *= scalar.x ?? scalar;
    this.y *= scalar.y ?? scalar;
  }
  add(scalar) {
    this.x += scalar.x ?? scalar;
    this.y += scalar.y ?? scalar;
  }

  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }
}
