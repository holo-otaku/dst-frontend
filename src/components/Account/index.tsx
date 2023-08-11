import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const Account = () => {
  return (
    <Container>
      <Stack direction="vertical" gap={3} className="mt-2">
        <h1>使用者管理</h1>
        <Outlet />
      </Stack>
    </Container>
  );
};

export { Search } from "./Search";
export { Create } from "./Create";
export { Edit } from "./Edit";
export default Account;
