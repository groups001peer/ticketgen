// /src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { StoreProvider } from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StoreProvider><App /></StoreProvider>
);
