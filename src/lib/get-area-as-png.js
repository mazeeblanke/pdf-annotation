// @flow

import type { T_LTWH } from "../types.js";

const getAreaAsPNG = (canvas: HTMLCanvasElement, position: T_LTWH): string => {
  const { left, top, width, height } = position;

  // @TODO: cache this?
  const newCanvas = document.createElement("canvas");

  if (!(newCanvas instanceof HTMLCanvasElement)) {
    return "";
  }

  newCanvas.width = width;
  newCanvas.height = height;

  const newCanvasContext = newCanvas.getContext("2d");

  if (!newCanvasContext || !canvas) {
    return "";
  }

  const dpr: number = window.devicePixelRatio;

  newCanvasContext.drawImage(
    canvas,
    left * dpr,
    top * dpr,
    width * dpr,
    height * dpr,
    0,
    0,
    width,
    height
  );

  return newCanvas.toDataURL("image/png");
};

export default getAreaAsPNG;
