import { useContext, useEffect } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./components/Login/Login";
import Series, {
  Management,
  Create as SeriesCreate,
  Edit as SeriesEdit,
} from "./components/Series";
import { AuthContext } from "./context";
import axios from "axios";

const App = () => {
  const { accessToken, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      axios.defaults.headers.common["Authorization"] = null;
      navigate("/login");
    }
  }, [accessToken, isAuthenticated, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="series" element={<Series />}>
          <Route index element={<Management />} />
          <Route path="create" element={<SeriesCreate />} />
          <Route path=":id/edit" element={<SeriesEdit />} />
        </Route>
        <Route path="dashboard" element={<Dashboard />} />

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

const Dashboard = () => <h1>Dashboard</h1>;

const NoMatch = () => <h1>404 Not Found</h1>;

export default App;
