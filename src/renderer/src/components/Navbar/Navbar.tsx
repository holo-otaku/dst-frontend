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

interface NavTreeItem {
  title: string;
  permission: string;
  path?: string;
  children: {
    title: string;
    path: string;
    permission: string;
  }[];
}

const NavTree: NavTreeItem[] = [
  {
    title: "人員",
    permission: "user.read",
    children: [
      {
        title: "查詢",
        path: "/accounts",
        permission: "user.read",
      },
      {
        title: "新增",
        path: "/accounts/create",
        permission: "user.create",
      },
    ],
  },
  {
    title: "角色",
    permission: "role.read",
    children: [
      {
        title: "查詢",
        path: "/roles",
        permission: "role.read",
      },
      {
        title: "新增",
        path: "/roles/create",
        permission: "role.create",
      },
    ],
  },
  {
    title: "系列",
    permission: "series.read",
    children: [
      {
        title: "查詢",
        path: "/series",
        permission: "series.read",
      },
      {
        title: "新增",
        path: "/series/create",
        permission: "series.create",
      },
    ],
  },
  {
    title: "產品",
    permission: "product.read",
    children: [
      {
        title: "查詢",
        path: "/products",
        permission: "product.read",
      },
      {
        title: "新增",
        path: "/products/create",
        permission: "product.create",
      },
    ],
  },
  {
    title: "匯出",
    permission: "export.read",
    children: [
      {
        title: "Action",
        path: "#action/3.1",
        permission: "export.read",
      },
    ],
  },
  {
    title: "操作記錄",
    permission: "log.read",
    path: "/logs",
    children: [],
  },
];

const MyNavbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const { logout, getPayload } = useContext(AuthContext);
  const { permissions = [] } = getPayload();

  return (
    <Navbar collapseOnSelect expand="lg" bg="body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/">
          DST
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {NavTree.map(
              (navItem, index) =>
                permissions.includes(navItem.permission) && (
                  navItem.children.length > 0 ? (
                    <NavDropdown
                      title={navItem.title}
                      id="collasible-nav-dropdown"
                      key={index}
                    >
                      {navItem.children.map(
                        (child, idx) =>
                          permissions.includes(child.permission) && (
                            <NavDropdown.Item as={Link} to={child.path} key={idx}>
                              {child.title}
                            </NavDropdown.Item>
                          )
                      )}
                    </NavDropdown>
                  ) : (
                    <Nav.Link as={Link} to={navItem.path!} key={index}>
                      {navItem.title}
                    </Nav.Link>
                  )
                )
            )}
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
