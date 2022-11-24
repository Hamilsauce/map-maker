export class View {
  #name;
  // #self;

  constructor(name) {
    this.#name = name;
  }

  update() {}

  emit() {}

  get name() { return this.#name };
}
