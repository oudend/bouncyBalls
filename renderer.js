"use strict";

class Renderer {
  _loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw log;
    }
    return shader;
  }

  _loadProgram(sources) {
    const shaders = sources.map(([t, src]) => this._loadShader(t, src));

    const program = this.gl.createProgram();
    shaders.forEach((shader) => this.gl.attachShader(program, shader));
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      log = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw log;
    }
    return program;
  }

  _getInfo(program, vertexAttribs) {
    const attribs = Object.fromEntries(
      vertexAttribs.map((attrib) => {
        const location = this.gl.getAttribLocation(program, attrib);
        if (location < 0) {
          throw `No attribute: ${attrib}`;
        }
        return [attrib, location];
      })
    );
    return { attribs };
  }

  _enableBuffer(
    attrib,
    elems,
    type,
    divisor = 0,
    stride = 0,
    normalize = false
  ) {
    if (this.buffers[attrib] == null) {
      throw `No buffer: ${attrib}`;
    }
    if (this.info.attribs[attrib] == null) {
      throw `No attribute: ${attrib}`;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[attrib]);
    this.gl.vertexAttribPointer(
      this.info.attribs[attrib],
      elems,
      type,
      normalize,
      stride,
      0
    );
    this.gl.vertexAttribDivisor(this.info.attribs[attrib], divisor);
    this.gl.enableVertexAttribArray(this.info.attribs[attrib]);
  }

  _bufferData(attrib, data, usage) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[attrib]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
  }

  constructor(gl, shaders, attribs) {
    const vertexShaderSrc = `#version 300 es
    in highp vec2 src_position;
    in highp vec2 src_offset;
    out mediump vec2 centre;
    out mediump vec2 offset;
    void main() {
      offset = src_offset;
      centre = src_position;
      gl_Position = vec4(centre + offset * 0.1, 0.5, 1.0);
    }
  `;

    const fragmentShaderSrc = `#version 300 es
    in mediump vec2 centre;
    in mediump vec2 offset;
    out lowp vec4 fragColor;
    void main() {
    if (length(offset) > 1.0) {
      discard;
    }
      fragColor = vec4(offset * 0.5 + 0.5, 1.0, 1.0);
    }
  `;

    this.gl = gl;
    this.attribs = ["src_position", "src_offset"];

    this.program = this._loadProgram([vertexShaderSrc, fragmentShaderSrc]);
    this.info = this._getInfo(this.program, this.attribs);

    this.buffers = Object.fromEntries(
      this.attribs.map((attrib) => [attrib, this.gl.createBuffer()])
    );

    this._enableBuffer("src_position", 2, this.gl.FLOAT, 1);
    this._enableBuffer("src_offset", 2, this.gl.FLOAT);

    const offsets = new Float32Array(
      [
        [-1.0, -1.0],
        [-1.0, 1.0],
        [1.0, -1.0],
        [1.0, 1.0],
      ].flat()
    );
    this._bufferData("src_offset", offsets, this.gl.STATIC_DRAW);
    this.nOffsets = 4;
  }

  setData(coords) {
    const attrib = "src_position";
    if (this.buffers[attrib] == null) {
      throw `No buffer: ${attrib}`;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers[attrib]);
    this._bufferData("src_position", coords, this.gl.STREAM_DRAW);
    this.nCoords = coords.length / 2;
  }

  render(points) {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.drawArraysInstanced(
      this.gl.TRIANGLE_STRIP,
      0,
      this.nOffsets,
      this.nCoords
    );
  }
}

function main() {
  const canvas = document.querySelector("#glCanvas");
  const gl = canvas.getContext("webgl2");
  if (gl == null) return;

  const coords = new Float32Array(
    [...Array(10)]
      .map(() => [Math.random(), Math.random()].map((c) => (c - 0.5) * 2.0))
      .flat()
  );

  const renderer = new Renderer(gl, [
    [gl.VERTEX_SHADER, vertexShaderSrc],
    [gl.FRAGMENT_SHADER, fragmentShaderSrc],
  ]);

  function step() {
    for (let i = 0; i < coords.length; i++) {
      coords[i] += (Math.random() - 0.5) * 0.01;
    }
    renderer.setData(coords);
    renderer.render();
    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}
