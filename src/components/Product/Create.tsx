import { Alert, Button, Col, Form, Row, Stack } from "react-bootstrap";
import FormTable from "./FormTable";
import {
  SeriesDetailResponse,
  SeriesFieldDataType,
  SeriesResponse,
} from "../Series/Interfaces";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { get } from "lodash";
import { useState, useEffect } from "react";
import { ProductAttributePayload, ProductPayload } from "./Interface";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import moment from "moment";

export const Create = () => {
  const navigate = useNavigate();
  const [{ data: seriesResponse, loading: seriesLoading }, refetch] =
    useAxios<SeriesResponse>({
      url: "/series",
      method: "GET",
      params: {
        showField: 1,
        limit: 100,
      },
    });

  const [{ loading: createProductLoading }, createProduct] = useAxios(
    {
      url: "/product",
      method: "POST",
    },
    { manual: true }
  );

  useEffect(() => {
    void refetch();
    return () => {};
  }, [refetch]);

  const [selectedSeries, setSelectedSeries] = useState<number>(0);
  const [attributes, setAttributes] = useState<ProductAttributePayload[]>([]);
  const [
    { data: seriesDetailResponse, loading: seriesDetailLoading },
    fetchSeriesDetail,
  ] = useAxios<SeriesDetailResponse>(
    {
      method: "GET",
    },
    {
      manual: true,
    }
  );

  useEffect(() => {
    if (!selectedSeries) return;
    fetchSeriesDetail({
      url: `/series/${selectedSeries}`,
    });
  }, [selectedSeries]);

  const handleInputChange = (fieldId: number, value: string | boolean) => {
    const index = attributes.findIndex(
      (attribute) => attribute.fieldId === fieldId
    );
    const fieldDetail = fields?.find((field) => field.id === fieldId);
    let parsedValue: string | number | boolean = value;
    switch (fieldDetail?.dataType) {
      case SeriesFieldDataType.boolean:
        parsedValue = !!value;
        break;
      default:
        break;
    }

    if (index === -1) {
      setAttributes([
        ...attributes,
        {
          fieldId,
          value: parsedValue,
        },
      ]);
    } else {
      const newAttributes = [...attributes];
      newAttributes[index].value = parsedValue;
      setAttributes(newAttributes);
    }
  };

  const series = get(seriesResponse, "data", []) as SeriesResponse["data"];
  const fields = series.find((series) => series.id === selectedSeries)?.fields;

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeries(parseInt(event.currentTarget.value));
  };

  const handleSubmit = () => {
    // 因應日期格式，統一在送出前轉換成 yyyy/MM/dd
    const parsedAttributes = attributes.map((attribute) => {
      const currentFieldDetail = fields!.find(
        (field) => field.id === attribute.fieldId
      )!;
      if (/^\d{4}-\d{2}-\d{2}$/.test(attribute.value as string)) {
        return {
          ...attribute,
          value: moment(attribute.value as string).format("YYYY/MM/DD"),
        };
      }
      // 純數字的話轉成數字
      else if (
        /^[-\d.]+$/.test(attribute.value as string) &&
        currentFieldDetail.dataType === SeriesFieldDataType.number
      ) {
        return {
          ...attribute,
          value: parseFloat(attribute.value as string),
        };
      }
      return attribute;
    });

    const payload: ProductPayload = {
      seriesId: selectedSeries,
      attributes: parsedAttributes,
    };

    createProduct({
      data: [payload],
    })
      .then(() => navigate("/products"))
      .catch((e) =>
        alert(
          (e as AxiosError<APIError>).response?.data.msg || (e as Error).message
        )
      );
  };

  const pageLoading =
    seriesLoading || createProductLoading || seriesDetailLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Row className="mb-2">
        <Col>
          <Form.Select onChange={(e) => handleSelect(e)}>
            {[
              <option key={0} value={0}>
                請選擇系列
              </option>,
              ...series.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              )),
            ]}
          </Form.Select>
        </Col>
      </Row>
      {fields ? (
        <FormTable
          attributes={attributes}
          fields={fields}
          handleInputChange={handleInputChange}
          seriesDetail={seriesDetailResponse?.data}
        />
      ) : (
        <Alert variant="info">請選擇要將此產品新增到的系列</Alert>
      )}
      <Row className="g-1 justify-content-end">
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={pageLoading}
          >
            新增
          </Button>
        </Col>
        <Col xs="auto">
          <Button
            variant="secondary"
            onClick={() => {
              navigate("/products");
            }}
            disabled={pageLoading}
          >
            取消
          </Button>
        </Col>
      </Row>
    </Stack>
  );
};
