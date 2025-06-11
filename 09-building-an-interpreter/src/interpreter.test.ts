import { parseExpression, parseProgram } from "../include/parser.js";
import { State, interpExpression, interpStatement, interpProgram } from "./interpreter.js";

function expectStateToBe(program: string, state: State) {
  expect(interpProgram(parseProgram(program))).toEqual(state);
}

describe("interpExpression", () => {
  it("evaluates multiplication with a variable", () => {
    const r = interpExpression({ x: 10 }, parseExpression("x * 2"));

    expect(r).toEqual(20);
  });
  it("evaluates logical AND short-circuiting", () => {
    const r = interpExpression({ x: false }, parseExpression("x && (1 / 0)"));
    expect(r).toEqual(false);
  });
  it("throws error for division by zero", () => {
    expect(() => interpExpression({}, parseExpression("5 / 0"))).toThrow("Division by zero");
  });

  it("throws error for undefined variable", () => {
    expect(() => interpExpression({}, parseExpression("y + 2"))).toThrow("Undefined variable");
  });

  it("evaluates equality and comparison", () => {
    expect(interpExpression({}, parseExpression("5 === 5"))).toEqual(true);
    expect(interpExpression({}, parseExpression("5 < 10"))).toEqual(true);
  });

  it("if left && is not a boolean, throw an error", () => {
    expect(() => interpExpression({ x: 1 }, parseExpression("x && 2"))).toThrow("Left operand of && must be boolean");
  });

  it("if left || is not a boolean, throw an error", () => {
    expect(() => interpExpression({ x: 1 }, parseExpression("x || 2"))).toThrow("Left operand of || must be boolean");
  });
  it("evaluates right side of logical AND when left is true", () => {
    const r = interpExpression({ x: true }, parseExpression("x && (5 === 5)"));
    expect(r).toEqual(true);
  });

  it("should throw error if not using numbers when using arithmetic operators", () => {
    expect(() => interpExpression({ x: false }, parseExpression("x * 2"))).toThrow(
      "Arithmetic operations require numbers, got boolean and number"
    );
  });

  it("should throw error if not using numbers when using comparison operators", () => {
    expect(() => interpExpression({ x: false }, parseExpression("x < 2"))).toThrow(
      "Comparison operations require numbers, got boolean and number"
    );
  });

  it("throws error for unknown expression kind", () => {
    //@ts-expect-error: skip
    expect(() => interpExpression({}, { kind: "invalid", value: 0 })).toThrow("Unknown expression");
  });

  it("evaluates complex expression with multiple operators", () => {
    const result = interpExpression({}, parseExpression("2 + 3 * 4 === 14"));
    expect(result).toEqual(true);
  });
});

describe("interpStatement", () => {
  it("should receive an error if statement is invalid", () => {
    expect(() =>
      interpStatement(
        { x: 10 },
        {
          kind: "assignment",
          name: "y",
          expression: { kind: "number", value: 5 },
        }
      )
    ).toThrow("Assignment to undeclared variable");
  });

  it("throws error for duplicate variable declaration", () => {
    const state: State = { x: 5 };
    expect(() =>
      interpStatement(state, {
        kind: "let",
        name: "x",
        expression: { kind: "number", value: 10 },
      })
    ).toThrow("Duplicate variable declaration");
  });

  it("evaluates an if-else with true condition", () => {
    const state: State = {};
    interpStatement(state, {
      kind: "if",
      test: { kind: "boolean", value: true },
      truePart: [{ kind: "let", name: "x", expression: { kind: "number", value: 1 } }],
      falsePart: [{ kind: "let", name: "x", expression: { kind: "number", value: 0 } }],
    });
    expect("x" in state).toBe(false);
  });

  it("throws error if if-test is not boolean", () => {
    const state: State = {};
    expect(() =>
      interpStatement(state, {
        kind: "if",
        test: { kind: "number", value: 1 },
        truePart: [],
        falsePart: [],
      })
    ).toThrow("If condition must evaluate to a boolean");
  });

  it("executes print statement", () => {
    const state: State = { x: 1 };
    expect(() =>
      interpStatement(state, {
        kind: "print",
        expression: { kind: "variable", name: "x" },
      })
    ).not.toThrow();
  });

  it("if variable is invalid, throw error", () => {
    const state: State = {};
    expect(() =>
      interpStatement(state, {
        kind: "print",
        expression: { kind: "variable", name: "x" },
      })
    ).toThrow("Undefined variable");
  });

  it("throws error for unknown statement", () => {
    const state: State = {};
    expect(() =>
      interpStatement(state, {
        //@ts-expect-error: skip
        kind: "invalid",
        expression: { kind: "number", value: 0 },
      })
    ).toThrow("Unknown statement");
  });

  it("executes else and updates global var", () => {
    const state: State = { x: 1 };
    interpStatement(state, {
      kind: "if",
      test: { kind: "boolean", value: false },
      truePart: [],
      falsePart: [
        {
          kind: "assignment",
          name: "x",
          expression: { kind: "number", value: 99 },
        },
      ],
    });
    expect(state.x).toBe(99);
  });
});

describe("interpProgram", () => {
  it("handles declarations and reassignment", () => {
    // TIP: Use the grave accent to define multiline strings
    expectStateToBe(
      `      
      let x = 10;
      x = 20;
    `,
      { x: 20 }
    );
  });
  it("handles arithmetic and variable usage", () => {
    expectStateToBe(
      `
      let a = 4;
      let b = a + 6;
      let c = b * 2;
    `,
      { a: 4, b: 10, c: 20 }
    );
  });

  it("runs a while loop", () => {
    expectStateToBe(
      `
      let x = 0;
      while (x < 3) {
        x = x + 1;
      }
    `,
      { x: 3 }
    );
  });

  it("executes a block with multiple statements", () => {
    expectStateToBe(
      `
      let x = 1;    if (true) {
        x = x + 1;
        x = x * 2;
      } else {
      }
      `,
      { x: 4 }
    );
  });

  it("ensures let in inner block does not affect outer scope", () => {
    expectStateToBe(
      `
      let x = 1;
      if (true) {
        let x = 2;
      } else {
      }
      `,
      { x: 1 }
    );
  });

  it("ensures inner let shadows outer during use", () => {
    expectStateToBe(
      `
      let x = 1;
      let y = 0;
      if (true) {
        let x = 2;
        y = x;
      } else {
      }
      `,
      { x: 1, y: 2 }
    );
  });
});
