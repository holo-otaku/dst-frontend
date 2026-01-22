import { useState, useEffect, useMemo } from "react";
import SeriesForm from "./Form";
import {
  SeriesDetail,
  SeriesDetailResponse,
  SeriesEditPayload,
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
import { AxiosError } from "axios";

interface EditPayload {
  name: string;
  fields: SeriesField[];
}

const hasDiff = (original: SeriesDetail, current: EditPayload) => {
  if (original.name !== current.name) return true;
  if (original.fields.length !== current.fields.length) return true;

  const transformToCompareFormat = (data: SeriesDetail | EditPayload) =>
    // 比較所有可編輯的欄位，包含新增的 searchErp
    data.fields.map((field) => ({
      name: field.name,
      dataType: field.dataType,
      isFiltered: field.isFiltered,
      isRequired: field.isRequired,
      isErp: field.isErp,
      searchErp: field.searchErp, // 新增比較 searchErp
      isLimitField: field.isLimitField,
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
      sequence: 0,
      dataType: SeriesFieldDataType.string,
      isFiltered: false,
      isRequired: false,
      isErp: false,
      searchErp: false,
      isLimitField: false,
    },
  ]);
  const [name, setName] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const [
    { data: editResponse, loading: editLoading, error: editError },
    editSeries,
  ] = useAxios<APIResponse, SeriesEditPayload, APIResponse>(
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

  useEffect(() => {
    if (!id) return;
    void getDetail({
      url: `/series/${id}`,
    });
  }, [id, getDetail]);

  if (detailResponse && !isInitialized) {
    const { name, fields } = detailResponse.data;
    setName(name);
    setFields(fields);
    setIsInitialized(true);
  }

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
    const maxSequence = Math.max(
      ...newFields.map((field) => field.sequence),
      0
    );

    newFields.push({
      name: "",
      dataType: SeriesFieldDataType.string,
      isFiltered: false,
      isRequired: false,
      isErp: false,
      searchErp: false, // 新增預設值
      isLimitField: false,
      sequence: maxSequence + 1,
    });

    setFields(newFields);
  };

  const handleSubmit = () => {
    const payload = transformToEditPayload(name, fields, readonlyDetailData!);
    editSeries({
      url: `/series/${id!}`,
      data: payload,
    }).catch((e) =>
      alert(
        (e as AxiosError<APIError>).response?.data.msg || (e as Error).message
      )
    );
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

const transformToEditPayload = (
  name: string,
  fields: SeriesField[],
  original: SeriesDetail
) => {
  const newFields = fields.filter((field) => !field.id);
  const editFields = fields.filter((field) => field.id);
  const deleteFieldIds = original.fields
    .filter((field) => !fields.find((f) => f.id === field.id))
    .map((field) => field.id);

  const payload: SeriesEditPayload = {
    name,
    create: newFields,
    fields: editFields.map((field) => ({
      ...field,
      id: field.id!,
    })),
    delete: deleteFieldIds,
  };

  return payload;
};
