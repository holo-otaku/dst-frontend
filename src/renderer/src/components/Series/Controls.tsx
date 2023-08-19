import { Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export const Controls = () => {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate("search");
  };

  return (
    <Row className="gx-4">
      <Col xs={6} md={4}>
        <Form.Control type="text" placeholder="輸入查詢內容" />
      </Col>
      <Col xs={6} md={4} className="d-flex">
        <Button variant="primary" className="mx-1" onClick={handleSearch}>
          查詢
        </Button>
      </Col>
    </Row>
  );
};
