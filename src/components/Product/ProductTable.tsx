import React from "react";
import { Table, Image } from "react-bootstrap";
import { ProductData } from "./Interface";

interface ProductTableProps {
  products: ProductData[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  return (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Item ID</th>
            <th>Series ID</th>
            <th>Name</th>
            {products.length > 0 &&
              products[0].attributes.map((attribute, attributeIndex) => (
                <th key={attributeIndex}>{attribute.fieldName}</th>
              ))}
            {products.length > 0 &&
              products[0].erp.map((erpData, erpIndex) => (
                <th key={erpIndex}>{erpData.key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index}>
              <td>{product.itemId}</td>
              <td>{product.seriesId}</td>
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
