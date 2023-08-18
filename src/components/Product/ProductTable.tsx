import { Table, Image, Alert } from "react-bootstrap";
import { ProductData } from "./Interface";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";

interface ProductTableProps {
  products: ProductData[];
}

const ProductTable = ({ products }: ProductTableProps) => {
  const navigate = useNavigate();
  const attributes = get(
    products,
    "[0].attributes",
    [] as ProductData["attributes"],
  );
  const erpAttributes = get(products, "[0].erp", [] as ProductData["erp"]);

  if (products.length === 0) {
    return <Alert variant="info">查不到任何符合條件的產品!</Alert>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>系列</th>
            <th>名稱</th>
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
              key={index}
              onDoubleClick={() => navigate(`/products/${product.itemId}/edit`)}
            >
              <td>{product.itemId}</td>
              <td>{product.seriesName}</td>
              <td>{product.name}</td>
              {product.attributes.map((attribute, attributeIndex) => (
                <td key={attributeIndex}>
                  {getDisplayValue(attribute.dataType, attribute.value)}
                </td>
              ))}
              {product.erp.map((erpData, erpIndex) => (
                <td key={erpIndex}>{erpData.value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

const getDisplayValue = (
  dataType: string,
  value: string | number | boolean,
) => {
  switch (dataType) {
    case "boolean":
      return value ? "True" : "False";
    case "picture":
      // Assuming you have a way to display pictures using value
      return (
        <Image
          src={value as string}
          alt="Product"
          style={{ maxWidth: "100px" }}
        />
      );
    default:
      return value;
  }
};

export default ProductTable;
