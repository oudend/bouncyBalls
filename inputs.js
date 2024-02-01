class InputHandler {
  constructor() {
    this.inputs = {};
  }

  addContainer(inputContainer) {
    const inputElements = inputContainer.querySelectorAll("*.input");
    for (const element of inputElements) {
      const type = element.classList[0];
      switch (type) {
        case "checkboxInput":
          const checkbox = element.querySelector("input[type=checkbox]");
          this.addInput(
            checkbox.id,
            checkbox,
            InputHandler.checkboxInput,
            checkbox.checked,
            checkbox.checked
          );
          break;
        case "floatInput":
          const float = element.querySelector("input[type=number]");
          this.addInput(
            float.id,
            float,
            InputHandler.floatInput,
            InputHandler.floatInput(float),
            InputHandler.floatInput(float)
          );
          break;
        case "vectorInput":
        case "rangeInput":
          const floats = element.querySelectorAll("input[type=number]");
          const float1 = floats[0];
          const float2 = floats[1];
          this.addInput(
            float1.id,
            float1,
            InputHandler.floatInput,
            InputHandler.floatInput(float1),
            InputHandler.floatInput(float1)
          );
          this.addInput(
            float2.id,
            float2,
            InputHandler.floatInput,
            InputHandler.floatInput(float2),
            InputHandler.floatInput(float2)
          );
          break;
      }
    }
  }

  static floatInput(element) {
    return parseFloat(element.value, 3);
  }

  static checkboxInput(element) {
    return element.checked;
  }

  setCallback(name, onInput) {
    this.inputs[name].onInput = onInput;
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
      onInput: onInput,
    };

    // if (onInput) {
    element.addEventListener("change", (e) => {
      if (this.inputs[name].onInput)
        this.inputs[name].onInput(e, this.updateInput(name));
    });
    // }
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
