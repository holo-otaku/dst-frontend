import { SeriesField, SeriesFieldDataType } from "../Series/Interfaces";
import { Form, Table } from "react-bootstrap";
import { ProductAttributePayload } from "./Interface";
import moment from "moment";

interface FormTableProps {
  fields: SeriesField[];
  attributes: ProductAttributePayload[];
  handleInputChange: (fieldId: number, value: string | boolean) => void;
}

const FormTable = ({
  fields,
  handleInputChange,
  attributes,
}: FormTableProps) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>欄位名稱</th>
          <th>資料類型</th>
          <th>數值</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field) => (
          <tr key={field.id}>
            <td>{field.name}</td>
            <td>{getDataType(field.dataType)}</td>
            <td>
              {renderFormControl(field, { handleInputChange, attributes })}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const renderFormControl = (
  field: SeriesField,
  { handleInputChange, attributes }: FormTableProps,
) => {
  const dataType = getFormTypeByDataType(field.dataType);
  const fieldValue =
    attributes.find((attr) => attr.fieldId === field.id)?.value || "";
  if (dataType === "switch") {
    return (
      <Form.Check
        type="switch"
        id={`switch-${field.id}`}
        label={field.name}
        onChange={(e) => handleInputChange(field.id, e.target.checked)}
        checked={fieldValue === true}
        isInvalid={field.isRequired && fieldValue === ""}
      />
    );
  } else if (dataType === "datetime") {
    return (
      <Form.Control
        onChange={(e) => handleInputChange(field.id, e.target.value)}
        value={fieldValue !== "" ? fieldValue : getTodayDate()} // Set the value to fieldValue or today's date
        type="date" // Use "date" to show only the date picker without time
        isInvalid={field.isRequired && fieldValue === ""}
      />
    );
  }

  // Default to a text input for other data types
  return (
    <Form.Control
      onChange={(e) => handleInputChange(field.id, e.target.value)}
      value={fieldValue || ""}
      type={dataType}
      isInvalid={field.isRequired && fieldValue === ""}
    />
  );
};

const getTodayDate = () => {
  return moment().format("YYYY-MM-DD");
};

const getFormTypeByDataType = (dataType: SeriesFieldDataType) => {
  switch (dataType) {
    case "string":
      return "text";
    case "number":
      return "number";
    case "datetime":
      return "datetime";
    case "boolean":
      return "switch";
    default:
      return "text";
  }
};

const getDataType = (dataType: SeriesFieldDataType) => {
  switch (dataType) {
    case "string":
      return "字串";
    case "number":
      return "數字";
    case "datetime":
      return "日期";
    case "boolean":
      return "布林值";
    default:
      return "未知";
  }
};

export default FormTable;
