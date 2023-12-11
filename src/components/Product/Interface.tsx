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
}

export interface ProductSearchPayloadField {
  seriesId: number;
  filters: ProductSearchFilters[];
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
