import { useState, useEffect } from "react";
import SeriesForm from "./Form";
import { SeriesDetail, SeriesField, SeriesFieldDataType } from "./Interfaces";
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
import { useNavigate, useParams } from "react-router-dom";

interface EditResponse {
  code: number;
  msg: string;
}

interface DetailResponse {
  code: number;
  msg: string;
  data: SeriesDetail;
}

interface EditPayload {
  name: string;
  fields: EditPayloadField[];
}

interface EditPayloadField {
  name: string;
  dataType: SeriesFieldDataType;
  isFiltered: 0 | 1;
  isRequired: 0 | 1;
}

export const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fields, setFields] = useState<SeriesField[]>([
    {
      name: "",
      dataType: SeriesFieldDataType.string,
      isFiltered: false,
      isRequired: false,
    },
  ]);
  const [name, setName] = useState("");
  const [{ data: editResponse, loading: editLoading }, editSeries] = useAxios<
    EditResponse,
    EditPayload
  >(
    {
      method: "PATCH",
    },
    {
      manual: true,
    }
  );
  const [{ data: detailResponse, loading: detailLoading }, getDetail] =
    useAxios<DetailResponse>(
      {
        method: "GET",
      },
      {
        manual: true,
      }
    );

  useEffect(() => {
    if (!id) return;
    void getDetail({
      url: `/series/${id}`,
    });
  }, [id, getDetail]);

  useEffect(() => {
    if (!detailResponse) return;

    const { name, fields } = detailResponse.data;
    console.log(name, fields);
    setName(name);
    setFields(fields);
  }, [detailResponse]);

  useEffect(() => {
    if (!editResponse) return;
    navigate("/series");
  }, [editResponse, navigate]);

  const handleAdd = () => {
    const newFields = [...fields];
    newFields.push({
      name: "",
      dataType: SeriesFieldDataType.string,
      isFiltered: false,
      isRequired: false,
    });
    setFields(newFields);
  };

  const handleSubmit = () => {
    const payload: EditPayload = {
      name,
      fields: fields.map((field) => ({
        name: field.name,
        dataType: field.dataType,
        isFiltered: field.isFiltered ? 1 : 0,
        isRequired: field.isRequired ? 1 : 0,
      })),
    };
    void editSeries({
      url: `/series/${id!}`,
      data: payload,
    });
  };

  const isValidPayload = (() => {
    if (!name) return false;
    if (fields.length === 0) return false;
    for (const field of fields) {
      if (!field.name) return false;
    }
    return true;
  })();

  const pageLoading = editLoading || detailLoading;

  return (
    <Stack gap={2}>
      <Backdrop show={pageLoading}>
        <ScaleLoader color="#36d7b7" />
      </Backdrop>
      <Stack direction="horizontal" gap={3}>
        <InputGroup>
          <InputGroup.Text>系列</InputGroup.Text>
          <Form.Control
            isInvalid={name === ""}
            defaultValue={name}
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
