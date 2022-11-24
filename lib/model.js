export class Model {
  #name;

  constructor(name) {
    this.#name = name;
  }

  static create(data) {}

  assign(data = {}) {
    Object.entries(data)
      .forEach(([key, value], i) => {
        this[key] = value;
      });
      
    return this;
  }

  update() {}

  emit() {}
  
  validate(property, value) {}

  get name() { return this.#name };
}
