import { describe, expect, it } from "vitest";
import type { ColDef, ColumnState } from "ag-grid-community";
import { applyColumnLayout, pinColumn } from "./columnLayout";

const cols: ColDef[] = [
  { colId: "id", headerName: "#" },
  { colId: "attr_1", headerName: "名稱" },
  { colId: "erp_交易狀態", headerName: "交易狀態" },
  { colId: "attr_2", headerName: "DST料號" },
  { colId: "attr_3", headerName: "價格" },
];
const ids = (defs: ColDef[]) => defs.map((c) => c.colId);

describe("applyColumnLayout", () => {
  it("keeps id first and ERP last without saved state", () => {
    expect(ids(applyColumnLayout(cols, null))).toEqual([
      "id",
      "attr_1",
      "attr_2",
      "attr_3",
      "erp_交易狀態",
    ]);
  });

  it("pins the DST part number by default", () => {
    const dst = applyColumnLayout(cols, null).find((c) => c.colId === "attr_2");
    expect(dst).toMatchObject({ pinned: "left", lockPinned: true });
  });

  it("follows saved order but never moves id or ERP", () => {
    const saved: ColumnState[] = [
      { colId: "erp_交易狀態" },
      { colId: "attr_3", width: 240 },
      { colId: "id" },
      { colId: "attr_1" },
    ];
    const laidOut = applyColumnLayout(cols, saved);
    // attr_2 has no saved position, so it goes after the saved ones
    expect(ids(laidOut)).toEqual([
      "id",
      "attr_3",
      "attr_1",
      "attr_2",
      "erp_交易狀態",
    ]);
    expect(laidOut[1].width).toBe(240);
  });

  it("respects an explicit unpin of the DST part number", () => {
    const dst = applyColumnLayout(cols, [
      { colId: "attr_2", pinned: null },
    ]).find((c) => c.colId === "attr_2");
    expect(dst?.pinned).toBeNull();
    expect(dst?.lockPinned).toBeUndefined();
  });

  it("does not mutate its input", () => {
    const copy = structuredClone(cols);
    applyColumnLayout(cols, [{ colId: "attr_3" }]);
    expect(cols).toEqual(copy);
  });
});

describe("pinColumn", () => {
  it("changes only the target column", () => {
    const state: ColumnState[] = [
      { colId: "attr_1", pinned: null },
      { colId: "attr_2", pinned: "left" },
    ];
    expect(pinColumn(state, "attr_1", "left")).toEqual([
      { colId: "attr_1", pinned: "left" },
      { colId: "attr_2", pinned: "left" },
    ]);
    expect(pinColumn(state, "attr_2", null)[1].pinned).toBeNull();
  });
});
