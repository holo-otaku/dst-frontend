import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext, ColorModeContext } from "../../context";
import { MdLogout } from "react-icons/md";

const MyNavbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const { logout } = useContext(AuthContext);

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
            <NavDropdown title="產品" id="collasible-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products">
                查詢
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/create">
                新增
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="匯出" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link onClick={toggleColorMode} className="mx-2">
              {colorMode === "light" ? <FaMoon /> : <FaSun />}
            </Nav.Link>
          </Nav>
          <Nav>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>登出</Tooltip>}
            >
              <Nav.Link onClick={() => logout()}>
                <MdLogout />
              </Nav.Link>
            </OverlayTrigger>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default MyNavbar;
