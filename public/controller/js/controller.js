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
    this.view.configureOnBtnClick(this.commandReceived.bind(this));
    this.view.onLoad();
  }

  async commandReceived(text) {
    const result = await this.service.makeRequest({
      command: text.toLowerCase()
    });
    return result;
  }
}