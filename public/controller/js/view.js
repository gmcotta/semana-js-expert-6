export default class View {
  onLoad() {
    this.changeCommandButtonsVisibility();
  }
  changeCommandButtonsVisibility(hide = true) {
    Array.from(document.querySelectorAll('[name="command"]'))
      .forEach(button => {
        const fn = hide ? 'add' : 'remove';
        button.classList[fn]('unassigned');
        function resetOnClick() {};
        button.onclick = resetOnClick;
      });
  }
}