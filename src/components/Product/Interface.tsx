export interface ProductAttributePayload {
  fieldId: number;
  value: string | number | Boolean;
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
