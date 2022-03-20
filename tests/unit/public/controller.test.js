import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import Controller from "../../../public/controller/js/controller";
import Service from "../../../public/controller/js/service";
import View from "../../../public/controller/js/view";

describe('#Controller - test suite for controller class', () => {
  const deps = {
    view: {
      configureOnBtnClick: jest.fn(),
      onLoad: jest.fn()
    },
    service: {
      makeRequest: jest.fn()
    }
  };

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('initialize()', () => {
    test('should call onLoad', () => {
      jest.spyOn(Controller.prototype, Controller.prototype.onLoad.name)
      .mockReturnValue();
      const controller = Controller.initialize(deps);

      expect(Controller.prototype.onLoad).toHaveBeenCalled();
      expect(controller).toStrictEqual(new Controller(deps));
    });
  });

  describe('onLoad()', () => { 
    test('should call view functions', () => {
      const controller = new Controller(deps);
      controller.onLoad();
      expect(deps.view.configureOnBtnClick).toHaveBeenCalled();
      expect(deps.view.onLoad).toHaveBeenCalled();
    });
  });

  describe('commandReceived()', () => {
    test('should return response from service', async () => {
      const text = 'COMMAND';
      const expectedCommand = { command: 'command' };
      const controller = new Controller(deps);
      await controller.commandReceived(text);
      
      expect(deps.service.makeRequest).toHaveBeenCalledWith(expectedCommand);
    });
  });
});
