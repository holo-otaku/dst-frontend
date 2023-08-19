import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const Role = () => {
  return (
    <Container>
      <Stack direction="vertical" gap={3} className="mt-2">
        <h1>角色管理</h1>
        <Outlet />
      </Stack>
    </Container>
  );
};

export { Search } from "./Search";
export { Create } from "./Create";
export { Edit } from "./Edit";
export default Role;
