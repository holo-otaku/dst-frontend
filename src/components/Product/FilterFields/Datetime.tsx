import { get } from "lodash";
import { InputGroup, Form } from "react-bootstrap";
import { IFilterProps } from "./types";
import { ProductSearchPayloadOperation } from "../Interface";

export const DatetimeFilter = ({
  title,
  handleChange,
  searchData,
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
    handleChange(event.currentTarget.value, operator);
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select value={operator} onChange={handleOperatorChange}>
        <option value={ProductSearchPayloadOperation.EQUAL}>=</option>
        <option value={ProductSearchPayloadOperation.GREATER}>{">="}</option>
        <option value={ProductSearchPayloadOperation.LESS}>{"<="}</option>
      </Form.Select>
      <Form.Control
        className="w-50"
        type="date"
        value={value}
        onChange={handleValueChange}
      />
    </InputGroup>
  );
};
