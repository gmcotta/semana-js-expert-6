import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import Controller from "../../../public/controller/js/controller";

describe('#Controller - test suite for controller class', () => {
  const deps = {};

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    test('should call onLoad', () => {
      jest.spyOn(Controller.prototype, Controller.prototype.onLoad.name)
      .mockReturnValue();
      const controller = Controller.initialize(deps);

      expect(Controller.prototype.onLoad).toHaveBeenCalled();
      expect(controller).toStrictEqual(new Controller(deps));
    });
  })
});