import { Image, Alert } from "react-bootstrap";
import { ProductData } from "./Interface";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../../src/styles/table-sticky.css";
interface ProductTableProps {
  products: ProductData[];
}

const ProductTable = ({ products }: ProductTableProps) => {
  const [maxHeight, setMaxHeight] = useState("400px");

  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(`${window.innerHeight * 0.6}px`); // Adjusts maxHeight to 50% of window height
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set maxHeight

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navigate = useNavigate();
  const attributes = get(
    products,
    "[0].attributes",
    [] as ProductData["attributes"]
  );
  const erpAttributes = get(products, "[0].erp", [] as ProductData["erp"]);

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <div className="table-container" style={{ maxHeight }}>
        <table className="custom-table">
          <thead className="sticky-header">
            <tr>
              <th>#</th>
              <th>系列</th>
              {attributes.map((attribute, attributeIndex) => (
                <th key={attributeIndex}>{attribute.fieldName}</th>
              ))}
              {erpAttributes.map((erpData, erpIndex) => (
                <th key={erpIndex}>{erpData.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                className="table-row"
                key={index}
                onDoubleClick={() =>
                  navigate(`/products/${product.itemId}/edit`)
                }
              >
                <td className="table-cell">{product.itemId}</td>
                <td className="table-cell">{product.seriesName}</td>
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
  const serverBaseUrl = localStorage.getItem("server") || ""; // Get server base URL from localStorage

  switch (dataType) {
    case "boolean":
      return value ? "True" : "False";
    case "picture":
      if (value) {
        return (
          <Image
            src={`${serverBaseUrl}${value}?t=${new Date().getTime()}`}
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
export default ProductTable;
