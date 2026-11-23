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
import { useState, useEffect, useContext, useMemo } from "react";
import {
  ProductAttributePayload,
  ProductDetailResponse,
  ProductEditPayload,
} from "./Interface";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context";
import { AxiosError } from "axios";
import { fromInput, toInput, withAttribute } from "./attributeValue";
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
  const [editAttributesMap, setEditAttributesMap] = useState<
    Record<number, ProductAttributePayload[]>
  >({});
  const [
    { data: seriesDetailResponse, loading: seriesDetailLoading },
    fetchSeriesDetail,
  ] = useAxios<SeriesDetailResponse>(
    {
      method: "GET",
      url: "",
    },
    { manual: true }
  );
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

  const currentId = useMemo(() => (id ? parseInt(id) : undefined), [id]);

  const product = productResponse?.data;
  const selectedSeriesId = product?.seriesId ?? 0;

  const baseAttributes = useMemo(() => {
    if (!product) return [] as ProductAttributePayload[];
    return product.attributes.map((attribute) => ({
      ...attribute,
      value: toInput(
        attribute.dataType as SeriesFieldDataType,
        attribute.value
      ),
    }));
  }, [product]);

  const editAttributes = useMemo(() => {
    if (!currentId) return [] as ProductAttributePayload[];
    return editAttributesMap[currentId] || [];
  }, [currentId, editAttributesMap]);

  const displayAttributes = useMemo(() => {
    if (!editAttributes.length) return baseAttributes;
    const override = new Map<number, ProductAttributePayload>();
    editAttributes.forEach((attr) => override.set(attr.fieldId, attr));
    return baseAttributes.map((attr) => {
      const overridden = override.get(attr.fieldId);
      return overridden ? { ...attr, value: overridden.value } : attr;
    });
  }, [baseAttributes, editAttributes]);

  const handleCopy = async () => {
    if (!window.confirm("確定要複製這個商品嗎？")) {
      return;
    }

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

  const handleDeleteRestore = async () => {
    try {
      const newDeletedStatus = !isDeleted;
      const confirmMessage = isDeleted
        ? "確定要還原此商品嗎？"
        : "確定要刪除此商品嗎？";

      if (!window.confirm(confirmMessage)) {
        return;
      }

      const payload: ProductEditPayload = {
        itemId: parseInt(id!),
        attributes: [],
        isDeleted: newDeletedStatus,
      };

      await editProduct({
        data: [payload],
      });

      alert(isDeleted ? "商品已還原" : "商品已刪除");
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert(isDeleted ? "還原失敗" : "刪除失敗");
    }
  };

  const canDelete = permissions.includes("product.delete");
  const canCreate = permissions.includes("product.create");
  const isDeleted = get(productResponse, "data.isDeleted", false);
  const canArchive =
    permissions.includes("archive.create") &&
    get(productResponse, "data.hasArchive", false) === false;

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

  useEffect(() => {
    if (!selectedSeriesId) return;
    fetchSeriesDetail({ url: `/series/${selectedSeriesId}` });
  }, [fetchSeriesDetail, selectedSeriesId]);

  const handleInputChange = (fieldId: number, value: string) => {
    if (!currentId) return;
    const dataType = fields?.find((field) => field.id === fieldId)?.dataType;
    const parsedValue = fromInput(dataType, value);
    setEditAttributesMap((prev) => ({
      ...prev,
      [currentId]: withAttribute(prev[currentId] || [], fieldId, parsedValue),
    }));
  };

  const series = get(seriesResponse, "data", []) as SeriesResponse["data"];
  // 沒有 limit-field.read 時後端不回傳、也不接受限制欄位，表單不顯示
  const canReadLimit = permissions.includes("limit-field.read");
  const fields = series
    .find((series) => series.id === selectedSeriesId)
    ?.fields?.filter((field) => canReadLimit || !field.isLimitField);

  const handleSubmit = () => {
    const payload: ProductEditPayload = {
      itemId: parseInt(id!),
      attributes: editAttributes,
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
            variant={isDeleted ? "success" : "danger"}
            disabled={!canDelete}
            onClick={handleDeleteRestore}
          >
            {isDeleted ? "還原" : "刪除"}
          </Button>
        </Col>
        {permissions.includes("archive.create") && (
          <Col xs="auto">
            <Button
              variant={canArchive ? "primary" : "danger"}
              onClick={() => {
                const action = canArchive ? "封存" : "取消封存";
                if (!window.confirm(`確定要${action}這個商品嗎？`)) {
                  return;
                }

                if (canArchive) {
                  archiveProduct({ data: { itemIds: [currentId] } }).then(() =>
                    navigate("/products")
                  );
                } else {
                  deleteArchiveProduct({ data: { itemIds: [currentId] } }).then(
                    () => navigate("/products")
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
        {canCreate && (
          <Col xs="auto">
            <Button
              variant="success"
              onClick={handleCopy}
              disabled={pageLoading || copyProductLoading}
            >
              複製
            </Button>
          </Col>
        )}
      </Row>
      <Row className="mb-2">
        <Col>
          <Form.Select disabled={true}>
            <option>
              {series.find((series) => series.id === selectedSeriesId)?.name}
            </option>
          </Form.Select>
        </Col>
      </Row>
      <FormTable
        attributes={displayAttributes}
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
