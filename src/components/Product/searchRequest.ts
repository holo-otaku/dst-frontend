import { SeriesField, SeriesFieldDataType } from "../Series/Interfaces";
import {
  ProductSearchFilters,
  ProductSearchPayloadField,
  ProductSearchPayloadOperation,
} from "./Interface";

// 搜尋與匯出共用：把搜尋表單的狀態轉成 /product/search、/product/export 的 body。

export type ProductStatus = "deleted" | "archived" | "both";

const statusFlags = (status?: ProductStatus) => {
  switch (status) {
    case "deleted":
      return { isDeleted: true };
    case "archived":
      return { isArchived: true };
    case "both":
      // 後端 2 表示不限制
      return { isDeleted: 2, isArchived: 2 };
    default:
      return {};
  }
};

const toFilters = (
  filter: ProductSearchFilters,
  fields: SeriesField[]
): ProductSearchFilters[] => {
  if (filter.operation === ProductSearchPayloadOperation.RANGE) {
    const [min, max] = filter.value.toString().split(",");
    return [
      {
        fieldId: filter.fieldId,
        value: parseFloat(min),
        operation: ProductSearchPayloadOperation.GREATER,
      },
      {
        fieldId: filter.fieldId,
        value: parseFloat(max),
        operation: ProductSearchPayloadOperation.LESS,
      },
    ];
  }
  const field = fields.find((f) => f.id === filter.fieldId);
  // 日期直接送 YYYY-MM-DD，後端會解析
  if (filter.operation && field?.dataType !== SeriesFieldDataType.date) {
    return [{ ...filter, value: parseFloat(filter.value as string) }];
  }
  return [filter];
};

/** 有填值的篩選條件（也用來記錄常用欄位與搜尋快照）。 */
export const activeFilters = (searchFields: ProductSearchFilters[]) =>
  searchFields.filter((field) => field.value);

export const toSearchRequest = (
  seriesId: number,
  searchFields: ProductSearchFilters[],
  fields: SeriesField[],
  status?: ProductStatus
): ProductSearchPayloadField => ({
  seriesId,
  filters: activeFilters(searchFields).flatMap((filter) =>
    toFilters(filter, fields)
  ),
  ...statusFlags(status),
});
