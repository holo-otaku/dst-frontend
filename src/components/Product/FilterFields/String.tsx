import { get } from "lodash";
import { InputGroup, Form } from "react-bootstrap";
import { IFilterProps } from "./types";

export const StringFilter = ({
  title,
  id = 0,
  handleChange,
  searchData,
  autoCompleteValues = [],
}: IFilterProps) => {
  const value = get(searchData, "value", "") as string;

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
      />
      <datalist id={dataListId}>
        {autoCompleteValues.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
    </InputGroup>
  );
};
