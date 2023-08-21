import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ColorModeProvider, AuthProvider, ServerProvider } from "./context";
import "./global.scss";
import "./global.css";
import routes from "./routes/index.js";

const router = createHashRouter(routes);
console.log(window.location.href);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ServerProvider>
      <ColorModeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ColorModeProvider>
    </ServerProvider>
  </React.StrictMode>
);
