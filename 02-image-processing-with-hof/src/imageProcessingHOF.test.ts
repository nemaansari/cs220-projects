import assert from "assert";
import { Color, COLORS, Image } from "../include/image.js";
import {
  imageMapCoord,
  imageMapIf,
  mapWindow,
  isGrayish,
  makeGrayish,
  pixelBlur,
  imageBlur,
} from "./imageProcessingHOF.js";

// Helper function to check if a color is equal to another one with an error of 1 (default)
function _expectColorToBeCloseTo(actual: Color, expected: Color, error = 1) {
  [0, 1, 2].forEach(i => expect(Math.abs(actual[i] - expected[i])).toBeLessThanOrEqual(error));
}

function invertColor(img: Image, x: number, y: number) {
  const [r, g, b] = img.getPixel(x, y);
  return [255 - r, 255 - g, 255 - b];
}

function coordBasedColor(img: Image, x: number, y: number) {
  return [x * 10, y * 10, (x + y) * 5];
}

describe("imageMapCoord", () => {
  function identity(img: Image, x: number, y: number) {
    return img.getPixel(x, y);
  }

  it("should return a different image", () => {
    const input = Image.create(10, 10, COLORS.WHITE);
    const output = imageMapCoord(input, identity);
    assert(input !== output);
  });

  it("should return a separate image with same dimensions and colors", () => {
    const input = Image.create(3, 3, COLORS.WHITE);
    const output = imageMapCoord(input, identity);
    for (let x = 0; x < input.width; ++x) {
      for (let y = 0; y < input.height; ++y) {
        expect(input.getPixel(x, y)).toEqual(output.getPixel(x, y));
      }
    }
  });

  it("should correctly map the first and last pixels", () => {
    const input = Image.create(2, 2, COLORS.BLACK);

    const output = imageMapCoord(input, invertColor);

    expect(input.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(input.getPixel(1, 1)).toEqual([0, 0, 0]);

    expect(output.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(output.getPixel(1, 1)).toEqual([255, 255, 255]);
  });

  it("should apply transformation to every pixel", () => {
    const img = Image.create(2, 2, COLORS.BLACK);

    img.setPixel(0, 0, [10, 20, 30]);
    img.setPixel(1, 0, [40, 50, 60]);
    img.setPixel(0, 1, [70, 80, 90]);
    img.setPixel(1, 1, [100, 110, 120]);

    const newImg = imageMapCoord(img, invertColor);

    expect(newImg.getPixel(0, 0)).toEqual([245, 235, 225]);
    expect(newImg.getPixel(1, 0)).toEqual([215, 205, 195]);
    expect(newImg.getPixel(0, 1)).toEqual([185, 175, 165]);
    expect(newImg.getPixel(1, 1)).toEqual([155, 145, 135]);
  });

  it("should work on a non-square", () => {
    const img = Image.create(2, 4, COLORS.WHITE);
    const newImg = imageMapCoord(img, invertColor);

    for (let x = 0; x < newImg.width; ++x) {
      for (let y = 0; y < newImg.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual([0, 0, 0]);
      }
    }
  });

  it("should return a separate image that is identical to the original when using identity function", () => {
    const img = Image.create(3, 3, [100, 150, 200]);
    const newImg = imageMapCoord(img, identity);

    assert(img !== newImg);

    for (let x = 0; x < img.width; ++x) {
      for (let y = 0; y < img.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual(img.getPixel(x, y));
      }
    }
  });

  it("should correctly apply a coordinate based function", () => {
    const img = Image.create(2, 2, COLORS.BLACK);
    const newImg = imageMapCoord(img, coordBasedColor);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([10, 0, 5]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 10, 5]);
    expect(newImg.getPixel(1, 1)).toEqual([10, 10, 10]);
  });

  it("should work for random colored image", () => {
    const img = Image.create(2, 2, COLORS.BLACK);

    img.setPixel(0, 0, [10, 20, 30]);
    img.setPixel(1, 0, [40, 50, 60]);
    img.setPixel(0, 1, [70, 80, 90]);
    img.setPixel(1, 1, [100, 110, 120]);

    const newImg = imageMapCoord(img, invertColor);

    expect(newImg.getPixel(0, 0)).toEqual([245, 235, 225]);
    expect(newImg.getPixel(1, 0)).toEqual([215, 205, 195]);
    expect(newImg.getPixel(0, 1)).toEqual([185, 175, 165]);
    expect(newImg.getPixel(1, 1)).toEqual([155, 145, 135]);
  });

  it("should apply to first and last pixels", () => {
    const img = Image.create(3, 3, COLORS.BLACK);

    img.setPixel(0, 0, [10, 20, 30]);
    img.setPixel(2, 2, [40, 50, 60]);

    const newImg = imageMapCoord(img, invertColor);

    expect(newImg.getPixel(0, 0)).toEqual([245, 235, 225]);
    expect(newImg.getPixel(2, 2)).toEqual([215, 205, 195]);
  });

  it("should handle a single pixel image", () => {
    const img = Image.create(1, 1, COLORS.BLACK);
    const newImg = imageMapCoord(img, invertColor);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
  });

  it("should handle a singular pixel image", () => {
    const img = Image.create(1, 1, COLORS.BLACK);
    const newImg = imageMapCoord(img, invertColor);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
  });

  it("should work correctly when dealing with colors that depend on a pixel", () => {
    const img = Image.create(2, 2, COLORS.BLACK);

    const newImg = imageMapCoord(img, (img, x, y) => {
      const c = img.getPixel(x, y);
      if (y % 2 === 0) {
        return [0, 0, 255];
      }
      return c;
    });

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 0]);
  });

  it("should correctly modify a pixel using neighboring pixels with pixelBlur", () => {
    const img = Image.create(3, 1, COLORS.BLACK);
    img.setPixel(0, 0, [255, 0, 0]);
    img.setPixel(1, 0, [0, 255, 0]);
    img.setPixel(2, 0, [0, 0, 255]);

    const newImg = imageMapCoord(img, (img, x, y) => {
      return pixelBlur(img, x, y);
    });

    expect(newImg.getPixel(0, 0)).toEqual([127, 127, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([85, 85, 85]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 127, 127]);
  });

  // More tests for imageMapCoord go here.
});

describe("imageMapIf", () => {
  // More tests for imageMapIf go here
  it("should return a new image that sets the (0, 0) pixel blue if the (0, 0) pixel is originally black", () => {
    const img = Image.create(2, 2, COLORS.WHITE);
    img.setPixel(0, 0, [0, 0, 0]);

    function isBlack(img: Image, x: number, y: number): boolean {
      const pixel = img.getPixel(x, y);
      if (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) return true;
      return false;
    }
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const newImg = imageMapIf(img, isBlack, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([255, 255, 255]);
  });

  it("should not change non-black pixels", () => {
    const img = Image.create(2, 2, COLORS.WHITE);

    img.setPixel(0, 0, [0, 0, 0]);
    img.setPixel(1, 1, [255, 0, 0]);

    function isBlack(img: Image, x: number, y: number): boolean {
      const pixel = img.getPixel(x, y);
      if (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0) return true;
      return false;
    }

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const newImg = imageMapIf(img, isBlack, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([255, 0, 0]);
  });
});

describe("mapWindow", () => {
  it("Should make the whole image blue", () => {
    const img = Image.create(5, 5, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 4]; // x min = 0, x max = 4
    const y = [0, 4]; // y min = 0, y max = 4

    const newImg = mapWindow(img, x, y, setBlue);

    for (let x = 0; x < newImg.width; ++x) {
      for (let y = 0; y < newImg.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual([0, 0, 255]);
      }
    }
  });

  it("only pixels in the range should be changed", () => {
    const img = Image.create(2, 2, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 0]; // x min = 0, x max = 0
    const y = [0, 0]; // y min = 0, y max = 0

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 0]);
  });

  it("should do nothing if the window is out of bounds", () => {
    const img = Image.create(2, 2, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [3, 4]; // x min = 3, x max = 4
    const y = [3, 4]; // y min = 3, y max = 4

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 0]);
  });

  it("should only modify a single row in the image", () => {
    const img = Image.create(3, 3, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 2];
    const y = [1, 1];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 1)).toEqual([0, 0, 255]);

    expect(newImg.getPixel(0, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(2, 2)).toEqual([0, 0, 0]);
  });

  it("should only modify a single column in the image", () => {
    const img = Image.create(3, 3, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [1, 1];
    const y = [0, 2];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 1)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 2)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 2)).toEqual([0, 0, 0]);
  });

  it("should only modify the center pixel", () => {
    const img = Image.create(3, 3, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [1, 1];
    const y = [1, 1];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 1)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(2, 2)).toEqual([0, 0, 0]);
  });

  it("should handle a window larger than the image", () => {
    const img = Image.create(5, 5, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [10, 10]; // x min = 0, x max = 4
    const y = [10, 10]; // y min = 0, y max = 4

    const newImg = mapWindow(img, x, y, setBlue);

    for (let x = 0; x < newImg.width; ++x) {
      for (let y = 0; y < newImg.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual([0, 0, 0]);
      }
    }
  });

  it("should handle a window smaller than the image", () => {
    const img = Image.create(5, 5, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [-1, -1]; // x min = 0, x max = 4
    const y = [-1, -1]; // y min = 0, y max = 4

    const newImg = mapWindow(img, x, y, setBlue);

    for (let x = 0; x < newImg.width; ++x) {
      for (let y = 0; y < newImg.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual([0, 0, 0]);
      }
    }
  });

  it("should handle the boundaries correctly", () => {
    const img = Image.create(3, 1, COLORS.BLACK);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 1];
    const y = [0, 0];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 0, 0]);
  });

  it("image should remain unchanged if the color function provided is the same as the image", () => {
    const img = Image.create(3, 1, COLORS.BLACK);

    const setBlack = (_c: Color): Color => {
      return [0, 0, 0];
    };

    const x = [0, 2];
    const y = [0, 0];

    const newImg = mapWindow(img, x, y, setBlack);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 0, 0]);
  });

  it("if x and y are swapped, should handle accordingly", () => {
    const img = Image.create(3, 1, COLORS.WHITE);

    const setBlack = (_c: Color): Color => {
      return [0, 0, 0];
    };

    const x = [0, 0];
    const y = [0, 2];

    const newImg = mapWindow(img, x, y, setBlack);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(2, 0)).toEqual([255, 255, 255]);
  });

  it("should handle negative window", () => {
    const img = Image.create(3, 3, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [-1, 1];
    const y = [-1, 1];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 0)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(2, 1)).toEqual([0, 0, 0]);

    expect(newImg.getPixel(0, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(1, 2)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(2, 2)).toEqual([0, 0, 0]);
  });

  it("should handle multiple calls with different window sizes and coordinates", () => {
    const img = Image.create(5, 5, COLORS.BLACK);
    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x1 = [0, 1];
    const y1 = [0, 1];
    let newImg = mapWindow(img, x1, y1, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);

    expect(newImg.getPixel(2, 2)).toEqual([0, 0, 0]);

    const x2 = [3, 4];
    const y2 = [3, 4];
    newImg = mapWindow(newImg, x2, y2, setBlue);

    expect(newImg.getPixel(3, 3)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(3, 4)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(4, 3)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(4, 4)).toEqual([0, 0, 255]);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);

    expect(newImg.getPixel(2, 2)).toEqual([0, 0, 0]);
  });

  it("max is bigger than min", () => {
    const img = Image.create(3, 1, COLORS.WHITE);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [2, 0];
    const y = [0, 0];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(2, 0)).toEqual([255, 255, 255]);
  });

  it("should change top half", () => {
    const img = Image.create(2, 2, COLORS.WHITE);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 1];
    const y = [0, 0];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([255, 255, 255]);
  });

  it("should change right half", () => {
    const img = Image.create(2, 2, COLORS.WHITE);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [1, 1];
    const y = [0, 1];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
  });

  it("should change bottom row", () => {
    const img = Image.create(2, 2, COLORS.WHITE);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 1];
    const y = [1, 1];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
  });

  it("should change left half", () => {
    const img = Image.create(2, 2, COLORS.WHITE);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0, 0];
    const y = [0, 1];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([0, 0, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([255, 255, 255]);
  });

  it("should handle decimal values", () => {
    const img = Image.create(2, 2, COLORS.WHITE);

    const setBlue = (_c: Color): Color => {
      return [0, 0, 255];
    };

    const x = [0.5, 1.5];
    const y = [0.5, 1.5];

    const newImg = mapWindow(img, x, y, setBlue);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(1, 1)).toEqual([0, 0, 255]);
  });

  // More tests for mapWindow go here
});

describe("isGrayish", () => {
  it("Should return true for pure black and white", () => {
    expect(isGrayish(COLORS.BLACK)).toEqual(true);
    expect(isGrayish(COLORS.WHITE)).toEqual(true);
  });

  it("Should return true for shades of gray", () => {
    expect(isGrayish([100, 100, 100])).toEqual(true);
    expect(isGrayish([200, 200, 200])).toEqual(true);
    expect(isGrayish([50, 50, 50])).toEqual(true);
    expect(isGrayish([178, 190, 181])).toEqual(true);
    expect(isGrayish([115, 147, 179])).toEqual(true);
  });

  it("should return false for vibrant colors", () => {
    expect(isGrayish([255, 0, 0])).toEqual(false);
    expect(isGrayish([0, 255, 0])).toEqual(false);
    expect(isGrayish([0, 0, 255])).toEqual(false);
    expect(isGrayish([255, 255, 0])).toEqual(false);
  });

  it("should return true for near-gray colors", () => {
    expect(isGrayish([120, 121, 119])).toEqual(true);
    expect(isGrayish([200, 201, 199])).toEqual(true);
  });

  it("should return true on gray", () => {
    expect(isGrayish([128, 128, 128])).toEqual(true);
  });

  it("should return true for very near-gray colors", () => {
    expect(isGrayish([128, 128, 129])).toEqual(true);
    expect(isGrayish([255, 254, 255])).toEqual(true);
  });

  it("should return true for an exact 85 value difference", () => {
    expect(isGrayish([255, 255, 170])).toEqual(true);
  });

  it("should return false for a color just beyond the threshold", () => {
    expect(isGrayish([255, 255, 169])).toEqual(false);
  });
});

describe("makeGrayish", () => {
  it("Should keep (0, 0) pixel the same but make the (0, 1) pixel a gray-scale pixel", () => {
    const img = Image.create(1, 2, COLORS.BLACK);

    img.setPixel(0, 1, COLORS.RED);

    const newImg = makeGrayish(img);

    expect(newImg.getPixel(0, 0)).toEqual([0, 0, 0]);
    expect(newImg.getPixel(0, 1)).toEqual([85, 85, 85]);
  });

  it("Gray image should remain unchanged", () => {
    const img = Image.create(3, 3, [128, 128, 128]);

    const newImg = makeGrayish(img);

    for (let x = 0; x < newImg.width; ++x) {
      for (let y = 0; y < newImg.height; ++y) {
        expect(newImg.getPixel(x, y)).toEqual([128, 128, 128]);
      }
    }
  });

  it("should work on an image that does not have uniform colors, also 1x1 image", () => {
    const img = Image.create(1, 1, [255, 0, 255]);
    const newImg = makeGrayish(img);

    expect(newImg.getPixel(0, 0)).toEqual([170, 170, 170]);
  });

  it("near gray pixel should remain unchanged", () => {
    const img = Image.create(1, 1, [125, 125, 125]);
    const newImg = makeGrayish(img);

    expect(newImg.getPixel(0, 0)).toEqual([125, 125, 125]);
  });

  it("should convert a mix of colors to gray", () => {
    const img = Image.create(2, 2, COLORS.WHITE);
    img.setPixel(0, 1, [255, 0, 0]);
    img.setPixel(1, 0, [0, 255, 0]);
    img.setPixel(1, 1, [0, 0, 255]);

    const newImg = makeGrayish(img);

    expect(newImg.getPixel(0, 0)).toEqual([255, 255, 255]);
    expect(newImg.getPixel(0, 1)).toEqual([85, 85, 85]);
    expect(newImg.getPixel(1, 0)).toEqual([85, 85, 85]);
    expect(newImg.getPixel(1, 1)).toEqual([85, 85, 85]);
  });

  it("should correctly truncate the average when converting to gray", () => {
    const img = Image.create(1, 1, [255, 255, 169]);
    const newImg = makeGrayish(img);

    expect(newImg.getPixel(0, 0)).toEqual([226, 226, 226]);
  });

  // More tests for makeGrayish go here
});

describe("pixelBlur", () => {
  it("Should blur the center pixel in a 3x3 image", () => {
    const img = Image.create(3, 3, COLORS.WHITE);

    img.setPixel(0, 0, [100, 150, 200]);
    img.setPixel(0, 1, [150, 200, 100]);
    img.setPixel(0, 2, [50, 100, 150]);
    img.setPixel(1, 0, [75, 125, 175]);
    img.setPixel(1, 1, [125, 175, 225]); //center
    img.setPixel(1, 2, [200, 250, 50]);
    img.setPixel(2, 0, [255, 0, 0]);
    img.setPixel(2, 1, [0, 255, 0]);
    img.setPixel(2, 2, [0, 0, 255]);

    const blurredPixel = pixelBlur(img, 1, 1);

    const expectedPixel = [
      Math.trunc((100 + 150 + 50 + 75 + 125 + 200 + 255 + 0 + 0) / 9), // R
      Math.trunc((150 + 200 + 100 + 125 + 175 + 250 + 0 + 255 + 0) / 9), // G
      Math.trunc((200 + 100 + 150 + 175 + 225 + 50 + 0 + 0 + 255) / 9), // B
    ];

    expect(blurredPixel).toEqual(expectedPixel);
  });

  it("Should handle edge pixels correctly", () => {
    const img = Image.create(3, 3, COLORS.WHITE);
    img.setPixel(0, 0, COLORS.RED);
    const blurredPixel = pixelBlur(img, 0, 0);

    expect(blurredPixel).toEqual([255, 191, 191]);
  });

  it;

  // Tests for pixelBlur go here
});

describe("imageBlur", () => {
  it("Should blur the entire image", () => {
    const newImg = Image.create(2, 2, COLORS.WHITE);

    newImg.setPixel(0, 0, [100, 150, 200]);
    newImg.setPixel(0, 1, [150, 200, 100]);
    newImg.setPixel(1, 0, [50, 100, 150]);
    newImg.setPixel(1, 1, [75, 125, 175]);

    const blurredImg = imageBlur(newImg);

    expect(blurredImg.getPixel(0, 0)).toEqual([93, 143, 156]);
    expect(blurredImg.getPixel(0, 1)).toEqual([93, 143, 156]);
    expect(blurredImg.getPixel(1, 0)).toEqual([93, 143, 156]);
    expect(blurredImg.getPixel(1, 1)).toEqual([93, 143, 156]);
  });

  // Tests for imageBlur go here
});
