export default class Controller {
  constructor({ view, service }) {
    this.view = view;
    this.service = service;
  }

  static initialize(deps) {
    const controller = new Controller(deps);
    controller.onLoad();
    return controller;
  }

  onLoad() {
    this.view.onLoad()
  }
}