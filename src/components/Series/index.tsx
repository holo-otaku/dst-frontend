import { Management } from "./Management";
import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const Series = () => {
  return (
    <Container>
      <Stack direction="vertical" gap={3} className="mt-2">
        <h1>系列管理</h1>
        <Outlet />
      </Stack>
    </Container>
  );
};

export default Series;
export { Management };
export { Create } from "./Create";
