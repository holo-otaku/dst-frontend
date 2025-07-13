import { useState, useEffect } from "react";
import useAxios from "axios-hooks";
import { FieldAutoCompleteResponse } from "../components/Product/Interface";

interface UseFieldAutoCompleteProps {
  fieldId: number;
  searchValue: string;
  debounceDelay?: number;
}

export const useFieldAutoComplete = ({
  fieldId,
  searchValue,
  debounceDelay = 300,
}: UseFieldAutoCompleteProps) => {
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);

  // Debounce search value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchValue, debounceDelay]);

  const [{ data, loading, error }, refetch] =
    useAxios<FieldAutoCompleteResponse>(
      {
        url: "/field/search",
        method: "GET",
        params: {
          field_id: fieldId,
          search_value: debouncedSearchValue,
        },
      },
      {
        manual: !debouncedSearchValue || debouncedSearchValue.length < 1,
      }
    );

  const autoCompleteValues = data?.data || [];

  return {
    autoCompleteValues,
    loading,
    error,
    refetch,
  };
};
