import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import { JSDOM } from "jsdom";

import View from "../../../public/controller/js/view";

describe("#View - test suite for presentation layer", () => {
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.window = dom.window;

  function mockButtonElement(
    { text, classList } = {
      text: "",
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    }
  ) {
    return {
      onclick: jest.fn(),
      classList,
      innerText: text,
    };
  }

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    // jest.spyOn(document, document.getElementById.name)
    //   .mockReturnValue(mockButtonElement());
  });

  describe("changeCommandButtonsVisibility()", () => {
    test("hide = true - should add unassigned button class and reset onclick", () => {
      const view = new View();
      const button = mockButtonElement();
      jest.spyOn(document, "querySelectorAll").mockReturnValue([button]);
      view.changeCommandButtonsVisibility(true);

      expect(button.classList.add).toHaveBeenCalledWith("unassigned");
      expect(button.onclick.name).toStrictEqual("resetOnClick");
      expect(() => button.onclick).not.toThrow();
    });
    test("hide = false - should remove unassigned button class and reset onclick", () => {
      const view = new View();
      const button = mockButtonElement();
      jest.spyOn(document, "querySelectorAll").mockReturnValue([button]);
      view.changeCommandButtonsVisibility(false);

      expect(button.classList.add).not.toHaveBeenCalled();
      expect(button.classList.remove).toHaveBeenCalledWith("unassigned");
      expect(button.onclick.name).toStrictEqual("resetOnClick");
      expect(() => button.onclick).not.toThrow();
    });
  });

  describe("onLoad()", () => {
    test("should call changeCommandButtonsVisibility()", () => {
      const view = new View();
      jest
        .spyOn(
          View.prototype,
          View.prototype.changeCommandButtonsVisibility.name
        )
        .mockReturnValue();
      view.onLoad();
      expect(view.changeCommandButtonsVisibility).toHaveBeenCalled();
    });
  });
});
