import { useState, useEffect, useMemo } from "react";
import SeriesForm from "./Form";
import {
  SeriesDetail,
  SeriesDetailResponse,
  SeriesEditFieldPayload,
  SeriesField,
  SeriesFieldDataType,
} from "./Interfaces";
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
import { cloneDeep, isEqual } from "lodash";

interface EditPayload {
  name: string;
  fields: SeriesField[];
}

const hasDiff = (original: SeriesDetail, current: EditPayload) => {
  if (original.name !== current.name) return true;
  if (original.fields.length !== current.fields.length) return true;

  const transformToCompareFormat = (data: SeriesDetail | EditPayload) =>
    // 只比較 name 跟 dataType
    data.fields.map((field) => ({
      name: field.name,
      dataType: field.dataType,
    }));

  return (
    isEqual(
      transformToCompareFormat(original),
      transformToCompareFormat(current)
    ) === false
  );
};

export const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [
    { data: editResponse, loading: editLoading, error: editError },
    editSeries,
  ] = useAxios<APIResponse, EditPayload, APIResponse>(
    {
      method: "PATCH",
    },
    {
      manual: true,
    }
  );
  const [{ data: detailResponse, loading: detailLoading }, getDetail] =
    useAxios<SeriesDetailResponse>(
      {
        method: "GET",
      },
      {
        manual: true,
      }
    );
  const readonlyDetailData = useMemo<SeriesDetail | undefined>(
    () => (detailResponse ? cloneDeep(detailResponse.data) : undefined),
    [detailResponse]
  );
  const [{ loading: editFieldLoading }, editField] = useAxios<
    APIResponse,
    SeriesEditFieldPayload
  >(
    {
      method: "PATCH",
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
    setName(name);
    setFields(fields);
  }, [detailResponse]);

  useEffect(() => {
    if (!editResponse) return;
    navigate("/series");
  }, [editResponse, navigate]);

  useEffect(() => {
    if (!editError) return;
    alert(
      `編輯失敗\n錯誤訊息: ${editError.response?.data.msg}\n錯誤代碼: ${editError.response?.data.code}`
    );
  }, [editError]);

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
    const payload: EditPayload = {
      name,
      fields,
    };
    void editSeries({
      url: `/series/${id!}`,
      data: payload,
    });
  };

  const hasModify =
    readonlyDetailData &&
    hasDiff(readonlyDetailData, {
      name,
      fields,
    });

  const isValidPayload = (() => {
    if (!name) return false;
    if (fields.length === 0) return false;
    for (const field of fields) {
      if (!field.name) return false;
    }
    return true;
  })();

  const pageLoading = editLoading || detailLoading || editFieldLoading;

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
      <SeriesForm {...{ fields, setFields, editField }} />
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
          disabled={!isValidPayload || !hasModify}
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
          返回
        </Button>
      </Stack>
    </Stack>
  );
};
