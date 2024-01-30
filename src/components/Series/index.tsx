import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const Series = () => {
  return (
    <Container fluid>
      <Stack direction="vertical" gap={3} className="mt-2">
        <Outlet />
      </Stack>
    </Container>
  );
};

export default Series;
export { Management } from "./Management";
export { Create } from "./Create";
export { Edit } from "./Edit";
