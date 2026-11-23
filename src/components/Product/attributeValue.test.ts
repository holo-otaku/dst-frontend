import { describe, expect, it } from "vitest";
import { SeriesFieldDataType as T } from "../Series/Interfaces";
import { fromInput, toInput, withAttribute } from "./attributeValue";

describe("toInput", () => {
  it("turns stored dates into date-input values", () => {
    expect(toInput(T.date, "2025/01/07")).toBe("2025-01-07");
  });

  it("leaves non-date values and non-date fields alone", () => {
    expect(toInput(T.date, "32")).toBe("32");
    expect(toInput(T.string, "2025/01/07")).toBe("2025/01/07");
    expect(toInput(T.boolean, true)).toBe(true);
    expect(toInput(T.date, null)).toBe(null);
  });
});

describe("fromInput", () => {
  it("parses switch strings into booleans", () => {
    expect(fromInput(T.boolean, "false")).toBe(false);
    expect(fromInput(T.boolean, "true")).toBe(true);
    expect(fromInput(T.boolean, true)).toBe(true);
  });

  it("sends other values as typed, including date-looking strings", () => {
    expect(fromInput(T.string, "2025-01-07")).toBe("2025-01-07");
    expect(fromInput(T.number, "17.70")).toBe("17.70");
  });
});

describe("withAttribute", () => {
  it("adds or replaces without mutating", () => {
    const attributes = [{ fieldId: 1, value: "a" }];
    expect(withAttribute(attributes, 2, "b")).toEqual([
      { fieldId: 1, value: "a" },
      { fieldId: 2, value: "b" },
    ]);
    expect(withAttribute(attributes, 1, "c")).toEqual([
      { fieldId: 1, value: "c" },
    ]);
    expect(attributes).toEqual([{ fieldId: 1, value: "a" }]);
  });
});
