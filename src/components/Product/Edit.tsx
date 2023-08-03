import { Button, Col, Form, InputGroup, Row, Stack } from "react-bootstrap";
import FormTable from "./FormTable";
import { SeriesFieldDataType, SeriesResponse } from "../Series/Interfaces";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { get } from "lodash";
import { useState, useEffect } from "react";
import {
  ProductAttributePayload,
  ProductDetailResponse,
  ProductEditPayload,
} from "./Interface";
import { useNavigate, useParams } from "react-router-dom";

export const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [{ data: seriesResponse, loading: seriesLoading }] =
    useAxios<SeriesResponse>({
      url: "/series",
      method: "GET",
      params: {
        showField: 1,
      },
    });
  const [{ data: productResponse, loading: productLoading }] =
    useAxios<ProductDetailResponse>({ method: "GET", url: `/product/${id}` });
  const [{ loading: editProductLoading }, editProduct] = useAxios(
    {
      url: "/product/edit",
      method: "PATCH",
    },
    { manual: true },
  );
  const [selectedSeries, setSelectedSeries] = useState<number>(0);
  const [name, setName] = useState<string>(
    get(productResponse, "data.name", ""),
  );
  const [attributes, setAttributes] = useState<ProductAttributePayload[]>([]);

  useEffect(() => {
    if (!productResponse) return;
    const product = productResponse.data;

    setSelectedSeries(product.seriesId);
    setName(product.name);
    setAttributes(product.attributes);
  }, [productResponse]);

  const handleInputChange = (fieldId: number, value: string) => {
    const index = attributes.findIndex(
      (attribute) => attribute.fieldId === fieldId,
    );
    const fieldDetail = fields?.find((field) => field.id === fieldId);
    let parsedValue: string | number = value;
    switch (fieldDetail?.dataType) {
      case SeriesFieldDataType.number:
        parsedValue = parseInt(value);
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

  const handleSubmit = () => {
    const payload: ProductEditPayload = {
      itemId: parseInt(id!),
      name,
      attributes,
    };

    editProduct({
      data: [payload],
    })
      .then(() => {
        navigate("/products");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const pageLoading = seriesLoading || productLoading || editProductLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <p className="fs-2">修改產品資訊</p>
      <Row className="g-1">
        <Col xs={12} md={3} lg={2}>
          <Form.Select disabled={true}>
            <option>
              {series.find((series) => series.id === selectedSeries)?.name}
            </option>
          </Form.Select>
        </Col>
        <Col xs={12} md={9} lg={10}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">產品名稱</InputGroup.Text>
            <Form.Control
              placeholder="請輸入產品名稱"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </InputGroup>
        </Col>
      </Row>
      <FormTable
        attributes={attributes}
        fields={fields || []}
        handleInputChange={handleInputChange}
      />
      <Row className="g-1 justify-content-end">
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={pageLoading}
          >
            儲存
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
