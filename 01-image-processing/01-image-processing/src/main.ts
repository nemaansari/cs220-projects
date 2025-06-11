import { COLORS, Image } from "../include/image.js";
import { saturateGreen, flipColors, mapLine, imageMap, mapToGreen, mapFlipColors } from "./imageProcessing.js";

/*const imgWithRedLines = Image.loadImageFromGallery();
for (let x = 0; x < imgWithRedLines.width; ++x) {
  for (let y = 0; y < imgWithRedLines.height; y += 10) {
    imgWithRedLines.setPixel(x, y, COLORS.RED);
  }
}*/

//imgWithRedLines.show("Image-With-Red-Lines");

const img = Image.loadImageFromGallery();
const greenImg = saturateGreen(img);
greenImg.show();

//const flippedColors = flipColors(img);
//flippedColors.show();
