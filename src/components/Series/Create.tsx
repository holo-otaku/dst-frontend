import { useState, useEffect } from "react";
import SeriesForm from "./Form";
import { SeriesField, SeriesFieldDataType } from "./Interfaces";
import {
  Stack,
  Button,
  OverlayTrigger,
  Tooltip,
  Form,
  InputGroup,
} from "react-bootstrap";
import { IoAddOutline } from "react-icons/io5";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

interface CreatePayload {
  name: string;
  fields: CreatePayloadField[];
}

interface CreatePayloadField {
  name: string;
  dataType: SeriesFieldDataType;
  isFiltered: 0 | 1;
  isRequired: 0 | 1;
  isErp: 0 | 1;
}

export const Create = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<SeriesField[]>([
    {
      name: "",
      dataType: SeriesFieldDataType.string,
      isFiltered: false,
      isRequired: false,
      isErp: false,
    },
  ]);
  const [name, setName] = useState("");
  const [{ data: createResponse, loading: createLoading }, createSeries] =
    useAxios<APIResponse, CreatePayload>(
      {
        url: "/series",
        method: "POST",
      },
      {
        manual: true,
      },
    );

  useEffect(() => {
    if (!createResponse) return;
    navigate("/series");
  }, [createResponse, navigate]);

  const handleAdd = () => {
    const newFields = [...fields];
    newFields.push({
      name: "",
      dataType: SeriesFieldDataType.string,
      isFiltered: false,
      isRequired: false,
      isErp: false,
    });
    setFields(newFields);
  };

  const handleSubmit = () => {
    const payload: CreatePayload = {
      name,
      fields: fields.map((field) => ({
        name: field.name,
        dataType: field.dataType,
        isFiltered: field.isFiltered ? 1 : 0,
        isRequired: field.isRequired ? 1 : 0,
        isErp: field.isErp ? 1 : 0,
      })),
    };
    createSeries({
      data: payload,
    }).then(
      () => undefined,
      () => undefined,
    );
  };

  const isValidPayload = (() => {
    if (!name) return false;
    if (fields.length === 0) return false;
    for (const field of fields) {
      if (!field.name) return false;
    }
    return true;
  })();

  return (
    <Stack gap={2}>
      <Backdrop show={createLoading}>
        <ScaleLoader color="#36d7b7" />
      </Backdrop>
      <Stack direction="horizontal" gap={3}>
        <InputGroup>
          <InputGroup.Text>系列</InputGroup.Text>
          <Form.Control
            isInvalid={name === ""}
            onChange={(e) => setName(e.target.value)}
          />
        </InputGroup>
      </Stack>
      <SeriesForm {...{ fields, setFields }} />
      <Stack direction="horizontal" gap={3} className="justify-content-center">
        <OverlayTrigger overlay={<Tooltip>新增欄位</Tooltip>}>
          <Button
            variant="info"
            className="p-2 d-flex align-items-center justify-content-center"
            onClick={handleAdd}
          >
            <IoAddOutline />
          </Button>
        </OverlayTrigger>
      </Stack>
      <Stack direction="horizontal" gap={3} className="mt-3">
        <div className="flex-grow-1" />
        <Button
          variant="primary"
          disabled={!isValidPayload}
          onClick={handleSubmit}
        >
          完成
        </Button>
        <Button
          variant="outline-warning"
          onClick={() => {
            navigate("/series");
          }}
        >
          取消
        </Button>
      </Stack>
    </Stack>
  );
};
