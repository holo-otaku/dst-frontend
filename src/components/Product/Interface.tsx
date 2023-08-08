export interface ProductAttributePayload {
  fieldId: number;
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
}

export interface ProductDetailResponse extends APIResponse {
  data: ProductData;
}

export interface ProductEditPayload {
  itemId: number;
  name: string;
  attributes: ProductAttributePayload[];
}

export interface ProductSearchPayloadField {
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
