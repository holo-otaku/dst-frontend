import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useContext } from "react";
import { ColorModeContext } from "../../context";

const MyNavbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);

  return (
    <Navbar collapseOnSelect expand="lg" bg="body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">
          DST
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="系列" id="collasible-nav-dropdown">
              <NavDropdown.Item as={Link} to="/series">
                查詢
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/series/create">
                新增
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/products">
              產品
            </Nav.Link>
            <NavDropdown title="匯出" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link onClick={toggleColorMode}>
              {colorMode === "light" ? <FaMoon /> : <FaSun />}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
