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
  isErp: boolean;
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
