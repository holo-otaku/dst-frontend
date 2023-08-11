export interface ProductAttributePayload {
  fieldId: number;
  fieldName: string;
  dataType: string;
  value: string | number | boolean;
}

export interface ProductPayload {
  seriesId: number;
  name: string;
  attributes: ProductAttributePayload[];
}

export interface ProductData {
  itemId: number;
  seriesId: number;
  name: string;
  attributes: ProductAttributePayload[];
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
  name: string;
  attributes: Omit<ProductAttributePayload, ["fieldName", "dataType"]>[];
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
}

export interface ProductSearchResponse extends APIResponse {
  data: ProductData[];
}
