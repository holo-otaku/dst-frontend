import type { ColDef, ColumnState } from "ag-grid-community";

// 產品表格欄位排版：使用者調整過的順序、釘選、寬度依 Series 存在 localStorage。
// 規則：# (id) 永遠第一、ERP 欄位永遠最後、DST 料號預設釘選在左邊。

const COLUMN_STATE_KEY_PREFIX = "dst_product_col_state_";

export const ID_COL_ID = "id";
export const attrColId = (fieldId: number | string) => `attr_${fieldId}`;
export const erpColId = (key: string) => `erp_${key}`;
const isErp = (colId: string | undefined) => !!colId?.startsWith("erp_");

export const isDstPartNumber = (fieldName: string) =>
  /\bdst\b/i.test(fieldName) && fieldName.includes("料號");

export const loadColumnState = (
  seriesId: string | number
): ColumnState[] | null => {
  try {
    const raw = localStorage.getItem(`${COLUMN_STATE_KEY_PREFIX}${seriesId}`);
    return raw ? (JSON.parse(raw) as ColumnState[]) : null;
  } catch {
    return null;
  }
};

export const saveColumnState = (
  seriesId: string | number,
  state: ColumnState[]
) => {
  try {
    localStorage.setItem(
      `${COLUMN_STATE_KEY_PREFIX}${seriesId}`,
      JSON.stringify(state)
    );
  } catch {
    return;
  }
};

/**
 * 把存下來的排版套用到欄位定義上，回傳排序後的新陣列。
 * ag-grid 每次 columnDefs 更新都會重新套用 ColDef 上的 pinned/width，
 * 所以排版必須編進 ColDef，切換回同一個 Series 時才會還原。
 */
export const applyColumnLayout = (
  cols: ColDef[],
  saved: ColumnState[] | null
): ColDef[] => {
  const savedByColId = new Map(saved?.map((s) => [s.colId, s]));
  const orderMap = new Map(saved?.map((s, i) => [s.colId, i]));

  const laidOut = cols.map((col): ColDef => {
    if (col.colId === ID_COL_ID || col.colId === undefined) return col;
    const savedState = savedByColId.get(col.colId);
    if (savedState) {
      // null 代表使用者明確取消釘選
      return {
        ...col,
        pinned: savedState.pinned ?? null,
        width: savedState.width ?? undefined,
      };
    }
    if (!isErp(col.colId) && isDstPartNumber(col.headerName ?? "")) {
      return { ...col, pinned: "left", lockPinned: true };
    }
    return col;
  });

  const rank = (col: ColDef) => {
    if (col.colId === ID_COL_ID) return -1;
    return (
      (isErp(col.colId) ? 100000 : 0) + (orderMap.get(col.colId ?? "") ?? 9999)
    );
  };
  return laidOut.sort((a, b) => rank(a) - rank(b));
};

/** 釘選/取消釘選一個欄位；還沒有存過排版時從表格目前的狀態開始。 */
export const pinColumn = (
  state: ColumnState[],
  colId: string,
  pinned: "left" | null
): ColumnState[] =>
  state.map((s) => (s.colId === colId ? { ...s, pinned } : s));
