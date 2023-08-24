import React from "react";
import { createRoot } from "react-dom/client";
import App from "./containers/App/index.tsx";
import ContextProviders from "./ContextProviders.tsx";
import registerIcons from "./utils/FaIcons.tsx";

registerIcons();
const root = createRoot(document.getElementById("app")!);
root.render(
  <ContextProviders>
    <App />
  </ContextProviders>
);
