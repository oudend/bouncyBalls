function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
  const [from, to] = getParsed(fromInput, controlSlider);
  fillSlider(fromInput, toInput, "#C6C6C6", "#25daa5", controlSlider);
  if (from > to) {
    fromSlider.value = to;
    fromInput.value = to;
  } else {
    fromSlider.value = from;
  }
}

function controlToInput(toSlider, fromInput, toInput, controlSlider) {
  const [from, to] = getParsed(fromInput, toInput);
  fillSlider(fromInput, toInput, "#C6C6C6", "#25daa5", controlSlider);
  setToggleAccessible(toInput, controlSlider);
  if (from <= to) {
    toSlider.value = to;
    toInput.value = to;
  } else {
    toInput.value = from;
  }
}

function controlFromSlider(fromSlider, toSlider, fromInput) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);
  if (from > to) {
    fromSlider.value = to;
    fromInput.value = to;
  } else {
    fromInput.value = from;
  }
}

function controlToSlider(fromSlider, toSlider, toInput) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);
  setToggleAccessible(toSlider, toSlider);
  if (from <= to) {
    toSlider.value = to;
    toInput.value = to;
  } else {
    toInput.value = from;
    toSlider.value = from;
  }
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
  const rangeDistance = to.max - to.min;
  const fromPosition = from.value - to.min;
  const toPosition = to.value - to.min;
  controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
}

function setToggleAccessible(currentTarget, toSlider) {
  // const toSlider = document.querySelector("#toSlider");
  if (Number(currentTarget.value) <= 0) {
    toSlider.style.zIndex = 2;
  } else {
    toSlider.style.zIndex = 0;
  }
}

const sliders = document.querySelectorAll(".sliders_control input");
const inputs = document.querySelectorAll(`.form_control_container input`);
const normalSliders = document.querySelectorAll(`.input > input[type="range"]`);
const normalInputs = document.querySelectorAll(`.input > input[type="number"]`);

// const fromSlider = document.querySelector("#fromSlider");
// const toSlider = document.querySelector("#toSlider");
// const fromInput = document.querySelector("#fromInput");
// const toInput = document.querySelector("#toInput");

for (let i = 0; i < normalSliders.length; i++) {
  const slider = normalSliders[i];
  const input = normalInputs[i];

  console.log(input);

  input.value = parseFloat(slider.value, 10);

  fillSlider(
    { value: 0, max: slider.max },
    slider,
    "#C6C6C6",
    "#25daa5",
    slider
  );

  slider.oninput = () => {
    fillSlider(
      { value: 0, max: slider.max },
      slider,
      "#C6C6C6",
      "#25daa5",
      slider
    );

    input.value = parseFloat(slider.value, 10);
  };

  // slider.oninput = controlFromSlider.bind(this, { value: 0 }, slider, input);

  input.oninput = () => {
    slider.value = parseFloat(input.value, 10);

    fillSlider(
      { value: 0, max: slider.max },
      slider,
      "#C6C6C6",
      "#25daa5",
      slider
    );
  };
}

for (let i = 0; i < sliders.length; i += 2) {
  fromSlider = sliders[i];
  toSlider = sliders[i + 1];
  fromInput = inputs[i];
  toInput = inputs[i + 1];

  console.log(fromSlider, toSlider);

  fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);
  setToggleAccessible(toSlider, toSlider);

  fromSlider.oninput = controlFromSlider.bind(
    this,
    fromSlider,
    toSlider,
    fromInput
  );
  toSlider.oninput = controlToSlider.bind(this, fromSlider, toSlider, toInput);
  fromInput.oninput = controlFromInput.bind(
    this,
    fromSlider,
    fromInput,
    toInput,
    toSlider
  );
  toInput.oninput = controlToInput.bind(
    this,
    toSlider,
    fromInput,
    toInput,
    toSlider
  );
}

// fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);
// setToggleAccessible(toSlider);

// fromSlider.oninput = () => controlFromSlider(fromSlider, toSlider, fromInput);
// toSlider.oninput = () => controlToSlider(fromSlider, toSlider, toInput);
// fromInput.oninput = () =>
//   controlFromInput(fromSlider, fromInput, toInput, toSlider);
// toInput.oninput = () => controlToInput(toSlider, fromInput, toInput, toSlider);
