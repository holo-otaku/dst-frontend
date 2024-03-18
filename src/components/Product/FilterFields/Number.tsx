import { useState, useEffect } from "react";
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
  const [range, setRange] = useState({ min: "0", max: "0" });
  const operator = get(
    searchData,
    "operation",
    ProductSearchPayloadOperation.EQUAL
  );
  const value = get(searchData, "value", "") as string;

  useEffect(() => {
    if (`${value}`.includes(",")) {
      const [min, max] = value.split(",");
      setRange({ min: min, max: max });
    }
  }, [value]);

  useEffect(() => {
    if (range.min && range.max && range.min !== range.max) {
      handleChange(
        `${range.min},${range.max}`,
        ProductSearchPayloadOperation.RANGE
      );
    }
  }, [range]);

  const handleOperatorChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const opValue = event.target.value as ProductSearchPayloadOperation;
    if (opValue === ProductSearchPayloadOperation.RANGE) {
      setRange({ min: "0", max: "0" });
      handleChange(`${range.min},${range.max}`, opValue);
    } else {
      handleChange(value, opValue);
    }
  };

  const handleRangeChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setRange({ ...range, min: value });
    } else if (type === "max") {
      setRange({ ...range, max: value });
    }
  };

  const dataListId = `list-${id}`;

  return (
    <InputGroup>
      <InputGroup.Text>{title}</InputGroup.Text>
      {ProductSearchPayloadOperation.RANGE === operator && (
        <Form.Control
          value={
            operator === ProductSearchPayloadOperation.RANGE ? range.min : value
          }
          onChange={(event) =>
            handleRangeChange("min", event.currentTarget.value)
          }
          type="number"
          step="any"
          list={dataListId}
        />
      )}
      <Form.Select onChange={handleOperatorChange} value={operator}>
        <option value={ProductSearchPayloadOperation.EQUAL}>=</option>
        <option value={ProductSearchPayloadOperation.GREATER}>{">="}</option>
        <option value={ProductSearchPayloadOperation.LESS}>{"<="}</option>
        <option value={ProductSearchPayloadOperation.RANGE}>{"~"}</option>
      </Form.Select>
      <Form.Control
        value={
          operator === ProductSearchPayloadOperation.RANGE ? range.max : value
        }
        onChange={(event) => {
          if (ProductSearchPayloadOperation.RANGE === operator) {
            handleRangeChange("max", event.currentTarget.value);
            return;
          }

          handleChange(event.currentTarget.value, operator);
        }}
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
