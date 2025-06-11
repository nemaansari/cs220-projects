import { Expression, Statement } from "../include/parser.js";

type RuntimeValue = number | boolean;
const PARENT_STATE_KEY = Symbol("[[PARENT]]");
export type State = { [PARENT_STATE_KEY]?: State; [key: string]: RuntimeValue };

export function interpExpression(state: State, exp: Expression): RuntimeValue {
  switch (exp.kind) {
    case "number":
    case "boolean":
      return exp.value;

    case "variable": {
      let current: State | undefined = state;
      while (current) {
        if (exp.name in current) {
          return current[exp.name];
        }
        current = current[PARENT_STATE_KEY];
      }
      throw new Error("Undefined variable: " + exp.name);
    }

    case "operator": {
      const { operator, left, right } = exp;

      if (operator === "&&") {
        const l = interpExpression(state, left);
        if (typeof l !== "boolean") {
          throw new Error("Left operand of && must be boolean");
        }
        return l ? interpExpression(state, right) : false;
      }

      if (operator === "||") {
        const l = interpExpression(state, left);
        if (typeof l !== "boolean") {
          throw new Error("Left operand of || must be boolean");
        }

        return l ? true : interpExpression(state, right);
      }

      const l = interpExpression(state, left);
      const r = interpExpression(state, right);

      switch (operator) {
        case "+":
        case "-":
        case "*":
        case "/":
          if (typeof l !== "number" || typeof r !== "number") {
            throw new Error("Arithmetic operations require numbers, got " + typeof l + " and " + typeof r);
          }
          if (operator === "/" && r === 0) {
            throw new Error("Division by zero");
          }

          return operator === "+" ? l + r : operator === "-" ? l - r : operator === "*" ? l * r : l / r;

        case "<":
        case ">":
          if (typeof l !== "number" || typeof r !== "number") {
            throw new Error("Comparison operations require numbers, got " + typeof l + " and " + typeof r);
          }
          return operator === "<" ? l < r : l > r;

        case "===":
          return l === r;

        default:
          throw new Error(`Unknown operator`);
      }
    }

    default:
      throw new Error("Unknown expression type");
  }
}

export function interpStatement(state: State, stmt: Statement): void {
  switch (stmt.kind) {
    case "let": {
      if (stmt.name in state) {
        throw new Error("Duplicate variable declaration: " + stmt.name);
      }
      const value = interpExpression(state, stmt.expression);
      state[stmt.name] = value;
      return;
    }

    case "assignment": {
      let current: State | undefined = state;
      while (current) {
        if (stmt.name in current) {
          current[stmt.name] = interpExpression(state, stmt.expression);
          return;
        }
        current = current[PARENT_STATE_KEY];
      }
      throw new Error("Assignment to undeclared variable: " + stmt.name);
    }

    case "if": {
      const test = interpExpression(state, stmt.test);
      if (typeof test !== "boolean") {
        throw new Error("If condition must evaluate to a boolean");
      }

      const branch = test ? stmt.truePart : stmt.falsePart;
      const childState: State = { [PARENT_STATE_KEY]: state };

      for (let i = 0; i < branch.length; i++) {
        interpStatement(childState, branch[i]);
      }
      return;
    }

    case "while": {
      let test = interpExpression(state, stmt.test);
      if (typeof test !== "boolean") {
        throw new Error("while condition must evaluate to a boolean");
      }

      while (test) {
        const childState: State = { [PARENT_STATE_KEY]: state };

        for (let i = 0; i < stmt.body.length; i++) {
          interpStatement(childState, stmt.body[i]);
        }

        test = interpExpression(state, stmt.test);
        if (typeof test !== "boolean") {
          throw new Error("while condition must evaluate to a boolean");
        }
      }

      return;
    }

    case "print": {
      const value = interpExpression(state, stmt.expression);
      console.log(value);
      return;
    }

    default:
      throw new Error("Unknown statement type");
  }
}

export function interpProgram(program: Statement[]): State {
  const globalState: State = {};

  for (let i = 0; i < program.length; i++) {
    interpStatement(globalState, program[i]);
  }

  return globalState;
}
