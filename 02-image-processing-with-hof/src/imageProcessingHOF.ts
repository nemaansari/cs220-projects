import type { Image, Color } from "../include/image.js";

export function imageMapCoord(img: Image, func: (img: Image, x: number, y: number) => Color): Image {
  // TODO

  const newImg = img.copy();

  for (let x = 0; x < newImg.width; ++x) {
    for (let y = 0; y < newImg.height; ++y) {
      newImg.setPixel(x, y, func(img, x, y));
    }
  }

  return newImg;
}

export function imageMapIf(
  img: Image,
  cond: (img: Image, x: number, y: number) => boolean,
  func: (p: Color) => Color
): Image {
  function getColor(img: Image, x: number, y: number): Color {
    const Color = img.getPixel(x, y);

    if (cond(img, x, y)) return func(Color);

    return Color;
  }

  return imageMapCoord(img, getColor);
  // TODO
}

export function mapWindow(
  img: Image,
  xInterval: number[], // Assumed to be a two element array containing [x_min, x_max]
  yInterval: number[], // Assumed to be a two element array containing [y_min, y_max]
  func: (p: Color) => Color
): Image {
  // TODO

  function isInWindow(img: Image, x: number, y: number): boolean {
    if (x >= xInterval[0] && x <= xInterval[1] && y >= yInterval[0] && y <= yInterval[1]) return true;
    return false;
  }

  return imageMapIf(img, isInWindow, func);
}

export function isGrayish(p: Color): boolean {
  // TODO

  const max = Math.max(p[0], p[1], p[2]);
  const min = Math.min(p[0], p[1], p[2]);

  if (max - min <= 85) return true;
  return false;
}

export function makeGrayish(img: Image): Image {
  // TODO

  function grayScale(c: Color): Color {
    const newColorVal = Math.trunc((c[0] + c[1] + c[2]) / 3);
    const newColor = [newColorVal, newColorVal, newColorVal];
    return newColor;
  }

  function isGrayishFunc(img: Image, x: number, y: number): boolean {
    const pixel = img.getPixel(x, y);
    if (isGrayish(pixel)) return false;
    return true;
  }

  return imageMapIf(img, isGrayishFunc, grayScale);
}

export function pixelBlur(img: Image, x: number, y: number): Color {
  // TODO

  const neighbors: Color[] = [];
  for (let a = -1; a <= 1; a++) {
    for (let b = -1; b <= 1; b++) {
      const neighborX = x + a;
      const neighborY = y + b;

      if (neighborX >= 0 && neighborX < img.width && neighborY >= 0 && neighborY < img.height) {
        neighbors.push(img.getPixel(neighborX, neighborY));
      }
    }
  }

  let red = 0;
  let green = 0;
  let blue = 0;
  for (let x = 0; x < neighbors.length; x++) {
    red += neighbors[x][0];
    green += neighbors[x][1];
    blue += neighbors[x][2];
  }

  red = Math.trunc(red / neighbors.length);
  green = Math.trunc(green / neighbors.length);
  blue = Math.trunc(blue / neighbors.length);

  return [red, green, blue];
}

export function imageBlur(img: Image): Image {
  // TODO

  function blurredPixel(img: Image, x: number, y: number) {
    return pixelBlur(img, x, y);
  }

  const blurred = imageMapCoord(img, blurredPixel);

  return blurred;
}
