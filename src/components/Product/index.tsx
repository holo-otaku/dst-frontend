import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const Product = () => {
  return (
    <Container fluid>
      <Stack direction="vertical" gap={3} className="mt-2">
        <Outlet />
      </Stack>
    </Container>
  );
};

export { Create } from "./Create";
export { Edit } from "./Edit";
export { Search } from "./Search";
export { Delete } from "./Delete";
export default Product;
