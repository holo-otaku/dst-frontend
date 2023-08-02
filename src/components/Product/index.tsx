import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const Product = () => {
  return (
    <Container>
      <Stack direction="vertical" gap={3} className="mt-2">
        <h1>產品管理</h1>
        <Outlet />
      </Stack>
    </Container>
  );
};

export { Search } from "./Search";
export default Product;
