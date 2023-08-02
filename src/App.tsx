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
} from "./components/Product";
import Backdrop from "./components/Backdrop/Backdrop";
import { BeatLoader } from "react-spinners";

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

const Home = () => <h1>Home</h1>;

const NoMatch = () => <h1>404 Not Found</h1>;

export default App;
