import { useState, useEffect } from "react";
import useAxios from "axios-hooks";
import { FieldAutoCompleteResponse } from "../components/Product/Interface";

interface UseFieldAutoCompleteProps {
  fieldId: number;
  searchValue: string;
  debounceDelay?: number;
  loadOnFocus?: boolean;
}

export const useFieldAutoComplete = ({
  fieldId,
  searchValue,
  debounceDelay = 300,
  loadOnFocus = false,
}: UseFieldAutoCompleteProps) => {
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [hasBeenFocused, setHasBeenFocused] = useState(!loadOnFocus);

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
        manual:
          !hasBeenFocused &&
          (!debouncedSearchValue || debouncedSearchValue.length < 1),
      }
    );

  const autoCompleteValues = data?.data || [];

  const handleFocus = () => {
    if (loadOnFocus && !hasBeenFocused) {
      setHasBeenFocused(true);
      if (!debouncedSearchValue || debouncedSearchValue.length < 1) {
        refetch();
      }
    }
  };

  return {
    autoCompleteValues,
    loading,
    error,
    refetch,
    onFocus: handleFocus,
  };
};
