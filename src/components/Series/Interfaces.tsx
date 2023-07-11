export interface SeriesMutliResponse {
  code: number;
  data: SeriesData[];
  msg: string;
}

export interface SeriesData {
  createdAt: Date;
  createdBy: string;
  id: number;
  name: string;
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
