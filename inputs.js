class InputHandler {
  constructor() {
    this.inputs = {};
  }

  addInput(
    name,
    element,
    getValue,
    value,
    fallbackValue = undefined,
    onInput = undefined
  ) {
    this.inputs[name] = {
      fallbackValue: fallbackValue,
      getValue: getValue.bind(this, element),
      value: value,
    };

    if (onInput) {
      element.addEventListener("change", (e) => {
        onInput(e, this.updateInput(name));
      });
    }
  }

  updateInput(name) {
    const fallbackValue = this.inputs[name].fallbackValue;
    const previousValue = this.inputs[name].value;
    const getValue = this.inputs[name].getValue;
    var value = getValue.call();

    if (isNaN(value) || value === undefined)
      value = fallbackValue ?? previousValue;

    this.inputs[name].value = value;

    return value;
  }

  getValue(name) {
    return this.inputs[name].value;
  }

  updateInputs() {
    for (const inputName of Object.keys(this.inputs)) {
      this.updateInput(inputName);
    }
  }
}
