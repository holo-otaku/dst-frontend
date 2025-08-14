import {
  SeriesDetailField,
  SeriesDetailResponse,
  SeriesField,
  SeriesFieldDataType,
} from "../Series/Interfaces";
import { Form, Table, Image, Button } from "react-bootstrap";
import { ProductAttributePayload } from "./Interface";
import moment from "moment";
import { useState, useEffect, useRef } from "react";
import useAxios from "axios-hooks";

interface FormTableProps {
  fields: SeriesField[];
  attributes: ProductAttributePayload[];
  handleInputChange: (fieldId: number, value: string) => void;
  seriesDetail?: SeriesDetailResponse["data"];
}

const FormTable = ({
  fields,
  handleInputChange,
  attributes,
  seriesDetail,
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
        {fields.map((field) => {
          const targetFieldData = seriesDetail?.fields.find(
            (fieldData) => fieldData.id === field.id
          );
          const autoCompleteValues = targetFieldData?.values;
          return (
            <tr key={field.id}>
              <td>{field.name}</td>
              <td>{getDataType(field.dataType)}</td>
              <td>
                {renderFormControl(
                  field,
                  { handleInputChange, attributes },
                  autoCompleteValues
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

const renderFormControl = (
  field: SeriesField,
  {
    handleInputChange,
    attributes,
  }: Omit<FormTableProps, "fields" | "seriesDetail">,
  autoCompleteValues?: SeriesDetailField["values"]
) => {
  const dataType = getFormTypeByDataType(field.dataType);
  const currentAttribute = attributes.find((attr) => attr.fieldId === field.id);
  const fieldValue = currentAttribute?.value;
  const dataListId = `datalist-${field.id}`;

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
          defaultChecked={fieldValue === "true"}
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
      if (
        !["string", "undefined"].includes(typeof fieldValue) &&
        !(fieldValue === null)
      ) {
        return null;
      }

      return (
        <PictureFormControl
          handleInputChange={handleInputChange}
          field={field}
          fieldValue={(fieldValue as string) || ""}
        />
      );

    case "text":
      return (
        <textarea
          onChange={(e) =>
            handleInputChange(field.id as number, e.target.value)
          }
          value={fieldValue as string}
          rows={4}
          style={{ width: "100%" }} // 設定寬度為100%
        />
      );
  }

  return (
    <>
      <Form.Control
        onChange={(e) => handleInputChange(field.id as number, e.target.value)}
        value={fieldValue as string}
        type={dataType}
        {...(dataType === "number" && { step: "any" })}
        isInvalid={field.isRequired && fieldValue === ""}
        list={dataListId}
      />

      {autoCompleteValues && (
        <datalist id={dataListId}>
          {autoCompleteValues.map((value) => (
            <option key={value} value={value} />
          ))}
        </datalist>
      )}
    </>
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
  const elfileRef = useRef<HTMLInputElement>(null);

  const [, fetchImage] = useAxios<Blob>(
    {
      method: "GET",
      responseType: "blob",
    },
    { manual: true }
  );

  useEffect(() => {
    // 有可能進來的是 base64 的圖片，所以要先判斷
    if (fieldValue.startsWith("/image")) {
      // 使用 axios 呼叫 /image/{fieldValue} API
      const imageId = fieldValue.replace("/image/", "");
      fetchImage({
        url: `/image/${imageId}`,
      })
        .then((response) => {
          const blobUrl = URL.createObjectURL(response.data);
          setPicture(blobUrl);
        })
        .catch((error) => {
          console.error("Failed to fetch image:", error);
          setPicture(fieldValue); // fallback
        });
    } else {
      setPicture(fieldValue);
    }
  }, [fieldValue, fetchImage]);
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
      <Form.Group controlId="formImage">
        <Form.Text className="text-muted">
          僅支援圖片格式 (png, jpg, jpeg)
        </Form.Text>
        <Form.Control
          onChange={handleFileInputChange}
          type="file"
          accept="image/*"
          isInvalid={field.isRequired && !picture}
          className="mb-2"
          ref={elfileRef}
        />
        {picture && (
          <Button
            variant="outline-secondary"
            onClick={() => {
              setPicture(null);
              handleInputChange(field.id as number, "");
              elfileRef.current?.value && (elfileRef.current.value = "");
            }}
          >
            移除
          </Button>
        )}
      </Form.Group>
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
    case SeriesFieldDataType.string:
      return "text";
    case SeriesFieldDataType.number:
      return "number";
    case SeriesFieldDataType.date:
      return "datetime";
    case SeriesFieldDataType.boolean:
      return "switch";
    case SeriesFieldDataType.picture:
      return "picture";
    default:
      return "text";
  }
};

const getDataType = (dataType: SeriesFieldDataType) => {
  switch (dataType) {
    case SeriesFieldDataType.string:
      return "字串";
    case SeriesFieldDataType.number:
      return "數字";
    case SeriesFieldDataType.date:
      return "日期";
    case SeriesFieldDataType.boolean:
      return "布林值";
    case SeriesFieldDataType.picture:
      return "圖片";
    default:
      return "未知";
  }
};

export default FormTable;
