import MyNavbar from "../components/Navbar/Navbar";
import Login from "../components/Login/Login";
import Series, {
  Management,
  Create as SeriesCreate,
  Edit as SeriesEdit,
} from "../components/Series";
import Product, {
  Search as ProductSearch,
  Create as ProductCreate,
  Edit as ProductEdit,
  Delete as ProductDelete,
} from "../components/Product";
import Account, {
  Search as AccountSearch,
  Create as AccountCreate,
  Edit as AccountEdit,
} from "../components/Account";
import Role, {
  Search as RoleSearch,
  Create as RoleCreate,
  Edit as RoleEdit,
} from "../components/Role";
import { Container } from "react-bootstrap";
import { Outlet, RouteObject, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context";
import axios from "axios";
import ActivityLog from "../components/ActivtyLog";
import MyBreadcrumb from "../components/Breadcrumb";

const DETECT_REFRESH_INTERVAL = 10 * 60 * 1000;

const Layout = () => {
  const { accessToken, isAuthenticated, detectIsNeedToRefresh } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      axios.defaults.headers.common["Authorization"] = null;
      navigate("/login");
    }
  }, [accessToken, isAuthenticated, navigate]);

  useEffect(() => {
    const id = setInterval(detectIsNeedToRefresh, DETECT_REFRESH_INTERVAL);
    return () => {
      clearInterval(id);
    };
  }, [detectIsNeedToRefresh]);

  return (
    <>
      <MyNavbar />
      <MyBreadcrumb />
      <Outlet />
    </>
  );
};

export default [
  {
    path: "/",
    element: <Layout />,
    handle: { crumb: "首頁" },
    children: [
      {
        path: "/",
        element: <Container fluid>Home</Container>,
        breadcrumb: "首頁",
      },
      {
        path: "/series",
        element: <Series />,
        handle: { crumb: "系列" },
        children: [
          {
            path: "/series",
            element: <Management />,
            breadcrumb: "管理",
            handle: { crumb: "管理" },
          },
          {
            path: "/series/create",
            element: <SeriesCreate />,
            handle: { crumb: "新增" },
          },
          {
            path: "/series/:id/edit",
            element: <SeriesEdit />,
            handle: { crumb: "編輯" },
          },
        ],
      },
      {
        path: "/products",
        element: <Product />,
        handle: { crumb: "產品" },
        children: [
          {
            path: "/products",
            element: <ProductSearch />,
            handle: { crumb: "管理" },
          },
          {
            path: "/products/create",
            element: <ProductCreate />,
            handle: { crumb: "新增" },
          },
          {
            path: "/products/:id/edit",
            element: <ProductEdit />,
            handle: { crumb: "編輯" },
          },
          {
            path: "/products/:id/delete",
            element: <ProductDelete />,
            handle: { crumb: "刪除" },
          },
        ],
      },
      {
        path: "/accounts",
        element: <Account />,
        handle: { crumb: "帳號" },
        children: [
          {
            path: "/accounts",
            element: <AccountSearch />,
            handle: { crumb: "管理" },
          },
          {
            path: "/accounts/create",
            element: <AccountCreate />,
            handle: { crumb: "新增" },
          },
          {
            path: "/accounts/:id/edit",
            element: <AccountEdit />,
            handle: { crumb: "編輯" },
          },
        ],
      },
      {
        path: "/roles",
        element: <Role />,
        handle: { crumb: "角色" },
        children: [
          {
            path: "/roles",
            element: <RoleSearch />,
            handle: { crumb: "管理" },
          },
          {
            path: "/roles/create",
            element: <RoleCreate />,
            handle: { crumb: "新增" },
          },
          {
            path: "/roles/:id/edit",
            element: <RoleEdit />,
            handle: { crumb: "編輯" },
          },
        ],
      },
      {
        path: "/activity-log",
        element: <ActivityLog />,
        handle: { crumb: "活動紀錄" },
      },
      {
        path: "*",
        element: <Container fluid>404</Container>,
        handle: { crumb: "404" },
      },
    ],
  },
  {
    path: "login",
    element: <Login />,
  },
] as RouteObject[];
