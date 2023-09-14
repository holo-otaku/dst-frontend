import { SeriesField, SeriesFieldDataType } from "../Series/Interfaces";
import { Form, Table, Image } from "react-bootstrap";
import { ProductAttributePayload } from "./Interface";
import moment from "moment";
import { useState, useEffect } from "react";

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
          <th>資料</th>
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
  { handleInputChange, attributes }: Omit<FormTableProps, "fields">
) => {
  const dataType = getFormTypeByDataType(field.dataType);
  const currentAttribute = attributes.find((attr) => attr.fieldId === field.id);
  const fieldValue = currentAttribute?.value;

  switch (dataType) {
    case "switch":
      return (
        <Form.Check
          type="switch"
          id={`switch-${field.id}`}
          onChange={(e) =>
            handleInputChange(
              field.id as number,
              e.target.checked ? "true" : "false"
            )
          }
          checked={fieldValue === true}
          isInvalid={field.isRequired && fieldValue === ""}
        />
      );
    case "datetime":
      return (
        <Form.Control
          onChange={(e) =>
            handleInputChange(field.id as number, e.target.value)
          }
          value={fieldValue !== "" ? (fieldValue as string) : getTodayDate()} // Set the value to fieldValue or today's date
          type="date" // Use "date" to show only the date picker without time
          isInvalid={field.isRequired && fieldValue === ""}
        />
      );
    case "picture":
      return (
        <PictureFormControl
          handleInputChange={handleInputChange}
          field={field}
          fieldValue={fieldValue}
        />
      );
  }

  return (
    <Form.Control
      onChange={(e) => handleInputChange(field.id as number, e.target.value)}
      value={fieldValue as string}
      type={dataType}
      {...(dataType === "number" && { step: "any" })}
      isInvalid={field.isRequired && fieldValue === ""}
    />
  );
};

interface PictureFormControlProps {
  handleInputChange: (fieldId: number, value: string) => void;
  field: SeriesField;
  fieldValue: string;
}

const PictureFormControl = ({
  handleInputChange,
  field,
  fieldValue,
}: PictureFormControlProps) => {
  const [picture, setPicture] = useState<string | null>();
  const serverBaseUrl = localStorage.getItem("server") || ""; // Get server base URL from localStorage
  useEffect(() => {
    setPicture(`${serverBaseUrl}${fieldValue}`);
  }, []);
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPicture(null);
      handleInputChange(field.id as number, "");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Content = e.target?.result as string;
      setPicture(base64Content);
      handleInputChange(field.id as number, base64Content);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Form.Control
        onChange={handleFileInputChange}
        type="file"
        accept="image/*"
        isInvalid={field.isRequired && !picture}
      />
      {picture && (
        <div className="mt-2">
          <Form.Label>預覽</Form.Label>
          <div className="d-flex align-items-center">
            <Image src={picture} alt="Uploaded" style={{ maxWidth: "100%" }} />
          </div>
        </div>
      )}
    </div>
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
    case "picture":
      return "picture";
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
    case "picture":
      return "圖片";
    default:
      return "未知";
  }
};

export default FormTable;
