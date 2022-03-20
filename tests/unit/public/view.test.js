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

  function makeClassListElement(
    { classes } = { classes: [] }
  ) {
    const classList = new Set(classes);
    classList.contains = classList.has;
    classList.remove = classList.delete;
    return classList;
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
      view.changeCommandButtonsVisibility();

      expect(button.classList.add).toHaveBeenCalledWith("unassigned");
      expect(button.onclick.name).toStrictEqual("resetOnClick");
      expect(() => button.onclick()).not.toThrow();
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
    test('should call the functions', async () => {
      const view = new View();
      jest.spyOn(view, 'onBtnClick').mockResolvedValue();
      jest.spyOn(view, 'toggleBtnStart').mockReturnValue();
      jest.spyOn(view, 'changeCommandButtonsVisibility').mockReturnValue();
      jest.spyOn(view, 'isNotUnassignedButton').mockReturnValue(true);
      jest.spyOn(view, 'setupBtnAction').mockReturnValue();

      const text = 'Start';
      const button = mockButtonElement({ text });
      jest.spyOn(document, 'querySelectorAll').mockReturnValueOnce([button]);

      const eventOnClick = { srcElement: button };
      await view.onStartClicked(eventOnClick);

      expect(view.toggleBtnStart).toHaveBeenCalled();
      expect(view.onBtnClick).toHaveBeenCalledWith(text);
      expect(view.changeCommandButtonsVisibility).toHaveBeenCalledWith(false);
      expect(view.isNotUnassignedButton).toHaveBeenNthCalledWith(1, button);
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

  describe('setupBtnAction()', () => {
    test('text = start  - should do nothing', () => {
      const view = new View();
      const button = mockButtonElement({ text: 'start' });
      jest.spyOn(view, view.onStopBtn.name).mockReturnValue();
      jest.spyOn(view, view.onCommandClick.name).mockReturnValue();

      view.setupBtnAction(button);

      expect(view.onStopBtn).not.toHaveBeenCalled();
      expect(view.onCommandClick).not.toHaveBeenCalled();
    });
    
    test('text = stop - should call onStopBtn', () => {
      const view = new View();
      const button = mockButtonElement({ text: 'stop' });
      jest.spyOn(view, view.onStopBtn.name).mockReturnValue();

      view.setupBtnAction(button);

      expect(button.onclick.name).toStrictEqual(view.onStopBtn.bind(view).name);
    });
    
    test('text = command - should call onCommandClick', () => {
      const view = new View();
      const button = mockButtonElement({ text: 'command' });
      jest.spyOn(view, view.onCommandClick.name).mockReturnValue();

      view.setupBtnAction(button);

      expect(button.onclick.name).toStrictEqual(view.onCommandClick.bind(view).name);
    });
  });

  describe('onStopBtn()', () => {
    test('', async () => {
      const view = new View();
      const text = 'button text';
      const button = mockButtonElement({ text });
      jest.spyOn(view, 'toggleBtnStart').mockReturnValue();
      jest.spyOn(view, 'changeCommandButtonsVisibility')
        .mockReturnValue();
      jest.spyOn(view, 'onBtnClick').mockResolvedValue();

      await view.onStopBtn({ srcElement: button });

      expect(view.toggleBtnStart).toHaveBeenCalledWith(false);
      expect(view.changeCommandButtonsVisibility).toHaveBeenCalled();
      expect(view.onBtnClick).toHaveBeenCalledWith(text);
    });
  });

  describe('isNotUnassignedButton()', () => {
    test('should return false if CSS class has unassigned', () => {
      const view = new View();
      const button = mockButtonElement({ 
        classList: makeClassListElement(
          { classes: [...view.ignoreButtons.values()] }
        )
      });
      const result = view.isNotUnassignedButton(button);
      expect(result).toBeFalsy();
    });

    test('should return true if CSS class does not have unassigned', () => {
      const view = new View();
      const button = mockButtonElement({ 
        classList: makeClassListElement(
          { classes: ['whatever'] }
        )
      });
      const result = view.isNotUnassignedButton(button);
      expect(result).toBeTruthy();
    });
  });

  describe('onCommandClick()', () => {
    test('', async () => {
      const view = new View();
      const text = 'command';
      const button = mockButtonElement({ text });
      const onClickElement = { srcElement: button };
      jest.spyOn(view, 'toggleDisableCommandBtn').mockReturnValue();
      jest.spyOn(view, 'onBtnClick').mockResolvedValue();
      jest.useFakeTimers();

      await view.onCommandClick(onClickElement);
      jest.advanceTimersByTime(view.DISABLE_BTN_TIMEOUT);

      expect(view.toggleDisableCommandBtn)
        .toHaveBeenNthCalledWith(1, onClickElement.srcElement.classList);
      expect(view.onBtnClick)
        .toHaveBeenCalledWith(text);
      expect(view.toggleDisableCommandBtn)
        .toHaveBeenNthCalledWith(2, onClickElement.srcElement.classList);
    });
  });

  describe('toggleDisableCommandBtn()', () => {
    test('should remove active class', () => {
      const view = new View();
      const classList = makeClassListElement({ classes: ['active'] });
      view.toggleDisableCommandBtn(classList);
      expect(classList.size).toBeFalsy();
      expect(classList.has('active')).toBeFalsy();
    });

    test('should add active class', () => {
      const view  = new View();
      const classList = makeClassListElement();
      view.toggleDisableCommandBtn(classList);
      expect(classList.size).toStrictEqual(1);
      expect([...classList.values()]).toStrictEqual(['active']);
    });
  });

  describe('constructor()', () => {
    test('should onBtnClick not throw', () => {
      const view = new View();
      expect(() => view.onBtnClick('test')).not.toThrow();
    });
  });
});
