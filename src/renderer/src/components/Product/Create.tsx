import {
  Alert,
  Button,
  Col,
  Form,
  InputGroup,
  Row,
  Stack,
} from "react-bootstrap";
import FormTable from "./FormTable";
import { SeriesFieldDataType, SeriesResponse } from "../Series/Interfaces";
import useAxios from "axios-hooks";
import Backdrop from "../Backdrop/Backdrop";
import RingLoader from "react-spinners/RingLoader";
import { get } from "lodash";
import { useState, useEffect } from "react";
import { ProductAttributePayload, ProductPayload } from "./Interface";
import { useNavigate } from "react-router-dom";

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
  const [name, setName] = useState<string>("");
  const [attributes, setAttributes] = useState<ProductAttributePayload[]>([]);

  const handleInputChange = (fieldId: number, value: string | boolean) => {
    const index = attributes.findIndex(
      (attribute) => attribute.fieldId === fieldId
    );
    const fieldDetail = fields?.find((field) => field.id === fieldId);
    let parsedValue: string | number | boolean = value;
    switch (fieldDetail?.dataType) {
      case SeriesFieldDataType.number:
        parsedValue = parseFloat(value as string);
        break;
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
    const payload: ProductPayload = {
      seriesId: selectedSeries,
      name,
      attributes,
    };

    createProduct({
      data: [payload],
    })
      .then(() => navigate("/products"))
      .catch((e) => console.error(e));
  };

  const pageLoading = seriesLoading || createProductLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <p className="fs-2">新增產品</p>
      <Row className="g-1">
        <Col xs={12} md={3} lg={2}>
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
        <Col xs={12} md={9} lg={10}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">產品名稱</InputGroup.Text>
            <Form.Control
              placeholder="請輸入產品名稱"
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </InputGroup>
        </Col>
      </Row>
      {fields ? (
        <FormTable
          attributes={attributes}
          fields={fields}
          handleInputChange={handleInputChange}
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
