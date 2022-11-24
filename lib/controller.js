export class Controller {
  #name;
  #view;
  #model;
  #events = new Map();

  constructor(name, { view, model }) {
    this.#name = name;

  }
  
  create(name, { view, model }) {
    if (!name) return;

    const c = new Controller(name, view, model)

    if (view) {}

    if (model) {}

    return c;
  }

  get events() { return this.#events };

  get view() { return this.#view };

  get model() { return this.#model };

  set events(newValue) { this.#events = newValue };

  setModel(model) { if (!!model) this.#model = model; }

  setView(view) { if (!!view) this.#view = view; }

  createEventStream(eventType, options = {}) {
    if (eventType) return;

    this.#events.set(eventType)

  }
}