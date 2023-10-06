import {
  ProductSearchFilters,
  ProductSearchPayloadOperation,
} from "../Interface";

export interface IFilterProps {
  title: string;
  id?: number;
  handleChange: (
    value: string | number | boolean,
    operation?: ProductSearchPayloadOperation
  ) => void;
  searchData?: ProductSearchFilters;
  autoCompleteValues?: (string | number)[];
}
