import { SeriesField, SeriesFieldDataType } from "../Series/Interfaces";
import { Form, Table } from "react-bootstrap";
import { ProductAttributePayload } from "./Interface";

interface FormTableProps {
  fields: SeriesField[];
  attributes: ProductAttributePayload[];
  handleInputChange: (fieldId: number, value: string) => void;
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
              <Form.Control
                onChange={(e) => handleInputChange(field.id!, e.target.value)}
                value={
                  attributes.find((attr) => attr.fieldId === field.id)?.value ||
                  ""
                }
                type={getFormTypeByDataType(field.dataType)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
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
