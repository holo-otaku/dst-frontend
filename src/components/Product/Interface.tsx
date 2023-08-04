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

export interface ProductDetailResponse {
  data: ProductData;
}

export interface ProductEditPayload {
  itemId: number;
  name: string;
  attributes: ProductAttributePayload[];
}
