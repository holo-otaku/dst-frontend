import { get } from "lodash";
import { InputGroup, Form } from "react-bootstrap";
import { IFilterProps } from "./types";
import { useFieldAutoComplete } from "../../../hooks";

export const StringFilter = ({
  title,
  id = 0,
  handleChange,
  searchData,
}: IFilterProps) => {
  const value = get(searchData, "value", "") as string;

  const { autoCompleteValues, onFocus } = useFieldAutoComplete({
    fieldId: id,
    searchValue: value,
    loadOnFocus: true,
  });

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event.currentTarget.value);
  };

  const dataListId = `list-${id}`;

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Control
        list={dataListId}
        type="text"
        value={value}
        onChange={handleValueChange}
        onFocus={onFocus}
      />
      <datalist id={dataListId}>
        {autoCompleteValues.map((value, index) => (
          <option key={`${value}-${index}`} value={value} />
        ))}
      </datalist>
    </InputGroup>
  );
};
