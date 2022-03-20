export default class View {
  constructor() {
    this.btnStart = document.getElementById("start");
    this.btnStop = document.getElementById("stop");
    this.buttons = () => Array.from(document.querySelectorAll('button'));
    this.ignoreButtons = new Set(['unassigned']);
    this.DISABLE_BTN_TIMEOUT = 500;
    async function onBtnClick() {}
    this.onBtnClick = onBtnClick;
  }

  onLoad() {
    this.changeCommandButtonsVisibility();
    this.btnStart.onclick = this.onStartClicked.bind(this);
  }

  changeCommandButtonsVisibility(hide = true) {
    Array.from(document.querySelectorAll('[name="command"]')).forEach(
      (button) => {
        const fn = hide ? "add" : "remove";
        button.classList[fn]("unassigned");
        function resetOnClick() {}
        button.onclick = resetOnClick;
      }
    );
  }

  configureOnBtnClick(fn) {
    this.onBtnClick = fn;
  }

  async onStartClicked({
    srcElement: {
      innerText
    }
  }) {
    const btnText = innerText;
    await this.onBtnClick(btnText);
    this.toggleBtnStart();
    this.changeCommandButtonsVisibility(false);
    this.buttons()
      .filter(btn => this.isNotUnassignedButton(btn))
      .forEach(this.setupBtnAction.bind(this));
  }

  toggleBtnStart(active = true) {
    if (active) {
      this.btnStart.classList.add('hidden');
      this.btnStop.classList.remove('hidden');
      return;
    }
    this.btnStart.classList.remove('hidden');
    this.btnStop.classList.add('hidden');
  }

  setupBtnAction(btn) {
    const text = btn.innerText.toLowerCase();
    if (text.includes('start')) return;
    if (text.includes('stop')) {
      btn.onclick = this.onStopBtn.bind(this);
      return;
    }
    btn.onclick = this.onCommandClick.bind(this);
  }

  onStopBtn({
    srcElement: {
      innerText
    }
  }) {
    this.toggleBtnStart(false);
    this.changeCommandButtonsVisibility();
    return this.onBtnClick(innerText);
  }

  isNotUnassignedButton(btn) {
    const classes = Array.from(btn.classList);
    const hasUnassignedButtons = !!classes.find(
      item => this.ignoreButtons.has(item)
    );
    return !hasUnassignedButtons;
  }

  async onCommandClick(btn) {
    const {
      srcElement: {
        classList,
        innerText
      }
    } = btn;
    this.toggleDisableCommandBtn(classList);
    await this.onBtnClick(innerText);
    setTimeout(
      () => this.toggleDisableCommandBtn(classList), 
      this.DISABLE_BTN_TIMEOUT
    );
  }

  toggleDisableCommandBtn(classList) {
    if (!classList.contains('active')) {
      classList.add('active');
      return;
    }
    classList.remove('active');
  }
}
