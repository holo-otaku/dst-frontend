import { Table, Form, InputGroup, Button, ButtonGroup } from "react-bootstrap";
import { SeriesField, SeriesFieldDataType, SeriesFieldKey } from "./Interfaces";
import { BiMinus } from "react-icons/bi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa"; // Font Awesome 圖示

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
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = currentField;
      setFields(newFields);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) {
      const newFields = [...fields];
      const currentField = newFields[index];
      newFields[index] = newFields[index + 1];
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
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field, index) => (
          <tr key={index}>
            <td className="align-middle text-center">
              <ButtonGroup>
                {index > 0 && (
                  <Button
                    variant="outline-primary"
                    className="rounded-circle"
                    size="sm"
                    onClick={() => handleMoveUp(index)}
                  >
                    <FaArrowUp />
                  </Button>
                )}
                {index < fields.length - 1 && (
                  <Button
                    variant="outline-primary"
                    className="rounded-circle"
                    size="sm"
                    onClick={() => handleMoveDown(index)}
                  >
                    <FaArrowDown />
                  </Button>
                )}
              </ButtonGroup>
            </td>
            <td className="align-middle text-center">{index + 1}</td>
            <td>
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
            <td>
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
