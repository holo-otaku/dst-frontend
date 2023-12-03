import { Table, Form, InputGroup, Button, Stack } from "react-bootstrap";
import { SeriesField, SeriesFieldDataType, SeriesFieldKey } from "./Interfaces";
import { BiMinus } from "react-icons/bi";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";

export interface SeriesFormProps {
  fields: SeriesField[];
  setFields: React.Dispatch<React.SetStateAction<SeriesField[]>>;
}

const SeriesForm = ({ fields, setFields }: SeriesFormProps) => {
  const handleEdit = (
    index: number,
    key: SeriesFieldKey,
    value: string | boolean
  ) => {
    const newFields = [...fields];
    switch (key) {
      case SeriesFieldKey.name:
        newFields[index].name = value as string;
        break;
      case SeriesFieldKey.dataType:
        newFields[index].dataType = value as SeriesFieldDataType;
        break;
      case SeriesFieldKey.isFiltered:
        newFields[index].isFiltered = value as boolean;
        break;
      case SeriesFieldKey.isRequired:
        newFields[index].isRequired = value as boolean;
        break;
      case SeriesFieldKey.isErp:
        newFields[index].isErp = value as boolean;
        break;
      case SeriesFieldKey.isLimitField:
        newFields[index].isLimitField = value as boolean;
        break;
    }
    setFields(newFields);
  };

  const handleDelete = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newFields = [...fields];
      const currentField = newFields[index];
      newFields[index - 1].sequence += 1; // Increase the sequence of the previous element to ensure the correct order
      newFields[index] = newFields[index - 1]; // Decrease the sequence of the current element to ensure the correct order
      currentField.sequence -= 1;
      newFields[index - 1] = currentField;
      setFields(newFields);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      const newFields = [...fields];
      const currentField = newFields[index];
      newFields[index + 1].sequence -= 1; // Decrease the sequence of the previous element to ensure the correct order
      newFields[index] = newFields[index + 1];
      currentField.sequence += 1; // Increase the sequence of the current element to ensure the correct order
      newFields[index + 1] = currentField;
      setFields(newFields);
    }
  };

  return (
    <Table striped bordered>
      <thead>
        <tr className="align-middle text-center">
          <th>調整</th>
          <th>#</th>
          <th>欄位名稱</th>
          <th>資料類型</th>
          <th>篩選條件</th>
          <th>必填</th>
          <th>Erp欄位</th>
          <th>限制讀取</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field, index) => (
          <tr key={index}>
            <td className={index === 0 ? "align-bottom" : ""}>
              <Stack>
                {index > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="p-0 mb-1"
                    onClick={() => handleMoveUp(index)}
                  >
                    <AiOutlineCaretUp />
                  </Button>
                )}
                {index < fields.length - 1 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="p-0"
                    onClick={() => handleMoveDown(index)}
                  >
                    <AiOutlineCaretDown />
                  </Button>
                )}
              </Stack>
            </td>
            <td className="align-middle text-center">{index + 1}</td>
            <td className="align-middle text-center">
              <InputGroup>
                <Form.Control
                  value={field.name}
                  isInvalid={field.name === ""}
                  onChange={(e) =>
                    handleEdit(index, SeriesFieldKey.name, e.target.value)
                  }
                />
              </InputGroup>
            </td>
            <td className="align-middle text-center">
              <Form.Select
                value={field.dataType}
                onChange={(e) =>
                  handleEdit(index, SeriesFieldKey.dataType, e.target.value)
                }
              >
                <option value="string">字串</option>
                <option value="number">數字</option>
                <option value="datetime">日期</option>
                <option value="boolean">布林值</option>
                <option value="picture">圖片</option>
              </Form.Select>
            </td>
            <td className="align-middle text-center">
              <Form.Check
                type="switch"
                className="fs-5"
                checked={field.isFiltered}
                onChange={(e) =>
                  handleEdit(index, SeriesFieldKey.isFiltered, e.target.checked)
                }
              />
            </td>
            <td className="align-middle text-center">
              <Form.Check
                type="switch"
                className="fs-5"
                checked={field.isRequired}
                onChange={(e) =>
                  handleEdit(index, SeriesFieldKey.isRequired, e.target.checked)
                }
              />
            </td>
            <td className="align-middle text-center">
              <Form.Check
                type="switch"
                className="fs-5"
                checked={field.isErp}
                onChange={(e) =>
                  handleEdit(index, SeriesFieldKey.isErp, e.target.checked)
                }
              />
            </td>
            <td className="align-middle text-center">
              <Form.Check
                type="switch"
                className="fs-5"
                checked={field.isLimitField}
                onChange={(e) =>
                  handleEdit(
                    index,
                    SeriesFieldKey.isLimitField,
                    e.target.checked
                  )
                }
              />
            </td>
            <td className="align-middle text-center">
              <Button
                variant="outline-danger"
                className="rounded-circle"
                size="sm"
                onClick={() => handleDelete(index)}
              >
                <BiMinus />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default SeriesForm;
