export interface SeriesResponse extends APIResponse {
  data: SeriesData[];
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
  fields: SeriesField[];
}

export interface SeriesField {
  name: string;
  dataType: SeriesFieldDataType;
  isFiltered: boolean;
  isRequired: boolean;
  id?: number
}

export enum SeriesFieldDataType {
  string = "string",
  number = "number",
  date = "datetime",
  boolean = "boolean",
}

export enum SeriesFieldKey {
  name = "name",
  dataType = "dataType",
  isFiltered = "isFiltered",
  isRequired = "isRequired",
}
