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

    jest.spyOn(document, 'getElementById').mockReturnValue(mockButtonElement());
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

  describe('configureOnBtnClick()', () => {
    test('should assign function on this.onBtnClick', () => {
      const view = new View();
      const fn = jest.fn();
      view.configureOnBtnClick(fn);
      expect(view.onBtnClick).toStrictEqual(fn);
    });
  });

  describe('onStartClicked()', () => {
    test.skip('should call the functions', async () => {
      const view = new View()

      jest.spyOn(
        view,
        view.changeCommandButtonsVisibility.name,
      ).mockReturnValue()

      jest.spyOn(
        view,
        view.toggleBtnStart.name,
      ).mockReturnValue()

      jest.spyOn(
        view,
        view.onBtnClick.name,
      ).mockResolvedValue()

      jest.spyOn(
        view,
        "changeCommandBtnsVisibility",
      ).mockReturnValue()

      jest.spyOn(
        view,
        view.isNotUnassignedButton.name,
      ).mockReturnValue(true)

      jest.spyOn(
        view,
        view.setupBtnAction.name,
      ).mockReturnValue()

      const text = 'Start'
      const btn = makeBtnElement({
        text
      })

      jest.spyOn(
        document,
        "querySelectorAll",
      ).mockReturnValueOnce([btn])


      const eventOnClick = {
        srcElement: btn
      }

      await view.onStartClicked(eventOnClick)

      expect(view.toggleBtnStart).toHaveBeenCalled()
      expect(view.onBtnClick).toHaveBeenCalledWith(text)
      expect(view.changeCommandBtnsVisibility).toHaveBeenCalledWith(false)
      expect(view.notIsUnassignedButton).toHaveBeenNthCalledWith(1, btn)

      const [calls] = view.setupBtnAction.mock.calls[0]
      expect(view.setupBtnAction).toBeCalledTimes(1)
      expect(calls).toStrictEqual(btn)
    });
  });

  describe('toggleBtnStart()', () => {
    test('active = true - should hide button', () => {
      const view = new View();
      view.toggleBtnStart();
      expect(view.btnStart.classList.add).toBeCalledWith('hidden');
      expect(view.btnStop.classList.remove).toBeCalledWith('hidden');
    });
    
    test('active = false - should show button', () => {
      const view = new View();
      view.toggleBtnStart(false);
      expect(view.btnStart.classList.remove).toBeCalledWith('hidden');
      expect(view.btnStop.classList.add).toBeCalledWith('hidden');
    });
  });
});
