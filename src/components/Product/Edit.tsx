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
import { AuthContext } from "../../context";
import { AxiosError } from "axios";
import moment from "moment";
import { parseAttributes } from "../../utils/attributeParser";
import useCopyProduct from "../../hooks/useCopyProduct";

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
  const [editAttributes, setEditAttributes] = useState<
    ProductAttributePayload[]
  >([]);
  const [{ data: seriesDetailResponse, loading: seriesDetailLoading }] =
    useAxios<SeriesDetailResponse>({
      method: "GET",
      url: `/series/${selectedSeries}`,
    });
  const [{ loading: archiveLoading }, archiveProduct] = useAxios(
    {
      method: "POST",
      url: "archive",
    },
    { manual: true }
  );
  const [{ loading: deleteArchiveLoading }, deleteArchiveProduct] = useAxios(
    {
      method: "DELETE",
      url: "archive",
    },
    { manual: true }
  );
  const { loading: copyProductLoading, copyProduct } = useCopyProduct();

  const handleCopy = async () => {
    try {
      const response = await copyProduct({
        data: { itemIds: [parseInt(id!)] },
      });

      const copied = get(response.data, "data");
      if (Array.isArray(copied) && copied.length > 0) {
        const newId = copied[0].id;

        const confirmNavigate =
          window.confirm("商品已複製，是否前往新商品頁面？");
        if (confirmNavigate) {
          navigate(`/products/${newId}/edit`);
        }
      } else {
        alert("複製成功，但找不到新商品 ID");
      }
    } catch (err) {
      console.error(err);
      alert("複製失敗");
    }
  };

  const canDelete = permissions.includes("product.delete");
  const canArchive =
    permissions.includes("archive.create") &&
    get(productResponse, "data.hasArchive", false) === false;

  useEffect(() => {
    if (!productResponse) return;
    const product = productResponse.data;

    setSelectedSeries(product.seriesId);
    // 因為日期格式是 yyyy/MM/dd，所以這邊要轉換成這樣的格式 yyyy-MM-dd
    const parsedAttributes = product.attributes.map((attribute) => {
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(attribute.value as string)) {
        return {
          ...attribute,
          value: moment(attribute.value as string).format("YYYY-MM-DD"),
        };
      }
      return attribute;
    });
    setAttributes(parsedAttributes);
  }, [productResponse]);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [loadProduct]);

  const handleInputChange = (fieldId: number, value: string) => {
    // 這邊整理出要送出的資料格式
    const index = editAttributes.findIndex(
      (attribute) => attribute.fieldId === fieldId
    );
    const fieldDetail = fields?.find((field) => field.id === fieldId);
    let parsedValue: string | number | boolean = value;
    switch (fieldDetail?.dataType) {
      case SeriesFieldDataType.boolean:
        parsedValue = value === "true";
        break;
      default:
        break;
    }

    if (index === -1) {
      setEditAttributes([
        ...editAttributes,
        {
          fieldId,
          value: parsedValue,
        },
      ]);
    } else {
      const newAttributes = [...editAttributes];
      newAttributes[index].value = parsedValue;
      setEditAttributes(newAttributes);
    }

    // 這邊整理出要顯示的資料格式
    const attributeIndex = attributes.findIndex(
      (attribute) => attribute.fieldId === fieldId
    );
    if (attributeIndex === -1) {
      setAttributes([
        ...attributes,
        {
          fieldId,
          value,
        },
      ]);
    } else {
      const newAttributes = [...attributes];
      newAttributes[attributeIndex].value = value;
      setAttributes(newAttributes);
    }
  };

  const series = get(seriesResponse, "data", []) as SeriesResponse["data"];
  const fields = series.find((series) => series.id === selectedSeries)?.fields;

  const handleSubmit = () => {
    const parsedAttributes = parseAttributes(editAttributes);

    const payload: ProductEditPayload = {
      itemId: parseInt(id!),
      attributes: parsedAttributes,
    };

    editProduct({
      data: [payload],
    })
      .then(() => {
        navigate("/products");
      })
      .catch((e) => {
        alert(
          (e as AxiosError<APIError>).response?.data.msg || (e as Error).message
        );
      });
  };

  const pageLoading =
    seriesLoading ||
    productLoading ||
    editProductLoading ||
    seriesDetailLoading ||
    archiveLoading ||
    copyProductLoading;

  return (
    <Stack>
      <Backdrop show={pageLoading}>
        <RingLoader color="#36d7b7" />
      </Backdrop>
      <Row className="mb-1 g-1 align-item-center">
        <Col xs="auto">
          <Button
            variant="danger"
            disabled={!canDelete}
            onClick={() => navigate(`/products/${id}/delete`)}
          >
            刪除
          </Button>
        </Col>
        {permissions.includes("archive.create") && (
          <Col xs="auto">
            <Button
              variant={canArchive ? "primary" : "danger"}
              onClick={() => {
                if (canArchive) {
                  archiveProduct({ data: { itemIds: [id] } }).then(() =>
                    navigate("/products")
                  );
                } else {
                  deleteArchiveProduct({ data: { itemIds: [id] } }).then(() =>
                    navigate("/products")
                  );
                }
              }}
              disabled={
                pageLoading ||
                (canArchive && archiveLoading) ||
                (!canArchive && deleteArchiveLoading)
              }
            >
              {canArchive ? "封存" : "取消封存"}
            </Button>
          </Col>
        )}
        <Col xs="auto">
          <Button
            variant="success"
            onClick={handleCopy}
            disabled={pageLoading || copyProductLoading}
          >
            複製
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
