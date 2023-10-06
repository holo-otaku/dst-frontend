import { Button, Col, Form, Row, Stack } from "react-bootstrap";
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
import { useState, useEffect, useContext } from "react";
import {
  ProductAttributePayload,
  ProductDetailResponse,
  ProductEditPayload,
} from "./Interface";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@renderer/context";

export const Edit = () => {
  const navigate = useNavigate();
  const { getPayload } = useContext(AuthContext);
  const { permissions = [] } = getPayload();
  const { id } = useParams();
  const [{ data: seriesResponse, loading: seriesLoading }] =
    useAxios<SeriesResponse>({
      url: "/series",
      method: "GET",
      params: {
        showField: 1,
        limit: 100,
      },
    });
  const [{ data: productResponse, loading: productLoading }, loadProduct] =
    useAxios<ProductDetailResponse>(
      { method: "GET", url: `/product/${id}` },
      { manual: true }
    );
  const [{ loading: editProductLoading }, editProduct] = useAxios(
    {
      url: "/product/edit",
      method: "PATCH",
    },
    { manual: true }
  );
  const [selectedSeries, setSelectedSeries] = useState<number>(0);
  const [attributes, setAttributes] = useState<ProductAttributePayload[]>([]);
  const [{ data: seriesDetailResponse, loading: seriesDetailLoading }] =
    useAxios<SeriesDetailResponse>({
      method: "GET",
      url: `/series/${selectedSeries}`,
    });
  const canDelete = permissions.includes("product.delete");

  useEffect(() => {
    if (!productResponse) return;
    const product = productResponse.data;

    setSelectedSeries(product.seriesId);
    setAttributes(product.attributes);
  }, [productResponse]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [loadProduct]);

  const handleInputChange = (fieldId: number, value: string) => {
    const index = attributes.findIndex(
      (attribute) => attribute.fieldId === fieldId
    );
    const fieldDetail = fields?.find((field) => field.id === fieldId);
    let parsedValue: string | number | boolean = value;
    switch (fieldDetail?.dataType) {
      case SeriesFieldDataType.number:
        parsedValue = parseFloat(value);
        break;
      case SeriesFieldDataType.boolean:
        parsedValue = value === "true";
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

  const pageLoading =
    seriesLoading ||
    productLoading ||
    editProductLoading ||
    seriesDetailLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Row className="g-1 align-item-center">
        <Col xs="auto">
          <Button
            variant="danger"
            disabled={!canDelete}
            onClick={() => navigate(`/products/${id}/delete`)}
          >
            刪除
          </Button>
        </Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Select disabled={true}>
            <option>
              {series.find((series) => series.id === selectedSeries)?.name}
            </option>
          </Form.Select>
        </Col>
      </Row>
      <FormTable
        attributes={attributes}
        fields={fields || []}
        handleInputChange={handleInputChange}
        seriesDetail={seriesDetailResponse?.data}
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
