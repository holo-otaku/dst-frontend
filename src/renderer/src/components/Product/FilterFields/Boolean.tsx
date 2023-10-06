import { get } from "lodash";
import { InputGroup, Form } from "react-bootstrap";
import { IFilterProps } from "./types";

export const BooleanFilter = ({
  title,
  handleChange,
  searchData,
}: IFilterProps) => {
  const value = get(searchData, "value", false) as boolean;

  const handleValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(event.currentTarget.value === "true");
  };

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      <Form.Select
        value={value ? "true" : "false"}
        onChange={handleValueChange}
      >
        <option value="true">是</option>
        <option value="false">否</option>
      </Form.Select>
    </InputGroup>
  );
};
