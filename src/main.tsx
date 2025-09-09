import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ColorModeProvider, AuthProvider } from "./context";
import "./global.scss";
import "./global.css";
import routes from "./routes/index.js";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_HOST;
const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ColorModeProvider>
  </React.StrictMode>
);
