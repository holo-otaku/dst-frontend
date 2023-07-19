export interface SeriesResponse extends APIResponse {
  data: SeriesData[];
}

export interface SeriesDetailResponse extends APIResponse {
  data: SeriesDetail;
}

export interface SeriesData {
  createdAt: Date;
  createdBy: string;
  id: number;
  name: string;
}

export interface SeriesDetail extends SeriesData {
  fields: SeriesField[];
}

export interface SeriesField {
  name: string;
  dataType: SeriesFieldDataType;
  isFiltered: boolean;
  isRequired: boolean;
}

export enum SeriesFieldDataType {
  string = "string",
  number = "number",
  date = "date",
  boolean = "boolean",
}

export enum SeriesFieldKey {
  name = "name",
  dataType = "dataType",
  isFiltered = "isFiltered",
  isRequired = "isRequired",
}
