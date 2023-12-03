export interface SeriesResponse extends APIResponse {
  data: SeriesData[];
  totalCount: number;
}

export interface SeriesDetailResponse extends APIResponse {
  data: SeriesDetail;
}

export interface SeriesData {
  id: number;
  name: string;
  fields?: SeriesField[];
  createdAt: Date;
  createdBy: string;
}

export interface SeriesDetail extends SeriesData {
  fields: SeriesDetailField[];
}

export interface SeriesDetailField extends SeriesField {
  id: number;
  values: (string | number)[];
}

export interface SeriesField {
  name: string;
  dataType: SeriesFieldDataType;
  isFiltered: boolean;
  isRequired: boolean;
  isErp: boolean;
  sequence: number;
  id?: number;
}

export enum SeriesFieldDataType {
  string = "string",
  number = "number",
  date = "datetime",
  boolean = "boolean",
  picture = "picture",
}

export enum SeriesFieldKey {
  name = "name",
  dataType = "dataType",
  isFiltered = "isFiltered",
  isRequired = "isRequired",
  isErp = "isErp",
}

export enum SeriesSwitchKey {
  isFiltered = "isFiltered",
  isRequired = "isRequired",
  isErp = "isErp",
}

export interface SeriesEditFieldPayload {
  isFiltered?: boolean;
  isRequired?: boolean;
  isErp?: boolean;
}

export interface SeriesEditPayload {
  name?: string;
  fields?: SeriesEditFields[];
  create?: SeriesEditNewField[];
  delete?: number[];
}

export interface SeriesEditFields {
  id: number;
  name: string;
  dataType: SeriesFieldDataType;
  isFiltered: boolean;
  isRequired: boolean;
}

export type SeriesEditNewField = Omit<SeriesEditFields, "id">;
