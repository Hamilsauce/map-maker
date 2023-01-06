export class Vector {
  #x = null;
  #y = null;

  constructor(x, y) {
    this.#x = x;

    this.#y = y;
  }

  get x() { return this.#x };

  get y() { return this.#y };
}