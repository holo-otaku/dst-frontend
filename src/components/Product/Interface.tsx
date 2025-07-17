export interface ProductAttributePayload {
  fieldId: number;
  value: string | number | boolean;
}

export interface ProductDataAttribute extends ProductAttributePayload {
  fieldName: string;
  dataType: string;
}

export interface ProductPayload {
  seriesId: number;
  attributes: ProductAttributePayload[];
}

export interface ProductData {
  itemId: number;
  seriesId: number;
  seriesName: string;
  attributes: ProductDataAttribute[];
  erp: ErpData[];
  hasArchive: boolean;
  isDeleted: boolean;
}

export interface ErpData {
  key: string;
  value: string;
}
export interface ProductDetailResponse extends APIResponse {
  data: ProductData;
}

export interface ProductEditPayload {
  itemId: number;
  attributes: Omit<ProductAttributePayload, "fieldName" | "dataType">[];
  isDeleted?: boolean;
}

export interface ProductSearchPayloadField {
  seriesId: number;
  filters: ProductSearchFilters[];
  isDeleted?: boolean;
  isArchived?: boolean;
}

export interface ProductSearchFilters {
  fieldId: number;
  value: string | number | boolean;
  operation?: ProductSearchPayloadOperation;
}

export enum ProductSearchPayloadOperation {
  EQUAL = "equal",
  GREATER = "greater",
  LESS = "less",
  RANGE = "range",
}

export interface ProductSearchResponse extends APIResponse {
  data: ProductData[];
  totalCount: number;
}

export interface ProductDeletePayload {
  itemId: number[];
}

export interface ArchiveProductResponse extends APIResponse {
  data: { skipped: number[] };
}

export interface ArchiveProductPayloadField {
  itemIds: number[];
}

export interface CopyProductPayloadField extends ArchiveProductPayloadField {}

export interface CopyProductResponse extends APIResponse {
  data: { id: number; seriesId: number }[];
}

export interface FieldAutoCompleteResponse extends APIResponse {
  data: string[];
}
