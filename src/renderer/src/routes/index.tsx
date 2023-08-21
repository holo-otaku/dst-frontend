import MyNavbar from "@renderer/components/Navbar/Navbar";
import Login from "@renderer/components/Login/Login";
import Series, {
  Management,
  Create as SeriesCreate,
  Edit as SeriesEdit,
} from "@renderer/components/Series";
import Product, {
  Search as ProductSearch,
  Create as ProductCreate,
  Edit as ProductEdit,
  Delete as ProductDelete,
} from "@renderer/components/Product";
import Account, {
  Search as AccountSearch,
  Create as AccountCreate,
  Edit as AccountEdit,
} from "@renderer/components/Account";
import Role, {
  Search as RoleSearch,
  Create as RoleCreate,
  Edit as RoleEdit,
} from "@renderer/components/Role";
import { Container } from "react-bootstrap";
import { Outlet, RouteObject, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext, ServerContext } from "@renderer/context";
import axios from "axios";
import Backdrop from "@renderer/components/Backdrop/Backdrop";
import { BeatLoader } from "react-spinners";

const Layout = () => {
  const { accessToken, isAuthenticated } = useContext(AuthContext);
  const { healthChecking } = useContext(ServerContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      axios.defaults.headers.common["Authorization"] = null;
      navigate("/login");
    }
  }, [accessToken, isAuthenticated, navigate]);

  if (healthChecking) {
    return (
      <Backdrop show={true}>
        <BeatLoader color="#36d7b7" />
      </Backdrop>
    );
  }

  return (
    <>
      <MyNavbar />
      <Outlet />
    </>
  );
};

export default [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Container>Home</Container>,
      },
      {
        path: "/series",
        element: <Series />,
        children: [
          {
            path: "/series",
            element: <Management />,
          },
          {
            path: "/series/create",
            element: <SeriesCreate />,
          },
          {
            path: "/series/:id/edit",
            element: <SeriesEdit />,
          },
        ],
      },
      {
        path: "/products",
        element: <Product />,
        children: [
          {
            path: "/products",
            element: <ProductSearch />,
          },
          {
            path: "/products/create",
            element: <ProductCreate />,
          },
          {
            path: "/products/:id/edit",
            element: <ProductEdit />,
          },
          {
            path: "/products/:id/delete",
            element: <ProductDelete />,
          },
        ],
      },
      {
        path: "/accounts",
        element: <Account />,
        children: [
          {
            path: "/accounts",
            element: <AccountSearch />,
          },
          {
            path: "/accounts/create",
            element: <AccountCreate />,
          },
          {
            path: "/accounts/:id/edit",
            element: <AccountEdit />,
          },
        ],
      },
      {
        path: "/roles",
        element: <Role />,
        children: [
          {
            path: "/roles",
            element: <RoleSearch />,
          },
          {
            path: "/roles/create",
            element: <RoleCreate />,
          },
          {
            path: "/roles/:id/edit",
            element: <RoleEdit />,
          },
        ],
      },
      {
        path: "*",
        element: <Container>404</Container>,
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
] as RouteObject[];
