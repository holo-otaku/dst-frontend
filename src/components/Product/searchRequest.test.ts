import { describe, expect, it } from "vitest";
import { SeriesField, SeriesFieldDataType } from "../Series/Interfaces";
import { ProductSearchPayloadOperation as Op } from "./Interface";
import { toSearchRequest } from "./searchRequest";

const fields = [
  { id: 1, dataType: SeriesFieldDataType.string },
  { id: 2, dataType: SeriesFieldDataType.number },
  { id: 3, dataType: SeriesFieldDataType.date },
] as SeriesField[];

describe("toSearchRequest", () => {
  it("drops empty filters, splits ranges and keeps dates as typed", () => {
    const request = toSearchRequest(
      7,
      [
        { fieldId: 1, value: "" },
        { fieldId: 1, value: "abc" },
        { fieldId: 2, value: "10,20", operation: Op.RANGE },
        { fieldId: 2, value: "5", operation: Op.EQUAL },
        { fieldId: 3, value: "2025-01-07", operation: Op.GREATER },
      ],
      fields
    );
    expect(request).toEqual({
      seriesId: 7,
      filters: [
        { fieldId: 1, value: "abc" },
        { fieldId: 2, value: 10, operation: Op.GREATER },
        { fieldId: 2, value: 20, operation: Op.LESS },
        { fieldId: 2, value: 5, operation: Op.EQUAL },
        { fieldId: 3, value: "2025-01-07", operation: Op.GREATER },
      ],
    });
  });

  it("encodes the status dropdown", () => {
    const flags = (status?: "deleted" | "archived" | "both") => {
      const { isDeleted, isArchived } = toSearchRequest(1, [], [], status);
      return { isDeleted, isArchived };
    };
    expect(flags()).toEqual({ isDeleted: undefined, isArchived: undefined });
    expect(flags("deleted")).toEqual({
      isDeleted: true,
      isArchived: undefined,
    });
    expect(flags("archived")).toEqual({
      isDeleted: undefined,
      isArchived: true,
    });
    expect(flags("both")).toEqual({ isDeleted: 2, isArchived: 2 });
  });
});
