import { Image } from "../include/image.js";
import { imageMapCoord, imageBlur } from "./imageProcessingHOF.js";

const art = Image.loadImageFromGallery("art");
imageMapCoord(art, (img, x, y) => {
  const c = img.getPixel(x, y);
  if (y % 2 === 0) {
    return [c[0], 0, 0];
  }

  return c;
}).show();

imageBlur(Image.loadImageFromGallery()).show();
