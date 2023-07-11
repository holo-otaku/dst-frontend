import { Table, Form, InputGroup, Button } from "react-bootstrap";
import { SeriesField, SeriesFieldDataType, SeriesFieldKey } from "./Interfaces";
import { BiMinus } from "react-icons/bi";

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
    }
    setFields(newFields);
  };

  const handleDelete = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>#</th>
          <th>名稱</th>
          <th>資料類型</th>
          <th>篩選條件</th>
          <th>必填</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((field, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
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
                <option value="date">日期</option>
                <option value="boolean">布林值</option>
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
