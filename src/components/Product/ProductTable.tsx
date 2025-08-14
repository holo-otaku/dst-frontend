import { Image, Alert } from "react-bootstrap";
import { ProductData } from "./Interface";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../../src/styles/table-sticky.css";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import useAxios from "axios-hooks";

interface ProductTableProps {
  products: ProductData[];
  sortState: { fieldId: number; order: "asc" | "desc" };
  setSortState: (sortState: { fieldId: number; order: "asc" | "desc" }) => void;
  showCheckbox: boolean;
  selectedIds: Set<number>;
  toggleCheckbox: (id: number) => void;
  handleHeaderCheckbox: () => void;
}

const ProductTable = ({
  products,
  sortState,
  setSortState,
  showCheckbox,
  selectedIds,
  toggleCheckbox,
  handleHeaderCheckbox,
}: ProductTableProps) => {
  const [maxHeight, setMaxHeight] = useState("400px");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(`${window.innerHeight * 0.6}px`);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentPageIds = products.map((p) => p.itemId);
  const isAllSelected = currentPageIds.every((id) => selectedIds.has(id));

  const attributes = get(
    products,
    "[0].attributes",
    [] as ProductData["attributes"]
  );
  const erpAttributes = get(products, "[0].erp", [] as ProductData["erp"]);

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  const handleSortLogic = (fieldId: number) => {
    const isSorted = sortState.fieldId === fieldId;
    const needResetSort = isSorted && sortState.order === "desc";
    const sortFieldId = needResetSort ? -1 : fieldId;
    const sort = isSorted === false ? "asc" : needResetSort ? "asc" : "desc";
    const sortIcon = isSorted ? (
      sort === "asc" ? (
        <FaSortUp />
      ) : (
        <FaSortDown />
      )
    ) : (
      <FaSort color="#808080" />
    );

    return {
      fieldId: sortFieldId,
      order: sort,
      icon: sortIcon,
    };
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <div className="table-container" style={{ maxHeight }}>
        <table className="custom-table">
          <thead className="sticky-header">
            <tr>
              {showCheckbox && (
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleHeaderCheckbox}
                  />
                </th>
              )}
              <th>#</th>
              {attributes.map((attribute, attributeIndex) => {
                const { fieldId, order, icon } = handleSortLogic(
                  attribute.fieldId
                );
                return (
                  <th
                    key={attributeIndex}
                    onClick={() =>
                      setSortState({ fieldId, order: order as "asc" | "desc" })
                    }
                  >
                    {attribute.fieldName}
                    {icon}
                  </th>
                );
              })}
              {erpAttributes.map((erpData, erpIndex) => (
                <th key={erpIndex}>{erpData.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                className={
                  product.hasArchive ? "table-row archive-row" : "table-row"
                }
                key={index}
                onDoubleClick={() =>
                  navigate(`/products/${product.itemId}/edit`)
                }
              >
                {showCheckbox && (
                  <td className="table-cell">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.itemId)}
                      onChange={() => toggleCheckbox(product.itemId)}
                    />
                  </td>
                )}
                <td className="table-cell">{product.itemId}</td>
                {product.attributes.map((attribute, attributeIndex) => (
                  <td key={attributeIndex} className="table-cell">
                    {getDisplayValue(attribute.dataType, attribute.value)}
                  </td>
                ))}
                {product.erp.map((erpData, erpIndex) => (
                  <td className="table-cell blue-cell" key={erpIndex}>
                    {erpData.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getDisplayValue = (
  dataType: string,
  value: string | number | boolean
) => {
  const serverBaseUrl = import.meta.env.VITE_API_HOST;

  switch (dataType) {
    case "boolean":
      return value ? "True" : "False";
    case "picture":
      if (value) {
        return (
          <AuthorizedImage
            src={`${serverBaseUrl}${value}`}
            alt="Product"
            style={{ maxWidth: "100px" }}
          />
        );
      } else {
        return <span></span>;
      }
    default:
      return value;
  }
};

// 新的圖片組件，支援 Authorization header
const AuthorizedImage = ({
  src,
  alt,
  style,
}: {
  src: string;
  alt: string;
  style: React.CSSProperties;
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");

  const [{ loading }, fetchImage] = useAxios<Blob>(
    {
      method: "GET",
      responseType: "blob",
    },
    { manual: true }
  );

  useEffect(() => {
    // 從 src 中提取 image ID，假設格式是 /image/123
    const imageId = src.split("/image/")[1];

    if (imageId) {
      fetchImage({
        url: `/image/${imageId}`,
      })
        .then((response) => {
          const blobUrl = URL.createObjectURL(response.data);
          setImageSrc(blobUrl);
        })
        .catch((error) => {
          console.error("Failed to fetch image:", error);
          setImageSrc(src); // fallback to direct URL
        });
    } else {
      setImageSrc(src);
    }

    // Cleanup blob URL when component unmounts
    return () => {
      if (imageSrc && imageSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src, fetchImage]);

  if (loading) return <span>Loading...</span>;
  return imageSrc ? (
    <Image src={imageSrc} alt={alt} style={style} />
  ) : (
    <span>Error loading image</span>
  );
};

export default ProductTable;
