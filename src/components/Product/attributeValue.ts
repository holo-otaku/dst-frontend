import { SeriesFieldDataType } from "../Series/Interfaces";
import { ProductAttributePayload } from "./Interface";

type Value = ProductAttributePayload["value"];

/**
 * API 的值 → 表單的值。
 * 日期存成 YYYY/MM/DD，<input type="date"> 要 YYYY-MM-DD；舊資料不是日期的值原樣保留。
 */
export const toInput = <T extends Value | null | undefined>(
  dataType: SeriesFieldDataType | undefined,
  value: T
): T | string => {
  if (
    dataType === SeriesFieldDataType.date &&
    typeof value === "string" &&
    /^\d{4}\/\d{2}\/\d{2}$/.test(value)
  ) {
    return value.replace(/\//g, "-");
  }
  return value;
};

/**
 * 表單的值 → 送給 API 的值。
 * 開關送 "true"/"false" 字串（!!"false" 是 true）；日期的 YYYY-MM-DD 由後端轉成 YYYY/MM/DD。
 */
export const fromInput = (
  dataType: SeriesFieldDataType | undefined,
  value: Value
): Value =>
  dataType === SeriesFieldDataType.boolean
    ? value === true || value === "true"
    : value;

/** 新增或取代某個欄位的值，回傳新的陣列（不改原本的 state）。 */
export const withAttribute = (
  attributes: ProductAttributePayload[],
  fieldId: number,
  value: Value
): ProductAttributePayload[] =>
  attributes.some((attribute) => attribute.fieldId === fieldId)
    ? attributes.map((attribute) =>
        attribute.fieldId === fieldId ? { ...attribute, value } : attribute
      )
    : [...attributes, { fieldId, value }];
