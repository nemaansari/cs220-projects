import assert from "assert";
import { COLORS, Image, Color } from "../include/image.js";
import { flipColors, saturateGreen } from "./imageProcessing.js";
import { mapLine, imageMap, mapToGreen, mapFlipColors } from "./imageProcessing.js";

describe("saturateGreen", () => {
  it("should maximize green in the upper left corner", () => {
    const blackImage = Image.create(10, 15, COLORS.BLACK);
    const gbImage = saturateGreen(blackImage);
    const p = gbImage.getPixel(0, 0);

    assert(p[0] === 0, "The red channel should be 0.");
    assert(p[1] === 255, "The green channel should be 255.");
    assert(p[2] === 0, "The blue channel should be 0.");

    // or alternatively, using jest, if you'd like
    // https://jestjs.io/docs/expect#toequalvalue
    // Use expect with .toEqual to compare recursively all properties of object instances (also known as "deep" equality).

    expect(p).toEqual([0, 255, 0]);

    // This will produce output showing the exact differences between the two objects, which is really helpful
    // for debugging. However, again, please use the simpler assert syntax if this is too confusing.
    // Focus on making your tests well written and correct, rather than using one syntax or another.
  });

  it("each green value should be set to 255, maintaining what the other pixels already were", () => {
    const img = Image.create(3, 3, COLORS.RED);
    const newGreen = saturateGreen(img);

    expect(newGreen.getPixel(0, 0)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(1, 0)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(2, 0)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(0, 1)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(1, 1)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(2, 1)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(0, 2)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(1, 2)).toEqual([255, 255, 0]);
    expect(newGreen.getPixel(2, 2)).toEqual([255, 255, 0]);
  });

  it("should maximize green in the center", () => {
    const blackImage = Image.create(10, 15, COLORS.BLACK);
    const gbImage = saturateGreen(blackImage);
    const p = gbImage.getPixel(5, 7);

    assert(p[0] === 0, "The red channel should be 0.");
    assert(p[1] === 255, "The green channel should be 255.");
    assert(p[2] === 0, "The blue channel should be 0.");
  });

  it("non square image should still work as intended", () => {
    const img = Image.create(1, 2, COLORS.RED);
    const greenImg = saturateGreen(img);

    expect(greenImg.getPixel(0, 0)).toEqual([255, 255, 0]);
    expect(greenImg.getPixel(0, 1)).toEqual([255, 255, 0]);
  });

  // More tests for saturateGreen go here.
});

describe("flipColors", () => {
  it("should correctly flip top left corner", () => {
    const whiteImage = Image.create(10, 10, COLORS.WHITE);
    // A white image is not particularly helpful in this context
    whiteImage.setPixel(0, 0, [100, 0, 150]);
    const flippedWhiteImage = flipColors(whiteImage);
    const p = flippedWhiteImage.getPixel(0, 0);

    assert(p[0] === 75);
    assert(p[1] === 125);
    assert(p[2] === 50);
  });

  it("white image should remain unchanged", () => {
    const img = Image.create(1, 1, COLORS.WHITE);
    const flippedImg = flipColors(img);

    expect(flippedImg.getPixel(0, 0)).toEqual([255, 255, 255]);
  });

  it("black image should remain unchanged", () => {
    const img = Image.create(1, 1, [100, 0, 150]);
    const flippedImg = flipColors(img);

    expect(flippedImg.getPixel(0, 0)).toEqual([75, 125, 50]);
  });

  it("1x1 image should still flip", () => {
    const img = Image.create(1, 1, COLORS.BLACK);
    const flippedImg = flipColors(img);

    expect(flippedImg.getPixel(0, 0)).toEqual([0, 0, 0]);
  });
});

describe("mapLine", () => {
  it("should apply func to each pixel in the specified line", () => {
    //create image 3x3 all white
    const img = Image.create(3, 3, COLORS.WHITE);

    //function to turn all pixels to green
    const makeGreen = (_c: Color): Color => [0, 255, 0];

    //make the first line green
    mapLine(img, 0, makeGreen);

    //first line should be green
    expect(img.getPixel(0, 0)).toEqual([0, 255, 0]);
    expect(img.getPixel(1, 0)).toEqual([0, 255, 0]);
    expect(img.getPixel(2, 0)).toEqual([0, 255, 0]);
  });

  it("image should remain unchanged if lineNo is invalid", () => {
    const img = Image.create(3, 1, COLORS.BLUE);
    const makeGreen = (_c: Color): Color => [0, 255, 0];

    mapLine(img, 4, makeGreen);

    expect(img.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(img.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(img.getPixel(2, 0)).toEqual([0, 0, 255]);
  });

  it("first and last lines should be able to be changed", () => {
    const img = Image.create(3, 3, COLORS.BLUE);
    const makeGreen = (c: Color): Color => [c[0], 255, c[2]];

    mapLine(img, 0, makeGreen);
    mapLine(img, 2, makeGreen);

    expect(img.getPixel(0, 0)).toEqual([0, 255, 255]);
    expect(img.getPixel(1, 0)).toEqual([0, 255, 255]);
    expect(img.getPixel(2, 0)).toEqual([0, 255, 255]);

    expect(img.getPixel(0, 2)).toEqual([0, 255, 255]);
    expect(img.getPixel(1, 2)).toEqual([0, 255, 255]);
    expect(img.getPixel(2, 2)).toEqual([0, 255, 255]);
  });

  it("Only green value should be changed", () => {
    const img = Image.create(3, 3, COLORS.RED);
    const makeGreen = (c: Color): Color => [c[0], 255, c[2]];
    mapLine(img, 0, makeGreen);

    expect(img.getPixel(0, 0)).toEqual([255, 255, 0]);
    expect(img.getPixel(1, 0)).toEqual([255, 255, 0]);
    expect(img.getPixel(2, 0)).toEqual([255, 255, 0]);
  });
});

describe("imageMap", () => {
  it("should apply func to each pixel in the image", () => {
    //create 3x3 image that is yellow
    const img = Image.create(3, 1, COLORS.YELLOW);

    //function to turn pixels white
    const makeWhite = (_c: Color): Color => [255, 255, 255];

    //result should be a new image that is all white
    const result = imageMap(img, makeWhite);

    expect(result.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(result.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(result.getPixel(2, 0)).toEqual([255, 255, 255]);
  });
  // Tests for imageMap go here.

  it("should work for larger images as well", () => {
    const img = Image.create(100, 100, COLORS.BLACK);
    const makeWhite = (_c: Color): Color => [255, 255, 255];

    const largeImg = imageMap(img, makeWhite);

    for (let x = 0; x < largeImg.width; ++x) {
      for (let y = 0; y < largeImg.height; ++y) {
        expect(largeImg.getPixel(x, y)).toEqual([255, 255, 255]);
      }
    }
  });

  it("dimensions should remain the same", () => {
    const img = Image.create(3, 3, COLORS.BLACK);
    const makeWhite = (_c: Color): Color => [255, 255, 255];

    const img2 = imageMap(img, makeWhite);

    expect(img2.height).toEqual(img.height);
    expect(img2.width).toEqual(img.width);
  });

  it("should not modify original image", () => {
    const img = Image.create(3, 1, COLORS.BLACK);
    const makeWhite = (_c: Color): Color => [255, 255, 255];

    const img2 = imageMap(img, makeWhite);

    expect(img.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(img.getPixel(1, 0)).toEqual([0, 0, 0]);
    expect(img.getPixel(2, 0)).toEqual([0, 0, 0]);

    expect(img2.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(img2.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(img2.getPixel(2, 0)).toEqual([255, 255, 255]);
  });

  it("should work for 1x1 image", () => {
    const img = Image.create(1, 1, COLORS.BLACK);
    const makeWhite = (_c: Color): Color => [255, 255, 255];
    const imgM = imageMap(img, makeWhite);

    expect(imgM.getPixel(0, 0)).toEqual([255, 255, 255]);
  });
});

describe("mapToGreen", () => {
  it("should turn all pixels green, without changing original pixels", () => {
    //create 3x3 image that is blue
    const img = Image.create(3, 3, COLORS.BLUE);

    //call mapToGreen to turn the blue image green
    const result = mapToGreen(img);

    for (let x = 0; x < result.width; ++x) {
      for (let y = 0; y < result.height; ++y) {
        expect(result.getPixel(x, y)).toEqual([0, 255, 255]);
      }
    }
  });

  it("given a green image, image should remain unchanged", () => {
    const img = Image.create(3, 3, COLORS.GREEN);

    const result = mapToGreen(img);

    for (let x = 0; x < result.width; ++x) {
      for (let y = 0; y < result.height; ++y) {
        expect(result.getPixel(x, y)).toEqual([0, 255, 0]);
      }
    }
  });

  it("original image should not be changed", () => {
    const img = Image.create(3, 3, COLORS.BLUE);
    const newImg = mapToGreen(img);

    for (let x = 0; x < img.width; ++x) {
      for (let y = 0; y < img.height; ++y) {
        expect(img.getPixel(x, y)).toEqual([0, 0, 255]);
      }
    }

    for (let x = 0; x < newImg.width; ++x) {
      for (let y = 0; y < newImg.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual([0, 255, 255]);
      }
    }
  });

  it("should work on 1x1 image", () => {
    const img = Image.create(1, 1, COLORS.BLUE);
    const newImg = mapToGreen(img);

    expect(newImg.getPixel(0, 0)).toEqual([0, 255, 255]);
  });

  // Tests for mapToGreen go here.
});

describe("mapFlipColors", () => {
  it("should apply the flip logic to each pixel in the image", () => {
    //create image, make black (changing later)
    const img = Image.create(3, 1, COLORS.BLACK);

    //set pixels to different values so it can be tested later
    img.setPixel(0, 0, [100, 150, 200]);
    img.setPixel(1, 0, [50, 100, 150]);
    img.setPixel(2, 0, [25, 75, 125]);

    //call flipColors function on the image
    const result = mapFlipColors(img);

    //pixel's values should be switched following the original flipcolor's logic
    expect(result.getPixel(0, 0)).toEqual([175, 150, 125]);
    expect(result.getPixel(1, 0)).toEqual([125, 100, 75]);
    expect(result.getPixel(2, 0)).toEqual([100, 75, 50]);
  });

  it("should work on 1x1 image", () => {
    const img = Image.create(1, 1, COLORS.BLACK);

    img.setPixel(0, 0, [100, 150, 200]);

    const result = mapFlipColors(img);

    expect(result.getPixel(0, 0)).toEqual([175, 150, 125]);
  });

  it("Should not modify original image", () => {
    const img = Image.create(1, 1, COLORS.BLACK);

    img.setPixel(0, 0, [100, 150, 200]);

    const result = mapFlipColors(img);

    expect(result.getPixel(0, 0)).toEqual([175, 150, 125]);
    expect(img.getPixel(0, 0)).toEqual([100, 150, 200]);
  });

  it("Should work on all white image, also works on image with all same pixels", () => {
    const img = Image.create(1, 1, COLORS.WHITE);

    const result = mapFlipColors(img);

    expect(result.getPixel(0, 0)).toEqual([255, 255, 255]);
  });
});
