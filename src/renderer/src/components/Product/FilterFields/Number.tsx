import { get } from "lodash";
import { InputGroup, Form } from "react-bootstrap";
import { IFilterProps } from "./types";
import { ProductSearchPayloadOperation } from "../Interface";

export const NumberFilter = ({
  title,
  id = 0,
  handleChange,
  searchData,
  autoCompleteValues = [],
}: IFilterProps) => {
  const operator = get(
    searchData,
    "operation",
    ProductSearchPayloadOperation.EQUAL
  );
  const value = get(searchData, "value", "") as string;

  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    handleChange(
      value,
      event.currentTarget.value as ProductSearchPayloadOperation
    );
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(event.currentTarget.value);
    handleChange(num, operator);
  };

  const dataListId = `list-${id}`;

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select onChange={handleOperatorChange} value={operator}>
        <option value={ProductSearchPayloadOperation.EQUAL}>=</option>
        <option value={ProductSearchPayloadOperation.GREATER}>{">="}</option>
        <option value={ProductSearchPayloadOperation.LESS}>{"<="}</option>
      </Form.Select>
      <Form.Control
        value={value}
        onChange={handleValueChange}
        type="number"
        step="any"
        list={dataListId}
      />
      <datalist id={dataListId}>
        {autoCompleteValues.map((value) => (
          <option key={value} value={value} />
        ))}
      </datalist>
    </InputGroup>
  );
};
