//File: inputs.js
//Author: Martin Terner
//Date: 2024-02-22
//Description: class for handling the inputs from html and easily using them in js with minimal code

/**
 * class for handling the inputs from html and easily using them in js with minimal code
 *
 * @class InputHandler
 * @typedef {InputHandler}
 */
class InputHandler {
  /**
   * Creates an instance of InputHandler.
   *
   * @constructor
   */
  constructor() {
    this.inputs = {};
  }

  /**
   * function to add a container of inputs to the input handler, automatically adds onInput functions and such and adds all the inputs to the input object.
   *
   * @param {*} inputContainer
   */
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

  /**
   * utility function to parse the value from a floatInput element
   *
   * @static
   * @param {*} element
   * @returns {Number}
   */
  static floatInput(element) {
    return parseFloat(element.value, 3);
  }

  /**
   * utility function to parse the value from a checkboxInput element.
   *
   * @static
   * @param {*} element
   * @returns {Boolean}
   */
  static checkboxInput(element) {
    return element.checked;
  }

  /**
   * sets the callback function for a input based on its name
   *
   * @param {*} name - name of the input
   * @param {*} onInput - callback function
   */
  setCallback(name, onInput) {
    this.inputs[name].onInput = onInput;
  }

  /**
   * adds a input to the input handler based on arguments
   *
   * @param {*} name - name of the input
   * @param {*} element - the html element of the input
   * @param {*} getValue - getValue function for the input
   * @param {*} value - current value of the input.
   * @param {*} [fallbackValue=undefined] - fallbackValue of the input if getValue returns undefined.
   * @param {*} [onInput=undefined] - callback function when an input is detected for the input element.
   */
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

  /**
   * updates specific input value based on the inputs name
   *
   * @param {*} name - the name of the input
   * @returns {*}
   */
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

  /**
   * returns the value of the input based on its name
   *
   * @param {*} name - the name of the input
   * @returns {*}
   */
  getValue(name) {
    return this.inputs[name].value;
  }

  /**
   * updates all the inputs stored in the class
   */
  updateInputs() {
    for (const inputName of Object.keys(this.inputs)) {
      this.updateInput(inputName);
    }
  }
}
