import { useContext, useEffect } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Login/Login";
import Series, {
  Management,
  Create as SeriesCreate,
  Edit as SeriesEdit,
} from "./components/Series";
import { AuthContext, ServerContext } from "./context";
import axios from "axios";
import Product, {
  Search as ProductSearch,
  Create as ProductCreate,
  Edit as ProductEdit,
  Delete as ProductDelete,
} from "./components/Product";
import Account, {
  Search as AccountSearch,
  Create as AccountCreate,
  Edit as AccountEdit,
} from "./components/Account";
import Role, {
  Search as RoleSearch,
  Create as RoleCreate,
  Edit as RoleEdit,
} from "./components/Role";
import Backdrop from "./components/Backdrop/Backdrop";
import { BeatLoader } from "react-spinners";
import { Container } from "react-bootstrap";

const App = () => {
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
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="series" element={<Series />}>
          <Route index element={<Management />} />
          <Route path="create" element={<SeriesCreate />} />
          <Route path=":id/edit" element={<SeriesEdit />} />
        </Route>
        <Route path="products" element={<Product />}>
          <Route index element={<ProductSearch />} />
          <Route path="create" element={<ProductCreate />} />
          <Route path=":id/edit" element={<ProductEdit />} />
          <Route path=":id/delete" element={<ProductDelete />} />
        </Route>
        <Route path="accounts" element={<Account />}>
          <Route index element={<AccountSearch />} />
          <Route path="create" element={<AccountCreate />} />
          <Route path=":id/edit" element={<AccountEdit />} />
        </Route>
        <Route path="roles" element={<Role />}>
          <Route index element={<RoleSearch />} />
          <Route path="create" element={<RoleCreate />} />
          <Route path=":id/edit" element={<RoleEdit />} />
        </Route>
        {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
        <Route path="*" element={<NoMatch />} />
      </Route>
      <Route path="login" element={<Login />} />
    </Routes>
  );
};

const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const Home = () => (
  <Container>
    <h1>Home</h1>
  </Container>
);

const NoMatch = () => <h1>404 Not Found</h1>;

export default App;
