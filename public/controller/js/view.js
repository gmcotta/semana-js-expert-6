export default class View {
  constructor() {
    this.btnStart = document.getElementById("start");
    this.btnStop = document.getElementById("stop");
    this.buttons = () => Array.from(document.querySelectorAll('button'));
    this.ignoreButtons = new Set(['unassigned']);
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
}
